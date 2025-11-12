# Custom Hooks for Business Logic

## Purpose

Reusable React hooks that encapsulate component logic, state management, and business operations.

**Location**: `src/services/hooks/` and throughout `src/services/`

---

## Common Custom Hooks

### 1. useProducts

Fetch and manage product list state

```typescript
export const useProducts = (options?: {
  page?: number;
  limit?: number;
  sortBy?: string;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ProductService.getProducts(options);
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, error, total, refetch };
};

// Usage
const { products, loading, error, refetch } = useProducts({ page: 1 });
```

### 2. useAuth

Authentication state and operations

```typescript
export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await auth.login(email, password);
      localStorage.setItem('authToken', result.token);
      dispatch({
        type: 'SET_USER',
        payload: {
          userId: result.userId,
          role: result.role
        }
      });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_AUTH_ERROR', payload: error.message });
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  }, [dispatch]);

  return { user, isAuthenticated, login, logout };
};

// Usage
const { user, login, logout } = useAuth();
const handleLogin = async (email, password) => {
  await login(email, password);
  navigate('/dashboard');
};
```

### 3. useDebounce

Debounce values for search/filter optimization

```typescript
export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage in search
const [searchQuery, setSearchQuery] = useState('');
const debouncedQuery = useDebounce(searchQuery, 300);

useEffect(() => {
  if (debouncedQuery) {
    ProductService.searchProducts(debouncedQuery).then(setResults);
  }
}, [debouncedQuery]);
```

### 4. useLocalStorage

Persist state to localStorage

```typescript
export const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
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

  return [storedValue, setValue];
};

// Usage
const [userPreferences, setUserPreferences] = useLocalStorage(
  'userPreferences',
  { theme: 'light' }
);
```

### 5. useForm

Form state management with validation

```typescript
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>,
  validate?: (values: T) => Partial<T>
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: error.message } as any);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors
  };
};

// Usage
const form = useForm(
  { name: '', email: '', quantity: 0 },
  async (values) => {
    await ProductService.createProduct(values);
  },
  (values) => {
    const errors: any = {};
    if (!values.name) errors.name = 'Name required';
    if (!values.email) errors.email = 'Email required';
    return errors;
  }
);
```

### 6. useAsync

Generic async operations hook

```typescript
export const useAsync = <T, E = string>(
  asyncFunction: () => Promise<T>,
  immediate: boolean = true
) => {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error as E);
      setStatus('error');
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { status, data, error, execute };
};

// Usage
const { status, data: product, error, execute: reload } = useAsync(
  () => ProductService.getProductById('123'),
  true
);
```

### 7. usePagination

Manage pagination state

```typescript
export const usePagination = (initialPage: number = 1, pageSize: number = 20) => {
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages));
    setPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(page + 1), [page, goToPage]);
  const prevPage = useCallback(() => goToPage(page - 1), [page, goToPage]);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    setTotal
  };
};

// Usage
const pagination = usePagination(1, 20);
useEffect(() => {
  ProductService.getProducts({
    page: pagination.page,
    limit: pagination.pageSize
  }).then(products => {
    setProducts(products);
    pagination.setTotal(1000);  // From API response
  });
}, [pagination.page]);
```

---

## Hook Composition Patterns

### Combining Multiple Hooks

```typescript
// useProductList - combines useProducts, usePagination, useDebounce
export const useProductList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const pagination = usePagination();

  const { products, loading, refetch } = useProducts({
    page: pagination.page,
    limit: pagination.pageSize
  });

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return products;
    return products.filter(p =>
      p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [products, debouncedQuery]);

  return {
    products: filteredProducts,
    loading,
    pagination,
    searchQuery,
    setSearchQuery,
    refetch
  };
};

// In component
const ListStockPage = () => {
  const { products, loading, pagination, searchQuery, setSearchQuery } = useProductList();

  return (
    <>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      <ProductTable products={products} />
      <Pagination {...pagination} />
    </>
  );
};
```

---

## Hook Rules & Best Practices

✅ **DO:**
- Use hooks to extract component logic
- Name hooks with `use` prefix
- Keep hooks focused and single-purpose
- Use hooks from top level (not conditionally)
- Document hook parameters and returns
- Memoize callbacks with useCallback

❌ **DON'T:**
- Call hooks conditionally
- Call hooks from non-React functions
- Break the rules of hooks
- Create hooks with multiple responsibilities
- Ignore dependency arrays
- Create unnecessarily complex hooks

---

## Related Documentation

- **[Overview](./overview.md)** - Services overview
- **[Structure](./structure.md)** - Service organization
- **[Error Handling](./error-handling.md)** - Error patterns
- **[Testing](./testing.md)** - Hook testing patterns

---

**Last Updated**: November 2025

