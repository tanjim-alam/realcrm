import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Play,
  Pause,
  X,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    assignedTo: '',
    search: ''
  });
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const categoryOptions = [
    { value: 'follow_up', label: 'Follow Up' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'call', label: 'Call' },
    { value: 'email', label: 'Email' },
    { value: 'document', label: 'Document' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closing', label: 'Closing' },
    { value: 'other', label: 'Other' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    status: 'pending',
    category: 'other',
    dueDate: '',
    tags: [],
    estimatedHours: '',
    reminder: { enabled: false, date: '' }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/tasks/users'),
        api.get('/tasks/stats')
      ]);

      setTasks(tasksRes.data.tasks || []);

      // Filter users based on hierarchical permissions
      const allUsers = usersRes.data || [];
      let filteredUsers = allUsers;

      if (user.role === 'agent') {
        // Agents can only assign tasks to other agents, not to admins
        filteredUsers = allUsers.filter(u => u.role === 'agent' && u._id !== user.id);
      } else if (user.role === 'admin') {
        // Admins can assign tasks to anyone (admin or agent) except themselves
        filteredUsers = allUsers.filter(u => u._id !== user.id);
      }

      setUsers(filteredUsers);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchData();
      toast.success('Tasks refreshed successfully');
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      toast.error('Failed to refresh tasks');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation - require assignedTo for new tasks only
    if (!editingTask && (!formData.assignedTo || formData.assignedTo.trim() === '')) {
      toast.error('Please select an assigned user for new tasks');
      return;
    }

    setSubmitting(true);
    try {
      const taskData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        dueDate: formData.dueDate || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        assignedTo: formData.assignedTo || null, // Convert empty string to null
        reminder: {
          enabled: formData.reminder.enabled,
          date: formData.reminder.date || null
        },
        relatedTo: { type: 'none', id: null }
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', taskData);
        toast.success('Task created successfully');
      }

      setShowModal(false);
      setEditingTask(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Save task error:', error);
      if (editingTask) {
        toast.error('Failed to update task');
      } else {
        toast.error('Failed to create task');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo._id,
      priority: task.priority,
      status: task.status,
      category: task.category,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      tags: task.tags || [],
      estimatedHours: task.estimatedHours || '',
      reminder: task.reminder || { enabled: false, date: '' }
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success('Task deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Delete task error:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      toast.success('Task status updated');
      fetchData();
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleProgressChange = async (taskId, progress) => {
    try {
      await api.put(`/tasks/${taskId}/progress`, { progress });
      toast.success('Task progress updated');
      fetchData();
    } catch (error) {
      console.error('Update progress error:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/tasks/${taskId}/comments`, { comment: newComment });
      toast.success('Comment added');
      setNewComment('');
      setShowCommentModal(false);
      fetchData();
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error('Failed to add comment');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      status: 'pending',
      category: 'other',
      dueDate: '',
      tags: [],
      estimatedHours: '',
      reminder: { enabled: false, date: '' }
    });
  };

  const filteredTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority = !filters.priority || task.priority === filters.priority;
    const matchesCategory = !filters.category || task.category === filters.category;
    const matchesAssigned = !filters.assignedTo || task.assignedTo._id === filters.assignedTo;
    const matchesSearch = !filters.search ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.tags?.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));

    return matchesStatus && matchesPriority && matchesCategory && matchesAssigned && matchesSearch;
  }) : [];

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority);
    return priorityOption ? priorityOption.color : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString, task = null) => {
    if (!dateString) return 'No due date';

    // If task is completed, don't show overdue status
    if (task && task.status === 'completed') {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading tasks...</p>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Tasks
              </h1>
              <p className="text-slate-600 mt-2 text-lg">Manage and track your tasks</p>
            </div>
            <div className="flex gap-3 mt-6 sm:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-gradient-to-r from-slate-500 to-slate-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => {
                  setEditingTask(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center group"
              >
                <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                New Task
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Tasks</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.overview?.total || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-lg">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.overview?.pending || 0}</p>
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
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.overview?.completed || 0}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 shadow-lg">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Overdue</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.overview?.overdue || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Priority</option>
              {priorityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="px-4 py-3 border border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="">All Users</option>
              {Array.isArray(users) && users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setFilters({ status: '', priority: '', category: '', assignedTo: '', search: '' })}
              className="px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">Task Management</h3>
            <p className="text-slate-600 mt-1">Track and manage all your tasks efficiently</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-slate-200">
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg mr-4">
                          {task.title?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                          <div className="text-sm text-slate-500 capitalize">{task.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-slate-400 mr-3" />
                        <div className="text-sm font-semibold text-slate-900">{task.assignedTo.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl ${getStatusColor(task.status)}`}>
                        {statusOptions.find(opt => opt.value === task.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl ${getPriorityColor(task.priority)}`}>
                        {priorityOptions.find(opt => opt.value === task.priority)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{formatDate(task.dueDate, task)}</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-20 bg-slate-200 rounded-full h-3 mr-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDetails(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-all duration-200 group"
                          title="Edit Task"
                        >
                          <Edit className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Assigned To {!editingTask ? '*' : ''}
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        required={!editingTask}
                      >
                        <option value="">Select User</option>
                        {Array.isArray(users) && users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      >
                        {priorityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      >
                        {categoryOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Estimated Hours
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={formData.estimatedHours}
                        onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                      />
                    </div>
                  </div>


                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          {editingTask ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingTask ? 'Update Task' : 'Create Task'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Task Details Modal */}
        {showDetails && selectedTask && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl border border-white/20">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900">
                    {selectedTask.title}
                  </h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-2">Status</label>
                      <p className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl ${getStatusColor(selectedTask.status)}`}>
                        {statusOptions.find(opt => opt.value === selectedTask.status)?.label}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-2">Priority</label>
                      <p className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl ${getPriorityColor(selectedTask.priority)}`}>
                        {priorityOptions.find(opt => opt.value === selectedTask.priority)?.label}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-2">Description</label>
                    <p className="text-slate-900 bg-slate-50 p-4 rounded-xl">{selectedTask.description || 'No description'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-2">Assigned To</label>
                      <p className="text-slate-900 font-semibold">{selectedTask.assignedTo.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-2">Due Date</label>
                      <p className="text-slate-900 font-semibold">{formatDate(selectedTask.dueDate, selectedTask)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-2">Progress</label>
                    <div className="flex items-center">
                      <div className="w-full bg-slate-200 rounded-full h-3 mr-3">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                          style={{ width: `${selectedTask.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{selectedTask.progress}%</span>
                    </div>
                  </div>

                  {selectedTask.tags && selectedTask.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedTask.tags.map((tag, index) => (
                          <span key={index} className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-xl font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTask.comments && selectedTask.comments.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-semibold text-slate-600">Comments</label>
                        <button
                          onClick={() => setShowCommentModal(true)}
                          className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl text-sm font-semibold transition-all duration-200"
                        >
                          Add Comment
                        </button>
                      </div>
                      <div className="space-y-3">
                        {selectedTask.comments.map((comment, index) => (
                          <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-slate-900 font-medium">{comment.comment}</p>
                                <p className="text-xs text-slate-500 mt-2">
                                  by {comment.user.name} on {new Date(comment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      onClick={() => setShowDetails(false)}
                      className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowDetails(false);
                        handleEdit(selectedTask);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Edit Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Comment Modal */}
        {showCommentModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Add Comment</h3>
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  rows={4}
                  placeholder="Enter your comment..."
                />
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="px-6 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddComment(selectedTask._id)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;


