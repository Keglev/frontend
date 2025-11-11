/**
 * @file auth.ts
 * @description
 * Authentication API service for user login and JWT token handling.
 *
 * **Responsibilities:**
 * - Handle user login requests to the backend
 * - Extract and decode JWT tokens from responses
 * - Parse user role from JWT payload
 * - Error handling and validation
 *
 * **Security Notes:**
 * - JWT tokens are decoded client-side (payload only, signature verification via backend)
 * - Passwords are never logged or stored locally
 * - Token should be stored securely (HttpOnly cookies preferred, localStorage fallback)
 *
 * @module auth
 * @requires ../services/apiClient
 */

import apiClient from '../services/apiClient';

/**
 * Login API response structure from backend
 * @interface LoginResponse
 */
interface LoginResponse {
  success: boolean;
  message: string;
  data: string;
}

/**
 * Authenticates user with credentials and returns JWT token with role.
 *
 * @async
 * @function login
 * @param {string} username - User's login username
 * @param {string} password - User's login password
 * @returns {Promise<{token: string, role: string}>} JWT token and user role
 * @throws {Error} Authentication failed, invalid credentials, or malformed response
 *
 * **Process:**
 * 1. Send POST request with credentials to /api/auth/login
 * 2. Validate response success flag
 * 3. Extract JWT token from response.data
 * 4. Decode JWT payload to extract user role
 * 5. Return token and role for application storage
 */
export const login = async (
  username: string,
  password: string
): Promise<{ token: string; role: string }> => {
  const response = await apiClient.post<LoginResponse>(
    '/api/auth/login',
    { username, password }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Login failed');
  }

  const token = response.data.data;
  const decodedPayload = JSON.parse(atob(token.split('.')[1]));
  const role = decodedPayload.role;

  return { token, role };
};
