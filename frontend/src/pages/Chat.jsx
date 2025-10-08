import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../config/api';
import UserProfile from '../components/UserProfile';
import {
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    Phone,
    Video,
    Search,
    Users,
    Settings,
    MessageCircle,
    Clock,
    Check,
    CheckCheck,
    MoreHorizontal,
    Reply,
    Edit,
    Trash2,
    Pin,
    Archive
} from 'lucide-react';

const Chat = () => {
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [userStatuses, setUserStatuses] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserList, setShowUserList] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // Get auth token and user info
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Initialize socket connection
    useEffect(() => {
        if (token && user.id) {
            const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080', {
                auth: {
                    token,
                    userId: user.id,
                    companyId: user.companyId
                }
            });

            newSocket.on('connect', () => {
                console.log('Connected to chat server');
                newSocket.emit('authenticate', {
                    token,
                    userId: user.id,
                    companyId: user.companyId
                });
                console.log('Sent authentication for user:', user.id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Chat socket connection error:', error);
            });

            newSocket.on('auth-error', (error) => {
                console.error('Chat socket auth error:', error);
            });

            newSocket.on('user-online', (data) => {
                setUserStatuses(prev => ({
                    ...prev,
                    [data.userId]: { ...prev[data.userId], status: 'online' }
                }));
            });

            newSocket.on('user-offline', (data) => {
                // Handle user offline
            });

            newSocket.on('presence-update', (data) => {
                setUserStatuses(prev => ({
                    ...prev,
                    [data.userId]: { ...prev[data.userId], isOnChatPage: data.isOnChatPage }
                }));
            });

            newSocket.on('user-typing', (data) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.chatId]: [...(prev[data.chatId] || []).filter(u => u.userId !== data.userId), {
                        userId: data.userId,
                        userName: data.userName
                    }]
                }));
            });

            newSocket.on('user-stop-typing', (data) => {
                setTypingUsers(prev => ({
                    ...prev,
                    [data.chatId]: (prev[data.chatId] || []).filter(u => u.userId !== data.userId)
                }));
            });

            newSocket.on('message-delivered', (data) => {
                setMessages(prev => prev.map(msg =>
                    msg._id === data.messageId
                        ? { ...msg, deliveryStatus: { ...msg.deliveryStatus, delivered: true, deliveredAt: data.deliveredAt } }
                        : msg
                ));
            });

            newSocket.on('message-read', (data) => {
                setMessages(prev => prev.map(msg =>
                    msg._id === data.messageId
                        ? { ...msg, deliveryStatus: { ...msg.deliveryStatus, read: true, readAt: data.readAt } }
                        : msg
                ));
            });

            // Handle new messages
            newSocket.on('new-message', (data) => {
                console.log('New message received:', data);
                console.log('Current selected chat:', selectedChat?._id);

                // Always update conversation list first
                setConversations(prev => prev.map(conv =>
                    conv._id === data.chatId
                        ? { ...conv, lastMessage: { content: data.message.content, sentBy: data.message.sender, sentAt: data.message.createdAt } }
                        : conv
                ));

                // Add message to current chat if it matches
                if (data.chatId === selectedChat?._id) {
                    console.log('Adding message to current chat');
                    setMessages(prev => {
                        console.log('Previous messages count:', prev.length);
                        // Check if message already exists to prevent duplicates
                        const messageExists = prev.some(msg => msg._id === data.message._id);
                        if (messageExists) {
                            console.log('Message already exists, skipping');
                            return prev;
                        }
                        const newMessages = [...prev, data.message];
                        console.log('New messages count:', newMessages.length);
                        return newMessages;
                    });
                } else {
                    console.log('Message not for current chat, updating conversation list only');
                }
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
    }, [token, user.id, user.companyId]);

    // Load conversations and users
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [conversationsData, usersData, statusData, unreadData] = await Promise.all([
                    api.get('/chat/conversations'),
                    api.get('/chat/users'),
                    api.get('/chat/users/status'),
                    api.get('/chat/unread-count')
                ]).then(responses => responses.map(res => res.data));

                setConversations(conversationsData);
                setUsers(usersData);

                // Set user statuses
                const statusMap = {};
                statusData.forEach(user => {
                    statusMap[user._id] = {
                        status: user.status,
                        lastSeen: user.lastSeen,
                        isOnChatPage: user.isOnChatPage
                    };
                });
                setUserStatuses(statusMap);

                // Set unread counts
                const unreadMap = {};
                unreadData.conversations.forEach(conv => {
                    unreadMap[conv._id] = conv.count;
                });
                setUnreadCounts(unreadMap);

            } catch (err) {
                setError('Failed to load chat data');
                console.error('Load data error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadData();
        }
    }, [token]);

    // Load messages for selected chat
    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedChat || !token) return;

            try {
                console.log('Loading messages for chat:', selectedChat._id);
                const response = await api.get(`/chat/conversations/${selectedChat._id}/messages`);
                const messagesData = response.data;
                console.log('Loaded messages:', messagesData.length);
                setMessages(messagesData);

                // Join chat room
                if (socket) {
                    console.log('Joining chat room:', selectedChat._id);
                    socket.emit('join-chat', selectedChat._id);
                    socket.emit('presence-update', {
                        userId: user.id,
                        companyId: user.companyId,
                        isOnChatPage: true
                    });
                }

            } catch (err) {
                console.error('Load messages error:', err);
            }
        };

        loadMessages();

        return () => {
            if (selectedChat && socket) {
                console.log('Leaving chat room:', selectedChat._id);
                socket.emit('leave-chat', selectedChat._id);
            }
        };
    }, [selectedChat, token, socket, user.id, user.companyId]);

    // Add a periodic refresh to ensure messages are loaded
    useEffect(() => {
        if (!selectedChat || !socket) return;

        const refreshMessages = async () => {
            try {
                const response = await api.get(`/chat/conversations/${selectedChat._id}/messages`);
                const messagesData = response.data;
                setMessages(messagesData);
            } catch (err) {
                console.error('Refresh messages error:', err);
            }
        };

        // Refresh messages every 5 seconds
        const interval = setInterval(refreshMessages, 5000);

        return () => clearInterval(interval);
    }, [selectedChat, socket]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle typing
    const handleTyping = () => {
        if (!socket || !selectedChat) return;

        setIsTyping(true);
        socket.emit('typing', {
            chatId: selectedChat._id,
            userId: user.id,
            userName: user.name
        });

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('stop-typing', {
                chatId: selectedChat._id,
                userId: user.id
            });
        }, 1000);
    };

    // Send message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !token) return;

        try {
            const response = await api.post(`/chat/conversations/${selectedChat._id}/messages`, {
                content: newMessage,
                type: 'text'
            });

            if (response.status === 201) {
                const messageData = response.data;
                console.log('Message sent successfully:', messageData);
                setNewMessage('');

                // Add message locally immediately for better UX
                setMessages(prev => {
                    // Check if message already exists to prevent duplicates
                    const messageExists = prev.some(msg => msg._id === messageData._id);
                    if (messageExists) {
                        console.log('Message already exists, skipping local add');
                        return prev;
                    }
                    console.log('Adding message locally');
                    return [...prev, messageData];
                });

                // Update conversation list
                setConversations(prev => prev.map(conv =>
                    conv._id === selectedChat._id
                        ? { ...conv, lastMessage: { content: messageData.content, sentBy: messageData.sender, sentAt: messageData.createdAt } }
                        : conv
                ));

                // Emit delivery confirmation
                if (socket) {
                    socket.emit('message-delivered', {
                        chatId: selectedChat._id,
                        messageId: messageData._id
                    });
                }
            }
        } catch (err) {
            console.error('Send message error:', err);
        }
    };

    // Start new conversation
    const startConversation = async (userId) => {
        try {
            const response = await api.post('/chat/conversations/direct', { userId });

            if (response.status === 200) {
                const chatData = response.data;
                setSelectedChat(chatData);
                setShowUserList(false);

                // Add to conversations if not already there
                setConversations(prev => {
                    const exists = prev.find(conv => conv._id === chatData._id);
                    return exists ? prev : [chatData, ...prev];
                });
            }
        } catch (err) {
            console.error('Start conversation error:', err);
        }
    };

    // Show user profile
    const showUserProfileModal = (userData) => {
        setSelectedUser(userData);
        setShowUserProfile(true);
    };

    // Close user profile
    const closeUserProfile = () => {
        setShowUserProfile(false);
        setSelectedUser(null);
    };

    // Format time
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Format date
    const formatDate = (date) => {
        const today = new Date();
        const messageDate = new Date(date);

        if (messageDate.toDateString() === today.toDateString()) {
            return 'Today';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return messageDate.toLocaleDateString();
    };

    // Get delivery status icon with better styling
    const getDeliveryStatus = (message) => {
        if (message.sender._id === user.id) {
            if (message.deliveryStatus?.read) {
                return (
                    <div className="flex items-center space-x-1">
                        <CheckCheck className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-blue-500">Read</span>
                    </div>
                );
            } else if (message.deliveryStatus?.delivered) {
                return (
                    <div className="flex items-center space-x-1">
                        <CheckCheck className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-500">Delivered</span>
                    </div>
                );
            } else {
                return (
                    <div className="flex items-center space-x-1">
                        <Check className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400">Sent</span>
                    </div>
                );
            }
        }
        return null;
    };

    // Get user status indicator
    const getUserStatusIndicator = (userId) => {
        const userStatus = userStatuses[userId];
        if (!userStatus) return null;

        return (
            <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${userStatus.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                <span className="text-xs text-gray-500">
                    {userStatus.status === 'online' ? 'Online' : 'Offline'}
                </span>
                {userStatus.lastSeen && (
                    <span className="text-xs text-gray-400">
                        • {new Date(userStatus.lastSeen).toLocaleTimeString()}
                    </span>
                )}
            </div>
        );
    };

    // Get user avatar with status
    const getUserAvatar = (userData, size = 'w-10 h-10', clickable = false) => {
        const userStatus = userStatuses[userData._id];
        const isOnline = userStatus?.status === 'online';

        const avatarElement = (
            <div className="relative">
                <div className={`${size} bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold ${clickable ? 'cursor-pointer hover:bg-blue-600 transition-colors' : ''
                    }`}>
                    {userData.name.charAt(0).toUpperCase()}
                </div>
                {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>
        );

        if (clickable) {
            return (
                <button
                    onClick={() => showUserProfileModal(userData)}
                    className="focus:outline-none"
                >
                    {avatarElement}
                </button>
            );
        }

        return avatarElement;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Sidebar */}
            <div className="w-1/3 bg-white/80 backdrop-blur-md border-r border-white/20 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-white/20 bg-gradient-to-r from-slate-50 to-blue-50">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Messages</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowUserList(!showUserList)}
                                className="p-3 text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                title="Start New Chat"
                            >
                                <Users className="w-5 h-5" />
                            </button>
                            <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                title="Settings">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-white/20 rounded-2xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 shadow-lg"
                        />
                    </div>
                </div>

                {/* User List Modal */}
                {showUserList && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900">Start New Conversation</h3>
                                    <button
                                        onClick={() => setShowUserList(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {users.map(userItem => (
                                        <button
                                            key={userItem._id}
                                            onClick={() => startConversation(userItem._id)}
                                            className="w-full flex items-center space-x-4 p-4 hover:bg-slate-50 rounded-xl transition-all duration-200 hover:shadow-lg group"
                                        >
                                            {getUserAvatar(userItem, 'w-12 h-12', true)}
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">{userItem.name}</p>
                                                <p className="text-sm text-slate-500">{userItem.email}</p>
                                                <div className="mt-2">
                                                    {getUserStatusIndicator(userItem._id)}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowUserList(false)}
                                    className="mt-6 w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {conversations.map(conversation => (
                        <button
                            key={conversation._id}
                            onClick={() => setSelectedChat(conversation)}
                            className={`w-full p-5 rounded-2xl transition-all duration-300 hover:scale-105 text-left group ${selectedChat?._id === conversation._id
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-xl'
                                : 'hover:bg-white/60 hover:shadow-lg'
                                }`}
                        >
                            <div className="flex items-center space-x-4">
                                {conversation.type === 'direct' ? (
                                    // For direct chats, show the other participant's avatar
                                    conversation.participants?.find(p => p.user._id !== user.id) ? (
                                        getUserAvatar(conversation.participants.find(p => p.user._id !== user.id).user, 'w-14 h-14')
                                    ) : (
                                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                                            {conversation.name.charAt(0).toUpperCase()}
                                        </div>
                                    )
                                ) : (
                                    // For group chats, show group avatar
                                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                                        {conversation.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 truncate text-lg group-hover:text-blue-600 transition-colors duration-200">
                                                {conversation.type === 'direct' && conversation.participants?.find(p => p.user._id !== user.id)
                                                    ? conversation.participants.find(p => p.user._id !== user.id).user.name
                                                    : conversation.name
                                                }
                                            </h3>
                                            {conversation.type === 'direct' && conversation.participants?.find(p => p.user._id !== user.id) && (
                                                <div className="mt-2">
                                                    {getUserStatusIndicator(conversation.participants.find(p => p.user._id !== user.id).user._id)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <span className="text-xs text-slate-500 font-semibold">
                                                {conversation.lastMessage?.sentAt ? formatTime(conversation.lastMessage.sentAt) : ''}
                                            </span>
                                            {unreadCounts[conversation._id] > 0 && (
                                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg">
                                                    {unreadCounts[conversation._id]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 truncate mt-2 font-medium">
                                        {conversation.lastMessage?.content || 'No messages yet'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-md">
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {selectedChat.type === 'direct' ? (
                                        // For direct chats, show the other participant's avatar with status
                                        selectedChat.participants?.find(p => p.user._id !== user.id) ? (
                                            getUserAvatar(selectedChat.participants.find(p => p.user._id !== user.id).user, 'w-14 h-14', true)
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                                                {selectedChat.name.charAt(0).toUpperCase()}
                                            </div>
                                        )
                                    ) : (
                                        // For group chats, show group avatar
                                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                                            {selectedChat.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">
                                            {selectedChat.type === 'direct' && selectedChat.participants?.find(p => p.user._id !== user.id)
                                                ? selectedChat.participants.find(p => p.user._id !== user.id).user.name
                                                : selectedChat.name
                                            }
                                        </h2>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <p className="text-sm text-slate-500 font-medium">
                                                {selectedChat.participants?.length} participants
                                            </p>
                                            {selectedChat.type === 'direct' && selectedChat.participants?.find(p => p.user._id !== user.id) && (
                                                <div className="flex items-center space-x-1">
                                                    {getUserStatusIndicator(selectedChat.participants.find(p => p.user._id !== user.id).user._id)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await api.get(`/chat/conversations/${selectedChat._id}/messages`);
                                                setMessages(response.data);
                                                console.log('Messages refreshed manually');
                                            } catch (err) {
                                                console.error('Manual refresh error:', err);
                                            }
                                        }}
                                        className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                        title="Refresh Messages"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                        title="Voice Call">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                        title="Video Call">
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                        title="More Options">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50/50 to-white/50">
                            {/* Debug info */}
                            <div className="text-xs text-slate-400 mb-2 bg-slate-100 p-2 rounded-lg">
                                Messages count: {messages.length} | Chat ID: {selectedChat._id}
                            </div>
                            {messages.map((message, index) => {
                                const isOwn = message.sender._id === user.id;
                                const showDate = index === 0 ||
                                    formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
                                const showAvatar = index === 0 ||
                                    messages[index - 1].sender._id !== message.sender._id;

                                return (
                                    <div key={message._id}>
                                        {showDate && (
                                            <div className="text-center text-sm text-slate-500 my-6 bg-slate-100 rounded-full px-4 py-2 inline-block">
                                                {formatDate(message.createdAt)}
                                            </div>
                                        )}
                                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${!isOwn ? 'items-end space-x-3' : ''}`}>
                                            {!isOwn && (
                                                <div className="flex-shrink-0">
                                                    {showAvatar ? (
                                                        getUserAvatar(message.sender, 'w-10 h-10')
                                                    ) : (
                                                        <div className="w-10 h-10"></div>
                                                    )}
                                                </div>
                                            )}
                                            <div className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl shadow-lg ${isOwn
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                                : 'bg-white text-slate-900 border border-slate-200'
                                                }`}>
                                                {!isOwn && showAvatar && (
                                                    <div className="text-xs font-bold text-slate-600 mb-2">
                                                        {message.sender.name}
                                                    </div>
                                                )}
                                                <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs opacity-75 font-medium">
                                                        {formatTime(message.createdAt)}
                                                    </span>
                                                    {isOwn && (
                                                        <div className="ml-3">
                                                            {getDeliveryStatus(message)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing indicator */}
                            {typingUsers[selectedChat._id]?.length > 0 && (
                                <div className="flex justify-start">
                                    <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border border-slate-200">
                                        <p className="text-sm text-slate-600 font-medium">
                                            {typingUsers[selectedChat._id].map(u => u.userName).join(', ')} typing...
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-6 border-t border-white/20 bg-gradient-to-r from-slate-50 to-blue-50 shadow-lg">
                            <form onSubmit={sendMessage} className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                    title="Attach File"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,application/pdf,.doc,.docx"
                                />
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 px-6 py-4 border border-white/20 rounded-2xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 shadow-lg"
                                />
                                <button
                                    type="button"
                                    className="p-3 text-slate-500 hover:text-slate-700 hover:bg-white/60 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                    title="Emoji"
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                                    title="Send Message"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-blue-50/50">
                        <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-12 shadow-2xl border border-white/20">
                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                                <MessageCircle className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Select a conversation</h3>
                            <p className="text-slate-600 text-lg">Choose a conversation from the sidebar to start chatting</p>
                        </div>
                    </div>
                )}
            </div>

            {/* User Profile Modal */}
            <UserProfile
                user={selectedUser}
                userStatus={selectedUser ? userStatuses[selectedUser._id] : null}
                isOpen={showUserProfile}
                onClose={closeUserProfile}
            />
        </div>
    );
};

export default Chat;
