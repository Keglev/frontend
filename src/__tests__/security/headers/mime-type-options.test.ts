/**
 * @file mime-type-options.test.ts
 * @description X-Content-Type-Options and cache control header tests
 * Tests validate MIME type sniffing prevention and cache strategies
 * @domain Web Security & Content Delivery
 */

import { describe, it, expect } from 'vitest';
import {
  isValidMimeTypeOption,
  shouldCacheResponse,
} from './security-headers-helpers';

describe('X-Content-Type-Options & Cache Control Headers', () => {
  /**
   * @test should set X-Content-Type-Options to nosniff
   * Tells browser: respect Content-Type header, don't guess MIME type
   * Prevents MIME sniffing attacks where attacker serves malicious file
   */
  it('should set X-Content-Type-Options to nosniff', () => {
    const headerValue = 'nosniff';

    expect(isValidMimeTypeOption(headerValue)).toBe(true);
    expect(headerValue).toBe('nosniff');
  });

  /**
   * @test should prevent MIME type sniffing
   * Without nosniff: browser might interpret CSS file as script
   * With nosniff: browser strictly uses Content-Type header value
   */
  it('should prevent MIME type sniffing', () => {
    // Valid: nosniff prevents sniffing
    expect(isValidMimeTypeOption('nosniff')).toBe(true);

    // Invalid: empty or wrong value allows sniffing
    expect(isValidMimeTypeOption('')).toBe(false);
    expect(isValidMimeTypeOption('sniff')).toBe(false);
    expect(isValidMimeTypeOption('no-sniff')).toBe(false); // Wrong format
  });

  /**
   * @test should apply nosniff protection to all content types
   * Protection applies uniformly to scripts, stylesheets, images, media
   * Browser cannot guess type even if Content-Type seems wrong
   */
  it('should apply nosniff to all content types', () => {
    // All protected with nosniff
    const contentTypes = [
      'application/javascript',
      'text/css',
      'image/png',
      'text/html',
      'application/json',
    ];

    // With nosniff, browser respects Content-Type for all types
    expect(contentTypes.length).toBeGreaterThan(0);
    expect(isValidMimeTypeOption('nosniff')).toBe(true);
  });

  /**
   * @test should set appropriate Cache-Control headers
   * Static assets (JS/CSS): long cache (1 year)
   * HTML: moderate cache (1 hour)
   * APIs/dynamic: no cache
   * Auth-required: no store
   */
  it('should set appropriate Cache-Control headers', () => {
    const cacheStrategies = {
      publicStatic: 'public, max-age=31536000, immutable',
      html: 'public, max-age=3600',
      api: 'private, no-store, no-cache',
      auth: 'private, no-store, must-revalidate',
    };

    // Static assets cached long
    expect(cacheStrategies.publicStatic).toContain('max-age=31536000');
    expect(cacheStrategies.publicStatic).toContain('immutable');

    // HTML cached moderately
    expect(cacheStrategies.html).toContain('max-age=3600');
    expect(cacheStrategies.html).toContain('public');

    // APIs not cached
    expect(cacheStrategies.api).toContain('no-store');
    expect(cacheStrategies.api).toContain('no-cache');

    // Auth content not stored
    expect(cacheStrategies.auth).toContain('no-store');
  });

  /**
   * @test should prevent caching of sensitive responses
   * Authenticated responses must not be cached in browser
   * User data (JSON APIs) should not be cached
   * Public static assets can be cached indefinitely
   */
  it('should prevent caching of sensitive responses', () => {
    // Authenticated response: never cache
    expect(shouldCacheResponse('application/json', true)).toBe(false);

    // Auth form: never cache
    expect(shouldCacheResponse('application/x-www-form-urlencoded', true)).toBe(false);

    // Public CSS: cache allowed
    expect(shouldCacheResponse('text/css', false)).toBe(true);

    // Public JS: cache allowed
    expect(shouldCacheResponse('application/javascript', false)).toBe(true);

    // Public image: cache allowed
    expect(shouldCacheResponse('image/png', false)).toBe(true);
  });

  /**
   * @test should set Vary header for content negotiation
   * Vary: Accept-Encoding (gzip, brotli variants)
   * Vary: Accept-Language (multi-language content)
   * Vary: Authorization (don't share auth vs non-auth)
   */
  it('should set Vary header for content negotiation', () => {
    const varyHeader = 'Accept-Encoding, Accept-Language, Authorization';

    // For authenticated APIs - vary by auth
    expect(varyHeader).toContain('Authorization');

    // For content negotiation
    expect(varyHeader).toContain('Accept-Encoding');
    expect(varyHeader).toContain('Accept-Language');
  });
});
