/**
 * @file sorting-and-validation.test.ts
 * @description Unit tests for product sorting, validation, and data integrity utilities.
 * Tests verify multi-field sorting, data type validation, immutability, and business rule enforcement
 * for product data management and quality assurance.
 * @domain Product Data Integrity & Quality Assurance
 */

import { describe, it, expect } from 'vitest';
import { Product } from '../../../types/Product';

// Utility implementations
export const sortProducts = (
  products: Product[],
  field: keyof Product,
  order: 'asc' | 'desc' = 'asc'
): Product[] => {
  const sorted = [...products];
  sorted.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
};

export const isValidProduct = (product: Partial<Product>): boolean => {
  return (
    typeof product.id === 'number' &&
    typeof product.name === 'string' &&
    product.name.trim().length > 0 &&
    typeof product.quantity === 'number' &&
    product.quantity >= 0 &&
    typeof product.price === 'number' &&
    product.price >= 0
  );
};

// Mock data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop', quantity: 5, price: 1000, totalValue: 5000 },
  { id: 2, name: 'Mouse', quantity: 50, price: 25, totalValue: 1250 },
  { id: 3, name: 'Keyboard', quantity: 8, price: 75, totalValue: 600 },
  { id: 4, name: 'Monitor', quantity: 3, price: 300, totalValue: 900 },
  { id: 5, name: 'USB Cable', quantity: 100, price: 5, totalValue: 500 },
];

describe('Product Sorting & Data Validation', () => {
  const mockProducts = MOCK_PRODUCTS;

  // ============================================================================
  // 7. SORT PRODUCTS (6 tests)
  // ============================================================================
  // Tests: Multi-field sorting, ascending/descending, immutability, defaults
  // Purpose: Provide flexible product listing and reporting with data integrity

  describe('sortProducts', () => {
    it('should sort by name ascending', () => {
      // Alphabetical order: Ascending sort by product name
      // Expected: Keyboard, Laptop, Monitor, Mouse, USB Cable
      const result = sortProducts(mockProducts, 'name', 'asc');
      expect(result[0].name).toBe('Keyboard');
      expect(result[result.length - 1].name).toBe('USB Cable');
    });

    it('should sort by name descending', () => {
      // Reverse alphabetical: Descending sort by product name
      // Expected: USB Cable, Mouse, Monitor, Laptop, Keyboard
      const result = sortProducts(mockProducts, 'name', 'desc');
      expect(result[0].name).toBe('USB Cable');
      expect(result[result.length - 1].name).toBe('Keyboard');
    });

    it('should sort by price ascending', () => {
      // Price ascending: Lowest to highest cost
      // Expected: USB Cable (5), Mouse (25), Keyboard (75), Monitor (300), Laptop (1000)
      const result = sortProducts(mockProducts, 'price', 'asc');
      expect(result[0].price).toBe(5); // USB Cable
      expect(result[result.length - 1].price).toBe(1000); // Laptop
    });

    it('should sort by quantity descending', () => {
      // Quantity descending: Highest to lowest stock levels
      // Expected: USB Cable (100), Mouse (50), Keyboard (8), Laptop (5), Monitor (3)
      const result = sortProducts(mockProducts, 'quantity', 'desc');
      expect(result[0].quantity).toBe(100); // USB Cable
      expect(result[result.length - 1].quantity).toBe(3); // Monitor
    });

    it('should not mutate original array', () => {
      // Immutability: Sorting creates new array without modifying original
      // Critical for preventing side effects in functional programming
      const original = [...mockProducts];
      sortProducts(mockProducts, 'name', 'asc');
      expect(mockProducts).toEqual(original);
    });

    it('should default to ascending order', () => {
      // Default behavior: If order not specified, uses ascending
      // Consistency: Predictable default prevents sorting confusion
      const resultAsc = sortProducts(mockProducts, 'price', 'asc');
      const resultDefault = sortProducts(mockProducts, 'price');
      expect(resultAsc).toEqual(resultDefault);
    });
  });

  // ============================================================================
  // 8. IS VALID PRODUCT (10 tests)
  // ============================================================================
  // Tests: Type checking, business rules, required fields, boundary conditions
  // Purpose: Enforce data integrity and prevent invalid products from entering system

  describe('isValidProduct', () => {
    it('should validate correct product', () => {
      // Happy path: Complete valid product passes validation
      expect(isValidProduct(mockProducts[0])).toBe(true);
    });

    it('should accept zero quantity', () => {
      // Edge case: Out-of-stock items (quantity = 0) are valid
      const valid = { id: 1, name: 'Test', quantity: 0, price: 100 };
      expect(isValidProduct(valid)).toBe(true);
    });

    it('should accept zero price', () => {
      // Edge case: Free/promotional items (price = 0) are valid
      const valid = { id: 1, name: 'Test', quantity: 10, price: 0 };
      expect(isValidProduct(valid)).toBe(true);
    });

    it('should reject missing id', () => {
      // Required field: Product ID is mandatory identifier
      const invalid = { name: 'Test', quantity: 10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject missing name', () => {
      // Required field: Product name is mandatory for identification
      const invalid = { id: 1, quantity: 10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject empty name', () => {
      // Business rule: Empty/whitespace-only names are not descriptive
      const invalid = { id: 1, name: '   ', quantity: 10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject negative quantity', () => {
      // Business rule: Negative quantities don't make physical sense
      const invalid = { id: 1, name: 'Test', quantity: -10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject negative price', () => {
      // Business rule: Negative prices are invalid (can't charge negative amounts)
      const invalid = { id: 1, name: 'Test', quantity: 10, price: -100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject non-string name', () => {
      // Type check: Name must be string, not number/boolean/object
      const invalid = { id: 1, name: 123 as unknown as string, quantity: 10, price: 100, totalValue: 1000 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject non-number id', () => {
      // Type check: ID must be number, not string/boolean/object
      const invalid = { id: '1' as unknown as number, name: 'Test', quantity: 10, price: 100, totalValue: 1000 };
      expect(isValidProduct(invalid)).toBe(false);
    });
  });
});
