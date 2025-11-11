# Testing Pages & Routes

## Test Structure

Page tests follow a consistent organization pattern:

```
__tests__/
└── pages/
    ├── HomePage.test.tsx
    ├── LoginPage.test.tsx
    ├── AdminDashboard.test.tsx
    ├── UserDashboard.test.tsx
    ├── AddProductPage.test.tsx
    ├── DeleteProductPage.test.tsx
    ├── SearchProductPage.test.tsx
    ├── ListStockPage.test.tsx
    ├── ChangeProductDetailsPage.test.tsx
    └── setup.ts
```

---

## Test Setup

### Helper Functions

```typescript
// __tests__/pages/setup.ts

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import configureStore from 'redux-mock-store';
import i18n from '../../i18n';

const mockStore = configureStore([]);

/**
 * Render component with all necessary providers
 */
export const renderWithProviders = (
  component,
  { initialState = {}, ...renderOptions } = {}
) => {
  const store = mockStore(initialState);
  
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </BrowserRouter>
    </Provider>
  );
  
  return render(component, { wrapper: Wrapper, ...renderOptions });
};
```

---

## Testing Protected Pages

### Test Pattern: Authentication Check

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './setup';
import AdminDashboard from '../../pages/AdminDashboard';

describe('AdminDashboard - Authentication', () => {
  it('redirects unauthenticated users to login', () => {
    renderWithProviders(<AdminDashboard />, {
      initialState: {
        auth: { isAuthenticated: false, user: null }
      }
    });
    
    // Should navigate to /login (indicated by component not rendering)
    expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
  });
  
  it('redirects non-admin users to unauthorized', () => {
    renderWithProviders(<AdminDashboard />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }  // Not admin!
        }
      }
    });
    
    expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
  });
  
  it('renders for authenticated admin users', () => {
    renderWithProviders(<AdminDashboard />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'admin' }
        }
      }
    });
    
    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
  });
});
```

---

## Testing Page Data Loading

### Test Pattern: Data Fetching

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import * as ProductService from '../../api/ProductService';

describe('UserDashboard - Data Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('displays loading state while fetching data', () => {
    vi.spyOn(ProductService, 'getProducts').mockImplementation(
      () => new Promise(() => {})  // Never resolves
    );
    
    renderWithProviders(<UserDashboard />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        }
      }
    });
    
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();
  });
  
  it('displays products after successful fetch', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 }
    ];
    
    vi.spyOn(ProductService, 'getProducts').mockResolvedValue(
      mockProducts
    );
    
    renderWithProviders(<UserDashboard />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        },
        products: { items: [] }
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
  
  it('displays error message on fetch failure', async () => {
    vi.spyOn(ProductService, 'getProducts').mockRejectedValue(
      new Error('Network error')
    );
    
    renderWithProviders(<UserDashboard />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        }
      }
    });
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Testing Form Pages

### Test Pattern: AddProductPage

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as ProductService from '../../api/ProductService';

describe('AddProductPage', () => {
  it('renders form with all fields', () => {
    renderWithProviders(<AddProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'admin' }
        }
      }
    });
    
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });
  
  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<AddProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'admin' }
        }
      }
    });
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/price is required/i)).toBeInTheDocument();
    });
  });
  
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockCreateProduct = vi.spyOn(ProductService, 'createProduct')
      .mockResolvedValue({ id: 1, name: 'New Product' });
    
    renderWithProviders(<AddProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'admin' }
        }
      }
    });
    
    // Fill form
    await user.type(screen.getByLabelText(/product name/i), 'Hammer');
    await user.type(screen.getByLabelText(/price/i), '29.99');
    await user.type(screen.getByLabelText(/quantity/i), '100');
    
    // Submit
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: 'Hammer',
        price: 29.99,
        quantity: 100
      });
    });
  });
  
  it('shows success message on successful submission', async () => {
    const user = userEvent.setup();
    vi.spyOn(ProductService, 'createProduct')
      .mockResolvedValue({ id: 1, name: 'New Product' });
    
    renderWithProviders(<AddProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'admin' }
        }
      }
    });
    
    await user.type(screen.getByLabelText(/product name/i), 'Hammer');
    await user.type(screen.getByLabelText(/price/i), '29.99');
    await user.type(screen.getByLabelText(/quantity/i), '100');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/product created/i)).toBeInTheDocument();
    });
  });
  
  it('shows error message on submission failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(ProductService, 'createProduct')
      .mockRejectedValue(new Error('Server error'));
    
    renderWithProviders(<AddProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'admin' }
        }
      }
    });
    
    await user.type(screen.getByLabelText(/product name/i), 'Hammer');
    await user.type(screen.getByLabelText(/price/i), '29.99');
    await user.type(screen.getByLabelText(/quantity/i), '100');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/error.*server/i)).toBeInTheDocument();
    });
  });
});
```

---

## Testing Search & Filter Pages

### Test Pattern: SearchProductPage

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SearchProductPage', () => {
  it('displays search input', () => {
    renderWithProviders(<SearchProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        }
      }
    });
    
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
  
  it('debounces search requests', async () => {
    const user = userEvent.setup({ delay: null });
    const mockSearch = vi.spyOn(ProductService, 'searchProducts')
      .mockResolvedValue([]);
    
    renderWithProviders(<SearchProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        }
      }
    });
    
    const input = screen.getByPlaceholderText(/search/i);
    
    // Type multiple characters quickly
    await user.type(input, 'hammer', { delay: 50 });
    
    // Search should not be called yet (debounced)
    expect(mockSearch).not.toHaveBeenCalled();
    
    // Wait for debounce delay
    await waitFor(
      () => {
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockSearch).toHaveBeenCalledWith('hammer', expect.any(Object));
      },
      { timeout: 500 }
    );
  });
  
  it('displays search results', async () => {
    const mockResults = [
      { id: 1, name: 'Hammer' },
      { id: 2, name: 'Hammock' }
    ];
    
    vi.spyOn(ProductService, 'searchProducts')
      .mockResolvedValue(mockResults);
    
    const user = userEvent.setup();
    renderWithProviders(<SearchProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        }
      }
    });
    
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'hammer');
    
    await waitFor(() => {
      expect(screen.getByText('Hammer')).toBeInTheDocument();
      expect(screen.getByText('Hammock')).toBeInTheDocument();
    });
  });
  
  it('displays no results message when search returns empty', async () => {
    vi.spyOn(ProductService, 'searchProducts')
      .mockResolvedValue([]);
    
    const user = userEvent.setup();
    renderWithProviders(<SearchProductPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        }
      }
    });
    
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'nonexistent-product');
    
    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });
});
```

---

## Testing Pagination

### Test Pattern: ListStockPage

```typescript
describe('ListStockPage - Pagination', () => {
  it('displays correct number of items per page', async () => {
    const mockProducts = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`
    }));
    
    vi.spyOn(ProductService, 'getProducts')
      .mockResolvedValue(mockProducts);
    
    renderWithProviders(<ListStockPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        },
        products: { items: mockProducts }
      }
    });
    
    await waitFor(() => {
      // Should display 10 items (default page size)
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 10')).toBeInTheDocument();
      expect(screen.queryByText('Product 11')).not.toBeInTheDocument();
    });
  });
  
  it('navigates to next page', async () => {
    const user = userEvent.setup();
    const mockProducts = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`
    }));
    
    vi.spyOn(ProductService, 'getProducts')
      .mockResolvedValue(mockProducts);
    
    renderWithProviders(<ListStockPage />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role: 'user' }
        },
        products: { items: mockProducts }
      }
    });
    
    // Click next button
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Product 11')).toBeInTheDocument();
      expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    });
  });
});
```

---

## Testing Navigation

### Test Pattern: LoginPage Redirect

```typescript
describe('LoginPage - Navigation', () => {
  it('redirects to admin dashboard on admin login', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.fn().mockResolvedValue({
      token: 'token123',
      role: 'admin'
    });
    
    renderWithProviders(<LoginPage />, {
      initialState: {
        auth: { isAuthenticated: false }
      }
    });
    
    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      // Component would dispatch action and navigate
      // Verify dispatch was called with correct action
      expect(store.getActions()).toContainEqual(
        expect.objectContaining({ type: 'SET_USER' })
      );
    });
  });
});
```

---

## Testing with Different User Roles

### Parametrized Test

```typescript
describe.each([
  { role: 'admin', expected: true },
  { role: 'user', expected: false }
])('AdminDashboard - User role: $role', ({ role, expected }) => {
  it(`should ${expected ? 'render' : 'not render'} for ${role}`, () => {
    renderWithProviders(<AdminDashboard />, {
      initialState: {
        auth: {
          isAuthenticated: true,
          user: { id: '123', role }
        }
      }
    });
    
    const dashboard = screen.queryByText(/admin dashboard/i);
    if (expected) {
      expect(dashboard).toBeInTheDocument();
    } else {
      expect(dashboard).not.toBeInTheDocument();
    }
  });
});
```

---

## Testing Error Boundaries

### Test Pattern: Error Handling

```typescript
describe('Pages - Error Handling', () => {
  it('catches rendering errors', () => {
    const BrokenComponent = () => {
      throw new Error('Render error');
    };
    
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderWithProviders(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );
    }).not.toThrow();
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

---

## Best Practices

### ✅ DO:

```typescript
// Test user-visible behavior
expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();

// Use setup helpers for consistency
renderWithProviders(<Component />, { initialState: {} });

// Mock external dependencies
vi.spyOn(ProductService, 'getProducts').mockResolvedValue([]);

// Test both success and error scenarios
it('shows error on failure', async () => { /* ... */ });
it('shows success on success', async () => { /* ... */ });

// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('result')).toBeInTheDocument();
});
```

### ❌ DON'T:

```typescript
// Don't test implementation details
expect(component.state.products).toEqual([]);

// Don't rely on test IDs alone
screen.getByTestId('dashboard');  // Instead: getByRole or getByText

// Don't forget to clean up mocks
// Should clean up in beforeEach or afterEach

// Don't test Redux directly
// Test what users see, not Redux state

// Don't hardcode wait times
// Use waitFor with proper timeout
```

---

## Related Documentation

- [Overview](./overview.md) - Page structure and routing
- [Page Components](./components.md) - Individual page details
- [Page Lifecycle](./lifecycle.md) - Component patterns
- [Authentication](./authentication.md) - Protected routes
- [Performance](./performance.md) - Optimization

---

**Last Updated**: November 2025

