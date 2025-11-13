/**
 * @file csrf-samesite-double-submit.test.ts
 * @description SameSite cookie policy and double-submit cookie pattern tests
 * Verifies cookie-based CSRF protection mechanisms and vulnerability detection
 * @domain API Security & CSRF Cookie Defense
 */

import { describe, it, expect } from 'vitest';
import {
  validateSameSite,
  isCSRFVulnerable,
  validateDoubleSubmitCookie,
} from './csrf-helpers';

describe('Same-Site Cookie Policy & Double Submit Defense', () => {
  /**
   * @test should validate SameSite cookie attribute
   * Valid values: Strict (secure), Lax (secure, default), None (requires Secure flag)
   * Returns validation status and security level
   */
  it('should validate SameSite cookie attribute', () => {
    // Strict - most secure
    const strict = validateSameSite('Strict');
    expect(strict.valid).toBe(true);
    expect(strict.secure).toBe(true);

    // Lax - default, secure
    const lax = validateSameSite('Lax');
    expect(lax.valid).toBe(true);
    expect(lax.secure).toBe(true);

    // None - requires Secure flag, less secure for CSRF
    const none = validateSameSite('None');
    expect(none.valid).toBe(true);
    expect(none.secure).toBe(false);

    // Invalid value
    const invalid = validateSameSite('Invalid');
    expect(invalid.valid).toBe(false);
    expect(invalid.secure).toBe(false);

    // Case sensitive validation
    const lowercase = validateSameSite('strict');
    expect(lowercase.valid).toBe(false);
  });

  /**
   * @test should prevent CSRF with Strict SameSite
   * Strict: Cookie not sent for cross-origin requests (prevents CSRF)
   * Lax: Cookie sent for top-level navigations only (mostly CSRF-safe)
   * None: Cookie sent everywhere (requires other CSRF defenses)
   */
  it('should prevent CSRF with Strict SameSite', () => {
    const attackerOrigin = 'https://attacker.com';
    const siteOrigin = 'https://stockease.com';

    // Strict protects - cookie not sent to attacker.com
    expect(
      isCSRFVulnerable('Strict', attackerOrigin, siteOrigin)
    ).toBe(false);

    // Lax offers some protection - vulnerable if attacker uses same-origin
    expect(
      isCSRFVulnerable('Lax', siteOrigin, siteOrigin)
    ).toBe(false);

    // Lax vulnerable for cross-origin
    expect(
      isCSRFVulnerable('Lax', attackerOrigin, siteOrigin)
    ).toBe(true);

    // None is vulnerable - no SameSite protection
    expect(
      isCSRFVulnerable('None', attackerOrigin, siteOrigin)
    ).toBe(true);
  });

  /**
   * @test should compare cookie CSRF token with request body token
   * Double-submit cookie pattern: token in cookie must match token in body/header
   * Uses constant-time comparison; both tokens must be present and match
   * Prevents CSRF by requiring attacker to read CSRF token from cookie
   */
  it('should compare cookie CSRF token with request body token', () => {
    const token = 'same-csrf-token-123';

    // Matching tokens - both present and equal
    const matching = validateDoubleSubmitCookie(token, token);
    expect(matching.valid).toBe(true);

    // Missing cookie token
    const noCookie = validateDoubleSubmitCookie('', token);
    expect(noCookie.valid).toBe(false);
    expect(noCookie.reason).toContain('cookie');

    // Missing body token
    const noBody = validateDoubleSubmitCookie(token, '');
    expect(noBody.valid).toBe(false);
    expect(noBody.reason).toContain('body');

    // Mismatched tokens (attacker can't forge)
    const mismatch = validateDoubleSubmitCookie(token, 'attacker-token');
    expect(mismatch.valid).toBe(false);
    expect(mismatch.reason).toContain('mismatch');

    // Both missing
    const bothMissing = validateDoubleSubmitCookie('', '');
    expect(bothMissing.valid).toBe(false);
  });
});
