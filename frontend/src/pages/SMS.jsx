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
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading SMS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SMS Management</h1>
              <p className="text-slate-600 mt-2 text-lg">Send SMS messages and manage campaigns</p>
            </div>
            <div className="mt-6 sm:mt-0 flex space-x-4">
              <button
                onClick={() => setShowSendModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
              >
                <Send className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Send SMS
              </button>
              <button
                onClick={() => setShowCampaignModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
              >
                <Users className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Create Campaign
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2">
          <nav className="flex space-x-2">
            {[
              { id: 'messages', name: 'Messages', icon: MessageSquare },
              { id: 'campaigns', name: 'Campaigns', icon: Users },
              { id: 'stats', name: 'Statistics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  } flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center group`}
              >
                <tab.icon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'messages' && (
          <div className="space-y-8">
            {/* Messages Table */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900">SMS Messages</h3>
                <p className="text-slate-600 mt-1">Track and manage all your SMS communications</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Sent At
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-slate-200">
                    {smsMessages.map((sms) => (
                      <tr key={sms._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg mr-4">
                              <Phone className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {sms.leadId?.name || 'Unknown Lead'}
                              </div>
                              <div className="text-sm text-slate-500 font-medium">
                                {sms.to}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-sm text-slate-900 max-w-xs truncate font-medium">
                            {sms.message}
                          </div>
                          <div className="text-xs text-slate-500 font-semibold">
                            {sms.message.length} characters
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold ${getStatusColor(sms.status)}`}>
                            {getStatusIcon(sms.status)}
                            <span className="ml-2 capitalize">{sms.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-semibold text-slate-900">
                          ${sms.cost?.toFixed(4) || '0.0000'}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-semibold text-slate-500">
                          {sms.sentAt ? format(new Date(sms.sentAt), 'MMM d, h:mm a') : '-'}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedMessage(sms)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
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
          <div className="space-y-8">
            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">{campaign.name}</h3>
                        {campaign.description && (
                          <p className="text-sm text-slate-600 mt-2 font-medium">{campaign.description}</p>
                        )}
                      </div>
                      <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold ${getCampaignStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-semibold text-slate-600">Recipients</span>
                        <span className="text-lg font-bold text-slate-900">
                          {campaign.stats.totalRecipients}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-semibold text-slate-600">Sent</span>
                        <span className="text-lg font-bold text-slate-900">
                          {campaign.stats.totalSent}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-semibold text-slate-600">Delivered</span>
                        <span className="text-lg font-bold text-slate-900">
                          {campaign.stats.totalDelivered}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <span className="text-sm font-semibold text-slate-600">Cost</span>
                        <span className="text-lg font-bold text-slate-900">
                          ${campaign.stats.totalCost?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleSendCampaign(campaign._id)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedMessage(campaign)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Eye className="h-4 w-4 mr-2" />
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
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
                      <Send className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Sent</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{stats.companyStats.totalSent}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 shadow-lg">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Delivered</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{stats.companyStats.totalDelivered}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 shadow-lg">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Failed</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">{stats.companyStats.totalFailed}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 shadow-lg">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Cost</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">${stats.companyStats.totalCost?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900">Status Distribution</h3>
                <p className="text-slate-600 mt-1">Breakdown of SMS message statuses</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {stats.statusStats.map((stat) => (
                    <div key={stat._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                      <span className="text-sm font-bold text-slate-700 capitalize">{stat._id}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold text-slate-500">{stat.count} messages</span>
                        <span className="text-sm font-semibold text-slate-500">${stat.totalCost?.toFixed(2) || '0.00'}</span>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Send SMS</h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Lead
              </label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                placeholder="Enter your message..."
                required
              />
              <div className="text-xs text-slate-500 mt-2 font-semibold">
                {formData.message.length}/1600 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Create SMS Campaign</h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Campaign Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  <option value="broadcast">Broadcast</option>
                  <option value="targeted">Targeted</option>
                  <option value="automated">Automated</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                placeholder="Enter your campaign message..."
                required
              />
              <div className="text-xs text-slate-500 mt-2 font-semibold">
                {formData.message.length}/1600 characters
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Max Recipients
                </label>
                <input
                  type="number"
                  value={formData.settings.maxRecipients}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, maxRecipients: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Send Rate (messages/minute)
                </label>
                <input
                  type="number"
                  value={formData.settings.sendRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, sendRate: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Message Details</h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">To</label>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl">{message.to}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">From</label>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl">{message.from}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Message</label>
              <p className="text-sm font-medium text-slate-900 bg-slate-50 p-4 rounded-xl leading-relaxed">{message.message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Status</label>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl capitalize">{message.status}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Cost</label>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl">${message.cost?.toFixed(4) || '0.0000'}</p>
              </div>
            </div>

            {message.sentAt && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Sent At</label>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl">{format(new Date(message.sentAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            )}

            {message.deliveredAt && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-2">Delivered At</label>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl">{format(new Date(message.deliveredAt), 'MMM d, yyyy h:mm a')}</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
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


