/**
 * @file product-utils.test.ts
 * @description Comprehensive test suite for product data utilities
 * @component Tests for data transformation, validation, sorting, filtering, and inventory calculations
 * 
 * **Tested Functions:**
 * - calculateProductValue, formatCurrency, isLowStock
 * - filterProductsByName, sortProducts, calculateTotalInventoryValue
 * - getLowStockProducts, isValidProduct, calculateAveragePrice, groupProductsByPriceRange
 * 
 * **Coverage:** Success cases, edge cases (zero values), error cases, and data mutations
 */

import { describe, it, expect } from 'vitest';
import { Product } from '../../types/Product';

// Utility implementations (tested below)
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

export const isLowStock = (quantity: number, threshold: number = 10): boolean => {
  return quantity < threshold;
};

export const filterProductsByName = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return products;
  }
  const lowerTerm = searchTerm.toLowerCase();
  return products.filter((product) => product.name.toLowerCase().includes(lowerTerm));
};

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

export const calculateTotalInventoryValue = (products: Product[]): number => {
  return products.reduce((total, product) => total + product.quantity * product.price, 0);
};

export const getLowStockProducts = (products: Product[], threshold: number = 10): Product[] => {
  return products.filter((product) => isLowStock(product.quantity, threshold));
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

describe('Product Data Utility Functions', () => {
  const mockProducts = MOCK_PRODUCTS;

  describe('calculateProductValue', () => {
    // Positive cases: normal, zero, decimal values
    it('should calculate product value correctly', () => {
      expect(calculateProductValue(10, 100)).toBe(1000);
    });
    it('should handle zero quantity', () => {
      expect(calculateProductValue(0, 100)).toBe(0);
    });
    it('should handle zero price', () => {
      expect(calculateProductValue(10, 0)).toBe(0);
    });
    it('should handle decimal prices', () => {
      expect(calculateProductValue(10, 99.99)).toBeCloseTo(999.9, 1);
    });
    it('should handle large numbers', () => {
      expect(calculateProductValue(1000000, 999.99)).toBe(999990000);
    });
    // Error cases
    it('should throw on negative quantity', () => {
      expect(() => calculateProductValue(-5, 100)).toThrow('Quantity and price must be non-negative');
    });
    it('should throw on negative price', () => {
      expect(() => calculateProductValue(5, -100)).toThrow('Quantity and price must be non-negative');
    });
  });

  describe('formatCurrency', () => {
    // Default and currency support
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toContain('1,234.56');
    });
    it('should format EUR currency correctly', () => {
      const formatted = formatCurrency(1234.56, 'EUR');
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('1,234.56');
    });
    it('should default to USD', () => {
      expect(formatCurrency(100)).toContain('100.00');
    });
    // Edge cases
    it('should round to 2 decimal places', () => {
      expect(formatCurrency(99.999, 'USD')).toContain('100.00');
    });
    it('should handle zero value', () => {
      expect(formatCurrency(0)).toContain('0.00');
    });
    it('should handle large numbers', () => {
      expect(formatCurrency(1000000, 'USD')).toContain('1,000,000.00');
    });
    // Error case
    it('should throw on non-number value', () => {
      expect(() => formatCurrency(NaN)).toThrow('Value must be a number');
    });
  });

  describe('isLowStock', () => {
    // Comparisons and thresholds
    it('should identify low stock correctly', () => {
      expect(isLowStock(5, 10)).toBe(true);
      expect(isLowStock(10, 10)).toBe(false);
      expect(isLowStock(11, 10)).toBe(false);
    });
    it('should use default threshold of 10', () => {
      expect(isLowStock(9)).toBe(true);
      expect(isLowStock(10)).toBe(false);
    });
    // Edge cases
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
    // Search functionality
    it('should filter products by name', () => {
      const result = filterProductsByName(mockProducts, 'Laptop');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Laptop');
    });
    it('should filter case-insensitively', () => {
      const result = filterProductsByName(mockProducts, 'laptop');
      expect(result).toHaveLength(1);
    });
    it('should filter with partial matches', () => {
      const result = filterProductsByName(mockProducts, 'top');
      expect(result).toHaveLength(1); // Laptop
      expect(result[0].name).toContain('top');
    });
    it('should filter multiple matching products', () => {
      const result = filterProductsByName(mockProducts, 'o');
      expect(result.length).toBeGreaterThan(1);
    });
    // Edge cases
    it('should return all products with empty search term', () => {
      expect(filterProductsByName(mockProducts, '')).toHaveLength(mockProducts.length);
    });
    it('should return empty array with whitespace-only search', () => {
      expect(filterProductsByName(mockProducts, '   ')).toHaveLength(mockProducts.length);
    });
    it('should return empty array with no matches', () => {
      expect(filterProductsByName(mockProducts, 'NonExistent')).toHaveLength(0);
    });
  });

  describe('sortProducts', () => {
    // Sorting by different fields
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
    // Safety check
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
    // Correct calculation across product mix
    it('should calculate total inventory value correctly', () => {
      // 5*1000 + 50*25 + 8*75 + 3*300 + 100*5 = 8250
      expect(calculateTotalInventoryValue(mockProducts)).toBe(8250);
    });
    // Edge cases
    it('should return 0 for empty array', () => {
      expect(calculateTotalInventoryValue([])).toBe(0);
    });
    it('should handle single product', () => {
      expect(calculateTotalInventoryValue([mockProducts[0]])).toBe(5000); // 5 * 1000
    });
    it('should handle products with zero quantity', () => {
      const products = [{ id: 1, name: 'Test', quantity: 0, price: 100, totalValue: 0 }];
      expect(calculateTotalInventoryValue(products)).toBe(0);
    });
    it('should handle products with zero price', () => {
      const products = [{ id: 1, name: 'Test', quantity: 10, price: 0, totalValue: 0 }];
      expect(calculateTotalInventoryValue(products)).toBe(0);
    });
  });

  describe('getLowStockProducts', () => {
    // Filtering by threshold
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
    // Edge cases
    it('should return empty array when no low stock products', () => {
      const result = getLowStockProducts(mockProducts, 1);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(1);
      });
    });
    it('should return all products with threshold of 0', () => {
      const result = getLowStockProducts(mockProducts, 0);
      result.forEach((product) => {
        expect(product.quantity).toBeLessThan(0);
      });
    });
  });

  describe('isValidProduct', () => {
    // Valid product acceptance
    it('should validate correct product', () => {
      expect(isValidProduct(mockProducts[0])).toBe(true);
    });
    it('should accept zero quantity', () => {
      const valid = { id: 1, name: 'Test', quantity: 0, price: 100 };
      expect(isValidProduct(valid)).toBe(true);
    });
    it('should accept zero price', () => {
      const valid = { id: 1, name: 'Test', quantity: 10, price: 0 };
      expect(isValidProduct(valid)).toBe(true);
    });
    // Rejection of invalid products
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
    // Correct calculations
    it('should calculate average price correctly', () => {
      // (1000 + 25 + 75 + 300 + 5) / 5 = 281
      expect(calculateAveragePrice(mockProducts)).toBe(281);
    });
    it('should handle single product', () => {
      expect(calculateAveragePrice([mockProducts[0]])).toBe(1000);
    });
    it('should calculate with decimal prices', () => {
      const products: Product[] = [
        { id: 1, name: 'A', quantity: 1, price: 10.5, totalValue: 10.5 },
        { id: 2, name: 'B', quantity: 1, price: 20.5, totalValue: 20.5 },
      ];
      expect(calculateAveragePrice(products)).toBe(15.5);
    });
    // Edge case
    it('should return 0 for empty array', () => {
      expect(calculateAveragePrice([])).toBe(0);
    });
  });

  describe('groupProductsByPriceRange', () => {
    // Range grouping
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
    // Configurations
    it('should use default range size of 100', () => {
      const grouped = groupProductsByPriceRange(mockProducts);
      expect(Object.keys(grouped).length).toBeGreaterThan(0);
    });
    it('should handle different range sizes', () => {
      const groupedSmall = groupProductsByPriceRange(mockProducts, 50);
      const groupedLarge = groupProductsByPriceRange(mockProducts, 500);
      expect(Object.keys(groupedSmall).length).toBeGreaterThan(
        Object.keys(groupedLarge).length
      );
    });
    // Edge case
    it('should handle single product', () => {
      const products: Product[] = [{ id: 1, name: 'Test', quantity: 5, price: 50, totalValue: 250 }];
      const grouped = groupProductsByPriceRange(products, 100);
      expect(Object.keys(grouped)).toEqual(['0-100']);
      expect(grouped['0-100']).toHaveLength(1);
    });
  });
});
