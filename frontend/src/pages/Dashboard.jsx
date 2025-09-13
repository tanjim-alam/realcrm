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
  CheckSquare
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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

        setStats({
          totalLeads: leadsData.totalLeads,
          totalProperties: propertiesData.totalProperties,
          totalUsers: adminData?.stats?.totalUsers || 0,
          recentLeads: leadsData.recentLeads || [],
          recentProperties: propertiesData.recentProperties || [],
          leadsByStatus: leadsData.statusCounts || [],
          propertiesByStatus: propertiesData.statusCounts || [],
          leadsByPlatform: platformData || [],
          taskStats: tasksData?.overview || {
            total: 0,
            pending: 0,
            completed: 0,
            overdue: 0,
            dueToday: 0
          },
          recentTasks: []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.role]);

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      visit: 'bg-purple-100 text-purple-800',
      offer: 'bg-orange-100 text-orange-800',
      closed: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      available: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      sold: 'bg-gray-100 text-gray-800',
      rented: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user.name}! Here's what's happening with your real estate business.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalLeads}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalProperties}</dd>
              </dl>
            </div>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserPlus className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Plan</dt>
                <dd className="text-lg font-medium text-gray-900 capitalize">{company?.plan}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Task Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckSquare className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.taskStats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.taskStats.pending}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.taskStats.completed}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.taskStats.overdue}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Due Today</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.taskStats.dueToday}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Leads</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead) => (
                <div key={lead._id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lead.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {lead.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(lead.createdAt), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent leads</p>
            )}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Properties</h3>
            <Home className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentProperties.length > 0 ? (
              stats.recentProperties.map((property) => (
                <div key={property._id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {property.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {property.location}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      ${property.price?.toLocaleString()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent properties</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leads by Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Leads by Status</h3>
          <div className="space-y-2">
            {stats.leadsByStatus.length > 0 ? (
              stats.leadsByStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status._id}</span>
                  <span className="text-sm font-medium text-gray-900">{status.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No leads data</p>
            )}
          </div>
        </div>

        {/* Properties by Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Properties by Status</h3>
          <div className="space-y-2">
            {stats.propertiesByStatus.length > 0 ? (
              stats.propertiesByStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{status._id}</span>
                  <span className="text-sm font-medium text-gray-900">{status.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No properties data</p>
            )}
          </div>
        </div>
      </div>

      {/* Platform Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Leads by Platform */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Leads by Platform</h3>
            <Globe className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.leadsByPlatform.length > 0 ? (
              stats.leadsByPlatform.map((platform, index) => (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-purple-500' :
                        'bg-gray-400'
                      }`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {platform.displayName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {platform.count}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((platform.count / stats.totalLeads) * 100)}%)
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No platform data</p>
            )}
          </div>
        </div>

        {/* Platform Performance */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Platform Performance</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.leadsByPlatform.length > 0 ? (
              stats.leadsByPlatform.slice(0, 5).map((platform, index) => {
                const percentage = Math.round((platform.count / stats.totalLeads) * 100);
                return (
                  <div key={platform.platform} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {platform.displayName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {platform.count} leads
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    {platform.totalValue > 0 && (
                      <div className="text-xs text-gray-500">
                        Total Value: ${platform.totalValue.toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No performance data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
