import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Make request with token in headers
      const authResponse = await api.get('/auth/check', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (authResponse.data.authenticated) {
        setUser(authResponse.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password, role = 'user' }) => {
    try {
      console.log(`Attempting login for ${email} with role ${role}`);
      
      const response = await api.post(
        `/auth/${role.toLowerCase()}/login`,
        { email, password }
      );
      
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = {
          ...response.data.user,
          role: role.toUpperCase()
        };
        setUser(userData);
        setIsAuthenticated(true);
        return { 
          success: true,
          user: userData
        };
      }
      
      return {
        success: false,
        error: 'Login failed - no token received'
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || 
                          (error.response?.status === 401 ? 'Invalid credentials' : 
                           'Server error - please try again');
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (userData) => {
    try {
      const { role, ...data } = userData;
      const response = await api.post(
        `/auth/${role.toLowerCase()}/register`,
        data
      );
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = {
          ...response.data.user,
          role: role.toUpperCase()
        };
        setUser(userData);
        setIsAuthenticated(true);
        return { 
          success: true,
          user: userData
        };
      }
      
      return {
        success: false,
        error: 'Registration failed - no token received'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still remove token and user state even if the logout request fails
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      return {
        success: false,
        error: error.response?.data?.message || 'Logout failed'
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 