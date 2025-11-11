/**
 * @file apiClient.ts
 * @description
 * Configured Axios HTTP client with authentication and error handling.
 *
 * **Features:**
 * - Base URL configuration via environment variable
 * - Automatic JWT token attachment from localStorage
 * - Request/response logging for debugging
 * - 401 Unauthorized token cleanup
 * - 2-minute request timeout
 *
 * **Interceptors:**
 * - Request: Attaches Bearer token to Authorization header
 * - Response: Logs responses, handles 401 by removing token
 *
 * **Error Handling:**
 * - Logs all API errors
 * - Clears token on 401 responses
 * - Propagates errors to ErrorBoundary
 *
 * @module
 */

import axios from 'axios';

/**
 * Configured Axios instance for API requests
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 120000,
});

/**
 * Request interceptor: Attach JWT token from localStorage
 * Logs request for debugging
 */
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
    throw error;
  }
);

/**
 * Response interceptor: Log responses and handle 401 Unauthorized
 * Removes token on 401 and propagates error
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Clear token on unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      console.warn('Unauthorized access - redirecting to login');
    }

    throw error;
  }
);

export default apiClient;
