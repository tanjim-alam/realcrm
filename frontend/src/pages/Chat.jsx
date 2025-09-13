import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import io from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  MessageCircle,
  Send,
  Plus,
  Search,
  Users,
  Phone,
  Video,
  MoreVertical,
  X,
  Check,
  CheckCheck,
  Clock,
  User,
  RefreshCw
} from 'lucide-react';

const Chat = () => {
  const { user, company } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [userStatuses, setUserStatuses] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Debug auth context
  console.log('Chat component render:', { 
    user: user ? { id: user.id, name: user.name } : null, 
    company: company ? { id: company._id, name: company.name } : null 
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!company?._id || !user?.id) {
      console.log('Waiting for company and user data...');
      return;
    }

    console.log('Initializing Socket.IO connection...');
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8080');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setSocketConnected(true);
      newSocket.emit('user-online', { userId: user.id, companyId: company._id });
      newSocket.emit('user-on-chat-page', { userId: user.id });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
      toast.error('Failed to connect to chat server');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setSocketConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected the client, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('message-received', (message) => {
      console.log('Message received:', message);
      if (selectedChat && message.chatId === selectedChat._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    newSocket.on('user-status-changed', (data) => {
      console.log('User status changed:', data);
      setUserStatuses(prev => ({
        ...prev,
        [data.userId]: { status: data.status, lastSeen: data.lastSeen }
      }));
    });

    newSocket.on('user-typing', (data) => {
      if (data.chatId === selectedChat?._id && data.userId !== user.id) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          return [...filtered, { userId: data.userId, name: data.userName }];
        });
      }
    });

    newSocket.on('user-stop-typing', (data) => {
      if (data.chatId === selectedChat?._id) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
      }
    });

    newSocket.on('unread-count-updated', (data) => {
      console.log('Unread count updated:', data);
      setConversations(prev => 
        prev.map(chat => 
          chat._id === data.chatId 
            ? { ...chat, unreadCount: data.unreadCount }
            : chat
        )
      );
    });

    // Listen for new conversations (when someone starts a chat with you)
    newSocket.on('conversation-created', (conversation) => {
      console.log('New conversation created:', conversation);
      setConversations(prev => [conversation, ...prev]);
      toast.success(`New conversation with ${conversation.name}`);
    });

    // Listen for conversation updates
    newSocket.on('conversation-updated', (conversation) => {
      console.log('Conversation updated:', conversation);
      setConversations(prev => 
        prev.map(chat => 
          chat._id === conversation._id ? conversation : chat
        )
      );
    });

    // Listen for new notifications
    newSocket.on('new-notification', (data) => {
      console.log('New notification received:', data);
      toast.success(data.message || 'You have a new notification');
      // Refresh conversations to update unread counts
      fetchConversations();
    });

    return () => {
      if (newSocket && user?.id) {
        newSocket.emit('user-off-chat-page', { userId: user.id });
        // Leave any active chat room
        if (selectedChat) {
          newSocket.emit('leave-chat', selectedChat._id);
        }
      }
      newSocket.close();
    };
  }, [company, user]);

  // Fetch initial data
  useEffect(() => {
    console.log('useEffect for fetchData triggered:', { 
      company: company?._id, 
      user: user?.id,
      loading 
    });
    if (company?._id && user?.id) {
      console.log('Conditions met, calling fetchData...');
      fetchData();
    } else {
      console.log('Conditions not met, not calling fetchData');
    }
  }, [company, user]);

  // Fallback: Set loading to false if data is not available after 3 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Additional fallback: Set loading to false if auth data is not available
  useEffect(() => {
    if (loading && (!company || !user)) {
      console.log('Auth data not available, setting loading to false');
      setLoading(false);
    }
  }, [loading, company, user]);

  // Cleanup on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && user?.id) {
        socket.emit('user-off-chat-page', { userId: user.id });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket, user?.id]);

  const fetchData = async () => {
    try {
      console.log('Fetching chat data...');
      setLoading(true);
      
      // Fetch conversations
      console.log('Fetching conversations...');
      const conversationsResponse = await api.get('/chat/conversations');
      console.log('Conversations response:', conversationsResponse.data);
      setConversations(conversationsResponse.data || []);
      
      // Fetch users
      console.log('Fetching users...');
      const usersResponse = await api.get('/chat/users');
      console.log('Users response:', usersResponse.data);
      console.log('Users count:', usersResponse.data?.length || 0);
      setUsers(usersResponse.data || []);
      
      // Fetch user statuses
      console.log('Fetching user statuses...');
      const statusResponse = await api.get('/chat/users/status');
      console.log('Status response:', statusResponse.data);
      const statusMap = {};
      statusResponse.data.forEach(user => {
        statusMap[user._id] = { status: user.status, lastSeen: user.lastSeen };
      });
      setUserStatuses(statusMap);
      
      console.log('Data fetched successfully');
      console.log('Final state:', {
        conversations: conversationsResponse.data?.length || 0,
        users: usersResponse.data?.length || 0,
        statuses: Object.keys(statusMap).length
      });
    } catch (error) {
      console.error('Fetch data error:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      console.log('Fetching messages for chat:', chatId);
      const response = await api.get(`/chat/conversations/${chatId}/messages`);
      console.log('Messages response:', response.data);
      console.log('Messages count:', response.data?.length || 0);
      setMessages(response.data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Fetch messages error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        chatId: chatId
      });
      toast.error(`Failed to load messages: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const response = await api.get('/chat/conversations');
      console.log('Conversations response:', response.data);
      setConversations(response.data || []);
    } catch (error) {
      console.error('Fetch conversations error:', error);
      toast.error('Failed to load conversations');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChatSelect = (chat) => {
    console.log('Selecting chat:', chat);
    
    // Leave previous chat room if any
    if (selectedChat && socket) {
      socket.emit('leave-chat', selectedChat._id);
    }
    
    setSelectedChat(chat);
    fetchMessages(chat._id);
    
    // Join the new chat room for real-time updates
    if (socket) {
      socket.emit('join-chat', chat._id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      console.log('Sending message:', newMessage);
      const response = await api.post(`/chat/conversations/${selectedChat._id}/messages`, {
        content: newMessage.trim(),
        type: 'text'
      });

      console.log('Message sent successfully:', response.data);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();

      // Stop typing indicator
      if (socket) {
        socket.emit('stop-typing', { chatId: selectedChat._id });
      }

      // Emit message to chat room for real-time updates
      if (socket) {
        socket.emit('new-message', {
          chatId: selectedChat._id,
          message: response.data
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    }
  };

  const handleStartDirectChat = async (userId) => {
    try {
      console.log('Starting direct chat with user:', userId);
      console.log('Current user:', user?.id);
      console.log('Company:', company?._id);
      
      const response = await api.post('/chat/conversations/direct', {
        userId: userId
      });

      console.log('Direct chat response:', response.data);
      setSelectedChat(response.data);
      setShowNewChat(false);
      
      toast.success('Chat started');
    } catch (error) {
      console.error('Start direct chat error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userId: userId
      });
      toast.error(`Failed to start chat: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { 
        chatId: selectedChat._id, 
        userId: user.id, 
        userName: user.name 
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop-typing', { chatId: selectedChat._id });
    }, 1000);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getUserStatus = (userId) => {
    const status = userStatuses[userId];
    if (!status) return { status: 'offline', lastSeen: null };
    return status;
  };

  const filteredConversations = conversations.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u._id.toString() !== user.id.toString() && 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Users for new chat:', {
    totalUsers: users.length,
    filteredUsers: filteredUsers.length,
    users: users.map(u => ({ id: u._id, name: u.name, role: u.role })),
    currentUser: user?.id
  });

  console.log('Render state:', { loading, company: company?._id, user: user?.id });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
          <p className="text-xs text-gray-400 mt-2">
            Company: {company?._id ? 'Yes' : 'No'}, User: {user?.id ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchData}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Refresh all data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="New Chat"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await api.get('/chat/debug');
                    console.log('Debug response:', response.data);
                    toast.success(`Debug: ${response.data.otherUsers} other users found`);
                  } catch (error) {
                    console.error('Debug error:', error);
                    toast.error('Debug failed');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Debug Users"
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  if (socket) {
                    console.log('Testing Socket.IO connection...');
                    socket.emit('ping');
                    socket.on('pong', () => {
                      console.log('Socket.IO pong received - connection is working!');
                      toast.success('Socket.IO connection is working!');
                    });
                  } else {
                    toast.error('Socket not connected');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Test Socket.IO"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await api.get('/chat/live-users');
                    console.log('Live users response:', response.data);
                    toast.success(`${response.data.onlineUsers} users online, ${response.data.usersOnChatPage} on chat page`);
                  } catch (error) {
                    console.error('Live users error:', error);
                    toast.error('Failed to get live users');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Check Live Users"
              >
                <Users className="h-5 w-5" />
              </button>
              <button
                onClick={async () => {
                  if (selectedChat) {
                    console.log('Testing message fetch for chat:', selectedChat._id);
                    try {
                      const response = await api.get(`/chat/conversations/${selectedChat._id}/messages`);
                      console.log('Test message fetch success:', response.data);
                      toast.success(`Found ${response.data.length} messages`);
                    } catch (error) {
                      console.error('Test message fetch error:', error);
                      toast.error(`Message fetch failed: ${error.response?.data?.message || error.message}`);
                    }
                  } else {
                    toast.error('No chat selected');
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Test Message Fetch"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={async () => {
                  try {
                    // Test direct chat creation with first available user
                    if (users.length > 0) {
                      const testUserId = users[0]._id;
                      console.log('Testing direct chat creation with user:', testUserId);
                      const response = await api.post('/chat/conversations/direct', {
                        userId: testUserId
                      });
                      console.log('Test direct chat success:', response.data);
                      toast.success('Direct chat creation test passed');
                    } else {
                      toast.error('No users available for test');
                    }
                  } catch (error) {
                    console.error('Test direct chat error:', error);
                    toast.error(`Direct chat test failed: ${error.response?.data?.message || error.message}`);
                  }
                }}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Test Direct Chat Creation"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="text-xs text-gray-500 mb-2">
            <div>Conversations: {conversations.length}</div>
            <div>Users: {users.length}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Socket: {socketConnected ? 'Connected' : 'Disconnected'}</div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                {conversations.length === 0 
                  ? 'No conversations yet. Start a new chat!' 
                  : 'No conversations match your search.'
                }
              </p>
              {conversations.length === 0 && (
                <button 
                  onClick={() => setShowNewChat(true)} 
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Start New Chat
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((chat) => (
              <div
                key={chat._id}
                onClick={() => handleChatSelect(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{chat.name}</h3>
                      <p className="text-sm text-gray-500">
                        {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {chat.lastMessage ? formatLastSeen(chat.lastMessage.sentAt) : ''}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedChat.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedChat.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedChat.participants.length} participants
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender._id === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender._id === user.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatLastSeen(message.sentAt)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                    <p className="text-sm">
                      {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Start New Chat</h3>
              <button
                onClick={() => setShowNewChat(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">No users available to chat with</p>
                  <p className="text-xs text-gray-400">
                    Total users: {users.length}, Filtered: {filteredUsers.length}
                  </p>
                  <p className="text-xs text-gray-400">
                    Current user: {user?.id}
                  </p>
                  <div className="text-xs text-gray-400 mt-2">
                    <p>Available users:</p>
                    {users.map(u => (
                      <p key={u._id}>- {u.name} ({u._id})</p>
                    ))}
                  </div>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleStartDirectChat(user._id)}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {getUserStatus(user._id).status === 'online' ? (
                        <span className="text-green-500">Online</span>
                      ) : (
                        formatLastSeen(getUserStatus(user._id).lastSeen)
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;


