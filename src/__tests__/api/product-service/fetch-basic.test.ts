/**
 * @file product-service/fetch-basic.test.ts
 * @description Basic fetch operations for ProductService
 * Tests for fetching all products and paginated products
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductService from '../../../api/ProductService';
import apiClient from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProductService - Fetch Basic Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('fetchProducts()', () => {
    // Test fetching all products from the API
    it('should fetch all products successfully', async () => {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10.99, quantity: 5 },
        { id: 2, name: 'Product 2', price: 20.99, quantity: 3 },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockProducts,
      });

      const result = await ProductService.fetchProducts();

      expect(result).toEqual(mockProducts);
      expect(apiClient.get).toHaveBeenCalledWith('/api/products');
    });

    // Test error handling when fetch fails
    it('should handle error when fetching products', async () => {
      const error = new Error('Network error');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.fetchProducts()).rejects.toThrow('Network error');
    });
  });

  describe('fetchPagedProducts(page, size)', () => {
    // Test fetching paginated products with correct parameters
    it('should fetch paginated products with correct parameters', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          data: mockResponse.data,
        },
      });

      const result = await ProductService.fetchPagedProducts(0, 10);

      expect(result).toEqual(mockResponse.data);
      expect(apiClient.get).toHaveBeenCalledWith('/api/products/paged', {
        params: { page: 0, size: 10 },
      });
    });

    // Test data extraction from nested response structure
    it('should extract data from nested response structure', async () => {
      const expectedData = [{ id: 1, name: 'Test Product' }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          data: expectedData,
        },
      });

      const result = await ProductService.fetchPagedProducts(1, 20);

      expect(result).toEqual(expectedData);
    });

    // Test support for different page numbers
    it('should support different page numbers', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: [] },
      });

      await ProductService.fetchPagedProducts(5, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/api/products/paged', {
        params: { page: 5, size: 10 },
      });
    });

    // Test error handling for paged products
    it('should handle error when fetching paged products', async () => {
      const error = new Error('Server error');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.fetchPagedProducts(0, 10)).rejects.toThrow('Server error');
    });
  });
});
