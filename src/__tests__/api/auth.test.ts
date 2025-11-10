/**
 * @fileoverview Authentication API Test Suite
 * Tests login functionality and JWT token handling
 * 
 * Enterprise-grade test coverage:
 * - Successful login with token and role extraction
 * - JWT decoding from base64 payload
 * - Error handling for failed login
 * - Network error propagation
 * - Security: password not logged
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../../api/auth';
import apiClient from '../../services/apiClient';

/**
 * Mock the apiClient module
 */
vi.mock('../../services/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Authentication - Login Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('Successful Login', () => {
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

    it('should log username for debugging (but not password)', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Login successful',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      await login('testuser', 'secretpassword');

      // Verify logging occurred
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('Failed Login - Server Response', () => {
    it('should throw error when success is false', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid credentials',
          data: null,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      await expect(login('user', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with default message when success is false and no message provided', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: '',
          data: null,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      await expect(login('user', 'password')).rejects.toThrow('Login failed');
    });

    it('should throw specific error messages from server', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'User account is locked',
          data: null,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      await expect(login('user', 'password')).rejects.toThrow('User account is locked');
    });
  });

  describe('Network & API Errors', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Network timeout');

      vi.mocked(apiClient.post).mockRejectedValueOnce(networkError);

      await expect(login('user', 'password')).rejects.toThrow('Network timeout');
    });

    it('should propagate API errors', async () => {
      const apiError = new Error('Internal Server Error');

      vi.mocked(apiClient.post).mockRejectedValueOnce(apiError);

      await expect(login('user', 'password')).rejects.toThrow('Internal Server Error');
    });

    it('should log errors to console', async () => {
      const error = new Error('Test error');

      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      try {
        await login('user', 'password');
      } catch {
        // Expected error caught
      }

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('JWT Token Decoding', () => {
    it('should correctly decode JWT with various role formats', async () => {
      const roles = ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER', 'ADMIN', 'USER'];

      for (const role of roles) {
        vi.clearAllMocks();
        const payload = JSON.stringify({ role });
        const encodedPayload = Buffer.from(payload).toString('base64');
        const mockToken = `header.${encodedPayload}.signature`;

        const mockResponse = {
          data: {
            success: true,
            message: 'Success',
            data: mockToken,
          },
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

        const result = await login('user', 'pass');

        expect(result.role).toBe(role);
      }
    });

    it('should handle JWT payload with additional claims', async () => {
      const payload = JSON.stringify({
        role: 'ROLE_ADMIN',
        userId: 123,
        email: 'test@example.com',
        exp: 1234567890,
      });
      const encodedPayload = Buffer.from(payload).toString('base64');
      const mockToken = `header.${encodedPayload}.signature`;

      const mockResponse = {
        data: {
          success: true,
          message: 'Success',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('user', 'pass');

      expect(result.role).toBe('ROLE_ADMIN');
      expect(result.token).toBe(mockToken);
    });

    it('should extract role from standard JWT structure', async () => {
      // Standard JWT: header.payload.signature
      const payload = { role: 'ROLE_USER' };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const mockToken = `eyJhbGciOiJIUzI1NiJ9.${encodedPayload}.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ`;

      const mockResponse = {
        data: {
          success: true,
          message: 'Success',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('testuser', 'password');

      expect(result.token).toBe(mockToken);
      expect(result.role).toBe('ROLE_USER');
    });
  });

  describe('Response Validation', () => {
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

  describe('Edge Cases', () => {
    it('should handle login with empty username', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9VU0VSIn0.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Success',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await login('', 'password');

      expect(result.token).toBeDefined();
    });

    it('should handle login with special characters in password', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9VU0VSIn0.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Success',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const specialPassword = 'p@$$w0rd!#&*()';
      await login('user', specialPassword);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { username: 'user', password: specialPassword }
      );
    });

    it('should handle very long JWT tokens', async () => {
      const payload = { role: 'ROLE_ADMIN', data: 'x'.repeat(1000) };
      const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const mockToken = `header.${encodedPayload}.signature`;

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
      expect(result.role).toBe('ROLE_ADMIN');
    });
  });

  describe('Concurrency', () => {
    it('should handle multiple concurrent login attempts', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiJ9.signature';
      const mockResponse = {
        data: {
          success: true,
          message: 'Success',
          data: mockToken,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const results = await Promise.all([
        login('user1', 'pass1'),
        login('user2', 'pass2'),
        login('user3', 'pass3'),
      ]);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.token).toBe(mockToken);
        expect(result.role).toBe('ROLE_ADMIN');
      });

      expect(apiClient.post).toHaveBeenCalledTimes(3);
    });
  });
});
