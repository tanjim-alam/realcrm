import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
    Bell,
    Send,
    Target,
    Globe,
    Building2,
    Zap,
    Settings,
    AlertCircle,
    CheckSquare,
    Plus,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const TestNotifications = () => {
    const { sendTestNotification } = useNotifications();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [testLead, setTestLead] = useState({
        name: '',
        email: '',
        phone: '',
        source: 'website',
        utmSource: '',
        utmMedium: '',
        utmCampaign: '',
        budget: '',
        propertyType: 'apartment',
        status: 'new',
        priority: 'medium'
    });

    const platforms = [
        { id: 'website', name: 'Website', icon: Globe, color: 'blue' },
        { id: 'google_ads', name: 'Google Ads', icon: Target, color: 'green' },
        { id: 'meta_ads', name: 'Meta Ads', icon: Building2, color: 'purple' },
        { id: 'hubspot', name: 'HubSpot', icon: Zap, color: 'orange' },
        { id: 'salesforce', name: 'Salesforce', icon: Settings, color: 'indigo' },
        { id: 'manual', name: 'Manual Entry', icon: Plus, color: 'gray' }
    ];

    const notificationTypes = [
        { id: 'lead', name: 'Lead', icon: Target },
        { id: 'property', name: 'Property', icon: Building2 },
        { id: 'task', name: 'Task', icon: CheckSquare },
        { id: 'system', name: 'System', icon: Settings },
        { id: 'platform_integration', name: 'Platform Integration', icon: Zap }
    ];

    const handleTestNotification = async (type, platform) => {
        const testData = {
            type,
            platform,
            title: `Test ${type} notification from ${platform}`,
            message: `This is a test notification to verify real-time functionality for ${platform} integration.`
        };

        await sendTestNotification(type, platform, testData.title, testData.message);
    };

    const handleCreateTestLead = async () => {
        try {
            setLoading(true);

            const leadData = {
                ...testLead,
                companyId: user.companyId,
                createdBy: user.id
            };

            const response = await api.post('/leads', leadData);

            toast.success('Test lead created successfully!');
            console.log('Lead created:', response.data);

            // Reset form
            setTestLead({
                name: '',
                email: '',
                phone: '',
                source: 'website',
                utmSource: '',
                utmMedium: '',
                utmCampaign: '',
                budget: '',
                propertyType: 'apartment',
                status: 'new',
                priority: 'medium'
            });
        } catch (error) {
            console.error('Error creating test lead:', error);
            toast.error('Failed to create test lead');
        } finally {
            setLoading(false);
        }
    };

    const PlatformCard = ({ platform }) => {
        const Icon = platform.icon;
        const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-purple-600',
            orange: 'from-orange-500 to-orange-600',
            indigo: 'from-indigo-500 to-indigo-600',
            gray: 'from-gray-500 to-gray-600'
        };

        return (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[platform.color]} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900">{platform.name}</h3>
                        <p className="text-gray-600">Test notifications</p>
                    </div>
                </div>

                <div className="space-y-2">
                    {notificationTypes.map((type) => {
                        const TypeIcon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => handleTestNotification(type.id, platform.id)}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                            >
                                <div className="flex items-center">
                                    <TypeIcon className="h-4 w-4 text-gray-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-900">{type.name}</span>
                                </div>
                                <Send className="h-4 w-4 text-gray-400" />
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                    <div className="flex items-center">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <div className="ml-4">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Test Notifications
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">Test real-time notifications from different platforms</p>
                        </div>
                    </div>
                </div>

                {/* Platform Test Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {platforms.map((platform) => (
                        <PlatformCard key={platform.id} platform={platform} />
                    ))}
                </div>

                {/* Test Lead Creation */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                    <div className="flex items-center mb-6">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                            <Plus className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-gray-900">Create Test Lead</h2>
                            <p className="text-gray-600">Create a test lead to trigger real-time notifications</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input
                                type="text"
                                value={testLead.name}
                                onChange={(e) => setTestLead({ ...testLead, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter lead name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={testLead.email}
                                onChange={(e) => setTestLead({ ...testLead, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                value={testLead.phone}
                                onChange={(e) => setTestLead({ ...testLead, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                            <select
                                value={testLead.source}
                                onChange={(e) => setTestLead({ ...testLead, source: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="website">Website</option>
                                <option value="google_ads">Google Ads</option>
                                <option value="meta_ads">Meta Ads</option>
                                <option value="hubspot">HubSpot</option>
                                <option value="salesforce">Salesforce</option>
                                <option value="manual">Manual Entry</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">UTM Source</label>
                            <input
                                type="text"
                                value={testLead.utmSource}
                                onChange={(e) => setTestLead({ ...testLead, utmSource: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., google, facebook, hubspot"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                            <input
                                type="number"
                                value={testLead.budget}
                                onChange={(e) => setTestLead({ ...testLead, budget: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter budget amount"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleCreateTestLead}
                            disabled={loading || !testLead.name || !testLead.email}
                            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-5 w-5 mr-2" />
                            )}
                            {loading ? 'Creating Lead...' : 'Create Test Lead'}
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                    <div className="flex items-center mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg">
                            <AlertCircle className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 ml-4">How to Test</h2>
                    </div>

                    <div className="space-y-4 text-gray-700">
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                            <p>Click on any notification type for each platform to send a test notification</p>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                            <p>Fill out the lead form and click "Create Test Lead" to trigger a real lead notification</p>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                            <p>Check the notification bell in the navbar to see real-time notifications</p>
                        </div>
                        <div className="flex items-start">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
                            <p>Different platforms will show different icons and colors in the notifications</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestNotifications;


