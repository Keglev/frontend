/**
 * @file validators.test.ts
 * @description Comprehensive validation and sanitization test suite
 * @component Tests for email, password, form, username validation and string sanitization
 * 
 * **Tested Functions:**
 * - validateEmail: RFC 5322-style email validation
 * - validatePassword: 8+ chars, uppercase, lowercase, digit, special char
 * - validateNonEmptyString, validatePositiveNumber: Custom field validation
 * - validateUsername: 3-20 chars, starts with letter, alphanumeric+underscore+hyphen
 * - sanitizeString: Trim, truncate, XSS character removal
 * - validateForm: Multi-field form validation with custom rules
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

export const validateNonEmptyString = (value: unknown, fieldName: string = 'Field'): { valid: boolean; error?: string } => {
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (value.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }
  return { valid: true };
};

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

export const sanitizeString = (value: string, maxLength: number = 255): string => {
  if (typeof value !== 'string') return '';
  let sanitized = value.trim().substring(0, maxLength);
  sanitized = sanitized.replace(/[<>]/g, ''); // Remove XSS vectors
  return sanitized;
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

export const validateForm = (
  formData: Record<string, unknown>,
  rules: Record<string, (value: unknown) => boolean>
): { valid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  Object.keys(rules).forEach((field) => {
    if (!rules[field](formData[field])) {
      if (!errors[field]) errors[field] = [];
      errors[field].push(`${field} validation failed`);
    }
  });
  return { valid: Object.keys(errors).length === 0, errors };
};

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
    it('should reject non-string and edge values', () => {
      expect(validateEmail(null as unknown as string)).toBe(false);
      expect(validateEmail(undefined as unknown as string)).toBe(false);
      expect(validateEmail(123 as unknown as string)).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('   ')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong password with all requirements', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    // Strength checks
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
    it('should handle multiple validation errors and type validation', () => {
      expect(validatePassword('weak').valid).toBe(false);
      expect(validatePassword('weak').errors.length).toBeGreaterThan(1);
      const nonStringResult = validatePassword(null as unknown as string);
      expect(nonStringResult.valid).toBe(false);
      expect(nonStringResult.errors).toContain('Password must be a string');
    });
  });

  describe('validateNonEmptyString', () => {
    it('should accept non-empty string', () => {
      expect(validateNonEmptyString('valid string').valid).toBe(true);
    });
    it('should reject empty and whitespace-only strings', () => {
      expect(validateNonEmptyString('').valid).toBe(false);
      expect(validateNonEmptyString('').error).toContain('cannot be empty');
      expect(validateNonEmptyString('   ').valid).toBe(false);
    });
    it('should reject non-string and use custom field name', () => {
      expect(validateNonEmptyString(123).valid).toBe(false);
      expect(validateNonEmptyString(123).error).toContain('must be a string');
      const customResult = validateNonEmptyString('', 'Product Name');
      expect(customResult.error).toContain('Product Name');
    });
  });

  describe('validatePositiveNumber', () => {
    it('should accept positive numbers', () => {
      expect(validatePositiveNumber(100).valid).toBe(true);
    });
    it('should handle zero: reject by default, accept with allowZero flag', () => {
      expect(validatePositiveNumber(0).valid).toBe(false);
      expect(validatePositiveNumber(0, 'Field', true).valid).toBe(true);
    });
    it('should reject negative numbers', () => {
      const result = validatePositiveNumber(-10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be positive');
    });
    it('should reject non-number and NaN values', () => {
      expect(validatePositiveNumber('100').valid).toBe(false);
      expect(validatePositiveNumber('100').error).toContain('must be a number');
      expect(validatePositiveNumber(NaN).valid).toBe(false);
    });
    it('should use custom field name in error message', () => {
      expect(validatePositiveNumber(-5, 'Quantity').error).toContain('Quantity');
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });
    it('should truncate to max length with default 255', () => {
      expect(sanitizeString('a'.repeat(300), 100)).toHaveLength(100);
      expect(sanitizeString('a'.repeat(500))).toHaveLength(255);
    });
    it('should remove angle brackets (XSS prevention) and preserve safe chars', () => {
      const result = sanitizeString('hello <script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      const safeResult = sanitizeString('Hello, World! 123-test_underscore');
      expect(safeResult).toContain('Hello');
      expect(safeResult).toContain(',');
      expect(safeResult).toContain('!');
      expect(safeResult).toContain('-');
      expect(safeResult).toContain('_');
    });
    it('should handle non-string input gracefully', () => {
      expect(sanitizeString(null as unknown as string)).toBe('');
    });
  });

  describe('validateUsername', () => {
    it('should accept valid usernames with letters, numbers, underscores, hyphens', () => {
      expect(validateUsername('validUser123').valid).toBe(true);
      expect(validateUsername('valid_user-123').valid).toBe(true);
    });
    // Length constraints
    it('should enforce 3-20 character limits', () => {
      const tooShort = validateUsername('ab');
      expect(tooShort.valid).toBe(false);
      expect(tooShort.error).toContain('at least 3 characters');
      const tooLong = validateUsername('a'.repeat(21));
      expect(tooLong.valid).toBe(false);
      expect(tooLong.error).toContain('not exceed 20 characters');
    });
    // Format constraints
    it('should reject non-letter starts and invalid characters', () => {
      const nonLetterStart = validateUsername('123user');
      expect(nonLetterStart.valid).toBe(false);
      expect(nonLetterStart.error).toContain('start with a letter');
      const invalidChars = validateUsername('user@name');
      expect(invalidChars.valid).toBe(false);
      expect(invalidChars.error).toContain('can only contain letters');
    });
    it('should trim whitespace before validation', () => {
      expect(validateUsername('  validUser  ').valid).toBe(true);
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
    it('should detect invalid fields and collect multiple errors', () => {
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
    it('should handle form with null/undefined fields', () => {
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
    it('should handle empty rules gracefully', () => {
      const result = validateForm({ anyField: 'value' }, {});
      expect(result.valid).toBe(true);
    });
  });
});
