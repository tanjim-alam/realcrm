import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [ws, setWs] = useState(null);

    const handleNewNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        toast.success(notification.title, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#10B981',
                color: '#fff',
            },
        });
    }, []);

    // Socket.IO connection
    useEffect(() => {
        if (user && user.token) {
            const socket = io('http://localhost:8080', {
                auth: {
                    token: user.token
                }
            });

            socket.on('connect', () => {
                console.log('Socket.IO connected');
                setWs(socket);
                // Join notifications room
                socket.emit('join-notifications', { userId: user.id });
            });

            socket.on('notification', (data) => {
                handleNewNotification(data);
            });

            socket.on('disconnect', () => {
                console.log('Socket.IO disconnected');
                setWs(null);
            });

            socket.on('error', (error) => {
                console.error('Socket.IO error:', error);
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user, handleNewNotification]);

    const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
        try {
            setLoading(true);
            const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    const markAsRead = useCallback(async (notificationIds) => {
        try {
            await api.put('/notifications/mark-read', { notificationIds });
            setNotifications(prev =>
                prev.map(notification =>
                    notificationIds.includes(notification._id)
                        ? { ...notification, isRead: true, readAt: new Date() }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            toast.error('Failed to mark notifications as read');
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, isRead: true, readAt: new Date() }))
            );
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    }, []);

    const archiveNotification = useCallback(async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/archive`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success('Notification archived');
        } catch (error) {
            console.error('Error archiving notification:', error);
            toast.error('Failed to archive notification');
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    }, []);

    const sendTestNotification = useCallback(async (type, platform, title, message) => {
        try {
            const response = await api.post('/notifications/test', {
                type,
                platform,
                title,
                message
            });
            toast.success('Test notification sent');
            return response.data;
        } catch (error) {
            console.error('Error sending test notification:', error);
            toast.error('Failed to send test notification');
        }
    }, []);

    // Fetch initial data
    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchUnreadCount();
        }
    }, [user, fetchNotifications, fetchUnreadCount]);

    const value = {
        notifications,
        unreadCount,
        loading,
        ws,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        deleteNotification,
        sendTestNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
