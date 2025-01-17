import apiClient from './apiClient'

const ProductService = {
  addProduct: async (product: { name: string; quantity: number; price: number }) => {
    return apiClient.post('/products', product);
  },

  async searchProductsByName(name: string) {
    try {
      const response = await apiClient.get(`/products/search`, {
        params: { name },
      });
      return response.data; // Adjust based on API response structure
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },
};

export default ProductService;
