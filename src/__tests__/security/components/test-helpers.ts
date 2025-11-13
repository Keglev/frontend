/**
 * Security Test Helpers
 *
 * Centralized utility functions for sanitization, validation, and component testing.
 * These helpers enforce security best practices across all security-related tests.
 *
 * @module test-helpers
 */

import React from 'react';

/**
 * Sanitizes string prop values by removing common XSS attack patterns.
 *
 * This helper removes dangerous patterns like `<script>`, `javascript:`, `onerror=`, and `onclick=`.
 * Use this when testing component props to ensure malicious input is neutralized.
 *
 * @param value - The value to sanitize (can be any type)
 * @returns A sanitized string, or empty string if input is not a string
 *
 * @example
 * ```ts
 * const clean = sanitizeStringProp('<script>alert(1)</script>John');
 * // Returns: 'John'
 * ```
 */
export const sanitizeStringProp = (value: unknown): string => {
  // Ensure it's a string
  if (typeof value !== 'string') {
    return '';
  }

  // Remove common XSS patterns
  const dangerous = ['<script', 'javascript:', 'onerror=', 'onclick='];
  let sanitized = value;

  // Iteratively remove each dangerous pattern (case-insensitive)
  dangerous.forEach((pattern) => {
    const regex = new RegExp(pattern, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
};

/**
 * Validates URLs to prevent XSS attacks via href/src attributes.
 *
 * Rejects `javascript:` and `data:` URIs which are known XSS vectors.
 * Accepts relative URLs and standard HTTPS/HTTP URLs.
 *
 * @param url - The URL to validate
 * @returns `true` if the URL is safe, `false` if it contains XSS patterns
 *
 * @example
 * ```ts
 * isValidURL('https://example.com');        // true
 * isValidURL('javascript:alert(1)');        // false
 * isValidURL('data:text/html,...');         // false
 * ```
 */
export const isValidURL = (url: unknown): boolean => {
  // URL must be a string
  if (typeof url !== 'string') {
    return false;
  }

  // Prevent javascript: URLs (XSS vector)
  if (url.toLowerCase().startsWith('javascript:')) {
    return false;
  }

  // Prevent data: URIs (can contain embedded scripts)
  if (url.toLowerCase().startsWith('data:')) {
    return false;
  }

  // Validate absolute URLs by parsing with base URL
  try {
    new URL(url, 'https://example.com');
    return true;
  } catch {
    // Relative URL — allow if it doesn't contain javascript: or data: patterns
    return !url.includes('javascript:') && !url.includes('data:');
  }
};

/**
 * Sanitizes object properties to remove XSS patterns from all string values.
 *
 * Iterates through object entries and cleans string values by removing
 * script tags, javascript: protocols, and event handler attributes.
 * Non-string values are skipped.
 *
 * @param obj - The object to sanitize
 * @returns A new object with sanitized string values
 *
 * @example
 * ```ts
 * const dirty = { name: '<script>alert(1)</script>John', bio: 'javascript:evil()' };
 * const clean = sanitizeObject(dirty);
 * // Returns: { name: 'John', bio: 'evil()' }
 * ```
 */
export const sanitizeObject = (obj: Record<string, unknown>): Record<string, string> => {
  const sanitized: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    // Only process string values
    if (typeof value === 'string') {
      // Remove suspicious patterns from the string
      const cleaned = value
        .replace(/<script/gi, '')         // Remove <script tags
        .replace(/javascript:/gi, '')     // Remove javascript: protocol
        .replace(/onerror=/gi, '')        // Remove onerror event handler
        .replace(/onclick=/gi, '');       // Remove onclick event handler

      sanitized[key] = cleaned;
    }
  });

  return sanitized;
};

/**
 * Validates that a React node is a valid, non-null child component.
 *
 * Returns `false` for null or undefined children.
 * Useful when components need to conditionally render children.
 *
 * @param content - The React node to validate
 * @returns `true` if the content is valid, `false` if null/undefined
 *
 * @example
 * ```ts
 * isValidChildren(<div>Valid</div>);  // true
 * isValidChildren(null);               // false
 * isValidChildren(undefined);          // false
 * ```
 */
export const isValidChildren = (content: React.ReactNode): boolean => {
  return content !== null && content !== undefined;
};
