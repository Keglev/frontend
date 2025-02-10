import apiClient from '../services/apiClient'; 
import { Product } from '../types/Product';

/**
 * DashboardLogic handles data fetching for the dashboard.
 * It retrieves the total stock value and a list of low-stock products.
 */
const DashboardLogic = {
  /**
   * Fetches dashboard data including total stock value and low-stock products.
   * @returns {Promise<{ stockValue: number; lowStock: Product[] }>} 
   *          A promise resolving to an object containing stock value and low-stock products.
   * @throws Will throw an error if fetching data fails.
   */
  async fetchDashboardData(): Promise<{
    stockValue: number;
    lowStock: Product[];
  }> {
    try {
      // ✅ Fetch total stock value from the API
      const stockValueResponse = await apiClient.get('/products/total-stock-value');
      const stockValueData = stockValueResponse.data; // Extract response data

      // ✅ Fetch low-stock products from the API
      const lowStockResponse = await apiClient.get('/products/low-stock');
      const lowStockData = lowStockResponse.data; // Extract response data

      return {
        stockValue: stockValueData.data || 0, // Ensure a default value of 0 if data is missing
        lowStock: Array.isArray(lowStockData) ? (lowStockData as Product[]) : [], // Ensure an array is returned
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error; // Propagate the error for handling at the caller level
    }
  },
};

export default DashboardLogic;


  