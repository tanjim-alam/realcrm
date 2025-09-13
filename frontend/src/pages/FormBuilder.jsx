import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Copy,
  Download,
  Settings,
  Type,
  Mail,
  Phone,
  Hash,
  List,
  CheckSquare,
  Radio,
  AlignLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const FormBuilder = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: [],
    settings: {
      submitButtonText: 'Submit',
      successMessage: 'Thank you! We will contact you soon.',
      redirectUrl: '',
      theme: 'default'
    }
  });

  const fieldTypes = [
    { value: 'text', label: 'Text Input', icon: <Type className="h-4 w-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { value: 'tel', label: 'Phone', icon: <Phone className="h-4 w-4" /> },
    { value: 'number', label: 'Number', icon: <Hash className="h-4 w-4" /> },
    { value: 'select', label: 'Dropdown', icon: <List className="h-4 w-4" /> },
    { value: 'textarea', label: 'Text Area', icon: <AlignLeft className="h-4 w-4" /> },
    { value: 'radio', label: 'Radio Buttons', icon: <Radio className="h-4 w-4" /> },
    { value: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="h-4 w-4" /> }
  ];

  const mappingOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'budget', label: 'Budget' },
    { value: 'propertyType', label: 'Property Type' },
    { value: 'location', label: 'Location' },
    { value: 'notes', label: 'Notes' },
    { value: 'custom', label: 'Custom Field' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/form-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to fetch form templates');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField = {
      name: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
      mapping: 'custom'
    };
    setFormData({
      ...formData,
      fields: [...formData.fields, newField]
    });
  };

  const updateField = (index, fieldData) => {
    const updatedFields = [...formData.fields];
    updatedFields[index] = { ...updatedFields[index], ...fieldData };
    setFormData({
      ...formData,
      fields: updatedFields
    });
  };

  const removeField = (index) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields: updatedFields
    });
  };

  const addOption = (fieldIndex) => {
    const updatedFields = [...formData.fields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options.push({ label: '', value: '' });
    setFormData({
      ...formData,
      fields: updatedFields
    });
  };

  const updateOption = (fieldIndex, optionIndex, optionData) => {
    const updatedFields = [...formData.fields];
    updatedFields[fieldIndex].options[optionIndex] = {
      ...updatedFields[fieldIndex].options[optionIndex],
      ...optionData
    };
    setFormData({
      ...formData,
      fields: updatedFields
    });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formData.fields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setFormData({
      ...formData,
      fields: updatedFields
    });
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      if (currentTemplate) {
        await api.put(`/form-templates/${currentTemplate._id}`, formData);
        toast.success('Form template updated successfully');
      } else {
        await api.post('/form-templates', formData);
        toast.success('Form template created successfully');
      }
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save form template');
    } finally {
      setSaving(false);
    }
  };

  const loadTemplate = (template) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      fields: template.fields,
      settings: template.settings
    });
  };

  const createNewTemplate = () => {
    setCurrentTemplate(null);
    setFormData({
      name: '',
      description: '',
      fields: [],
      settings: {
        submitButtonText: 'Submit',
        successMessage: 'Thank you! We will contact you soon.',
        redirectUrl: '',
        theme: 'default'
      }
    });
  };

  const generateCode = async (templateId) => {
    try {
      const response = await api.get(`/form-templates/${templateId}/generate`);
      const { htmlCode, cssCode, jsCode } = response.data;
      
      const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Form</title>
    <style>
        ${cssCode}
    </style>
</head>
<body>
    ${htmlCode}
    <script>
        ${jsCode}
    </script>
</body>
</html>`;
      
      navigator.clipboard.writeText(fullCode);
      toast.success('Form code copied to clipboard!');
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate form code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create custom lead capture forms for different landing pages
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={createNewTemplate}
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </button>
          <button
            onClick={saveTemplate}
            disabled={saving}
            className="btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template._id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentTemplate?._id === template._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-500">{template.fields.length} fields</p>
                      <p className="text-xs text-gray-400">
                        {template.usage?.totalSubmissions || 0} submissions
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        generateCode(template._id);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {!showPreview ? (
              <div className="space-y-6">
                {/* Template Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <select
                      value={formData.settings.theme}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, theme: e.target.value }
                      })}
                      className="input-field"
                    >
                      <option value="default">Default</option>
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Enter template description"
                  />
                </div>

                {/* Fields */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Form Fields</h4>
                    <button
                      onClick={addField}
                      className="btn-secondary flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Field
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.fields.map((field, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="font-medium text-gray-900">Field {index + 1}</h5>
                          <button
                            onClick={() => removeField(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Field Name
                            </label>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => updateField(index, { name: e.target.value })}
                              className="input-field"
                              placeholder="field_name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Field Label
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                              className="input-field"
                              placeholder="Field Label"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Field Type
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(index, { type: e.target.value })}
                              className="input-field"
                            >
                              {fieldTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Field Mapping
                            </label>
                            <select
                              value={field.mapping}
                              onChange={(e) => updateField(index, { mapping: e.target.value })}
                              className="input-field"
                            >
                              {mappingOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(index, { required: e.target.checked })}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Required field</span>
                          </label>
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Placeholder
                          </label>
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            className="input-field"
                            placeholder="Enter placeholder text"
                          />
                        </div>

                        {/* Options for select, radio */}
                        {(field.type === 'select' || field.type === 'radio') && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Options
                              </label>
                              <button
                                onClick={() => addOption(index)}
                                className="btn-secondary text-sm"
                              >
                                Add Option
                              </button>
                            </div>
                            <div className="space-y-2">
                              {field.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex space-x-2">
                                  <input
                                    type="text"
                                    value={option.label}
                                    onChange={(e) => updateOption(index, optionIndex, { label: e.target.value })}
                                    className="input-field flex-1"
                                    placeholder="Option Label"
                                  />
                                  <input
                                    type="text"
                                    value={option.value}
                                    onChange={(e) => updateOption(index, optionIndex, { value: e.target.value })}
                                    className="input-field flex-1"
                                    placeholder="Option Value"
                                  />
                                  <button
                                    onClick={() => removeOption(index, optionIndex)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Form Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Submit Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.settings.submitButtonText}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, submitButtonText: e.target.value }
                        })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Success Message
                      </label>
                      <input
                        type="text"
                        value={formData.settings.successMessage}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: { ...formData.settings, successMessage: e.target.value }
                        })}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Form Preview</h4>
                <div className="max-w-md mx-auto">
                  <form className="space-y-4">
                    {formData.fields.map((field, index) => (
                      <div key={index} className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' ? (
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            className="input-field"
                            disabled
                          />
                        ) : field.type === 'textarea' ? (
                          <textarea
                            placeholder={field.placeholder}
                            className="input-field"
                            rows="3"
                            disabled
                          />
                        ) : field.type === 'select' ? (
                          <select className="input-field" disabled>
                            <option>Select an option</option>
                            {field.options?.map((option, i) => (
                              <option key={i} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        ) : field.type === 'radio' ? (
                          <div className="space-y-2">
                            {field.options?.map((option, i) => (
                              <label key={i} className="flex items-center">
                                <input type="radio" name={field.name} className="mr-2" disabled />
                                {option.label}
                              </label>
                            ))}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-2" disabled />
                            {field.label}
                          </label>
                        ) : null}
                      </div>
                    ))}
                    <button type="button" className="btn-primary w-full" disabled>
                      {formData.settings.submitButtonText}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
