/**
 * @file auth-validation.test.ts
 * @description Unit tests for authentication-related field validation.
 * Tests verify email format validation and password strength requirements
 * for user registration and authentication security.
 * @domain Authentication & Account Security
 */

import { describe, it, expect } from 'vitest';

// Validation implementations
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (typeof password !== 'string') {
    return { valid: false, errors: ['Password must be a string'] };
  }
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  return { valid: errors.length === 0, errors };
};

describe('Authentication Field Validation', () => {
  // ============================================================================
  // 1. VALIDATE EMAIL (4 tests)
  // ============================================================================
  // Tests: Email format, whitespace handling, invalid formats, type safety
  // Purpose: Ensure valid email addresses for user accounts and communications

  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      // Standard email formats: user@domain.com
      expect(validateEmail('user@example.com')).toBe(true);
      // Subdomain email: test.user@domain.co.uk
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
      // Email with tags: user+tag@example.com (common in testing)
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email format', () => {
      // Missing domain: "invalid" has no @ symbol
      expect(validateEmail('invalid')).toBe(false);
      // Missing domain extension: "invalid@" lacks domain name
      expect(validateEmail('invalid@')).toBe(false);
      // Missing local part: "@example.com" missing username
      expect(validateEmail('@example.com')).toBe(false);
      // Incomplete domain: "user@.com" missing domain name
      expect(validateEmail('user@.com')).toBe(false);
      // Whitespace in email: "user @example.com" contains spaces
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      // Whitespace handling: Leading/trailing spaces should be trimmed
      // "  user@example.com  " → "user@example.com" (valid)
      expect(validateEmail('  user@example.com  ')).toBe(true);
    });

    it('should reject non-string and edge values', () => {
      // Type safety: null/undefined/number are not valid emails
      expect(validateEmail(null as unknown as string)).toBe(false);
      expect(validateEmail(undefined as unknown as string)).toBe(false);
      expect(validateEmail(123 as unknown as string)).toBe(false);
      // Empty string: No email content
      expect(validateEmail('')).toBe(false);
      // Whitespace only: Not a valid email
      expect(validateEmail('   ')).toBe(false);
    });
  });

  // ============================================================================
  // 2. VALIDATE PASSWORD (6 tests)
  // ============================================================================
  // Tests: Strength requirements, character variety, edge cases, type validation
  // Purpose: Enforce strong passwords for account security and prevent weak credentials

  describe('validatePassword', () => {
    it('should accept strong password with all requirements', () => {
      // Strong password: Meets all criteria (8+ chars, uppercase, lowercase, digit, special char)
      // "StrongPass123!" = 14 chars, has S/s/1/! = VALID
      const result = validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      // Minimum length: Passwords must be at least 8 characters
      // "Pass12!" = 7 chars = TOO SHORT
      const result = validatePassword('Pass12!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      // Case variety: Must contain A-Z for security
      // "password123!" = has lowercase, digit, special but NO UPPERCASE
      const result = validatePassword('password123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      // Case variety: Must contain a-z for security
      // "PASSWORD123!" = has uppercase, digit, special but NO LOWERCASE
      const result = validatePassword('PASSWORD123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without digit', () => {
      // Numeric requirement: Must contain 0-9 for complexity
      // "Password!" = has upper, lower, special but NO DIGIT
      const result = validatePassword('Password!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one digit');
    });

    it('should reject password without special character', () => {
      // Special character requirement: Must contain !@#$%^&*() etc
      // "Password123" = has upper, lower, digit but NO SPECIAL CHARACTER
      const result = validatePassword('Password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should handle multiple validation errors and type validation', () => {
      // Multiple failures: "weak" fails all criteria except lowercase
      // Accumulates all errors for comprehensive feedback
      const weakResult = validatePassword('weak');
      expect(weakResult.valid).toBe(false);
      expect(weakResult.errors.length).toBeGreaterThan(1);

      // Type validation: Non-string passwords are invalid
      // null/undefined are invalid types, should return type error
      const nonStringResult = validatePassword(null as unknown as string);
      expect(nonStringResult.valid).toBe(false);
      expect(nonStringResult.errors).toContain('Password must be a string');
    });
  });
});
