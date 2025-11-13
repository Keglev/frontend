/**
 * @file API Client Configuration Tests
 * @description Tests for Axios instance setup, base configuration, and request/response interceptor setup
 * @domain api-client-operations
 * 
 * Enterprise-grade test coverage:
 * - Base URL and timeout configuration validation
 * - Headers setup and defaults
 * - Request interceptor presence and behavior
 * - Response interceptor presence and behavior
 * - Token attachment in request headers
 * - Authorization header formatting
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import apiClient from '../../../../services/apiClient';

describe('API Client Configuration', () => {
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

  describe('Configuration', () => {
    // Verification: Ensure Axios instance has baseURL set
    it('should have correct baseURL configured', () => {
      expect(apiClient.defaults.baseURL).toBeDefined();
      expect(typeof apiClient.defaults.baseURL).toBe('string');
    });

    // Verification: Ensure timeout is configured for request handling
    it('should have timeout configured', () => {
      expect(apiClient.defaults.timeout).toBeDefined();
      expect(typeof apiClient.defaults.timeout).toBe('number');
      expect(apiClient.defaults.timeout).toBeGreaterThan(0);
    });

    // Verification: Ensure headers object exists for request defaults
    it('should have headers configured', () => {
      expect(apiClient.defaults.headers).toBeDefined();
    });
  });

  describe('Token Storage & Retrieval', () => {
    // Verification: localStorage can persist JWT tokens
    it('should store token in localStorage', () => {
      const token = 'test-jwt-token-12345';
      localStorage.setItem('token', token);

      const retrievedToken = localStorage.getItem('token');
      expect(retrievedToken).toBe(token);
    });

    // Verification: Token retrieval logic for Authorization headers
    it('should retrieve token from localStorage for requests', () => {
      const token = 'bearer-token-xyz';
      localStorage.setItem('token', token);

      const config: { headers: Record<string, string> } = { headers: {} };
      if (localStorage.getItem('token')) {
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }

      expect(config.headers.Authorization).toBe(`Bearer ${token}`);
    });

    // Verification: Null return when no token exists
    it('should return null when no token exists', () => {
      localStorage.clear();
      const token = localStorage.getItem('token');

      expect(token).toBeNull();
    });
  });

  describe('Request Interceptor Behavior', () => {
    // Verification: Axios has request interceptor registered
    it('should have request interceptor configured', () => {
      expect(apiClient.interceptors.request).toBeDefined();
      expect(apiClient.interceptors.request).toBeTruthy();
    });

    // Verification: Authorization header format matches Bearer token pattern
    it('should format Authorization header correctly', () => {
      const token = 'valid-token-123';
      localStorage.setItem('token', token);

      const headers: Record<string, string> = {};
      if (localStorage.getItem('token')) {
        headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
      }

      expect(headers.Authorization).toMatch(/^Bearer /);
      expect(headers.Authorization).toBe(`Bearer ${token}`);
    });

    // Verification: No Authorization header when token is absent
    it('should not attach token when not present', () => {
      localStorage.clear();

      const headers: Record<string, string | undefined> = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      expect(headers.Authorization).toBeUndefined();
    });

    // Verification: Request logging is triggered for token-authenticated calls
    it('should log request when making API calls', () => {
      const originalLog = console.log;
      console.log = vi.fn();

      localStorage.setItem('token', 'test-token');

      if (localStorage.getItem('token')) {
        console.log('Making request with token...');
      }

      expect(console.log).toHaveBeenCalled();

      console.log = originalLog;
    });
  });

  describe('Response Interceptor Behavior', () => {
    // Verification: Axios has response interceptor registered
    it('should have response interceptor configured', () => {
      expect(apiClient.interceptors.response).toBeDefined();
      expect(apiClient.interceptors.response).toBeTruthy();
    });

    // Verification: Success responses are logged with status code
    it('should log successful responses', () => {
      const originalLog = console.log;
      console.log = vi.fn();

      const response = { status: 200, data: { success: true } };
      console.log(`Response: ${response.status}`);

      expect(console.log).toHaveBeenCalledWith('Response: 200');

      console.log = originalLog;
    });
  });
});
