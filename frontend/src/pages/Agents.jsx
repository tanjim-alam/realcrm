import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Shield,
  UserCheck,
  Users,
  Activity,
  Clock,
  CheckCircle,
  X,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Agents = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent'
  });

  const roleOptions = ['admin', 'agent'];

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/admin/users');
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/admin/users/${editingAgent._id}`, updateData);
        toast.success('Agent updated successfully');
      } else {
        await api.post('/admin/users', formData);
        toast.success('Agent created successfully');
      }

      setShowModal(false);
      setEditingAgent(null);
      resetForm();
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save agent');
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      password: '',
      role: agent.role
    });
    setShowModal(true);
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await api.delete(`/admin/users/${agentId}`);
        toast.success('Agent deleted successfully');
        fetchAgents();
      } catch (error) {
        toast.error('Failed to delete agent');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'agent'
    });
  };

  const getRoleColor = (role) => {
    return role === 'admin'
      ? 'from-purple-500 to-purple-600'
      : 'from-blue-500 to-blue-600';
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? Shield : UserCheck;
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || agent.role === filterRole;
    return matchesSearch && matchesRole;
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

  const AgentCard = ({ agent }) => {
    const RoleIcon = getRoleIcon(agent.role);
    const roleColor = getRoleColor(agent.role);

    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${roleColor} flex items-center justify-center shadow-lg`}>
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${roleColor} text-white`}>
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {agent.role === 'admin' ? 'Admin' : 'Agent'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${agent.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${agent.isActive ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    {agent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleEdit(agent)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              {agent._id !== user.id && (
                <button
                  onClick={() => handleDelete(agent._id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-3 text-gray-400" />
              <span className="truncate">{agent.email}</span>
            </div>

            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-3 text-gray-400" />
              <span>Joined {format(new Date(agent.createdAt), 'MMM d, yyyy')}</span>
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
          <p className="mt-4 text-gray-600 text-center">Loading team members...</p>
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
                Team Members
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your team members and their roles</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingAgent(null);
                setShowModal(true);
              }}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Member
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Members"
            value={agents.length}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Members"
            value={agents.filter(a => a.isActive).length}
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Admins"
            value={agents.filter(a => a.role === 'admin').length}
            icon={Shield}
            color="purple"
          />
          <StatCard
            title="Agents"
            value={agents.filter(a => a.role === 'agent').length}
            icon={UserCheck}
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
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 w-full sm:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="agent">Agent</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('');
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                title="Clear Filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {!filteredAgents || filteredAgents.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-6">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || filterRole ? 'Try adjusting your search criteria.' : 'Get started by adding your first team member.'}
            </p>
            <button
              onClick={() => {
                resetForm();
                setEditingAgent(null);
                setShowModal(true);
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Member
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent._id} agent={agent} />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingAgent ? 'Edit Team Member' : 'Add New Team Member'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingAgent(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password {editingAgent ? '(leave blank to keep current)' : '*'}
                    </label>
                    <input
                      type="password"
                      required={!editingAgent}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      placeholder="Enter password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    >
                      {roleOptions.map(role => (
                        <option key={role} value={role} className="capitalize">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingAgent(null);
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
                      {editingAgent ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;