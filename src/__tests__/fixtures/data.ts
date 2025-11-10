/**
 * Test Fixtures
 * Reusable mock data for tests
 */

/**
 * Mock Product Data
 */
export const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Laptop',
    description: 'High-performance laptop',
    sku: 'LAPTOP-001',
    quantity: 50,
    unitPrice: 999.99,
    category: 'Electronics',
    lastUpdated: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Mouse',
    description: 'Wireless mouse',
    sku: 'MOUSE-001',
    quantity: 500,
    unitPrice: 29.99,
    category: 'Accessories',
    lastUpdated: '2024-01-14T15:30:00Z',
  },
  {
    id: 3,
    name: 'Keyboard',
    description: 'Mechanical keyboard',
    sku: 'KEYBOARD-001',
    quantity: 200,
    unitPrice: 149.99,
    category: 'Accessories',
    lastUpdated: '2024-01-13T12:00:00Z',
  },
];

/**
 * Mock User Data
 */
export const MOCK_USER = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  roles: ['USER'],
};

/**
 * Mock Admin User Data
 */
export const MOCK_ADMIN_USER = {
  id: 2,
  username: 'admin',
  email: 'admin@example.com',
  roles: ['ADMIN', 'USER'],
};

/**
 * Mock API Responses
 */
export const MOCK_API_RESPONSES = {
  productsSuccess: {
    data: MOCK_PRODUCTS,
    status: 200,
    message: 'Products retrieved successfully',
  },
  productSuccess: {
    data: MOCK_PRODUCTS[0],
    status: 200,
    message: 'Product retrieved successfully',
  },
  productCreated: {
    data: { ...MOCK_PRODUCTS[0], id: 4 },
    status: 201,
    message: 'Product created successfully',
  },
  badRequest: {
    status: 400,
    message: 'Bad request',
    errors: ['Validation error'],
  },
  unauthorized: {
    status: 401,
    message: 'Unauthorized',
  },
  forbidden: {
    status: 403,
    message: 'Forbidden',
  },
  notFound: {
    status: 404,
    message: 'Not found',
  },
  serverError: {
    status: 500,
    message: 'Internal server error',
  },
};

/**
 * Mock Form Data
 */
export const MOCK_PRODUCT_FORM_DATA = {
  name: 'New Product',
  description: 'A new product description',
  sku: 'NEW-PRODUCT-001',
  quantity: '100',
  unitPrice: '49.99',
  category: 'Electronics',
};

/**
 * Mock Filter Options
 */
export const MOCK_FILTERS = {
  categories: ['Electronics', 'Accessories', 'Furniture'],
  priceRanges: [
    { min: 0, max: 50, label: 'Under $50' },
    { min: 50, max: 200, label: '$50 - $200' },
    { min: 200, max: null, label: 'Over $200' },
  ],
};
