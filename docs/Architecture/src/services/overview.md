# Services Architecture

## Overview

Services layer provides reusable business logic and API client integration. Separates concerns between components and API calls.

**Location**: `src/services/` and `src/api/`

---

## Quick Navigation

- **[Service Structure](./structure.md)** - Service types and organization
- **[Custom Hooks](./custom-hooks.md)** - Reusable business logic hooks
- **[Error Handling](./error-handling.md)** - Service error patterns and recovery
- **[Testing Services](./testing.md)** - Service testing patterns
- **[Overview](./overview.md)** - This file

---

## Service Types

### 1. API Client Service (`apiClient.ts`)

HTTP client for all API communication.

**Features**:
- Axios instance with base configuration
- Request/response interceptors
- Automatic token injection
- Error handling and standardization

**Usage**:
```typescript
import { apiClient } from '@/services/apiClient';

const response = await apiClient.get('/api/products');
const created = await apiClient.post('/api/products', data);
const updated = await apiClient.put('/api/products/1', updates);
await apiClient.delete('/api/products/1');
```

### 2. API Services (ProductService, auth, etc.)

High-level API operations organized by domain.

**ProductService**:
```typescript
ProductService.getProducts(options)
ProductService.getProductById(id)
ProductService.createProduct(data)
ProductService.updateProduct(id, updates)
ProductService.deleteProduct(id)
ProductService.searchProducts(query)
ProductService.updateStock(updates)
```

**Auth Service**:
```typescript
auth.login(username, password)
auth.logout()
auth.refreshToken()
auth.validateToken(token)
```

### 3. Custom Hooks

React hooks extracting component logic into reusable functions.

**Examples**:
```typescript
const useProducts = () => { /* fetch and manage products */ }
const useProductForm = (initialData) => { /* form state and validation */ }
const useDebounce = (value, delay) => { /* debounced value */ }
const useLocalStorage = (key, initialValue) => { /* persist state */ }
const useAuth = () => { /* authentication state */ }
```

---

## Data Flow

```
Component
├── Uses Custom Hook (useProducts)
│   ├── useState for local state
│   ├── useEffect for side effects
│   └── Calls API Service
│       └── API Service uses apiClient
│           ├── Request Interceptor (inject token)
│           ├── HTTP Call
│           └── Response Interceptor (error handling)
│
└── Updates Component State
    └── Re-renders UI
```

---

## Service Integration Examples

### Example 1: Product List Hook

```typescript
// services/useProducts.ts
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async (options?) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProductService.getProducts(options);
      setProducts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error, fetchProducts };
};

// In component
const ListStockPage = () => {
  const { products, loading, error, fetchProducts } = useProducts();
  
  useEffect(() => {
    fetchProducts({ limit: 20 });
  }, [fetchProducts]);

  return (
    <>
      {loading && <SkeletonLoader />}
      {error && <ErrorMessage error={error} />}
      {products && <ProductTable products={products} />}
    </>
  );
};
```

### Example 2: Form Validation Hook

```typescript
// services/useProductForm.ts
export const useProductForm = (onSubmit: (data: Product) => Promise<void>) => {
  const [formData, setFormData] = useState(initialProductData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (!formData.sku) newErrors.sku = 'SKU is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateForm]);

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleSubmit
  };
};

// In component
const AddProductPage = () => {
  const form = useProductForm(async (data) => {
    await ProductService.createProduct(data);
    navigate('/products');
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        value={form.formData.name}
        onChange={(e) => form.setFormData({
          ...form.formData,
          name: e.target.value
        })}
      />
      {form.errors.name && <span>{form.errors.name}</span>}
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};
```

---

## Error Handling Strategy

### Service-Level Error Handling

```typescript
// In ProductService
static async createProduct(data: ProductInput): Promise<Product> {
  try {
    const response = await apiClient.post('/api/products', data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      // Validation error - re-throw with details
      throw new ValidationError(
        'Invalid product data',
        error.response.data.details
      );
    } else if (error.response?.status === 409) {
      // Conflict error - SKU exists
      throw new ConflictError(
        `Product with SKU "${data.sku}" already exists`,
        { existingSkus: error.response.data.conflicting }
      );
    } else {
      throw error;  // Re-throw unknown errors
    }
  }
}

// Custom error classes
class ValidationError extends Error {
  constructor(message: string, public details: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

class ConflictError extends Error {
  constructor(message: string, public context: any) {
    super(message);
    this.name = 'ConflictError';
  }
}
```

### Hook-Level Error Handling

```typescript
// useProducts handles service errors gracefully
const { products, error, fetchProducts } = useProducts();

if (error instanceof ValidationError) {
  return <ValidationErrorUI details={error.details} />;
} else if (error instanceof ConflictError) {
  return <ConflictErrorUI context={error.context} />;
} else if (error) {
  return <GenericErrorUI error={error} />;
}
```

---

## Caching Strategy

### Simple Hook Caching

```typescript
// Cache products in memory
const [cache, setCache] = useState<Map<string, Product>>(new Map());

const getProductById = useCallback(async (id: string) => {
  // Check cache first
  if (cache.has(id)) {
    return cache.get(id);
  }

  // Fetch from API
  const product = await ProductService.getProductById(id);
  setCache(prev => new Map(prev).set(id, product));
  return product;
}, [cache]);
```

### Cache Invalidation

```typescript
// Invalidate cache after modifications
const createProduct = useCallback(async (data: Product) => {
  const newProduct = await ProductService.createProduct(data);
  
  // Clear products list cache
  setCache(new Map());
  
  // Invalidate products query
  invalidateQuery('products');
  
  return newProduct;
}, []);
```

---

## Testing Services

### Mock API Responses

```typescript
vi.mock('@/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

// Test service
const mockProducts = [{ id: '1', name: 'Test' }];
vi.mocked(apiClient.get).mockResolvedValue({ data: mockProducts });

const products = await ProductService.getProducts();
expect(products).toEqual(mockProducts);
```

### Test Custom Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

test('useProducts fetches and stores products', async () => {
  const { result } = renderHook(() => useProducts());

  // Initially loading
  expect(result.current.loading).toBe(true);

  // Fetch completes
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.products).toHaveLength(2);
});
```

---

## Best Practices

✅ **DO:**
- Keep services focused (single responsibility)
- Handle errors explicitly in services
- Use TypeScript for type safety
- Implement caching for frequently accessed data
- Extract component logic into custom hooks
- Test services independently from components

❌ **DON'T:**
- Make direct API calls in components
- Mix business logic with UI logic
- Create overly generic services
- Ignore error scenarios
- Prop drill through multiple levels
- Store sensitive data in local state

---

## Related Documentation

- **[Service Structure](./structure.md)** - Service types and organization
- **[Custom Hooks](./custom-hooks.md)** - Reusable business logic hooks
- **[Error Handling](./error-handling.md)** - Error patterns and recovery
- **[Testing](./testing.md)** - Service testing patterns
- **[API Services](../api/overview.md)** - API layer documentation
- **[Components](../components/overview.md)** - Component layer

---

**Last Updated**: November 2025

