import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';
import {
    Download,
    CheckCircle,
    ArrowRight,
    Building2,
    Star,
    Users,
    TrendingUp,
    Shield,
    Award,
    BookOpen,
    FileText,
    CheckSquare,
    Calculator,
    Play,
    Video
} from 'lucide-react';
import toast from 'react-hot-toast';

const PublicLeadMagnet = () => {
    const { id } = useParams();
    const [leadMagnet, setLeadMagnet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchLeadMagnet();
    }, [id]);

    const fetchLeadMagnet = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/lead-generation/lead-magnets/${id}`);
            setLeadMagnet(response.data);

            // Initialize form data based on lead magnet form fields
            const initialFormData = {};
            response.data.formFields.forEach(field => {
                initialFormData[field.name] = '';
            });
            setFormData(initialFormData);
        } catch (error) {
            console.error('Error fetching lead magnet:', error);
            toast.error('Lead magnet not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!leadMagnet) return;

        try {
            setSubmitting(true);

            const response = await api.post(`/lead-generation/lead-magnets/${id}/submit`, formData);

            setSubmitted(true);
            toast.success(response.data.message || 'Thank you for your interest!');

            // Redirect if specified
            if (response.data.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getLeadMagnetIcon = (type) => {
        switch (type) {
            case 'ebook': return <BookOpen className="h-8 w-8" />;
            case 'guide': return <FileText className="h-8 w-8" />;
            case 'checklist': return <CheckSquare className="h-8 w-8" />;
            case 'template': return <FileText className="h-8 w-8" />;
            case 'calculator': return <Calculator className="h-8 w-8" />;
            case 'video': return <Play className="h-8 w-8" />;
            case 'webinar': return <Video className="h-8 w-8" />;
            default: return <FileText className="h-8 w-8" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!leadMagnet) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Lead Magnet Not Found</h1>
                    <p className="text-slate-600 mb-8">The lead magnet you're looking for doesn't exist.</p>
                    <a
                        href="/"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="max-w-2xl mx-auto px-6 text-center">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Thank You!</h1>
                    <p className="text-xl text-slate-600 mb-8">{leadMagnet.thankYouMessage}</p>

                    {leadMagnet.downloadUrl && (
                        <a
                            href={leadMagnet.downloadUrl}
                            className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Download className="mr-2 h-5 w-5" />
                            Download Now
                        </a>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        {getLeadMagnetIcon(leadMagnet.type)}
                    </div>
                    <h1 className="text-5xl font-bold mb-6">{leadMagnet.title}</h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        {leadMagnet.description}
                    </p>
                    <div className="flex items-center justify-center space-x-8 text-blue-100">
                        <div className="flex items-center">
                            <Users className="h-5 w-5 mr-2" />
                            <span>{leadMagnet.leadCount} downloads</span>
                        </div>
                        <div className="flex items-center">
                            <Star className="h-5 w-5 mr-2" />
                            <span>{leadMagnet.conversionRate}% conversion</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="py-20">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                {/* Content Preview */}
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-6">What You'll Get</h2>
                                    <div className="prose prose-lg text-slate-600 mb-8">
                                        <div dangerouslySetInnerHTML={{ __html: leadMagnet.content }} />
                                    </div>

                                    {/* Benefits */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Key Benefits:</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                <span className="text-slate-600">Expert insights and strategies</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                <span className="text-slate-600">Actionable tips and techniques</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                <span className="text-slate-600">Industry best practices</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                                                <span className="text-slate-600">Free download, no strings attached</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Section */}
                                <div className="bg-slate-50 rounded-xl p-8">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Get Your Free Copy</h3>
                                    <p className="text-slate-600 mb-6">
                                        Fill out the form below to instantly download your free {leadMagnet.type}.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {leadMagnet.formFields.map((field, index) => (
                                            <div key={index}>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </label>
                                                {field.type === 'select' ? (
                                                    <select
                                                        name={field.name}
                                                        value={formData[field.name] || ''}
                                                        onChange={handleInputChange}
                                                        required={field.required}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">Select {field.label}</option>
                                                        {field.options?.map((option, optIndex) => (
                                                            <option key={optIndex} value={option}>{option}</option>
                                                        ))}
                                                    </select>
                                                ) : field.type === 'textarea' ? (
                                                    <textarea
                                                        name={field.name}
                                                        value={formData[field.name] || ''}
                                                        onChange={handleInputChange}
                                                        required={field.required}
                                                        rows={4}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    />
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        name={field.name}
                                                        value={formData[field.name] || ''}
                                                        onChange={handleInputChange}
                                                        required={field.required}
                                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="mr-2 h-5 w-5" />
                                                    Download Free {leadMagnet.type.charAt(0).toUpperCase() + leadMagnet.type.slice(1)}
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <p className="text-xs text-slate-500 mt-4 text-center">
                                        By downloading, you agree to receive occasional emails from us. You can unsubscribe at any time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trust Section */}
            <div className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Trusted by Thousands</h2>
                        <p className="text-xl text-slate-600">Join our community of satisfied customers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">10,000+ Downloads</h3>
                            <p className="text-slate-600">Our resources have helped thousands of people</p>
                        </div>

                        <div className="text-center">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Expert Quality</h3>
                            <p className="text-slate-600">Created by industry professionals</p>
                        </div>

                        <div className="text-center">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">100% Free</h3>
                            <p className="text-slate-600">No hidden costs or subscriptions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center mb-4">
                        <Building2 className="h-8 w-8 text-blue-400 mr-3" />
                        <span className="text-2xl font-bold">RealEstate CRM</span>
                    </div>
                    <p className="text-slate-400 mb-8">Your trusted partner in real estate</p>
                    <div className="border-t border-slate-800 pt-8">
                        <p className="text-slate-400">&copy; 2024 RealEstate CRM. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLeadMagnet;


