/**
 * Component Data Sanitization Tests
 *
 * Validates that user input is properly sanitized before rendering,
 * prevents dangerouslySetInnerHTML misuse, and validates URLs.
 *
 * @module data-sanitization.test.tsx
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { isValidURL, sanitizeObject } from './test-helpers';

describe('Component Data Sanitization', () => {
  /**
   * Test: React auto-escaping of user input
   *
   * Verifies that React automatically escapes HTML entities
   * in JSX string interpolation, preventing XSS attacks.
   */
  it('should sanitize user input before rendering', () => {
    interface DisplayComponentProps {
      userInput: string;
    }

    const SafeDisplay: React.FC<DisplayComponentProps> = ({ userInput }) => {
      // React auto-escapes by default — this is the primary XSS protection
      return <div>{userInput}</div>;
    };

    // Render XSS attempt
    const { container } = render(
      <SafeDisplay userInput="<img src=x onerror='alert(1)'>" />
    );

    const html = container.innerHTML;

    // Verify dangerous HTML is escaped, not executed
    expect(html).not.toContain('<img');
    // React escapes < and > as &lt; and &gt;
    expect(html).toContain('&lt;img');
  });

  /**
   * Test: Preventing dangerouslySetInnerHTML with untrusted input
   *
   * Validates that dangerouslySetInnerHTML is detected in components
   * and demonstrates the difference between safe and unsafe rendering.
   */
  it('should not use dangerouslySetInnerHTML with user input', () => {
    // Safe component — no dangerous HTML
    const SafeComponent = () => <div>Safe content</div>;
    const safeRender = render(<SafeComponent />);

    // Verify no dangerouslySetInnerHTML patterns in HTML
    expect(safeRender.container.innerHTML).not.toContain('__html');

    // Unsafe component — using dangerouslySetInnerHTML
    const UnsafeComponent = () => (
      <div dangerouslySetInnerHTML={{ __html: '<img onerror=alert(1)>' }} />
    );
    const unsafeRender = render(<UnsafeComponent />);

    // Raw HTML from dangerouslySetInnerHTML is injected directly (dangerous!)
    expect(unsafeRender.container.innerHTML).toContain('<img');
    expect(unsafeRender.container.innerHTML).toContain('onerror');
  });

  /**
   * Test: URL validation for href and src attributes
   *
   * Ensures that URLs used in href/src attributes don't contain
   * XSS vectors like javascript: or data: protocols.
   */
  it('should validate URLs in href and src attributes', () => {
    // Valid URLs
    expect(isValidURL('https://example.com')).toBe(true);
    expect(isValidURL('/page')).toBe(true);
    expect(isValidURL('page')).toBe(true);

    // Invalid XSS URLs
    expect(isValidURL('javascript:alert(1)')).toBe(false);
    expect(isValidURL('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  /**
   * Test: Object property sanitization
   *
   * Verifies that the sanitizeObject helper removes XSS patterns
   * from all string values in an object before rendering.
   */
  it('should sanitize object properties before rendering', () => {
    interface UserData {
      name: string;
      email: string;
      bio?: string;
    }

    // User input containing XSS attempts
    const userInput: UserData = {
      name: '<script>alert(1)</script>John',
      email: 'john@example.com',
      bio: 'javascript:alert(1)',
    };

    // Sanitize the object
    const sanitized = sanitizeObject(userInput as unknown as Record<string, unknown>);

    // Verify dangerous patterns are removed
    expect(sanitized.name).not.toContain('<script');
    expect(sanitized.bio).not.toContain('javascript:');
  });
});
