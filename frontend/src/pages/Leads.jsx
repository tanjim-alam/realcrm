import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Building2,
  Globe,
  UserCheck,
  Clock,
  CheckCircle,
  Calendar,
  X,
  Target,
  AlertCircle,
  TrendingUp,
  Snowflake,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Helper functions for lead scoring
const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'hot': return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warm': return <TrendingUp className="h-4 w-4 text-orange-500" />;
    case 'cold': return <Snowflake className="h-4 w-4 text-blue-500" />;
    case 'ice': return <XCircle className="h-4 w-4 text-gray-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'hot': return 'bg-red-100 text-red-800';
    case 'warm': return 'bg-orange-100 text-orange-800';
    case 'cold': return 'bg-blue-100 text-blue-800';
    case 'ice': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatSource = (source) => {
  if (!source) return 'Not specified';
  
  const sourceMap = {
    'google': 'Google',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'linkedin': 'LinkedIn',
    'youtube': 'YouTube',
    'twitter': 'Twitter',
    'tiktok': 'TikTok',
    'brochure_download': 'Brochure Download',
    'cost_sheet_download': 'Cost Sheet Download',
    'google_ads': 'Google Ads',
    'facebook_ads': 'Facebook Ads',
    'referral': 'Referral',
    'walk_in': 'Walk In',
    'other': 'Other'
  };
  
  return sourceMap[source] || source.charAt(0).toUpperCase() + source.slice(1);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'contacted': return 'bg-yellow-100 text-yellow-800';
    case 'visit': return 'bg-purple-100 text-purple-800';
    case 'offer': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    case 'lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentCapacity, setAgentCapacity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [smsData, setSmsData] = useState({
    message: '',
    priority: 'normal'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectName: '',
    priority: 'warm',
    propertyType: 'apartment',
    budget: '',
    location: {
      area: '',
      city: '',
      state: ''
    },
    timeline: 'just_browsing',
    status: 'new',
    source: ''
  });

  const statusOptions = ['new', 'contacted', 'visit', 'offer', 'closed', 'lost'];
  const priorityOptions = [
    { value: 'hot', label: '🔥 Hot Lead', description: 'Ready to buy/sell immediately' },
    { value: 'warm', label: '🌡️ Warm Lead', description: 'Interested but not urgent' },
    { value: 'cold', label: '❄️ Cold Lead', description: 'Just browsing, early stage' }
  ];
  const timelineOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Ready to move now' },
    { value: '1-3_months', label: '1-3 Months', description: 'Looking to buy/sell soon' },
    { value: '3-6_months', label: '3-6 Months', description: 'Planning ahead' },
    { value: '6+_months', label: '6+ Months', description: 'Future planning' },
    { value: 'just_browsing', label: 'Just Browsing', description: 'No specific timeline' }
  ];
  const projectOptions = [
    'Sobha Properties',
    'Sobha Scarlet', 
    'Sobha Neopolis',
    'Sobha Dream Gardens',
    'Other'
  ];

  useEffect(() => {
    fetchLeads();
    fetchAgents();
    fetchAgentCapacity();
  }, [searchTerm, statusFilter]);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/leads?${params.toString()}`);
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get('/admin/users');
      console.log('Fetched users:', response.data);
      const filteredAgents = response.data.filter(u => u.role === 'agent' || u.role === 'admin');
      console.log('Filtered agents:', filteredAgents);
      setAgents(filteredAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    }
  };

  const fetchAgentCapacity = async () => {
    try {
      const response = await api.get('/leads/agents/capacity');
      console.log('Agent capacity data:', response.data);
      setAgentCapacity(response.data);
    } catch (error) {
      console.error('Error fetching agent capacity:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, formData);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', formData);
        toast.success('Lead created successfully');
      }
      
      setShowModal(false);
      setEditingLead(null);
      resetForm();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      projectName: lead.projectName || '',
      status: lead.status,
      source: lead.source || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${leadId}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleAssign = async (leadId, agentId) => {
    try {
      const payload = agentId ? { assignedTo: agentId } : { assignedTo: null };
      await api.put(`/leads/${leadId}/assign`, payload);
      toast.success(agentId ? 'Lead assigned successfully' : 'Lead unassigned successfully');
      fetchLeads();
      fetchAgentCapacity(); // Refresh capacity data
      setShowAssignModal(false);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to assign lead');
      }
    }
  };

  const handleSetReminder = async (leadId, reminderData) => {
    try {
      await api.put(`/leads/${leadId}/reminder`, { reminder: reminderData });
      toast.success('Reminder set successfully');
      fetchLeads();
      setShowReminderModal(false);
    } catch (error) {
      toast.error('Failed to set reminder');
    }
  };

  const handleCompleteReminder = async (leadId) => {
    try {
      await api.put(`/leads/${leadId}/reminder/complete`);
      toast.success('Reminder marked as completed');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to complete reminder');
    }
  };

  const handleRemoveReminder = async (leadId) => {
    try {
      await api.delete(`/leads/${leadId}/reminder`);
      toast.success('Reminder removed successfully');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to remove reminder');
    }
  };

  const handleAutoAssign = async (leadId) => {
    try {
      console.log('Attempting to auto-assign lead:', leadId);
      const response = await api.post(`/leads/${leadId}/auto-assign`);
      const { assignedAgent, alternatives } = response.data;
      
      let message = `Lead assigned to ${assignedAgent.name} (Score: ${assignedAgent.score}/100)`;
      if (assignedAgent.reasons.length > 0) {
        message += `\nReasons: ${assignedAgent.reasons.join(', ')}`;
      }
      
      toast.success(message, { duration: 6000 });
      fetchLeads();
      fetchAgentCapacity();
    } catch (error) {
      console.error('Auto-assign error:', error);
      if (error.response?.data?.message) {
        toast.error(`Auto-assign failed: ${error.response.data.message}`);
      } else {
        toast.error('Failed to auto-assign lead');
      }
    }
  };

  const handleSendSMS = async (leadId) => {
    try {
      const response = await api.post('/sms/send', {
        leadId: leadId,
        message: smsData.message,
        priority: smsData.priority
      });
      toast.success('SMS sent successfully');
      setShowSMSModal(false);
      setSmsData({ message: '', priority: 'normal' });
    } catch (error) {
      console.error('Send SMS error:', error);
      toast.error('Failed to send SMS');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      projectName: '',
      status: 'new',
      source: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      visit: 'bg-purple-100 text-purple-800',
      offer: 'bg-orange-100 text-orange-800',
      closed: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone && lead.phone.includes(searchTerm)) ||
    (lead.projectName && lead.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.source && formatSource(lead.source).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your real estate leads and track their progress
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingLead(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">Lead ID: {lead._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Globe className="h-4 w-4 mr-2 text-gray-400" />
                        {formatSource(lead.source)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        {lead.projectName || 'Not specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <UserCheck className="h-4 w-4 mr-2 text-gray-400" />
                        {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.reminder && lead.reminder.date ? (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-orange-400" />
                          <div>
                            <div className="text-gray-900">
                              {format(new Date(lead.reminder.date), 'MMM d, h:mm a')}
                            </div>
                            {lead.reminder.message && (
                              <div className="text-gray-500 text-xs truncate max-w-32">
                                {lead.reminder.message}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          No reminder
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.scoring ? (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {getPriorityIcon(lead.scoring.priority)}
                            <span className="ml-1 text-sm font-medium text-gray-900">
                              {lead.scoring.score}
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.scoring.priority)}`}>
                            {lead.scoring.priority}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-500">
                          <Target className="h-4 w-4 mr-1" />
                          Not scored
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        {/* Assignment buttons - available to both agents and admins */}
                        {!lead.assignedTo && (
                          <button
                            onClick={() => handleAutoAssign(lead._id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Auto-assign to best agent"
                          >
                            <User className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title={lead.assignedTo ? "Reassign lead" : "Assign lead"}
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                        
                        {/* SMS button - available to both agents and admins */}
                        {lead.phone && (
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowSMSModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Send SMS"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Reminder buttons - available to both agents and admins */}
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowReminderModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                          title="Set reminder"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        {lead.reminder && lead.reminder.date && !lead.reminder.isCompleted && (
                          <button
                            onClick={() => handleCompleteReminder(lead._id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark reminder as completed"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {lead.reminder && lead.reminder.date && (
                          <button
                            onClick={() => handleRemoveReminder(lead._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Remove reminder"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        
                        {/* Edit button - available to both agents and admins */}
                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Edit lead"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        {/* Delete button - only admins can delete */}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project Name</label>
                  <select
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Project</option>
                    {projectOptions.map(project => (
                      <option key={project} value={project}>
                        {project}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Source</option>
                    <option value="google">Google</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="twitter">Twitter</option>
                    <option value="tiktok">TikTok</option>
                    <option value="brochure_download">Brochure Download</option>
                    <option value="cost_sheet_download">Cost Sheet Download</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="facebook_ads">Facebook Ads</option>
                    <option value="referral">Referral</option>
                    <option value="walk_in">Walk In</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status} className="capitalize">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingLead ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedLead.assignedTo ? 'Reassign Lead' : 'Assign Lead'}: {selectedLead.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Agent</label>
                  <select
                    id="agentSelect"
                    className="input-field"
                    defaultValue={selectedLead.assignedTo?._id || ''}
                  >
                    <option value="">Unassigned</option>
                    {agentCapacity.length > 0 ? (
                      agentCapacity.map(agent => (
                        <option 
                          key={agent._id} 
                          value={agent._id}
                          disabled={agent.isAtCapacity}
                        >
                          {agent.name} ({agent.role}) - {agent.currentLeads}/{agent.leadCapacity} leads
                          {agent.isAtCapacity ? ' - AT CAPACITY' : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No agents available</option>
                    )}
                  </select>
                  {agentCapacity.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No agents found in your company.
                    </p>
                  )}
                  {agentCapacity.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 mb-2">
                        {user?.role === 'admin' ? 'Assign leads to any agent' : 'You can assign leads to any available agent'}
                      </p>
                      {agentCapacity.map(agent => (
                        <div key={agent._id} className="flex justify-between text-xs">
                          <span className={agent.isAtCapacity ? 'text-red-600' : 'text-gray-600'}>
                            {agent.name}:
                          </span>
                          <span className={agent.isAtCapacity ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                            {agent.currentLeads}/{agent.leadCapacity} leads
                            {agent.isAtCapacity && ' (FULL)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const agentId = document.getElementById('agentSelect').value;
                      handleAssign(selectedLead._id, agentId || null);
                    }}
                    className="btn-primary"
                  >
                    {selectedLead.assignedTo ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Reminder Modal */}
      {showReminderModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Set Reminder: {selectedLead.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reminder Date & Time</label>
                  <input
                    type="datetime-local"
                    id="reminderDateTime"
                    className="input-field"
                    defaultValue={selectedLead.reminder?.date ? new Date(selectedLead.reminder.date).toISOString().slice(0, 16) : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reminder Message</label>
                  <textarea
                    id="reminderMessage"
                    className="input-field"
                    rows="3"
                    placeholder="Enter reminder message..."
                    defaultValue={selectedLead.reminder?.message || ''}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReminderModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dateTime = document.getElementById('reminderDateTime').value;
                      const message = document.getElementById('reminderMessage').value;
                      
                      if (!dateTime) {
                        toast.error('Please select a date and time');
                        return;
                      }
                      
                      handleSetReminder(selectedLead._id, {
                        date: new Date(dateTime).toISOString(),
                        message: message
                      });
                    }}
                    className="btn-primary"
                  >
                    Set Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send SMS Modal */}
      {showSMSModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Send SMS: {selectedLead.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    value={selectedLead.phone}
                    className="input-field"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={smsData.message}
                    onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                    className="input-field"
                    rows="4"
                    placeholder="Enter your SMS message..."
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {smsData.message.length}/1600 characters
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={smsData.priority}
                    onChange={(e) => setSmsData({ ...smsData, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSMSModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendSMS(selectedLead._id)}
                    className="btn-primary"
                    disabled={!smsData.message.trim()}
                  >
                    Send SMS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
