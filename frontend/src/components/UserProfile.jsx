import React from 'react';
import { X, Phone, Video, Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const UserProfile = ({ user, userStatus, isOpen, onClose }) => {
    if (!isOpen || !user) return null;

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return 'Never';

        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMs = now - lastSeenDate;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return lastSeenDate.toLocaleDateString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'text-green-500';
            case 'offline': return 'text-gray-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'online': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'offline': return <AlertCircle className="w-4 h-4 text-gray-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-2xl mx-auto mb-4">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        {userStatus?.status === 'online' && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.name}</h2>
                    <p className="text-gray-500 mb-2">{user.email}</p>

                    {/* Status */}
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        {getStatusIcon(userStatus?.status)}
                        <span className={`font-medium ${getStatusColor(userStatus?.status)}`}>
                            {userStatus?.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    {/* Last Seen */}
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Last seen: {formatLastSeen(userStatus?.lastSeen)}</span>
                    </div>
                </div>

                {/* Status Details */}
                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Status Information</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Status:</span>
                                <span className={`font-medium ${getStatusColor(userStatus?.status)}`}>
                                    {userStatus?.status === 'online' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">On Chat Page:</span>
                                <span className="font-medium text-gray-900">
                                    {userStatus?.isOnChatPage ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Activity:</span>
                                <span className="font-medium text-gray-900">
                                    {formatLastSeen(userStatus?.lastActivity)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        <Video className="w-4 h-4" />
                        <span>Video</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;


