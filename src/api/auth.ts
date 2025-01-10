// src/api/auth.ts
import apiClient from './apiClient';

export const login = async (username: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data; // Returns the token and possibly user details
  } catch (error) {
    console.error('Login failed:', error);
    throw error; // Let the calling code handle the error
  }
};
