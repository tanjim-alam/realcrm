import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';
import SectionRenderer from '../components/landing-page/SectionRenderer';
import {
    Building2,
    MapPin,
    Bed,
    Bath,
    Square,
    Star,
    Phone,
    Mail,
    MessageSquare,
    Download,
    CheckCircle,
    ArrowRight,
    Home,
    Users,
    TrendingUp,
    Shield,
    Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const PublicLandingPage = () => {
    const { slug } = useParams();
    console.log(slug);
    const [landingPage, setLandingPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        fetchLandingPage();
    }, [slug]);

    const fetchLandingPage = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/lead-generation/landing-pages/${slug}`);
            setLandingPage(response.data);
        } catch (error) {
            console.error('Error fetching landing page:', error);
            toast.error('Landing page not found');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!landingPage) return;

        try {
            setSubmitting(true);

            // Create lead from form submission
            const leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                companyId: landingPage.companyId,
                source: 'landing_page',
                notes: `Lead generated from landing page: ${landingPage.title}`,
                customFields: {
                    landingPageId: landingPage._id,
                    landingPageSlug: landingPage.slug,
                    formData: formData
                }
            };

            await api.post('/leads', leadData);

            toast.success('Thank you for your interest! We will contact you soon.');
            setFormData({ name: '', email: '', phone: '' });
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading page...</p>
                </div>
            </div>
        );
    }

    if (!landingPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Page Not Found</h1>
                    <p className="text-slate-600 mb-8">The landing page you're looking for doesn't exist.</p>
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

    const { content, styling } = landingPage;

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: styling.fontFamily }}>
            {/* Hero Section */}
            {content.hero && (
                <SectionRenderer
                    section={{
                        id: 'hero',
                        type: 'hero',
                        ...content.hero
                    }}
                    isBuilder={false}
                />
            )}

            {/* Dynamic Sections */}
            {content.sections && content.sections
                .filter(section => section.isVisible !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((section) => (
                    <SectionRenderer
                        key={section.id}
                        section={section}
                        isBuilder={false}
                    />
                ))}

            {/* Footer */}
            {content.footer && (
                <footer
                    className="py-12"
                    style={{
                        backgroundColor: content.footer.backgroundColor || '#1E293B',
                        color: content.footer.textColor || '#FFFFFF'
                    }}
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="flex items-center mb-4">
                                    <Building2 className="h-8 w-8 text-blue-400 mr-3" />
                                    <span className="text-2xl font-bold">RealEstate CRM</span>
                                </div>
                                <p className="opacity-75">{content.footer.text || 'Your trusted partner in real estate'}</p>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                                <ul className="space-y-2">
                                    {content.footer.links?.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.url}
                                                className="opacity-75 hover:opacity-100 transition-colors"
                                                style={{ color: content.footer.textColor || '#FFFFFF' }}
                                            >
                                                {link.text}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                                <div className="space-y-2 opacity-75">
                                    <p className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2" />
                                        +1 (555) 123-4567
                                    </p>
                                    <p className="flex items-center">
                                        <Mail className="h-4 w-4 mr-2" />
                                        info@realestatecrm.com
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-opacity-20 mt-8 pt-8 text-center opacity-75" style={{ borderColor: content.footer.textColor || '#FFFFFF' }}>
                            <p>&copy; 2024 RealEstate CRM. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default PublicLandingPage;
