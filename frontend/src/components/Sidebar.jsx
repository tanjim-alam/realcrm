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
  MessageCircle
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const mainNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Lead Scoring', href: '/lead-scoring', icon: Target },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Chat', href: '/chat', icon: MessageCircle },
    { name: 'SMS', href: '/sms', icon: MessageSquare },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Email Campaigns', href: '/email-campaigns', icon: Send },
    ...(user?.role === 'admin' ? [
      { name: 'Agents', href: '/agents', icon: UserCheck }
    ] : [])
  ];

  const settingsNavigation = [
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Email Templates', href: '/email-templates', icon: Mail },
    { name: 'Company Settings', href: '/company-settings', icon: Building },
    ...(user?.role === 'admin' ? [
      { name: 'Form Builder', href: '/form-builder', icon: Settings },
      { name: 'Lead Integration', href: '/lead-integration', icon: Link },
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
        className={`${
          isActive
            ? 'bg-primary-100 text-primary-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
        onClick={onClick}
      >
        <item.icon
          className={`${
            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
          } mr-4 flex-shrink-0 h-6 w-6`}
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
        className={`${
          isActive
            ? 'bg-primary-100 text-primary-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
      >
        <item.icon
          className={`${
            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
          } mr-3 flex-shrink-0 h-6 w-6`}
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
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Building2 className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">RealEstate CRM</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {/* Main Navigation */}
                {mainNavigation.map((item) => renderNavItem(item, () => setSidebarOpen(false)))}
                
                {/* Settings Dropdown */}
                <div>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`${
                      isSettingsActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center w-full px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <Settings
                      className={`${
                        isSettingsActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-4 flex-shrink-0 h-6 w-6`}
                    />
                    Settings
                    {settingsOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </button>
                  
                  {settingsOpen && (
                    <div className=" space-y-1">
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
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Building2 className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">RealEstate CRM</span>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {/* Main Navigation */}
                {mainNavigation.map((item) => renderNavItemDesktop(item))}
                
                {/* Settings Dropdown */}
                <div>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`${
                      isSettingsActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <Settings
                      className={`${
                        isSettingsActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Settings
                    {settingsOpen ? (
                      <ChevronDown className="ml-auto h-4 w-4" />
                    ) : (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </button>
                  
                  {settingsOpen && (
                    <div className="space-y-1">
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
