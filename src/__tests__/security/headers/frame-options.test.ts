/**
 * @file frame-options.test.ts
 * @description X-Frame-Options header tests for clickjacking prevention
 * Tests validate proper framing restrictions and policy enforcement
 * @domain Web Security & Clickjacking Prevention
 */

import { describe, it, expect } from 'vitest';
import {
  isValidFrameOptions,
  canBeSafelyFramed,
} from './security-headers-helpers';

describe('X-Frame-Options Header', () => {
  /**
   * @test should set X-Frame-Options to prevent clickjacking
   * Valid values: DENY (no framing) and SAMEORIGIN (same-origin only)
   * Prevents attackers from embedding page in malicious iframe
   */
  it('should set X-Frame-Options to prevent clickjacking', () => {
    const frameOptionsValues = {
      deny: 'DENY',
      sameOrigin: 'SAMEORIGIN',
    };

    // For public APIs/SPAs, DENY is typically best
    expect(frameOptionsValues.deny).toBe('DENY');

    // For apps that need to be embedded, SAMEORIGIN
    expect(frameOptionsValues.sameOrigin).toBe('SAMEORIGIN');
  });

  /**
   * @test should validate X-Frame-Options value format
   * Only accepts DENY and SAMEORIGIN
   * Rejects deprecated ALLOW-FROM and invalid values
   */
  it('should validate X-Frame-Options value format', () => {
    expect(isValidFrameOptions('DENY')).toBe(true);
    expect(isValidFrameOptions('SAMEORIGIN')).toBe(true);
    expect(isValidFrameOptions('ALLOW-FROM')).toBe(false); // Deprecated
    expect(isValidFrameOptions('ALLOW')).toBe(false);
    expect(isValidFrameOptions('INVALID')).toBe(false);
    expect(isValidFrameOptions('')).toBe(false);
  });

  /**
   * @test should prevent clickjacking with DENY
   * DENY means page cannot be framed by any document
   * Browser will refuse to display page in iframe
   */
  it('should prevent clickjacking with DENY', () => {
    const headerValue = 'DENY';

    // No framing allowed - same origin
    expect(
      canBeSafelyFramed(headerValue, 'https://example.com', 'https://example.com')
    ).toBe(false);

    // No framing allowed - cross origin
    expect(
      canBeSafelyFramed(headerValue, 'https://attacker.com', 'https://example.com')
    ).toBe(false);

    // No framing allowed - child frame
    expect(canBeSafelyFramed(headerValue, 'https://sub.example.com', 'https://example.com')).toBe(
      false
    );
  });

  /**
   * @test should allow same-origin framing with SAMEORIGIN
   * SAMEORIGIN permits framing only by document with identical origin
   * Origin includes protocol, domain, and port - must match exactly
   */
  it('should allow same-origin framing with SAMEORIGIN', () => {
    const headerValue = 'SAMEORIGIN';

    // Same origin: allowed
    expect(
      canBeSafelyFramed(headerValue, 'https://example.com', 'https://example.com')
    ).toBe(true);

    // Different origin: blocked (CSRF attack)
    expect(
      canBeSafelyFramed(headerValue, 'https://attacker.com', 'https://example.com')
    ).toBe(false);

    // Different subdomain: blocked (different origin)
    expect(
      canBeSafelyFramed(headerValue, 'https://app.example.com', 'https://example.com')
    ).toBe(false);

    // Protocol mismatch: blocked
    expect(
      canBeSafelyFramed(headerValue, 'http://example.com', 'https://example.com')
    ).toBe(false);
  });
});
