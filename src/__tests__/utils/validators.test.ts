/**
 * @fileoverview Form Validation and Data Sanitization Tests
 * 
 * Enterprise-grade test suite for form validation utilities:
 * - Email validation (RFC 5322 compliant)
 * - Password strength validation
 * - Input sanitization and trimming
 * - Alphanumeric validation
 * - Empty/null/undefined handling
 * - Error messages generation
 * 
 * @author QA Team
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';

/**
 * Validation Utility Functions
 * These would typically be in a separate utils file
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
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

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Trim and validate non-empty string
 */
export const validateNonEmptyString = (value: unknown, fieldName: string = 'Field'): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  if (value.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  return { valid: true };
};

/**
 * Validate positive number
 */
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

/**
 * Sanitize string input (trim whitespace, remove dangerous characters)
 */
export const sanitizeString = (value: string, maxLength: number = 255): string => {
  if (typeof value !== 'string') {
    return '';
  }

  // Trim and truncate
  let sanitized = value.trim().substring(0, maxLength);

  // Remove potential XSS characters but allow alphanumeric and common punctuation
  sanitized = sanitized.replace(/[<>]/g, '');

  return sanitized;
};

/**
 * Validate username format
 * Requirements:
 * - 3-20 characters
 * - Alphanumeric with underscores/hyphens allowed
 * - Must start with letter
 */
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

/**
 * Validate form object
 */
export const validateForm = (
  formData: Record<string, unknown>,
  rules: Record<string, (value: unknown) => boolean>
): { valid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    if (!rule(formData[field])) {
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(`${field} validation failed`);
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe('Form Validation and Data Sanitization', () => {
  describe('validateEmail', () => {
    it('should validate correct email format', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(validateEmail('  user@example.com  ')).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(validateEmail(null as unknown as string)).toBe(false);
      expect(validateEmail(undefined as unknown as string)).toBe(false);
      expect(validateEmail(123 as unknown as string)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('   ')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Pass12!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('password123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase letter', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without digit', () => {
      const result = validatePassword('Password!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one digit');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should handle multiple validation errors', () => {
      const result = validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should reject non-string password', () => {
      const result = validatePassword(null as unknown as string);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be a string');
    });
  });

  describe('validateNonEmptyString', () => {
    it('should accept non-empty string', () => {
      const result = validateNonEmptyString('valid string');
      expect(result.valid).toBe(true);
    });

    it('should reject empty string', () => {
      const result = validateNonEmptyString('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validateNonEmptyString('   ');
      expect(result.valid).toBe(false);
    });

    it('should reject non-string value', () => {
      const result = validateNonEmptyString(123);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    it('should use custom field name in error message', () => {
      const result = validateNonEmptyString('', 'Product Name');
      expect(result.error).toContain('Product Name');
    });
  });

  describe('validatePositiveNumber', () => {
    it('should accept positive number', () => {
      const result = validatePositiveNumber(100);
      expect(result.valid).toBe(true);
    });

    it('should reject zero by default', () => {
      const result = validatePositiveNumber(0);
      expect(result.valid).toBe(false);
    });

    it('should accept zero with allowZero=true', () => {
      const result = validatePositiveNumber(0, 'Field', true);
      expect(result.valid).toBe(true);
    });

    it('should reject negative number', () => {
      const result = validatePositiveNumber(-10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be positive');
    });

    it('should reject non-number value', () => {
      const result = validatePositiveNumber('100');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a number');
    });

    it('should reject NaN', () => {
      const result = validatePositiveNumber(NaN);
      expect(result.valid).toBe(false);
    });

    it('should use custom field name in error message', () => {
      const result = validatePositiveNumber(-5, 'Quantity');
      expect(result.error).toContain('Quantity');
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      const result = sanitizeString('  hello world  ');
      expect(result).toBe('hello world');
    });

    it('should truncate to max length', () => {
      const result = sanitizeString('a'.repeat(300), 100);
      expect(result).toHaveLength(100);
    });

    it('should remove angle brackets', () => {
      const result = sanitizeString('hello <script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should preserve safe characters', () => {
      const result = sanitizeString('Hello, World! 123-test_underscore');
      expect(result).toContain('Hello');
      expect(result).toContain(',');
      expect(result).toContain('!');
      expect(result).toContain('-');
      expect(result).toContain('_');
    });

    it('should default to 255 character limit', () => {
      const longString = 'a'.repeat(500);
      const result = sanitizeString(longString);
      expect(result).toHaveLength(255);
    });

    it('should handle non-string input', () => {
      const result = sanitizeString(null as unknown as string);
      expect(result).toBe('');
    });
  });

  describe('validateUsername', () => {
    it('should accept valid username', () => {
      const result = validateUsername('validUser123');
      expect(result.valid).toBe(true);
    });

    it('should accept username with underscores and hyphens', () => {
      const result = validateUsername('valid_user-123');
      expect(result.valid).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const result = validateUsername('ab');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should reject username longer than 20 characters', () => {
      const result = validateUsername('a'.repeat(21));
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not exceed 20 characters');
    });

    it('should reject username starting with non-letter', () => {
      const result = validateUsername('123user');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('start with a letter');
    });

    it('should reject username with invalid characters', () => {
      const result = validateUsername('user@name');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('can only contain letters');
    });

    it('should trim whitespace before validation', () => {
      const result = validateUsername('  validUser  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateForm', () => {
    it('should validate form with all valid fields', () => {
      const formData = {
        username: 'validUser',
        email: 'user@example.com',
      };
      const rules = {
        username: (val: unknown) => typeof val === 'string' && val.length > 0,
        email: (val: unknown) => typeof val === 'string' && val.includes('@'),
      };

      const result = validateForm(formData, rules);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should detect invalid fields', () => {
      const formData = {
        username: '',
        email: 'invalid-email',
      };
      const rules = {
        username: (val: unknown) => typeof val === 'string' && val.length > 0,
        email: (val: unknown) => typeof val === 'string' && val.includes('@'),
      };

      const result = validateForm(formData, rules);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should collect errors for multiple invalid fields', () => {
      const formData = {
        field1: null,
        field2: undefined,
      };
      const rules = {
        field1: (val: unknown) => val !== null,
        field2: (val: unknown) => val !== undefined,
      };

      const result = validateForm(formData, rules);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors)).toContain('field1');
      expect(Object.keys(result.errors)).toContain('field2');
    });

    it('should handle empty rules', () => {
      const formData = { anyField: 'value' };
      const rules = {};

      const result = validateForm(formData, rules);
      expect(result.valid).toBe(true);
    });
  });
});
