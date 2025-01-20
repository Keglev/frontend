import apiClient from '../services/apiClient';

const ProductService = {
  // Fetch all products
  fetchProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },
  // Fetch all products with pagination
  fetchPagedProducts: async (page: number, size: number) => {
    try {
      const response = await apiClient.get('/products/paged', {
        params: { page, size },
      });
      console.log('Paged Products Response:', response.data); // Debug log
      return response.data.data; // Adjust based on your backend's response structure
    } catch (error) {
      console.error('Error fetching paginated products:', error);
      throw error;
    }
  },

  // Add a product
  addProduct: async (product: { name: string; quantity: number; price: number }) => {
    return apiClient.post('/products', product);
  },

  // Delete a product by ID
  deleteProduct: async (id: number) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // Search products by name
  searchProductsByName: async (name: string) => {
    try {
      const response = await apiClient.get(`/products/search`, {
        params: { name },
      });

      // If status is 204 or response data is empty, return an empty array
      if (response.status === 204 || !response.data) {
        return [];
      }

      return response.data; // Adjust based on API response structure
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Fetch a single product by ID
  getProductById: async (id: number) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.data; // Adjust based on API response structure
  },
  // Update Product Quantity
  updateProductQuantity: async (id: number, quantity: number) => {
    return apiClient.put(`/products/${id}/quantity`, { quantity });
  },
  // Update Product Price
  updateProductPrice: async (id: number, price: number) => {
    return apiClient.put(`/products/${id}/price`, { price });
  },
};

export default ProductService;
