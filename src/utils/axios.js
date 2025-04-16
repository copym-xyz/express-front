import axios from 'axios';

// Function to determine the base URL
function getBaseUrl() {
  // If we're running through ngrok
  if (window.location.hostname.includes('ngrok') || window.location.hostname !== 'localhost') {
    // Extract the base URL from the current page URL (protocol + hostname)
    const baseUrl = `${window.location.protocol}//${window.location.hostname}`;
    
    // If we're on a non-standard port, include it
    const port = window.location.port ? `:${window.location.port}` : '';
    
    return `${baseUrl}${port}/api`;
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000/api';
}

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to add the JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api; 