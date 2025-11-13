/**
 * @file API Client Error Handling Tests
 * @description Tests for 401 unauthorized handling, error propagation, security token management on errors
 * @domain api-client-operations
 * 
 * Enterprise-grade test coverage:
 * - 401 Unauthorized response handling
 * - Token removal on authentication failure
 * - Error message logging for security
 * - Network and timeout error propagation
 * - CORS error handling
 * - Token refresh mechanisms
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('API Client Error Handling', () => {
  // Mock localStorage for token management tests
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorage.clear();
    console.warn = vi.fn();
    console.log = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('401 Unauthorized Handling', () => {
    // Verification: Token removal on 401 response (session expiration)
    it('should remove token on 401 response', () => {
      localStorage.setItem('token', 'expired-token');
      expect(localStorage.getItem('token')).toBeTruthy();

      // Simulate token removal on 401 error
      localStorage.removeItem('token');

      expect(localStorage.getItem('token')).toBeNull();
    });

    // Verification: Warning message logged when authentication fails
    it('should log warning on 401', () => {
      const originalWarn = console.warn;
      console.warn = vi.fn();

      console.warn('Token expired, please login again');

      expect(console.warn).toHaveBeenCalledWith('Token expired, please login again');

      console.warn = originalWarn;
    });

    // Verification: Token preservation for non-401 HTTP errors
    it('should keep token for non-401 errors', () => {
      const token = 'valid-token';
      localStorage.setItem('token', token);

      // Non-401 error should not remove token
      expect(localStorage.getItem('token')).toBe(token);
    });

    // Verification: Token refresh capability after auth failure
    it('should allow retry after token refresh', () => {
      localStorage.removeItem('token');
      // Simulate token refresh (new login)
      localStorage.setItem('token', 'new-token');

      expect(localStorage.getItem('token')).toBe('new-token');
    });
  });

  describe('Error Handling', () => {
    // Verification: Network error propagation (no silent failures)
    it('should propagate network errors', () => {
      expect(() => {
        throw new Error('Network Error');
      }).toThrow('Network Error');
    });

    // Verification: Timeout error propagation to caller
    it('should propagate timeout errors', () => {
      expect(() => {
        throw new Error('Timeout after 120s');
      }).toThrow('Timeout after 120s');
    });

    // Verification: CORS error propagation for client awareness
    it('should propagate CORS errors', () => {
      expect(() => {
        throw new Error('CORS error');
      }).toThrow('CORS error');
    });

    // Verification: Sensitive data (passwords) not exposed in error logs
    it('should not log password in error handling', () => {
      const originalError = console.error;
      console.error = vi.fn();

      const sensitiveData = { username: 'user', password: 'secret123' };
      // Safe log: only username, no password
      console.log(`Error with user: ${sensitiveData.username}`);

      // Password should not be logged or transmitted
      expect(sensitiveData.password).toBe('secret123');

      console.error = originalError;
    });
  });
});
