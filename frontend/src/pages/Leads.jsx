import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
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
  MessageSquare,
  Filter,
  MoreVertical,
  Eye,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Users,
  DollarSign,
  BarChart3,
  RefreshCw,
  FileText,
  Layers,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Download,
  ArrowLeft,
  ArrowRight
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
    case 'hot': return 'bg-red-100 text-red-800 border-red-200';
    case 'warm': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ice': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'visit': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'offer': return 'bg-green-100 text-green-800 border-green-200';
    case 'closed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'lost': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatSource = (source) => {
  if (!source) return 'Unknown';
  return source.charAt(0).toUpperCase() + source.slice(1).replace(/_/g, ' ');
};

const formatPropertyPrice = (price) => {
  if (!price || !price.value) return 'Price not available';

  const { value, unit, startingPrice } = price;
  let formattedPrice = '';

  switch (unit) {
    case 'lakh':
      formattedPrice = `₹${value} Lakh${value > 1 ? 's' : ''}`;
      break;
    case 'cr':
      formattedPrice = `₹${value} Cr${value > 1 ? 's' : ''}`;
      break;
    case 'thousand':
      formattedPrice = `₹${value}K`;
      break;
    case 'million':
      formattedPrice = `₹${value}M`;
      break;
    default:
      formattedPrice = `₹${value.toLocaleString()}`;
  }

  if (startingPrice) {
    formattedPrice = `Starting from ${formattedPrice}`;
  }

  return formattedPrice;
};

const Leads = () => {
  const { user } = useAuth();
  const { notifications, fetchNotifications } = useNotifications();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentCapacity, setAgentCapacity] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsPerPage, setLeadsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [viewingLead, setViewingLead] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    submit: false,
    delete: false,
    assign: false,
    reminder: false
  });
  const [propertyRecommendations, setPropertyRecommendations] = useState([]);
  const [propertyInterests, setPropertyInterests] = useState([]);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedLeadForProperties, setSelectedLeadForProperties] = useState(null);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [reminderData, setReminderData] = useState({
    date: '',
    time: '',
    message: '',
    priority: 'normal'
  });
  const [assignData, setAssignData] = useState({
    agentId: '',
    priority: 'normal'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    priority: 'warm',
    propertyType: 'apartment',
    timeline: 'just_browsing',
    status: 'new',
    source: ''
  });
  const [properties, setProperties] = useState([]);

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

  const dateFilterOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' }
  ];

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
    fetchLeads(false, 1);
    fetchAgents();
    fetchAgentCapacity();
    fetchProperties();
  }, [searchTerm, statusFilter, propertyFilter, dateFilter]);

  // Auto-refresh leads every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing leads...');
      fetchLeads(true);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Refresh leads when new lead notifications arrive
  useEffect(() => {
    const leadNotifications = notifications.filter(notification =>
      notification.type === 'lead' &&
      !notification.isRead &&
      new Date(notification.createdAt) > new Date(Date.now() - 30000) // Last 30 seconds
    );

    if (leadNotifications.length > 0) {
      console.log('🔄 New lead notification detected, refreshing leads...');
      fetchLeads(true);
    }
  }, [notifications]);

  const fetchLeads = async (isRefresh = false, page = currentPage) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (initialLoad) {
        setLoading(true);
      }

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (propertyFilter) params.append('propertyId', propertyFilter);
      if (dateFilter) params.append('dateFilter', dateFilter);
      params.append('page', page);
      params.append('limit', leadsPerPage);

      const response = await api.get(`/leads?${params.toString()}`);
      setLeads(response.data.leads);
      setTotalPages(response.data.totalPages);
      setTotalLeads(response.data.total);
      setCurrentPage(response.data.currentPage);

      if (isRefresh) {
        toast.success('Leads refreshed successfully');
      }

      // Mark initial load as complete
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLeads(true, currentPage);
  };

  // Pagination functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLeads(false, page);
  };

  const handleLeadsPerPageChange = (newLeadsPerPage) => {
    setLeadsPerPage(newLeadsPerPage);
    setCurrentPage(1);
    fetchLeads(false, 1);
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Property recommendation functions
  const fetchPropertyRecommendations = async (leadId) => {
    try {
      setLoadingProperties(true);
      const response = await api.get(`/leads/${leadId}/property-recommendations?limit=5`);
      setPropertyRecommendations(response.data.data);
    } catch (error) {
      console.error('Error fetching property recommendations:', error);
      toast.error('Failed to fetch property recommendations');
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchPropertyInterests = async (leadId) => {
    try {
      const response = await api.get(`/leads/${leadId}/property-interests`);
      setPropertyInterests(response.data.data);
    } catch (error) {
      console.error('Error fetching property interests:', error);
      toast.error('Failed to fetch property interests');
    }
  };

  const trackPropertyInterest = async (leadId, propertyId, interestData) => {
    try {
      await api.post(`/leads/${leadId}/property-interest`, {
        propertyId,
        ...interestData
      });
      toast.success('Property interest tracked successfully');
      // Refresh property interests
      await fetchPropertyInterests(leadId);
    } catch (error) {
      console.error('Error tracking property interest:', error);
      toast.error('Failed to track property interest');
    }
  };

  const updatePropertyInterest = async (leadId, interestId, interestData) => {
    try {
      await api.put(`/leads/${leadId}/property-interests/${interestId}`, interestData);
      toast.success('Property interest updated successfully');
      // Refresh property interests
      await fetchPropertyInterests(leadId);
    } catch (error) {
      console.error('Error updating property interest:', error);
      toast.error('Failed to update property interest');
    }
  };

  const removePropertyInterest = async (leadId, interestId) => {
    try {
      await api.delete(`/leads/${leadId}/property-interests/${interestId}`);
      toast.success('Property interest removed successfully');
      // Refresh property interests
      await fetchPropertyInterests(leadId);
    } catch (error) {
      console.error('Error removing property interest:', error);
      toast.error('Failed to remove property interest');
    }
  };

  const handleShowProperties = async (lead) => {
    setSelectedLeadForProperties(lead);
    setShowPropertyModal(true);
    await Promise.all([
      fetchPropertyRecommendations(lead._id),
      fetchPropertyInterests(lead._id)
    ]);
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get('/admin/users');
      const filteredAgents = response.data.filter(u => u.role === 'agent' || u.role === 'admin');
      setAgents(filteredAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    }
  };

  const fetchAgentCapacity = async () => {
    try {
      const response = await api.get('/leads/agents/capacity');
      setAgentCapacity(response.data);
    } catch (error) {
      console.error('Error fetching agent capacity:', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    }
  };

  const handleDownloadLeads = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (propertyFilter) params.append('propertyId', propertyFilter);
      if (dateFilter) params.append('dateFilter', dateFilter);
      params.append('format', 'csv');

      const response = await api.get(`/leads/export?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date and filters
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filterStr = [searchTerm, statusFilter, propertyFilter, dateFilter]
        .filter(Boolean)
        .join('_');
      const filename = `leads_${dateStr}${filterStr ? `_${filterStr}` : ''}.csv`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Count filtered leads for success message
      const filteredLeads = leads.filter(lead => {
        let matches = true;
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          matches = matches && (
            lead.name.toLowerCase().includes(searchLower) ||
            lead.email.toLowerCase().includes(searchLower) ||
            (lead.phone && lead.phone.includes(searchTerm)) ||
            lead.source.toLowerCase().includes(searchLower) ||
            (lead.notes && lead.notes.toLowerCase().includes(searchLower))
          );
        }
        if (statusFilter) {
          matches = matches && lead.status === statusFilter;
        }
        if (propertyFilter) {
          matches = matches && lead.propertyId === propertyFilter;
        }
        return matches;
      });

      toast.success(`Successfully exported ${filteredLeads.length} leads with current filters!`);
    } catch (error) {
      console.error('Error downloading leads:', error);
      toast.error('Failed to download leads');
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(prev => ({ ...prev, submit: true }));
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
      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyId: '',
        priority: 'warm',
        propertyType: 'apartment',
        timeline: 'just_browsing',
        status: 'new',
        source: ''
      });
      fetchLeads();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    } finally {
      setActionLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      propertyId: lead.propertyId?._id || '',
      priority: lead.priority || 'warm',
      propertyType: lead.propertyType || 'apartment',
      timeline: lead.timeline || 'just_browsing',
      status: lead.status || 'new',
      source: lead.source || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setActionLoading(prev => ({ ...prev, delete: true }));
      try {
        await api.delete(`/leads/${leadId}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
        toast.error('Failed to delete lead');
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const handleReminder = (lead) => {
    setSelectedLead(lead);
    setReminderData({
      date: '',
      time: '',
      message: '',
      priority: 'normal'
    });
    setShowReminderModal(true);
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(prev => ({ ...prev, reminder: true }));
    try {
      const reminderDateTime = new Date(`${reminderData.date}T${reminderData.time}`);
      await api.put(`/leads/${selectedLead._id}/reminder`, {
        reminder: {
          ...reminderData,
          date: reminderDateTime
        }
      });
      toast.success('Reminder set successfully');
      setShowReminderModal(false);
      fetchLeads();
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder');
    } finally {
      setActionLoading(prev => ({ ...prev, reminder: false }));
    }
  };

  const handleAssign = (lead) => {
    setSelectedLead(lead);
    setAssignData({
      agentId: lead.assignedTo?._id || '',
      priority: lead.priority || 'normal'
    });
    setShowAssignModal(true);
  };

  const handleCompleteReminder = async (leadId) => {
    try {
      await api.put(`/leads/${leadId}/reminder/complete`);
      toast.success('Reminder marked as completed');
      fetchLeads();
    } catch (error) {
      console.error('Error completing reminder:', error);
      toast.error('Failed to complete reminder');
    }
  };

  const handleDeleteReminder = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await api.delete(`/leads/${leadId}/reminder`);
        toast.success('Reminder deleted successfully');
        fetchLeads();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        toast.error('Failed to delete reminder');
      }
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(prev => ({ ...prev, assign: true }));
    try {
      await api.put(`/leads/${selectedLead._id}/assign`, {
        assignedTo: assignData.agentId,
        priority: assignData.priority
      });
      toast.success('Lead assigned successfully');
      setShowAssignModal(false);
      fetchLeads();
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error('Failed to assign lead');
    } finally {
      setActionLoading(prev => ({ ...prev, assign: false }));
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600',
      red: 'from-red-500 to-red-600'
    };

    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                {changeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {change}
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lead Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and track your real estate leads effectively.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="relative group">
              <button
                onClick={handleDownloadLeads}
                disabled={downloading}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className={`h-5 w-5 mr-2 ${downloading ? 'animate-pulse' : ''}`} />
                {downloading ? 'Exporting...' : 'Export CSV'}
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Export with current filters: {[
                  searchTerm && `Search: "${searchTerm}"`,
                  statusFilter && `Status: ${statusFilter}`,
                  propertyFilter && `Property: ${properties.find(p => p._id === propertyFilter)?.title || 'Selected'}`,
                  dateFilter && `Date: ${dateFilter}`
                ].filter(Boolean).join(', ') || 'All leads'}
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Lead
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="New Leads"
          value={leads.filter(l => l.status === 'new').length}
          icon={Target}
          color="green"
        />
        <StatCard
          title="Hot Leads"
          value={leads.filter(l => l.priority === 'hot').length}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Conversion Rate"
          value={`${totalLeads > 0 ? ((leads.filter(l => l.status === 'closed').length / totalLeads) * 100).toFixed(1) : 0}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search leads by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-white/20 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-white/20 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="px-4 py-3 border border-white/20 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">All Properties</option>
            {properties.map(property => (
              <option key={property._id} value={property._id}>
                {property.title}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 border border-white/20 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            {dateFilterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Reminder
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-slate-200">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg">
                          {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-slate-900">{lead.name}</div>
                          <div className="text-xs text-slate-500">ID: {lead._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <Mail className="h-4 w-4 mr-2 text-slate-400" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-sm text-slate-500 mt-1">
                          <Phone className="h-4 w-4 mr-2 text-slate-400" />
                          {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <Globe className="h-4 w-4 mr-2 text-slate-400" />
                        {formatSource(lead.source)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                        {lead.propertyId ? (
                          <div>
                            <div className="font-medium">{lead.propertyId.title}</div>
                            <div className="text-xs text-slate-500">
                              {lead.propertyId.location?.address || lead.propertyId.location}
                            </div>
                          </div>
                        ) : (
                          'No property selected'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <UserCheck className="h-4 w-4 mr-2 text-slate-400" />
                        {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(lead.priority)}`}>
                        {getPriorityIcon(lead.priority)}
                        <span className="ml-1">{lead.priority?.charAt(0)?.toUpperCase() + lead.priority?.slice(1) || 'Normal'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                        {lead.status?.charAt(0)?.toUpperCase() + lead.status?.slice(1) || 'New'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.reminder && lead.reminder.date && !isNaN(new Date(lead.reminder.date).getTime()) ? (
                        <div className="flex flex-col space-y-1">
                          <div className={`text-xs font-medium ${lead.reminder.isCompleted
                            ? 'text-green-600'
                            : new Date(lead.reminder.date) < new Date()
                              ? 'text-red-600'
                              : 'text-blue-600'
                            }`}>
                            {format(new Date(lead.reminder.date), 'MMM d, yyyy HH:mm')}
                          </div>
                          {lead.reminder.message && (
                            <div className="text-xs text-slate-500 truncate max-w-32" title={lead.reminder.message}>
                              {lead.reminder.message}
                            </div>
                          )}
                          <div className="flex space-x-1">
                            {!lead.reminder.isCompleted && (
                              <button
                                onClick={() => handleCompleteReminder(lead._id)}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                title="Mark as completed"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteReminder(lead._id)}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                              title="Delete reminder"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No reminder</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleShowProperties(lead)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                          title="View Properties"
                        >
                          <Home className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewingLead(lead)}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Edit Lead"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => handleAssign(lead)}
                            className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                            title="Assign Lead"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleReminder(lead)}
                          className="text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50 transition-colors duration-200"
                          title="Set Reminder"
                        >
                          <Clock className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          disabled={actionLoading.delete}
                          className={`p-2 rounded-lg transition-colors duration-200 ${actionLoading.delete
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            }`}
                          title={actionLoading.delete ? "Deleting..." : "Delete Lead"}
                        >
                          {actionLoading.delete ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <div className="text-slate-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No leads found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalLeads > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Results info */}
            <div className="text-slate-600 text-sm">
              Showing {((currentPage - 1) * leadsPerPage) + 1} to {Math.min(currentPage * leadsPerPage, totalLeads)} of {totalLeads} leads
            </div>

            {/* Leads per page selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Show:</label>
              <select
                value={leadsPerPage}
                onChange={(e) => handleLeadsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-slate-600">per page</span>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              {/* First page */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                First
              </button>

              {/* Previous page */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Last page */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingLead ? 'Edit Lead' : 'Add New Lead'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Property</label>
                  <select
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  >
                    <option value="">Select Property (Optional)</option>
                    {properties.map(property => (
                      <option key={property._id} value={property._id}>
                        {property.title} - {property.location?.address || property.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Source</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.submit}
                  className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${actionLoading.submit
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-blue-600 hover:to-indigo-700'
                    }`}
                >
                  {actionLoading.submit ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingLead ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingLead ? 'Update Lead' : 'Create Lead'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Set Reminder</h2>
              <p className="text-sm text-slate-600 mt-1">For {selectedLead?.name}</p>
            </div>
            <form onSubmit={handleReminderSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={reminderData.date}
                  onChange={(e) => setReminderData({ ...reminderData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Time</label>
                <input
                  type="time"
                  required
                  value={reminderData.time}
                  onChange={(e) => setReminderData({ ...reminderData, time: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                <textarea
                  value={reminderData.message}
                  onChange={(e) => setReminderData({ ...reminderData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.reminder}
                  className={`bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${actionLoading.reminder
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-orange-600 hover:to-red-700'
                    }`}
                >
                  {actionLoading.reminder ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Setting...
                    </div>
                  ) : (
                    'Set Reminder'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Assign Lead</h2>
              <p className="text-sm text-slate-600 mt-1">Assign {selectedLead?.name} to an agent</p>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Agent</label>
                <select
                  required
                  value={assignData.agentId}
                  onChange={(e) => setAssignData({ ...assignData, agentId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  <option value="">Choose an agent...</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select
                  value={assignData.priority}
                  onChange={(e) => setAssignData({ ...assignData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.assign}
                  className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${actionLoading.assign
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:from-green-600 hover:to-emerald-700'
                    }`}
                >
                  {actionLoading.assign ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </div>
                  ) : (
                    'Assign Lead'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {viewingLead && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Lead Details</h2>
                <button
                  onClick={() => setViewingLead(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Name</label>
                        <p className="text-slate-900 font-medium">{viewingLead.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Email</label>
                        <p className="text-slate-900">{viewingLead.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Phone</label>
                        <p className="text-slate-900">{viewingLead.phone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Property</label>
                        {viewingLead.propertyId ? (
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="text-slate-900 font-medium">{viewingLead.propertyId.title}</p>
                            <p className="text-sm text-slate-600">
                              {viewingLead.propertyId.location?.address || viewingLead.propertyId.location}
                            </p>
                            {viewingLead.propertyId.price && (
                              <p className="text-sm text-green-600 font-medium">
                                {viewingLead.propertyId.price.displayText ||
                                  `₹${viewingLead.propertyId.price.value} ${viewingLead.propertyId.price.unit}`}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-slate-500">No property selected</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Source</label>
                        <p className="text-slate-900">{formatSource(viewingLead.source)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lead Status */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-green-600" />
                      Lead Status
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${viewingLead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          viewingLead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                            viewingLead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                              viewingLead.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                'bg-slate-100 text-slate-800'
                          }`}>
                          {viewingLead.status?.charAt(0).toUpperCase() + viewingLead.status?.slice(1)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Priority</label>
                        <div className="flex items-center">
                          {getPriorityIcon(viewingLead.priority)}
                          <span className="ml-2 text-slate-900 capitalize">{viewingLead.priority}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Assigned To</label>
                        <p className="text-slate-900">
                          {viewingLead.assignedTo ?
                            `${viewingLead.assignedTo.name} (${viewingLead.assignedTo.email})` :
                            'Unassigned'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-purple-600" />
                      Additional Information
                    </h3>
                    <div className="space-y-4">
                      {viewingLead.propertyType && (
                        <div>
                          <label className="block text-sm font-medium text-slate-600">Property Type</label>
                          <p className="text-slate-900 capitalize">{viewingLead.propertyType}</p>
                        </div>
                      )}
                      {viewingLead.location && (
                        <div>
                          <label className="block text-sm font-medium text-slate-600">Location</label>
                          <p className="text-slate-900">{viewingLead.location}</p>
                        </div>
                      )}
                      {viewingLead.notes && (
                        <div>
                          <label className="block text-sm font-medium text-slate-600">Notes</label>
                          <p className="text-slate-900">{viewingLead.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Fields (from form builder) */}
                  {viewingLead.customFields && Object.keys(viewingLead.customFields).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                        <Layers className="h-5 w-5 mr-2 text-indigo-600" />
                        Custom Fields
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(viewingLead.customFields).map(([key, field]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-slate-600">
                              {field.label || key}
                            </label>
                            <p className="text-slate-900">
                              {field.value || 'Not specified'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-orange-600" />
                      Timestamps
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Created</label>
                        <p className="text-slate-900">
                          {format(new Date(viewingLead.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600">Last Updated</label>
                        <p className="text-slate-900">
                          {format(new Date(viewingLead.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Recommendations Modal */}
      {showPropertyModal && selectedLeadForProperties && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Property Recommendations
                  </h2>
                  <p className="text-slate-600 mt-1">
                    For {selectedLeadForProperties.name} - {selectedLeadForProperties.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowPropertyModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-slate-100 rounded-lg p-1">
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${!loadingProperties ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  onClick={() => !loadingProperties && fetchPropertyRecommendations(selectedLeadForProperties._id)}
                >
                  <Home className="h-4 w-4 inline mr-2" />
                  Recommendations ({propertyRecommendations.length})
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${loadingProperties ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  onClick={() => fetchPropertyInterests(selectedLeadForProperties._id)}
                >
                  <Heart className="h-4 w-4 inline mr-2" />
                  Interests ({propertyInterests.length})
                </button>
              </div>

              {/* Property Recommendations */}
              {!loadingProperties && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Recommended Properties
                  </h3>
                  {propertyRecommendations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {propertyRecommendations.map((property) => (
                        <div key={property._id} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                          {/* Property Image */}
                          <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Home className="h-16 w-16 text-slate-400" />
                            )}
                          </div>

                          {/* Property Details */}
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-lg font-semibold text-slate-900 truncate">
                                {property.title}
                              </h4>
                              <div className="flex items-center space-x-1 ml-2">
                                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {property.matchPercentage}% match
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-slate-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="text-sm">{property.location?.address || property.location}</span>
                              </div>
                              <div className="flex items-center text-slate-600">
                                <DollarSign className="h-4 w-4 mr-2" />
                                <span className="text-sm font-semibold text-green-600">
                                  {property.price?.displayText || formatPropertyPrice(property.price)}
                                </span>
                              </div>
                              <div className="flex items-center text-slate-600">
                                <Building2 className="h-4 w-4 mr-2" />
                                <span className="text-sm capitalize">{property.propertyType}</span>
                              </div>
                              {property.configuration?.bedrooms && (
                                <div className="flex items-center text-slate-600">
                                  <Bed className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{property.configuration.bedrooms}</span>
                                </div>
                              )}
                            </div>

                            {/* Match Reasons */}
                            {property.reasons && property.reasons.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-medium text-slate-700 mb-2">Why this matches:</h5>
                                <ul className="space-y-1">
                                  {property.reasons.map((reason, index) => (
                                    <li key={index} className="text-xs text-slate-600 flex items-start">
                                      <CheckCircle className="h-3 w-3 mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                                      {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => trackPropertyInterest(selectedLeadForProperties._id, property._id, {
                                  interestLevel: 'high',
                                  status: 'interested'
                                })}
                                className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium"
                              >
                                <ThumbsUp className="h-4 w-4 inline mr-1" />
                                Interested
                              </button>
                              <button
                                onClick={() => trackPropertyInterest(selectedLeadForProperties._id, property._id, {
                                  interestLevel: 'low',
                                  status: 'rejected'
                                })}
                                className="flex-1 bg-red-100 text-red-600 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                              >
                                <ThumbsDown className="h-4 w-4 inline mr-1" />
                                Not Interested
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">No property recommendations found</p>
                      <p className="text-sm text-slate-400">Try adding more properties to your inventory</p>
                    </div>
                  )}
                </div>
              )}

              {/* Property Interests */}
              {loadingProperties && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Property Interests
                  </h3>
                  {propertyInterests.length > 0 ? (
                    <div className="space-y-4">
                      {propertyInterests.map((interest) => (
                        <div key={interest._id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-slate-900">
                                {interest.propertyId.title}
                              </h4>
                              <div className="flex items-center text-slate-600 mt-1">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span className="text-sm">{interest.propertyId.location?.address || interest.propertyId.location}</span>
                                <span className="mx-2">•</span>
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span className="text-sm font-semibold text-green-600">
                                  {interest.propertyId.price?.displayText || formatPropertyPrice(interest.propertyId.price)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${interest.interestLevel === 'high' ? 'bg-green-100 text-green-800' :
                                interest.interestLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                {interest.interestLevel}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${interest.status === 'interested' ? 'bg-blue-100 text-blue-800' :
                                interest.status === 'viewing' ? 'bg-purple-100 text-purple-800' :
                                  interest.status === 'negotiating' ? 'bg-orange-100 text-orange-800' :
                                    interest.status === 'offered' ? 'bg-green-100 text-green-800' :
                                      interest.status === 'purchased' ? 'bg-green-200 text-green-900' :
                                        'bg-red-100 text-red-800'
                                }`}>
                                {interest.status}
                              </span>
                            </div>
                          </div>
                          {interest.notes && (
                            <div className="mt-3">
                              <p className="text-sm text-slate-600">{interest.notes}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-slate-400">
                              Viewed: {format(new Date(interest.viewedAt), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => removePropertyInterest(selectedLeadForProperties._id, interest._id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500">No property interests yet</p>
                      <p className="text-sm text-slate-400">Show some properties to this lead</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;