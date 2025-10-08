import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
    Plus,
    Download,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    BarChart3,
    Users,
    TrendingUp,
    Target,
    FileText,
    Video,
    Calculator,
    BookOpen,
    CheckSquare,
    Play,
    Globe,
    Link,
    Copy,
    ExternalLink,
    Settings,
    Filter,
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    DollarSign,
    Clock,
    Star,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const LeadGeneration = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [leadMagnets, setLeadMagnets] = useState([]);
    const [landingPages, setLandingPages] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLeadMagnetModal, setShowLeadMagnetModal] = useState(false);
    const [showLandingPageModal, setShowLandingPageModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Lead Magnet Form
    const [leadMagnetForm, setLeadMagnetForm] = useState({
        title: '',
        description: '',
        type: 'ebook',
        content: '',
        thumbnail: '',
        downloadUrl: '',
        formFields: [
            { name: 'name', label: 'Full Name', type: 'text', required: true, options: [] },
            { name: 'email', label: 'Email Address', type: 'email', required: true, options: [] }
        ],
        thankYouMessage: 'Thank you for your interest! Your download will be available shortly.',
        redirectUrl: ''
    });

    // Landing Page Form
    const [landingPageForm, setLandingPageForm] = useState({
        title: '',
        slug: '',
        description: '',
        template: 'hero',
        isPublished: false,
        content: {
            hero: {
                title: '',
                subtitle: '',
                backgroundImage: '',
                ctaText: 'Get Started',
                ctaLink: ''
            },
            sections: [],
            footer: {
                text: '',
                links: []
            }
        },
        seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: []
        },
        styling: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            fontFamily: 'Inter',
            customCss: ''
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadMagnetsRes, landingPagesRes, analyticsRes] = await Promise.all([
                api.get('/lead-generation/lead-magnets'),
                api.get('/lead-generation/landing-pages'),
                api.get('/lead-generation/analytics')
            ]);

            setLeadMagnets(leadMagnetsRes.data);
            setLandingPages(landingPagesRes.data);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleLeadMagnetSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/lead-generation/lead-magnets/${editingItem._id}`, leadMagnetForm);
                toast.success('Lead magnet updated successfully');
            } else {
                await api.post('/lead-generation/lead-magnets', leadMagnetForm);
                toast.success('Lead magnet created successfully');
            }

            setShowLeadMagnetModal(false);
            setEditingItem(null);
            resetLeadMagnetForm();
            fetchData();
        } catch (error) {
            console.error('Error saving lead magnet:', error);
            toast.error('Failed to save lead magnet');
        }
    };

    const handleLandingPageSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/lead-generation/landing-pages/${editingItem._id}`, landingPageForm);
                toast.success('Landing page updated successfully');
            } else {
                await api.post('/lead-generation/landing-pages', landingPageForm);
                toast.success('Landing page created successfully');
            }

            setShowLandingPageModal(false);
            setEditingItem(null);
            resetLandingPageForm();
            fetchData();
        } catch (error) {
            console.error('Error saving landing page:', error);
            toast.error('Failed to save landing page');
        }
    };

    const resetLeadMagnetForm = () => {
        setLeadMagnetForm({
            title: '',
            description: '',
            type: 'ebook',
            content: '',
            thumbnail: '',
            downloadUrl: '',
            formFields: [
                { name: 'name', label: 'Full Name', type: 'text', required: true, options: [] },
                { name: 'email', label: 'Email Address', type: 'email', required: true, options: [] }
            ],
            thankYouMessage: 'Thank you for your interest! Your download will be available shortly.',
            redirectUrl: ''
        });
    };

    const resetLandingPageForm = () => {
        setLandingPageForm({
            title: '',
            slug: '',
            description: '',
            template: 'hero',
            content: {
                hero: {
                    title: '',
                    subtitle: '',
                    backgroundImage: '',
                    ctaText: 'Get Started',
                    ctaLink: ''
                },
                sections: [],
                footer: {
                    text: '',
                    links: []
                }
            },
            seo: {
                metaTitle: '',
                metaDescription: '',
                keywords: []
            },
            styling: {
                primaryColor: '#3B82F6',
                secondaryColor: '#1E40AF',
                fontFamily: 'Inter',
                customCss: ''
            }
        });
    };

    const handleEdit = (item, type) => {
        if (type === 'leadMagnet') {
            setEditingItem(item);
            setLeadMagnetForm(item);
            setShowLeadMagnetModal(true);
        } else {
            setEditingItem(item);
            setLandingPageForm(item);
            setShowLandingPageModal(true);
        }
    };

    const handleDelete = async (id, type) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            if (type === 'leadMagnet') {
                await api.delete(`/lead-generation/lead-magnets/${id}`);
                toast.success('Lead magnet deleted successfully');
            } else {
                await api.delete(`/lead-generation/landing-pages/${id}`);
                toast.success('Landing page deleted successfully');
            }
            fetchData();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        }
    };

    const handleTogglePublish = async (page) => {
        try {
            const newStatus = !page.isPublished;
            await api.put(`/lead-generation/landing-pages/${page._id}`, {
                isPublished: newStatus
            });

            toast.success(`Landing page ${newStatus ? 'published' : 'unpublished'} successfully`);
            fetchData();
        } catch (error) {
            console.error('Error toggling publish status:', error);
            toast.error('Failed to update publish status');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const getLeadMagnetIcon = (type) => {
        switch (type) {
            case 'ebook': return <BookOpen className="h-5 w-5" />;
            case 'guide': return <FileText className="h-5 w-5" />;
            case 'checklist': return <CheckSquare className="h-5 w-5" />;
            case 'template': return <FileText className="h-5 w-5" />;
            case 'calculator': return <Calculator className="h-5 w-5" />;
            case 'video': return <Play className="h-5 w-5" />;
            case 'webinar': return <Video className="h-5 w-5" />;
            default: return <FileText className="h-5 w-5" />;
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => {
        const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-purple-600',
            orange: 'from-orange-500 to-orange-600',
            red: 'from-red-500 to-red-600'
        };

        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-600 text-sm font-medium">{title}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                        {change && (
                            <div className={`flex items-center mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {changeType === 'increase' ? (
                                    <ArrowUpRight className="h-4 w-4 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 mr-1" />
                                )}
                                {change}
                            </div>
                        )}
                    </div>
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading lead generation tools...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Lead Generation Tools
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Create lead magnets, landing pages, and track website visitors to generate more leads.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                resetLeadMagnetForm();
                                setEditingItem(null);
                                setShowLeadMagnetModal(true);
                            }}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Lead Magnet
                        </button>
                        <button
                            onClick={() => {
                                resetLandingPageForm();
                                setEditingItem(null);
                                setShowLandingPageModal(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Landing Page
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'lead-magnets', label: 'Lead Magnets', icon: Target },
                        { id: 'landing-pages', label: 'Landing Pages', icon: Globe },
                        { id: 'analytics', label: 'Analytics', icon: Activity }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <tab.icon className="h-4 w-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Lead Magnets"
                            value={analytics.leadMagnets.total}
                            icon={Target}
                            color="blue"
                        />
                        <StatCard
                            title="Total Leads Generated"
                            value={analytics.leadMagnets.totalLeads}
                            icon={Users}
                            color="green"
                        />
                        <StatCard
                            title="Landing Pages"
                            value={analytics.landingPages.total}
                            icon={Globe}
                            color="purple"
                        />
                        <StatCard
                            title="Conversion Rate"
                            value={`${analytics.visitors.conversionRate}%`}
                            icon={TrendingUp}
                            color="orange"
                        />
                    </div>

                    {/* Top Performing Lead Magnets */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Top Performing Lead Magnets</h3>
                        <div className="space-y-4">
                            {analytics.leadMagnets.topPerforming.map((magnet, index) => (
                                <div key={magnet._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                            {getLeadMagnetIcon(magnet.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900">{magnet.title}</h4>
                                            <p className="text-sm text-slate-600">{magnet.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900">{magnet.leadCount} leads</p>
                                        <p className="text-sm text-slate-600">{magnet.conversionRate}% conversion</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Magnets Tab */}
            {activeTab === 'lead-magnets' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leadMagnets.map((magnet) => (
                            <div key={magnet._id} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                            {getLeadMagnetIcon(magnet.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{magnet.title}</h3>
                                            <p className="text-sm text-slate-600 capitalize">{magnet.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(magnet, 'leadMagnet')}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(magnet._id, 'leadMagnet')}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-slate-600 text-sm mb-4">{magnet.description}</p>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-slate-600">
                                        <Users className="h-4 w-4 mr-1" />
                                        {magnet.leadCount} leads
                                    </div>
                                    <div className="flex items-center text-slate-600">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        {magnet.conversionRate}% conversion
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">Form URL:</span>
                                        <button
                                            onClick={() => copyToClipboard(`${window.location.origin}/lead-magnet/${magnet._id}`)}
                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Landing Pages Tab */}
            {activeTab === 'landing-pages' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {landingPages.map((page) => (
                            <div key={page._id} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-900">{page.title}</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full ${page.isPublished
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {page.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600">{page.template}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleTogglePublish(page)}
                                            className={`p-2 transition-colors ${page.isPublished
                                                ? 'text-orange-400 hover:text-orange-600'
                                                : 'text-green-400 hover:text-green-600'
                                                }`}
                                            title={page.isPublished ? 'Unpublish' : 'Publish'}
                                        >
                                            {page.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                        <button
                                            onClick={() => window.open(`/landing-page/${page.slug}`, '_blank')}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Preview"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(page, 'landingPage')}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(page._id, 'landingPage')}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-slate-600 text-sm mb-4">{page.description}</p>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-slate-600">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {page.views} views
                                    </div>
                                    <div className="flex items-center text-slate-600">
                                        <TrendingUp className="h-4 w-4 mr-1" />
                                        {page.conversionRate}% conversion
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">Page URL:</span>
                                        <button
                                            onClick={() => copyToClipboard(`${window.location.origin}/landing-page/${page.slug}`)}
                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <Copy className="h-3 w-3 mr-1" />
                                            Copy Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Visitors"
                            value={analytics.visitors.total}
                            icon={Users}
                            color="blue"
                        />
                        <StatCard
                            title="Converted Visitors"
                            value={analytics.visitors.converted}
                            icon={Target}
                            color="green"
                        />
                        <StatCard
                            title="Conversion Rate"
                            value={`${analytics.visitors.conversionRate}%`}
                            icon={TrendingUp}
                            color="purple"
                        />
                        <StatCard
                            title="Avg. Time Spent"
                            value={`${analytics.visitors.averageTimeSpent} min`}
                            icon={Clock}
                            color="orange"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                            <h3 className="text-xl font-semibold text-slate-900 mb-4">Top Lead Sources</h3>
                            <div className="space-y-3">
                                {analytics.leadSources.map((source, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-700">Lead Magnet #{source._id}</span>
                                        <span className="font-semibold text-slate-900">{source.count} leads</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                            <h3 className="text-xl font-semibold text-slate-900 mb-4">Top Landing Pages</h3>
                            <div className="space-y-3">
                                {analytics.landingPages.topPerforming.map((page, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-slate-700">{page.title}</span>
                                        <span className="font-semibold text-slate-900">{page.views} views</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Magnet Modal */}
            {showLeadMagnetModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingItem ? 'Edit Lead Magnet' : 'Create Lead Magnet'}
                                </h2>
                                <button
                                    onClick={() => setShowLeadMagnetModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleLeadMagnetSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={leadMagnetForm.title}
                                        onChange={(e) => setLeadMagnetForm({ ...leadMagnetForm, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
                                    <select
                                        value={leadMagnetForm.type}
                                        onChange={(e) => setLeadMagnetForm({ ...leadMagnetForm, type: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    >
                                        <option value="ebook">E-book</option>
                                        <option value="guide">Guide</option>
                                        <option value="checklist">Checklist</option>
                                        <option value="template">Template</option>
                                        <option value="calculator">Calculator</option>
                                        <option value="video">Video</option>
                                        <option value="webinar">Webinar</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={leadMagnetForm.description}
                                    onChange={(e) => setLeadMagnetForm({ ...leadMagnetForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    rows="3"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                                <textarea
                                    value={leadMagnetForm.content}
                                    onChange={(e) => setLeadMagnetForm({ ...leadMagnetForm, content: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    rows="6"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Download URL</label>
                                    <input
                                        type="url"
                                        value={leadMagnetForm.downloadUrl}
                                        onChange={(e) => setLeadMagnetForm({ ...leadMagnetForm, downloadUrl: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Redirect URL</label>
                                    <input
                                        type="url"
                                        value={leadMagnetForm.redirectUrl}
                                        onChange={(e) => setLeadMagnetForm({ ...leadMagnetForm, redirectUrl: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLeadMagnetModal(false)}
                                    className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {editingItem ? 'Update' : 'Create'} Lead Magnet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Landing Page Modal */}
            {showLandingPageModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingItem ? 'Edit Landing Page' : 'Create Landing Page'}
                                </h2>
                                <button
                                    onClick={() => setShowLandingPageModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleLandingPageSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={landingPageForm.title}
                                        onChange={(e) => setLandingPageForm({ ...landingPageForm, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Slug</label>
                                    <input
                                        type="text"
                                        value={landingPageForm.slug}
                                        onChange={(e) => setLandingPageForm({ ...landingPageForm, slug: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={landingPageForm.description}
                                    onChange={(e) => setLandingPageForm({ ...landingPageForm, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    rows="3"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Template</label>
                                    <select
                                        value={landingPageForm.template}
                                        onChange={(e) => setLandingPageForm({ ...landingPageForm, template: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                    >
                                        <option value="hero">Hero Page</option>
                                        <option value="property-showcase">Property Showcase</option>
                                        <option value="lead-magnet">Lead Magnet</option>
                                        <option value="contact">Contact</option>
                                        <option value="about">About</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex items-center h-12">
                                        <input
                                            type="checkbox"
                                            id="isPublished"
                                            checked={landingPageForm.isPublished}
                                            onChange={(e) => setLandingPageForm({ ...landingPageForm, isPublished: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isPublished" className="ml-2 block text-sm font-semibold text-slate-700">
                                            Publish immediately
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLandingPageModal(false)}
                                    className="px-6 py-3 text-slate-600 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    {editingItem ? 'Update' : 'Create'} Landing Page
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadGeneration;
