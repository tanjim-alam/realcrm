import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../contexts/NotificationContext';

const Navbar = ({ setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        setIsProfileOpen(!isProfileOpen);
    };

    const handleProfileOption = (option) => {
        setIsProfileOpen(false);
        switch (option) {
            case 'profile':
                navigate('/profile');
                break;
            case 'settings':
                navigate('/settings');
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg p-2 transition-all duration-200 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Notification Bell */}
                        <div className="relative z-[9998]" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <Bell className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            <NotificationDropdown
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                            />
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={handleProfileClick}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span className="text-sm font-semibold text-white">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </button>

                            {/* Profile Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 z-50 overflow-hidden">
                                    {/* User Info */}
                                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                        <div className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</div>
                                        <div className="text-xs text-gray-600 mt-1">{user?.email || 'user@example.com'}</div>
                                    </div>

                                    {/* Menu Options */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => handleProfileOption('profile')}
                                            className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                                        >
                                            <User className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => handleProfileOption('settings')}
                                            className="flex items-center w-full px-6 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
                                        >
                                            <Settings className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                                            Settings
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                            onClick={() => handleProfileOption('logout')}
                                            className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
