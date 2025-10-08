import React, { useState } from 'react';
import { Search, Edit3, Save, X } from 'lucide-react';

const BulkTextEditor = ({ sections, onUpdateSections, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingSection, setEditingSection] = useState(null);
    const [editingField, setEditingField] = useState('');
    const [editingValue, setEditingValue] = useState('');

    const filteredSections = sections.filter(section =>
        section.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startEditing = (sectionId, field, currentValue) => {
        setEditingSection(sectionId);
        setEditingField(field);
        setEditingValue(currentValue || '');
    };

    const saveEdit = () => {
        if (editingSection && editingField) {
            const updatedSections = sections.map(section =>
                section.id === editingSection
                    ? { ...section, [editingField]: editingValue }
                    : section
            );
            onUpdateSections(updatedSections);
        }
        setEditingSection(null);
        setEditingField('');
        setEditingValue('');
    };

    const cancelEdit = () => {
        setEditingSection(null);
        setEditingField('');
        setEditingValue('');
    };

    const getFieldLabel = (field) => {
        const labels = {
            title: 'Title',
            subtitle: 'Subtitle',
            content: 'Content',
            ctaText: 'CTA Text',
            ctaLink: 'CTA Link'
        };
        return labels[field] || field;
    };

    const getEditableFields = (section) => {
        const fields = [];
        if (section.title) fields.push('title');
        if (section.subtitle) fields.push('subtitle');
        if (section.content) fields.push('content');
        if (section.ctaText) fields.push('ctaText');
        if (section.ctaLink) fields.push('ctaLink');
        return fields;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Bulk Text Editor</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search sections by text content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Sections List */}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                        {filteredSections.map((section) => (
                            <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {getEditableFields(section).length} editable fields
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {getEditableFields(section).map((field) => (
                                        <div key={field} className="flex items-center space-x-3">
                                            <label className="w-24 text-sm font-medium text-gray-700">
                                                {getFieldLabel(field)}:
                                            </label>
                                            <div className="flex-1">
                                                {editingSection === section.id && editingField === field ? (
                                                    <div className="flex items-center space-x-2">
                                                        <textarea
                                                            value={editingValue}
                                                            onChange={(e) => setEditingValue(e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            rows={field === 'content' ? 3 : 1}
                                                        />
                                                        <button
                                                            onClick={saveEdit}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <span className="flex-1 text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                                            {section[field] || 'Empty'}
                                                        </span>
                                                        <button
                                                            onClick={() => startEditing(section.id, field, section[field])}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredSections.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No sections found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkTextEditor;

