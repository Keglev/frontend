import apiClient from './apiClient'

const ProductService = {
  addProduct: async (product: { name: string; quantity: number; price: number }) => {
    return apiClient.post('/products', product);
  },
};

export default ProductService;
