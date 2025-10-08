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
  AlignLeft,
  X,
  Edit,
  Play,
  Code,
  Palette,
  Zap,
  Activity,
  FileText,
  Layers,
  GripVertical,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const FormBuilder = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

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
    {
      value: 'text',
      label: 'Text Input',
      icon: Type,
      color: 'from-blue-500 to-blue-600',
      description: 'Single line text input'
    },
    {
      value: 'email',
      label: 'Email',
      icon: Mail,
      color: 'from-green-500 to-green-600',
      description: 'Email address input with validation'
    },
    {
      value: 'tel',
      label: 'Phone',
      icon: Phone,
      color: 'from-purple-500 to-purple-600',
      description: 'Phone number input'
    },
    {
      value: 'number',
      label: 'Number',
      icon: Hash,
      color: 'from-orange-500 to-orange-600',
      description: 'Numeric input field'
    },
    {
      value: 'select',
      label: 'Dropdown',
      icon: List,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Dropdown selection menu'
    },
    {
      value: 'textarea',
      label: 'Text Area',
      icon: AlignLeft,
      color: 'from-pink-500 to-pink-600',
      description: 'Multi-line text input'
    },
    {
      value: 'radio',
      label: 'Radio Buttons',
      icon: Radio,
      color: 'from-teal-500 to-teal-600',
      description: 'Single choice selection'
    },
    {
      value: 'checkbox',
      label: 'Checkbox',
      icon: CheckSquare,
      color: 'from-red-500 to-red-600',
      description: 'Multiple choice selection'
    }
  ];

  const mappingOptions = [
    { value: 'name', label: 'Name', icon: Type },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Phone', icon: Phone },
    { value: 'budget', label: 'Budget', icon: Hash },
    { value: 'propertyType', label: 'Property Type', icon: Layers },
    { value: 'location', label: 'Location', icon: MapPin },
    { value: 'notes', label: 'Notes', icon: FileText },
    { value: 'custom', label: 'Custom Field', icon: Settings }
  ];

  const themes = [
    { value: 'default', label: 'Default', color: 'from-gray-500 to-gray-600' },
    { value: 'modern', label: 'Modern', color: 'from-blue-500 to-indigo-600' },
    { value: 'minimal', label: 'Minimal', color: 'from-slate-500 to-slate-600' },
    { value: 'luxury', label: 'Luxury', color: 'from-amber-500 to-yellow-600' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [formData, autoSave, hasChanges]);

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
    setHasChanges(true);
  };

  const updateField = (index, fieldData) => {
    const updatedFields = [...formData.fields];
    updatedFields[index] = { ...updatedFields[index], ...fieldData };
    setFormData({
      ...formData,
      fields: updatedFields
    });
    setHasChanges(true);
  };

  const removeField = (index) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fields: updatedFields
    });
    setHasChanges(true);
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
    setHasChanges(true);
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
    setHasChanges(true);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formData.fields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setFormData({
      ...formData,
      fields: updatedFields
    });
    setHasChanges(true);
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
      setHasChanges(false);
      setLastSaved(new Date());
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save form template');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (hasChanges) {
      try {
        if (currentTemplate) {
          await api.put(`/form-templates/${currentTemplate._id}`, formData);
        } else {
          await api.post('/form-templates', formData);
        }
        setHasChanges(false);
        setLastSaved(new Date());
        toast.success('Form auto-saved!', { duration: 2000 });
      } catch (error) {
        console.error('Auto-save error:', error);
        toast.error('Auto-save failed');
      }
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
    setHasChanges(false);
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
    setHasChanges(false);
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

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  };

  const FieldTypeCard = ({ fieldType, onClick }) => {
    const Icon = fieldType.icon;
    return (
      <div
        onClick={onClick}
        className="bg-white/70 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${fieldType.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {fieldType.label}
            </h4>
            <p className="text-xs text-gray-500">{fieldType.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const TemplateCard = ({ template, isActive, onClick, onGenerateCode }) => (
    <div
      onClick={onClick}
      className={`bg-white/70 backdrop-blur-lg rounded-xl p-4 border transition-all duration-300 cursor-pointer group ${isActive
        ? 'border-blue-500 shadow-xl transform -translate-y-1'
        : 'border-white/20 hover:shadow-xl hover:transform hover:-translate-y-1'
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {template.name}
            </h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">{template.description || 'No description'}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span className="flex items-center">
              <Layers className="h-3 w-3 mr-1" />
              {template.fields.length} fields
            </span>
            <span className="flex items-center">
              <Activity className="h-3 w-3 mr-1" />
              {template.usage?.totalSubmissions || 0} submissions
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGenerateCode(template._id);
          }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Generate Code"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Form Builder
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Create custom lead capture forms for different landing pages</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
                  Auto-save
                </label>
              </div>
              {lastSaved && (
                <div className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={createNewTemplate}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </button>
              <button
                onClick={saveTemplate}
                disabled={saving || !hasChanges}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center"
              >
                {saving ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Templates"
            value={templates.length}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Active Fields"
            value={formData.fields.length}
            icon={Layers}
            color="green"
          />
          <StatCard
            title="Total Submissions"
            value={templates.reduce((sum, t) => sum + (t.usage?.totalSubmissions || 0), 0)}
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Auto-save"
            value={autoSave ? 'Enabled' : 'Disabled'}
            icon={Zap}
            color={autoSave ? 'green' : 'gray'}
            subtitle={hasChanges ? 'Changes pending' : 'Up to date'}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-gray-900">Form Templates</h3>
                  <p className="text-sm text-gray-600">{templates.length} templates available</p>
                </div>
              </div>

              <div className="space-y-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    template={template}
                    isActive={currentTemplate?._id === template._id}
                    onClick={() => loadTemplate(template)}
                    onGenerateCode={generateCode}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Form Builder */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentTemplate ? 'Edit Template' : 'Create New Template'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formData.fields.length} fields • {formData.settings.theme} theme
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!showPreview ? (
                  <div className="space-y-8">
                    {/* Template Info */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Template Information
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Template Name *
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              setHasChanges(true);
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                            placeholder="Enter template name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Theme
                          </label>
                          <select
                            value={formData.settings.theme}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                settings: { ...formData.settings, theme: e.target.value }
                              });
                              setHasChanges(true);
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                          >
                            {themes.map(theme => (
                              <option key={theme.value} value={theme.value}>
                                {theme.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            setHasChanges(true);
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                          rows="3"
                          placeholder="Enter template description"
                        />
                      </div>
                    </div>

                    {/* Field Types */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Layers className="h-5 w-5 mr-2 text-green-600" />
                          Form Fields
                        </h4>
                        <button
                          onClick={addField}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Field
                        </button>
                      </div>

                      {/* Field Type Palette */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <h5 className="text-sm font-semibold text-gray-700 mb-3">Field Types</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {fieldTypes.map((fieldType) => (
                            <FieldTypeCard
                              key={fieldType.value}
                              fieldType={fieldType}
                              onClick={() => {
                                const newField = {
                                  name: `field_${Date.now()}`,
                                  label: fieldType.label,
                                  type: fieldType.value,
                                  required: false,
                                  placeholder: '',
                                  options: [],
                                  mapping: 'custom'
                                };
                                setFormData({
                                  ...formData,
                                  fields: [...formData.fields, newField]
                                });
                                setHasChanges(true);
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Fields List */}
                      <div className="space-y-4">
                        {formData.fields.map((field, index) => (
                          <div key={index} className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                                  {React.createElement(fieldTypes.find(t => t.value === field.type)?.icon || Type, { className: "h-4 w-4 text-white" })}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900">Field {index + 1}</h5>
                                  <p className="text-sm text-gray-500">{fieldTypes.find(t => t.value === field.type)?.label}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeField(index)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Field Name
                                </label>
                                <input
                                  type="text"
                                  value={field.name}
                                  onChange={(e) => updateField(index, { name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                  placeholder="field_name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Field Label
                                </label>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => updateField(index, { label: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                  placeholder="Field Label"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Field Type
                                </label>
                                <select
                                  value={field.type}
                                  onChange={(e) => updateField(index, { type: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                >
                                  {fieldTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                  Field Mapping
                                </label>
                                <select
                                  value={field.mapping}
                                  onChange={(e) => updateField(index, { mapping: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
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
                              <label className="flex items-center p-3 bg-white/50 rounded-lg border border-gray-200 hover:bg-white/70 transition-all duration-200">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => updateField(index, { required: e.target.checked })}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <div className="ml-3">
                                  <span className="text-sm font-medium text-gray-700">Required field</span>
                                  <p className="text-xs text-gray-500">User must fill this field</p>
                                </div>
                              </label>
                            </div>

                            <div className="mt-4">
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Placeholder
                              </label>
                              <input
                                type="text"
                                value={field.placeholder}
                                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                placeholder="Enter placeholder text"
                              />
                            </div>

                            {/* Options for select, radio */}
                            {(field.type === 'select' || field.type === 'radio') && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Options
                                  </label>
                                  <button
                                    onClick={() => addOption(index)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
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
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                        placeholder="Option Label"
                                      />
                                      <input
                                        type="text"
                                        value={option.value}
                                        onChange={(e) => updateOption(index, optionIndex, { value: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                        placeholder="Option Value"
                                      />
                                      <button
                                        onClick={() => removeOption(index, optionIndex)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
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
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-purple-600" />
                        Form Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Submit Button Text
                          </label>
                          <input
                            type="text"
                            value={formData.settings.submitButtonText}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                settings: { ...formData.settings, submitButtonText: e.target.value }
                              });
                              setHasChanges(true);
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Success Message
                          </label>
                          <input
                            type="text"
                            value={formData.settings.successMessage}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                settings: { ...formData.settings, successMessage: e.target.value }
                              });
                              setHasChanges(true);
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-green-600" />
                      Form Preview
                    </h4>
                    <div className="max-w-md mx-auto">
                      <form className="space-y-6">
                        {formData.fields.map((field, index) => (
                          <div key={index} className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number' ? (
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                disabled
                              />
                            ) : field.type === 'textarea' ? (
                              <textarea
                                placeholder={field.placeholder}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                                rows="3"
                                disabled
                              />
                            ) : field.type === 'select' ? (
                              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200" disabled>
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
                                    <span className="text-sm text-gray-700">{option.label}</span>
                                  </label>
                                ))}
                              </div>
                            ) : field.type === 'checkbox' ? (
                              <label className="flex items-center">
                                <input type="checkbox" className="mr-2" disabled />
                                <span className="text-sm text-gray-700">{field.label}</span>
                              </label>
                            ) : null}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                          disabled
                        >
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
      </div>
    </div>
  );
};

export default FormBuilder;