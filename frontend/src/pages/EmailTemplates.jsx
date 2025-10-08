import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Mail,
  Eye,
  Send,
  Filter,
  Search,
  Calendar,
  Users,
  Target,
  Clock,
  X,
  FileText,
  Zap,
  Activity,
  CheckCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmailTemplates = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'custom',
    variables: []
  });

  const templateTypes = [
    {
      value: 'welcome',
      label: 'Welcome',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-800',
      icon: CheckCircle
    },
    {
      value: 'follow_up',
      label: 'Follow-up',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      textColor: 'text-blue-800',
      icon: Clock
    },
    {
      value: 'appointment',
      label: 'Appointment',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-800',
      icon: Calendar
    },
    {
      value: 'property_showcase',
      label: 'Property Showcase',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'from-orange-50 to-amber-50',
      textColor: 'text-orange-800',
      icon: Target
    },
    {
      value: 'closing',
      label: 'Closing',
      color: 'from-red-500 to-pink-600',
      bgColor: 'from-red-50 to-pink-50',
      textColor: 'text-red-800',
      icon: CheckCircle
    },
    {
      value: 'custom',
      label: 'Custom',
      color: 'from-gray-500 to-slate-600',
      bgColor: 'from-gray-50 to-slate-50',
      textColor: 'text-gray-800',
      icon: FileText
    }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/email-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Fetch templates error:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/email-templates/${editingTemplate._id}`, formData);
        toast.success('Template updated successfully');
      } else {
        await api.post('/email-templates', formData);
        toast.success('Template created successfully');
      }
      setShowModal(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Save template error:', error);
      toast.error('Failed to save template');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      variables: template.variables || []
    });
    setShowModal(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/email-templates/${templateId}`);
        toast.success('Template deleted successfully');
        fetchTemplates();
      } catch (error) {
        console.error('Delete template error:', error);
        toast.error('Failed to delete template');
      }
    }
  };

  const handleDuplicate = async (templateId) => {
    try {
      await api.post(`/email-templates/${templateId}/duplicate`);
      toast.success('Template duplicated successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Duplicate template error:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      type: 'custom',
      variables: []
    });
  };

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, { name: '', description: '', defaultValue: '' }]
    });
  };

  const removeVariable = (index) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index)
    });
  };

  const updateVariable = (index, field, value) => {
    const updatedVariables = [...formData.variables];
    updatedVariables[index][field] = value;
    setFormData({
      ...formData,
      variables: updatedVariables
    });
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || template.type === filterType;
    return matchesSearch && matchesType;
  });

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

  const TemplateCard = ({ template }) => {
    const typeInfo = templateTypes.find(t => t.value === template.type);
    const TypeIcon = typeInfo?.icon || FileText;

    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${typeInfo?.color || 'from-gray-500 to-slate-600'} shadow-lg`}>
                <TypeIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {template.name}
                </h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${typeInfo?.bgColor || 'from-gray-50 to-slate-50'} ${typeInfo?.textColor || 'text-gray-800'}`}>
                  {typeInfo?.label || 'Custom'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handlePreview(template)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(template)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDuplicate(template._id)}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(template._id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Subject:</p>
              <p className="text-sm text-gray-600 truncate">{template.subject}</p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Send className="h-4 w-4 mr-1" />
                  {template.usage?.sent || 0}
                </span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {template.usage?.opened || 0}
                </span>
              </div>
              <span className="text-xs">
                {new Date(template.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading email templates...</p>
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
                Email Templates
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Create and manage email templates for your campaigns</p>
            </div>
            <button
              onClick={() => {
                setEditingTemplate(null);
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Template
            </button>
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
            title="Active Templates"
            value={templates.filter(t => t.isActive !== false).length}
            icon={Zap}
            color="green"
          />
          <StatCard
            title="Custom Templates"
            value={templates.filter(t => t.type === 'custom').length}
            icon={Edit}
            color="purple"
          />
          <StatCard
            title="Total Usage"
            value={templates.reduce((sum, t) => sum + (t.usage?.sent || 0), 0)}
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full sm:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Types</option>
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                title="Clear Filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {!filteredTemplates || filteredTemplates.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6">
              <Mail className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || filterType ? 'Try adjusting your search criteria.' : 'Get started by creating your first email template.'}
            </p>
            <button
              onClick={() => {
                setEditingTemplate(null);
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard key={template._id} template={template} />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingTemplate ? 'Edit Template' : 'Create New Template'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Template Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                        required
                      >
                        {templateTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="e.g., Welcome to {{companyName}}!"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      rows={6}
                      placeholder="Enter your email content here. Use {{variableName}} for dynamic content."
                      required
                    />
                  </div>

                  {/* Variables Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Variables
                      </label>
                      <button
                        type="button"
                        onClick={addVariable}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Variable
                      </button>
                    </div>

                    {formData.variables.map((variable, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                        <input
                          type="text"
                          placeholder="Variable name (e.g., leadName)"
                          value={variable.name}
                          onChange={(e) => updateVariable(index, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={variable.description}
                          onChange={(e) => updateVariable(index, 'description', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                        />
                        <div className="flex">
                          <input
                            type="text"
                            placeholder="Default value"
                            value={variable.defaultValue}
                            onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariable(index)}
                            className="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTemplate(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                    >
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {showPreview && previewTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl border border-white/20">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Template Preview: {previewTemplate.name}
                  </h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Subject:</p>
                    <p className="text-lg text-gray-900 font-medium">{previewTemplate.subject}</p>
                  </div>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: previewTemplate.content }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;