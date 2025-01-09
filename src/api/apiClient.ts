import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/api', // Backend base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors if needed (e.g., for authentication)
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle global errors
    return Promise.reject(error);
  }
);

export default apiClient;
