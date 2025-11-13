/**
 * @file csrf-token-management.test.ts
 * @description CSRF token generation, storage, retrieval, and expiration tests
 * Tests verify cryptographically secure token generation and freshness validation
 * @domain API Security & CSRF Token Lifecycle
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateCSRFToken,
  storeCSRFToken,
  getCSRFToken,
} from './csrf-helpers';

describe('CSRF Token Management', () => {
  // Mock store for CSRF tokens
  const tokenStore: Map<string, { token: string; timestamp: number }> = new Map();

  beforeEach(() => {
    tokenStore.clear();
  });

  // ============================================================================
  // CSRF TOKEN GENERATION
  // ============================================================================

  /**
   * @test should generate a valid CSRF token
   * Verifies token generation creates a 64-character hex string
   * Token is created using cryptographically secure random values
   */
  it('should generate a valid CSRF token', () => {
    const token = generateCSRFToken();

    // Verify: Token is generated
    expect(token).toBeDefined();
    // Verify: Token has appropriate length (64 chars for 32 bytes)
    expect(token.length).toBe(64);
    // Verify: Token contains only hex characters
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  // ============================================================================
  // CSRF TOKEN STORAGE
  // ============================================================================

  /**
   * @test should store CSRF token with timestamp
   * Verifies token is stored with timestamp for freshness validation
   */
  it('should store CSRF token with timestamp', () => {
    const token = 'test-csrf-token-123abc';
    storeCSRFToken(tokenStore, token);

    // Verify: Token is stored
    expect(tokenStore.has('csrf_token')).toBe(true);
    const stored = tokenStore.get('csrf_token');
    expect(stored?.token).toBe(token);
    // Verify: Timestamp is recorded
    expect(stored?.timestamp).toBeLessThanOrEqual(Date.now());
  });

  // ============================================================================
  // CSRF TOKEN RETRIEVAL
  // ============================================================================

  /**
   * @test should retrieve valid CSRF token
   * Verifies token is returned if it exists and hasn't expired
   */
  it('should retrieve valid CSRF token', () => {
    const token = 'valid-csrf-token';
    storeCSRFToken(tokenStore, token);

    // Verify: Token is retrieved
    expect(getCSRFToken(tokenStore)).toBe(token);
  });

  // ============================================================================
  // CSRF TOKEN EXPIRATION
  // ============================================================================

  /**
   * @test should reject expired CSRF token
   * Verifies expired token (>1 hour old) is rejected and removed from store
   * Token freshness: max age 1 hour
   */
  it('should reject expired CSRF token', () => {
    const oldTimestamp = Date.now() - 1000 * 60 * 60 - 1000; // 1 hour + 1 second ago
    tokenStore.set('csrf_token', {
      token: 'expired-token',
      timestamp: oldTimestamp,
    });

    // Verify: Expired token is rejected
    expect(getCSRFToken(tokenStore)).toBeNull();
    // Verify: Token is removed from store
    expect(tokenStore.has('csrf_token')).toBe(false);
  });
});
