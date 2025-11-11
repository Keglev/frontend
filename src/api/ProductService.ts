/**
 * @file ProductService.ts
 * @description
 * Product API service providing CRUD operations and product search functionality.
 *
 * **Responsibilities:**
 * - Handle all product-related API requests
 * - Provide abstraction layer for backend API calls
 * - Process API responses and error handling
 *
 * **API Endpoints Covered:**
 * - GET /api/products - Fetch all products
 * - GET /api/products/paged - Fetch paginated products
 * - POST /api/products - Create new product
 * - DELETE /api/products/:id - Delete product
 * - GET /api/products/search - Search products by name
 * - GET /api/products/:id - Get product by ID
 * - PUT /api/products/:id/quantity - Update product quantity
 * - PUT /api/products/:id/price - Update product price
 *
 * @module ProductService
 * @requires ../services/apiClient
 */

import apiClient from '../services/apiClient';

const ProductService = {
  /**
   * Fetches all products from the backend
   * @async
   * @returns {Promise<any>} List of all products
   */
  fetchProducts: async () => {
    const response = await apiClient.get('/api/products');
    return response.data;
  },

  /**
   * Fetches paginated products with page and size parameters
   * @async
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Items per page
   * @returns {Promise<any>} Paginated product data
   * @throws {Error} API request failure
   */
  fetchPagedProducts: async (page: number, size: number) => {
    const response = await apiClient.get('/api/products/paged', {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * Creates a new product in the inventory
   * @async
   * @param {Object} product - Product data
   * @param {string} product.name - Product name
   * @param {number} product.quantity - Stock quantity
   * @param {number} product.price - Product price
   * @returns {Promise<any>} Created product response
   */
  addProduct: async (product: { name: string; quantity: number; price: number }) => {
    return apiClient.post('/api/products', product);
  },

  /**
   * Deletes a product from inventory by ID
   * @async
   * @param {number} id - Product ID to delete
   * @returns {Promise<any>} Deletion confirmation response
   */
  deleteProduct: async (id: number) => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Searches products by name (partial match supported)
   * @async
   * @param {string} name - Product name or partial name to search
   * @returns {Promise<any[]>} Array of matching products (empty if none found)
   * @throws {Error} API request failure
   */
  searchProductsByName: async (name: string) => {
    const response = await apiClient.get(`/api/products/search`, {
      params: { name },
    });
    return response.status === 204 || !response.data ? [] : response.data;
  },

  /**
   * Retrieves a specific product by ID
   * @async
   * @param {number} id - Product ID
   * @returns {Promise<any>} Product data
   */
  getProductById: async (id: number) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.data;
  },

  /**
   * Updates product quantity
   * @async
   * @param {number} id - Product ID
   * @param {number} quantity - New quantity value
   * @returns {Promise<any>} Update confirmation response
   */
  updateProductQuantity: async (id: number, quantity: number) => {
    return apiClient.put(`/api/products/${id}/quantity`, { quantity });
  },

  /**
   * Updates product price
   * @async
   * @param {number} id - Product ID
   * @param {number} price - New price value
   * @returns {Promise<any>} Update confirmation response
   */
  updateProductPrice: async (id: number, price: number) => {
    return apiClient.put(`/api/products/${id}/price`, { price });
  },
};

export default ProductService;
