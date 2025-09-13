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
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const Subscription = () => {
  const { company } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const [subscriptionResponse, usageResponse, plansResponse] = await Promise.all([
        api.get('/subscription/status'),
        api.get('/subscription/usage'),
        api.get('/subscription/plans')
      ]);

      setSubscription(subscriptionResponse.data);
      setUsage(usageResponse.data);
      setPlans(plansResponse.data);
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
        plan: plan.plan,
        duration: 30 // 30 days
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
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
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
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription plan and view usage statistics
        </p>
      </div>

      {/* Current Plan */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            subscription?.plan === 'premium' ? 'bg-purple-100 text-purple-800' :
            subscription?.plan === 'basic' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {subscription?.plan === 'premium' && <Crown className="h-4 w-4 mr-1" />}
            {subscription?.plan === 'basic' && <Star className="h-4 w-4 mr-1" />}
            {subscription?.plan?.charAt(0).toUpperCase() + subscription?.plan?.slice(1)} Plan
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {subscription?.features?.maxLeads === -1 ? '∞' : subscription?.features?.maxLeads}
            </div>
            <div className="text-sm text-gray-500">Max Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {subscription?.features?.maxProperties === -1 ? '∞' : subscription?.features?.maxProperties}
            </div>
            <div className="text-sm text-gray-500">Max Properties</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {subscription?.features?.maxUsers === -1 ? '∞' : subscription?.features?.maxUsers}
            </div>
            <div className="text-sm text-gray-500">Max Users</div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {usage && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Leads</span>
                <span>{usage.usage.leads.used} / {usage.usage.leads.limit === -1 ? '∞' : usage.usage.leads.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(usage.usage.leads.percentage)}`}
                  style={{ width: `${getUsagePercentage(usage.usage.leads.used, usage.usage.leads.limit)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Properties</span>
                <span>{usage.usage.properties.used} / {usage.usage.properties.limit === -1 ? '∞' : usage.usage.properties.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(usage.usage.properties.percentage)}`}
                  style={{ width: `${getUsagePercentage(usage.usage.properties.used, usage.usage.properties.limit)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Users</span>
                <span>{usage.usage.users.used} / {usage.usage.users.limit === -1 ? '∞' : usage.usage.users.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageColor(usage.usage.users.percentage)}`}
                  style={{ width: `${getUsagePercentage(usage.usage.users.used, usage.usage.users.limit)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.plan}
              className={`card relative ${
                plan.plan === subscription?.plan ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              {plan.plan === subscription?.plan && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Current
                  </span>
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/{plan.duration.toLowerCase()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">
                    {plan.features.maxUsers === -1 ? 'Unlimited' : plan.features.maxUsers} Users
                  </span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">
                    {plan.features.maxProperties === -1 ? 'Unlimited' : plan.features.maxProperties} Properties
                  </span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">
                    {plan.features.maxLeads === -1 ? 'Unlimited' : plan.features.maxLeads} Leads
                  </span>
                </div>
                <div className="flex items-center">
                  {plan.features.hasAnalytics ? (
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400 mr-3" />
                  )}
                  <span className="text-sm text-gray-600">Analytics</span>
                </div>
                <div className="flex items-center">
                  {plan.features.hasCustomBranding ? (
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400 mr-3" />
                  )}
                  <span className="text-sm text-gray-600">Custom Branding</span>
                </div>
              </div>
              
              <button
                onClick={() => handleActivatePlan(plan)}
                disabled={plan.plan === subscription?.plan || activating}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  plan.plan === subscription?.plan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {activating ? 'Activating...' : 
                 plan.plan === subscription?.plan ? 'Current Plan' : 
                 'Activate Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
