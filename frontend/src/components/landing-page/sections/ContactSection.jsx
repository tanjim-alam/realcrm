import React, { useState } from 'react';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import BaseSection from '../BaseSection';
import api from '../../../config/api';
import toast from 'react-hot-toast';

const ContactSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Get in Touch',
        subtitle = 'Ready to find your dream home? Contact us today!',
        formConfig = {
            fields: [
                { name: 'name', type: 'text', label: 'Full Name', required: true },
                { name: 'email', type: 'email', label: 'Email Address', required: true },
                { name: 'phone', type: 'tel', label: 'Phone Number', required: false }
            ],
            submitText: 'Send Message',
            successMessage: 'Thank you for your interest! We will contact you soon.'
        },
        contactInfo = {
            phone: '+1 (555) 123-4567',
            email: 'info@realestatecrm.com',
            address: '123 Main Street, City, State 12345'
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
                source: 'landing_page_contact',
                notes: `Contact form submission from landing page section: ${section.title}`,
                customFields: {
                    sectionId: section.id,
                    formData: formData
                }
            };

            await api.post('/leads', leadData);
            toast.success(formConfig.successMessage);
            setFormData({});
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <div className="space-y-6">
                            <h3
                                className="text-2xl font-semibold mb-6"
                                style={{ color: textColor }}
                            >
                                Contact Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <Phone className="h-5 w-5 mr-3" style={{ color: textColor }} />
                                    <span style={{ color: textColor }}>{contactInfo.phone}</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="h-5 w-5 mr-3" style={{ color: textColor }} />
                                    <span style={{ color: textColor }}>{contactInfo.email}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-3" style={{ color: textColor }} />
                                    <span style={{ color: textColor }}>{contactInfo.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {formConfig.fields.map((field, index) => (
                                <div key={index}>
                                    <label
                                        className="block text-sm font-medium mb-2"
                                        style={{ color: textColor }}
                                    >
                                        {field.label} {field.required && '*'}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleInputChange}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                                            rows={4}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={formData[field.name] || ''}
                                            onChange={handleInputChange}
                                            required={field.required}
                                            placeholder={field.placeholder}
                                            className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={submitting || isBuilder}
                                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            {formConfig.submitText}
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </BaseSection>
    );
};

export default ContactSection;

