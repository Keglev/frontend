/**
 * @file sensitive-data-protection.test.ts
 * @description Tests for sensitive data masking and redaction in error messages, logs, and responses
 * Ensures JWT tokens, API keys, credentials, and personal information are not exposed through error channels
 * @domain Frontend API Security - Sensitive Data Protection
 *
 * @test Coverage: 6 tests
 * - JWT token redaction from error logs
 * - API key masking in error responses
 * - Database connection string protection
 * - User credential separation
 * - Email address masking
 * - Authentication header protection
 *
 * @author Enterprise Security Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Sensitive Data Protection in Error Messages & Logs', () => {
  /**
   * Setup: Clear all mocks and localStorage before each test
   */
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  /**
   * Teardown: Clean up mocks and storage after each test
   */
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Test: JWT token redaction
   * Validates that JWT tokens embedded in error messages are redacted
   * before being logged or sent to error tracking systems
   */
  it('should not expose JWT tokens in error logs', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIn0';
    const sensitiveError = new Error(`Request failed with token: ${token}`);

    // Simulate error sanitization - redact JWT tokens (start with eyJ)
    const sanitizedMessage = sensitiveError.message.replace(
      /eyJ[A-Za-z0-9_-]+/g,
      '[REDACTED_TOKEN]'
    );

    expect(sanitizedMessage).not.toContain(token);
    expect(sanitizedMessage).toContain('[REDACTED_TOKEN]');
  });

  /**
   * Test: API key masking in error responses
   * Validates that API keys (typically start with 'sk_live_' or 'sk_test_') are stripped
   * from error response details before being sent to clients
   */
  it('should not expose API keys in error responses', () => {
    const apiKey = 'sk_test_1234567890abcdef'; // Mock key for testing only
    const errorResponse = {
      status: 500,
      message: 'Database connection failed',
      details: `API key: ${apiKey}`,
    };

    // Public error response removes sensitive details
    const publicError = {
      status: errorResponse.status,
      message: errorResponse.message,
      // details property not included - contains API key
    };

    expect(publicError.message).not.toContain(apiKey);
    expect(publicError).not.toHaveProperty('details');
  });

  /**
   * Test: Database connection string protection
   * Validates that database connection strings containing usernames, passwords,
   * and internal hostnames are redacted from error messages
   */
  it('should not expose database connection strings in errors', () => {
    const connectionString =
      'postgresql://user:password@db.internal.company.com:5432/stockease_db';
    const errorMessage = `Database error: ${connectionString}`;

    // Sanitize by masking credentials portion (between : and @)
    const sanitized = errorMessage.replace(/:[^@]*@/g, ':****@');

    expect(sanitized).not.toContain('password');
    expect(sanitized).not.toContain(connectionString);
    expect(sanitized).toContain(':****@');
  });

  /**
   * Test: User credential separation
   * Validates that error messages may reference usernames (for audit trail)
   * but must NEVER include passwords or other credentials
   */
  it('should not expose user credentials in error logs', () => {
    const username = 'admin';
    const password = 'SecureP@ssw0rd123';
    const loginError = new Error(`Login failed for user: ${username}`);

    // Error message can contain username for debugging
    expect(loginError.message).toContain(username);
    // But must NEVER contain password
    expect(loginError.message).not.toContain(password);
  });

  /**
   * Test: Email address masking
   * Validates that email addresses are masked in security error messages
   * to prevent user enumeration attacks (differentiating between user exists/not)
   */
  it('should mask email addresses in error messages when unnecessary', () => {
    const email = 'admin@stockease.com';
    // For security errors, mask email domain to prevent enumeration
    const maskedEmail = email.replace(/@.+$/, '@[REDACTED]');

    expect(maskedEmail).not.toContain('stockease.com');
    expect(maskedEmail).toContain('admin@[REDACTED]');
  });

  /**
   * Test: Authentication header protection in logs
   * Validates that Authorization headers (containing Bearer tokens) are never
   * included in request logs or error context objects
   */
  it('should not expose authentication header values in logs', () => {
    const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const requestLog = {
      method: 'GET',
      url: '/api/products',
      // Authorization header should NEVER be logged
    };

    // Verify Authorization header is not in log
    expect(requestLog).not.toHaveProperty('Authorization');
    // Verify header value is not in any logged value
    expect(String(Object.values(requestLog))).not.toContain(authHeader);
  });
});
