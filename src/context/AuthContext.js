import React, { createContext, useState, useContext, useEffect } from 'react';
<<<<<<< HEAD
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
=======
import api from '../utils/axios';
>>>>>>> 24656c3 (frontend V 1.3)

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

<<<<<<< HEAD
  // Configure axios defaults
  axios.defaults.withCredentials = true;
  
=======
>>>>>>> 24656c3 (frontend V 1.3)
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get('http://localhost:5000/api/auth/check');
=======
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/check');
>>>>>>> 24656c3 (frontend V 1.3)
      if (response.data.authenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
<<<<<<< HEAD
      }
    } catch (error) {
      setUser(null);
=======
        localStorage.removeItem('token');
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
>>>>>>> 24656c3 (frontend V 1.3)
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password, role }) => {
    try {
<<<<<<< HEAD
      const response = await axios.post(
        `http://localhost:5000/api/auth/${role.toLowerCase()}/login`,
        { email, password }
      );
      
      if (response.data) {
        const userData = {
          ...response.data,
=======
      const response = await api.post(
        `/auth/${role.toLowerCase()}/login`,
        { email, password }
      );
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = {
          ...response.data.user,
>>>>>>> 24656c3 (frontend V 1.3)
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
<<<<<<< HEAD
      const response = await axios.post(
        `http://localhost:5000/api/auth/${role.toLowerCase()}/register`,
        data
      );
      
      if (response.data) {
        const userData = {
          ...response.data,
=======
      const response = await api.post(
        `/auth/${role.toLowerCase()}/register`,
        data
      );
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        const userData = {
          ...response.data.user,
>>>>>>> 24656c3 (frontend V 1.3)
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
<<<<<<< HEAD
      await axios.post('http://localhost:5000/api/auth/logout');
=======
      localStorage.removeItem('token');
>>>>>>> 24656c3 (frontend V 1.3)
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