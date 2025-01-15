// src/api/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    throw error; // Allow ErrorBoundary to handle
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      console.warn('Unauthorized access - redirecting to login');
    }
    throw error; // Pass to ErrorBoundary
  }
);

export default apiClient;
