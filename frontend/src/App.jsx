import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Properties from './pages/Properties';
import Analytics from './pages/Analytics';
import EmailTemplates from './pages/EmailTemplates';
import EmailCampaigns from './pages/EmailCampaigns';
import CompanySettings from './pages/CompanySettings';
import Agents from './pages/Agents';
import FormBuilder from './pages/FormBuilder';
import LeadIntegration from './pages/LeadIntegration';
import Subscription from './pages/Subscription';
import Documents from './pages/Documents';
import LeadScoring from './pages/LeadScoring';
import SMS from './pages/SMS';
import NotificationSettings from './pages/NotificationSettings';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="leads"
                element={
                  <ProtectedRoute>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="properties"
                element={
                  <ProtectedRoute>
                    <Properties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="documents"
                element={
                  <ProtectedRoute>
                    <Documents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="lead-scoring"
                element={
                  <ProtectedRoute>
                    <LeadScoring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="sms"
                element={
                  <ProtectedRoute>
                    <SMS />
                  </ProtectedRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <ProtectedRoute>
                    <NotificationSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="email-templates"
                element={
                  <ProtectedRoute>
                    <EmailTemplates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="email-campaigns"
                element={
                  <ProtectedRoute>
                    <EmailCampaigns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tasks"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="company-settings"
                element={
                  <ProtectedRoute>
                    <CompanySettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="agents"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Agents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="form-builder"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <FormBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="lead-integration"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <LeadIntegration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="subscription"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <Subscription />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
