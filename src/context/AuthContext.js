import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/check');
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password, role }) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/${role.toLowerCase()}/login`,
        { email, password }
      );
      
      if (response.data) {
        const userData = {
          ...response.data,
          role: role.toUpperCase()
        };
        setUser(userData);
        return { 
          success: true,
          user: userData
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid credentials'
      };
    }
  };

  const register = async (userData) => {
    try {
      const { role, ...data } = userData;
      const response = await axios.post(
        `http://localhost:5000/api/auth/${role.toLowerCase()}/register`,
        data
      );
      
      if (response.data) {
        const userData = {
          ...response.data,
          role: role.toUpperCase()
        };
        setUser(userData);
        return { 
          success: true,
          user: userData
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
      setUser(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Logout failed'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 