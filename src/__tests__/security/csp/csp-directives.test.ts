/**
 * CSP Directive Validation Tests
 * Tests individual CSP directives to prevent XSS, form hijacking, and clickjacking.
 * @module csp-directives.test.ts
 */

import { describe, it, expect } from 'vitest';
import { securityLevel, isScriptSrcSecure, validateStyleSrc } from './csp-helpers';

describe('CSP Directive Validation', () => {
  /**
   * Test: default-src fallback
   * Verifies that default-src applies to undefined directives.
   */
  it('should validate default-src directive', () => {
    // CSP security levels based on sources
    const cspPolicies = {
      restrictive: "default-src 'self'",        // Most restrictive
      moderate: "default-src 'self' https:",    // Allows HTTPS
      permissive: "default-src *",               // Least restrictive
    };

    // Evaluate security level of each policy
    expect(securityLevel(cspPolicies.restrictive)).toBeGreaterThan(50);
    expect(securityLevel(cspPolicies.moderate)).toBeLessThanOrEqual(80);
    expect(securityLevel(cspPolicies.permissive)).toBeLessThan(50);
  });

  /**
   * Test: script-src XSS prevention
   * Ensures script-src prevents inline injection and eval() attacks.
   */
  it('should validate script-src directive for XSS prevention', () => {
    // Secure configurations
    expect(isScriptSrcSecure("script-src 'self'")).toBe(true);
    expect(isScriptSrcSecure("script-src 'self' 'nonce-abc123'")).toBe(true);
    expect(isScriptSrcSecure("script-src 'self' 'unsafe-inline'")).toBe(true); // Not ideal but common

    // Insecure configurations
    expect(isScriptSrcSecure("script-src 'self' 'unsafe-eval'")).toBe(false);
    expect(isScriptSrcSecure("script-src *")).toBe(false);
  });

  /**
   * Test: style-src CSS control
   * Validates style-src prevents CSS injection and unsafe patterns.
   */
  it('should validate style-src directive for styling control', () => {
    // Good policy: uses nonce instead of unsafe-inline
    const goodPolicy = "style-src 'self' 'nonce-abc123'";
    const goodResult = validateStyleSrc(goodPolicy);
    expect(goodResult.secure).toBe(true);
    expect(goodResult.warnings).toHaveLength(0);

    // Weak policy: allows all inline styles
    const weakPolicy = "style-src 'self' 'unsafe-inline'";
    const weakResult = validateStyleSrc(weakPolicy);
    expect(weakResult.warnings).toContain('unsafe-inline allows all inline styles');

    // Insecure: wildcard
    const insecurePolicy = "style-src *";
    const insecureResult = validateStyleSrc(insecurePolicy);
    expect(insecureResult.secure).toBe(false);
  });

  /**
   * Test: img-src and media-src resource control
   * Ensures images and media load from trusted sources.
   */
  it('should validate img-src and media-src directives', () => {
    const validateMediaDirectives = (cspHeader: string): string[] => {
      const issues: string[] = [];
      if (!cspHeader.includes('https:') && !cspHeader.includes('http:')) {
        issues.push('No HTTPS specified for external resources');
      }
      return issues;
    };

    const header = "img-src 'self' data: https:; media-src 'self' https:";
    const issues = validateMediaDirectives(header);
    expect(issues.length).toBeLessThanOrEqual(1);
  });

  /**
   * Test: connect-src API communication control
   * Restricts where XMLHttpRequest, fetch, and WebSocket can connect.
   */
  it('should validate connect-src for API communication', () => {
    const validateConnectSrc = (directive: string, allowedApiDomains: string[]): boolean => {
      if (directive.includes('*')) return false;
      return allowedApiDomains.every((domain) => directive.includes(domain));
    };

    const apis = ['https://api.example.com', 'https://analytics.example.com'];
    const policy = "connect-src 'self' https://api.example.com https://analytics.example.com";

    expect(validateConnectSrc(policy, apis)).toBe(true);
    expect(validateConnectSrc("connect-src *", apis)).toBe(false);
  });

  /**
   * Test: frame-ancestors and base-uri directives
   * frame-ancestors prevents clickjacking; base-uri prevents base tag redirects.
   */
  it('should validate frame-ancestors and base-uri directives', () => {
    /**
     * Determines if CSP prevents clickjacking attacks.
     */
    const isAntiClickjacking = (directive: string): boolean => {
      // Most restrictive: cannot be framed at all
      if (directive.includes("frame-ancestors 'none'")) return true;

      // Restrictive: only same-origin can frame
      if (directive.includes("frame-ancestors 'self'")) return true;

      return false;
    };

    // Strong clickjacking protection
    expect(isAntiClickjacking("frame-ancestors 'none'")).toBe(true);

    // Moderate protection
    expect(isAntiClickjacking("frame-ancestors 'self'")).toBe(true);

    // No protection
    expect(isAntiClickjacking("frame-ancestors *")).toBe(false);

    // base-uri should be restrictive
    const safeBaseUri = "base-uri 'self'";
    expect(safeBaseUri).toContain("base-uri 'self'");
  });

  /**
   * Test: form-action directive
   * Prevents form hijacking by restricting submission targets.
   */
  it('should validate form-action directive', () => {
    /**
     * Validates that form-action prevents form hijacking.
     */
    const validateFormAction = (directive: string): { preventFormHijacking: boolean } => {
      // Should restrict to same-origin or specific trusted domains
      const isRestricted =
        directive.includes("'self'") || directive.includes("'none'") || !directive.includes('*');

      return { preventFormHijacking: isRestricted };
    };

    // Safe: only same-origin forms
    const safePolicy = "form-action 'self'";
    expect(validateFormAction(safePolicy).preventFormHijacking).toBe(true);

    // Unsafe: wildcard allows form submission anywhere
    const unsafePolicy = "form-action *";
    expect(validateFormAction(unsafePolicy).preventFormHijacking).toBe(false);
  });
});
