// src/api/auth.ts
// This module handles user authentication requests, specifically the login process.
// It communicates with the backend API to verify credentials and retrieve a JWT token.

import apiClient from '../services/apiClient';

interface LoginResponse {
  success: boolean; // Indicates whether the login request was successful
  message: string; // Message from the server (e.g., error details or success confirmation)
  data: string; // JWT Token returned upon successful authentication
}

/**
 * Logs in the user by sending credentials to the authentication API.
 * If successful, returns the JWT token and the user's role.
 *
 * @param {string} username - The username entered by the user.
 * @param {string} password - The corresponding password.
 * @returns {Promise<{ token: string; role: string }>} - The JWT token and user role.
 * @throws {Error} - Throws an error if login fails or if the response is invalid.
 */
export const login = async (
  username: string,
  password: string
): Promise<{ token: string; role: string }> => {
  try {
    console.log('Initiating login request...');

    // Log the username for debugging purposes (DO NOT log passwords for security reasons)
    console.log('Username:', username);

    // Send a POST request to the backend authentication endpoint
    const response = await apiClient.post<LoginResponse>(
      'http://localhost:8081/api/auth/login',
      { username, password }
    );

    console.log('Server response received:', response.data);

    // Validate the response to check if authentication was successful
    if (!response.data.success) {
      console.log('Login failed on server:', response.data.message);
      throw new Error(response.data.message || 'Login failed');
    }

    // Extract JWT token from the response data
    const token = response.data.data;
    console.log('Token extracted:', token);

    // Decode the JWT token to extract user role
    // JWT consists of three parts: header.payload.signature
    const decodedPayload = JSON.parse(atob(token.split('.')[1])); // Decode base64 payload
    console.log('Decoded JWT payload:', decodedPayload);

    // Retrieve the user's role from the decoded token payload
    const role = decodedPayload.role;
    console.log('Role extracted from token:', role);

    // Return the extracted token and role to be used in authentication handling
    return { token, role };
  } catch (error) {
    console.error('Error during login process:', error);
    throw error; // Propagate error for higher-level handling
  }
};
