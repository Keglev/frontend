# Service & Hook Testing

## Purpose

Document testing patterns for services, custom hooks, and integration tests.

**Location**: `src/__tests__/services/` and `src/__tests__/hooks/`

---

## Testing Structure

```
src/__tests__/services/
├── apiClient.test.ts
├── ProductService.test.ts
├── auth.test.ts
└── integration/
    └── productWorkflow.integration.test.ts

src/__tests__/hooks/
├── useProducts.test.ts
├── useForm.test.ts
├── useAuth.test.ts
├── useDebounce.test.ts
└── useLocalStorage.test.ts
```

---

## Service Testing Patterns

### Testing API Services

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '@/api/ProductService';
import { apiClient } from '@/services/apiClient';

vi.mock('@/services/apiClient');

describe('ProductService', () => {
  const mockApiClient = vi.mocked(apiClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('fetches and returns products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', quantity: 10 },
        { id: '2', name: 'Product 2', quantity: 20 }
      ];

      mockApiClient.get.mockResolvedValue({
        data: mockProducts
      });

      const result = await ProductService.getProducts();

      expect(result).toEqual(mockProducts);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/products',
        expect.any(Object)
      );
    });

    it('handles validation errors', async () => {
      mockApiClient.get.mockRejectedValue({
        response: {
          status: 400,
          data: { details: { query: 'Invalid query' } }
        }
      });

      await expect(ProductService.getProducts())
        .rejects.toThrow('Invalid');
    });

    it('handles 401 unauthorized', async () => {
      mockApiClient.get.mockRejectedValue({
        response: { status: 401 }
      });

      await expect(ProductService.getProducts())
        .rejects.toThrow('Unauthorized');
    });

    it('handles network errors', async () => {
      mockApiClient.get.mockRejectedValue(
        new Error('Network Error')
      );

      await expect(ProductService.getProducts())
        .rejects.toThrow('Network');
    });
  });

  describe('createProduct', () => {
    it('posts new product data', async () => {
      const newProduct = {
        name: 'New Product',
        quantity: 50,
        category: 'Electronics',
        sku: 'NEW-001',
        price: 99.99,
        description: 'Test'
      };

      const created = { id: 'prod-123', ...newProduct };

      mockApiClient.post.mockResolvedValue({ data: created });

      const result = await ProductService.createProduct(newProduct);

      expect(result).toEqual(created);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/products',
        newProduct
      );
    });

    it('throws ConflictError on 409', async () => {
      mockApiClient.post.mockRejectedValue({
        response: {
          status: 409,
          data: { message: 'SKU already exists' }
        }
      });

      await expect(ProductService.createProduct({} as any))
        .rejects.toThrow('already exists');
    });
  });

  describe('updateProduct', () => {
    it('sends PUT request with updates', async () => {
      const updates = { quantity: 25 };
      const updated = { id: 'prod-123', quantity: 25 };

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
    it('sends DELETE request', async () => {
      mockApiClient.delete.mockResolvedValue({ status: 204 });

      await ProductService.deleteProduct('prod-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/api/products/prod-123'
      );
    });
  });

  describe('searchProducts', () => {
    it('searches with query parameter', async () => {
      const results = [{ id: '1', name: 'Laptop' }];

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
  });
});
```

---

## Custom Hook Testing

### Hook Testing Setup

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProducts } from '@/services/hooks/useProducts';
import { ProductService } from '@/api/ProductService';

vi.mock('@/api/ProductService');

describe('useProducts Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches products on mount', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', quantity: 10 }
    ];

    vi.mocked(ProductService.getProducts).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts());

    // Initial state
    expect(result.current.loading).toBe(true);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toEqual(mockProducts);
  });

  it('sets error state on fetch failure', async () => {
    const error = new Error('Fetch failed');
    vi.mocked(ProductService.getProducts).mockRejectedValue(error);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.products).toEqual([]);
  });

  it('refetches products when calling refetch', async () => {
    const mockProducts = [{ id: '1', name: 'Product 1' }];
    vi.mocked(ProductService.getProducts).mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useProducts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(vi.mocked(ProductService.getProducts)).toHaveBeenCalledTimes(2);
  });
});
```

### Form Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useForm } from '@/services/hooks/useForm';

describe('useForm Hook', () => {
  it('initializes with initial values', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() =>
      useForm(initialValues, async () => {})
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('updates values on change', () => {
    const { result } = renderHook(() =>
      useForm({ name: '', email: '' }, async () => {})
    );

    act(() => {
      result.current.handleChange({
        target: { name: 'name', value: 'John' }
      } as any);
    });

    expect(result.current.values.name).toBe('John');
  });

  it('validates form on submit', async () => {
    const onSubmit = vi.fn();
    const validate = vi.fn().mockReturnValue({
      name: 'Name is required'
    });

    const { result } = renderHook(() =>
      useForm({ name: '' }, onSubmit, validate)
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });

    expect(result.current.errors.name).toBe('Name is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', async () => {
    const onSubmit = vi.fn();
    const validate = vi.fn().mockReturnValue({});

    const { result } = renderHook(() =>
      useForm({ name: 'John' }, onSubmit, validate)
    );

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as any);
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
  });

  it('resets form state', () => {
    const initialValues = { name: 'John', email: 'john@example.com' };
    const { result } = renderHook(() =>
      useForm(initialValues, async () => {})
    );

    act(() => {
      result.current.setValues({ name: 'Jane', email: 'jane@example.com' });
    });

    expect(result.current.values.name).toBe('Jane');

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
  });
});
```

### Debounce Hook Testing

```typescript
import { renderHook } from '@testing-library/react';
import { useDebounce } from '@/services/hooks/useDebounce';
import { vi, beforeEach, afterEach } from 'vitest';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('delays updating value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 300 });

    // Still initial while debouncing
    expect(result.current).toBe('initial');

    // Fast-forward time
    vi.advanceTimersByTime(300);

    // Now updated
    expect(result.current).toBe('updated');
  });

  it('resets timer on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 300 } }
    );

    rerender({ value: 'second', delay: 300 });
    vi.advanceTimersByTime(150);

    rerender({ value: 'third', delay: 300 });
    vi.advanceTimersByTime(150);

    expect(result.current).toBe('first');

    vi.advanceTimersByTime(300);
    expect(result.current).toBe('third');
  });
});
```

---

## Integration Testing

### Service Integration Flow

```typescript
describe('Product Service Integration', () => {
  it('completes full CRUD workflow', async () => {
    // Create
    const newProduct = {
      name: 'Integration Test Product',
      quantity: 100,
      category: 'Test',
      sku: 'INT-001',
      price: 19.99,
      description: 'Test'
    };

    vi.mocked(ProductService.createProduct).mockResolvedValue({
      id: 'prod-123',
      ...newProduct
    });

    const created = await ProductService.createProduct(newProduct);
    expect(created.id).toBeDefined();

    // Read
    vi.mocked(ProductService.getProductById).mockResolvedValue(created);
    const retrieved = await ProductService.getProductById('prod-123');
    expect(retrieved.name).toBe(newProduct.name);

    // Update
    const updates = { quantity: 50 };
    vi.mocked(ProductService.updateProduct).mockResolvedValue({
      ...created,
      ...updates
    });

    const updated = await ProductService.updateProduct('prod-123', updates);
    expect(updated.quantity).toBe(50);

    // Delete
    vi.mocked(ProductService.deleteProduct).mockResolvedValue(undefined);
    await ProductService.deleteProduct('prod-123');

    expect(ProductService.deleteProduct).toHaveBeenCalled();
  });
});
```

---

## Testing Checklist

- [ ] Mock external dependencies (API calls)
- [ ] Test successful scenarios
- [ ] Test error scenarios (4xx, 5xx, network)
- [ ] Test data transformation
- [ ] Test loading/error/success states
- [ ] Test retry logic
- [ ] Test cleanup (timers, subscriptions)
- [ ] Test accessibility for hooks
- [ ] Test TypeScript types

---

## Best Practices

✅ **DO:**
- Mock external API calls
- Test behavior, not implementation
- Use meaningful test descriptions
- Test error scenarios
- Clean up after tests (vi.clearAllMocks)
- Test with realistic data

❌ **DON'T:**
- Make real API calls in tests
- Test implementation details
- Skip error testing
- Use vague test descriptions
- Forget to clean up mocks
- Test multiple concerns in one test

---

## Related Documentation

- **[Overview](./overview.md)** - Services overview
- **[Structure](./structure.md)** - Service organization
- **[Custom Hooks](./custom-hooks.md)** - Hook patterns
- **[Error Handling](./error-handling.md)** - Error patterns
- **[Testing Guide](../tests/overview.md)** - General testing

---

**Last Updated**: November 2025

