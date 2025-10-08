import React, { useState } from 'react';
import { Download, ArrowRight, CheckCircle } from 'lucide-react';
import BaseSection from '../BaseSection';
import api from '../../../config/api';
import toast from 'react-hot-toast';

const LeadMagnetSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Get Your Free Guide',
        subtitle = 'Download our comprehensive guide to real estate investing',
        leadMagnet = {
            title: 'Ultimate Real Estate Investment Guide',
            description: 'Everything you need to know about investing in real estate',
            type: 'ebook',
            downloadUrl: '#',
            redirectUrl: '#'
        },
        formConfig = {
            fields: [
                { name: 'name', type: 'text', label: 'Full Name', required: true },
                { name: 'email', type: 'email', label: 'Email Address', required: true }
            ],
            submitText: 'Download Free Guide',
            successMessage: 'Thank you! Your download will start shortly.'
        },
        backgroundColor = '#3B82F6',
        textColor = '#FFFFFF'
    } = section;

    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isBuilder) return;

        try {
            setSubmitting(true);

            // Create lead from form submission
            const leadData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                source: 'lead_magnet',
                notes: `Lead magnet download: ${leadMagnet.title}`,
                customFields: {
                    sectionId: section.id,
                    leadMagnetId: leadMagnet.id,
                    leadMagnetType: leadMagnet.type,
                    formData: formData
                }
            };

            await api.post('/leads', leadData);
            toast.success(formConfig.successMessage);

            // Redirect to download or next page
            if (leadMagnet.redirectUrl) {
                window.location.href = leadMagnet.redirectUrl;
            } else if (leadMagnet.downloadUrl) {
                window.open(leadMagnet.downloadUrl, '_blank');
            }

            setFormData({});
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getLeadMagnetIcon = (type) => {
        switch (type) {
            case 'ebook':
            case 'guide':
                return <Download className="h-8 w-8" />;
            case 'checklist':
                return <CheckCircle className="h-8 w-8" />;
            case 'template':
                return <Download className="h-8 w-8" />;
            case 'calculator':
                return <Download className="h-8 w-8" />;
            case 'video':
                return <Download className="h-8 w-8" />;
            case 'webinar':
                return <Download className="h-8 w-8" />;
            default:
                return <Download className="h-8 w-8" />;
        }
    };

    return (
        <BaseSection
            section={section}
            isBuilder={isBuilder}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onToggleVisibility={onToggleVisibility}
            className="py-20"
        >
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2
                        className="text-4xl font-bold mb-4"
                        style={{ color: textColor }}
                    >
                        {title}
                    </h2>
                    <p
                        className="text-xl opacity-90"
                        style={{ color: textColor }}
                    >
                        {subtitle}
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Lead Magnet Info */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                                {getLeadMagnetIcon(leadMagnet.type)}
                            </div>
                            <h3
                                className="text-2xl font-bold mb-4"
                                style={{ color: textColor }}
                            >
                                {leadMagnet.title}
                            </h3>
                            <p
                                className="text-lg opacity-90 mb-6"
                                style={{ color: textColor }}
                            >
                                {leadMagnet.description}
                            </p>

                            {/* Benefits List */}
                            <ul className="space-y-3 text-left">
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                                    <span style={{ color: textColor }}>Comprehensive market analysis</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                                    <span style={{ color: textColor }}>Investment strategies that work</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                                    <span style={{ color: textColor }}>Risk assessment guidelines</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                                    <span style={{ color: textColor }}>Expert tips and insights</span>
                                </li>
                            </ul>
                        </div>

                        {/* Download Form */}
                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <h4
                                className="text-2xl font-bold mb-6 text-center"
                                style={{ color: textColor }}
                            >
                                Get Your Free Copy
                            </h4>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {formConfig.fields.map((field, index) => (
                                    <div key={index}>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: textColor }}
                                        >
                                            {field.label} {field.required && '*'}
                                        </label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleInputChange}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                ))}

                                <button
                                    type="submit"
                                    disabled={submitting || isBuilder}
                                    className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {formConfig.submitText}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default LeadMagnetSection;

