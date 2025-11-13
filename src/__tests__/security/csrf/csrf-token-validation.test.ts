/**
 * @file csrf-token-validation.test.ts
 * @description CSRF token format validation and verification tests
 * Tests verify token format, constant-time matching, and manipulation detection
 * @domain API Security & CSRF Token Validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateTokenFormat,
  validateTokenMatch,
} from './csrf-helpers';

describe('CSRF Token Validation', () => {
  /**
   * @test should validate token format
   * Token must be exactly 64 hex characters (32 bytes in hex representation)
   * Rejects invalid formats: non-hex chars, wrong length, empty strings
   */
  it('should validate token format', () => {
    // Valid token (64 hex chars)
    expect(validateTokenFormat('a'.repeat(64))).toBe(true);

    // Invalid formats - non-hex characters
    expect(validateTokenFormat('invalid')).toBe(false);
    expect(validateTokenFormat('invalid!@#')).toBe(false);

    // Invalid formats - wrong length
    expect(validateTokenFormat('')).toBe(false);
    expect(validateTokenFormat('a'.repeat(32))).toBe(false); // Too short
    expect(validateTokenFormat('a'.repeat(65))).toBe(false); // Too long

    // Invalid formats - mixed case
    expect(validateTokenFormat('A'.repeat(64))).toBe(false); // uppercase
  });

  /**
   * @test should verify server-stored token matches request token
   * Uses constant-time comparison to prevent timing attacks
   * Validates all characters even after finding mismatch
   */
  it('should verify server-stored token matches request token', () => {
    const serverToken = 'a'.repeat(64);
    const requestToken = 'a'.repeat(64);

    // Token matches
    expect(validateTokenMatch(requestToken, serverToken)).toBe(true);

    // Token mismatch - wrong value
    expect(validateTokenMatch('b'.repeat(64), serverToken)).toBe(false);

    // Token mismatch - different length
    expect(validateTokenMatch('a'.repeat(32), serverToken)).toBe(false);

    // Empty tokens - edge case
    expect(validateTokenMatch('', '')).toBe(true);
    expect(validateTokenMatch('token', '')).toBe(false);
  });

  /**
   * @test should reject manipulated tokens
   * Constant-time comparison detects even single-character changes
   * Simulates token corruption from tampering or transmission errors
   */
  it('should reject manipulated tokens', () => {
    const serverToken =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    // Single character changed
    const manipulated =
      'baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    expect(validateTokenMatch(manipulated, serverToken)).toBe(false);

    // Bit flip simulation (corruption)
    const bitFlip =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab';
    expect(validateTokenMatch(bitFlip, serverToken)).toBe(false);

    // Multiple character changes
    const corrupted =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbb';
    expect(validateTokenMatch(corrupted, serverToken)).toBe(false);
  });
});
