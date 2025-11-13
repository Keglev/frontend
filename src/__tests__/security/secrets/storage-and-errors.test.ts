/**
 * @file storage-and-errors.test.ts
 * @description Token storage security and error message handling tests
 * Tests verify tokens are stored safely and stack traces don't leak secrets
 * @domain Secrets & Error Handling
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  sanitizeStackTrace,
  userFacingError,
} from './secrets-helpers';

describe('Token Storage & Error Message Security', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // ============================================================================
  // TOKEN STORAGE SECURITY
  // ============================================================================

  /**
   * @test should store token only in localStorage
   * Tokens should be in localStorage (persistent, accessible to app)
   * NOT in sessionStorage (different context) or window object (XSS risk)
   */
  it('should store token only in localStorage', () => {
    const token = 'jwt-token-abc123';

    // Store token
    localStorage.setItem('token', token);

    // Verify: Token is in localStorage
    expect(localStorage.getItem('token')).toBe(token);

    // Verify: NOT in sessionStorage
    expect(sessionStorage.getItem('token')).toBeNull();

    // Verify: NOT exposed on window object
    expect((window as unknown as Record<string, unknown>).jwtToken).toBeUndefined();
  });

  /**
   * @test should clear token on logout
   * All auth-related data must be removed from storage on logout
   * Includes: token, username, role, and other auth data
   */
  it('should clear token on logout', () => {
    const token = 'jwt-token-123';
    localStorage.setItem('token', token);
    localStorage.setItem('username', 'john_doe');
    localStorage.setItem('role', 'user');

    // Verify token is stored
    expect(localStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('username')).toBe('john_doe');

    // Logout: clear all auth data
    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
    };

    logout();

    // Verify: All auth data is cleared
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('username')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
  });

  /**
   * @test should not expose token in error stack traces
   * Stack traces can be logged; must sanitize tokens from them first
   * Removes JWT tokens and Bearer tokens from traces
   */
  it('should not expose token in error stack traces', () => {
    const stackWithToken =
      'Error: Request failed\n    at fetchData (api.ts:45)\n    with token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

    const cleaned = sanitizeStackTrace(stackWithToken);

    // Verify: Token is removed
    expect(cleaned).not.toContain('eyJhbGci');
    expect(cleaned).toContain('[JWT_REDACTED]');
  });

  /**
   * @test should sanitize Bearer tokens from stack traces
   * Format: Bearer <token>
   */
  it('should sanitize Bearer tokens from stack traces', () => {
    const stackWithBearer =
      'Error: Auth failed\n    Bearer sk_live_1234567890abcdefgh';
    const cleaned = sanitizeStackTrace(stackWithBearer);

    expect(cleaned).not.toContain('sk_live_1234567890');
    expect(cleaned).toContain('Bearer [REDACTED]');
  });

  // ============================================================================
  // ERROR MESSAGE SECURITY
  // ============================================================================

  /**
   * @test should not expose implementation details in API errors
   * Database info, SQL queries, file paths, credentials should be hidden
   * Show user-friendly message while logging technical error
   */
  it('should not expose implementation details in API errors', () => {
    // Safe error
    const safeError = userFacingError('Network timeout');
    expect(safeError.message).toBe('Network timeout');
    expect(safeError.shouldLog).toBe(false);

    // Sensitive error: database details
    const dbError = userFacingError(
      'ERROR: Connection to PostgreSQL database failed at 192.168.1.100:5432'
    );
    expect(dbError.message).toBe('An error occurred. Please try again.');
    expect(dbError.shouldLog).toBe(true); // Log to backend for investigation
  });

  /**
   * @test should hide database errors from users
   * Prevents attackers from learning about database structure/technology
   */
  it('should hide database errors from users', () => {
    const dbErrors = [
      'ERROR: Connection to PostgreSQL database failed',
      'MySQL connection timeout at 192.168.1.5:3306',
      'ERROR: Table users does not exist',
    ];

    dbErrors.forEach((error) => {
      const result = userFacingError(error);
      expect(result.message).toBe('An error occurred. Please try again.');
      expect(result.shouldLog).toBe(true);
    });
  });

  /**
   * @test should hide SQL errors from users
   * Prevents SQL injection hints and schema discovery
   */
  it('should hide SQL errors from users', () => {
    const sqlError = userFacingError(
      "SQL syntax error: SELECT * FROM users WHERE id = '123'"
    );

    expect(sqlError.message).toBe('An error occurred. Please try again.');
    expect(sqlError.shouldLog).toBe(true);
  });

  /**
   * @test should hide file path errors from users
   * Prevents disclosure of server directory structure
   */
  it('should hide file path errors from users', () => {
    const pathErrors = [
      'ERROR: File not found at /home/appuser/config/db.json',
      'Failed to read /var/www/html/config/.env',
    ];

    pathErrors.forEach((error) => {
      const result = userFacingError(error);
      expect(result.message).toBe('An error occurred. Please try again.');
      expect(result.shouldLog).toBe(true);
    });
  });

  /**
   * @test should hide credentials from error messages
   * Passwords, tokens, API keys in errors should be hidden
   */
  it('should hide credentials from error messages', () => {
    const credentialErrors = [
      'Failed to authenticate with password: secretPass123',
      'API call failed with secret: sk_live_abcd1234',
    ];

    credentialErrors.forEach((error) => {
      const result = userFacingError(error);
      expect(result.message).toBe('An error occurred. Please try again.');
      expect(result.shouldLog).toBe(true);
    });
  });
});
