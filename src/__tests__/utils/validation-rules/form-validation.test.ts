/**
 * @file form-validation.test.ts
 * @description Unit tests for multi-field form validation and rule engine.
 * Tests verify form-level validation with custom rules, error collection,
 * and comprehensive validation workflows for complex form submissions.
 * @domain Form Processing & Multi-Field Validation
 */

import { describe, it, expect } from 'vitest';

// Validation implementations
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

describe('Form Validation & Multi-Field Rules', () => {
  // ============================================================================
  // 7. VALIDATE FORM (4 tests)
  // ============================================================================
  // Tests: Multi-field validation, custom rules, error collection, edge cases
  // Purpose: Provide flexible form validation engine for complex workflows

  describe('validateForm', () => {
    it('should validate form with all valid fields', () => {
      // Valid form: All fields pass their validation rules
      // formData has valid username and email
      const formData = {
        username: 'validUser',
        email: 'user@example.com',
      };

      // Custom rules: Define validation logic for each field
      // username rule: Must be string and non-empty
      // email rule: Must be string containing @
      const rules = {
        username: (val: unknown) => typeof val === 'string' && val.length > 0,
        email: (val: unknown) => typeof val === 'string' && val.includes('@'),
      };

      // Result: No errors, valid = true
      const result = validateForm(formData, rules);
      expect(result.valid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should detect invalid fields and collect multiple errors', () => {
      // Invalid form: Fields fail their validation rules
      // username is empty, email has no @ (invalid email format)
      const formData = {
        username: '',
        email: 'invalid-email',
      };

      // Rules: Check for non-empty string and email format
      const rules = {
        username: (val: unknown) => typeof val === 'string' && val.length > 0,
        email: (val: unknown) => typeof val === 'string' && val.includes('@'),
      };

      // Result: Both fields fail, valid = false with 2 errors
      const result = validateForm(formData, rules);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it('should handle form with null/undefined fields', () => {
      // Edge case: Fields may be null or undefined
      // Validation should catch these invalid states
      const formData = {
        field1: null,
        field2: undefined,
      };

      // Rules: Reject null and undefined values
      const rules = {
        field1: (val: unknown) => val !== null,
        field2: (val: unknown) => val !== undefined,
      };

      // Result: Both fields fail due to null/undefined
      const result = validateForm(formData, rules);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors)).toContain('field1');
      expect(Object.keys(result.errors)).toContain('field2');
    });

    it('should handle empty rules gracefully', () => {
      // Edge case: Form with no validation rules
      // Should pass validation since there are no rules to violate
      // Useful for optional forms or forms without constraints
      const result = validateForm({ anyField: 'value' }, {});
      expect(result.valid).toBe(true);
    });
  });
});
