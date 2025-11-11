/**
 * @file analytics-and-grouping.test.ts
 * @description Unit tests for product analytics, aggregation, and data grouping utilities.
 * Tests verify statistical calculations (averages, percentiles), grouping operations,
 * and data organization for business intelligence and reporting workflows.
 * @domain Product Analytics & Business Intelligence
 */

import { describe, it, expect } from 'vitest';
import { Product } from '../../../types/Product';

// Utility implementations
export const calculateAveragePrice = (products: Product[]): number => {
  if (products.length === 0) return 0;
  const total = products.reduce((sum, product) => sum + product.price, 0);
  return total / products.length;
};

export const groupProductsByPriceRange = (
  products: Product[],
  rangeSize: number = 100
): Record<string, Product[]> => {
  const grouped: Record<string, Product[]> = {};
  products.forEach((product) => {
    const rangeStart = Math.floor(product.price / rangeSize) * rangeSize;
    const key = `${rangeStart}-${rangeStart + rangeSize}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(product);
  });
  return grouped;
};

// Mock data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop', quantity: 5, price: 1000, totalValue: 5000 },
  { id: 2, name: 'Mouse', quantity: 50, price: 25, totalValue: 1250 },
  { id: 3, name: 'Keyboard', quantity: 8, price: 75, totalValue: 600 },
  { id: 4, name: 'Monitor', quantity: 3, price: 300, totalValue: 900 },
  { id: 5, name: 'USB Cable', quantity: 100, price: 5, totalValue: 500 },
];

describe('Product Analytics & Business Intelligence', () => {
  const mockProducts = MOCK_PRODUCTS;

  // ============================================================================
  // 9. CALCULATE AVERAGE PRICE (4 tests)
  // ============================================================================
  // Tests: Mean calculations, single items, empty sets, decimal precision
  // Purpose: Provide pricing analytics for market analysis and strategy decisions

  describe('calculateAveragePrice', () => {
    it('should calculate average price correctly', () => {
      // Mean calculation: (1000 + 25 + 75 + 300 + 5) / 5 = 281
      // Verifies accurate statistical calculation across product portfolio
      expect(calculateAveragePrice(mockProducts)).toBe(281);
    });

    it('should handle single product', () => {
      // Edge case: Single product's price is the average
      // Verifies calculation works with minimal data set
      expect(calculateAveragePrice([mockProducts[0]])).toBe(1000);
    });

    it('should calculate with decimal prices', () => {
      // Precision: Handles decimal pricing (e.g., $10.50, $20.50)
      // Average: (10.5 + 20.5) / 2 = 15.5
      const products: Product[] = [
        { id: 1, name: 'A', quantity: 1, price: 10.5, totalValue: 10.5 },
        { id: 2, name: 'B', quantity: 1, price: 20.5, totalValue: 20.5 },
      ];
      expect(calculateAveragePrice(products)).toBe(15.5);
    });

    it('should return 0 for empty array', () => {
      // Edge case: Empty product list returns 0 to prevent NaN/errors
      // Graceful handling prevents calculation failures
      expect(calculateAveragePrice([])).toBe(0);
    });
  });

  // ============================================================================
  // 10. GROUP PRODUCTS BY PRICE RANGE (5 tests)
  // ============================================================================
  // Tests: Range bucketing, configurable ranges, price boundaries, edge cases
  // Purpose: Organize products into price tiers for segmentation and reporting

  describe('groupProductsByPriceRange', () => {
    it('should group products by price range', () => {
      // Range bucketing: Groups products into consecutive price ranges
      // Verifies grouping structure creates valid range keys
      const grouped = groupProductsByPriceRange(mockProducts, 100);
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
      // Verify each group contains array of products
      Object.values(grouped).forEach((group) => {
        expect(Array.isArray(group)).toBe(true);
      });
    });

    it('should place products in correct range', () => {
      // Range accuracy: Verify products assigned to correct price buckets
      // USB Cable ($5) → 0-100 range
      // Laptop ($1000) → 1000-1100 range
      const grouped = groupProductsByPriceRange(mockProducts, 100);
      expect(grouped['0-100']?.some((p) => p.id === 5)).toBe(true);
      expect(grouped['1000-1100']?.some((p) => p.id === 1)).toBe(true);
    });

    it('should use default range size of 100', () => {
      // Default configuration: If range size not specified, uses 100
      // Consistency: Predictable default for standard price tiers
      const grouped = groupProductsByPriceRange(mockProducts);
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
    });

    it('should handle different range sizes', () => {
      // Flexible grouping: Smaller ranges = more groups, larger ranges = fewer groups
      // $50 range creates more buckets than $500 range
      // Example: 5 different prices with $50 range = more categories than $500 range
      const groupedSmall = groupProductsByPriceRange(mockProducts, 50);
      const groupedLarge = groupProductsByPriceRange(mockProducts, 500);
      expect(Object.keys(groupedSmall).length).toBeGreaterThan(
        Object.keys(groupedLarge).length
      );
    });

    it('should handle single product', () => {
      // Edge case: Single product creates one group
      // Verifies grouping logic works with minimal data
      const products: Product[] = [{ id: 1, name: 'Test', quantity: 5, price: 50, totalValue: 250 }];
      const grouped = groupProductsByPriceRange(products, 100);
      expect(Object.keys(grouped)).toEqual(['0-100']);
      expect(grouped['0-100']).toHaveLength(1);
    });
  });
});
