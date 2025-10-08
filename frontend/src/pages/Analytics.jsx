import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  Building2,
  Target,
  Clock,
  DollarSign,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics data
  const [leadOverview, setLeadOverview] = useState(null);
  const [agentPerformance, setAgentPerformance] = useState(null);
  const [propertyOverview, setPropertyOverview] = useState(null);

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const tabs = [
    { id: 'overview', label: 'Lead Overview', icon: Users },
    { id: 'agents', label: 'Agent Performance', icon: Target },
    { id: 'properties', label: 'Properties', icon: Building2 }
  ];

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [leadData, agentData, propertyData] = await Promise.all([
        api.get(`/analytics/leads/overview?period=${period}`),
        api.get(`/analytics/agents/performance?period=${period}`),
        api.get(`/analytics/properties/overview?period=${period}`)
      ]);

      setLeadOverview(leadData.data);
      setAgentPerformance(agentData.data);
      setPropertyOverview(propertyData.data);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    const bgClasses = {
      blue: 'from-blue-50 to-blue-100',
      green: 'from-green-50 to-green-100',
      purple: 'from-purple-50 to-purple-100',
      orange: 'from-orange-50 to-orange-100',
      red: 'from-red-50 to-red-100',
      indigo: 'from-indigo-50 to-indigo-100'
    };

    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${bgClasses[color]} shadow-lg`}>
              <Icon className={`h-8 w-8 text-${color}-600`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-semibold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-600'
              }`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLeadOverview = () => {
    if (!leadOverview) return null;

    const { totalLeads, conversionFunnel, conversionRates, leadsBySource, leadsByStatus, dailyTrends } = leadOverview;

    return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={formatNumber(totalLeads)}
            icon={Users}
            color="blue"
            subtitle={`${periodOptions.find(p => p.value === period)?.label}`}
            trend={12}
          />
          <StatCard
            title="Conversion Rate"
            value={`${conversionRates.overallConversion}%`}
            icon={TrendingUp}
            color="green"
            subtitle="New to Closed"
            trend={8}
          />
          <StatCard
            title="Closed Deals"
            value={formatNumber(conversionFunnel.closed)}
            icon={Target}
            color="purple"
            subtitle={`${conversionFunnel.closed} closed`}
            trend={15}
          />
          <StatCard
            title="Active Leads"
            value={formatNumber(conversionFunnel.new + conversionFunnel.contacted + conversionFunnel.visit + conversionFunnel.offer)}
            icon={Clock}
            color="orange"
            subtitle="In pipeline"
            trend={-3}
          />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Lead Conversion Funnel</h3>
            <div className="text-sm text-slate-500">Conversion rates between stages</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {Object.entries(conversionFunnel).map(([status, count], index) => (
              <div key={status} className="text-center group">
                <div className={`p-6 rounded-2xl bg-gradient-to-br ${COLORS[index % COLORS.length]}100 hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{count}</p>
                  <p className="text-sm font-semibold text-slate-600 capitalize">{status}</p>
                </div>
                {index < Object.keys(conversionFunnel).length - 1 && (
                  <div className="text-center mt-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                      {conversionRates[`${status}To${Object.keys(conversionFunnel)[index + 1]}`] || 0}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leads by Source */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Leads by Source</h3>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={leadsBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leads by Status */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Leads by Status</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={leadsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="_id" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Trends */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Daily Lead Trends</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-500">Lead volume over time</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id.day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
              />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#areaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderAgentPerformance = () => {
    if (!agentPerformance) return null;

    const { agentPerformance: agents } = agentPerformance;

    return (
      <div className="space-y-8">
        {/* Agent Performance Table */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">Agent Performance</h3>
            <p className="text-slate-600 mt-1">Individual agent metrics and performance indicators</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Leads
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Active Leads
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Closed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Avg Response Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Capacity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-slate-200">
                {agents.map((agent) => (
                  <tr key={agent.agent._id} className="hover:bg-slate-50/80 transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg mr-4">
                          {agent.agent.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{agent.agent.name}</div>
                          <div className="text-sm text-slate-500">{agent.agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-lg font-bold text-slate-900">{agent.totalLeads}</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-lg font-bold text-slate-900">{agent.activeLeads}</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-lg font-bold text-slate-900">{agent.closedLeads}</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-xl ${agent.conversionRate >= 20 ? 'bg-green-100 text-green-800' :
                          agent.conversionRate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {agent.conversionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">{agent.avgResponseTime}h</div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-slate-200 rounded-full h-3 mr-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${parseFloat(agent.capacityUtilization) >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                parseFloat(agent.capacityUtilization) >= 70 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                  'bg-gradient-to-r from-green-500 to-green-600'
                              }`}
                            style={{ width: `${agent.capacityUtilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">{agent.capacityUtilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertyOverview = () => {
    if (!propertyOverview) return null;

    const { totalProperties, propertiesByStatus, propertiesByType, priceAnalysis } = propertyOverview;

    return (
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Properties"
            value={formatNumber(totalProperties)}
            icon={Building2}
            color="blue"
            subtitle={`${periodOptions.find(p => p.value === period)?.label}`}
            trend={5}
          />
          <StatCard
            title="Average Price"
            value={formatCurrency(priceAnalysis?.avgPrice)}
            icon={DollarSign}
            color="green"
            subtitle="Per property"
            trend={12}
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(priceAnalysis?.totalValue)}
            icon={TrendingUp}
            color="purple"
            subtitle="Portfolio value"
            trend={18}
          />
          <StatCard
            title="Price Range"
            value={`${formatCurrency(priceAnalysis?.minPrice)} - ${formatCurrency(priceAnalysis?.maxPrice)}`}
            icon={Target}
            color="orange"
            subtitle="Min - Max"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Properties by Status */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Properties by Status</h3>
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={propertiesByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {propertiesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Properties by Type */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Properties by Type</h3>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={propertiesByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="_id" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="count" fill="url(#greenGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading analytics data...</p>
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
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 mt-2 text-lg">Track your lead performance and business metrics</p>
            </div>
            <div className="mt-6 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                <Filter className="h-5 w-5 text-slate-500" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-700 font-medium focus:ring-0"
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2">
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && renderLeadOverview()}
          {activeTab === 'agents' && renderAgentPerformance()}
          {activeTab === 'properties' && renderPropertyOverview()}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
