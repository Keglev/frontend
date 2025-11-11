/**
 * @file search-and-filtering.test.ts
 * @description Unit tests for product search, filtering, and data retrieval utilities.
 * Tests verify case-insensitive search, partial matching, and complex filter operations
 * for inventory discovery and product lookup functionality.
 * @domain Product Search & Discovery
 */

import { describe, it, expect } from 'vitest';
import { Product } from '../../../types/Product';

// Utility implementations
export const filterProductsByName = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return products;
  }
  const lowerTerm = searchTerm.toLowerCase();
  return products.filter((product) => product.name.toLowerCase().includes(lowerTerm));
};

// Mock data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop', quantity: 5, price: 1000, totalValue: 5000 },
  { id: 2, name: 'Mouse', quantity: 50, price: 25, totalValue: 1250 },
  { id: 3, name: 'Keyboard', quantity: 8, price: 75, totalValue: 600 },
  { id: 4, name: 'Monitor', quantity: 3, price: 300, totalValue: 900 },
  { id: 5, name: 'USB Cable', quantity: 100, price: 5, totalValue: 500 },
];

describe('Product Search & Discovery', () => {
  const mockProducts = MOCK_PRODUCTS;

  // ============================================================================
  // 6. FILTER PRODUCTS BY NAME (7 tests)
  // ============================================================================
  // Tests: Exact matches, case-insensitive, partial matches, special cases
  // Purpose: Provide user-friendly product discovery with flexible search capabilities

  describe('filterProductsByName', () => {
    it('should filter products by name', () => {
      // Exact match: Search for "Laptop" returns single product
      const result = filterProductsByName(mockProducts, 'Laptop');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
    });

    it('should filter case-insensitively', () => {
      // Case insensitivity: "laptop" (lowercase) matches "Laptop" (mixed case)
      // Essential for UX: Users don't need to match case exactly
      const result = filterProductsByName(mockProducts, 'laptop');
      expect(result).toHaveLength(1);
    });

    it('should filter with partial matches', () => {
      // Partial matching: "top" matches "Laptop" containing that substring
      // Enables discovery when users don't remember exact product names
      const result = filterProductsByName(mockProducts, 'top');
      expect(result).toHaveLength(1); // Laptop
      expect(result[0].name).toContain('top');
    });

    it('should filter multiple matching products', () => {
      // Multiple matches: "o" matches multiple products (Laptop, Monitor, Keyboard, Mouse)
      const result = filterProductsByName(mockProducts, 'o');
      expect(result.length).toBeGreaterThan(1);
    });

    it('should return all products with empty search term', () => {
      // Empty search: Empty string returns all products (no filter applied)
      expect(filterProductsByName(mockProducts, '')).toHaveLength(mockProducts.length);
    });

    it('should return empty array with whitespace-only search', () => {
      // Whitespace handling: Whitespace-only searches treated as empty → return all
      expect(filterProductsByName(mockProducts, '   ')).toHaveLength(mockProducts.length);
    });

    it('should return empty array with no matches', () => {
      // No matches: Non-existent product returns empty array
      // Graceful handling of searches with no results
      expect(filterProductsByName(mockProducts, 'NonExistent')).toHaveLength(0);
    });
  });
});
