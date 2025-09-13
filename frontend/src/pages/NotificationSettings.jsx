import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { toast } from 'react-hot-toast';
import {
  Mail,
  Bell,
  Settings,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    email: '',
    notifications: {
      newLead: { enabled: true, email: '' },
      leadStatusChange: { enabled: false, email: '' },
      leadAssignment: { enabled: false, email: '' },
      dailySummary: { enabled: false, email: '', time: '09:00' },
      reminder: { enabled: true, email: '', advanceTime: 15 }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/notifications/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast.error('Failed to fetch notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/notifications/settings', settings);
      toast.success('Notification settings saved successfully');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.email) {
      toast.error('Please enter an email address first');
      return;
    }

    setTesting(true);
    try {
      await api.post('/notifications/test', { email: settings.email });
      toast.success('Test email sent successfully!');
    } catch (error) {
      console.error('Error sending test email:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send test email';
      const errorDetails = error.response?.data?.details || '';
      toast.error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    
    if (keys.length === 1) {
      newSettings[keys[0]] = value;
    } else if (keys.length === 2) {
      newSettings[keys[0]][keys[1]] = value;
    } else if (keys.length === 3) {
      newSettings[keys[0]][keys[1]][keys[2]] = value;
    }
    
    setSettings(newSettings);
  };

  const getNotificationEmail = (notificationType) => {
    return settings.notifications[notificationType].email || settings.email;
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
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure email notifications for your CRM activities
        </p>
      </div>

      {/* Main Settings */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Mail className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-lg font-medium text-gray-900">Email Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Notification Email
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field"
              placeholder="Enter email address for notifications"
            />
            <p className="mt-1 text-sm text-gray-500">
              This email will be used for all notifications unless overridden below
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleTestEmail}
              disabled={testing || !settings.email}
              className="btn-secondary flex items-center"
            >
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {testing ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-6">
        {/* New Lead Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">New Lead Notifications</h3>
                <p className="text-sm text-gray-500">Get notified when new leads are added</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.newLead.enabled}
                onChange={(e) => handleInputChange('notifications.newLead.enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.notifications.newLead.enabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (optional - uses default if empty)
              </label>
              <input
                type="email"
                value={settings.notifications.newLead.email}
                onChange={(e) => handleInputChange('notifications.newLead.email', e.target.value)}
                className="input-field"
                placeholder={settings.email || 'Enter email address'}
              />
            </div>
          )}
        </div>

        {/* Lead Status Change Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Status Change Notifications</h3>
                <p className="text-sm text-gray-500">Get notified when lead status changes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.leadStatusChange.enabled}
                onChange={(e) => handleInputChange('notifications.leadStatusChange.enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.notifications.leadStatusChange.enabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (optional - uses default if empty)
              </label>
              <input
                type="email"
                value={settings.notifications.leadStatusChange.email}
                onChange={(e) => handleInputChange('notifications.leadStatusChange.email', e.target.value)}
                className="input-field"
                placeholder={settings.email || 'Enter email address'}
              />
            </div>
          )}
        </div>

        {/* Lead Assignment Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Assignment Notifications</h3>
                <p className="text-sm text-gray-500">Get notified when leads are assigned to agents</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.leadAssignment.enabled}
                onChange={(e) => handleInputChange('notifications.leadAssignment.enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.notifications.leadAssignment.enabled && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address (optional - uses default if empty)
              </label>
              <input
                type="email"
                value={settings.notifications.leadAssignment.email}
                onChange={(e) => handleInputChange('notifications.leadAssignment.email', e.target.value)}
                className="input-field"
                placeholder={settings.email || 'Enter email address'}
              />
            </div>
          )}
        </div>

        {/* Daily Summary Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Daily Summary</h3>
                <p className="text-sm text-gray-500">Get daily summary of CRM activities</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.dailySummary.enabled}
                onChange={(e) => handleInputChange('notifications.dailySummary.enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.notifications.dailySummary.enabled && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (optional - uses default if empty)
                </label>
                <input
                  type="email"
                  value={settings.notifications.dailySummary.email}
                  onChange={(e) => handleInputChange('notifications.dailySummary.email', e.target.value)}
                  className="input-field"
                  placeholder={settings.email || 'Enter email address'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send Time
                </label>
                <input
                  type="time"
                  value={settings.notifications.dailySummary.time}
                  onChange={(e) => handleInputChange('notifications.dailySummary.time', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}
        </div>

        {/* Reminder Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Reminder Notifications</h3>
                <p className="text-sm text-gray-500">Get notified when lead reminders are due</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.reminder.enabled}
                onChange={(e) => handleInputChange('notifications.reminder.enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.notifications.reminder.enabled && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (optional - uses default if empty)
                </label>
                <input
                  type="email"
                  value={settings.notifications.reminder.email}
                  onChange={(e) => handleInputChange('notifications.reminder.email', e.target.value)}
                  className="input-field"
                  placeholder={settings.email || 'Enter email address'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Notification Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={settings.notifications.reminder.advanceTime}
                  onChange={(e) => handleInputChange('notifications.reminder.advanceTime', parseInt(e.target.value) || 15)}
                  className="input-field"
                  placeholder="15"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How many minutes before the reminder time to send the notification (1-1440 minutes)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;


