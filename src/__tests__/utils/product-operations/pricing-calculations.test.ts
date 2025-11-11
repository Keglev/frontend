/**
 * @file pricing-calculations.test.ts
 * @description Unit tests for product value and pricing calculation utilities.
 * Tests verify accurate monetary calculations, currency formatting, and edge case handling
 * for product valuations in the inventory management system.
 * @domain Product Pricing & Valuation
 */

import { describe, it, expect } from 'vitest';

// Utility implementations
export const calculateProductValue = (quantity: number, price: number): number => {
  if (quantity < 0 || price < 0) {
    throw new Error('Quantity and price must be non-negative');
  }
  return quantity * price;
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (isNaN(value)) {
    throw new Error('Value must be a number');
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
};

describe('Product Pricing & Value Calculations', () => {
  // ============================================================================
  // 1. CALCULATE PRODUCT VALUE (7 tests)
  // ============================================================================
  // Tests: Basic arithmetic operations, zero handling, precision, boundary conditions
  // Purpose: Verify accurate product valuation calculations (quantity × price)

  describe('calculateProductValue', () => {
    it('should calculate product value correctly', () => {
      // Verify standard multiplication: 10 units × $100 = $1000
      expect(calculateProductValue(10, 100)).toBe(1000);
    });

    it('should handle zero quantity', () => {
      // Edge case: Products with no stock have zero value
      expect(calculateProductValue(0, 100)).toBe(0);
    });

    it('should handle zero price', () => {
      // Edge case: Free products (promotional items) have zero value regardless of quantity
      expect(calculateProductValue(10, 0)).toBe(0);
    });

    it('should handle decimal prices', () => {
      // Precision test: Handles cents in pricing (10 units × $99.99)
      expect(calculateProductValue(10, 99.99)).toBeCloseTo(999.9, 1);
    });

    it('should handle large numbers', () => {
      // Boundary test: Supports high-volume, high-value inventories
      // 1,000,000 units × $999.99 = $999,990,000
      expect(calculateProductValue(1000000, 999.99)).toBe(999990000);
    });

    it('should throw on negative quantity', () => {
      // Validation: Negative quantities are invalid in inventory systems
      expect(() => calculateProductValue(-5, 100)).toThrow(
        'Quantity and price must be non-negative'
      );
    });

    it('should throw on negative price', () => {
      // Validation: Negative prices are invalid in financial calculations
      expect(() => calculateProductValue(5, -100)).toThrow(
        'Quantity and price must be non-negative'
      );
    });
  });

  // ============================================================================
  // 2. FORMAT CURRENCY (7 tests)
  // ============================================================================
  // Tests: Currency symbol, decimal places, locale formatting, internationalization
  // Purpose: Verify consistent and accurate currency display across supported currencies

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      // USD formatting: $1,234.56 with proper comma separators
      expect(formatCurrency(1234.56, 'USD')).toContain('1,234.56');
    });

    it('should format EUR currency correctly', () => {
      // EUR support: Verify internationalization for European market
      const formatted = formatCurrency(1234.56, 'EUR');
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('1,234.56');
    });

    it('should default to USD', () => {
      // Default currency: No currency parameter should use USD
      expect(formatCurrency(100)).toContain('100.00');
    });

    it('should round to 2 decimal places', () => {
      // Precision: Monetary values must round to 2 decimal places
      // $99.999 rounds to $100.00
      expect(formatCurrency(99.999, 'USD')).toContain('100.00');
    });

    it('should handle zero value', () => {
      // Edge case: Display zero value with proper formatting
      expect(formatCurrency(0)).toContain('0.00');
    });

    it('should handle large numbers', () => {
      // Boundary test: Format large inventory values correctly
      // $1,000,000.00 with proper thousand separators
      expect(formatCurrency(1000000, 'USD')).toContain('1,000,000.00');
    });

    it('should throw on non-number value', () => {
      // Validation: NaN (Not a Number) is invalid for formatting
      expect(() => formatCurrency(NaN)).toThrow('Value must be a number');
    });
  });
});
