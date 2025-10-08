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
  X,
  Activity,
  Zap,
  CheckCircle,
  AlertCircle,
  Pause,
  Play
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
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800', icon: Clock },
    { value: 'sending', label: 'Sending', color: 'bg-yellow-100 text-yellow-800', icon: Activity },
    { value: 'sent', label: 'Sent', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'paused', label: 'Paused', color: 'bg-orange-100 text-orange-800', icon: Pause },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X }
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

  const CampaignCard = ({ campaign }) => {
    const statusInfo = statusOptions.find(s => s.value === campaign.status);
    const StatusIcon = statusInfo?.icon || AlertCircle;

    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                {campaign.name}
              </h3>
              {campaign.description && (
                <p className="text-sm text-gray-500 truncate mb-2">
                  {campaign.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {campaign.templateId?.name}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {campaign.stats?.totalRecipients || 0} recipients
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo?.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo?.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{campaign.stats?.sent || 0}</div>
              <div className="text-xs text-gray-500">Sent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{campaign.stats?.opened || 0}</div>
              <div className="text-xs text-gray-500">Opened</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{campaign.stats?.clicked || 0}</div>
              <div className="text-xs text-gray-500">Clicked</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleViewStats(campaign)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="View Stats"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              {campaign.status === 'draft' && (
                <>
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleSend(campaign._id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                    title="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </>
              )}
              {campaign.status === 'draft' && (
                <button
                  onClick={() => handleDelete(campaign._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
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
          <p className="mt-4 text-gray-600 text-center">Loading campaigns...</p>
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
                Email Campaigns
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Create and manage email campaigns for your leads</p>
            </div>
            <button
              onClick={() => {
                setEditingCampaign(null);
                resetForm();
                setShowModal(true);
              }}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Campaigns"
            value={campaigns.length}
            icon={Mail}
            color="blue"
          />
          <StatCard
            title="Active Campaigns"
            value={campaigns.filter(c => ['scheduled', 'sending'].includes(c.status)).length}
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Templates"
            value={templates.length}
            icon={Zap}
            color="purple"
          />
          <StatCard
            title="Total Recipients"
            value={campaigns.reduce((sum, c) => sum + (c.stats?.totalRecipients || 0), 0)}
            icon={Users}
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
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full sm:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowStats(true)}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                title="View All Stats"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {!filteredCampaigns || filteredCampaigns.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6">
              <Mail className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || filterStatus ? 'Try adjusting your search criteria.' : 'Get started by creating a new campaign.'}
            </p>
            <button
              onClick={() => {
                setEditingCampaign(null);
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-4xl border border-white/20">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCampaign(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Template *
                      </label>
                      <select
                        value={formData.templateId}
                        onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      rows={3}
                      placeholder="Optional campaign description"
                    />
                  </div>

                  {/* Recipients Section */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipients *
                    </label>
                    <select
                      value={formData.recipients.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        recipients: { ...formData.recipients, type: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
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
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Select Statuses
                        </label>
                        <div className="flex flex-wrap gap-3">
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
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700 capitalize">{status}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.recipients.type === 'leads_by_source' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Select Sources
                        </label>
                        <div className="flex flex-wrap gap-3">
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
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{source}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.recipients.type === 'leads_by_priority' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Select Priorities
                        </label>
                        <div className="flex flex-wrap gap-3">
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
                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700 capitalize">{priority}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.recipients.type === 'specific_leads' && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
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

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingCampaign(null);
                        resetForm();
                      }}
                      className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                    >
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Campaign Stats: {selectedCampaign.name}
                  </h3>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-blue-600">{campaignStats.total}</div>
                    <div className="text-sm text-blue-800 font-medium">Total</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-green-600">{campaignStats.sent}</div>
                    <div className="text-sm text-green-800 font-medium">Sent</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-purple-600">{campaignStats.opened}</div>
                    <div className="text-sm text-purple-800 font-medium">Opened</div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl text-center">
                    <div className="text-3xl font-bold text-orange-600">{campaignStats.clicked}</div>
                    <div className="text-sm text-orange-800 font-medium">Clicked</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
                    <div className="text-2xl font-bold text-gray-900">{campaignStats.openRate}%</div>
                    <div className="text-sm text-gray-600 font-medium">Open Rate</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
                    <div className="text-2xl font-bold text-gray-900">{campaignStats.clickRate}%</div>
                    <div className="text-sm text-gray-600 font-medium">Click Rate</div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
                    <div className="text-2xl font-bold text-gray-900">{campaignStats.replyRate}%</div>
                    <div className="text-sm text-gray-600 font-medium">Reply Rate</div>
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

export default EmailCampaigns;