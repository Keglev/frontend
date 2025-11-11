/**
 * @file auth/login.test.ts
 * @description Successful login and response validation tests
 * Tests for successful authentication, token handling, and JWT extraction
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../../../api/auth';
import apiClient from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Authentication - Login Function (Successful Cases)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('Successful Login', () => {
    // Test that login returns both token and role on successful response
    it('should return token and role on successful login', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('testuser', 'password123');

      expect(result).toEqual({
        token: mockToken,
        role: 'ROLE_ADMIN',
      });
    });

    // Test role extraction for user role from JWT payload
    it('should extract ROLE_USER from JWT token', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUk9MRV9VU0VSIn0.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('user', 'password');

      expect(result.role).toBe('ROLE_USER');
    });

    // Verify that API call is made with correct endpoint and parameters
    it('should make API call with correct endpoint and credentials', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const username = 'testuser';
      const password = 'password123';

      await login(username, password);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { username, password }
      );
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('Response Validation', () => {
    // Verify that response includes required fields with correct types
    it('should validate response structure', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('user', 'pass');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('role');
      expect(typeof result.token).toBe('string');
      expect(typeof result.role).toBe('string');
    });

    // Test that token is returned exactly as provided by server
    it('should return token exactly as provided by server', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9VU0VSIn0.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Success',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('user', 'pass');

      expect(result.token).toBe(mockToken);
    });
  });

  describe('Logging & Security', () => {
    // Verify that password is never exposed in function parameters
    it('should not expose password in authentication flow', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('testuser', 'secretpassword');

      // Verify API was called with credentials
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'secretpassword',
      });
      
      // Verify password is not returned in result
      expect(result).not.toHaveProperty('password');
      expect(result.token).toBeDefined();
      expect(result.role).toBeDefined();
    });
  });
});
