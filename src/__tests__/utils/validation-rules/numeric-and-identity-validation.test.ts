/**
 * @file numeric-and-identity-validation.test.ts
 * @description Unit tests for numeric validation and user identity field constraints.
 * Tests verify positive number validation, username format rules, and business constraints
 * for user profiles and inventory management.
 * @domain User Identity & Numeric Constraints
 */

import { describe, it, expect } from 'vitest';

// Validation implementations
export const validatePositiveNumber = (
  value: unknown,
  fieldName: string = 'Field',
  allowZero: boolean = false
): { valid: boolean; error?: string } => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }
  const minValue = allowZero ? 0 : 0.01;
  if (value < minValue) {
    return { valid: false, error: `${fieldName} must be ${allowZero ? 'non-negative' : 'positive'}` };
  }
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (typeof username !== 'string') {
    return { valid: false, error: 'Username must be a string' };
  }
  const trimmed = username.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must not exceed 20 characters' };
  }
  if (!/^[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: 'Username must start with a letter' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  return { valid: true };
};

describe('Numeric & User Identity Validation', () => {
  // ============================================================================
  // 5. VALIDATE POSITIVE NUMBER (4 tests)
  // ============================================================================
  // Tests: Positive constraints, zero handling, type validation, field naming
  // Purpose: Ensure numeric quantities, prices, and counts are valid business values

  describe('validatePositiveNumber', () => {
    it('should accept positive numbers', () => {
      // Positive validation: Any number > 0 is valid
      // 100 = valid quantity/price
      expect(validatePositiveNumber(100).valid).toBe(true);
    });

    it('should handle zero: reject by default, accept with allowZero flag', () => {
      // Default behavior: Zero is rejected by default (prevents free products by accident)
      // allowZero=false: 0 < 0.01 = INVALID
      expect(validatePositiveNumber(0).valid).toBe(false);

      // Optional allowZero: When flag is true, zero becomes acceptable
      // Allows for inventory items with zero quantity or free products
      expect(validatePositiveNumber(0, 'Field', true).valid).toBe(true);
    });

    it('should reject negative numbers', () => {
      // Business logic: Negative quantities/prices don't make physical sense
      // -10 quantity = impossible in inventory
      const result = validatePositiveNumber(-10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be positive');
    });

    it('should reject non-number and NaN values', () => {
      // Type safety: String "100" is not a number type
      expect(validatePositiveNumber('100').valid).toBe(false);
      expect(validatePositiveNumber('100').error).toContain('must be a number');

      // NaN handling: NaN (Not a Number) is not a valid value
      expect(validatePositiveNumber(NaN).valid).toBe(false);
    });

    it('should use custom field name in error message', () => {
      // Custom field names: Error should reference "Quantity" not generic "Field"
      // Improves user experience with specific validation feedback
      expect(validatePositiveNumber(-5, 'Quantity').error).toContain('Quantity');
    });
  });

  // ============================================================================
  // 6. VALIDATE USERNAME (4 tests)
  // ============================================================================
  // Tests: Format constraints, length limits, character restrictions, whitespace
  // Purpose: Enforce consistent username format for user accounts and identities

  describe('validateUsername', () => {
    it('should accept valid usernames with letters, numbers, underscores, hyphens', () => {
      // Valid formats: Letters, numbers, underscores, hyphens allowed
      // "validUser123" = letters + digits
      expect(validateUsername('validUser123').valid).toBe(true);
      // "valid_user-123" = letters + digits + underscore + hyphen
      expect(validateUsername('valid_user-123').valid).toBe(true);
    });

    it('should enforce 3-20 character limits', () => {
      // Minimum length: 3 characters (e.g., "abc" is minimum valid)
      // Too short: "ab" = 2 chars = INVALID
      const tooShort = validateUsername('ab');
      expect(tooShort.valid).toBe(false);
      expect(tooShort.error).toContain('at least 3 characters');

      // Maximum length: 20 characters prevents extremely long usernames
      // Too long: 21 'a' characters = TOO LONG
      const tooLong = validateUsername('a'.repeat(21));
      expect(tooLong.valid).toBe(false);
      expect(tooLong.error).toContain('not exceed 20 characters');
    });

    it('should reject non-letter starts and invalid characters', () => {
      // Must start with letter: "123user" starts with digit = INVALID
      // Ensures consistent username patterns and prevents confusion
      const nonLetterStart = validateUsername('123user');
      expect(nonLetterStart.valid).toBe(false);
      expect(nonLetterStart.error).toContain('start with a letter');

      // Allowed characters only: "user@name" contains @ = INVALID
      // @ is not in allowed set (letters, numbers, underscore, hyphen)
      const invalidChars = validateUsername('user@name');
      expect(invalidChars.valid).toBe(false);
      expect(invalidChars.error).toContain('can only contain letters');
    });

    it('should trim whitespace before validation', () => {
      // Whitespace handling: Leading/trailing spaces should not affect validation
      // "  validUser  " → "validUser" = VALID
      expect(validateUsername('  validUser  ').valid).toBe(true);
    });
  });
});
