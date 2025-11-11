# Service Error Handling

## Purpose

Document error patterns, recovery strategies, and service-level error management.

**Location**: Service layer error handling strategies

---

## Error Hierarchy

### Base Error Classes

```typescript
// Base application error
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// HTTP/API specific errors
class ApiError extends AppError {
  constructor(message: string, statusCode: number, context?: any) {
    super(message, 'API_ERROR', statusCode, context);
    this.name = 'ApiError';
  }
}
```

### Specific Error Types

```typescript
// 400 - Validation errors
class ValidationError extends AppError {
  constructor(message: string, public details: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

// 401 - Authentication errors
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

// 403 - Authorization errors
class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

// 404 - Not found errors
class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

// 409 - Conflict errors
class ConflictError extends AppError {
  constructor(message: string, public conflictInfo?: any) {
    super(message, 'CONFLICT', 409, conflictInfo);
    this.name = 'ConflictError';
  }
}

// Network errors
class NetworkError extends AppError {
  constructor(message = 'Network request failed') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// Timeout errors
class TimeoutError extends AppError {
  constructor(message = 'Request timeout') {
    super(message, 'TIMEOUT', undefined);
    this.name = 'TimeoutError';
  }
}

// Unknown server errors
class ServerError extends AppError {
  constructor(message = 'Server error occurred') {
    super(message, 'SERVER_ERROR', 500);
    this.name = 'ServerError';
  }
}
```

---

## Error Handling in Services

### Product Service Error Handling

```typescript
export class ProductService {
  static async createProduct(data: ProductInput): Promise<Product> {
    try {
      const response = await apiClient.post('/api/products', data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getProducts(options?: QueryOptions): Promise<Product[]> {
    try {
      const response = await apiClient.get('/api/products', { params: options });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private static handleError(error: any): never {
    if (!error.response) {
      // Network error
      throw new NetworkError(
        'Failed to connect to server. Please check your internet connection.'
      );
    }

    const { status, data } = error.response;

    switch (status) {
      case 400:
        throw new ValidationError(
          'Invalid product data',
          data.details || {}
        );

      case 401:
        // Clear auth state
        localStorage.removeItem('authToken');
        throw new UnauthorizedError('Please login again');

      case 403:
        throw new ForbiddenError('You do not have permission for this action');

      case 404:
        throw new NotFoundError('Product not found');

      case 409:
        throw new ConflictError(
          `Product with SKU "${data.sku}" already exists`,
          { existingProduct: data.existing }
        );

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(
          `Server error (${status}). Please try again later.`
        );

      default:
        throw new ApiError(
          data.message || 'An error occurred',
          status,
          data
        );
    }
  }
}
```

### Auth Service Error Handling

```typescript
export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      const { token } = response.data;
      
      // Validate token format
      if (!token || !token.includes('.')) {
        throw new ServerError('Invalid token received from server');
      }

      // Decode and validate
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        throw new ServerError('Token already expired');
      }

      return {
        token,
        userId: payload.sub,
        role: payload.role
      };
    } catch (error) {
      if (error instanceof AppError) throw error;

      if (!error.response) {
        throw new NetworkError(
          'Cannot reach authentication server'
        );
      }

      if (error.response.status === 401) {
        throw new UnauthorizedError('Invalid email or password');
      }

      throw new ServerError(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
};
```

---

## Error Handling in Components (via Hooks)

### Hook Error Handling

```typescript
export const useProducts = (options?: QueryOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ProductService.getProducts(options);
      setProducts(data);
    } catch (err) {
      setError(err as AppError);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const retry = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, retry };
};
```

### Component Error Handling

```typescript
const ListStockPage = () => {
  const { products, loading, error, retry } = useProducts();

  if (loading) return <SkeletonLoader />;

  if (error) {
    if (error instanceof ValidationError) {
      return <ValidationErrorUI details={error.details} />;
    } else if (error instanceof UnauthorizedError) {
      return <UnauthorizedUI onRetry={() => navigate('/login')} />;
    } else if (error instanceof NetworkError) {
      return (
        <ErrorUI
          title="Connection Error"
          message={error.message}
          onRetry={retry}
        />
      );
    } else {
      return (
        <ErrorUI
          title="Error"
          message={error.message}
          onRetry={retry}
        />
      );
    }
  }

  return <ProductTable products={products} />;
};
```

---

## Error Recovery Strategies

### Automatic Retry

```typescript
const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors
      if (error instanceof ValidationError ||
          error instanceof UnauthorizedError ||
          error instanceof ForbiddenError) {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

// Usage
const products = await retryWithBackoff(
  () => ProductService.getProducts(),
  3,
  1000
);
```

### Error Boundary Pattern

```typescript
export const ErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<AppError | null>(null);

  if (error) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => {
          setError(null);
          window.location.reload();
        }}>
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <React.Suspense
      fallback={<div>Loading...</div>}
      onError={(error) => setError(error as AppError)}
    >
      {children}
    </React.Suspense>
  );
};
```

---

## Global Error Handler

### Request Interceptor Error Handling

```typescript
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle specific status codes globally
    if (error.response?.status === 401) {
      // Clear auth and redirect
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Show permission error
      showNotification('You do not have permission for this action', 'error');
    } else if (!error.response) {
      // Network error
      showNotification('Network error. Please check your connection.', 'error');
    }

    return Promise.reject(error);
  }
);
```

### Error Logging/Monitoring

```typescript
// Log errors to monitoring service
const logError = (error: AppError) => {
  console.error(error);

  // Send to monitoring service (Sentry, etc.)
  if (import.meta.env.PROD) {
    sendToMonitoring({
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
};

// Use in catch blocks
catch (error) {
  logError(error as AppError);
  // Handle error in UI
}
```

---

## Testing Error Scenarios

```typescript
describe('Error Handling', () => {
  it('throws ValidationError on 400 response', async () => {
    vi.mocked(apiClient.post).mockRejectedValue({
      response: {
        status: 400,
        data: { details: { name: 'Name required' } }
      }
    });

    await expect(
      ProductService.createProduct({} as any)
    ).rejects.toThrow(ValidationError);
  });

  it('throws UnauthorizedError on 401 response', async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: { status: 401 }
    });

    await expect(
      ProductService.getProducts()
    ).rejects.toThrow(UnauthorizedError);
  });

  it('clears auth token on 401', async () => {
    localStorage.setItem('authToken', 'fake-token');

    vi.mocked(apiClient.post).mockRejectedValue({
      response: { status: 401 }
    });

    try {
      await ProductService.createProduct({} as any);
    } catch (error) {
      expect(localStorage.getItem('authToken')).toBeNull();
    }
  });
});
```

---

## Best Practices

✅ **DO:**
- Create specific error types for different scenarios
- Log errors appropriately
- Provide user-friendly error messages
- Implement retry logic for transient errors
- Clear sensitive data on auth errors
- Handle errors at appropriate layers

❌ **DON'T:**
- Expose technical error details to users
- Log sensitive information (tokens, passwords)
- Ignore errors silently
- Retry indefinitely
- Leave users without error feedback
- Mix error handling with business logic

---

## Related Documentation

- **[Overview](./overview.md)** - Services overview
- **[Structure](./structure.md)** - Service organization
- **[Custom Hooks](./custom-hooks.md)** - Hook patterns
- **[Testing](./testing.md)** - Error testing patterns

---

**Last Updated**: November 2025

