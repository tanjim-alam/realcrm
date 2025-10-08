import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Edit3 } from 'lucide-react';

const SectionDataEditor = ({ section, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        ...section,
        // Initialize nested objects if they don't exist
        projectDetails: section.projectDetails || {},
        contactInfo: section.contactInfo || {},
        faqItems: section.faqItems || [],
        features: section.features || [],
        testimonials: section.testimonials || [],
        teamMembers: section.teamMembers || [],
        stats: section.stats || [],
        properties: section.properties || [],
        formConfig: section.formConfig || { fields: [] }
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedInputChange = (parentField, childField, value) => {
        setFormData(prev => ({
            ...prev,
            [parentField]: {
                ...prev[parentField],
                [childField]: value
            }
        }));
    };

    const handleArrayItemChange = (arrayField, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [arrayField]: prev[arrayField].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addArrayItem = (arrayField, defaultItem) => {
        setFormData(prev => ({
            ...prev,
            [arrayField]: [...prev[arrayField], { ...defaultItem, id: Date.now() }]
        }));
    };

    const removeArrayItem = (arrayField, index) => {
        setFormData(prev => ({
            ...prev,
            [arrayField]: prev[arrayField].filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const renderProjectShowcaseEditor = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title
                </label>
                <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Sobha Magnus"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                </label>
                <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bannerghatta Road, South Bangalore"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Developer
                </label>
                <input
                    type="text"
                    value={formData.developer || ''}
                    onChange={(e) => handleInputChange('developer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., by Sobha Limited"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                </label>
                <textarea
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed project description..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Total Units</label>
                        <input
                            type="text"
                            value={formData.projectDetails?.totalUnits || ''}
                            onChange={(e) => handleNestedInputChange('projectDetails', 'totalUnits', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 294"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Land Area</label>
                        <input
                            type="text"
                            value={formData.projectDetails?.landArea || ''}
                            onChange={(e) => handleNestedInputChange('projectDetails', 'landArea', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 4 Acres"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Unit Types</label>
                        <input
                            type="text"
                            value={formData.projectDetails?.unitTypes || ''}
                            onChange={(e) => handleNestedInputChange('projectDetails', 'unitTypes', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 3 & 4 BHK"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Starting Price</label>
                        <input
                            type="text"
                            value={formData.projectDetails?.startingPrice || ''}
                            onChange={(e) => handleNestedInputChange('projectDetails', 'startingPrice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., ₹.."
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Phone</label>
                        <input
                            type="text"
                            value={formData.contactInfo?.phone || ''}
                            onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., +91(IND) +971(UAE) +44(UK) +1(USA)"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">WhatsApp</label>
                        <input
                            type="text"
                            value={formData.contactInfo?.whatsapp || ''}
                            onChange={(e) => handleNestedInputChange('contactInfo', 'whatsapp', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., +919380660766"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFaqEditor = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">FAQ Items</h3>
                <button
                    onClick={() => addArrayItem('faqItems', { question: '', answer: '' })}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                </button>
            </div>

            <div className="space-y-4">
                {formData.faqItems.map((item, index) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">FAQ #{index + 1}</span>
                            <button
                                onClick={() => removeArrayItem('faqItems', index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Question
                                </label>
                                <input
                                    type="text"
                                    value={item.question || ''}
                                    onChange={(e) => handleArrayItemChange('faqItems', index, 'question', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter question..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Answer
                                </label>
                                <textarea
                                    value={item.answer || ''}
                                    onChange={(e) => handleArrayItemChange('faqItems', index, 'answer', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter answer..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFeaturesEditor = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Features</h3>
                <button
                    onClick={() => addArrayItem('features', { title: '', description: '', icon: 'star' })}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                </button>
            </div>

            <div className="space-y-4">
                {formData.features.map((item, index) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Feature #{index + 1}</span>
                            <button
                                onClick={() => removeArrayItem('features', index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={item.title || ''}
                                    onChange={(e) => handleArrayItemChange('features', index, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Feature title..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Icon
                                </label>
                                <input
                                    type="text"
                                    value={item.icon || ''}
                                    onChange={(e) => handleArrayItemChange('features', index, 'icon', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., star, home, check"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={item.description || ''}
                                    onChange={(e) => handleArrayItemChange('features', index, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Feature description..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTestimonialsEditor = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Testimonials</h3>
                <button
                    onClick={() => addArrayItem('testimonials', {
                        name: '',
                        role: '',
                        content: '',
                        rating: 5,
                        avatar: ''
                    })}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Testimonial
                </button>
            </div>

            <div className="space-y-4">
                {formData.testimonials.map((item, index) => (
                    <div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">Testimonial #{index + 1}</span>
                            <button
                                onClick={() => removeArrayItem('testimonials', index)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={item.name || ''}
                                    onChange={(e) => handleArrayItemChange('testimonials', index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Customer name..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role/Company
                                </label>
                                <input
                                    type="text"
                                    value={item.role || ''}
                                    onChange={(e) => handleArrayItemChange('testimonials', index, 'role', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., CEO, ABC Company"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Testimonial
                                </label>
                                <textarea
                                    value={item.content || ''}
                                    onChange={(e) => handleArrayItemChange('testimonials', index, 'content', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Customer testimonial..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating (1-5)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={item.rating || 5}
                                    onChange={(e) => handleArrayItemChange('testimonials', index, 'rating', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Avatar URL
                                </label>
                                <input
                                    type="text"
                                    value={item.avatar || ''}
                                    onChange={(e) => handleArrayItemChange('testimonials', index, 'avatar', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Profile image URL..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContentEditor = () => {
        switch (section.type) {
            case 'project-showcase':
                return renderProjectShowcaseEditor();
            case 'faq':
                return renderFaqEditor();
            case 'features':
                return renderFeaturesEditor();
            case 'testimonials':
                return renderTestimonialsEditor();
            default:
                return (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No specific data editor available for this section type.</p>
                        <p className="text-sm text-gray-400 mt-2">Use the general content editor instead.</p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Edit {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Data
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {renderContentEditor()}
                </div>

                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SectionDataEditor;

