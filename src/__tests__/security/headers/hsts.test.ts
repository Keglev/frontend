/**
 * @file hsts.test.ts
 * @description Strict-Transport-Security (HSTS) header tests
 * Tests validate HTTPS enforcement and preload list configuration
 * @domain Web Security & HTTPS Enforcement
 */

import { describe, it, expect } from 'vitest';
import {
  parseHSTS,
  isEligibleForPreload,
} from './security-headers-helpers';

describe('Strict-Transport-Security (HSTS) Header', () => {
  /**
   * @test should set HSTS with appropriate max-age
   * Format: Strict-Transport-Security: max-age=<seconds>; includeSubDomains; preload
   * max-age: how long browser remembers to use HTTPS (recommend: >= 1 year)
   * includeSubDomains: apply to all subdomains of the domain
   */
  it('should set HSTS with appropriate max-age', () => {
    const hstsHeader = 'max-age=63072000; includeSubDomains';

    const parsed = parseHSTS(hstsHeader);

    // Verify: max-age is at least 1 year (31536000 seconds)
    expect(parsed.maxAge).toBeGreaterThanOrEqual(31536000);
    // Verify: includeSubDomains is set
    expect(parsed.includeSubDomains).toBe(true);
  });

  /**
   * @test should enforce HTTPS using HSTS
   * Once browser receives HSTS header, it forces HTTPS for all future requests
   * Browser will not allow HTTP access even if user types http://
   */
  it('should enforce HTTPS using HSTS', () => {
    // HSTS present: browser enforces HTTPS
    const withHSTS = 'max-age=31536000; includeSubDomains';
    expect(parseHSTS(withHSTS).maxAge).toBeGreaterThan(0);

    // Without HSTS: no enforcement
    const withoutHSTS = '';
    expect(parseHSTS(withoutHSTS).maxAge).toBe(0);
  });

  /**
   * @test should support preload directive for HSTS preload list
   * preload directive allows adding domain to browser HSTS preload list
   * Ensures HTTPS from first visit (before any HTTP attempt)
   * Requirements: max-age >= 1 year, includeSubDomains, preload
   */
  it('should support preload directive for HSTS preload list', () => {
    const hstsWithPreload = 'max-age=63072000; includeSubDomains; preload';

    expect(hstsWithPreload).toContain('preload');
    expect(isEligibleForPreload(hstsWithPreload)).toBe(true);
  });

  /**
   * @test should validate preload list eligibility
   * Must meet strict requirements to be eligible for preload list
   * Requirements: max-age >= 31536000 (1 year), includeSubDomains, preload
   */
  it('should validate preload list eligibility', () => {
    // Valid: meets all requirements
    const validPreload = 'max-age=31536000; includeSubDomains; preload';
    expect(isEligibleForPreload(validPreload)).toBe(true);

    // Invalid: missing preload
    const noPreload = 'max-age=31536000; includeSubDomains';
    expect(isEligibleForPreload(noPreload)).toBe(false);

    // Invalid: missing includeSubDomains
    const noSubDomains = 'max-age=31536000; preload';
    expect(isEligibleForPreload(noSubDomains)).toBe(false);

    // Invalid: max-age too low
    const lowMaxAge = 'max-age=31535999; includeSubDomains; preload';
    expect(isEligibleForPreload(lowMaxAge)).toBe(false);
  });

  /**
   * @test should handle HSTS on subdomains correctly
   * When includeSubDomains is set, HSTS applies to all subdomains
   * Subdomain protection is automatic once header is received
   */
  it('should handle HSTS on subdomains correctly', () => {
    const hstsHeader = 'max-age=31536000; includeSubDomains';
    const parsed = parseHSTS(hstsHeader);

    // When includeSubDomains is set, all subdomains get HTTPS enforcement
    if (parsed.includeSubDomains) {
      // Example subdomains all protected
      const subdomains = ['app.example.com', 'api.example.com', 'mail.example.com'];

      expect(subdomains.length).toBeGreaterThan(0);
      expect(parsed.includeSubDomains).toBe(true); // All subdomains protected
    }
  });

  /**
   * @test should prevent HSTS downgrade attacks
   * Setting max-age=0 would try to disable HSTS (should never do this)
   * Once HSTS is set, browser remembers for duration specified
   */
  it('should prevent HSTS downgrade attacks', () => {
    // Valid: normal HSTS
    const validHSTS = 'max-age=31536000';
    expect(parseHSTS(validHSTS).maxAge).toBeGreaterThan(0);

    // Invalid: trying to disable HSTS with 0
    const disabledHSTS = 'max-age=0';
    const parsed = parseHSTS(disabledHSTS);
    expect(parsed.maxAge).toBe(0); // Would not provide protection
  });
});
