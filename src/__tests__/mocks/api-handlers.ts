/**
 * API Mock Handlers
 * Handlers for mocking API responses during tests
 * Note: Install msw (Mock Service Worker) to use advanced patterns:
 * npm install --save-dev msw
 */

/**
 * Mock fetch patterns for API testing
 */
export const mockFetchHandlers = {
  /**
   * Mock successful product list fetch
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
