/**
 * CSP Header Structure Tests
 *
 * Validates correct CSP header format, naming, and syntax.
 * Tests proper use of Content-Security-Policy and Content-Security-Policy-Report-Only headers.
 *
 * @module csp-header-structure.test.ts
 */

import { describe, it, expect } from 'vitest';
import { parseCSPHeader, isValidCSPHeaderName } from './csp-helpers';

describe('CSP Header Structure', () => {
  /**
   * Test: Valid CSP header format
   *
   * Ensures headers follow the standard format:
   * `directive1 source1 source2; directive2 source3;`
   */
  it('should have valid CSP header format', () => {
    // Standard CSP header format
    const validCSPHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.example.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self'
    `.replace(/\n\s*/g, ' ').trim();

    // Verify header contains proper directive format
    const directivePattern = /[\w-]+\s+[^;]+/g;
    const directives = validCSPHeader.match(directivePattern);

    expect(directives).toBeDefined();
    expect(directives!.length).toBeGreaterThan(0);

    // Verify common directives are present
    const directiveNames = directives!.map((d) => d.split(/\s+/)[0]);
    expect(directiveNames).toContain('default-src');
  });

  /**
   * Test: CSP header syntax validation
   *
   * Detects syntax errors like unmatched quotes
   * and improperly formatted directives.
   */
  it('should not have syntax errors in CSP header', () => {
    // Valid header passes validation
    const validHeader = "default-src 'self'; script-src 'self' 'unsafe-inline'";
    const validResult = parseCSPHeader(validHeader);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    // Invalid header with unmatched quote
    const invalidHeader = "default-src 'self; script-src 'self'";
    const invalidResult = parseCSPHeader(invalidHeader);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  /**
   * Test: CSP header naming consistency
   *
   * Validates that only official CSP header names are used.
   * Rejects deprecated headers like X-Content-Security-Policy.
   */
  it('should have consistent header naming', () => {
    // Valid CSP headers
    expect(isValidCSPHeaderName('Content-Security-Policy')).toBe(true);
    expect(isValidCSPHeaderName('Content-Security-Policy-Report-Only')).toBe(true);

    // Invalid/deprecated headers
    expect(isValidCSPHeaderName('X-Content-Security-Policy')).toBe(false); // Deprecated
    expect(isValidCSPHeaderName('CSP-Header')).toBe(false); // Not valid
    expect(isValidCSPHeaderName('Security-Policy')).toBe(false); // Incomplete
  });

  /**
   * Test: Directive parsing
   *
   * Extracts individual directives and their sources
   * from a CSP header string.
   */
  it('should correctly parse multiple directives', () => {
    const cspHeader = "default-src 'self'; script-src 'self' https://trusted.com; style-src 'unsafe-inline'";

    // Parse directives
    const parseDirectives = (header: string): Map<string, string[]> => {
      const directives = new Map<string, string[]>();

      header.split(';').forEach((directive) => {
        const trimmed = directive.trim();
        if (!trimmed) return;

        const parts = trimmed.split(/\s+/);
        const name = parts[0];
        const sources = parts.slice(1);

        directives.set(name, sources);
      });

      return directives;
    };

    const parsed = parseDirectives(cspHeader);

    // Verify each directive was parsed
    expect(parsed.get('default-src')).toEqual(["'self'"]);
    expect(parsed.get('script-src')).toEqual(["'self'", 'https://trusted.com']);
    expect(parsed.get('style-src')).toEqual(["'unsafe-inline'"]);
  });

  /**
   * Test: Header case sensitivity
   *
   * CSP headers are case-insensitive in the header name
   * but directives and sources should follow conventions.
   */
  it('should handle header case insensitivity', () => {
    /**
     * Normalizes header name to standard casing.
     */
    const normalizeHeader = (header: string): string => {
      return header
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-');
    };

    // Test normalization works correctly
    expect(normalizeHeader('CONTENT-SECURITY-POLICY')).toBe('Content-Security-Policy');
    expect(normalizeHeader('content-security-policy')).toBe('Content-Security-Policy');

    // Verify normalized headers are valid
    const normalized = normalizeHeader('CONTENT-SECURITY-POLICY');
    expect(isValidCSPHeaderName(normalized)).toBe(true);
  });
});
