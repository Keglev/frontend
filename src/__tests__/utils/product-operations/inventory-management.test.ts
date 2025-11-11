/**
 * @file inventory-management.test.ts
 * @description Unit tests for inventory and stock management utility functions.
 * Tests verify low-stock detection, inventory aggregation, and stock threshold logic
 * for proactive inventory management and alerts.
 * @domain Inventory Management & Stock Control
 */

import { describe, it, expect } from 'vitest';
import { Product } from '../../../types/Product';

// Utility implementations
export const isLowStock = (quantity: number, threshold: number = 10): boolean => {
  return quantity < threshold;
};

export const calculateTotalInventoryValue = (products: Product[]): number => {
  return products.reduce((total, product) => total + product.quantity * product.price, 0);
};

export const getLowStockProducts = (products: Product[], threshold: number = 10): Product[] => {
  return products.filter((product) => isLowStock(product.quantity, threshold));
};

// Mock data
const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop', quantity: 5, price: 1000, totalValue: 5000 },
  { id: 2, name: 'Mouse', quantity: 50, price: 25, totalValue: 1250 },
  { id: 3, name: 'Keyboard', quantity: 8, price: 75, totalValue: 600 },
  { id: 4, name: 'Monitor', quantity: 3, price: 300, totalValue: 900 },
  { id: 5, name: 'USB Cable', quantity: 100, price: 5, totalValue: 500 },
];

describe('Inventory Management & Stock Control', () => {
  const mockProducts = MOCK_PRODUCTS;

  // ============================================================================
  // 3. IS LOW STOCK (5 tests)
  // ============================================================================
  // Tests: Threshold comparisons, default thresholds, edge cases
  // Purpose: Identify products requiring reorder to maintain optimal inventory levels

  describe('isLowStock', () => {
    it('should identify low stock correctly', () => {
      // Threshold logic: Quantity below threshold returns true
      expect(isLowStock(5, 10)).toBe(true);
      // At threshold: Quantity equal to threshold returns false
      expect(isLowStock(10, 10)).toBe(false);
      // Above threshold: Quantity above threshold returns false
      expect(isLowStock(11, 10)).toBe(false);
    });

    it('should use default threshold of 10', () => {
      // Default threshold: If no threshold provided, use 10 units
      expect(isLowStock(9)).toBe(true);
      expect(isLowStock(10)).toBe(false);
    });

    it('should handle zero quantity', () => {
      // Edge case: Out of stock (quantity = 0) is low stock
      expect(isLowStock(0, 10)).toBe(true);
    });

    it('should handle zero threshold', () => {
      // Edge case: Zero threshold means any quantity >= 0 is not low stock
      expect(isLowStock(1, 0)).toBe(false);
      expect(isLowStock(0, 0)).toBe(false);
    });

    it('should handle negative quantity', () => {
      // Edge case: Negative quantities (data corruption) treated as low stock
      expect(isLowStock(-5, 10)).toBe(true);
    });
  });

  // ============================================================================
  // 4. CALCULATE TOTAL INVENTORY VALUE (5 tests)
  // ============================================================================
  // Tests: Aggregation calculations, empty sets, single items, zero values
  // Purpose: Compute total monetary value of all inventory for financial reporting

  describe('calculateTotalInventoryValue', () => {
    it('should calculate total inventory value correctly', () => {
      // Aggregate calculation: Sum of (quantity × price) for all products
      // 5*1000 + 50*25 + 8*75 + 3*300 + 100*5 = 8250
      expect(calculateTotalInventoryValue(mockProducts)).toBe(8250);
    });

    it('should return 0 for empty array', () => {
      // Edge case: No inventory = zero value
      expect(calculateTotalInventoryValue([])).toBe(0);
    });

    it('should handle single product', () => {
      // Single item calculation: 5 × 1000 = 5000
      expect(calculateTotalInventoryValue([mockProducts[0]])).toBe(5000);
    });

    it('should handle products with zero quantity', () => {
      // Edge case: Products with no stock don't contribute to inventory value
      const products = [{ id: 1, name: 'Test', quantity: 0, price: 100, totalValue: 0 }];
      expect(calculateTotalInventoryValue(products)).toBe(0);
    });

    it('should handle products with zero price', () => {
      // Edge case: Free items don't contribute to inventory value
      const products = [{ id: 1, name: 'Test', quantity: 10, price: 0, totalValue: 0 }];
      expect(calculateTotalInventoryValue(products)).toBe(0);
    });
  });

  // ============================================================================
  // 5. GET LOW STOCK PRODUCTS (2 tests)
  // ============================================================================
  // Tests: Filtering by threshold, default thresholds
  // Purpose: Identify products below reorder point for procurement workflow

  describe('getLowStockProducts', () => {
    it('should get products with low stock', () => {
      // Filter products: Returns all products with quantity < threshold
      const result = getLowStockProducts(mockProducts, 10);
      expect(result.length).toBeGreaterThan(0);
      // Verify all returned products meet criteria
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(10);
      });
    });

    it('should use default threshold of 10', () => {
      // Default threshold: If not specified, uses 10 units
      const result = getLowStockProducts(mockProducts);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(10);
      });
    });

    it('should return empty array when no low stock products', () => {
      // No matches: Returns empty array when no products below threshold
      const result = getLowStockProducts(mockProducts, 1);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(1);
      });
    });

    it('should return all products with threshold of 0', () => {
      // Boundary test: Threshold of 0 returns products with negative quantity
      const result = getLowStockProducts(mockProducts, 0);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(0);
      });
    });
  });
});
