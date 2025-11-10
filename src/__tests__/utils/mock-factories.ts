/**
 * Mock Factories
 * Factory functions to create mock data for testing
 */

/**
 * Mock product interface (replace with actual Product type from your app)
 */
interface MockProduct {
  id: number;
  name: string;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  category: string;
  lastUpdated: string;
}

/**
 * Create a mock Product object with sensible defaults
 */
export function createMockProduct(overrides?: Partial<MockProduct>): MockProduct {
  return {
    id: 1,
    name: 'Test Product',
    description: 'A test product description',
    sku: 'TEST-SKU-001',
    quantity: 100,
    unitPrice: 29.99,
    category: 'Electronics',
    lastUpdated: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create multiple mock products
 */
export function createMockProducts(
  count: number = 5,
  overrides?: Partial<MockProduct>,
): MockProduct[] {
  return Array.from({ length: count }, (_, index) =>
    createMockProduct({
      id: index + 1,
      name: `Product ${index + 1}`,
      sku: `SKU-${String(index + 1).padStart(3, '0')}`,
      ...overrides,
    }),
  );
}

/**
 * Create a mock API response
 */
export function createMockApiResponse<T>(data: T, status: number = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };
}

/**
 * Create a mock API error response
 */
export function createMockApiError(
  message: string = 'API Error',
  status: number = 400,
) {
  return {
    response: {
      data: { error: message },
      status,
      statusText: 'Bad Request',
    },
    message,
  };
}
