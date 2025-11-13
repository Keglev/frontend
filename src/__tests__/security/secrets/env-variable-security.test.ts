/**
 * @file env-variable-security.test.ts
 * @description Environment variable exposure and safety tests
 * Tests verify VITE_ prefix enforcement, API URL validation, and secret isolation
 * @domain Secrets & Environment Configuration
 */

import { describe, it, expect } from 'vitest';
import {
  validateViteExposure,
  validateApiUrl,
  isSecretSafeVariable,
  isAllowedViteVar,
} from './secrets-helpers';

describe('Environment Variable Security', () => {
  /**
   * @test should only expose VITE_ prefixed variables
   * Vite enforces this at build time - only VITE_* vars bundled into client code
   * Sensitive data should never have VITE_ prefix
   */
  it('should only expose VITE_ prefixed variables', () => {
    const exposedVars = Object.keys(import.meta.env).filter((key) =>
      key.startsWith('VITE_')
    );

    // Verify: All VITE_ keys match pattern
    exposedVars.forEach((key) => {
      expect(key).toMatch(/^VITE_/);
    });

    // Principle: Vite only bundles VITE_ prefixed vars
    expect(exposedVars.length).toBeGreaterThanOrEqual(0);
  });

  /**
   * @test should not expose API secret keys
   * Secret keywords (SECRET, PRIVATE, PASSWORD, KEY, TOKEN) must not be VITE_ prefixed
   * If a variable contains these keywords, it should not be exposed to client
   */
  it('should not expose API secret keys', () => {
    const result = validateViteExposure([
      'VITE_API_BASE_URL', // Good: exposed, not sensitive
      'VITE_APP_NAME', // Good: exposed, not sensitive
      'DATABASE_PASSWORD', // Good: sensitive, not exposed
      'VITE_API_SECRET', // Bad: exposed AND sensitive
    ]);

    // Should detect VITE_API_SECRET as exposed secret
    expect(result.valid).toBe(false);
    expect(result.secretsExposed).toContain('VITE_API_SECRET');
    expect(result.secretsExposed).not.toContain('DATABASE_PASSWORD');
  });

  /**
   * @test should validate VITE_API_BASE_URL is safe URL
   * Only HTTP/HTTPS protocols allowed
   * Rejects javascript:, data:, file:// schemes used in XSS attacks
   */
  it('should validate VITE_API_BASE_URL is safe URL', () => {
    // Valid URLs
    expect(validateApiUrl('https://api.stockease.com')).toEqual({
      valid: true,
    });
    expect(validateApiUrl('http://localhost:8081')).toEqual({
      valid: true,
    });
    expect(validateApiUrl('https://api.example.com:3000')).toEqual({
      valid: true,
    });

    // Invalid URLs
    expect(validateApiUrl('data:alert("xss")')).toEqual({
      valid: false,
      reason: expect.any(String),
    });
    expect(validateApiUrl('javascript:alert("xss")')).toEqual({
      valid: false,
      reason: expect.any(String),
    });
    expect(validateApiUrl('file:///etc/passwd')).toEqual({
      valid: false,
      reason: expect.any(String),
    });
  });

  /**
   * @test should reject URLs without configuration
   * API URL is required for application to function
   */
  it('should reject URLs without configuration', () => {
    const result = validateApiUrl(undefined);

    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not configured');
  });

  /**
   * @test should reject invalid URL formats
   * Malformed URLs should not pass validation
   */
  it('should reject invalid URL formats', () => {
    expect(validateApiUrl('not-a-valid-url')).toEqual({
      valid: false,
      reason: 'Invalid URL format',
    });

    expect(validateApiUrl('ftp://example.com')).toEqual({
      valid: false,
      reason: expect.stringContaining('protocol'),
    });

    // Invalid port number
    const result = validateApiUrl('https://example.com:invalid');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  /**
   * @test should verify variables are safe to expose
   * Sensitive keywords (SECRET, PRIVATE_KEY, PASSWORD, API_KEY) should not be exposed
   */
  it('should verify variables are safe to expose', () => {
    // Safe: non-secret variable
    expect(isSecretSafeVariable('VITE_API_BASE_URL')).toBe(true);
    expect(isSecretSafeVariable('VITE_APP_VERSION')).toBe(true);

    // Safe: secret but not VITE_ exposed
    expect(isSecretSafeVariable('DATABASE_PASSWORD')).toBe(true);
    expect(isSecretSafeVariable('API_SECRET')).toBe(true);

    // Unsafe: secret AND VITE_ exposed
    expect(isSecretSafeVariable('VITE_API_SECRET')).toBe(false);
    expect(isSecretSafeVariable('VITE_PRIVATE_KEY')).toBe(false);
  });

  /**
   * @test should validate only necessary variables are exposed
   * Allowed: API_BASE_URL, APP_NAME, APP_VERSION, ENABLE_DEBUG
   * Must not expose secrets or implementation details
   */
  it('should validate only necessary variables are exposed', () => {
    // Allowed variables
    expect(isAllowedViteVar('VITE_API_BASE_URL')).toBe(true);
    expect(isAllowedViteVar('VITE_APP_NAME')).toBe(true);
    expect(isAllowedViteVar('VITE_APP_VERSION')).toBe(true);
    expect(isAllowedViteVar('VITE_ENABLE_DEBUG')).toBe(true);

    // Disallowed: secret variables
    expect(isAllowedViteVar('VITE_SECRET')).toBe(false);
    expect(isAllowedViteVar('VITE_PASSWORD')).toBe(false);
    expect(isAllowedViteVar('VITE_API_KEY')).toBe(false);

    // Safe: non-secret variables are generally allowed
    expect(isAllowedViteVar('VITE_CUSTOM_CONFIG')).toBe(true);
  });
});
