import React, { useState, useEffect } from 'react';
import { X, Save, Palette, Type, Layout, Settings, Eye, EyeOff, Database, Plus, Trash2, Edit3 } from 'lucide-react';
import FormBuilder from './FormBuilder';
import SectionDataEditor from './SectionDataEditor';

const SectionEditor = ({ section, onClose, onSave }) => {
    const [formData, setFormData] = useState(section);
    const [activeTab, setActiveTab] = useState('content');
    const [showDataEditor, setShowDataEditor] = useState(false);

    useEffect(() => {
        setFormData(section);
    }, [section]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedInputChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleArrayInputChange = (parent, index, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: prev[parent].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }));
    };

    const addArrayItem = (parent, newItem) => {
        setFormData(prev => ({
            ...prev,
            [parent]: [...(prev[parent] || []), newItem]
        }));
    };

    const removeArrayItem = (parent, index) => {
        setFormData(prev => ({
            ...prev,
            [parent]: prev[parent].filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const renderContentTab = () => {
        switch (formData.type) {
            case 'hero':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter hero title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle || ''}
                                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter hero subtitle"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CTA Text
                            </label>
                            <input
                                type="text"
                                value={formData.ctaText || ''}
                                onChange={(e) => handleInputChange('ctaText', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter CTA button text"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CTA Link
                            </label>
                            <input
                                type="text"
                                value={formData.ctaLink || ''}
                                onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter CTA link URL"
                            />
                        </div>
                    </div>
                );

            case 'features':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Why Choose Us"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle || ''}
                                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Discover what makes us different"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Features</h3>
                                <button
                                    onClick={() => addArrayItem('features', {
                                        title: '',
                                        description: '',
                                        icon: 'star',
                                        id: Date.now()
                                    })}
                                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Feature
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(formData.features || []).map((feature, index) => (
                                    <div key={feature.id || index} className="border border-gray-200 rounded-lg p-4">
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
                                                <label className="block text-xs text-gray-600 mb-1">Title</label>
                                                <input
                                                    type="text"
                                                    value={feature.title || ''}
                                                    onChange={(e) => handleArrayInputChange('features', index, 'title', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Premium Properties"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Icon</label>
                                                <input
                                                    type="text"
                                                    value={feature.icon || ''}
                                                    onChange={(e) => handleArrayInputChange('features', index, 'icon', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., star, home, check"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Description</label>
                                                <input
                                                    type="text"
                                                    value={feature.description || ''}
                                                    onChange={(e) => handleArrayInputChange('features', index, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Handpicked properties in prime locations"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'faq':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Frequently Asked Questions"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle || ''}
                                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Find answers to common questions"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">FAQ Items</h3>
                                <button
                                    onClick={() => addArrayItem('faqItems', {
                                        question: '',
                                        answer: '',
                                        id: Date.now()
                                    })}
                                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add FAQ
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(formData.faqItems || []).map((item, index) => (
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
                                                <label className="block text-xs text-gray-600 mb-1">Question</label>
                                                <input
                                                    type="text"
                                                    value={item.question || ''}
                                                    onChange={(e) => handleArrayInputChange('faqItems', index, 'question', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., What are the payment options?"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Answer</label>
                                                <textarea
                                                    value={item.answer || ''}
                                                    onChange={(e) => handleArrayInputChange('faqItems', index, 'answer', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., We accept all major credit cards, bank transfers, and EMI options."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'testimonials':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., What Our Clients Say"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Section Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle || ''}
                                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Real experiences from satisfied customers"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Testimonials</h3>
                                <button
                                    onClick={() => addArrayItem('testimonials', {
                                        name: '',
                                        role: '',
                                        content: '',
                                        rating: 5,
                                        avatar: '',
                                        id: Date.now()
                                    })}
                                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Testimonial
                                </button>
                            </div>

                            <div className="space-y-3">
                                {(formData.testimonials || []).map((item, index) => (
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
                                                <label className="block text-xs text-gray-600 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    value={item.name || ''}
                                                    onChange={(e) => handleArrayInputChange('testimonials', index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., John Smith"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Role/Company</label>
                                                <input
                                                    type="text"
                                                    value={item.role || ''}
                                                    onChange={(e) => handleArrayInputChange('testimonials', index, 'role', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., CEO, ABC Company"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs text-gray-600 mb-1">Testimonial</label>
                                                <textarea
                                                    value={item.content || ''}
                                                    onChange={(e) => handleArrayInputChange('testimonials', index, 'content', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., Excellent service and great properties..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Rating (1-5)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    value={item.rating || 5}
                                                    onChange={(e) => handleArrayInputChange('testimonials', index, 'rating', parseInt(e.target.value))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1">Avatar URL</label>
                                                <input
                                                    type="text"
                                                    value={item.avatar || ''}
                                                    onChange={(e) => handleArrayInputChange('testimonials', index, 'avatar', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Profile image URL"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter section title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content
                            </label>
                            <textarea
                                value={formData.content || ''}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter section content (HTML supported)"
                            />
                        </div>
                    </div>
                );

            case 'project-showcase':
                return (
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
                                placeholder="e.g., Bannerghatta Road, Bangalore"
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
                                placeholder="e.g., by Sobha Group"
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
                    </div>
                );

            default:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter section title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle || ''}
                                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter section subtitle"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content
                            </label>
                            <textarea
                                value={formData.content || ''}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter section content"
                            />
                        </div>
                    </div>
                );
        }
    };

    const renderDesignTab = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                </label>
                <input
                    type="color"
                    value={formData.backgroundColor || '#FFFFFF'}
                    onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                </label>
                <input
                    type="color"
                    value={formData.textColor || '#1E293B'}
                    onChange={(e) => handleInputChange('textColor', e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding
                </label>
                <input
                    type="text"
                    value={formData.padding || '2rem 0'}
                    onChange={(e) => handleInputChange('padding', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2rem 0, 1rem"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margin
                </label>
                <input
                    type="text"
                    value={formData.margin || '0'}
                    onChange={(e) => handleInputChange('margin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1rem 0, 2rem auto"
                />
            </div>
        </div>
    );

    const renderLayoutTab = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Columns
                </label>
                <select
                    value={formData.layout?.columns || 3}
                    onChange={(e) => handleNestedInputChange('layout', 'columns', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                    <option value={3}>3 Columns</option>
                    <option value={4}>4 Columns</option>
                    <option value={6}>6 Columns</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alignment
                </label>
                <select
                    value={formData.layout?.alignment || 'center'}
                    onChange={(e) => handleNestedInputChange('layout', 'alignment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spacing
                </label>
                <select
                    value={formData.layout?.spacing || 'normal'}
                    onChange={(e) => handleNestedInputChange('layout', 'spacing', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="loose">Loose</option>
                </select>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Edit {formData.type?.charAt(0).toUpperCase() + formData.type?.slice(1)} Section
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-64 bg-gray-50 border-r border-gray-200">
                        <div className="p-4">
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'content'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Type className="h-4 w-4 mr-2" />
                                    Content
                                </button>
                            </div>
                            {(formData.type === 'form' || formData.type === 'contact') && (
                                <div className="flex space-x-1 mt-1">
                                    <button
                                        onClick={() => setActiveTab('form-builder')}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'form-builder'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <Settings className="h-4 w-4 mr-2" />
                                        Form Builder
                                    </button>
                                </div>
                            )}
                            {(formData.type === 'project-showcase' || formData.type === 'faq' || formData.type === 'features' || formData.type === 'testimonials') && (
                                <div className="flex space-x-1 mt-1">
                                    <button
                                        onClick={() => setShowDataEditor(true)}
                                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        <Database className="h-4 w-4 mr-2" />
                                        Data Editor
                                    </button>
                                </div>
                            )}
                            <div className="flex space-x-1 mt-1">
                                <button
                                    onClick={() => setActiveTab('design')}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'design'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Palette className="h-4 w-4 mr-2" />
                                    Design
                                </button>
                            </div>
                            <div className="flex space-x-1 mt-1">
                                <button
                                    onClick={() => setActiveTab('layout')}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'layout'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    <Layout className="h-4 w-4 mr-2" />
                                    Layout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        {activeTab === 'content' && renderContentTab()}
                        {activeTab === 'form-builder' && (
                            <div className="h-full">
                                <FormBuilder
                                    formConfig={formData.formConfig || { fields: [] }}
                                    onFormConfigChange={(config) => handleInputChange('formConfig', config)}
                                />
                            </div>
                        )}
                        {activeTab === 'design' && renderDesignTab()}
                        {activeTab === 'layout' && renderLayoutTab()}
                    </div>
                </div>

                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <div className="flex items-center">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.isVisible !== false}
                                onChange={(e) => handleInputChange('isVisible', e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Visible on page</span>
                        </label>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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

            {/* Section Data Editor Modal */}
            {showDataEditor && (
                <SectionDataEditor
                    section={formData}
                    onSave={(updatedData) => {
                        setFormData(updatedData);
                        setShowDataEditor(false);
                    }}
                    onClose={() => setShowDataEditor(false)}
                />
            )}
        </div>
    );
};

export default SectionEditor;
