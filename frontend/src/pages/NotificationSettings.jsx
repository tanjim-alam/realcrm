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
  User,
  UserCheck,
  CheckSquare,
  Zap,
  AlertCircle,
  Shield,
  Activity,
  Save,
  TestTube,
  X,
  Plus
} from 'lucide-react';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    notificationEmail: '',
    email: {
      newLeads: true,
      newProperties: true,
      newTasks: true,
      systemUpdates: true,
      marketing: false
    },
    push: {
      newLeads: true,
      newProperties: true,
      newTasks: true,
      systemUpdates: true,
      marketing: false
    },
    frequency: 'immediate',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    reminderTimeline: {
      enabled: true,
      intervals: [
        { hours: 24, label: '24 hours' },
        { hours: 2, label: '2 hours' },
        { hours: 1, label: '1 hour' },
        { hours: 0.5, label: '30 minutes' }
      ]
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchReminderTimeline();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/notifications/settings');
      const data = response.data || {};
      setSettings({
        notificationEmail: data.notificationEmail || '',
        email: data.email || {
          newLeads: true,
          newProperties: true,
          newTasks: true,
          systemUpdates: true,
          marketing: false
        },
        push: data.push || {
          newLeads: true,
          newProperties: true,
          newTasks: true,
          systemUpdates: true,
          marketing: false
        },
        frequency: data.frequency || 'immediate',
        quietHours: data.quietHours || {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      });
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

  const fetchReminderTimeline = async () => {
    try {
      const response = await api.get('/notifications/reminder-timeline');
      setSettings(prev => ({
        ...prev,
        reminderTimeline: response.data || {
          enabled: true,
          intervals: [
            { hours: 24, label: '24 hours' },
            { hours: 2, label: '2 hours' },
            { hours: 1, label: '1 hour' },
            { hours: 0.5, label: '30 minutes' }
          ]
        }
      }));
    } catch (error) {
      console.error('Error fetching reminder timeline:', error);
      toast.error('Failed to fetch reminder timeline settings');
    }
  };

  const saveReminderTimeline = async () => {
    try {
      await api.put('/notifications/reminder-timeline', settings.reminderTimeline || {});
      toast.success('Reminder timeline saved successfully');
    } catch (error) {
      console.error('Error saving reminder timeline:', error);
      toast.error('Failed to save reminder timeline');
    }
  };

  const resetReminderTimeline = async () => {
    try {
      const response = await api.post('/notifications/reminder-timeline/reset');
      setSettings(prev => ({
        ...prev,
        reminderTimeline: response.data
      }));
      toast.success('Reminder timeline reset to default');
    } catch (error) {
      console.error('Error resetting reminder timeline:', error);
      toast.error('Failed to reset reminder timeline');
    }
  };

  const addReminderInterval = () => {
    setSettings(prev => ({
      ...prev,
      reminderTimeline: {
        ...prev.reminderTimeline,
        intervals: [
          ...(prev.reminderTimeline?.intervals || []),
          { hours: 1, label: '1 hour' }
        ]
      }
    }));
  };

  const removeReminderInterval = (index) => {
    setSettings(prev => ({
      ...prev,
      reminderTimeline: {
        ...prev.reminderTimeline,
        intervals: (prev.reminderTimeline?.intervals || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updateReminderInterval = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      reminderTimeline: {
        ...prev.reminderTimeline,
        intervals: (prev.reminderTimeline?.intervals || []).map((interval, i) =>
          i === index ? { ...interval, [field]: value } : interval
        )
      }
    }));
  };

  const handleTestEmail = async () => {
    if (!settings.notificationEmail) {
      toast.error('Please enter a notification email address first');
      return;
    }

    setTesting(true);
    try {
      await api.post('/notifications/test', {
        type: 'lead',
        platform: 'website',
        title: 'Test Notification',
        message: 'This is a test notification to verify your settings are working correctly.',
        email: settings.notificationEmail
      });
      toast.success('Test notification sent successfully!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send test notification';
      toast.error(errorMessage);
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
      newSettings[keys[0]] = { ...newSettings[keys[0]], [keys[1]]: value };
    } else if (keys.length === 3) {
      newSettings[keys[0]] = {
        ...newSettings[keys[0]],
        [keys[1]]: { ...newSettings[keys[0]][keys[1]], [keys[2]]: value }
      };
    }

    setSettings(newSettings);
  };

  const notificationTypes = [
    {
      key: 'newLeads',
      title: 'New Lead Notifications',
      description: 'Get notified when new leads are added',
      icon: User,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-800'
    },
    {
      key: 'leadAssignments',
      title: 'Lead Assignment Notifications',
      description: 'Get notified when leads are assigned to you',
      icon: UserCheck,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-800'
    },
    {
      key: 'taskAssignments',
      title: 'Task Assignment Notifications',
      description: 'Get notified when tasks are assigned to you',
      icon: CheckSquare,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-800'
    },
    {
      key: 'leadReminders',
      title: 'Lead Reminder Notifications',
      description: 'Get notified before lead reminder time ends',
      icon: Clock,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      textColor: 'text-orange-800'
    },
    {
      key: 'newProperties',
      title: 'New Property Notifications',
      description: 'Get notified when new properties are added',
      icon: Settings,
      color: 'from-yellow-500 to-amber-600',
      bgColor: 'from-yellow-50 to-amber-50',
      textColor: 'text-yellow-800'
    },
    {
      key: 'newTasks',
      title: 'Task Notifications',
      description: 'Get notified about new tasks and assignments',
      icon: Bell,
      color: 'from-purple-500 to-violet-600',
      bgColor: 'from-purple-50 to-violet-50',
      textColor: 'text-purple-800'
    },
    {
      key: 'systemUpdates',
      title: 'System Updates',
      description: 'Get notified about system updates and maintenance',
      icon: Clock,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'from-indigo-50 to-blue-50',
      textColor: 'text-indigo-800'
    },
    {
      key: 'marketing',
      title: 'Marketing Notifications',
      description: 'Get notified about marketing campaigns and promotions',
      icon: AlertCircle,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      textColor: 'text-orange-800'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
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
          </div>
        </div>
      </div>
    );
  };

  const NotificationCard = ({ notification }) => {
    const Icon = notification.icon;
    const isEnabled = settings.notifications[notification.key].enabled;

    return (
      <div className={`bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${isEnabled ? 'ring-2 ring-blue-200' : ''
        }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${notification.color} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                <p className="text-sm text-gray-500">{notification.description}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => handleInputChange(`notifications.${notification.key}.enabled`, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-500"></div>
            </label>
          </div>

          {isEnabled && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address (optional - uses default if empty)
                </label>
                <input
                  type="email"
                  value={settings.notifications[notification.key].email}
                  onChange={(e) => handleInputChange(`notifications.${notification.key}.email`, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  placeholder={settings.email || 'Enter email address'}
                />
              </div>

              {notification.key === 'dailySummary' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Send Time
                  </label>
                  <input
                    type="time"
                    value={settings.notifications.dailySummary.time}
                    onChange={(e) => handleInputChange('notifications.dailySummary.time', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              )}

              {notification.key === 'reminder' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Advance Notification Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={settings.notifications.reminder.advanceTime}
                    onChange={(e) => handleInputChange('notifications.reminder.advanceTime', parseInt(e.target.value) || 15)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="15"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How many minutes before the reminder time to send the notification (1-1440 minutes)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  const enabledCount = Object.values(settings.email || {}).filter(Boolean).length +
    Object.values(settings.push || {}).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Notification Settings
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Configure email notifications for your CRM activities</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={handleTestEmail}
                disabled={testing || !settings.notificationEmail}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:transform-none"
              >
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                {testing ? 'Sending...' : 'Test Notification'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:transform-none"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Enabled Notifications"
            value={enabledCount}
            icon={Bell}
            color="blue"
            subtitle={`of ${notificationTypes.length} types`}
          />
          <StatCard
            title="Email Configured"
            value={settings.notificationEmail ? 'Yes' : 'No'}
            icon={Mail}
            color={settings.notificationEmail ? 'green' : 'red'}
            subtitle={settings.notificationEmail ? 'Ready to send' : 'Not configured'}
          />
          <StatCard
            title="Test Status"
            value={testing ? 'Sending...' : 'Ready'}
            icon={Zap}
            color={testing ? 'orange' : 'purple'}
            subtitle="Send test email"
          />
        </div>

        {/* Email Configuration */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">Email Configuration</h2>
              <p className="text-gray-600">Set your notification email address</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notification Email Address
              </label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => handleInputChange('notificationEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter email address for notifications"
              />
              <p className="mt-2 text-sm text-gray-500">
                This email will be used for all notification types
              </p>
            </div>
          </div>
        </div>

        {/* Reminder Timeline Settings */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-900">Lead Reminder Timeline</h2>
                <p className="text-gray-600">Customize when you want to be reminded before lead reminder time</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetReminderTimeline}
                className="px-4 py-2 text-orange-600 bg-orange-100 hover:bg-orange-200 rounded-xl font-semibold transition-all duration-200"
              >
                Reset to Default
              </button>
              <button
                onClick={saveReminderTimeline}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Save Timeline
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enable Custom Timeline</h3>
                <p className="text-sm text-gray-600">Use your custom reminder intervals instead of default</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminderTimeline?.enabled || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    reminderTimeline: {
                      ...prev.reminderTimeline,
                      enabled: e.target.checked
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {settings.reminderTimeline?.enabled && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-gray-900">Reminder Intervals</h4>
                  <button
                    onClick={addReminderInterval}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Interval
                  </button>
                </div>

                <div className="space-y-3">
                  {(settings.reminderTimeline?.intervals || []).map((interval, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hours Before
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            max="168"
                            step="0.1"
                            value={interval.hours}
                            onChange={(e) => updateReminderInterval(index, 'hours', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="e.g., 2.5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Label
                          </label>
                          <input
                            type="text"
                            value={interval.label}
                            onChange={(e) => updateReminderInterval(index, 'label', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="e.g., 2.5 hours"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeReminderInterval(index)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        disabled={(settings.reminderTimeline?.intervals || []).length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                  <p className="font-medium mb-1">💡 Tips:</p>
                  <ul className="space-y-1">
                    <li>• Intervals are automatically sorted by time (longest first)</li>
                    <li>• Minimum: 0.1 hours (6 minutes), Maximum: 168 hours (1 week)</li>
                    <li>• You can add up to 10 reminder intervals</li>
                    <li>• Example: 24h, 2h, 1h, 30m for comprehensive reminders</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">Notification Types</h2>
              <p className="text-gray-600">Configure which notifications you want to receive</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notificationTypes.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.key}
                  className={`p-6 rounded-xl bg-gradient-to-br ${notification.bgColor} border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${notification.color} shadow-lg`}>
                        <Icon className={`h-6 w-6 ${notification.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{notification.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.email?.[notification.key] || false}
                          onChange={(e) => handleInputChange(`email.${notification.key}`, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Email</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.push?.[notification.key] || false}
                          onChange={(e) => handleInputChange(`push.${notification.key}`, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Push</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const newSettings = { ...settings };
                Object.keys(newSettings.email || {}).forEach(key => {
                  newSettings.email[key] = true;
                });
                Object.keys(newSettings.push || {}).forEach(key => {
                  newSettings.push[key] = true;
                });
                setSettings(newSettings);
              }}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Enable All Notifications
            </button>
            <button
              onClick={() => {
                const newSettings = { ...settings };
                Object.keys(newSettings.email || {}).forEach(key => {
                  newSettings.email[key] = false;
                });
                Object.keys(newSettings.push || {}).forEach(key => {
                  newSettings.push[key] = false;
                });
                setSettings(newSettings);
              }}
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <X className="h-5 w-5 mr-2" />
              Disable All Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;