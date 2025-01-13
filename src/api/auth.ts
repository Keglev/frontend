// src/api/auth.ts
import apiClient from './apiClient';

interface LoginResponse {
  success: boolean;
  message: string;
  data: string; // JWT Token
}

export const login = async (username: string, password: string): Promise<{ token: string; role: string }> => {
  try {
    const response = await apiClient.post<LoginResponse>('http://localhost:8081/api/auth/login', { username, password });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Login failed');
    }

    const token = response.data.data; // Extract the token from the 'data' field
    const decodedPayload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const role = decodedPayload.role;

    return { token, role };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

