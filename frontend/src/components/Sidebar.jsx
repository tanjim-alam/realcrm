import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Users,
  Building2,
  UserCheck,
  CreditCard,
  Link,
  Settings,
  X,
  ChevronRight,
  ChevronDown,
  BarChart3,
  Mail,
  Send,
  Building,
  FileText,
  Target,
  MessageSquare,
  Bell,
  CheckSquare,
  MessageCircle,
  Zap
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Lead Scoring', href: '/lead-scoring', icon: Target },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'SMS', href: '/sms', icon: MessageSquare },
    { name: 'Test Notifications', href: '/test-notifications', icon: Zap },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Email Campaigns', href: '/email-campaigns', icon: Send },
    { name: 'Lead Generation', href: '/lead-generation', icon: Target },
    { name: 'Landing Pages', href: '/landing-pages', icon: Link },
    { name: 'Dashboard Builder', href: '/dashboard-builder', icon: BarChart3 },
    ...(user?.role === 'admin' ? [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'Agents', href: '/agents', icon: UserCheck }
    ] : [])
  ];

  const settingsNavigation = [
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Email Templates', href: '/email-templates', icon: Mail },
    { name: 'Form Builder', href: '/form-builder', icon: Settings },
    { name: 'Lead Integration', href: '/lead-integration', icon: Link },
    ...(user?.role === 'admin' ? [
      { name: 'Email Campaigns', href: '/email-campaigns', icon: Send },
      { name: 'Company Settings', href: '/company-settings', icon: Building },
      { name: 'Subscription', href: '/subscription', icon: CreditCard }
    ] : [])
  ];

  // Check if any settings page is active
  const isSettingsActive = settingsNavigation.some(item => location.pathname === item.href);

  const renderNavItem = (item, onClick) => {
    const isActive = location.pathname === item.href;
    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        onClick={onClick}
      >
        <item.icon
          className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
            }`}
        />
        {item.name}
      </NavLink>
    );
  };

  const renderNavItemDesktop = (item) => {
    const isActive = location.pathname === item.href;
    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
      >
        <item.icon
          className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
            }`}
        />
        {item.name}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/95 backdrop-blur-md">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RealEstate CRM</span>
              </div>
              <nav className="mt-8 px-3 space-y-2">
                {/* Main Navigation */}
                {mainNavigation.map((item) => renderNavItem(item, () => setSidebarOpen(false)))}

                {/* Settings Dropdown */}
                <div className="pt-6">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isSettingsActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <Settings
                      className={`mr-3 h-5 w-5 ${isSettingsActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                    />
                    Settings
                    {settingsOpen ? (
                      <ChevronDown className="ml-auto h-5 w-5" />
                    ) : (
                      <ChevronRight className="ml-auto h-5 w-5" />
                    )}
                  </button>

                  {settingsOpen && (
                    <div className="pl-6 space-y-1 mt-2">
                      {settingsNavigation.map((item) => renderNavItem(item, () => setSidebarOpen(false)))}
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white/80 backdrop-blur-md border-r border-white/20 shadow-xl">
            <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RealEstate CRM</span>
              </div>
              <nav className="mt-8 flex-1 px-4 space-y-2">
                {/* Main Navigation */}
                {mainNavigation.map((item) => renderNavItemDesktop(item))}

                {/* Settings Dropdown */}
                <div className="pt-6">
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isSettingsActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <Settings
                      className={`mr-3 h-5 w-5 ${isSettingsActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                        }`}
                    />
                    Settings
                    {settingsOpen ? (
                      <ChevronDown className="ml-auto h-5 w-5" />
                    ) : (
                      <ChevronRight className="ml-auto h-5 w-5" />
                    )}
                  </button>

                  {settingsOpen && (
                    <div className="pl-6 space-y-1 mt-2">
                      {settingsNavigation.map((item) => renderNavItemDesktop(item))}
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;