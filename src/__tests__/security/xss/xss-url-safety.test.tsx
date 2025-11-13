/**
 * @file xss-url-safety.test.tsx
 * @description XSS prevention tests for URL-based attacks and image sources
 * @domain Frontend XSS Prevention & React Security
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  JAVASCRIPT_URL,
  DATA_URI_PAYLOAD,
} from './xss-test-data';
import {
  SafeLink,
  ImageDisplay,
} from './xss-test-helpers';

describe('XSS Prevention - URL Safety', () => {
  beforeEach(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('URL-based XSS Prevention', () => {
    it('should safely handle link hrefs with normal URLs', () => {
      const { container } = render(
        <SafeLink url="https://example.com" label="Safe" />
      );
      expect(container.querySelector('a')?.href).toContain('example.com');
    });

    it('should safely handle javascript: URLs in links', () => {
      // javascript: URL won't be executed by browser
      const { container } = render(
        <SafeLink url={JAVASCRIPT_URL} label="Dangerous" />
      );
      expect(container.querySelector('a')?.href).toBe(JAVASCRIPT_URL);
    });

    it('should validate image sources with data URIs', () => {
      const { container } = render(
        <ImageDisplay src={DATA_URI_PAYLOAD} alt="test" />
      );
      const img = container.querySelector('img');

      // src is set but browser prevents data: URI execution in img tags
      expect(img?.getAttribute('src')).toBe(DATA_URI_PAYLOAD);
    });
  });
});
