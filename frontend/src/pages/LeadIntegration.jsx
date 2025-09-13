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
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const LeadIntegration = () => {
  const { user, company } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [integrationCode, setIntegrationCode] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateApiKey();
    generateWebhookUrl();
    generateIntegrationCode();
    fetchSources();
  }, []);

  const generateApiKey = () => {
    // In production, this should come from the backend
    const key = `sk_${company?.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setApiKey(key);
  };

  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin.replace('5173', '5000');
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
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyId: '${company?.id}',
        source: 'website', // Change based on your source
        apiKey: '${apiKey}',
        budget: formData.budget,
        propertyType: formData.propertyType,
        location: formData.location,
        notes: formData.notes
      })
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Thank you! We will contact you soon.');
      // Reset form or redirect
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Something went wrong. Please try again.');
  }
}
</script>

<!-- Example HTML Form -->
<form onsubmit="event.preventDefault(); submitLead({
  name: document.getElementById('name').value,
  email: document.getElementById('email').value,
  phone: document.getElementById('phone').value,
  budget: document.getElementById('budget').value,
  propertyType: document.getElementById('propertyType').value,
  location: document.getElementById('location').value,
  notes: document.getElementById('notes').value
});">
  <input type="text" id="name" placeholder="Full Name" required>
  <input type="email" id="email" placeholder="Email" required>
  <input type="tel" id="phone" placeholder="Phone">
  <input type="number" id="budget" placeholder="Budget">
  <select id="propertyType">
    <option value="apartment">Apartment</option>
    <option value="house">House</option>
    <option value="condo">Condo</option>
  </select>
  <input type="text" id="location" placeholder="Preferred Location">
  <textarea id="notes" placeholder="Additional Notes"></textarea>
  <button type="submit">Submit</button>
</form>`;
    
    setIntegrationCode(code);
  };

  const fetchSources = async () => {
    try {
      const response = await api.get('/webhooks/sources');
      setSources(response.data);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
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

  const integrationExamples = [
    {
      title: 'WordPress Form',
      description: 'Integrate with Contact Form 7 or Gravity Forms',
      icon: <Globe className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Google Ads',
      description: 'Track leads from Google Ads campaigns',
      icon: <ExternalLink className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Meta Ads',
      description: 'Capture leads from Facebook/Instagram ads',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Email Marketing',
      description: 'Import leads from email campaigns',
      icon: <Mail className="h-6 w-6" />,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Lead Integration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Integrate leads from multiple sources into your CRM
        </p>
      </div>

      {/* API Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="input-field rounded-r-none"
                />
                <button
                  onClick={() => copyToClipboard(apiKey, 'API Key')}
                  className="btn-secondary rounded-l-none border-l-0"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Keep this key secure. Use it to authenticate API requests.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="input-field rounded-r-none"
                />
                <button
                  onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                  className="btn-secondary rounded-l-none border-l-0"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Send POST requests to this URL to create leads.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Examples</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {integrationExamples.map((example, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className={`p-2 rounded-lg ${example.color} mr-3`}>
                    {example.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{example.title}</h4>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{example.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Code */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Integration Code</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => copyToClipboard(integrationCode, 'Integration code')}
              className="btn-secondary flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </button>
            <button
              onClick={downloadCode}
              className="btn-secondary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{integrationCode}</code>
          </pre>
        </div>
      </div>

      {/* API Documentation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">Single Lead Creation</h4>
            <div className="bg-gray-50 p-3 rounded-lg mt-2">
              <p className="text-sm text-gray-600 mb-2">
                <strong>POST</strong> {webhookUrl}
              </p>
              <pre className="text-xs text-gray-700">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "companyId": "${company?.id}",
  "source": "website",
  "apiKey": "${apiKey}",
  "budget": 500000,
  "propertyType": "apartment",
  "location": "Downtown",
  "notes": "Interested in 3BHK"
}`}
              </pre>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900">Bulk Lead Import</h4>
            <div className="bg-gray-50 p-3 rounded-lg mt-2">
              <p className="text-sm text-gray-600 mb-2">
                <strong>POST</strong> {webhookUrl.replace('/leads', '/leads/bulk')}
              </p>
              <pre className="text-xs text-gray-700">
{`{
  "leads": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "source": "google_ads",
      "budget": 500000
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567891",
      "source": "meta_ads",
      "budget": 750000
    }
  ],
  "companyId": "${company?.id}",
  "apiKey": "${apiKey}"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Available Sources */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Lead Sources</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sources.map((source, index) => (
            <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">{source.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-900">Integration Tips</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Always validate form data before sending to the API</li>
              <li>• Use HTTPS in production for secure data transmission</li>
              <li>• Implement proper error handling in your forms</li>
              <li>• Test the integration with sample data first</li>
              <li>• Monitor your lead limits to avoid hitting subscription limits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadIntegration;
