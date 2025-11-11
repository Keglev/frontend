/**
 * @file DashboardLogic.ts
 * @description
 * Business logic for dashboard data retrieval and aggregation.
 *
 * **Features:**
 * - Parallel fetching of stock value and low-stock products
 * - Type-safe data response with fallback defaults
 * - Centralized error handling
 *
 * **API Endpoints:**
 * - GET /api/products/total-stock-value - Total inventory value
 * - GET /api/products/low-stock - Products with low quantities
 *
 * @module
 */

import apiClient from '../services/apiClient';
import { Product } from '../types/Product';

/**
 * Dashboard data retrieval service
 * Fetches aggregated inventory metrics for dashboard display
 */
const DashboardLogic = {
  /**
   * Fetch total stock value and low-stock products in parallel
   * @returns {Promise<{stockValue: number, lowStock: Product[]}>} Stock metrics
   * @throws Will propagate API errors to caller
   */
  async fetchDashboardData(): Promise<{
    stockValue: number;
    lowStock: Product[];
  }> {
    try {
      // Fetch both metrics in parallel for performance
      const [stockValueResponse, lowStockResponse] = await Promise.all([
        apiClient.get('/api/products/total-stock-value'),
        apiClient.get('/api/products/low-stock'),
      ]);

      const stockValueData = stockValueResponse.data?.data || 0;
      const lowStockData = Array.isArray(lowStockResponse.data) ? lowStockResponse.data as Product[] : [];

      return {
        stockValue: stockValueData,
        lowStock: lowStockData,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};

export default DashboardLogic;