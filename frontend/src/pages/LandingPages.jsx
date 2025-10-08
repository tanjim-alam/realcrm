import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Plus,
    Edit,
    Eye,
    Trash2,
    Copy,
    MoreVertical,
    Search,
    Filter,
    Calendar,
    BarChart3
} from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const LandingPages = () => {
    const navigate = useNavigate();
    const [landingPages, setLandingPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchLandingPages();
    }, []);

    const fetchLandingPages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lead-generation/landing-pages');
            setLandingPages(response.data);
        } catch (error) {
            console.error('Error fetching landing pages:', error);
            toast.error('Failed to load landing pages');
        } finally {
            setLoading(false);
        }
    };

    const deleteLandingPage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this landing page?')) {
            return;
        }

        try {
            await api.delete(`/lead-generation/landing-pages/${id}`);
            setLandingPages(landingPages.filter(page => page._id !== id));
            toast.success('Landing page deleted successfully');
        } catch (error) {
            console.error('Error deleting landing page:', error);
            toast.error('Failed to delete landing page');
        }
    };

    const duplicateLandingPage = async (page) => {
        try {
            const duplicateData = {
                ...page,
                title: `${page.title} (Copy)`,
                slug: `${page.slug}-copy-${Date.now()}`,
                isPublished: false
            };
            delete duplicateData._id;
            delete duplicateData.createdAt;
            delete duplicateData.updatedAt;

            const response = await api.post('/lead-generation/landing-pages', duplicateData);
            setLandingPages([response.data, ...landingPages]);
            toast.success('Landing page duplicated successfully');
        } catch (error) {
            console.error('Error duplicating landing page:', error);
            toast.error('Failed to duplicate landing page');
        }
    };

    const togglePublishStatus = async (page) => {
        try {
            const updatedPage = await api.put(`/lead-generation/landing-pages/${page._id}`, {
                isPublished: !page.isPublished
            });
            setLandingPages(landingPages.map(p =>
                p._id === page._id ? updatedPage.data : p
            ));
            toast.success(`Landing page ${updatedPage.data.isPublished ? 'published' : 'unpublished'} successfully`);
        } catch (error) {
            console.error('Error updating landing page:', error);
            toast.error('Failed to update landing page');
        }
    };

    const filteredPages = landingPages.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            page.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'published' && page.isPublished) ||
            (filterStatus === 'draft' && !page.isPublished);
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading landing pages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Landing Pages</h1>
                            <p className="mt-2 text-gray-600">
                                Create and manage your landing pages to generate more leads
                            </p>
                        </div>
                        <Link
                            to="/landing-pages/builder"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Landing Page
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search landing pages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Pages</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Pages</p>
                                <p className="text-2xl font-bold text-gray-900">{landingPages.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Eye className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Published</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {landingPages.filter(p => p.isPublished).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Edit className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Drafts</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {landingPages.filter(p => !p.isPublished).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Views</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {landingPages.reduce((sum, page) => sum + (page.views || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Landing Pages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPages.map((page) => (
                        <div key={page._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            {page.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            /{page.slug}
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${page.isPublished
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {page.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            {page.views > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    {page.views} views
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button className="p-1 hover:bg-gray-100 rounded">
                                            <MoreVertical className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {page.description || 'No description provided'}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {new Date(page.createdAt).toLocaleDateString()}
                                    </div>
                                    <div>
                                        {page.conversions > 0 && (
                                            <span className="text-green-600 font-medium">
                                                {page.conversions} conversions
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Link
                                        to={`/landing-pages/builder/${page._id}`}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Link>
                                    <a
                                        href={`/landing-page/${page.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View
                                    </a>
                                    <button
                                        onClick={() => duplicateLandingPage(page)}
                                        className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        title="Duplicate"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => togglePublishStatus(page)}
                                        className={`p-2 border rounded-lg ${page.isPublished
                                                ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                                                : 'border-green-300 text-green-700 hover:bg-green-50'
                                            }`}
                                        title={page.isPublished ? 'Unpublish' : 'Publish'}
                                    >
                                        {page.isPublished ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button
                                        onClick={() => deleteLandingPage(page._id)}
                                        className="p-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredPages.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mx-auto h-24 w-24 text-gray-400">
                            <BarChart3 className="h-full w-full" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            {searchTerm || filterStatus !== 'all' ? 'No matching landing pages' : 'No landing pages yet'}
                        </h3>
                        <p className="mt-2 text-gray-600">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Get started by creating your first landing page.'
                            }
                        </p>
                        {(!searchTerm && filterStatus === 'all') && (
                            <div className="mt-6">
                                <Link
                                    to="/landing-pages/builder"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Landing Page
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPages;

