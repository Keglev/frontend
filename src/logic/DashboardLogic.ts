import apiClient from '../services/apiClient';
import { Product } from '../types/Product';

const DashboardLogic = {
  async fetchDashboardData(): Promise<{
    stockValue: number;
    lowStock: Product[];
  }> {
    try {
      // Fetch total stock value
      const stockValueResponse = await apiClient.get('/products/total-stock-value');
      const stockValueData = stockValueResponse.data;

      // Fetch low-stock products
      const lowStockResponse = await apiClient.get('/products/low-stock');
      const lowStockData = lowStockResponse.data;

      return {
        stockValue: stockValueData.data || 0,
        lowStock: Array.isArray(lowStockData) ? lowStockData as Product[] : [],
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};

export default DashboardLogic;

  