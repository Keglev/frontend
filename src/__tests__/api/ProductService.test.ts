/**
 * @fileoverview ProductService API Tests
 * Tests CRUD operations for products
 * 
 * Enterprise-grade test coverage:
 * - All 6 ProductService methods with success/error scenarios
 * - Response data extraction and transformation
 * - Pagination handling
 * - Error propagation
 * - 204 No Content handling for search
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductService from '../../api/ProductService';
import apiClient from '../../services/apiClient';

// Mock apiClient
vi.mock('../../services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('fetchProducts()', () => {
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

    it('should handle error when fetching products', async () => {
      const error = new Error('Network error');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.fetchProducts()).rejects.toThrow('Network error');
    });
  });

  describe('fetchPagedProducts(page, size)', () => {
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

    it('should extract data from nested response structure', async () => {
      const products = [{ id: 1, name: 'Test' }];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          data: products,
          pagination: { total: 1 },
        },
      });

      const result = await ProductService.fetchPagedProducts(1, 20);

      expect(result).toEqual(products);
    });

    it('should handle error when fetching paged products', async () => {
      const error = new Error('Paging error');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.fetchPagedProducts(0, 10)).rejects.toThrow('Paging error');
      expect(console.error).toHaveBeenCalled();
    });

    it('should support different page numbers', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: [] },
      });

      await ProductService.fetchPagedProducts(5, 20);

      expect(apiClient.get).toHaveBeenCalledWith('/api/products/paged', {
        params: { page: 5, size: 20 },
      });
    });
  });

  describe('addProduct(product)', () => {
    it('should add a new product with correct data', async () => {
      const newProduct = { name: 'New Product', quantity: 10, price: 15.99 };
      const mockResponse = { data: { id: 123, ...newProduct } };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.addProduct(newProduct);

      expect(result).toEqual(mockResponse);
      expect(apiClient.post).toHaveBeenCalledWith('/api/products', newProduct);
    });

    it('should handle error when adding product', async () => {
      const newProduct = { name: 'Product', quantity: 5, price: 9.99 };
      const error = new Error('Add product failed');

      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(ProductService.addProduct(newProduct)).rejects.toThrow('Add product failed');
    });

    it('should send all product properties in request', async () => {
      const product = {
        name: 'Test Product',
        quantity: 100,
        price: 99.99,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: 1 } });

      await ProductService.addProduct(product);

      expect(apiClient.post).toHaveBeenCalledWith('/api/products', product);
    });
  });

  describe('deleteProduct(id)', () => {
    it('should delete product with correct ID', async () => {
      const mockResponse = { data: { success: true, message: 'Deleted' } };

      vi.mocked(apiClient.delete).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.deleteProduct(123);

      expect(result).toEqual(mockResponse.data);
      expect(apiClient.delete).toHaveBeenCalledWith('/api/products/123');
    });

    it('should handle error when deleting product', async () => {
      const error = new Error('Delete failed');

      vi.mocked(apiClient.delete).mockRejectedValueOnce(error);

      await expect(ProductService.deleteProduct(123)).rejects.toThrow('Delete failed');
    });

    it('should include product ID in URL path', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

      await ProductService.deleteProduct(999);

      expect(apiClient.delete).toHaveBeenCalledWith('/api/products/999');
    });
  });

  describe('searchProductsByName(name)', () => {
    it('should search products by name', async () => {
      const mockResults = [{ id: 1, name: 'Test Product' }];

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 200,
        data: mockResults,
      });

      const result = await ProductService.searchProductsByName('Test');

      expect(result).toEqual(mockResults);
      expect(apiClient.get).toHaveBeenCalledWith('/api/products/search', {
        params: { name: 'Test' },
      });
    });

    it('should return empty array on 204 No Content response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 204,
        data: null,
      });

      const result = await ProductService.searchProductsByName('NonExistent');

      expect(result).toEqual([]);
    });

    it('should return empty array when response data is null', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 200,
        data: null,
      });

      const result = await ProductService.searchProductsByName('Test');

      expect(result).toEqual([]);
    });

    it('should return empty array when response data is undefined', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 200,
        data: undefined,
      });

      const result = await ProductService.searchProductsByName('Test');

      expect(result).toEqual([]);
    });

    it('should handle error when searching', async () => {
      const error = new Error('Search failed');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.searchProductsByName('Test')).rejects.toThrow('Search failed');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle partial product names in search', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        status: 200,
        data: [],
      });

      await ProductService.searchProductsByName('Part');

      expect(apiClient.get).toHaveBeenCalledWith('/api/products/search', {
        params: { name: 'Part' },
      });
    });
  });

  describe('getProductById(id)', () => {
    it('should get product by ID', async () => {
      const mockProduct = { id: 5, name: 'Product', price: 29.99 };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          data: mockProduct,
        },
      });

      const result = await ProductService.getProductById(5);

      expect(result).toEqual(mockProduct);
      expect(apiClient.get).toHaveBeenCalledWith('/api/products/5');
    });

    it('should extract nested data from response', async () => {
      const product = { id: 10, name: 'Item' };

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: {
          data: product,
          metadata: {},
        },
      });

      const result = await ProductService.getProductById(10);

      expect(result).toEqual(product);
    });

    it('should handle error when fetching product by ID', async () => {
      const error = new Error('Product not found');

      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      await expect(ProductService.getProductById(999)).rejects.toThrow('Product not found');
    });

    it('should include correct ID in URL', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: {} },
      });

      await ProductService.getProductById(456);

      expect(apiClient.get).toHaveBeenCalledWith('/api/products/456');
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Timeout after 120s');

      vi.mocked(apiClient.get).mockRejectedValueOnce(timeoutError);

      await expect(ProductService.fetchProducts()).rejects.toThrow('Timeout after 120s');
    });

    it('should handle 404 Not Found errors', async () => {
      const notFoundError = new Error('404 - Not Found');

      vi.mocked(apiClient.get).mockRejectedValueOnce(notFoundError);

      await expect(ProductService.getProductById(9999)).rejects.toThrow('404 - Not Found');
    });

    it('should handle 500 Server errors', async () => {
      const serverError = new Error('500 - Internal Server Error');

      vi.mocked(apiClient.post).mockRejectedValueOnce(serverError);

      await expect(ProductService.addProduct({ name: 'Test', quantity: 1, price: 5 }))
        .rejects.toThrow('500 - Internal Server Error');
    });
  });

  describe('Concurrency', () => {
    it('should handle concurrent product fetches', async () => {
      const products1 = [{ id: 1, name: 'Product 1' }];
      const products2 = [{ id: 2, name: 'Product 2' }];

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce({ data: products1 })
        .mockResolvedValueOnce({ data: products2 });

      const [result1, result2] = await Promise.all([
        ProductService.fetchProducts(),
        ProductService.fetchProducts(),
      ]);

      expect(result1).toEqual(products1);
      expect(result2).toEqual(products2);
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent add and delete operations', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { id: 1 } });
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      const [addResult, deleteResult] = await Promise.all([
        ProductService.addProduct({ name: 'New', quantity: 5, price: 10 }),
        ProductService.deleteProduct(999),
      ]);

      expect(addResult).toBeDefined();
      expect(deleteResult).toBeDefined();
    });
  });
});
