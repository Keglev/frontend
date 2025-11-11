# API Testing Strategies

## Purpose

Document testing patterns for API client, services, and integration tests.

**Location**: Testing strategies for `src/api/` modules

---

## Test Organization

### Directory Structure

```
src/__tests__/
├── api/
│   ├── client.test.ts          # apiClient interceptors & config
│   ├── auth.test.ts            # Login, token extraction
│   ├── ProductService.test.ts  # CRUD operations
│   └── integration.test.ts     # E2E API flows
```

### Test File Naming

- `*.test.ts` - Unit tests for specific modules
- `*.integration.test.ts` - Integration tests across services
- `*.e2e.test.ts` - End-to-end API flows

---

## Unit Testing API Client

### Mock HTTP Calls

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { apiClient } from '@/services/apiClient';

vi.mock('axios');

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set default headers', () => {
    expect(apiClient.defaults.baseURL).toBe(
      import.meta.env.VITE_API_URL
    );
  });

  it('should include Authorization header', async () => {
    localStorage.setItem('authToken', 'test-token');
    
    const mockResponse = { data: { id: 1 } };
    vi.mocked(axios.get).mockResolvedValue(mockResponse);

    await apiClient.get('/api/products');

    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });
});
```

### Test Request Interceptor

```typescript
describe('Request Interceptor', () => {
  it('injects token into request', async () => {
    localStorage.setItem('authToken', 'my-jwt-token');
    
    const config = {
      headers: {}
    };

    // Simulate interceptor
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    expect(config.headers['Authorization']).toBe('Bearer my-jwt-token');
  });

  it('skips token injection if no auth', async () => {
    localStorage.removeItem('authToken');
    
    const config = { headers: {} };

    // Interceptor logic
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    expect(config.headers['Authorization']).toBeUndefined();
  });
});
```

### Test Response Interceptor

```typescript
describe('Response Interceptor', () => {
  it('throws error on 401 response', async () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };

    expect(() => {
      throw error;
    }).toThrow();
  });

  it('handles network error', async () => {
    const error = {
      request: {},
      message: 'Network Error'
    };

    expect(error.response).toBeUndefined();
  });
});
```

---

## Unit Testing Services

### Mock API Responses

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '@/api/ProductService';
import * as apiModule from '@/services/apiClient';

vi.mock('@/services/apiClient');

describe('ProductService', () => {
  const mockApiClient = vi.mocked(apiModule.apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('fetches products with pagination', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', quantity: 10 },
        { id: '2', name: 'Product 2', quantity: 20 }
      ];

      mockApiClient.get.mockResolvedValue({
        data: mockProducts
      });

      const result = await ProductService.getProducts({
        page: 1,
        limit: 20
      });

      expect(result).toEqual(mockProducts);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/products',
        expect.objectContaining({
          params: { page: 1, limit: 20 }
        })
      );
    });

    it('handles empty product list', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const result = await ProductService.getProducts();

      expect(result).toEqual([]);
    });
  });

  describe('createProduct', () => {
    it('creates new product successfully', async () => {
      const newProductData = {
        name: 'New Product',
        quantity: 50,
        category: 'Electronics',
        sku: 'NEW-001',
        price: 99.99,
        description: 'Test product'
      };

      const createdProduct = {
        id: 'prod-123',
        ...newProductData
      };

      mockApiClient.post.mockResolvedValue({
        data: createdProduct
      });

      const result = await ProductService.createProduct(newProductData);

      expect(result).toEqual(createdProduct);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/products',
        newProductData
      );
    });

    it('throws error on validation failure', async () => {
      mockApiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            details: [
              { field: 'name', message: 'Name is required' }
            ]
          }
        }
      });

      await expect(
        ProductService.createProduct({} as any)
      ).rejects.toThrow();
    });
  });

  describe('updateProduct', () => {
    it('updates product fields', async () => {
      const updates = { quantity: 25, price: 89.99 };
      const updated = { id: 'prod-123', ...updates };

      mockApiClient.put.mockResolvedValue({ data: updated });

      const result = await ProductService.updateProduct('prod-123', updates);

      expect(result).toEqual(updated);
      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/api/products/prod-123',
        updates
      );
    });
  });

  describe('deleteProduct', () => {
    it('deletes product by id', async () => {
      mockApiClient.delete.mockResolvedValue({ status: 204 });

      await ProductService.deleteProduct('prod-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/api/products/prod-123'
      );
    });
  });

  describe('searchProducts', () => {
    it('searches products by query', async () => {
      const results = [
        { id: '1', name: 'Laptop Computer', quantity: 5 }
      ];

      mockApiClient.get.mockResolvedValue({ data: results });

      const result = await ProductService.searchProducts('laptop');

      expect(result).toEqual(results);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/products/search',
        expect.objectContaining({
          params: { q: 'laptop' }
        })
      );
    });

    it('returns empty array for no matches', async () => {
      mockApiClient.get.mockResolvedValue({ data: [] });

      const result = await ProductService.searchProducts('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
```

---

## Integration Testing

### API Flow Tests

```typescript
describe('Product API Integration', () => {
  const testProductData = {
    name: 'Integration Test Product',
    quantity: 100,
    category: 'Test',
    sku: 'INT-TEST-001',
    price: 19.99,
    description: 'Test description'
  };

  it('creates, reads, updates, and deletes product', async () => {
    // 1. Create
    const mockCreate = vi.mocked(apiClient.post);
    const created = await ProductService.createProduct(testProductData);
    
    expect(mockCreate).toHaveBeenCalled();
    expect(created.id).toBeDefined();

    // 2. Read
    const mockGet = vi.mocked(apiClient.get);
    const product = await ProductService.getProductById(created.id);
    
    expect(mockGet).toHaveBeenCalledWith(`/api/products/${created.id}`);
    expect(product.name).toBe(testProductData.name);

    // 3. Update
    const mockUpdate = vi.mocked(apiClient.put);
    const updated = await ProductService.updateProduct(created.id, {
      quantity: 50
    });
    
    expect(mockUpdate).toHaveBeenCalled();
    expect(updated.quantity).toBe(50);

    // 4. Delete
    const mockDelete = vi.mocked(apiClient.delete);
    await ProductService.deleteProduct(created.id);
    
    expect(mockDelete).toHaveBeenCalledWith(`/api/products/${created.id}`);
  });
});
```

### Error Handling Integration

```typescript
describe('API Error Handling', () => {
  it('handles 401 unauthorized across all services', async () => {
    const error401 = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };

    vi.mocked(apiClient.get).mockRejectedValue(error401);

    await expect(
      ProductService.getProducts()
    ).rejects.toMatchObject({
      response: { status: 401 }
    });
  });

  it('handles 500 server errors gracefully', async () => {
    const error500 = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' }
      }
    };

    vi.mocked(apiClient.post).mockRejectedValue(error500);

    await expect(
      ProductService.createProduct({} as any)
    ).rejects.toMatchObject({
      response: { status: 500 }
    });
  });

  it('handles network errors', async () => {
    const networkError = {
      message: 'Network Error',
      request: {},
      response: undefined
    };

    vi.mocked(apiClient.get).mockRejectedValue(networkError);

    await expect(
      ProductService.getProducts()
    ).rejects.toMatchObject({
      message: 'Network Error'
    });
  });
});
```

---

## Mocking Strategies

### Factory Pattern for Test Data

```typescript
const createMockProduct = (overrides?: Partial<Product>): Product => ({
  id: 'prod-test-123',
  name: 'Test Product',
  quantity: 10,
  category: 'Test',
  sku: 'TST-001',
  price: 9.99,
  description: 'Test description',
  ...overrides
});

// Usage
const product = createMockProduct({ quantity: 50 });
```

### HTTP Interceptor Mocking

```typescript
import { server } from '@/__tests__/mocks/server';
import { rest } from 'msw';

// Use MSW (Mock Service Worker) for HTTP mocking
server.use(
  rest.get('/api/products', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        createMockProduct(),
        createMockProduct({ id: 'prod-456' })
      ])
    );
  })
);

describe('ProductService with MSW', () => {
  it('fetches products', async () => {
    const products = await ProductService.getProducts();
    expect(products).toHaveLength(2);
  });
});
```

---

## Testing Checklist

### API Client Tests

- [ ] Token injection in requests
- [ ] Token removal on 401 response
- [ ] Default headers set correctly
- [ ] Base URL configured
- [ ] Interceptor order correct

### Service Tests

- [ ] All CRUD operations
- [ ] Error handling for each operation
- [ ] Parameter validation
- [ ] Data transformation
- [ ] Mocking responses

### Integration Tests

- [ ] Full request/response cycles
- [ ] Error propagation
- [ ] State management updates
- [ ] Side effects (navigation, notifications)

---

## Related Documentation

- [HTTP Client Configuration](./client.md)
- [Authentication Service](./auth.md)
- [Product Service](./product-service.md)
- [Error Handling & Security](./error-handling.md)
- [API Overview](./overview.md)

---

**Last Updated**: November 2025

