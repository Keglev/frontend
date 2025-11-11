/**
 * @fileoverview Test Fixtures & Mock Data
 * 
 * Centralized mock data repository for enterprise-grade testing across the entire application.
 * Provides standardized, reusable test fixtures that ensure consistency across test suites.
 * 
 * **Purpose:**
 * - Eliminate test data duplication and maintenance burden
 * - Ensure mock data reflects real production scenarios
 * - Enable rapid test setup with pre-configured data
 * - Maintain data consistency across 40+ test files
 * 
 * **Usage Pattern:**
 * ```typescript
 * import { MOCK_PRODUCTS, MOCK_USER } from '../fixtures/data';
 * vi.mocked(apiClient.get).mockResolvedValueOnce({ data: MOCK_PRODUCTS });
 * ```
 * 
 * @module fixtures/data
 * @author QA & Testing Team
 * @version 1.0.0
 */

/**
 * Mock Product Data - Array of realistic product inventory items
 * 
 * **Data Model:**
 * - `id`: Unique product identifier (matches backend database)
 * - `name`: Human-readable product name
 * - `description`: Detailed product description for UI display
 * - `sku`: Stock Keeping Unit (inventory tracking identifier)
 * - `quantity`: Current stock level in inventory
 * - `unitPrice`: Individual product price in USD (for cost calculations)
 * - `category`: Product category for filtering/organization
 * - `lastUpdated`: ISO 8601 timestamp of last modification
 * 
 * **Test Coverage:** Used in product listing, search, filtering, and CRUD operation tests
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
 * Mock User Data - Regular user account fixture
 * 
 * **Data Model:**
 * - `id`: Unique user identifier (matches authentication system)
 * - `username`: User's login username (no special characters)
 * - `email`: Valid email address for notifications/recovery
 * - `roles`: Array of role strings (USER role = regular user privileges)
 * 
 * **Test Coverage:** Used in login tests, authorization checks, and UI role-based rendering
 * **Security Note:** This is test data only - never contains actual passwords
 */
export const MOCK_USER = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  roles: ['USER'],
};

/**
 * Mock Admin User Data - Administrator account fixture
 * 
 * **Data Model:**
 * - `id`: Unique user identifier (different from regular user)
 * - `username`: Admin account username
 * - `email`: Admin contact email
 * - `roles`: Array containing both ADMIN and USER roles (admin inherits user privileges)
 * 
 * **Test Coverage:** Used in admin-only feature tests, permission checks, and RBAC tests
 * **Role Hierarchy:** ADMIN role includes USER privileges (role escalation)
 */
export const MOCK_ADMIN_USER = {
  id: 2,
  username: 'admin',
  email: 'admin@example.com',
  roles: ['ADMIN', 'USER'],
};

/**
 * Mock API Responses - Standardized API response objects
 * 
 * **Response Structure Pattern:**
 * - `data`: Response payload (products, error details, created resource)
 * - `status`: HTTP status code (200, 201, 400, 401, 403, 404, 500)
 * - `message`: Human-readable status message for client display
 * - `errors`: Optional array of validation error messages
 * 
 * **Test Coverage:** Used across all API integration and endpoint tests
 * 
 * **HTTP Status Codes Simulated:**
 * - 2xx: Success responses (200 OK, 201 Created)
 * - 4xx: Client errors (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found)
 * - 5xx: Server errors (500 Internal Server Error)
 */
export const MOCK_API_RESPONSES = {
  // 200 OK - Successful product list retrieval
  productsSuccess: {
    data: MOCK_PRODUCTS,
    status: 200,
    message: 'Products retrieved successfully',
  },
  
  // 200 OK - Successful single product retrieval
  productSuccess: {
    data: MOCK_PRODUCTS[0],
    status: 200,
    message: 'Product retrieved successfully',
  },
  
  // 201 Created - Successful product creation with new ID assignment
  productCreated: {
    data: { ...MOCK_PRODUCTS[0], id: 4 },
    status: 201,
    message: 'Product created successfully',
  },
  
  // 400 Bad Request - Validation error in request payload
  badRequest: {
    status: 400,
    message: 'Bad request',
    errors: ['Validation error'],
  },
  
  // 401 Unauthorized - Missing or invalid authentication credentials
  unauthorized: {
    status: 401,
    message: 'Unauthorized',
  },
  
  // 403 Forbidden - User lacks permission for requested resource
  forbidden: {
    status: 403,
    message: 'Forbidden',
  },
  
  // 404 Not Found - Requested resource does not exist
  notFound: {
    status: 404,
    message: 'Not found',
  },
  
  // 500 Internal Server Error - Unhandled server-side exception
  serverError: {
    status: 500,
    message: 'Internal server error',
  },
};

/**
 * Mock Product Form Data - User input for creating/editing products
 * 
 * **Data Model:**
 * - `name`: Product display name (string input)
 * - `description`: Detailed product information (text area input)
 * - `sku`: Stock Keeping Unit (unique inventory identifier)
 * - `quantity`: Number of units in stock (string formatted for form input)
 * - `unitPrice`: Price per unit in USD (string formatted for form input)
 * - `category`: Product categorization for organization
 * 
 * **Note:** Form fields use string types (as input elements return strings before parsing)
 * **Test Coverage:** Used in form validation tests, form submission tests, and add/edit product workflows
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
 * Mock Filter Options - Predefined filter choices for product searching
 * 
 * **Data Model:**
 * - `categories`: Array of available product category filters
 * - `priceRanges`: Array of price range objects for filtering by cost
 *   - `min`: Minimum price threshold (inclusive)
 *   - `max`: Maximum price threshold (inclusive, null = no upper limit)
 *   - `label`: User-friendly display label for the price range
 * 
 * **Price Range Logic:**
 * - "Under $50": Products priced from $0 to $49.99
 * - "$50 - $200": Products in the mid-range price segment
 * - "Over $200": Premium products with no upper price limit
 * 
 * **Test Coverage:** Used in filter UI tests, product search filtering, and category selection tests
 */
export const MOCK_FILTERS = {
  categories: ['Electronics', 'Accessories', 'Furniture'],
  priceRanges: [
    { min: 0, max: 50, label: 'Under $50' },
    { min: 50, max: 200, label: '$50 - $200' },
    { min: 200, max: null, label: 'Over $200' },
  ],
};
