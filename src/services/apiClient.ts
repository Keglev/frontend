import axios from 'axios';

/**
 * Axios instance for handling API requests.
 * 
 * This client is configured to:
 * - Use a base URL for all API requests.
 * - Attach a JWT token from local storage for authentication.
 * - Log requests and responses for debugging.
 * - Handle errors, including automatic token removal on unauthorized access.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api', // Base URL for backend API requests
  timeout: 120000, // Wait 2 minutes seconds before timing out
});

/**
 * Request Interceptor:
 * - Attaches the Authorization header if a token is found in local storage.
 * - Logs the request configuration for debugging.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach JWT token to request headers
    }
    console.log('API Request:', config);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    throw error; // Allow ErrorBoundary to handle the error
  }
);

/**
 * Response Interceptor:
 * - Logs successful API responses for debugging.
 * - Handles errors, removing the token if the response status is 401 (Unauthorized).
 */
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // If the response indicates an unauthorized request, remove the token and log the event.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      console.warn('Unauthorized access - redirecting to login');
    }

    throw error; // Pass the error to be handled by ErrorBoundary
  }
);

export default apiClient;
