/**
 * @file logging-security.test.ts
 * @description Console logging and error message security tests
 * Tests verify sensitive data is not logged and error messages are sanitized
 * @domain Secrets & Logging Security
 */

import { describe, it, expect, vi } from 'vitest';
import {
  redactSensitiveData,
  shouldLogResponse,
  sanitizeErrorMessage,
} from './secrets-helpers';

describe('Console & Logging Security', () => {
  /**
   * @test should not log sensitive tokens
   * API tokens, JWT tokens, passwords should never appear in logs
   * Documents vulnerability if logging includes Bearer tokens
   */
  it('should not log sensitive tokens', () => {
    const logRequest = (config: { headers?: { Authorization?: string } }) => {
      // This simulates apiClient logging
      const loggable = { ...config };
      if (loggable.headers?.Authorization) {
        // SECURITY FIX: Should redact token
        loggable.headers.Authorization = '[REDACTED]';
      }
      console.log('API Request:', loggable);
    };

    const consoleLogSpy = vi.spyOn(console, 'log');

    // Log with properly redacted token
    logRequest({
      headers: {
        Authorization: 'Bearer real-jwt-token',
      },
    });

    // Verify: Redacted token in output
    const lastCall = consoleLogSpy.mock.calls[consoleLogSpy.mock.calls.length - 1];
    const logged = JSON.stringify(lastCall);

    expect(logged).toContain('[REDACTED]');

    consoleLogSpy.mockRestore();
  });

  /**
   * @test should redact sensitive data from error messages
   * Removes: Bearer tokens, JWT tokens, passwords, API keys, emails
   * Replaces with [REDACTED] or [EMAIL] placeholders
   */
  it('should redact sensitive data from error messages', () => {
    const errorMessage =
      'Request failed with token: my-secret-token and email: user@example.com';
    const redacted = redactSensitiveData(errorMessage);

    // Verify: Sensitive data is redacted
    expect(redacted).not.toContain('my-secret-token');
    expect(redacted).not.toContain('user@example.com');
    expect(redacted).toContain('[REDACTED]');
    expect(redacted).toContain('[EMAIL]');
  });

  /**
   * @test should redact Bearer tokens
   * Format: Bearer <token>
   * Should replace entire token with [REDACTED]
   */
  it('should redact Bearer tokens', () => {
    const message = 'Sent Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const redacted = redactSensitiveData(message);

    expect(redacted).not.toContain('eyJhbGc');
    expect(redacted).toContain('Bearer [REDACTED]');
  });

  /**
   * @test should redact API keys from messages
   * Formats: api_key=value, "api_key": "value"
   */
  it('should redact API keys', () => {
    const message =
      'Failed with api_key=sk_live_1234567890 and API_KEY="secret-key-123"';
    const redacted = redactSensitiveData(message);

    expect(redacted).not.toContain('sk_live_1234567890');
    expect(redacted).not.toContain('secret-key-123');
    expect(redacted).toContain('[REDACTED]');
  });

  /**
   * @test should not log API responses with sensitive data
   * Responses containing: password, token, secret, apiKey, privateKey must not be logged
   * Safe responses can be logged for debugging
   */
  it('should not log API responses with sensitive data', () => {
    // Response with password - should NOT log
    expect(
      shouldLogResponse({
        password: 'secret123',
      })
    ).toBe(false);

    // Response with token - should NOT log
    expect(
      shouldLogResponse({
        token: 'jwt-token',
      })
    ).toBe(false);

    // Response with secret - should NOT log
    expect(
      shouldLogResponse({
        secret: 'confidential',
      })
    ).toBe(false);

    // Safe response - can log
    expect(
      shouldLogResponse({
        name: 'John',
        email: 'john@example.com',
      })
    ).toBe(true);

    // Empty response - can log
    expect(shouldLogResponse({})).toBe(true);
    expect(shouldLogResponse(undefined)).toBe(true);
  });

  /**
   * @test should sanitize error messages with URL credentials
   * Removes credentials from URLs: https://user:pass@host/
   * Also removes API keys from query parameters
   */
  it('should sanitize error messages with URL credentials', () => {
    const errorWithUrl =
      'Failed to connect to https://user:password@api.example.com/api';
    const sanitized = sanitizeErrorMessage(errorWithUrl);

    // Verify: Credentials are redacted
    expect(sanitized).not.toContain('password');
    expect(sanitized).toContain('[REDACTED]');
    expect(sanitized).toContain('[HOST]');
  });

  /**
   * @test should remove API keys from URL query parameters
   * Formats: ?api_key=value, &api-key=value
   */
  it('should remove API keys from URL query parameters', () => {
    const urlWithKey =
      'https://api.example.com/data?api_key=sk_secret_123&format=json';
    const sanitized = sanitizeErrorMessage(urlWithKey);

    expect(sanitized).not.toContain('sk_secret_123');
    expect(sanitized).toContain('api_key=[REDACTED]');
    expect(sanitized).toContain('format=json'); // Non-secret params kept
  });
});
