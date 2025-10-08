import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';
import {
  Link,
  Copy,
  Download,
  Upload,
  Code,
  Globe,
  Smartphone,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Zap,
  Activity,
  Settings,
  Shield,
  Play,
  Pause,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ArrowRight,
  Star,
  Users,
  BarChart3,
  Clock,
  TrendingUp,
  Database,
  Server,
  Key,
  Webhook,
  Layers,
  Target,
  MessageSquare,
  Calendar,
  FileText,
  MapPin,
  Phone,
  Building2,
  CreditCard,
  Lock,
  Unlock,
  CheckSquare,
  AlertTriangle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const LeadIntegration = () => {
  const { user, company } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [integrationCode, setIntegrationCode] = useState('');
  const [sources, setSources] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  const [integrations, setIntegrations] = useState([]);

  const platformIntegrations = [
    {
      id: 'wordpress',
      name: 'WordPress',
      description: 'Integrate with Contact Form 7, Gravity Forms, and Elementor',
      icon: Globe,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      status: 'active',
      leads: 1247,
      setupTime: '5 minutes',
      difficulty: 'Easy',
      features: ['Form Builder', 'Email Notifications', 'Spam Protection', 'Multi-step Forms'],
      code: `// Contact Form 7 Integration
add_action('wpcf7_mail_sent', 'send_to_crm');
function send_to_crm($contact_form) {
    $submission = WPCF7_Submission::get_instance();
    $data = $submission->get_posted_data();
    
    wp_remote_post('${webhookUrl}', array(
        'headers' => array('Content-Type' => 'application/json'),
        'body' => json_encode(array(
            'name' => $data['your-name'],
            'email' => $data['your-email'],
            'phone' => $data['your-phone'],
            'propertyId' => $data['property-id'], // Copy from Properties page PropertyId
            'companyId' => '${company?.id}',
            'apiKey' => '${apiKey}',
            'source' => 'wordpress'
        ))
    ));
}`,
      steps: [
        'Install Contact Form 7 plugin',
        'Create a new form',
        'Add the integration code to your theme',
        'Test the form submission'
      ]
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: 'Track leads from Google Ads campaigns and landing pages',
      icon: ExternalLink,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      status: 'active',
      leads: 892,
      setupTime: '10 minutes',
      difficulty: 'Medium',
      features: ['Conversion Tracking', 'Lead Quality Scoring', 'Campaign Attribution', 'ROI Analysis'],
      code: `// Google Ads Conversion Tracking
gtag('event', 'conversion', {
    'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL',
    'value': 1.0,
    'currency': 'USD',
    'transaction_id': 'unique_transaction_id'
});

// Send lead data to CRM
fetch('${webhookUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        propertyId: leadData.propertyId, // Copy from Properties page PropertyId
        source: 'google_ads',
        campaign: leadData.campaign,
        companyId: '${company?.id}',
        apiKey: '${apiKey}'
    })
});`,
      steps: [
        'Set up Google Ads conversion tracking',
        'Create conversion action',
        'Add tracking code to landing page',
        'Configure lead data mapping'
      ]
    },
    {
      id: 'meta-ads',
      name: 'Meta Ads',
      description: 'Capture leads from Facebook and Instagram advertising campaigns',
      icon: Smartphone,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      status: 'active',
      leads: 1563,
      setupTime: '8 minutes',
      difficulty: 'Easy',
      features: ['Lead Ads Integration', 'Custom Audiences', 'Lookalike Audiences', 'Retargeting'],
      code: `// Meta Lead Ads Webhook
app.post('/meta-lead-webhook', (req, res) => {
    const leadData = req.body;
    
    // Process Meta lead data
    const processedLead = {
        name: leadData.full_name,
        email: leadData.email,
        phone: leadData.phone_number,
        propertyId: leadData.propertyId, // Copy from Properties page PropertyId
        source: 'meta_ads',
        campaign_id: leadData.campaign_id,
        ad_id: leadData.ad_id,
        companyId: '${company?.id}',
        apiKey: '${apiKey}'
    };
    
    // Send to CRM
    fetch('${webhookUrl}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedLead)
    });
});`,
      steps: [
        'Create Facebook Lead Ads campaign',
        'Set up webhook endpoint',
        'Configure lead data mapping',
        'Test lead generation'
      ]
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync leads between HubSpot and your CRM system',
      icon: Database,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
      status: 'inactive',
      leads: 0,
      setupTime: '15 minutes',
      difficulty: 'Medium',
      features: ['Bidirectional Sync', 'Custom Properties', 'Workflow Automation', 'Lead Scoring'],
      code: `// HubSpot Integration
const hubspot = require('@hubspot/api-client');
const client = new hubspot.Client({ accessToken: 'YOUR_HUBSPOT_TOKEN' });

// Sync leads from HubSpot to CRM
async function syncHubSpotLeads() {
    const contacts = await client.crm.contacts.getAll();
    
    for (const contact of contacts) {
        await fetch('${webhookUrl}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: contact.properties.firstname + ' ' + contact.properties.lastname,
                email: contact.properties.email,
                phone: contact.properties.phone,
                propertyId: contact.properties.property_id, // Copy from Properties page PropertyId
                source: 'hubspot',
                companyId: '${company?.id}',
                apiKey: '${apiKey}'
            })
        });
    }
}`,
      steps: [
        'Create HubSpot developer account',
        'Generate API access token',
        'Set up webhook integration',
        'Configure data mapping'
      ]
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Integrate with Salesforce CRM for lead synchronization',
      icon: Building2,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'from-cyan-50 to-cyan-100',
      status: 'inactive',
      leads: 0,
      setupTime: '20 minutes',
      difficulty: 'Hard',
      features: ['Lead Sync', 'Opportunity Tracking', 'Custom Objects', 'Apex Integration'],
      code: `// Salesforce Apex Integration
@RestResource(urlMapping='/sync-leads/*')
global class LeadSyncController {
    @HttpPost
    global static void syncLeads() {
        List<Lead> leads = [SELECT Id, Name, Email, Phone FROM Lead WHERE IsConverted = false];
        
        for (Lead lead : leads) {
            HttpRequest req = new HttpRequest();
            req.setEndpoint('${webhookUrl}');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setBody(JSON.serialize(new Map<String, Object>{
                'name' => lead.Name,
                'email' => lead.Email,
                'phone' => lead.Phone,
                'source' => 'salesforce',
                'apiKey' => '${apiKey}'
            }));
            
            Http http = new Http();
            HttpResponse res = http.send(req);
        }
    }
}`,
      steps: [
        'Create Salesforce developer account',
        'Set up connected app',
        'Create Apex class for integration',
        'Configure webhook endpoint'
      ]
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect 5000+ apps with Zapier automation workflows',
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100',
      status: 'active',
      leads: 2341,
      setupTime: '3 minutes',
      difficulty: 'Easy',
      features: ['5000+ App Connections', 'Automated Workflows', 'Multi-step Zaps', 'Custom Triggers'],
      code: `// Zapier Webhook Configuration
{
    "name": "New Lead from Form",
    "trigger": {
        "type": "webhook",
        "url": "https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/",
        "method": "POST"
    },
    "action": {
        "type": "http",
        "url": "${webhookUrl}",
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "Bearer ${apiKey}"
        },
        "body": {
            "name": "{{name}}",
            "email": "{{email}}",
            "phone": "{{phone}}",
            "source": "zapier"
        }
    }
}`,
      steps: [
        'Create Zapier account',
        'Set up webhook trigger',
        'Configure CRM action',
        'Test the automation'
      ]
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Import leads from Mailchimp email campaigns and forms',
      icon: Mail,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
      status: 'active',
      leads: 567,
      setupTime: '5 minutes',
      difficulty: 'Easy',
      features: ['Email Campaign Tracking', 'Audience Sync', 'Form Integration', 'Automation Workflows'],
      code: `// Mailchimp Webhook Integration
app.post('/mailchimp-webhook', (req, res) => {
    const { type, data } = req.body;
    
    if (type === 'subscribe') {
        const subscriber = data;
        
        fetch('${webhookUrl}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: subscriber.merge_fields.FNAME + ' ' + subscriber.merge_fields.LNAME,
                email: subscriber.email_address,
                phone: subscriber.merge_fields.PHONE,
                propertyId: subscriber.merge_fields.PROPERTY_ID, // Copy from Properties page PropertyId
                source: 'mailchimp',
                list_id: subscriber.list_id,
                companyId: '${company?.id}',
                apiKey: '${apiKey}'
            })
        });
    }
});`,
      steps: [
        'Set up Mailchimp webhook',
        'Configure webhook URL',
        'Map subscriber data fields',
        'Test webhook integration'
      ]
    },
    {
      id: 'webflow',
      name: 'Webflow',
      description: 'Integrate with Webflow forms and CMS for lead capture',
      icon: Globe,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50 to-indigo-100',
      status: 'inactive',
      leads: 0,
      setupTime: '7 minutes',
      difficulty: 'Easy',
      features: ['Form Integration', 'CMS Sync', 'Custom Styling', 'No-Code Setup'],
      code: `// Webflow Form Integration
<script>
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[data-wf-form]');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const leadData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                propertyId: formData.get('propertyId'), // Copy from Properties page PropertyId
                source: 'webflow',
                companyId: '${company?.id}',
                apiKey: '${apiKey}'
            };
            
            try {
                await fetch('${webhookUrl}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(leadData)
                });
                
                // Show success message
                form.innerHTML = '<div class="success-message">Thank you! We\'ll be in touch soon.</div>';
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});
</script>`,
      steps: [
        'Create Webflow form',
        'Add custom code to site',
        'Configure form fields',
        'Test form submission'
      ]
    }
  ];

  useEffect(() => {
    generateApiKey();
    generateWebhookUrl();
    generateIntegrationCode();
    fetchSources();
    fetchProperties();
    setIntegrations(platformIntegrations);
  }, []);

  const generateApiKey = () => {
    const key = `sk_${company?.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setApiKey(key);
  };

  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin.replace('5173', '8080');
    setWebhookUrl(`${baseUrl}/api/webhooks/leads`);
  };

  const generateIntegrationCode = () => {
    const code = `<!-- Lead Capture Form Integration -->
<script>
async function submitLead(formData) {
  try {
    const response = await fetch('${webhookUrl}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${apiKey}'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyId: formData.propertyId, // Copy from Properties page PropertyId
        companyId: '${company?.id}',
        source: 'website',
        propertyType: formData.propertyType,
        location: formData.location,
        notes: formData.notes,
        apiKey: '${apiKey}'
      })
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Thank you! We will contact you soon.');
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
  }
}
</script>`;
    setIntegrationCode(code);
  };

  const fetchSources = async () => {
    try {
      const response = await api.get('/webhooks/sources');
      setSources(response.data);
    } catch (error) {
      console.error('Error fetching sources:', error);
      // Use dummy data if API fails
      setSources([
        { label: 'Website Forms', value: 'website' },
        { label: 'Google Ads', value: 'google_ads' },
        { label: 'Facebook Ads', value: 'meta_ads' },
        { label: 'Email Campaigns', value: 'email' },
        { label: 'Phone Calls', value: 'phone' },
        { label: 'Referrals', value: 'referral' },
        { label: 'Events', value: 'events' },
        { label: 'Social Media', value: 'social' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Use dummy data if API fails
      setProperties([
        { _id: '60f7b3b3b3b3b3b3b3b3b3b1', title: 'Sobha Scarlet Woods', location: { address: 'Whitefield, Bangalore' } },
        { _id: '60f7b3b3b3b3b3b3b3b3b3b2', title: 'Sobha Neopolis', location: { address: 'Electronic City, Bangalore' } },
        { _id: '60f7b3b3b3b3b3b3b3b3b3b3', title: 'Sobha Dream Gardens', location: { address: 'Sarjapur, Bangalore' } }
      ]);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadCode = () => {
    const blob = new Blob([integrationCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-integration.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Integration code downloaded!');
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600',
      cyan: 'from-cyan-500 to-cyan-600',
      yellow: 'from-yellow-500 to-yellow-600',
      pink: 'from-pink-500 to-pink-600'
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
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{trend}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PlatformCard = ({ integration, onActivate, onViewCode }) => {
    const Icon = integration.icon;
    const isActive = integration.status === 'active';

    return (
      <div className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 ${isActive ? 'border-green-200' : 'border-white/20'
        }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${integration.color} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
              <p className="text-sm text-gray-600">{integration.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isActive ? (
              <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </div>
            ) : (
              <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                <Pause className="h-3 w-3 mr-1" />
                Inactive
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{integration.leads.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{integration.setupTime}</p>
            <p className="text-xs text-gray-500">Setup Time</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Difficulty</span>
            <span className={`text-xs px-2 py-1 rounded-full ${integration.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
              integration.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
              {integration.difficulty}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Features</h4>
            <div className="flex flex-wrap gap-1">
              {integration.features.map((feature, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => onViewCode(integration)}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
            >
              <Code className="h-4 w-4 mr-2" />
              View Code
            </button>
            <button
              onClick={() => onActivate(integration)}
              className={`px-4 py-2 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center ${isActive
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                }`}
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
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
          <p className="mt-4 text-gray-600 text-center">Loading integrations...</p>
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
                Lead Integration
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Connect your CRM with 5000+ platforms and tools</p>
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
                onClick={() => setActiveTab('platforms')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'platforms'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  }`}
              >
                Platforms
              </button>
              <button
                onClick={() => setActiveTab('api')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${activeTab === 'api'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/50 text-gray-700 hover:bg-white/70'
                  }`}
              >
                API Docs
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Integrations"
            value={integrations.length}
            icon={Layers}
            color="blue"
            subtitle="Platforms available"
          />
          <StatCard
            title="Active Integrations"
            value={integrations.filter(i => i.status === 'active').length}
            icon={CheckCircle}
            color="green"
            subtitle="Currently connected"
            trend="+2 this week"
          />
          <StatCard
            title="Total Leads"
            value={integrations.reduce((sum, i) => sum + i.leads, 0).toLocaleString()}
            icon={Users}
            color="purple"
            subtitle="From all sources"
            trend="+15% this month"
          />
          <StatCard
            title="Success Rate"
            value="98.5%"
            icon={TrendingUp}
            color="orange"
            subtitle="Integration uptime"
          />
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Start */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Quick Start</h2>
                  <p className="text-gray-600">Get up and running in minutes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Get API Key</h3>
                  <p className="text-sm text-gray-600">Copy your unique API key for authentication</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Webhook className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Configure Webhook</h3>
                  <p className="text-sm text-gray-600">Set up your webhook URL for lead capture</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Add Code</h3>
                  <p className="text-sm text-gray-600">Integrate with your platform using our code</p>
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">API Configuration</h3>
                    <p className="text-sm text-gray-600">Your integration credentials</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="flex">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-4 py-3 border border-gray-200 border-l-0 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                      >
                        {showApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(apiKey, 'API Key')}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-r-xl hover:shadow-lg transition-all duration-200"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Keep this key secure. Use it to authenticate API requests.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={webhookUrl}
                        readOnly
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      />
                      <button
                        onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-r-xl hover:shadow-lg transition-all duration-200"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Send POST requests to this URL to create leads.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-gray-900">Integration Status</h3>
                    <p className="text-sm text-gray-600">Current platform connections</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {integrations.slice(0, 4).map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white/20">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${integration.color} shadow-lg`}>
                          <integration.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900">{integration.name}</p>
                          <p className="text-xs text-gray-500">{integration.leads} leads</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${integration.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {integration.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'platforms' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <PlatformCard
                  key={integration.id}
                  integration={integration}
                  onActivate={(integration) => {
                    const updatedIntegrations = integrations.map(i =>
                      i.id === integration.id
                        ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' }
                        : i
                    );
                    setIntegrations(updatedIntegrations);
                    toast.success(`${integration.name} ${integration.status === 'active' ? 'deactivated' : 'activated'}!`);
                  }}
                  onViewCode={(integration) => {
                    setIntegrationCode(integration.code);
                    setActiveTab('api');
                    toast.success(`${integration.name} code loaded!`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-8">
            {/* Integration Code */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 shadow-lg">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900">Integration Code</h3>
                      <p className="text-sm text-gray-600">Copy and paste this code into your platform</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(integrationCode, 'Integration code')}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </button>
                    <button
                      onClick={downloadCode}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto">
                  <pre className="text-sm">
                    <code>{integrationCode}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* API Documentation */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900">API Documentation</h3>
                  <p className="text-gray-600">Complete guide to integrating with our API</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Single Lead Creation</h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>POST</strong> {webhookUrl}
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        {`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "propertyId": "60f7b3b3b3b3b3b3b3b3b3b3", // Copy from Properties page PropertyId
  "companyId": "${company?.id}",
  "source": "website",
  "apiKey": "${apiKey}",
  "propertyType": "apartment",
  "location": "Downtown",
  "notes": "Interested in 3BHK"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Bulk Lead Import</h4>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <p className="text-sm text-gray-700 mb-4">
                      <strong>POST</strong> {webhookUrl.replace('/leads', '/leads/bulk')}
                    </p>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        {`{
  "leads": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "source": "google_ads"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567891",
      "source": "meta_ads"
    }
  ],
  "companyId": "${company?.id}",
  "apiKey": "${apiKey}"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Property Selection</h4>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <p className="text-sm text-gray-700 mb-4">
                      To associate leads with specific properties, use the propertyId field. You can get property IDs from the Properties page.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Available Properties:</h5>
                        <div className="space-y-2">
                          {properties.map(property => (
                            <div key={property._id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                              <div>
                                <span className="font-medium text-gray-900">{property.title}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  {property.location?.address || property.location}
                                </span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(property._id, 'Property ID')}
                                className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                                <span className="text-sm">Copy ID</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm text-yellow-800">
                              <strong>Note:</strong> The propertyId field is optional. If not provided, leads will be created without property association.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadIntegration;