import React, { useState } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Settings, Eye, EyeOff } from 'lucide-react';

const FormBuilder = ({ formConfig, onChange, isBuilder = false }) => {
    const [selectedField, setSelectedField] = useState(null);

    const fieldTypes = [
        { value: 'text', label: 'Text Input', icon: '📝' },
        { value: 'email', label: 'Email', icon: '📧' },
        { value: 'tel', label: 'Phone', icon: '📞' },
        { value: 'textarea', label: 'Text Area', icon: '📄' },
        { value: 'select', label: 'Dropdown', icon: '📋' },
        { value: 'checkbox', label: 'Checkbox', icon: '☑️' },
        { value: 'radio', label: 'Radio Button', icon: '🔘' },
        { value: 'number', label: 'Number', icon: '🔢' },
        { value: 'date', label: 'Date', icon: '📅' }
    ];

    const addField = (type) => {
        const newField = {
            id: `field_${Date.now()}`,
            name: `field_${type}_${Date.now()}`,
            type: type,
            label: `New ${fieldTypes.find(ft => ft.value === type)?.label || 'Field'}`,
            placeholder: '',
            required: false,
            options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : []
        };

        const updatedFields = [...(formConfig.fields || []), newField];
        onChange({
            ...formConfig,
            fields: updatedFields
        });
        setSelectedField(newField);
    };

    const updateField = (fieldId, updates) => {
        const updatedFields = (formConfig.fields || []).map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
        );
        onChange({
            ...formConfig,
            fields: updatedFields
        });
    };

    const deleteField = (fieldId) => {
        const updatedFields = (formConfig.fields || []).filter(field => field.id !== fieldId);
        onChange({
            ...formConfig,
            fields: updatedFields
        });
        if (selectedField?.id === fieldId) {
            setSelectedField(null);
        }
    };

    const moveField = (fieldId, direction) => {
        const fields = [...(formConfig.fields || [])];
        const index = fields.findIndex(field => field.id === fieldId);

        if (direction === 'up' && index > 0) {
            [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
        } else if (direction === 'down' && index < fields.length - 1) {
            [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
        }

        onChange({
            ...formConfig,
            fields
        });
    };

    const addOption = (fieldId) => {
        const field = (formConfig.fields || []).find(f => f.id === fieldId);
        if (field) {
            const newOptions = [...(field.options || []), `Option ${(field.options || []).length + 1}`];
            updateField(fieldId, { options: newOptions });
        }
    };

    const updateOption = (fieldId, optionIndex, value) => {
        const field = (formConfig.fields || []).find(f => f.id === fieldId);
        if (field) {
            const newOptions = [...(field.options || [])];
            newOptions[optionIndex] = value;
            updateField(fieldId, { options: newOptions });
        }
    };

    const removeOption = (fieldId, optionIndex) => {
        const field = (formConfig.fields || []).find(f => f.id === fieldId);
        if (field) {
            const newOptions = (field.options || []).filter((_, index) => index !== optionIndex);
            updateField(fieldId, { options: newOptions });
        }
    };

    const renderFieldPreview = (field) => {
        const commonProps = {
            placeholder: field.placeholder,
            required: field.required,
            className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        };

        switch (field.type) {
            case 'textarea':
                return <textarea {...commonProps} rows={3} disabled />;
            case 'select':
                return (
                    <select {...commonProps} disabled>
                        <option value="">Select an option</option>
                        {field.options?.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                );
            case 'checkbox':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, index) => (
                            <label key={index} className="flex items-center">
                                <input type="checkbox" disabled className="mr-2" />
                                <span className="text-sm text-gray-600">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option, index) => (
                            <label key={index} className="flex items-center">
                                <input type="radio" name={field.name} disabled className="mr-2" />
                                <span className="text-sm text-gray-600">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            default:
                return <input type={field.type} {...commonProps} disabled />;
        }
    };

    return (
        <div className="flex h-full">
            {/* Field Library */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Fields</h3>
                <div className="space-y-2">
                    {fieldTypes.map((fieldType) => (
                        <button
                            key={fieldType.value}
                            onClick={() => addField(fieldType.value)}
                            className="w-full flex items-center p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                        >
                            <span className="text-2xl mr-3">{fieldType.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Builder */}
            <div className="flex-1 flex">
                {/* Form Preview */}
                <div className="flex-1 p-6">
                    <div className="max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Preview</h3>
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <form className="space-y-6">
                                {(formConfig.fields || []).map((field) => (
                                    <div key={field.id} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {field.label} {field.required && '*'}
                                        </label>
                                        {renderFieldPreview(field)}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {formConfig.submitText || 'Submit'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Field List */}
                <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Fields</h3>
                    <div className="space-y-2">
                        {(formConfig.fields || []).map((field, index) => (
                            <div
                                key={field.id}
                                className={`p-3 border rounded-lg cursor-pointer ${selectedField?.id === field.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => setSelectedField(field)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-lg mr-2">
                                            {fieldTypes.find(ft => ft.value === field.type)?.icon || '📝'}
                                        </span>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {field.label}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {fieldTypes.find(ft => ft.value === field.type)?.label || field.type}
                                                {field.required && ' • Required'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveField(field.id, 'up');
                                            }}
                                            disabled={index === 0}
                                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                        >
                                            <MoveUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveField(field.id, 'down');
                                            }}
                                            disabled={index === (formConfig.fields || []).length - 1}
                                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                        >
                                            <MoveDown className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteField(field.id);
                                            }}
                                            className="p-1 hover:bg-red-100 rounded text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Field Editor */}
            {selectedField && (
                <div className="w-80 bg-white border-l border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Field Label
                            </label>
                            <input
                                type="text"
                                value={selectedField.label}
                                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Field Name
                            </label>
                            <input
                                type="text"
                                value={selectedField.name}
                                onChange={(e) => updateField(selectedField.id, { name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Placeholder
                            </label>
                            <input
                                type="text"
                                value={selectedField.placeholder}
                                onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="required"
                                checked={selectedField.required}
                                onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                className="mr-2"
                            />
                            <label htmlFor="required" className="text-sm text-gray-700">
                                Required field
                            </label>
                        </div>

                        {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Options
                                </label>
                                <div className="space-y-2">
                                    {(selectedField.options || []).map((option, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => updateOption(selectedField.id, index, e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={() => removeOption(selectedField.id, index)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addOption(selectedField.id)}
                                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400"
                                    >
                                        Add Option
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormBuilder;

