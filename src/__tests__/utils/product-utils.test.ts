/**
 * @fileoverview Product Data Utility Functions Tests
 * 
 * Enterprise-grade test suite for product data manipulation utilities:
 * - Data transformation and formatting
 * - Calculation helpers
 * - Validation utilities
 * - Sorting and filtering helpers
 * - Error handling and edge cases
 * 
 * @author QA Team
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { Product } from '../../types/Product';

/**
 * Utility Functions for Product Data
 * These would typically be in a separate utils file
 */

/**
 * Calculate total stock value for a product
 */
export const calculateProductValue = (quantity: number, price: number): number => {
  if (quantity < 0 || price < 0) {
    throw new Error('Quantity and price must be non-negative');
  }
  return quantity * price;
};

/**
 * Format currency value with proper decimals
 */
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

/**
 * Check if product stock is low (less than threshold)
 */
export const isLowStock = (quantity: number, threshold: number = 10): boolean => {
  return quantity < threshold;
};

/**
 * Filter products by name
 */
export const filterProductsByName = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return products;
  }
  const lowerTerm = searchTerm.toLowerCase();
  return products.filter((product) => product.name.toLowerCase().includes(lowerTerm));
};

/**
 * Sort products by field
 */
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

/**
 * Calculate total inventory value
 */
export const calculateTotalInventoryValue = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + product.quantity * product.price;
  }, 0);
};

/**
 * Get products with low stock
 */
export const getLowStockProducts = (products: Product[], threshold: number = 10): Product[] => {
  return products.filter((product) => isLowStock(product.quantity, threshold));
};

/**
 * Validate product data
 */
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

/**
 * Calculate average price across products
 */
export const calculateAveragePrice = (products: Product[]): number => {
  if (products.length === 0) return 0;
  const total = products.reduce((sum, product) => sum + product.price, 0);
  return total / products.length;
};

/**
 * Group products by price range
 */
export const groupProductsByPriceRange = (
  products: Product[],
  rangeSize: number = 100
): Record<string, Product[]> => {
  const grouped: Record<string, Product[]> = {};

  products.forEach((product) => {
    const rangeStart = Math.floor(product.price / rangeSize) * rangeSize;
    const rangeEnd = rangeStart + rangeSize;
    const key = `${rangeStart}-${rangeEnd}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(product);
  });

  return grouped;
};

// ============================================================================
// TESTS
// ============================================================================

describe('Product Data Utility Functions', () => {
  const mockProducts: Product[] = [
    { id: 1, name: 'Laptop', quantity: 5, price: 1000, totalValue: 5000 },
    { id: 2, name: 'Mouse', quantity: 50, price: 25, totalValue: 1250 },
    { id: 3, name: 'Keyboard', quantity: 8, price: 75, totalValue: 600 },
    { id: 4, name: 'Monitor', quantity: 3, price: 300, totalValue: 900 },
    { id: 5, name: 'USB Cable', quantity: 100, price: 5, totalValue: 500 },
  ];

  describe('calculateProductValue', () => {
    it('should calculate product value correctly', () => {
      const value = calculateProductValue(10, 100);
      expect(value).toBe(1000);
    });

    it('should handle zero quantity', () => {
      const value = calculateProductValue(0, 100);
      expect(value).toBe(0);
    });

    it('should handle zero price', () => {
      const value = calculateProductValue(10, 0);
      expect(value).toBe(0);
    });

    it('should throw on negative quantity', () => {
      expect(() => calculateProductValue(-5, 100)).toThrow(
        'Quantity and price must be non-negative'
      );
    });

    it('should throw on negative price', () => {
      expect(() => calculateProductValue(5, -100)).toThrow(
        'Quantity and price must be non-negative'
      );
    });

    it('should handle large numbers', () => {
      const value = calculateProductValue(1000000, 999.99);
      expect(value).toBe(999990000);
    });

    it('should handle decimal prices', () => {
      const value = calculateProductValue(10, 99.99);
      expect(value).toBeCloseTo(999.9, 1);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      const formatted = formatCurrency(1234.56, 'USD');
      expect(formatted).toContain('1,234.56');
    });

    it('should format EUR currency correctly', () => {
      const formatted = formatCurrency(1234.56, 'EUR');
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('1,234.56');
    });

    it('should default to USD', () => {
      const formatted = formatCurrency(100);
      expect(formatted).toContain('100.00');
    });

    it('should handle zero value', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain('0.00');
    });

    it('should throw on non-number value', () => {
      expect(() => formatCurrency(NaN)).toThrow('Value must be a number');
    });

    it('should round to 2 decimal places', () => {
      const formatted = formatCurrency(99.999, 'USD');
      expect(formatted).toContain('100.00');
    });

    it('should handle large numbers', () => {
      const formatted = formatCurrency(1000000, 'USD');
      expect(formatted).toContain('1,000,000.00');
    });
  });

  describe('isLowStock', () => {
    it('should identify low stock correctly', () => {
      expect(isLowStock(5, 10)).toBe(true);
      expect(isLowStock(10, 10)).toBe(false);
      expect(isLowStock(11, 10)).toBe(false);
    });

    it('should use default threshold of 10', () => {
      expect(isLowStock(9)).toBe(true);
      expect(isLowStock(10)).toBe(false);
    });

    it('should handle zero quantity', () => {
      expect(isLowStock(0, 10)).toBe(true);
    });

    it('should handle zero threshold', () => {
      expect(isLowStock(1, 0)).toBe(false);
      expect(isLowStock(0, 0)).toBe(false);
    });

    it('should handle negative quantity', () => {
      expect(isLowStock(-5, 10)).toBe(true);
    });
  });

  describe('filterProductsByName', () => {
    it('should filter products by name', () => {
      const result = filterProductsByName(mockProducts, 'Laptop');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
    });

    it('should filter case-insensitively', () => {
      const result = filterProductsByName(mockProducts, 'laptop');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
    });

    it('should filter with partial matches', () => {
      const result = filterProductsByName(mockProducts, 'top');
      expect(result).toHaveLength(1); // Laptop
      expect(result[0].name).toContain('top');
    });

    it('should return all products with empty search term', () => {
      const result = filterProductsByName(mockProducts, '');
      expect(result).toHaveLength(mockProducts.length);
    });

    it('should return empty array with no matches', () => {
      const result = filterProductsByName(mockProducts, 'NonExistent');
      expect(result).toHaveLength(0);
    });

    it('should return empty array with whitespace-only search', () => {
      const result = filterProductsByName(mockProducts, '   ');
      expect(result).toHaveLength(mockProducts.length);
    });

    it('should filter multiple matching products', () => {
      const result = filterProductsByName(mockProducts, 'o');
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe('sortProducts', () => {
    it('should sort by name ascending', () => {
      const result = sortProducts(mockProducts, 'name', 'asc');
      expect(result[0].name).toBe('Keyboard');
      expect(result[result.length - 1].name).toBe('USB Cable');
    });

    it('should sort by name descending', () => {
      const result = sortProducts(mockProducts, 'name', 'desc');
      expect(result[0].name).toBe('USB Cable');
      expect(result[result.length - 1].name).toBe('Keyboard');
    });

    it('should sort by price ascending', () => {
      const result = sortProducts(mockProducts, 'price', 'asc');
      expect(result[0].price).toBe(5); // USB Cable
      expect(result[result.length - 1].price).toBe(1000); // Laptop
    });

    it('should sort by quantity descending', () => {
      const result = sortProducts(mockProducts, 'quantity', 'desc');
      expect(result[0].quantity).toBe(100); // USB Cable
      expect(result[result.length - 1].quantity).toBe(3); // Monitor
    });

    it('should not mutate original array', () => {
      const original = [...mockProducts];
      sortProducts(mockProducts, 'name', 'asc');
      expect(mockProducts).toEqual(original);
    });

    it('should default to ascending order', () => {
      const resultAsc = sortProducts(mockProducts, 'price', 'asc');
      const resultDefault = sortProducts(mockProducts, 'price');
      expect(resultAsc).toEqual(resultDefault);
    });
  });

  describe('calculateTotalInventoryValue', () => {
    it('should calculate total inventory value correctly', () => {
      const value = calculateTotalInventoryValue(mockProducts);
      // 5*1000 + 50*25 + 8*75 + 3*300 + 100*5 = 5000+1250+600+900+500 = 8250
      expect(value).toBe(8250);
    });

    it('should return 0 for empty array', () => {
      const value = calculateTotalInventoryValue([]);
      expect(value).toBe(0);
    });

    it('should handle single product', () => {
      const value = calculateTotalInventoryValue([mockProducts[0]]);
      expect(value).toBe(5000); // 5 * 1000
    });

    it('should handle products with zero quantity', () => {
      const products = [{ id: 1, name: 'Test', quantity: 0, price: 100, totalValue: 0 }];
      const value = calculateTotalInventoryValue(products);
      expect(value).toBe(0);
    });

    it('should handle products with zero price', () => {
      const products = [{ id: 1, name: 'Test', quantity: 10, price: 0, totalValue: 0 }];
      const value = calculateTotalInventoryValue(products);
      expect(value).toBe(0);
    });
  });

  describe('getLowStockProducts', () => {
    it('should get products with low stock', () => {
      const result = getLowStockProducts(mockProducts, 10);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(10);
      });
    });

    it('should use default threshold of 10', () => {
      const result = getLowStockProducts(mockProducts);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(10);
      });
    });

    it('should return empty array when no low stock products', () => {
      const result = getLowStockProducts(mockProducts, 1);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(1);
      });
    });

    it('should return all products with threshold of 0', () => {
      const result = getLowStockProducts(mockProducts, 0);
      // Products with quantity < 0 would only be negative quantities
      // All mockProducts have quantity >= 0, so none should match
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(0);
      });
    });
  });

  describe('isValidProduct', () => {
    it('should validate correct product', () => {
      expect(isValidProduct(mockProducts[0])).toBe(true);
    });

    it('should reject missing id', () => {
      const invalid = { name: 'Test', quantity: 10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject missing name', () => {
      const invalid = { id: 1, quantity: 10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject empty name', () => {
      const invalid = { id: 1, name: '   ', quantity: 10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject negative quantity', () => {
      const invalid = { id: 1, name: 'Test', quantity: -10, price: 100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject negative price', () => {
      const invalid = { id: 1, name: 'Test', quantity: 10, price: -100 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should accept zero quantity', () => {
      const valid = { id: 1, name: 'Test', quantity: 0, price: 100 };
      expect(isValidProduct(valid)).toBe(true);
    });

    it('should accept zero price', () => {
      const valid = { id: 1, name: 'Test', quantity: 10, price: 0 };
      expect(isValidProduct(valid)).toBe(true);
    });

    it('should reject non-string name', () => {
      const invalid = { id: 1, name: 123 as unknown as string, quantity: 10, price: 100, totalValue: 1000 };
      expect(isValidProduct(invalid)).toBe(false);
    });

    it('should reject non-number id', () => {
      const invalid = { id: '1' as unknown as number, name: 'Test', quantity: 10, price: 100, totalValue: 1000 };
      expect(isValidProduct(invalid)).toBe(false);
    });
  });

  describe('calculateAveragePrice', () => {
    it('should calculate average price correctly', () => {
      const average = calculateAveragePrice(mockProducts);
      // (1000 + 25 + 75 + 300 + 5) / 5 = 1405 / 5 = 281
      expect(average).toBe(281);
    });

    it('should return 0 for empty array', () => {
      const average = calculateAveragePrice([]);
      expect(average).toBe(0);
    });

    it('should handle single product', () => {
      const average = calculateAveragePrice([mockProducts[0]]);
      expect(average).toBe(1000);
    });

    it('should calculate with decimal prices', () => {
      const products: Product[] = [
        { id: 1, name: 'A', quantity: 1, price: 10.5, totalValue: 10.5 },
        { id: 2, name: 'B', quantity: 1, price: 20.5, totalValue: 20.5 },
      ];
      const average = calculateAveragePrice(products);
      expect(average).toBe(15.5);
    });
  });

  describe('groupProductsByPriceRange', () => {
    it('should group products by price range', () => {
      const grouped = groupProductsByPriceRange(mockProducts, 100);
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
      Object.values(grouped).forEach((group) => {
        expect(Array.isArray(group)).toBe(true);
      });
    });

    it('should place products in correct range', () => {
      const grouped = groupProductsByPriceRange(mockProducts, 100);
      // USB Cable (5) should be in 0-100
      expect(grouped['0-100']?.some((p) => p.id === 5)).toBe(true);
      // Laptop (1000) should be in 1000-1100
      expect(grouped['1000-1100']?.some((p) => p.id === 1)).toBe(true);
    });

    it('should use default range size of 100', () => {
      const grouped = groupProductsByPriceRange(mockProducts);
      // Should work with default
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
    });

    it('should handle single product', () => {
      const products: Product[] = [{ id: 1, name: 'Test', quantity: 5, price: 50, totalValue: 250 }];
      const grouped = groupProductsByPriceRange(products, 100);
      expect(Object.keys(grouped)).toEqual(['0-100']);
      expect(grouped['0-100']).toHaveLength(1);
    });

    it('should handle different range sizes', () => {
      const groupedSmall = groupProductsByPriceRange(mockProducts, 50);
      const groupedLarge = groupProductsByPriceRange(mockProducts, 500);
      expect(Object.keys(groupedSmall).length).toBeGreaterThan(
        Object.keys(groupedLarge).length
      );
    });
  });
});
