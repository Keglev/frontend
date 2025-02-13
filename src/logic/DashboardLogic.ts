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
      // Use `Promise.all` to fetch stock value and low-stock products in parallel
      const [stockValueResponse, lowStockResponse] = await Promise.all([
        apiClient.get('/products/total-stock-value'),
        apiClient.get('/products/low-stock'),
      ]);

      // Extract response data
      const stockValueData = stockValueResponse.data?.data || 0; // Default to 0 if undefined
      const lowStockData = Array.isArray(lowStockResponse.data) ? lowStockResponse.data as Product[] : [];

      return {
        stockValue: stockValueData,
        lowStock: lowStockData,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error; // Propagate the error for handling at the caller level
    }
  },
};

export default DashboardLogic;


  