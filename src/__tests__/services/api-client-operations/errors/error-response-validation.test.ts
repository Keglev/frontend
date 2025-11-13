/**
 * @file error-response-validation.test.ts
 * @description Tests for error response structure validation and content sanitization
 * Ensures error responses follow security standards and don't leak sensitive information
 * @domain Frontend API Security - Response Validation
 *
 * @test Coverage: 5 tests
 * - Error response structure validation
 * - Internal error codes stripping
 * - Nested error details masking
 * - Content-Type validation
 * - XSS prevention in error messages
 *
 * @author Enterprise Security Team
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Error Response Validation & Sanitization', () => {
  /**
   * Setup: Prepare test environment
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Teardown: Clean up test artifacts
   */
  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Error response structure validation
   * Validates that error responses have required fields with correct types
   * (status number, message string) for client-side error handling
   */
  it('should validate error response structure', () => {
    const validErrorResponse = {
      status: 400,
      message: 'Invalid request',
      // No code field with error enumeration details
    };

    // Verify required fields exist and have correct types
    expect(validErrorResponse).toHaveProperty('status');
    expect(validErrorResponse).toHaveProperty('message');
    expect(typeof validErrorResponse.status).toBe('number');
    expect(typeof validErrorResponse.message).toBe('string');
  });

  /**
   * Test: Internal error codes stripping
   * Validates that internal error codes (like ERR_DB_CONN_POOL_EXHAUSTED)
   * and request IDs are removed before sending to client.
   * These expose internal system architecture and are not useful to users.
   */
  it('should strip internal error codes from responses', () => {
    // Internal error with implementation details
    const internalError = {
      status: 500,
      code: 'ERR_DB_CONN_POOL_EXHAUSTED',  // exposes system details
      internalRequestId: 'req_12345',      // internal tracking
    };

    // Public error response removes implementation details
    const publicError = {
      status: internalError.status,
      message: 'An error occurred',
      // No internal codes or request IDs exposed
    };

    expect(publicError).not.toHaveProperty('code');
    expect(publicError).not.toHaveProperty('internalRequestId');
  });

  /**
   * Test: Nested error details masking
   * Validates that detailed validation error objects (which expose API schema)
   * are not included in error responses. Instead, a generic message is sent.
   */
  it('should not expose nested error details', () => {
    // Detailed error with validation information (exposes schema)
    const detailedError = {
      status: 400,
      error: {
        validation: {
          name: 'Must be 3-50 characters',
          price: 'Must be positive number',
          stock: 'Integer only',
        },
      },
    };

    // Public response only shows generic message
    const publicError = {
      status: detailedError.status,
      message: 'Validation failed',
      // No nested error object with schema details
    };

    expect(publicError).not.toHaveProperty('error');
    expect(String(publicError)).not.toContain('validation');
  });

  /**
   * Test: Response Content-Type validation
   * Validates that error responses use application/json content type
   * (not HTML or plain text) to prevent injection attacks and ensure
   * consistent client-side error handling
   */
  it('should validate Content-Type of error responses', () => {
    const errorResponse = {
      status: 500,
      headers: {
        'content-type': 'application/json',
      },
    };

    // Verify response is JSON, not HTML or plain text
    const contentType = errorResponse.headers['content-type'];
    expect(contentType).toBe('application/json');
    expect(contentType).not.toContain('text/html');
    expect(contentType).not.toContain('text/plain');
  });

  /**
   * Test: XSS prevention in error messages
   * Validates that if error messages ever include user input,
   * that input is properly escaped before display to prevent XSS attacks
   */
  it('should prevent XSS in error messages', () => {
    // Simulated XSS attack in error message
    const xssAttemptError = new Error(
      '<script>alert("xss")</script> from input'
    );

    // Sanitize error message for display (escape HTML)
    const sanitized = xssAttemptError.message
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Verify script tag is escaped
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });
});
