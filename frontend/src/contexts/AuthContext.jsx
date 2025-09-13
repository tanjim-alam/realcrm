import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedCompany = localStorage.getItem('company');

      if (storedToken && storedUser && storedCompany) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setCompany(JSON.parse(storedCompany));
          
          // Verify token is still valid
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          setCompany(response.data.company);
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: userData, company: companyData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('company', JSON.stringify(companyData));

      setToken(newToken);
      setUser(userData);
      setCompany(companyData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (companyName, adminName, email, password, phone) => {
    try {
      const response = await api.post('/auth/register', {
        companyName,
        adminName,
        email,
        password,
        phone
      });
      const { token: newToken, user: userData, company: companyData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('company', JSON.stringify(companyData));

      setToken(newToken);
      setUser(userData);
      setCompany(companyData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    setToken(null);
    setUser(null);
    setCompany(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateCompany = (companyData) => {
    setCompany(companyData);
    localStorage.setItem('company', JSON.stringify(companyData));
  };

  const value = {
    user,
    company,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateCompany,
    isAuthenticated: !!token && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
