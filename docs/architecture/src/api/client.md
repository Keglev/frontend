# HTTP Client Configuration (`apiClient.ts`)

## Purpose

Configured Axios instance that serves as the central HTTP communication layer. All API requests go through this client to benefit from centralized configuration, authentication, and error handling.

---

## Basic Configuration

### Location
`src/services/apiClient.ts`

### Setup

```typescript
import axios from 'axios';

const apiClient = axios.create({
  // Base URL from environment variable
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  
  // Request timeout: 2 minutes
  timeout: 120000,
  
  // Headers will be set by interceptors
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

### Environment Configuration

```bash
# Development
VITE_API_BASE_URL=http://localhost:8081/api

# Production
VITE_API_BASE_URL=https://api.stockease.com/api
```

---

## Request Interceptor

### Purpose

Adds authentication token and logging to every outgoing request.

### Implementation

```typescript
apiClient.interceptors.request.use(
  (config) => {
    // 1. Get JWT token from localStorage
    const token = localStorage.getItem('authToken');
    
    // 2. Inject into Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    
    return config;
  },
  (error) => {
    // Handle request setup errors
    console.error('[API Error] Request setup failed:', error);
    return Promise.reject(error);
  }
);
```

### Flow Diagram

```mermaid
sequenceDiagram
    participant App as Application
    participant Interceptor as Request Interceptor
    participant Storage as localStorage
    participant Request as HTTP Request

    App->>Interceptor: Make API call
    Interceptor->>Storage: Get JWT token
    alt Token exists
        Interceptor->>Interceptor: Inject Authorization header
        Note over Interceptor: Authorization: Bearer ${token}
    else No token
        Interceptor->>Interceptor: Skip authorization
    end
    Interceptor->>Interceptor: Log request details
    Interceptor->>Request: Send decorated request
```

### Example: What Gets Injected

```typescript
// Before request interceptor:
GET /api/products

// After request interceptor:
GET /api/products
Headers: {
  Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  Content-Type: "application/json"
}
```

---

## Response Interceptor

### Purpose

Handles responses, logs them, and manages 401 unauthorized errors.

### Implementation

```typescript
apiClient.interceptors.response.use(
  (response) => {
    // 1. Log successful response
    console.log(`[API Response] ${response.status} ${response.config.url}`, {
      data: response.data,
    });
    
    // 2. Return response
    return response;
  },
  (error) => {
    // 1. Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('[API Error] Token expired or invalid (401)');
      
      // Clear expired token
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      
      // Redirect to login
      window.location.href = '/login';
      
      return Promise.reject(new Error('Unauthorized - Please login'));
    }
    
    // 2. Log other errors
    console.error('[API Error]', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });
    
    // 3. Propagate error to caller
    return Promise.reject(error);
  }
);
```

### Flow Diagram

```mermaid
sequenceDiagram
    participant Backend as Backend API
    participant Interceptor as Response Interceptor
    participant Storage as localStorage
    participant App as Application

    Backend->>Interceptor: Send response
    Interceptor->>Interceptor: Log response
    alt Status 401 (Unauthorized)
        Interceptor->>Storage: Clear token
        Interceptor->>App: Throw error
        Note over App: Redirect to login
    else Status 2xx/3xx
        Interceptor->>App: Return response
    else Other errors
        Interceptor->>Interceptor: Log error details
        Interceptor->>App: Throw error
    end
```

### Error Handling for Different Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| **2xx** | Success | Return response normally |
| **400** | Bad Request | Log error, propagate to component |
| **401** | Unauthorized | Clear token, redirect to /login |
| **403** | Forbidden | Propagate error (authorization issue) |
| **404** | Not Found | Propagate error (resource missing) |
| **5xx** | Server Error | Log error, propagate to component |

---

## Token Management

### Token Storage Location

```typescript
// Token saved in localStorage
localStorage.getItem('authToken')  // JWT token string

// Example token:
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiIsInJvbGUiOiJhZG1pbiJ9.H1Xl-C1X72..."
```

### Token Injection in Requests

```typescript
// Automatically added to every request
Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Token Persistence

- Persists across browser sessions
- Restored on page reload
- Cleared on logout
- Cleared on 401 error

---

## Usage Examples

### Basic GET Request

```typescript
import apiClient from '@/services/apiClient';

// Simple GET
const response = await apiClient.get('/api/products');
console.log(response.data);  // Product list

// GET with query parameters
const response = await apiClient.get('/api/products', {
  params: {
    page: 1,
    size: 10,
  },
});
```

### POST Request (Create)

```typescript
// Create new product
const newProduct = { name: 'Hammer', price: 29.99, quantity: 100 };
const response = await apiClient.post('/api/products', newProduct);
console.log(response.data);  // Created product with ID
```

### PUT Request (Update)

```typescript
// Update product price
const response = await apiClient.put(
  '/api/products/123/price',
  { price: 39.99 }
);
console.log(response.data);  // Updated product
```

### DELETE Request

```typescript
// Delete product
const response = await apiClient.delete('/api/products/123');
console.log(response.status);  // 204 No Content
```

---

## Request Configuration

### Full Request Config Example

```typescript
const config = {
  // URL path (baseURL is prepended automatically)
  url: '/products',
  
  // HTTP method
  method: 'GET',
  
  // Query parameters
  params: {
    page: 1,
    size: 20,
  },
  
  // Request body
  data: {
    name: 'New Product',
    price: 99.99,
  },
  
  // Custom headers (merged with defaults)
  headers: {
    'X-Custom-Header': 'value',
  },
  
  // Request timeout (default: 120000ms)
  timeout: 30000,
};

const response = await apiClient.request(config);
```

---

## Error Handling in Calls

### Try-Catch Pattern

```typescript
try {
  const products = await apiClient.get('/api/products');
  console.log('Success:', products.data);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - user should be redirected
  } else if (error.response?.status === 404) {
    console.error('Products not found');
  } else if (error.request && !error.response) {
    console.error('Network error - no response');
  } else {
    console.error('Error:', error.message);
  }
}
```

### Promise Chain Pattern

```typescript
apiClient
  .get('/api/products')
  .then(response => {
    console.log('Products:', response.data);
  })
  .catch(error => {
    console.error('Failed to fetch products:', error.message);
  });
```

---

## Instance Customization

### Creating Custom Instances

For special cases, create custom Axios instances:

```typescript
// Custom instance with different timeout
const slowApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 300000,  // 5 minutes for slow operations
});

// Add same interceptors
slowApiClient.interceptors.request.use(...);
slowApiClient.interceptors.response.use(...);
```

---

## Testing apiClient

### Mocking in Tests

```typescript
import { vi } from 'vitest';
import apiClient from '@/services/apiClient';

// Mock the axios instance
vi.mock('@/services/apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  },
}));

// Usage in test
test('fetches products', async () => {
  const mockData = [{ id: 1, name: 'Product' }];
  (apiClient.get as any).mockResolvedValue({
    data: mockData,
  });
  
  const result = await apiClient.get('/api/products');
  expect(result.data).toEqual(mockData);
});
```

---

## Best Practices

### ✅ DO:

```typescript
// Use apiClient for all HTTP requests
const response = await apiClient.get('/api/products');

// Handle errors appropriately
try {
  await apiClient.post('/api/products', data);
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error
  }
}

// Check for token before making requests (in services)
const token = localStorage.getItem('authToken');
if (!token) {
  // Redirect to login
}
```

### ❌ DON'T:

```typescript
// Don't make HTTP requests without apiClient
fetch('/api/products');  // Misses interceptors!

// Don't manually inject Authorization header
// (interceptor does it automatically)
headers.Authorization = `Bearer ${token}`;

// Don't suppress errors silently
apiClient.get('/api/products').catch(() => {});

// Don't hardcode URLs
apiClient.get('http://localhost:8081/api/products');
```

---

## Related Documentation

- [Authentication Service](./auth.md) - JWT token handling
- [Product Service](./product-service.md) - Product operations
- [Error Handling](./error-handling.md) - Error patterns and security
- [API Overview](./overview.md) - API architecture overview
- [Testing API Layer](./testing.md) - Testing strategies

---

**Last Updated**: November 2025

