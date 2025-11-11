/**
 * @file string-validation.test.ts
 * @description Unit tests for string validation and data sanitization utilities.
 * Tests verify XSS prevention, input sanitization, string constraints,
 * and safe data handling for user-generated content.
 * @domain Data Sanitization & Input Security
 */

import { describe, it, expect } from 'vitest';

// Validation implementations
export const validateNonEmptyString = (
  value: unknown,
  fieldName: string = 'Field'
): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (value.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }
  return { valid: true };
};

export const sanitizeString = (value: string, maxLength: number = 255): string => {
  if (typeof value !== 'string') return '';
  let sanitized = value.trim().substring(0, maxLength);
  sanitized = sanitized.replace(/[<>]/g, ''); // Remove XSS vectors
  return sanitized;
};

describe('String Validation & Input Sanitization', () => {
  // ============================================================================
  // 3. VALIDATE NON-EMPTY STRING (3 tests)
  // ============================================================================
  // Tests: Type checking, empty/whitespace handling, custom field names
  // Purpose: Ensure required text fields are provided with meaningful content

  describe('validateNonEmptyString', () => {
    it('should accept non-empty string', () => {
      // Valid input: Non-empty string with content
      expect(validateNonEmptyString('valid string').valid).toBe(true);
    });

    it('should reject empty and whitespace-only strings', () => {
      // Empty string: "" is invalid (no content)
      expect(validateNonEmptyString('').valid).toBe(false);
      expect(validateNonEmptyString('').error).toContain('cannot be empty');

      // Whitespace only: "   " after trim is empty
      expect(validateNonEmptyString('   ').valid).toBe(false);
    });

    it('should reject non-string and use custom field name', () => {
      // Type validation: Number 123 is not a string
      expect(validateNonEmptyString(123).valid).toBe(false);
      expect(validateNonEmptyString(123).error).toContain('must be a string');

      // Custom field name: Error message should include "Product Name"
      // Makes error messages more user-friendly and contextual
      const customResult = validateNonEmptyString('', 'Product Name');
      expect(customResult.error).toContain('Product Name');
    });
  });

  // ============================================================================
  // 4. SANITIZE STRING (4 tests)
  // ============================================================================
  // Tests: Whitespace trimming, length truncation, XSS prevention, safe characters
  // Purpose: Clean and secure user input to prevent XSS and injection attacks

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      // Whitespace removal: Leading/trailing spaces should be removed
      // "  hello world  " → "hello world"
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should truncate to max length with default 255', () => {
      // Custom max length: Truncate to 100 chars when specified
      expect(sanitizeString('a'.repeat(300), 100)).toHaveLength(100);

      // Default max length: Truncate to 255 chars by default
      // Prevents memory issues from extremely long strings
      expect(sanitizeString('a'.repeat(500))).toHaveLength(255);
    });

    it('should remove angle brackets (XSS prevention) and preserve safe chars', () => {
      // XSS prevention: Remove <> to prevent script injection
      // '<script>alert("xss")</script>' contains dangerous HTML tags
      const result = sanitizeString('hello <script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');

      // Safe characters: Preserve punctuation, numbers, underscores, hyphens
      // These are safe and should be kept for legitimate use
      const safeResult = sanitizeString('Hello, World! 123-test_underscore');
      expect(safeResult).toContain('Hello');
      expect(safeResult).toContain(',');
      expect(safeResult).toContain('!');
      expect(safeResult).toContain('-');
      expect(safeResult).toContain('_');
    });

    it('should handle non-string input gracefully', () => {
      // Type safety: Non-string inputs (null, undefined, numbers) return empty string
      // Prevents crashes from unexpected input types
      expect(sanitizeString(null as unknown as string)).toBe('');
    });
  });
});
