import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Eye,
  Users,
  Target,
  Clock,
  TrendingUp,
  Mail,
  Filter,
  Search,
  Calendar,
  BarChart3,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmailCampaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    recipients: {
      type: 'all_leads',
      filters: {
        status: [],
        source: [],
        priority: [],
        assignedTo: []
      },
      leadIds: []
    },
    schedule: {
      sendAt: '',
      timezone: 'UTC'
    }
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'sending', label: 'Sending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'sent', label: 'Sent', color: 'bg-green-100 text-green-800' },
    { value: 'paused', label: 'Paused', color: 'bg-orange-100 text-orange-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  const recipientTypes = [
    { value: 'all_leads', label: 'All Leads' },
    { value: 'specific_leads', label: 'Specific Leads' },
    { value: 'leads_by_status', label: 'Leads by Status' },
    { value: 'leads_by_source', label: 'Leads by Source' },
    { value: 'leads_by_priority', label: 'Leads by Priority' }
  ];

  const leadStatuses = ['new', 'contacted', 'visit', 'offer', 'closed', 'lost'];
  const leadPriorities = ['hot', 'warm', 'cold'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, templatesRes, leadsRes, agentsRes] = await Promise.all([
        api.get('/email-campaigns'),
        api.get('/email-templates'),
        api.get('/leads'),
        api.get('/admin/users')
      ]);

      setCampaigns(campaignsRes.data.campaigns || campaignsRes.data);
      setTemplates(templatesRes.data);
      // Handle leads data structure - it might be wrapped in an object or be an array directly
      const leadsData = Array.isArray(leadsRes.data) ? leadsRes.data : (leadsRes.data.leads || leadsRes.data);
      console.log('Leads data structure:', leadsRes.data);
      console.log('Processed leads data:', leadsData);
      setLeads(leadsData || []);
      setAgents(agentsRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await api.put(`/email-campaigns/${editingCampaign._id}`, formData);
        toast.success('Campaign updated successfully');
      } else {
        await api.post('/email-campaigns', formData);
        toast.success('Campaign created successfully');
      }
      setShowModal(false);
      setEditingCampaign(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Save campaign error:', error);
      toast.error('Failed to save campaign');
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || '',
      templateId: campaign.templateId._id,
      recipients: campaign.recipients,
      schedule: campaign.schedule || { sendAt: '', timezone: 'UTC' }
    });
    setShowModal(true);
  };

  const handleDelete = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.delete(`/email-campaigns/${campaignId}`);
        toast.success('Campaign deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Delete campaign error:', error);
        toast.error('Failed to delete campaign');
      }
    }
  };

  const handleSend = async (campaignId) => {
    if (window.confirm('Are you sure you want to send this campaign?')) {
      try {
        // Find the campaign to get its recipient settings
        const campaign = campaigns.find(c => c._id === campaignId);
        if (!campaign) {
          toast.error('Campaign not found');
          return;
        }

        // Prepare selected lead IDs based on campaign recipient settings
        let selectedLeadIds = [];
        
        if (campaign.recipients.type === 'specific_leads' && campaign.recipients.leadIds) {
          selectedLeadIds = campaign.recipients.leadIds;
        } else if (campaign.recipients.type === 'leads_by_status' && campaign.recipients.filters.status.length > 0) {
          // Filter leads by status
          selectedLeadIds = (leads || [])
            .filter(lead => campaign.recipients.filters.status.includes(lead.status))
            .map(lead => lead._id);
        } else if (campaign.recipients.type === 'leads_by_source' && campaign.recipients.filters.source.length > 0) {
          // Filter leads by source
          selectedLeadIds = (leads || [])
            .filter(lead => campaign.recipients.filters.source.includes(lead.source))
            .map(lead => lead._id);
        } else if (campaign.recipients.type === 'leads_by_priority' && campaign.recipients.filters.priority.length > 0) {
          // Filter leads by priority
          selectedLeadIds = (leads || [])
            .filter(lead => campaign.recipients.filters.priority.includes(lead.priority))
            .map(lead => lead._id);
        }
        // For 'all_leads', selectedLeadIds remains empty and backend will send to all

        const response = await api.post(`/email-campaigns/${campaignId}/send`, {
          selectedLeadIds: selectedLeadIds
        });
        toast.success(`Campaign sent successfully! Sent to ${response.data.sent} recipients`);
        fetchData();
      } catch (error) {
        console.error('Send campaign error:', error);
        toast.error('Failed to send campaign');
      }
    }
  };

  const handleViewStats = async (campaign) => {
    try {
      const response = await api.get(`/email-campaigns/${campaign._id}/stats`);
      setCampaignStats(response.data);
      setSelectedCampaign(campaign);
      setShowStats(true);
    } catch (error) {
      console.error('Get campaign stats error:', error);
      toast.error('Failed to load campaign stats');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      templateId: '',
      recipients: {
        type: 'all_leads',
        filters: {
          status: [],
          source: [],
          priority: [],
          assignedTo: []
        },
        leadIds: []
      },
      schedule: {
        sendAt: '',
        timezone: 'UTC'
      }
    });
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getUniqueSources = () => {
    const sources = (leads || []).map(lead => lead.source).filter(Boolean);
    return [...new Set(sources)];
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Create and manage email campaigns for your leads</p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-field"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      {campaign.description && (
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.templateId?.name}</div>
                    <div className="text-sm text-gray-500">{campaign.templateId?.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.stats?.totalRecipients || 0}</div>
                    <div className="text-sm text-gray-500">{campaign.recipients?.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      statusOptions.find(s => s.value === campaign.status)?.color
                    }`}>
                      {statusOptions.find(s => s.value === campaign.status)?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Send className="h-4 w-4 mr-1" />
                        {campaign.stats?.sent || 0}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {campaign.stats?.opened || 0}
                      </span>
                      <span className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {campaign.stats?.clicked || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewStats(campaign)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Stats"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      {campaign.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSend(campaign._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Send"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus ? 'Try adjusting your search criteria.' : 'Get started by creating a new campaign.'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
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
                      Template *
                    </label>
                    <select
                      value={formData.templateId}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Select Template</option>
                      {templates.map(template => (
                        <option key={template._id} value={template._id}>
                          {template.name} ({template.type})
                        </option>
                      ))}
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
                    rows={3}
                    placeholder="Optional campaign description"
                  />
                </div>

                {/* Recipients Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipients *
                  </label>
                  <select
                    value={formData.recipients.type}
                    onChange={(e) => setFormData({
                      ...formData,
                      recipients: { ...formData.recipients, type: e.target.value }
                    })}
                    className="input-field"
                    required
                  >
                    {recipientTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {/* Filter options based on recipient type */}
                  {formData.recipients.type === 'leads_by_status' && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Statuses
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {leadStatuses.map(status => (
                          <label key={status} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.recipients.filters.status.includes(status)}
                              onChange={(e) => {
                                const newStatuses = e.target.checked
                                  ? [...formData.recipients.filters.status, status]
                                  : formData.recipients.filters.status.filter(s => s !== status);
                                setFormData({
                                  ...formData,
                                  recipients: {
                                    ...formData.recipients,
                                    filters: { ...formData.recipients.filters, status: newStatuses }
                                  }
                                });
                              }}
                              className="mr-1"
                            />
                            <span className="text-sm text-gray-700 capitalize">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.recipients.type === 'leads_by_source' && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Sources
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getUniqueSources().map(source => (
                          <label key={source} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.recipients.filters.source.includes(source)}
                              onChange={(e) => {
                                const newSources = e.target.checked
                                  ? [...formData.recipients.filters.source, source]
                                  : formData.recipients.filters.source.filter(s => s !== source);
                                setFormData({
                                  ...formData,
                                  recipients: {
                                    ...formData.recipients,
                                    filters: { ...formData.recipients.filters, source: newSources }
                                  }
                                });
                              }}
                              className="mr-1"
                            />
                            <span className="text-sm text-gray-700">{source}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.recipients.type === 'leads_by_priority' && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Priorities
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {leadPriorities.map(priority => (
                          <label key={priority} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.recipients.filters.priority.includes(priority)}
                              onChange={(e) => {
                                const newPriorities = e.target.checked
                                  ? [...formData.recipients.filters.priority, priority]
                                  : formData.recipients.filters.priority.filter(p => p !== priority);
                                setFormData({
                                  ...formData,
                                  recipients: {
                                    ...formData.recipients,
                                    filters: { ...formData.recipients.filters, priority: newPriorities }
                                  }
                                });
                              }}
                              className="mr-1"
                            />
                            <span className="text-sm text-gray-700 capitalize">{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.recipients.type === 'specific_leads' && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Leads
                      </label>
                      <select
                        multiple
                        value={formData.recipients.leadIds}
                        onChange={(e) => {
                          const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData({
                            ...formData,
                            recipients: { ...formData.recipients, leadIds: selectedIds }
                          });
                        }}
                        className="input-field"
                        size={5}
                      >
                        {(leads || []).map(lead => (
                          <option key={lead._id} value={lead._id}>
                            {lead.name} ({lead.email}) - {lead.status}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingCampaign(null);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && selectedCampaign && campaignStats && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Campaign Stats: {selectedCampaign.name}
                </h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaignStats.total}</div>
                  <div className="text-sm text-blue-800">Total</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{campaignStats.sent}</div>
                  <div className="text-sm text-green-800">Sent</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{campaignStats.opened}</div>
                  <div className="text-sm text-purple-800">Opened</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{campaignStats.clicked}</div>
                  <div className="text-sm text-orange-800">Clicked</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaignStats.openRate}%</div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaignStats.clickRate}%</div>
                  <div className="text-sm text-gray-600">Click Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{campaignStats.replyRate}%</div>
                  <div className="text-sm text-gray-600">Reply Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCampaigns;
