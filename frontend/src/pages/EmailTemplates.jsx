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
  Clock
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
    { value: 'welcome', label: 'Welcome', color: 'bg-green-100 text-green-800' },
    { value: 'follow_up', label: 'Follow-up', color: 'bg-blue-100 text-blue-800' },
    { value: 'appointment', label: 'Appointment', color: 'bg-purple-100 text-purple-800' },
    { value: 'property_showcase', label: 'Property Showcase', color: 'bg-orange-100 text-orange-800' },
    { value: 'closing', label: 'Closing', color: 'bg-red-100 text-red-800' },
    { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800' }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-gray-600">Create and manage email templates for your campaigns</p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="">All Types</option>
            {templateTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {template.name}
                </h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${templateTypes.find(t => t.value === template.type)?.color}`}>
                  {templateTypes.find(t => t.value === template.type)?.label}
                </span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePreview(template)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDuplicate(template._id)}
                  className="text-green-600 hover:text-green-800"
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(template._id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Subject:</p>
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
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType ? 'Try adjusting your search criteria.' : 'Get started by creating a new template.'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input-field"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Welcome to {{companyName}}!"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="input-field"
                    rows={10}
                    placeholder="Enter your email content here. Use {{variableName}} for dynamic content."
                    required
                  />
                </div>

                {/* Variables Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Variables
                    </label>
                    <button
                      type="button"
                      onClick={addVariable}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Variable
                    </button>
                  </div>
                  
                  {formData.variables.map((variable, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <input
                        type="text"
                        placeholder="Variable name (e.g., leadName)"
                        value={variable.name}
                        onChange={(e) => updateVariable(index, 'name', e.target.value)}
                        className="input-field"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={variable.description}
                        onChange={(e) => updateVariable(index, 'description', e.target.value)}
                        className="input-field"
                      />
                      <div className="flex">
                        <input
                          type="text"
                          placeholder="Default value"
                          value={variable.defaultValue}
                          onChange={(e) => updateVariable(index, 'defaultValue', e.target.value)}
                          className="input-field flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariable(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Template Preview: {previewTemplate.name}
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Subject:</p>
                  <p className="text-sm text-gray-900">{previewTemplate.subject}</p>
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
  );
};

export default EmailTemplates;
