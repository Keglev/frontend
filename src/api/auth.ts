// src/api/auth.ts
import apiClient from './apiClient';

interface LoginResponse {
  success: boolean;
  message: string;
  data: string; // JWT Token
}

export const login = async (username: string, password: string): Promise<{ token: string; role: string }> => {
  try {
    console.log('Initiating login request...');
    console.log('Username:', username); // Log the username being sent
    const response = await apiClient.post<LoginResponse>('http://localhost:8081/api/auth/login', { username, password });

    console.log('Server response received:', response.data);

    if (!response.data.success) {
      console.log('Login failed on server:', response.data.message); // Log failure from server
      throw new Error(response.data.message || 'Login failed');
    }

    const token = response.data.data; // Extract the token from the 'data' field
    console.log('Token extracted:', token);

    // Decode the JWT token to extract the role
    const decodedPayload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    console.log('Decoded JWT payload:', decodedPayload);

    const role = decodedPayload.role;
    console.log('Role extracted from token:', role);

    return { token, role };
  } catch (error) {
    console.error('Error during login process:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};


