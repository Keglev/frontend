/**
 * @file product-service/mutations.test.ts
 * @description Create/Update/Delete operations tests for ProductService
 * Tests for adding and deleting products
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

describe('ProductService - Mutation Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('addProduct(product)', () => {
    // Test successfully adding a new product
    it('should add a new product with correct data', async () => {
      const newProduct = {
        name: 'New Product',
        price: 29.99,
        quantity: 10,
      };

      const mockResponse = { id: 123, ...newProduct };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await ProductService.addProduct(newProduct);

      expect(result).toEqual(mockResponse);
      expect(apiClient.post).toHaveBeenCalledWith('/api/products', newProduct);
    });

    // Test that all product properties are sent in request
    it('should send all product properties in request', async () => {
      const newProduct = {
        name: 'Test Product',
        price: 15.99,
        quantity: 5,
        sku: 'TEST-001',
        category: 'Electronics',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { id: 1, ...newProduct },
      });

      await ProductService.addProduct(newProduct);

      expect(apiClient.post).toHaveBeenCalledWith('/api/products', newProduct);
    });

    // Test error handling when adding product
    it('should handle error when adding product', async () => {
      const error = new Error('Validation error');

      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(ProductService.addProduct({ name: 'Test', price: 10, quantity: 5 })).rejects.toThrow('Validation error');
    });
  });

  describe('deleteProduct(id)', () => {
    // Test successfully deleting a product
    it('should delete product with correct ID', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true },
      });

      await ProductService.deleteProduct(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/products/1');
    });

    // Test correct ID is included in URL path
    it('should include product ID in URL path', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true },
      });

      await ProductService.deleteProduct(42);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/products/42');
    });

    // Test error handling for delete operation
    it('should handle error when deleting product', async () => {
      const error = new Error('Delete failed');

      vi.mocked(apiClient.delete).mockRejectedValueOnce(error);

      await expect(ProductService.deleteProduct(1)).rejects.toThrow('Delete failed');
    });
  });

  describe('Concurrent Operations', () => {
    // Test concurrent product fetches
    it('should handle concurrent product fetches', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: [{ id: 1, name: 'Product 1' }] },
      });

      const results = await Promise.all([
        ProductService.fetchPagedProducts(0, 10),
        ProductService.fetchPagedProducts(1, 10),
        ProductService.fetchPagedProducts(2, 10),
      ]);

      expect(results).toHaveLength(3);
      expect(apiClient.get).toHaveBeenCalledTimes(3);
    });

    // Test concurrent add and delete operations
    it('should handle concurrent add and delete operations', async () => {
      const newProduct = { name: 'New Product', price: 10, quantity: 5 };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { id: 1, ...newProduct },
      });

      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      const results = await Promise.all([
        ProductService.addProduct(newProduct),
        ProductService.deleteProduct(1),
        ProductService.addProduct(newProduct),
      ]);

      expect(results).toHaveLength(3);
      expect(apiClient.post).toHaveBeenCalledTimes(2);
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
    });
  });
});
