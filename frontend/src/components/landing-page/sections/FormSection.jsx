import React, { useState } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import BaseSection from '../BaseSection';
import api from '../../../config/api';
import toast from 'react-hot-toast';

const FormSection = ({ section, isBuilder, onEdit, onDelete, onMoveUp, onMoveDown, onToggleVisibility }) => {
    const {
        title = 'Contact Us',
        subtitle = 'Fill out the form below and we\'ll get back to you',
        formConfig = {
            fields: [
                { name: 'name', type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
                { name: 'email', type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
                { name: 'phone', type: 'tel', label: 'Phone Number', required: false, placeholder: 'Enter your phone number' },
                { name: 'message', type: 'textarea', label: 'Message', required: true, placeholder: 'Enter your message' }
            ],
            submitText: 'Send Message',
            successMessage: 'Thank you! Your message has been sent successfully.'
        },
        backgroundColor = '#F8FAFC',
        textColor = '#1E293B'
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
                source: 'landing_page_form',
                notes: `Form submission from landing page: ${section.title}\n\nMessage: ${formData.message || 'No message provided'}`,
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

    const renderField = (field, index) => {
        const commonProps = {
            name: field.name,
            value: formData[field.name] || '',
            onChange: handleInputChange,
            required: field.required,
            placeholder: field.placeholder,
            className: "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        };

        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        {...commonProps}
                        rows={4}
                    />
                );
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Select an option</option>
                        {field.options?.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                        ))}
                    </select>
                );
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, idx) => (
                            <label key={idx} className="flex items-center">
                                <input
                                    type="checkbox"
                                    name={field.name}
                                    value={option}
                                    checked={formData[field.name]?.includes(option) || false}
                                    onChange={(e) => {
                                        const currentValues = formData[field.name] || [];
                                        const newValues = e.target.checked
                                            ? [...currentValues, option]
                                            : currentValues.filter(v => v !== option);
                                        setFormData({ ...formData, [field.name]: newValues });
                                    }}
                                    className="mr-2"
                                />
                                <span style={{ color: textColor }}>{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, idx) => (
                            <label key={idx} className="flex items-center">
                                <input
                                    type="radio"
                                    name={field.name}
                                    value={option}
                                    checked={formData[field.name] === option}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <span style={{ color: textColor }}>{option}</span>
                            </label>
                        ))}
                    </div>
                );
            default:
                return <input type={field.type} {...commonProps} />;
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
            <div className="max-w-2xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2
                        className="text-4xl font-bold mb-4"
                        style={{ color: textColor }}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p
                            className="text-xl opacity-75"
                            style={{ color: textColor }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {formConfig.fields.map((field, index) => (
                            <div key={index}>
                                <label
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: textColor }}
                                >
                                    {field.label} {field.required && '*'}
                                </label>
                                {renderField(field, index)}
                            </div>
                        ))}

                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={submitting || isBuilder}
                                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        {formConfig.submitText}
                                        <Send className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </BaseSection>
    );
};

export default FormSection;

