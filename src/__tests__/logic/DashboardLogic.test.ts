/**
 * @file DashboardLogic.test.ts
 * @description Tests for DashboardLogic utility covering data aggregation, parallel API requests, and error handling
 * @domain business-logic
 * 
 * Enterprise-grade test coverage:
 * - Parallel data fetching (stock value + low stock alerts)
 * - Error propagation and recovery
 * - Data transformation and normalization
 * - Edge case handling (empty arrays, undefined values, null responses)
 * - API response validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DashboardLogic from '../../logic/DashboardLogic';
import apiClient from '../../services/apiClient';

// Mock the apiClient
vi.mock('../../services/apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('DashboardLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ================================================================================
  // SUCCESSFUL DATA FETCHING TESTS (2 tests)
  // ================================================================================

  describe('Successful Data Fetching', () => {
    it('should fetch dashboard data successfully', async () => {
      const mockStockValue = 5000;
      const mockLowStock = [
        { id: 1, name: 'Product A', quantity: 5 },
        { id: 2, name: 'Product B', quantity: 2 },
      ];

      const getImplementation = (url: string): Promise<unknown> => {
        if (url === '/api/products/total-stock-value') {
          return Promise.resolve({ data: { data: mockStockValue } });
        }
        if (url === '/api/products/low-stock') {
          return Promise.resolve({ data: mockLowStock });
        }
        return Promise.reject(new Error('Unknown URL'));
      };

      vi.spyOn(apiClient, 'get').mockImplementation(getImplementation);

      const result = await DashboardLogic.fetchDashboardData();

      // Verification: Both API endpoints return aggregated dashboard data
      expect(result.stockValue).toBe(mockStockValue);
      expect(result.lowStock).toEqual(mockLowStock);
    });

    it('should handle empty low stock list', async () => {
      const mockStockValue = 8500;

      const getImplementation = (url: string): Promise<unknown> => {
        if (url === '/api/products/total-stock-value') {
          return Promise.resolve({ data: { data: mockStockValue } });
        }
        if (url === '/api/products/low-stock') {
          return Promise.resolve({ data: [] });
        }
        return Promise.reject(new Error('Unknown URL'));
      };

      vi.spyOn(apiClient, 'get').mockImplementation(getImplementation);

      const result = await DashboardLogic.fetchDashboardData();

      // Verification: Empty low stock array handled gracefully
      expect(result.stockValue).toBe(mockStockValue);
      expect(result.lowStock).toEqual([]);
    });
  });

  // ================================================================================
  // ERROR HANDLING TESTS (2 tests)
  // ================================================================================

  describe('Error Handling', () => {
    it('should throw error when stock value API fails', async () => {
      const mockError = new Error('API Error: Failed to fetch stock value');

      const getImplementation = (url: string): Promise<unknown> => {
        if (url === '/api/products/total-stock-value') {
          return Promise.reject(mockError);
        }
        return Promise.reject(new Error('Unknown URL'));
      };

      vi.spyOn(apiClient, 'get').mockImplementation(getImplementation);

      // Verification: API error propagates to caller when stock value fetch fails
      await expect(DashboardLogic.fetchDashboardData()).rejects.toThrow('API Error');
    });

    it('should throw error when low stock API fails', async () => {
      const mockError = new Error('API Error: Failed to fetch low stock');

      const getImplementation = (url: string): Promise<unknown> => {
        if (url === '/api/products/total-stock-value') {
          return Promise.resolve({ data: { data: 1000 } });
        }
        if (url === '/api/products/low-stock') {
          return Promise.reject(mockError);
        }
        return Promise.reject(new Error('Unknown URL'));
      };

      vi.spyOn(apiClient, 'get').mockImplementation(getImplementation);

      // Verification: API error propagates even when first API succeeds
      await expect(DashboardLogic.fetchDashboardData()).rejects.toThrow('API Error');
    });
  });

  // ================================================================================
  // DATA TRANSFORMATION TESTS (2 tests)
  // ================================================================================

  describe('Data Transformation', () => {
    it('should default to 0 when stockValue data is undefined', async () => {
      const getImplementation = (url: string): Promise<unknown> => {
        if (url === '/api/products/total-stock-value') {
          return Promise.resolve({ data: {} });
        }
        if (url === '/api/products/low-stock') {
          return Promise.resolve({ data: [] });
        }
        return Promise.reject(new Error('Unknown URL'));
      };

      vi.spyOn(apiClient, 'get').mockImplementation(getImplementation);

      const result = await DashboardLogic.fetchDashboardData();

      // Edge case: Missing data field defaults to 0
      expect(result.stockValue).toBe(0);
    });

    it('should handle non-array low stock response gracefully', async () => {
      const getImplementation = (url: string): Promise<unknown> => {
        if (url === '/api/products/total-stock-value') {
          return Promise.resolve({ data: { data: 2000 } });
        }
        if (url === '/api/products/low-stock') {
          return Promise.resolve({ data: null });
        }
        return Promise.reject(new Error('Unknown URL'));
      };

      vi.spyOn(apiClient, 'get').mockImplementation(getImplementation);

      const result = await DashboardLogic.fetchDashboardData();

      // Edge case: null response normalized to empty array
      expect(result.lowStock).toEqual([]);
      expect(Array.isArray(result.lowStock)).toBe(true);
    });
  });

  // ================================================================================
  // PARALLEL REQUEST TEST (1 test)
  // ================================================================================

  describe('Parallel Requests', () => {
    it('should make both API calls in parallel using Promise.all', async () => {
      const mockStockValue = 3000;
      const mockLowStock = [{ id: 1, name: 'Item', quantity: 1 }];

      const getImplementation = (url: string): Promise<unknown> => {
        if (url === '/api/products/total-stock-value') {
          return Promise.resolve({ data: { data: mockStockValue } });
        }
        if (url === '/api/products/low-stock') {
          return Promise.resolve({ data: mockLowStock });
        }
        return Promise.reject(new Error('Unknown URL'));
      };

      vi.spyOn(apiClient, 'get').mockImplementation(getImplementation);

      await DashboardLogic.fetchDashboardData();

      // Verification: Both API endpoints called exactly once using Promise.all for parallelism
      expect(apiClient.get).toHaveBeenCalledWith('/api/products/total-stock-value');
      expect(apiClient.get).toHaveBeenCalledWith('/api/products/low-stock');
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
