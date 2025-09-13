import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  MessageSquare,
  Plus,
  Send,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SMS = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [smsMessages, setSmsMessages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'messages') {
        try {
          const [messagesResponse, leadsResponse] = await Promise.all([
            api.get('/sms'),
            api.get('/sms/leads')
          ]);
          setSmsMessages(messagesResponse.data.smsMessages || []);
          setLeads(leadsResponse.data || []);
        } catch (smsError) {
          console.error('SMS API error:', smsError);
          // If SMS API is not available, just fetch leads
          try {
            const leadsResponse = await api.get('/sms/leads');
            setSmsMessages([]);
            setLeads(leadsResponse.data || []);
            toast.error('SMS service not available. Please check your Twilio configuration.');
          } catch (leadsError) {
            console.error('Leads API error:', leadsError);
            setSmsMessages([]);
            setLeads([]);
            toast.error('Failed to load leads for SMS.');
          }
        }
      } else if (activeTab === 'campaigns') {
        try {
          const campaignsResponse = await api.get('/sms-campaigns');
          setCampaigns(campaignsResponse.data.campaigns || []);
        } catch (campaignError) {
          console.error('SMS Campaigns API error:', campaignError);
          setCampaigns([]);
          toast.error('SMS campaigns not available. Please check your Twilio configuration.');
        }
      } else if (activeTab === 'stats') {
        try {
          const statsResponse = await api.get('/sms/stats/overview');
          setStats(statsResponse.data);
        } catch (statsError) {
          console.error('SMS Stats API error:', statsError);
          setStats(null);
          toast.error('SMS statistics not available. Please check your Twilio configuration.');
        }
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
      // Set empty arrays on error to prevent filter errors
      if (activeTab === 'messages') {
        setSmsMessages([]);
        setLeads([]);
      } else if (activeTab === 'campaigns') {
        setCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async (smsData) => {
    try {
      // Clean up the data before sending
      const cleanedData = {
        ...smsData,
        scheduledAt: smsData.scheduledAt || undefined
      };
      
      const response = await api.post('/sms/send', cleanedData);
      setSmsMessages([response.data.sms, ...smsMessages]);
      setShowSendModal(false);
      
      if (response.data.demo) {
        toast.success('SMS sent successfully (Demo Mode)');
      } else {
        toast.success('SMS sent successfully');
      }
    } catch (error) {
      console.error('Send SMS error:', error);
      if (error.response?.status === 404) {
        toast.error('SMS service not available. Please check your Twilio configuration.');
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation error: ${errorMessages}`);
      } else {
        toast.error('Failed to send SMS');
      }
    }
  };

  const handleCreateCampaign = async (campaignData) => {
    try {
      const response = await api.post('/sms-campaigns', campaignData);
      setCampaigns([response.data, ...campaigns]);
      setShowCampaignModal(false);
      toast.success('Campaign created successfully');
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    try {
      await api.post(`/sms-campaigns/${campaignId}/send`);
      fetchData();
      toast.success('Campaign sent successfully');
    } catch (error) {
      console.error('Send campaign error:', error);
      toast.error('Failed to send campaign');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">SMS Management</h1>
          <p className="text-gray-600">Send SMS messages and manage campaigns</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowSendModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send SMS
          </button>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Users className="h-4 w-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'messages', name: 'Messages', icon: MessageSquare },
            { id: 'campaigns', name: 'Campaigns', icon: Users },
            { id: 'stats', name: 'Statistics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Messages Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {smsMessages.map((sms) => (
                    <tr key={sms._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Phone className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {sms.leadId?.name || 'Unknown Lead'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {sms.to}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {sms.message}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sms.message.length} characters
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sms.status)}`}>
                          {getStatusIcon(sms.status)}
                          <span className="ml-1">{sms.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${sms.cost?.toFixed(4) || '0.0000'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sms.sentAt ? format(new Date(sms.sentAt), 'MMM d, h:mm a') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedMessage(sms)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                      {campaign.description && (
                        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCampaignStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Recipients</span>
                      <span className="text-sm font-medium text-gray-900">
                        {campaign.stats.totalRecipients}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Sent</span>
                      <span className="text-sm font-medium text-gray-900">
                        {campaign.stats.totalSent}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Delivered</span>
                      <span className="text-sm font-medium text-gray-900">
                        {campaign.stats.totalDelivered}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Cost</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${campaign.stats.totalCost?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSendCampaign(campaign._id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMessage(campaign)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Send className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Sent</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.companyStats.totalSent}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Delivered</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.companyStats.totalDelivered}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.companyStats.totalFailed}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Cost</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.companyStats.totalCost?.toFixed(2) || '0.00'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Status Distribution</h3>
              <div className="space-y-3">
                {stats.statusStats.map((stat) => (
                  <div key={stat._id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{stat._id}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">{stat.count} messages</span>
                      <span className="text-sm text-gray-500">${stat.totalCost?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send SMS Modal */}
      {showSendModal && (
        <SendSMSModal
          leads={leads}
          onClose={() => setShowSendModal(false)}
          onSubmit={handleSendSMS}
        />
      )}

      {/* Create Campaign Modal */}
      {showCampaignModal && (
        <CreateCampaignModal
          onClose={() => setShowCampaignModal(false)}
          onSubmit={handleCreateCampaign}
        />
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
};

// Send SMS Modal Component
const SendSMSModal = ({ leads, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    leadId: '',
    message: '',
    priority: 'normal',
    scheduledAt: ''
  });
  const [modalLeads, setModalLeads] = useState([]);

  useEffect(() => {
    // Fetch leads if not provided or empty
    if (!Array.isArray(leads) || leads.length === 0) {
      const fetchLeads = async () => {
        try {
          const response = await api.get('/sms/leads');
          setModalLeads(response.data || []);
        } catch (error) {
          console.error('Error fetching leads:', error);
          setModalLeads([]);
        }
      };
      fetchLeads();
    } else {
      setModalLeads(leads);
    }
  }, [leads]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clean up the form data - remove empty scheduledAt
    const cleanedData = {
      ...formData,
      scheduledAt: formData.scheduledAt || undefined
    };
    onSubmit(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Send SMS</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Lead
              </label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a lead...</option>
                {Array.isArray(modalLeads) && modalLeads.filter(lead => lead.phone).map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {lead.name} ({lead.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your message..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.message.length}/1600 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Send SMS
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Create Campaign Modal Component
const CreateCampaignModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    message: '',
    type: 'broadcast',
    targetCriteria: {
      leadStatus: [],
      leadPriority: [],
      leadSource: [],
      propertyType: [],
      budgetRange: { min: '', max: '' },
      timeline: []
    },
    schedule: {
      type: 'immediate'
    },
    settings: {
      maxRecipients: 1000,
      sendRate: 10,
      respectOptOuts: true,
      includeOptOutLink: true
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Create SMS Campaign</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="broadcast">Broadcast</option>
                  <option value="targeted">Targeted</option>
                  <option value="automated">Automated</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your campaign message..."
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.message.length}/1600 characters
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Recipients
                </label>
                <input
                  type="number"
                  value={formData.settings.maxRecipients}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, maxRecipients: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send Rate (messages/minute)
                </label>
                <input
                  type="number"
                  value={formData.settings.sendRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, sendRate: parseInt(e.target.value) }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Message Detail Modal Component
const MessageDetailModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">To</label>
              <p className="text-sm text-gray-900">{message.to}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <p className="text-sm text-gray-900">{message.from}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{message.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="text-sm text-gray-900">{message.status}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cost</label>
              <p className="text-sm text-gray-900">${message.cost?.toFixed(4) || '0.0000'}</p>
            </div>

            {message.sentAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Sent At</label>
                <p className="text-sm text-gray-900">{format(new Date(message.sentAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            )}

            {message.deliveredAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Delivered At</label>
                <p className="text-sm text-gray-900">{format(new Date(message.deliveredAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMS;


