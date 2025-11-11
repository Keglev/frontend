/**
 * @file auth/jwt-decoding.test.ts
 * @description JWT token decoding and parsing tests
 * Tests for JWT payload extraction, role parsing, and various token formats
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../../../api/auth';
import apiClient from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Authentication - JWT Token Decoding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('JWT Payload Extraction', () => {
    // Test that various role formats are correctly extracted from JWT
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

    // Test that JWT with additional claims (userId, email, expiration) is handled correctly
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

    // Test standard JWT structure (header.payload.signature)
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

  describe('Edge Cases - Token Handling', () => {
    // Test that very long JWT tokens are handled correctly
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
    // Test that multiple concurrent login attempts work correctly
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

  describe('Edge Cases - Input Validation', () => {
    // Test that empty username is handled
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

    // Test that special characters in password are preserved
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
  });
});
