import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();


  // Don't show layout for auth pages
  if (!isAuthenticated || location.pathname === '/login' || location.pathname === '/register') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar setSidebarOpen={setSidebarOpen} />

          <main className="flex-1 relative overflow-y-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-blue-50/50 to-indigo-100/50 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <Outlet />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
