# Test Setup & Configuration

## Vitest Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/'
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    },
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

## Global Test Setup

**File**: `src/__tests__/setup.ts`

```typescript
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Start mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Clean up after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});

// Stop server after all tests
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
```

## MSW Configuration

**File**: `src/__tests__/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**File**: `src/__tests__/mocks/handlers.ts`

```typescript
import { rest } from 'msw';
import { mockProducts, mockAuthToken } from './data';

export const handlers = [
  // Auth
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: mockAuthToken,
        userId: 'user-123',
        role: 'admin'
      })
    );
  }),

  // Products
  rest.get('/api/products', (req, res, ctx) => {
    const page = req.url.searchParams.get('page') || '1';
    const limit = req.url.searchParams.get('limit') || '20';
    
    return res(ctx.status(200), ctx.json(mockProducts));
  }),

  rest.post('/api/products', (req, res, ctx) => {
    const newProduct = { id: 'prod-123', ...req.body };
    return res(ctx.status(201), ctx.json(newProduct));
  }),

  rest.get('/api/products/:id', (req, res, ctx) => {
    const product = mockProducts.find(p => p.id === req.params.id);
    return res(
      ctx.status(product ? 200 : 404),
      ctx.json(product || { error: 'Not found' })
    );
  }),

  rest.put('/api/products/:id', (req, res, ctx) => {
    const updated = { ...mockProducts[0], ...req.body };
    return res(ctx.status(200), ctx.json(updated));
  }),

  rest.delete('/api/products/:id', (req, res, ctx) => {
    return res(ctx.status(204));
  })
];
```

**File**: `src/__tests__/mocks/data.ts`

```typescript
export const mockAuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJhZG1pbiJ9.signature';

export const mockProducts = [
  {
    id: 'prod-1',
    name: 'Laptop',
    quantity: 10,
    category: 'Electronics',
    sku: 'LAP-001',
    price: 999.99,
    description: 'High-performance laptop'
  },
  {
    id: 'prod-2',
    name: 'Mouse',
    quantity: 50,
    category: 'Accessories',
    sku: 'MOU-001',
    price: 29.99,
    description: 'Wireless mouse'
  }
];

export const createMockProduct = (overrides = {}) => ({
  id: `prod-${Math.random()}`,
  name: 'Test Product',
  quantity: 10,
  category: 'Test',
  sku: `TEST-${Date.now()}`,
  price: 19.99,
  description: 'Test description',
  ...overrides
});
```

## Package.json Test Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:debug": "vitest --inspect-brk --inspect --single-thread",
    "test:unit": "vitest run --grep Unit",
    "test:component": "vitest run --grep Component",
    "test:integration": "vitest run --grep Integration"
  },
  "devDependencies": {
    "vitest": "^latest",
    "@testing-library/react": "^14",
    "@testing-library/jest-dom": "^6",
    "@testing-library/user-event": "^14",
    "jsdom": "^latest",
    "msw": "^latest",
    "@vitest/ui": "^latest",
    "@vitest/coverage-v8": "^latest"
  }
}
```

## Testing Utilities

**File**: `src/__tests__/utils/testHelpers.ts`

```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      user: (state = preloadedState.user) => state,
      products: (state = preloadedState.products) => state,
      ui: (state = preloadedState.ui) => state
    }
  });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
}

export function renderWithRedux(
  element: ReactElement,
  { preloadedState, store = createMockStore(preloadedState), ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactElement }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { ...render(element, { wrapper: Wrapper, ...renderOptions }), store };
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function waitForAsync() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export const createMockFormData = (overrides = {}) => ({
  name: 'Test Product',
  quantity: 10,
  category: 'Test',
  sku: 'TEST-001',
  price: 19.99,
  description: 'Test',
  ...overrides
});
```

## Common Test Utilities

```typescript
// Test factories
export const factories = {
  createUser: (overrides?) => ({ id: '1', name: 'John', ...overrides }),
  createProduct: (overrides?) => ({ id: '1', name: 'Test', ...overrides }),
  createError: (status = 500) => ({ response: { status } })
};

// Assertion helpers
export const expectToBeCalledWithData = (
  mockFn: any,
  expectedData: any
) => {
  expect(mockFn).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining(expectedData)
  );
};

// Component testing helpers
export const findByRole = (container: any, role: string, name?: string) => {
  const roleElement = container.querySelector(`[role="${role}"]`);
  if (name && !roleElement?.textContent.includes(name)) return null;
  return roleElement;
};
```

---

## Best Practices for Setup

✅ **DO:**
- Use MSW for HTTP mocking
- Clean up after each test
- Mock environment variables
- Reset mocks before each test
- Use test factories for data
- Implement global error handler
- Add accessibility matchers

❌ **DON'T:**
- Make real API calls
- Leave tests with side effects
- Skip cleanup
- Use hardcoded test data
- Ignore error handling
- Skip setup configuration
- Test multiple concerns

---

## Related Documentation

- **[Overview](./overview.md)** - Testing overview
- **[Structure](./structure.md)** - Test organization
- **[Patterns](./patterns.md)** - Testing patterns
- **[Coverage](./coverage.md)** - Coverage goals
- **[Running Tests](./running-tests.md)** - Commands

---

**Last Updated**: November 2025

