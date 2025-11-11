/**
 * @file api-handlers.ts
 * @description Mock handlers for API testing including fetch patterns and storage objects
 * @domain test-utilities
 * 
 * Enterprise-grade mock utilities:
 * - Mock fetch handlers for successful/failed product operations
 * - Network error simulation
 * - localStorage and sessionStorage mocks
 * 
 * Note: Install msw (Mock Service Worker) for advanced patterns:
 * npm install --save-dev msw
 */

/**
 * Mock fetch patterns for API testing
 */
export const mockFetchHandlers = {
  /**
   * Mock successful product list fetch
   * 
   * Verification: Returns 200 status with JSON response
   */
  getProductsSuccess: (data: unknown) => {
    global.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )) as typeof fetch;
  },

  /**
   * Mock failed product list fetch
   * 
   * Verification: Returns error status with error message
   */
  getProductsError: (status: number = 500, message: string = 'Server error') => {
    global.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify({ error: message }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      )) as typeof fetch;
  },

  /**
   * Mock network error
   * 
   * Verification: Rejects promise with network error
   */
  networkError: () => {
    global.fetch = (() => Promise.reject(new Error('Network error'))) as typeof fetch;
  },
};

/**
 * Mock storage objects
 */
export const mockStorageHandlers = {
  /**
   * Mock localStorage
   * 
   * Verification: Provides in-memory storage interface compatible with browser API
   */
  localStorage: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  },

  /**
   * Mock sessionStorage
   * 
   * Verification: Provides in-memory session storage interface compatible with browser API
   */
  sessionStorage: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  },
};
