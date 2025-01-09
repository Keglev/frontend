import apiClient from './apiClient';

// Fetch all products
export const fetchProducts = async () => {
  const response = await apiClient.get('/products');
  return response.data;
};

// Delete a product
export const deleteProduct = async (id: number) => {
  const response = await apiClient.delete(`/products/${id}`);
  return response.data;
};

// Add more methods as needed (e.g., addProduct, updateProduct)
