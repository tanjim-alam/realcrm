import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-hot-toast';

const CompanySettings = () => {
  const [company, setCompany] = useState({
    name: '',
    email: '',
    phone: '',
    smtpConfig: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    try {
      const response = await api.get('/company');
      const companyData = response.data;
      
      // Ensure smtpConfig has the proper structure
      const companyWithDefaults = {
        name: companyData.name || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        smtpConfig: {
          host: companyData.smtpConfig?.host || 'smtp.gmail.com',
          port: companyData.smtpConfig?.port || 587,
          secure: companyData.smtpConfig?.secure || false,
          auth: {
            user: companyData.smtpConfig?.auth?.user || '',
            pass: companyData.smtpConfig?.auth?.pass || ''
          }
        }
      };
      
      setCompany(companyWithDefaults);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast.error('Error fetching company details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/company', company);
      toast.success('Company settings updated successfully!');
      console.log('Company updated:', response.data);
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Error updating company settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address to test');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/company/test-email', { to: testEmail });
      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Error sending test email');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setCompany(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild ? {
            ...prev[parent][child],
            [subChild]: type === 'checkbox' ? checked : value
          } : (type === 'checkbox' ? checked : value)
        }
      }));
    } else {
      setCompany(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Settings</h1>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
            <p className="text-sm text-gray-500">Update your company details and email configuration</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={company.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={company.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used as the sender email for campaigns
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={company.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* SMTP Configuration */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration (Optional)</h3>
              <p className="text-sm text-gray-500 mb-4">
                Configure your own SMTP server to send emails from your company domain. 
                If not configured, emails will be sent through Gmail SMTP.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    name="smtpConfig.host"
                    value={company.smtpConfig?.host || ''}
                    onChange={handleChange}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    name="smtpConfig.port"
                    value={company.smtpConfig?.port || ''}
                    onChange={handleChange}
                    placeholder="587"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="email"
                    name="smtpConfig.auth.user"
                    value={company.smtpConfig?.auth?.user || ''}
                    onChange={handleChange}
                    placeholder="your-email@yourcompany.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    name="smtpConfig.auth.pass"
                    value={company.smtpConfig?.auth?.pass || ''}
                    onChange={handleChange}
                    placeholder="Your SMTP password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="smtpConfig.secure"
                      checked={company.smtpConfig?.secure || false}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Use SSL/TLS (usually for port 465)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Test Email */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Email Configuration</h3>
              <div className="flex gap-4">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter email to test"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;
