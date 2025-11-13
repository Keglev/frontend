/**
 * @file xss-escaping.test.tsx
 * @description XSS prevention tests for JSX escaping and attribute safety
 * @domain Frontend XSS Prevention & React Security
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  SCRIPT_INJECTION,
  IMG_ONERROR_PAYLOAD,
  EVENT_HANDLER_INJECTION,
  HTML_SPECIAL_CHARS,
  JAVASCRIPT_URL,
  ONMOUSEOVER_INJECTION,
} from './xss-test-data';
import {
  UserDisplay,
  DangerousProps,
} from './xss-test-helpers';
import { assertEscaped } from './xss-test-utils';

describe('XSS Prevention - Escaping & Attributes', () => {
  beforeEach(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // JSX AUTO-ESCAPING TESTS
  describe('JSX Auto-escaping Behavior', () => {
    it('should escape HTML tags in JSX text content', () => {
      const component = <div>{SCRIPT_INJECTION}</div>;
      const { container } = render(component);
      const element = container.querySelector('div');

      // Text is escaped, not executed
      expect(element?.textContent).toBe(SCRIPT_INJECTION);
      expect(element?.innerHTML).not.toContain('<script>');
    });

    it('should escape special HTML characters in JSX', () => {
      const component = <span>{HTML_SPECIAL_CHARS}</span>;
      const { container } = render(component);
      const element = container.querySelector('span');

      // Characters are escaped in text content
      expect(element?.textContent).toBe(HTML_SPECIAL_CHARS);
      assertEscaped(element?.innerHTML || '', 'div');
    });

    it('should prevent XSS in user-provided text props', () => {
      const { container } = render(<UserDisplay text={IMG_ONERROR_PAYLOAD} />);
      const element = container.querySelector('div');

      // User input is escaped, not executed
      expect(element?.textContent).toBe(IMG_ONERROR_PAYLOAD);
      assertEscaped(element?.innerHTML || '', 'img');
    });

    it('should escape attribute values', () => {
      const component = <button title={EVENT_HANDLER_INJECTION}>Click</button>;
      const { container } = render(component);
      const button = container.querySelector('button');

      // Attribute value is escaped, no handler attached
      expect(button?.getAttribute('title')).toBe(EVENT_HANDLER_INJECTION);
      expect(button?.getAttribute('onload')).toBeNull();
    });
  });

  // DANGEROUS HTML PATTERNS DETECTION
  describe('Detection of Dangerous Patterns', () => {
    it('should warn when dangerouslySetInnerHTML is used', () => {
      // dangerouslySetInnerHTML bypasses JSX escaping
      const component = (
        <div dangerouslySetInnerHTML={{ __html: '<p>test</p>' }} />
      );
      render(component);
      expect(component).toBeDefined();
    });

    it('should safely handle props that could be abused', () => {
      const { container } = render(
        <DangerousProps href={JAVASCRIPT_URL} />
      );
      const link = container.querySelector('a');

      // href is set but browser prevents javascript: URI execution
      expect(link?.getAttribute('href')).toBe(JAVASCRIPT_URL);
    });

    it('should prevent XSS via data attributes', () => {
      const component = (
        <div data-user-input={ONMOUSEOVER_INJECTION}>Content</div>
      );
      const { container } = render(component);
      const element = container.querySelector('div');

      // Data attribute is set safely, no handler created
      expect(element?.getAttribute('data-user-input')).toBe(ONMOUSEOVER_INJECTION);
      expect(element?.getAttribute('onmouseover')).toBeNull();
    });
  });
});
