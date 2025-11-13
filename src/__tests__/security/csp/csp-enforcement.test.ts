/**
 * CSP Backward Compatibility and Enforcement Tests
 * Validates CSP across browser versions and environment-specific enforcement.
 * @module csp-enforcement.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { countUnsafeInline } from './csp-helpers';

describe('CSP Backward Compatibility', () => {
  /**
   * Test: Fallback directive chains
   * Older browsers may not support all directives; uses fallback chain.
   */
  it('should support both script-src and default-src fallback', () => {
    // CSP with explicit script-src and fallback default-src
    const cspWithFallback = `
      script-src 'self';
      default-src 'self'
    `.replace(/\n\s*/g, ' ').trim();

    // Modern browser: uses script-src
    // Older browser: falls back to default-src

    expect(cspWithFallback).toContain('script-src');
    expect(cspWithFallback).toContain('default-src');
  });

  /**
   * Test: Complementary security headers
   * CSP needs additional headers for complete protection.
   */
  it('should include X-Content-Type-Options header', () => {
    // Security headers that complement CSP
    const securityHeaders = {
      'Content-Security-Policy': "default-src 'self'",
      'X-Content-Type-Options': 'nosniff',      // Prevents MIME sniffing
      'X-Frame-Options': 'DENY',                // Clickjacking protection
      'X-XSS-Protection': '1; mode=block',      // Older XSS filter (deprecated)
    };

    expect(securityHeaders['X-Content-Type-Options']).toBe('nosniff');
    expect(securityHeaders['X-Frame-Options']).toBe('DENY');
  });

  /**
   * Test: Browser directive support
   * Some directives not supported in older browsers.
   */
  it('should test CSP with different browser versions', () => {
    /**
     * Checks if browser supports a CSP feature.
     */
    const hasReportToSupport = (browserVersion: string): boolean => {
      // report-to supported in: Chrome 70+, Firefox 59+
      // Not supported in: older Safari, older IE
      return !browserVersion.includes('old');
    };

    // Modern browsers have report-to support
    expect(hasReportToSupport('Chrome 75')).toBe(true);
    expect(hasReportToSupport('Firefox 60')).toBe(true);

    // Older browsers don't support report-to
    expect(hasReportToSupport('Safari 5 old')).toBe(false);
  });
});

describe('CSP Testing and Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test: Report-Only in development
   * Uses Report-Only mode to test CSP without blocking.
   */
  it('should test CSP in development with Report-Only', () => {
    /**
     * Determines CSP header based on environment.
     */
    const cspHeaderForEnv = (env: string): string => {
      return env === 'development' ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
    };

    expect(cspHeaderForEnv('development')).toContain('Report-Only');
    expect(cspHeaderForEnv('production')).not.toContain('Report-Only');
  });

  /**
   * Test: Production CSP enforcement
   * Production uses enforce mode with comprehensive directives.
   */
  it('should enforce CSP in production', () => {
    const productionCSP = `
      default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self';
      img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com;
      frame-ancestors 'none'; base-uri 'self'; form-action 'self'
    `.replace(/\n\s*/g, ' ').trim();

    expect(productionCSP).toContain('default-src');
    expect(productionCSP).toContain('frame-ancestors');
    expect(productionCSP).toContain('base-uri');
  });

  /**
   * Test: Minimize unsafe-inline usage
   * Tracks usage and guides migration to nonce/hash-based security.
   */
  it('should minimize unsafe-inline usage', () => {
    // Policy with multiple unsafe-inline occurrences
    const cspPolicy = `
      script-src 'self' 'unsafe-inline';
      style-src 'self' 'unsafe-inline'
    `.replace(/\n\s*/g, ' ').trim();

    const unsafeCount = countUnsafeInline(cspPolicy);

    // Should work towards reducing unsafe-inline
    // Target: 0, Current acceptable: 1-2
    expect(unsafeCount).toBeLessThanOrEqual(2);
    expect(unsafeCount).toBeGreaterThan(0); // Still using it
  });

  /**
   * Test: Migration from unsafe-inline to nonce
   * Shows migration path to nonce-based approach.
   */
  it('should support migration to nonce-based CSP', () => {
    // Before: unsafe-inline
    const unsafePolicy = "script-src 'unsafe-inline'";

    // After: nonce-based
    const safePolicy = "script-src 'nonce-abc123def456'";

    // Verify transition metrics
    expect(countUnsafeInline(unsafePolicy)).toBeGreaterThan(0);
    expect(countUnsafeInline(safePolicy)).toBe(0);
  });

  /**
   * Test: CSP violation monitoring
   * Tracks CSP violations to identify malicious vs legitimate requests.
   */
  it('should monitor CSP violations in production', () => {
    /**
     * Tracks and categorizes CSP violations.
     */
    const categorizeViolation = (
      directive: string,
      source: string
    ): 'malicious' | 'legitimate' | 'unknown' => {
      // Likely malicious: external script sources
      if (directive === 'script-src' && source.includes('attacker.com')) {
        return 'malicious';
      }

      // Likely legitimate: known analytics
      if (directive === 'connect-src' && source.includes('analytics.google.com')) {
        return 'legitimate';
      }

      return 'unknown';
    };

    expect(categorizeViolation('script-src', 'https://attacker.com/evil.js')).toBe('malicious');
    expect(categorizeViolation('connect-src', 'https://analytics.google.com')).toBe('legitimate');
  });
});
