import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-hot-toast';
import {
  Building2,
  Mail,
  Phone,
  Server,
  Shield,
  CheckCircle,
  AlertCircle,
  Save,
  Send,
  Settings,
  Globe,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Activity,
  Users,
  Calendar
} from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    fetchCompany();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasChanges) {
      const timeoutId = setTimeout(() => {
        handleAutoSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [company, autoSave, hasChanges]);

  const fetchCompany = async () => {
    try {
      const response = await api.get('/company');
      const companyData = response.data;

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
      setOriginalData(companyWithDefaults);
    } catch (error) {
      console.error('Error fetching company:', error);
      toast.error('Error fetching company details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveCompany();
  };

  const saveCompany = async () => {
    setLoading(true);
    try {
      const response = await api.put('/company', company);
      toast.success('Company settings updated successfully!');
      setOriginalData(company);
      setHasChanges(false);
      setLastSaved(new Date());
      console.log('Company updated:', response.data);
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Error updating company settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (hasChanges) {
      try {
        await api.put('/company', company);
        setOriginalData(company);
        setHasChanges(false);
        setLastSaved(new Date());
        toast.success('Settings auto-saved!', { duration: 2000 });
      } catch (error) {
        console.error('Auto-save error:', error);
        toast.error('Auto-save failed');
      }
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
      setTestEmail('');
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

    setHasChanges(true);
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, status }) => {
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
            {status && (
              <div className="flex items-center mt-1">
                {status === 'active' ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs ${status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required = false, icon: Icon, helpText, className = '' }) => (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200 ${className}`}
        />
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );

  const PasswordField = ({ label, name, value, onChange, placeholder, required = false, helpText }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Company Settings
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your company information and email configuration</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoSave" className="text-sm font-medium text-gray-700">
                  Auto-save
                </label>
              </div>
              {lastSaved && (
                <div className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Company Status"
            value="Active"
            icon={Building2}
            color="green"
            status="active"
          />
          <StatCard
            title="Email Configuration"
            value={company.smtpConfig?.host ? 'Custom SMTP' : 'Default Gmail'}
            icon={Mail}
            color={company.smtpConfig?.host ? 'blue' : 'orange'}
            subtitle={company.smtpConfig?.host || 'smtp.gmail.com'}
          />
          <StatCard
            title="Security Level"
            value={company.smtpConfig?.secure ? 'SSL/TLS' : 'TLS'}
            icon={Shield}
            color="purple"
            subtitle={`Port ${company.smtpConfig?.port || 587}`}
          />
          <StatCard
            title="Auto-save"
            value={autoSave ? 'Enabled' : 'Disabled'}
            icon={Zap}
            color={autoSave ? 'green' : 'gray'}
            subtitle={hasChanges ? 'Changes pending' : 'Up to date'}
          />
        </div>

        {/* Main Settings Form */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
          <div className="p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                <p className="text-gray-600">Update your company details and email configuration</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Company Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Company Name"
                    name="name"
                    value={company.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                    icon={Building2}
                    helpText="This will be displayed in emails and campaigns"
                  />

                  <InputField
                    label="Company Email"
                    name="email"
                    type="email"
                    value={company.email}
                    onChange={handleChange}
                    placeholder="company@example.com"
                    required
                    icon={Mail}
                    helpText="This will be used as the sender email for campaigns"
                  />

                  <InputField
                    label="Company Phone"
                    name="phone"
                    type="tel"
                    value={company.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    icon={Phone}
                    helpText="Optional contact number for your company"
                  />
                </div>
              </div>

              {/* SMTP Configuration */}
              <div className="space-y-6 border-t pt-8">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 shadow-lg">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
                    <p className="text-sm text-gray-600">
                      Configure your own SMTP server to send emails from your company domain
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="SMTP Host"
                      name="smtpConfig.host"
                      value={company.smtpConfig?.host || ''}
                      onChange={handleChange}
                      placeholder="smtp.gmail.com"
                      icon={Server}
                      helpText="Your SMTP server hostname"
                    />

                    <InputField
                      label="SMTP Port"
                      name="smtpConfig.port"
                      type="number"
                      value={company.smtpConfig?.port || ''}
                      onChange={handleChange}
                      placeholder="587"
                      icon={Globe}
                      helpText="Usually 587 for TLS or 465 for SSL"
                    />

                    <InputField
                      label="SMTP Username"
                      name="smtpConfig.auth.user"
                      type="email"
                      value={company.smtpConfig?.auth?.user || ''}
                      onChange={handleChange}
                      placeholder="your-email@yourcompany.com"
                      icon={Mail}
                      helpText="Your SMTP authentication email"
                    />

                    <PasswordField
                      label="SMTP Password"
                      name="smtpConfig.auth.pass"
                      value={company.smtpConfig?.auth?.pass || ''}
                      onChange={handleChange}
                      placeholder="Your SMTP password"
                      helpText="App password for Gmail or your SMTP password"
                    />

                    <div className="md:col-span-2">
                      <label className="flex items-center p-4 bg-white/50 rounded-xl border border-gray-200 hover:bg-white/70 transition-all duration-200">
                        <input
                          type="checkbox"
                          name="smtpConfig.secure"
                          checked={company.smtpConfig?.secure || false}
                          onChange={handleChange}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Use SSL/TLS</span>
                          <p className="text-xs text-gray-500">Enable for port 465, disable for port 587</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Email */}
              <div className="space-y-6 border-t pt-8">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Test Email Configuration</h3>
                    <p className="text-sm text-gray-600">Send a test email to verify your configuration</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter email to test"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center"
                    >
                      {loading ? (
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5 mr-2" />
                      )}
                      {loading ? 'Sending...' : 'Send Test Email'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={fetchCompany}
                  className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button
                  type="submit"
                  disabled={loading || !hasChanges}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none flex items-center"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;