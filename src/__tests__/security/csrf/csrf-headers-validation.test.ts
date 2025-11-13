/**
 * @file csrf-headers-validation.test.ts
 * @description Tests for HTTP header validation (Origin, Referer, CSRF headers)
 * Verifies same-origin validation and defense-in-depth CSRF header checking
 * @domain API Security & CSRF Header Validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateOrigin,
  validateReferer,
  validateCSRFHeaders,
} from './csrf-helpers';

describe('Request Header Validation', () => {
  const allowedOrigin = 'https://stockease.com';

  /**
   * @test should check Origin header for same-origin requests
   * Origin header must exactly match allowed origin
   * Prevents CSRF attacks from different origins
   */
  it('should check Origin header for same-origin requests', () => {
    // Same origin - valid
    expect(validateOrigin('https://stockease.com', allowedOrigin)).toBe(
      true
    );

    // Different origin - CSRF attack
    expect(validateOrigin('https://attacker.com', allowedOrigin)).toBe(
      false
    );

    // Protocol mismatch - rejected
    expect(validateOrigin('http://stockease.com', allowedOrigin)).toBe(
      false
    );

    // Domain typo - rejected
    expect(validateOrigin('https://stck.com', allowedOrigin)).toBe(
      false
    );
  });

  /**
   * @test should validate Referer header for mutation requests
   * Referer contains full URL; extracts and validates origin portion
   * Rejects requests with missing Referer (strict validation)
   * Also rejects /external pathnames (internal routing protection)
   */
  it('should validate Referer header for mutation requests', () => {
    // Valid referer from same origin
    expect(
      validateReferer('https://stockease.com/product/123', allowedOrigin)
    ).toBe(true);

    // Valid referer with query params
    expect(
      validateReferer('https://stockease.com/checkout?cart=123', allowedOrigin)
    ).toBe(true);

    // Missing referer (could be policy or CSRF attempt)
    expect(validateReferer(undefined, allowedOrigin)).toBe(false);

    // External referer - CSRF attack
    expect(
      validateReferer('https://attacker.com/page', allowedOrigin)
    ).toBe(false);

    // Invalid URL in referer
    expect(validateReferer('not-a-valid-url', allowedOrigin)).toBe(
      false
    );
  });

  /**
   * @test should prevent CSRF via missing headers
   * Requires either CSRF token OR valid Origin/Referer for defense-in-depth
   * Rejects requests with no CSRF token and no validation headers
   */
  it('should prevent CSRF via missing headers', () => {
    // No headers, no token - CSRF attack (should fail)
    const noDefense = validateCSRFHeaders();
    expect(noDefense.valid).toBe(false);
    expect(noDefense.reason).toContain('Missing');

    // Has CSRF token - should pass (token defense sufficient)
    const withToken = validateCSRFHeaders(undefined, undefined, 'token');
    expect(withToken.valid).toBe(true);

    // Has Origin header - should pass (header defense sufficient)
    const withOrigin = validateCSRFHeaders(allowedOrigin, undefined, undefined);
    expect(withOrigin.valid).toBe(true);

    // Has Referer header - should pass (header defense sufficient)
    const withReferer = validateCSRFHeaders(
      undefined,
      'https://stockease.com/product/123',
      undefined
    );
    expect(withReferer.valid).toBe(true);

    // Multiple defenses (defense-in-depth)
    const multiDefense = validateCSRFHeaders(allowedOrigin, 'https://stockease.com/page', 'token');
    expect(multiDefense.valid).toBe(true);
  });
});
