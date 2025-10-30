// src/api/ProductService.ts
// This module provides an abstraction layer for handling product-related API requests.
// It utilizes the `apiClient` service to interact with the backend API for CRUD operations.

import apiClient from '../services/apiClient';

const ProductService = {
  /**
   * Fetches all products from the backend.
   * 
   * @returns {Promise<any>} - A promise resolving to the list of products.
   */
  fetchProducts: async () => {
    const response = await apiClient.get('/api/products');
    return response.data;
  },

  /**
   * Fetches paginated products from the backend.
   *
   * @param {number} page - The current page number.
   * @param {number} size - The number of items per page.
   * @returns {Promise<any>} - A promise resolving to paginated product data.
   * @throws {Error} - Throws an error if the request fails.
   */
  fetchPagedProducts: async (page: number, size: number) => {
    try {
      const response = await apiClient.get('/api/products/paged', {
        params: { page, size },
      });

      console.log('Paged Products Response:', response.data); // Debug log
      return response.data.data; // Adjust based on your backend's response structure
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      throw error;
    }
  },

  /**
   * Adds a new product to the inventory.
   *
   * @param {Object} product - The product details.
   * @param {string} product.name - The name of the product.
   * @param {number} product.quantity - The quantity of the product.
   * @param {number} product.price - The price of the product.
   * @returns {Promise<any>} - A promise resolving to the added product response.
   */
  addProduct: async (product: { name: string; quantity: number; price: number }) => {
    return apiClient.post('/api/products', product);
  },

  /**
   * Deletes a product from the inventory.
   *
   * @param {number} id - The ID of the product to delete.
   * @returns {Promise<any>} - A promise resolving to the deletion confirmation response.
   */
  deleteProduct: async (id: number) => {
    const response = await apiClient.delete(`/api/products/${id}`);
    return response.data;
  },

  /**
   * Searches for products by name.
   *
   * @param {string} name - The name (or partial name) of the product to search for.
   * @returns {Promise<any[]>} - A promise resolving to an array of matching products.
   * @throws {Error} - Throws an error if the request fails.
   */
  searchProductsByName: async (name: string) => {
    try {
      const response = await apiClient.get(`/api/products/search`, {
        params: { name },
      });

      // If status is 204 (No Content) or response data is empty, return an empty array
      if (response.status === 204 || !response.data) {
        return [];
      }

      return response.data; // Adjust based on API response structure
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Retrieves a specific product by its ID.
   *
   * @param {number} id - The product ID.
   * @returns {Promise<any>} - A promise resolving to the product data.
   */
  getProductById: async (id: number) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.data; // Adjust based on API response structure
  },

  /**
   * Updates the quantity of a product.
   *
   * @param {number} id - The ID of the product to update.
   * @param {number} quantity - The new quantity value.
   * @returns {Promise<any>} - A promise resolving to the update confirmation response.
   */
  updateProductQuantity: async (id: number, quantity: number) => {
    return apiClient.put(`/api/products/${id}/quantity`, { quantity });
  },

  /**
   * Updates the price of a product.
   *
   * @param {number} id - The ID of the product to update.
   * @param {number} price - The new price value.
   * @returns {Promise<any>} - A promise resolving to the update confirmation response.
   */
  updateProductPrice: async (id: number, price: number) => {
    return apiClient.put(`/api/products/${id}/price`, { price });
  },
};

// Export ProductService for use across the application
export default ProductService;
