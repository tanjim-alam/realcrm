import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
    Target,
    Plus,
    Edit3,
    Trash2,
    Play,
    Settings,
    BarChart3,
    TrendingUp,
    Users,
    CheckCircle,
    Clock,
    RefreshCw,
    Activity,
    PieChart,
    Flame,
    Crown,
    X,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const LeadScoring = () => {
    const { user, company } = useAuth();
    const [scoringModels, setScoringModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedModel, setSelectedModel] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [scoringStats, setScoringStats] = useState(null);
    const [isScoring, setIsScoring] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        rules: [],
        settings: {
            maxScore: 100,
            priorityThresholds: { high: 80, medium: 50, low: 20 },
            autoScore: true,
            notifyOnHighScore: true
        },
        isDefault: false,
        isActive: true
    });

    // Dummy data for demonstration
    const dummyScoringModels = [
        {
            _id: '1',
            name: 'Real Estate Lead Scoring',
            description: 'Comprehensive scoring model for real estate leads based on behavior, demographics, and engagement',
            isDefault: true,
            isActive: true,
            rules: [
                { name: 'Email Engagement', field: 'emailOpens', operator: 'greater_than', value: 5, score: 20, isActive: true },
                { name: 'Website Visits', field: 'websiteVisits', operator: 'greater_than', value: 10, score: 15, isActive: true },
                { name: 'Property Views', field: 'propertyViews', operator: 'greater_than', value: 3, score: 25, isActive: true },
                { name: 'Budget Range', field: 'budget', operator: 'greater_than', value: 500000, score: 30, isActive: true },
                { name: 'Timeline', field: 'timeline', operator: 'equals', value: 'immediate', score: 20, isActive: true },
                { name: 'Lead Source', field: 'source', operator: 'in', value: ['referral', 'website'], score: 10, isActive: true }
            ],
            settings: {
                maxScore: 120,
                priorityThresholds: { high: 80, medium: 50, low: 20 },
                autoScore: true,
                notifyOnHighScore: true
            },
            stats: {
                totalLeadsScored: 1247,
                lastUpdated: new Date(),
                avgScore: 67.5,
                highPriorityLeads: 234,
                mediumPriorityLeads: 456,
                lowPriorityLeads: 557
            },
            createdBy: { name: 'John Doe', email: 'john@example.com' },
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-20')
        },
        {
            _id: '2',
            name: 'Quick Lead Assessment',
            description: 'Fast scoring model for initial lead qualification',
            isDefault: false,
            isActive: true,
            rules: [
                { name: 'Contact Method', field: 'contactMethod', operator: 'equals', value: 'phone', score: 15, isActive: true },
                { name: 'Response Time', field: 'responseTime', operator: 'less_than', value: 24, score: 20, isActive: true },
                { name: 'Budget Confirmed', field: 'budgetConfirmed', operator: 'equals', value: true, score: 25, isActive: true }
            ],
            settings: {
                maxScore: 60,
                priorityThresholds: { high: 40, medium: 25, low: 10 },
                autoScore: false,
                notifyOnHighScore: false
            },
            stats: {
                totalLeadsScored: 89,
                lastUpdated: new Date(),
                avgScore: 42.3,
                highPriorityLeads: 12,
                mediumPriorityLeads: 34,
                lowPriorityLeads: 43
            },
            createdBy: { name: 'Jane Smith', email: 'jane@example.com' },
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-18')
        }
    ];

    const dummyStats = {
        totalModels: 2,
        activeModels: 2,
        totalLeadsScored: 1336,
        avgScore: 65.2,
        highPriorityLeads: 246,
        mediumPriorityLeads: 490,
        lowPriorityLeads: 600,
        scoreDistribution: [
            { range: '0-20', count: 45, percentage: 3.4 },
            { range: '21-40', count: 123, percentage: 9.2 },
            { range: '41-60', count: 234, percentage: 17.5 },
            { range: '61-80', count: 456, percentage: 34.1 },
            { range: '81-100', count: 478, percentage: 35.8 }
        ],
        recentActivity: [
            { action: 'Lead scored', lead: 'John Smith', score: 85, priority: 'High', time: '2 minutes ago' },
            { action: 'Model updated', model: 'Real Estate Lead Scoring', time: '1 hour ago' },
            { action: 'Bulk scoring completed', count: 45, time: '3 hours ago' },
            { action: 'New model created', model: 'Quick Lead Assessment', time: '2 days ago' }
        ]
    };

    useEffect(() => {
        fetchScoringModels();
    }, []);

    const fetchScoringModels = async () => {
        try {
            setLoading(true);
            // Use dummy data for now
            setScoringModels(dummyScoringModels);
            setScoringStats(dummyStats);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
            toast.error('Failed to fetch scoring models');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateModel = async () => {
        try {
            const newModel = {
                ...formData,
                _id: Date.now().toString(),
                createdBy: { name: user?.name, email: user?.email },
                createdAt: new Date(),
                updatedAt: new Date(),
                stats: {
                    totalLeadsScored: 0,
                    lastUpdated: new Date(),
                    avgScore: 0,
                    highPriorityLeads: 0,
                    mediumPriorityLeads: 0,
                    lowPriorityLeads: 0
                }
            };

            setScoringModels([...scoringModels, newModel]);
            setShowCreateModal(false);
            resetForm();
            toast.success('Scoring model created successfully!');
        } catch (error) {
            toast.error('Failed to create scoring model');
        }
    };

    const handleUpdateModel = async () => {
        try {
            const updatedModels = scoringModels.map(model =>
                model._id === selectedModel._id ? { ...model, ...formData, updatedAt: new Date() } : model
            );
            setScoringModels(updatedModels);
            setShowEditModal(false);
            setSelectedModel(null);
            resetForm();
            toast.success('Scoring model updated successfully!');
        } catch (error) {
            toast.error('Failed to update scoring model');
        }
    };

    const handleDeleteModel = async (modelId) => {
        if (window.confirm('Are you sure you want to delete this scoring model?')) {
            try {
                setScoringModels(scoringModels.filter(model => model._id !== modelId));
                toast.success('Scoring model deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete scoring model');
            }
        }
    };

    const handleScoreAllLeads = async (modelId) => {
        try {
            setIsScoring(true);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            toast.success('All leads scored successfully!');
            fetchScoringModels();
        } catch (error) {
            toast.error('Failed to score leads');
        } finally {
            setIsScoring(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            rules: [],
            settings: {
                maxScore: 100,
                priorityThresholds: { high: 80, medium: 50, low: 20 },
                autoScore: true,
                notifyOnHighScore: true
            },
            isDefault: false,
            isActive: true
        });
    };

    const openEditModal = (model) => {
        setSelectedModel(model);
        setFormData({
            name: model.name,
            description: model.description,
            rules: model.rules,
            settings: model.settings,
            isDefault: model.isDefault,
            isActive: model.isActive
        });
        setShowEditModal(true);
    };

    const addRule = () => {
        setFormData({
            ...formData,
            rules: [...formData.rules, {
                name: '',
                field: '',
                operator: 'equals',
                value: '',
                score: 10,
                isActive: true
            }]
        });
    };

    const removeRule = (index) => {
        setFormData({
            ...formData,
            rules: formData.rules.filter((_, i) => i !== index)
        });
    };

    const updateRule = (index, field, value) => {
        const updatedRules = [...formData.rules];
        updatedRules[index] = { ...updatedRules[index], [field]: value };
        setFormData({ ...formData, rules: updatedRules });
    };

    const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
        const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-purple-600',
            orange: 'from-orange-500 to-orange-600',
            red: 'from-red-500 to-red-600',
            indigo: 'from-indigo-500 to-indigo-600'
        };

        return (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                        {trend && (
                            <div className="flex items-center mt-1">
                                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                                <span className="text-xs text-green-600">{trend}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const PriorityBadge = ({ priority }) => {
        const styles = {
            high: 'bg-red-100 text-red-800 border-red-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[priority]}`}>
                {priority === 'high' && <Flame className="h-3 w-3 mr-1" />}
                {priority === 'medium' && <Clock className="h-3 w-3 mr-1" />}
                {priority === 'low' && <CheckCircle className="h-3 w-3 mr-1" />}
                {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-center">Loading lead scoring...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Lead Scoring
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">Intelligent lead prioritization and scoring system</p>
                            {lastUpdated && (
                                <p className="text-sm text-blue-600 mt-1">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                            <button
                                onClick={fetchScoringModels}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                New Model
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                    <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'models', label: 'Scoring Models', icon: Target },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                            { id: 'settings', label: 'Settings', icon: Settings }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === tab.id
                                            ? 'bg-white text-blue-600 shadow-lg'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Models"
                                value={scoringStats?.totalModels || 0}
                                icon={Target}
                                color="blue"
                                subtitle="Active scoring models"
                            />
                            <StatCard
                                title="Leads Scored"
                                value={scoringStats?.totalLeadsScored?.toLocaleString() || 0}
                                icon={Users}
                                color="green"
                                subtitle="Total leads processed"
                                trend="+12% this week"
                            />
                            <StatCard
                                title="High Priority"
                                value={scoringStats?.highPriorityLeads || 0}
                                icon={Flame}
                                color="red"
                                subtitle="Hot leads ready to convert"
                            />
                            <StatCard
                                title="Avg Score"
                                value={`${scoringStats?.avgScore?.toFixed(1) || 0}%`}
                                icon={TrendingUp}
                                color="purple"
                                subtitle="Average lead score"
                            />
                        </div>

                        {/* Score Distribution Chart */}
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                            <div className="flex items-center mb-6">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                                    <PieChart className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Score Distribution</h2>
                                    <p className="text-gray-600">Lead scores across all models</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {scoringStats?.scoreDistribution?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-3 ${index === 0 ? 'bg-red-500' :
                                                    index === 1 ? 'bg-orange-500' :
                                                        index === 2 ? 'bg-yellow-500' :
                                                            index === 3 ? 'bg-blue-500' : 'bg-green-500'
                                                }`}></div>
                                            <span className="text-gray-700 font-medium">{item.range}</span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                                                    style={{ width: `${item.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                                                {item.count}
                                            </span>
                                            <span className="text-sm text-gray-500 w-12 text-right">
                                                {item.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                            <div className="flex items-center mb-6">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                                    <Activity className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                                    <p className="text-gray-600">Latest scoring activities and updates</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {scoringStats?.recentActivity?.map((activity, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4">
                                                <Activity className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{activity.action}</p>
                                                {activity.lead && (
                                                    <p className="text-sm text-gray-600">
                                                        {activity.lead} - Score: {activity.score} - <PriorityBadge priority={activity.priority} />
                                                    </p>
                                                )}
                                                {activity.model && (
                                                    <p className="text-sm text-gray-600">Model: {activity.model}</p>
                                                )}
                                                {activity.count && (
                                                    <p className="text-sm text-gray-600">{activity.count} leads processed</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">{activity.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Models Tab */}
                {activeTab === 'models' && (
                    <div className="space-y-8">
                        {/* Models Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {scoringModels.map((model) => (
                                <div key={model._id} className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                                                <Target className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                                                    {model.isDefault && (
                                                        <Crown className="h-5 w-5 text-yellow-500 ml-2" />
                                                    )}
                                                </div>
                                                <p className="text-gray-600 mt-1">{model.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <PriorityBadge priority={model.isActive ? 'high' : 'low'} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <p className="text-2xl font-bold text-gray-900">{model.stats?.totalLeadsScored || 0}</p>
                                            <p className="text-sm text-gray-600">Leads Scored</p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                                            <p className="text-2xl font-bold text-gray-900">{model.stats?.avgScore?.toFixed(1) || 0}%</p>
                                            <p className="text-sm text-gray-600">Avg Score</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <h4 className="font-semibold text-gray-900">Scoring Rules ({model.rules?.length || 0})</h4>
                                        <div className="space-y-1">
                                            {model.rules?.slice(0, 3).map((rule, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{rule.name}</span>
                                                    <span className="font-semibold text-gray-900">+{rule.score}</span>
                                                </div>
                                            ))}
                                            {model.rules?.length > 3 && (
                                                <p className="text-sm text-gray-500">+{model.rules.length - 3} more rules</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(model)}
                                                className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                            >
                                                <Edit3 className="h-4 w-4 mr-1" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleScoreAllLeads(model._id)}
                                                disabled={isScoring}
                                                className="flex items-center px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                            >
                                                <Play className="h-4 w-4 mr-1" />
                                                {isScoring ? 'Scoring...' : 'Score All'}
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleDeleteModel(model._id)}
                                                className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-8">
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Lead Scoring Analytics</h2>
                            <p className="text-gray-600">Advanced analytics and insights coming soon...</p>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-8">
                        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Scoring Settings</h2>
                            <p className="text-gray-600">Global scoring settings and preferences coming soon...</p>
                        </div>
                    </div>
                )}

                {/* Create Model Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">Create New Scoring Model</h3>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter model name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter model description"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-gray-900">Scoring Rules</h4>
                                        <button
                                            onClick={addRule}
                                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Rule
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.rules.map((rule, index) => (
                                            <div key={index} className="p-4 border border-gray-200 rounded-xl">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                                                        <input
                                                            type="text"
                                                            value={rule.name}
                                                            onChange={(e) => updateRule(index, 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Rule name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                                                        <select
                                                            value={rule.field}
                                                            onChange={(e) => updateRule(index, 'field', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select field</option>
                                                            <option value="emailOpens">Email Opens</option>
                                                            <option value="websiteVisits">Website Visits</option>
                                                            <option value="propertyViews">Property Views</option>
                                                            <option value="budget">Budget</option>
                                                            <option value="timeline">Timeline</option>
                                                            <option value="source">Lead Source</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                                                        <select
                                                            value={rule.operator}
                                                            onChange={(e) => updateRule(index, 'operator', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="equals">Equals</option>
                                                            <option value="greater_than">Greater than</option>
                                                            <option value="less_than">Less than</option>
                                                            <option value="contains">Contains</option>
                                                            <option value="in">In</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-end space-x-2">
                                                        <div className="flex-1">
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                                                            <input
                                                                type="number"
                                                                value={rule.score}
                                                                onChange={(e) => updateRule(index, 'score', parseInt(e.target.value))}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                min="0"
                                                                max="100"
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => removeRule(index)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isDefault}
                                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Set as default model</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateModel}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg"
                                >
                                    Create Model
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Model Modal */}
                {showEditModal && selectedModel && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">Edit Scoring Model</h3>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isDefault}
                                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Set as default model</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateModel}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg"
                                >
                                    Update Model
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadScoring;
