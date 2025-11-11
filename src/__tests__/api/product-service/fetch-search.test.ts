/**
 * @file product-service/fetch-search.test.ts
 * @description Search and ID-based fetch operations for ProductService
 * Tests for searching products and fetching by ID
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

describe('ProductService - Search & ID-based Fetch Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('searchProductsByName(name)', () => {
    // Test searching products by name
    it('should search products by name', async () => {
      const mockResults = [{ id: 1, name: 'Apple Pie' }];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResults,
      });

      const result = await ProductService.searchProductsByName('apple');

      expect(result).toEqual(mockResults);
      expect(apiClient.get).toHaveBeenCalledWith('/api/products/search', {
        params: { name: 'apple' },
      });
    });

    // Test empty response (204 No Content)
    it('should return empty array on 204 No Content response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: null,
        status: 204,
      });

      const result = await ProductService.searchProductsByName('nonexistent');

      expect(result).toEqual([]);
    });

    // Test null response data handling
    it('should return empty array when response data is null', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: null,
      });

      const result = await ProductService.searchProductsByName('test');

      expect(result).toEqual([]);
    });

    // Test undefined response data handling
    it('should return empty array when response data is undefined', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: undefined,
      });

      const result = await ProductService.searchProductsByName('test');

      expect(result).toEqual([]);
    });

    // Test search with partial product names
    it('should handle partial product names in search', async () => {
      const mockResults = [
        { id: 1, name: 'Product One' },
        { id: 2, name: 'Product Only' },
      ];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockResults,
      });

      const result = await ProductService.searchProductsByName('pro');

      expect(result).toEqual(mockResults);
    });

    // Test error handling for search
    it('should handle error when searching', async () => {
      const error = new Error('Search failed');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.searchProductsByName('test')).rejects.toThrow('Search failed');
    });
  });

  describe('getProductById(id)', () => {
    // Test fetching single product by ID
    it('should get product by ID', async () => {
      const mockProduct = { id: 1, name: 'Test Product', price: 15.99 };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockProduct },
      });

      const result = await ProductService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(apiClient.get).toHaveBeenCalledWith('/api/products/1');
    });

    // Test data extraction from nested response
    it('should extract nested data from response', async () => {
      const mockProduct = { id: 1, name: 'Test' };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          data: mockProduct,
        },
      });

      const result = await ProductService.getProductById(1);

      expect(result).toEqual(mockProduct);
    });

    // Test correct ID in URL path
    it('should include correct ID in URL', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: { id: 42, name: 'Product' } },
      });

      await ProductService.getProductById(42);

      expect(apiClient.get).toHaveBeenCalledWith('/api/products/42');
    });

    // Test error handling for fetch by ID
    it('should handle error when fetching product by ID', async () => {
      const error = new Error('Product not found');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.getProductById(999)).rejects.toThrow('Product not found');
    });

    // Test handling 404 Not Found errors
    it('should handle 404 Not Found errors', async () => {
      const error = new Error('404 Not Found');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.getProductById(999)).rejects.toThrow('404 Not Found');
    });

    // Test handling 500 Server errors
    it('should handle 500 Server errors', async () => {
      const error = new Error('500 Internal Server Error');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.getProductById(1)).rejects.toThrow('500 Internal Server Error');
    });

    // Test network timeouts
    it('should handle network timeouts', async () => {
      const error = new Error('Request timeout');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.getProductById(1)).rejects.toThrow('Request timeout');
    });
  });

  describe('Concurrent Fetch Operations', () => {
    // Test handling multiple concurrent product fetches
    it('should handle concurrent product fetches', async () => {
      const mockProduct = { id: 1, name: 'Product' };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockProduct,
      });

      const results = await Promise.all([
        ProductService.getProductById(1),
        ProductService.getProductById(2),
        ProductService.getProductById(3),
      ]);

      expect(results).toHaveLength(3);
      expect(apiClient.get).toHaveBeenCalledTimes(3);
    });
  });
});
