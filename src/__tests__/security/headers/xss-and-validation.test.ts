/**
 * @file xss-and-validation.test.ts
 * @description X-XSS-Protection and security header validation tests
 * Tests legacy XSS protection and comprehensive header consistency checks
 * @domain Web Security & Header Validation
 */

import { describe, it, expect } from 'vitest';
import {
  isXSSProtected,
  validateHeaderConsistency,
  checkCriticalHeaders,
} from './security-headers-helpers';

describe('X-XSS-Protection & Header Validation', () => {
  /**
   * @test should set X-XSS-Protection for legacy browser support
   * Format: X-XSS-Protection: 1; mode=block
   * "1" = enable XSS filtering
   * "mode=block" = block page if XSS detected (vs sanitize)
   * Note: Deprecated in modern browsers but helps with older ones
   */
  it('should set X-XSS-Protection for legacy browser support', () => {
    const headerValue = '1; mode=block';

    expect(isXSSProtected(headerValue)).toBe(true);
    expect(headerValue).toContain('1');
    expect(headerValue).toContain('mode=block');
  });

  /**
   * @test should not disable XSS-Protection
   * Setting X-XSS-Protection: 0 disables protection (never do this)
   * Modern apps should use CSP instead, but should not disable this header
   */
  it('should not disable XSS-Protection', () => {
    const enabledValue = '1; mode=block';
    const disabledValue = '0';

    expect(isXSSProtected(enabledValue)).toBe(true);
    expect(isXSSProtected(disabledValue)).toBe(false);
  });

  /**
   * @test should require mode=block for XSS protection
   * mode=block: browser blocks the entire page
   * mode=sanitize: browser attempts to sanitize (less effective)
   */
  it('should require mode=block for XSS protection', () => {
    const withBlock = '1; mode=block';
    const withSanitize = '1; mode=sanitize';
    const noMode = '1';

    expect(isXSSProtected(withBlock)).toBe(true);
    expect(isXSSProtected(withSanitize)).toBe(false);
    expect(isXSSProtected(noMode)).toBe(false);
  });

  /**
   * @test should validate response headers for consistency
   * Checks for conflicting header values
   * Example conflicts: HSTS with max-age=0, invalid X-Frame-Options
   */
  it('should validate response headers for consistency', () => {
    const goodHeaders = {
      'X-Frame-Options': 'DENY',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'public, max-age=3600',
    };

    expect(validateHeaderConsistency(goodHeaders)).toBe(true);
  });

  /**
   * @test should detect invalid header consistency
   * HSTS with max-age=0 tries to disable (invalid)
   * Invalid X-Frame-Options value
   */
  it('should detect invalid header consistency', () => {
    // Trying to disable HSTS
    const disabledHSTS = {
      'Strict-Transport-Security': 'max-age=0',
    };
    expect(validateHeaderConsistency(disabledHSTS)).toBe(false);

    // Negative max-age
    const negativeMaxAge = {
      'Strict-Transport-Security': 'max-age=-1',
    };
    expect(validateHeaderConsistency(negativeMaxAge)).toBe(false);

    // Invalid X-Frame-Options
    const invalidFrameOptions = {
      'X-Frame-Options': 'INVALID',
    };
    expect(validateHeaderConsistency(invalidFrameOptions)).toBe(false);
  });

  /**
   * @test should include all critical security headers
   * Required headers:
   * - X-Frame-Options (clickjacking)
   * - X-Content-Type-Options (MIME sniffing)
   * - Strict-Transport-Security (HTTPS)
   * - Referrer-Policy (privacy)
   * - Permissions-Policy (feature control)
   */
  it('should include all critical security headers', () => {
    const responseHeaders = new Map<string, string>([
      ['X-Frame-Options', 'DENY'],
      ['X-Content-Type-Options', 'nosniff'],
      ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['Permissions-Policy', 'geolocation=(), camera=()'],
      ['Content-Security-Policy', "default-src 'self'"],
    ]);

    const result = checkCriticalHeaders(responseHeaders);

    // All critical headers present
    expect(result.present.length).toBe(5);
    expect(result.missing.length).toBe(0);
    expect(result.present).toContain('X-Frame-Options');
    expect(result.present).toContain('X-Content-Type-Options');
  });

  /**
   * @test should detect missing critical security headers
   * Identifies which required headers are missing from response
   */
  it('should detect missing critical security headers', () => {
    // Missing most headers
    const sparseHeaders = new Map<string, string>([
      ['X-Frame-Options', 'DENY'],
    ]);

    const result = checkCriticalHeaders(sparseHeaders);

    expect(result.present).toContain('X-Frame-Options');
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.missing).toContain('X-Content-Type-Options');
    expect(result.missing).toContain('Strict-Transport-Security');
  });

  /**
   * @test should not count empty header values as present
   * Empty header values don't provide protection
   * Only non-empty, valid header values count
   */
  it('should not count empty header values as present', () => {
    const headersWithEmpty = new Map<string, string>([
      ['X-Frame-Options', 'DENY'],
      ['X-Content-Type-Options', ''], // Empty - doesn't count
      ['Strict-Transport-Security', 'max-age=31536000'],
      ['Referrer-Policy', ''], // Empty - doesn't count
      ['Permissions-Policy', 'camera=()'],
    ]);

    const result = checkCriticalHeaders(headersWithEmpty);

    // Only non-empty headers count
    expect(result.present).toContain('X-Frame-Options');
    expect(result.present).not.toContain('X-Content-Type-Options');
    expect(result.present).not.toContain('Referrer-Policy');
    expect(result.missing).toContain('X-Content-Type-Options');
  });
});
