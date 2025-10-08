import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications } from '../contexts/NotificationContext';
import {
    Bell,
    X,
    Check,
    CheckCheck,
    Archive,
    Trash2,
    ExternalLink,
    Globe,
    Target,
    Building2,
    CheckSquare,
    Settings,
    AlertCircle,
    Clock,
    Flame,
    Star,
    Zap,
    RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ isOpen, onClose }) => {
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        deleteNotification,
        fetchNotifications
    } = useNotifications();

    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [showArchived, setShowArchived] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'website':
                return <Globe className="h-4 w-4" />;
            case 'google_ads':
                return <Target className="h-4 w-4" />;
            case 'meta_ads':
                return <Building2 className="h-4 w-4" />;
            case 'hubspot':
                return <Zap className="h-4 w-4" />;
            case 'salesforce':
                return <Settings className="h-4 w-4" />;
            case 'system':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'text-red-600 bg-red-100';
            case 'high':
                return 'text-orange-600 bg-orange-100';
            case 'medium':
                return 'text-blue-600 bg-blue-100';
            case 'low':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'lead':
                return <Target className="h-4 w-4" />;
            case 'property':
                return <Building2 className="h-4 w-4" />;
            case 'task':
                return <CheckSquare className="h-4 w-4" />;
            case 'system':
                return <Settings className="h-4 w-4" />;
            case 'platform_integration':
                return <Zap className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const handleSelectNotification = (notificationId) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const handleMarkSelectedAsRead = async () => {
        if (selectedNotifications.length > 0) {
            await markAsRead(selectedNotifications);
            setSelectedNotifications([]);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setSelectedNotifications([]);
    };

    const filteredNotifications = notifications.filter(notification =>
        showArchived ? notification.isArchived : !notification.isArchived
    );

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={dropdownRef}
            className="fixed right-4 top-20 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[9999] max-h-[600px] overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                            title={showArchived ? 'Show Active' : 'Show Archived'}
                        >
                            <Archive className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {selectedNotifications.length > 0 && (
                            <button
                                onClick={handleMarkSelectedAsRead}
                                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Mark Selected
                            </button>
                        )}
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark All Read
                        </button>
                    </div>
                    <button
                        onClick={() => fetchNotifications()}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500">Loading notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <Bell className="h-12 w-12 mx-auto text-gray-300" />
                        <p className="mt-2 text-gray-500">
                            {showArchived ? 'No archived notifications' : 'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notification._id)}
                                                onChange={() => handleSelectNotification(notification._id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                                                {getPlatformIcon(notification.platform)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getTypeIcon(notification.type)}
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                                                    {notification.priority}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                            {notification.message}
                                        </p>

                                        {notification.data && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                {notification.data.leadName && (
                                                    <span>Lead: {notification.data.leadName}</span>
                                                )}
                                                {notification.data.leadEmail && (
                                                    <span className="ml-2">Email: {notification.data.leadEmail}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span className="capitalize">{notification.platform.replace('_', ' ')}</span>
                                                <span>•</span>
                                                <span className="capitalize">{notification.type}</span>
                                            </div>

                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => archiveNotification(notification._id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                                                    title="Archive"
                                                >
                                                    <Archive className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => deleteNotification(notification._id)}
                                                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{filteredNotifications.length} notifications</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                        View All
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NotificationDropdown;
