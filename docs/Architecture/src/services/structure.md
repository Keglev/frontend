# Service Structure & Organization

## Purpose

Document service types, patterns, and organization strategies.

**Location**: `src/services/` and `src/api/`

---

## Directory Structure

```
src/
├── api/                    # API communication layer
│   ├── auth.ts            # Authentication service
│   ├── ProductService.ts  # Product operations
│   └── (other domain services)
│
├── services/              # Business logic and utilities
│   ├── apiClient.ts       # HTTP client configuration
│   ├── hooks/             # Custom React hooks
│   │   ├── useProducts.ts
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   │
│   └── (other utilities)
```

---

## Service Layer Types

### 1. HTTP Client Service

**File**: `src/services/apiClient.ts`

**Purpose**: Centralized HTTP client with interceptors

**Responsibilities**:
- Configure base URL and headers
- Inject authentication tokens
- Handle response errors
- Standardize error responses
- Manage request/response transformation

**Interface**:
```typescript
export interface HttpClient {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
```

---

### 2. API Services

**Files**: `src/api/*.ts`

**Examples**: `ProductService.ts`, `auth.ts`

**Purpose**: Domain-specific API operations

**Characteristics**:
- Static methods or class instances
- Wrap HTTP client calls
- Provide business-level abstractions
- Handle domain-specific errors
- Validate and transform data

**Example Structure**:
```typescript
export class ProductService {
  private static baseUrl = '/api/products';

  static async getProducts(options?: QueryOptions): Promise<Product[]> {
    const response = await apiClient.get(this.baseUrl, { params: options });
    return response.data;
  }

  static async createProduct(data: ProductInput): Promise<Product> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }
  
  // ... other methods
}
```

---

### 3. Custom Hooks

**Location**: `src/services/hooks/`

**Purpose**: Encapsulate component logic and state management

**Types**:

#### Data Fetching Hooks

```typescript
// useProducts.ts
export const useProducts = (options?: QueryOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProductService.getProducts(options);
      setProducts(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
};
```

#### Form Management Hooks

```typescript
// useForm.ts
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors
  };
};
```

#### Utility Hooks

```typescript
// useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// useLocalStorage.ts
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};
```

#### Auth Hooks

```typescript
// useAuth.ts
export const useAuth = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const login = useCallback(async (email: string, password: string) => {
    const result = await auth.login(email, password);
    dispatch({
      type: 'SET_USER',
      payload: {
        user: { id: result.userId, role: result.role },
        token: result.token
      }
    });
    return result;
  }, [dispatch]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout
  };
};
```

---

## Service Composition

### Combining Services in Hooks

```typescript
// useProductForm - combines ProductService and form logic
export const useProductForm = (productId?: string) => {
  const form = useForm<ProductInput>(initialValues, async (data) => {
    if (productId) {
      await ProductService.updateProduct(productId, data);
    } else {
      await ProductService.createProduct(data);
    }
  });

  useEffect(() => {
    if (productId) {
      ProductService.getProductById(productId).then(product => {
        form.setValues(product);
      });
    }
  }, [productId, form]);

  return form;
};
```

### Service Dependencies

```
ProductService
├── depends on: apiClient
└── depends on: Product type definitions

useProducts (hook)
├── depends on: ProductService
├── depends on: useState, useEffect, useCallback
└── uses: Redux (via useDispatch)

AddProductPage (component)
├── depends on: useProductForm (hook)
├── depends on: useAuth (hook)
└── depends on: Button, Form components
```

---

## Error Handling Architecture

### Error Hierarchy

```typescript
// Base error class
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Specific error types
class ValidationError extends ApiError {
  constructor(message: string, public details: any) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends ApiError {
  constructor(message: string, public context?: any) {
    super(message, 409, context);
    this.name = 'ConflictError';
  }
}
```

### Error Handling in Services

```typescript
static async updateProduct(id: string, data: Partial<Product>) {
  try {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      throw new ValidationError('Invalid product data', error.response.data.details);
    } else if (error.response?.status === 401) {
      throw new UnauthorizedError();
    } else if (error.response?.status === 404) {
      throw new NotFoundError('Product not found');
    } else if (error.response?.status === 409) {
      throw new ConflictError('Product already exists', error.response.data);
    }
    throw error;
  }
}
```

---

## Configuration & Setup

### API Client Configuration

```typescript
// src/services/apiClient.ts
import axios, { AxiosInstance } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

---

## Best Practices

✅ **DO:**
- Create focused, single-purpose services
- Use TypeScript for type safety
- Handle errors at service level
- Export service instances consistently
- Document service interfaces
- Test services independently

❌ **DON'T:**
- Make direct API calls in components
- Create overly generic services
- Mix concerns in a single service
- Ignore error handling
- Create services without clear purpose
- Skip TypeScript typing

---

## Related Documentation

- **[Overview](./overview.md)** - Services architecture overview
- **[Custom Hooks](./custom-hooks.md)** - Detailed hook patterns
- **[Error Handling](./error-handling.md)** - Error patterns and strategies
- **[Testing](./testing.md)** - Service testing
- **[API Services](../api/overview.md)** - API layer services

---

**Last Updated**: November 2025

