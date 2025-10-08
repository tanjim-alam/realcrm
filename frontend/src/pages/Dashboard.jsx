import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  UserPlus,
  Home,
  Calendar,
  AlertCircle,
  Globe,
  BarChart3,
  PieChart,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, company } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalProperties: 0,
    totalUsers: 0,
    recentLeads: [],
    recentProperties: [],
    leadsByStatus: [],
    propertiesByStatus: [],
    leadsByPlatform: [],
    taskStats: {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0,
      dueToday: 0
    },
    recentTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadsResponse, propertiesResponse, platformResponse, tasksResponse, adminResponse] = await Promise.all([
        api.get('/leads/stats/summary'),
        api.get('/properties/stats/summary'),
        api.get('/leads/stats/platforms'),
        api.get('/tasks/stats'),
        user.role === 'admin' ? api.get('/admin/dashboard') : Promise.resolve({ data: null })
      ]);

      const leadsData = leadsResponse.data;
      const propertiesData = propertiesResponse.data;
      const platformData = platformResponse.data;
      const tasksData = tasksResponse.data;
      const adminData = adminResponse.data;

      console.log('Dashboard API Responses:', {
        leadsData,
        propertiesData,
        platformData,
        tasksData,
        adminData
      });

      console.log('Task Stats Debug:', {
        rawTasksData: tasksData,
        overview: tasksData?.overview,
        taskStats: {
          total: tasksData?.overview?.total || 0,
          pending: tasksData?.overview?.pending || 0,
          completed: tasksData?.overview?.completed || 0,
          overdue: tasksData?.overview?.overdue || 0,
          dueToday: tasksData?.overview?.dueToday || 0
        }
      });

      setStats({
        totalLeads: leadsData?.totalLeads || 0,
        totalProperties: propertiesData?.totalProperties || 0,
        totalUsers: adminData?.stats?.totalUsers || 0,
        recentLeads: leadsData?.recentLeads || [],
        recentProperties: propertiesData?.recentProperties || [],
        leadsByStatus: leadsData?.statusCounts || [],
        propertiesByStatus: propertiesData?.statusCounts || [],
        leadsByPlatform: platformData || [],
        taskStats: {
          total: tasksData?.overview?.total || 0,
          pending: tasksData?.overview?.pending || 0,
          completed: tasksData?.overview?.completed || 0,
          overdue: tasksData?.overview?.overdue || 0,
          dueToday: tasksData?.overview?.dueToday || 0
        },
        recentTasks: [] // Recent tasks not available in stats endpoint
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.role]);

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600',
      pink: 'from-pink-500 to-pink-600'
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

  const TaskCard = ({ title, count, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-4 border border-white/20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{count}</p>
        </div>
        <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
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
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-slate-600 mt-1">
              Here's what's happening with your real estate business today.
              {lastUpdated && (
                <span className="ml-2 text-sm text-blue-600">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-500">Today</p>
              <p className="text-lg font-semibold text-slate-900">{format(new Date(), 'EEEE, MMMM do')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Properties"
          value={stats.totalProperties}
          icon={Building2}
          color="green"
        />
        <StatCard
          title="Active Tasks"
          value={stats.taskStats.pending}
          icon={CheckSquare}
          color="purple"
        />
        {user?.role === 'admin' && (
          <StatCard
            title="Team Members"
            value={stats.totalUsers}
            icon={UserPlus}
            color="orange"
          />
        )}
      </div>

      {/* Task Overview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Task Overview</h2>
          <div className="flex items-center text-sm text-slate-500">
            <Activity className="h-4 w-4 mr-2" />
            Real-time updates
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <TaskCard
            title="Total Tasks"
            count={stats.taskStats.total}
            icon={Target}
            color="bg-gradient-to-r from-slate-500 to-slate-600"
            bgColor="bg-slate-50"
          />
          <TaskCard
            title="Pending"
            count={stats.taskStats.pending}
            icon={Clock}
            color="bg-gradient-to-r from-yellow-500 to-orange-500"
            bgColor="bg-yellow-50"
          />
          <TaskCard
            title="Completed"
            count={stats.taskStats.completed}
            icon={CheckCircle2}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
            bgColor="bg-green-50"
          />
          <TaskCard
            title="Overdue"
            count={stats.taskStats.overdue}
            icon={XCircle}
            color="bg-gradient-to-r from-red-500 to-rose-500"
            bgColor="bg-red-50"
          />
          <TaskCard
            title="Due Today"
            count={stats.taskStats.dueToday}
            icon={AlertCircle}
            color="bg-gradient-to-r from-blue-500 to-indigo-500"
            bgColor="bg-blue-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Leads</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-slate-900">{lead.name || 'Unknown'}</p>
                      <p className="text-sm text-slate-500">{lead.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{lead.status || 'New'}</p>
                    <p className="text-xs text-slate-500">{format(new Date(lead.createdAt), 'MMM d')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No recent leads</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Properties</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentProperties.length > 0 ? (
              stats.recentProperties.map((property, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-slate-900">{property.title || 'Untitled Property'}</p>
                      <p className="text-sm text-slate-500">{property.address || 'No address'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">${property.price?.toLocaleString() || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{property.status || 'Available'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No recent properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leads by Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Leads by Status</h2>
          <div className="space-y-4">
            {stats.leadsByStatus.length > 0 ? (
              stats.leadsByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${status._id === 'New' ? 'bg-blue-500' :
                      status._id === 'Contacted' ? 'bg-yellow-500' :
                        status._id === 'Qualified' ? 'bg-green-500' :
                          'bg-slate-500'
                      }`}></div>
                    <span className="text-slate-700">{status._id || 'Unknown'}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{status.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Leads by Platform */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Leads by Platform</h2>
          <div className="space-y-4">
            {stats.leadsByPlatform.length > 0 ? (
              stats.leadsByPlatform.map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-700">{platform.platform || 'Unknown'}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{platform.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;