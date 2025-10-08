import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Check,
  X,
  CreditCard,
  Users,
  Building2,
  BarChart3,
  Palette,
  Crown,
  Star,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Mail,
  Database,
  Settings,
  Activity,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Plus,
  Minus,
  DollarSign,
  Calendar,
  Target,
  Layers,
  FileText,
  MessageSquare,
  Phone,
  MapPin,
  Eye,
  Download,
  Upload,
  Lock,
  Unlock,
  Sparkles,
  Award,
  Gift,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

const Subscription = () => {
  const { company } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Transform backend plans to frontend format
  const transformPlans = (backendPlans) => {
    return backendPlans.map(plan => {
      const planConfig = {
        free: {
          color: 'from-gray-500 to-gray-600',
          bgColor: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          icon: Star,
          popular: false
        },
        basic: {
          color: 'from-blue-500 to-blue-600',
          bgColor: 'from-blue-50 to-blue-100',
          borderColor: 'border-blue-200',
          icon: Star,
          popular: false
        },
        premium: {
          color: 'from-purple-500 to-purple-600',
          bgColor: 'from-purple-50 to-purple-100',
          borderColor: 'border-purple-200',
          icon: Crown,
          popular: true
        }
      };

      const config = planConfig[plan.plan] || planConfig.free;

      return {
        id: plan.plan,
        name: plan.name,
        description: plan.description,
        price: { monthly: plan.price, yearly: plan.price * 10 }, // 20% discount for yearly
        originalPrice: { monthly: plan.price, yearly: plan.price * 12 },
        duration: plan.duration.toLowerCase(),
        ...config,
        features: plan.features,
        included: [
          `${plan.features.maxLeads === -1 ? 'Unlimited' : plan.features.maxLeads} leads`,
          `${plan.features.maxProperties === -1 ? 'Unlimited' : plan.features.maxProperties} properties`,
          `${plan.features.maxUsers === -1 ? 'Unlimited' : plan.features.maxUsers} team members`,
          plan.features.hasAnalytics ? 'Analytics' : null,
          plan.features.hasCustomBranding ? 'Custom branding' : null,
          'Email support',
          'Mobile app access'
        ].filter(Boolean),
        notIncluded: [
          !plan.features.hasAnalytics ? 'Advanced analytics' : null,
          !plan.features.hasCustomBranding ? 'Custom branding' : null,
          'API access',
          'Priority support'
        ].filter(Boolean)
      };
    });
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  // Debug: Log usage state changes
  useEffect(() => {
    console.log('Usage state updated:', usage);
  }, [usage]);

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionResponse, usageResponse, plansResponse] = await Promise.all([
        api.get('/subscription/status').catch(err => {
          console.log('Subscription status not found, using default');
          return { data: { plan: 'free', isActive: true, features: { maxLeads: 50, maxProperties: 10, maxUsers: 2, hasAnalytics: false, hasCustomBranding: false } } };
        }),
        api.get('/subscription/usage'),
        api.get('/subscription/plans')
      ]);

      console.log('Subscription Response:', subscriptionResponse.data);
      console.log('Usage Response:', usageResponse.data);
      console.log('Plans Response:', plansResponse.data);

      setSubscription(subscriptionResponse.data);
      setUsage(usageResponse.data.usage); // Access the usage object directly
      setPlans(transformPlans(plansResponse.data));
      setLastUpdated(new Date());

      // Debug: Log the usage data that was set
      console.log('Usage data set to state:', usageResponse.data.usage);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlan = async (plan) => {
    setActivating(true);
    try {
      await api.post('/subscription/activate', {
        plan: plan.id,
        duration: 30
      });
      toast.success(`${plan.name} plan activated successfully!`);
      fetchSubscriptionData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate plan');
    } finally {
      setActivating(false);
    }
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend, percentage }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
      amber: 'from-amber-500 to-amber-600'
    };

    return (
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{trend}</span>
              </div>
            )}
            {percentage && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getUsageColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% used</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PricingCard = ({ plan, isCurrent, onSelect }) => {
    const Icon = plan.icon;
    const currentPrice = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
    const originalPrice = billingCycle === 'yearly' ? plan.originalPrice.yearly : plan.originalPrice.monthly;
    const savings = billingCycle === 'yearly' ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

    return (
      <div className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${isCurrent ? 'border-purple-200 ring-2 ring-purple-500' : 'border-white/20'
        } ${plan.popular ? 'scale-105' : ''}`}>
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </div>
          </div>
        )}

        {isCurrent && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-full shadow-lg">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${plan.color} shadow-lg mb-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600 mb-4">{plan.description}</p>

          <div className="mb-4">
            <div className="flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-900">${currentPrice}</span>
              <span className="text-gray-500 ml-2">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
            </div>
            {billingCycle === 'yearly' && savings > 0 && (
              <div className="flex items-center justify-center mt-2">
                <span className="text-sm text-gray-500 line-through mr-2">${originalPrice}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                  Save {savings}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
          {plan.included.map((feature, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onSelect(plan)}
          disabled={isCurrent || activating}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${isCurrent
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : plan.popular
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
        >
          {activating ? (
            <div className="flex items-center justify-center">
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Activating...
            </div>
          ) : isCurrent ? (
            <div className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Current Plan
            </div>
          ) : (
            <div className="flex items-center justify-center">
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </div>
          )}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading subscription data...</p>
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
                Subscription & Billing
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your plan and view usage statistics</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'pricing'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  }`}
              >
                Pricing
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'usage'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  }`}
              >
                Usage
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
                  <p className="text-gray-600">Your active subscription details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {subscription?.features?.maxLeads === -1 ? '∞' : subscription?.features?.maxLeads || 0}
                  </div>
                  <div className="text-sm text-gray-600">Max Leads</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {subscription?.features?.maxProperties === -1 ? '∞' : subscription?.features?.maxProperties || 0}
                  </div>
                  <div className="text-sm text-gray-600">Max Properties</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {subscription?.features?.maxUsers === -1 ? '∞' : subscription?.features?.maxUsers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Max Users</div>
                </div>
              </div>
            </div>

            {/* Real Data Statistics */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900">Real-Time Usage Statistics</h2>
                    <p className="text-gray-600">
                      Live data from your CRM database
                      {lastUpdated && (
                        <span className="ml-2 text-sm text-blue-600">
                          • Last updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={fetchSubscriptionData}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Leads Count */}
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Total Leads</h3>
                  </div>
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {usage?.leads?.used || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    of {usage?.leads?.limit === -1 ? '∞' : usage?.leads?.limit || 0} limit
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getUsageColor(usage?.leads?.percentage || 0)}`}
                      style={{ width: `${getUsagePercentage(usage?.leads?.used || 0, usage?.leads?.limit || 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {usage?.leads?.percentage?.toFixed(1) || 0}% used
                  </div>
                </div>

                {/* Properties Count */}
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Total Properties</h3>
                  </div>
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    {usage?.properties?.used || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    of {usage?.properties?.limit === -1 ? '∞' : usage?.properties?.limit || 0} limit
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getUsageColor(usage?.properties?.percentage || 0)}`}
                      style={{ width: `${getUsagePercentage(usage?.properties?.used || 0, usage?.properties?.limit || 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {usage?.properties?.percentage?.toFixed(1) || 0}% used
                  </div>
                </div>

                {/* Team Members Count */}
                <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-purple-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                  </div>
                  <div className="text-5xl font-bold text-purple-600 mb-2">
                    {usage?.users?.used || 0}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    of {usage?.users?.limit === -1 ? '∞' : usage?.users?.limit || 0} limit
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getUsageColor(usage?.users?.percentage || 0)}`}
                      style={{ width: `${getUsagePercentage(usage?.users?.used || 0, usage?.users?.limit || 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {usage?.users?.percentage?.toFixed(1) || 0}% used
                  </div>
                </div>
              </div>

              {/* Plan Status */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg mr-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Plan Status</h3>
                      <p className="text-gray-600">
                        {subscription?.isActive ? "Active" : "Inactive"} - {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1)} Plan
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Expiry Date</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : "No expiry"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-8">
            {/* Billing Toggle */}
            <div className="text-center">
              <div className="inline-flex bg-white/70 backdrop-blur-lg rounded-2xl p-2 border border-white/20 shadow-xl">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Yearly
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={plan.id === subscription?.plan}
                  onSelect={(plan) => handleActivatePlan(plan)}
                />
              ))}
            </div>

            {/* Features Comparison */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                      {plans.map((plan) => (
                        <th key={plan.id} className="text-center py-4 px-6 font-semibold text-gray-900">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { name: 'Leads per month', free: plans.find(p => p.id === 'free')?.features?.maxLeads === -1 ? 'Unlimited' : plans.find(p => p.id === 'free')?.features?.maxLeads || 0, basic: plans.find(p => p.id === 'basic')?.features?.maxLeads === -1 ? 'Unlimited' : plans.find(p => p.id === 'basic')?.features?.maxLeads || 0, premium: plans.find(p => p.id === 'premium')?.features?.maxLeads === -1 ? 'Unlimited' : plans.find(p => p.id === 'premium')?.features?.maxLeads || 0 },
                      { name: 'Properties', free: plans.find(p => p.id === 'free')?.features?.maxProperties === -1 ? 'Unlimited' : plans.find(p => p.id === 'free')?.features?.maxProperties || 0, basic: plans.find(p => p.id === 'basic')?.features?.maxProperties === -1 ? 'Unlimited' : plans.find(p => p.id === 'basic')?.features?.maxProperties || 0, premium: plans.find(p => p.id === 'premium')?.features?.maxProperties === -1 ? 'Unlimited' : plans.find(p => p.id === 'premium')?.features?.maxProperties || 0 },
                      { name: 'Team members', free: plans.find(p => p.id === 'free')?.features?.maxUsers === -1 ? 'Unlimited' : plans.find(p => p.id === 'free')?.features?.maxUsers || 0, basic: plans.find(p => p.id === 'basic')?.features?.maxUsers === -1 ? 'Unlimited' : plans.find(p => p.id === 'basic')?.features?.maxUsers || 0, premium: plans.find(p => p.id === 'premium')?.features?.maxUsers === -1 ? 'Unlimited' : plans.find(p => p.id === 'premium')?.features?.maxUsers || 0 },
                      { name: 'Analytics', free: plans.find(p => p.id === 'free')?.features?.hasAnalytics ? 'Yes' : 'No', basic: plans.find(p => p.id === 'basic')?.features?.hasAnalytics ? 'Yes' : 'No', premium: plans.find(p => p.id === 'premium')?.features?.hasAnalytics ? 'Yes' : 'No' },
                      { name: 'Custom branding', free: plans.find(p => p.id === 'free')?.features?.hasCustomBranding ? 'Yes' : 'No', basic: plans.find(p => p.id === 'basic')?.features?.hasCustomBranding ? 'Yes' : 'No', premium: plans.find(p => p.id === 'premium')?.features?.hasCustomBranding ? 'Yes' : 'No' }
                    ].map((feature, index) => (
                      <tr key={index}>
                        <td className="py-4 px-6 font-medium text-gray-900">{feature.name}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{feature.free}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{feature.basic}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{feature.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="space-y-8">
            {/* Usage Statistics */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Usage Statistics</h2>
                  <p className="text-gray-600">Track your current usage against plan limits</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Leads</span>
                    <span className="text-sm text-gray-600">
                      {usage?.leads?.used || 0} / {usage?.leads?.limit === -1 ? '∞' : usage?.leads?.limit || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getUsageColor(usage?.leads?.percentage || 0)}`}
                      style={{ width: `${getUsagePercentage(usage?.leads?.used || 0, usage?.leads?.limit || 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {usage?.leads?.percentage?.toFixed(1) || 0}% of monthly limit used
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Properties</span>
                    <span className="text-sm text-gray-600">
                      {usage?.properties?.used || 0} / {usage?.properties?.limit === -1 ? '∞' : usage?.properties?.limit || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getUsageColor(usage?.properties?.percentage || 0)}`}
                      style={{ width: `${getUsagePercentage(usage?.properties?.used || 0, usage?.properties?.limit || 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {usage?.properties?.percentage?.toFixed(1) || 0}% of plan limit used
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">Team Members</span>
                    <span className="text-sm text-gray-600">
                      {usage?.users?.used || 0} / {usage?.users?.limit === -1 ? '∞' : usage?.users?.limit || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${getUsageColor(usage?.users?.percentage || 0)}`}
                      style={{ width: `${getUsagePercentage(usage?.users?.used || 0, usage?.users?.limit || 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {usage?.users?.percentage?.toFixed(1) || 0}% of team limit used
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {usage?.leads?.percentage >= 70 ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-yellow-900">Usage Alert</h3>
                  </div>
                  <p className="text-sm text-yellow-800">
                    You're using {usage?.leads?.percentage?.toFixed(1) || 0}% of your leads limit. Consider upgrading to avoid hitting your limit.
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-900">All Good</h3>
                  </div>
                  <p className="text-sm text-green-800">
                    Your usage is well within limits. Keep up the great work!
                  </p>
                </div>
              )}

              {usage?.properties?.percentage >= 70 ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="font-semibold text-yellow-900">Properties Alert</h3>
                  </div>
                  <p className="text-sm text-yellow-800">
                    You're using {usage?.properties?.percentage?.toFixed(1) || 0}% of your properties limit. Consider upgrading to avoid hitting your limit.
                  </p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <Info className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-blue-900">Properties Status</h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    Your properties usage is at {usage?.properties?.percentage?.toFixed(1) || 0}% of your limit.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;