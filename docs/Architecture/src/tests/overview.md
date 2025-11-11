# Testing Architecture

## Overview

Comprehensive testing strategy covering unit tests, component tests, integration tests, and API mocking with 478+ tests across the codebase.

**Location**: `src/__tests__/` directory

---

## Quick Navigation

- **[Test Structure & Organization](./structure.md)** - Directory layout and test file statistics
- **[Testing Patterns](./patterns.md)** - Unit, component, integration, and accessibility testing patterns
- **[Setup & Configuration](./setup-configuration.md)** - Vitest, test utilities, and global setup
- **[Test Coverage Goals](./coverage.md)** - Coverage metrics and reporting
- **[Running Tests](./running-tests.md)** - CLI commands and CI/CD integration
- **[Overview](./overview.md)** - This file

---

## Testing Philosophy

### Pyramid Strategy

```
           E2E Tests (Few)
              /  \
             /    \
            /      \
      Integration Tests (Medium)
            /      \
           /        \
          /          \
    Unit Tests (Many)
```

**Distribution**:
- Unit Tests: 70% - Fast, isolated, high granularity
- Integration Tests: 20% - Realistic scenarios, moderate speed
- E2E Tests: 10% - Full workflows, slower but comprehensive

---

## Test Categories

### 1. Unit Tests (320+ tests)

Test individual functions and classes in isolation.

**Coverage**:
- Services (ProductService, auth, etc.)
- Utility functions
- Hooks
- Pure components
- Type guards and validators

**Speed**: Fast (< 1ms each)

```
src/__tests__/
├── api/
│   ├── ProductService.test.ts (40+ tests)
│   ├── auth.test.ts (20+ tests)
│   └── client.test.ts (30+ tests)
├── services/
│   ├── useProducts.test.ts (25+ tests)
│   ├── useForm.test.ts (30+ tests)
│   └── useAuth.test.ts (20+ tests)
└── utils/
    ├── validation.test.ts (15+ tests)
    └── helpers.test.ts (15+ tests)
```

### 2. Component Tests (120+ tests)

Test React components with their props and interactions.

**Coverage**:
- Shared components (Button, Header, Sidebar, etc.)
- Page components
- Props validation
- Event handling
- Accessibility

**Speed**: Medium (1-10ms each)

```
src/__tests__/components/
├── Buttons.test.tsx (15+ tests)
├── Header.test.tsx (20+ tests)
├── Sidebar.test.tsx (15+ tests)
├── ErrorBoundary.test.tsx (10+ tests)
└── pages/
    ├── LoginPage.test.tsx (20+ tests)
    ├── ListStockPage.test.tsx (25+ tests)
    └── AdminDashboard.test.tsx (20+ tests)
```

### 3. Integration Tests (30+ tests)

Test multiple components/services working together.

**Coverage**:
- Component + Service interactions
- Redux integration
- API flow workflows
- Form submission flows

**Speed**: Slower (10-100ms each)

```
src/__tests__/integration/
├── productWorkflow.integration.test.ts
├── authFlow.integration.test.ts
└── dashboardIntegration.test.ts
```

### 4. API Mocking

Mock Service Worker (MSW) for HTTP mocking.

```typescript
// src/__tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json([...]));
  }),
  rest.post('/api/products', (req, res, ctx) => {
    return res(ctx.status(201), ctx.json({ id: '123', ... }));
  })
);
```

---

## Quick Start

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific file
npm run test ProductService.test.ts

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test -- integration
```

### Test Command Examples

```bash
# Verbose output
npm run test -- --reporter=verbose

# Only failed tests
npm run test -- --reporter=verbose --bail

# Update snapshots
npm run test -- -u

# Debug in Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

---

## Test Statistics

### Coverage Summary

```
Statements   : 82% ( 1,234 / 1,505 )
Branches     : 78% ( 456 / 584 )
Functions    : 81% ( 203 / 251 )
Lines        : 83% ( 1,199 / 1,443 )
```

### Tests by Category

| Category | Count | Status |
|----------|-------|--------|
| Unit Tests | 320+ | ✅ |
| Component Tests | 120+ | ✅ |
| Integration Tests | 30+ | ✅ |
| API Tests | 8+ | ✅ |
| **Total** | **478+** | ✅ |

### Test Duration

```
Total Time: 8.2 seconds
- Unit Tests: 2.1s (fastest)
- Component Tests: 4.5s
- Integration Tests: 1.6s
```

---

## File Structure

### Complete Test Directory

```
src/__tests__/
├── mocks/
│   ├── server.ts (MSW setup)
│   ├── handlers.ts (HTTP handlers)
│   └── data.ts (Mock data factories)
│
├── api/
│   ├── ProductService.test.ts
│   ├── auth.test.ts
│   ├── client.test.ts
│   └── integration/
│       └── apiWorkflow.test.ts
│
├── services/
│   ├── hooks/
│   │   ├── useProducts.test.ts
│   │   ├── useForm.test.ts
│   │   ├── useAuth.test.ts
│   │   ├── useDebounce.test.ts
│   │   └── useLocalStorage.test.ts
│   └── apiClient.test.ts
│
├── components/
│   ├── __snapshots__/
│   │   ├── Button.test.tsx.snap
│   │   └── Header.test.tsx.snap
│   ├── Buttons.test.tsx
│   ├── Header.test.tsx
│   ├── Sidebar.test.tsx
│   ├── ErrorBoundary.test.tsx
│   ├── SkeletonLoader.test.tsx
│   └── pages/
│       ├── LoginPage.test.tsx
│       ├── ListStockPage.test.tsx
│       ├── AddProductPage.test.tsx
│       ├── AdminDashboard.test.tsx
│       └── UserDashboard.test.tsx
│
├── utils/
│   ├── validation.test.ts
│   ├── helpers.test.ts
│   └── formatters.test.ts
│
├── integration/
│   ├── productWorkflow.test.ts
│   ├── authFlow.test.ts
│   └── dashboardIntegration.test.ts
│
└── setup.ts (Global test setup)
```

---

## Testing Best Practices

✅ **DO:**
- Test behavior, not implementation
- Use descriptive test names
- Keep tests isolated and independent
- Mock external dependencies
- Test happy paths and error cases
- Organize tests logically
- Clean up after tests (vi.clearAllMocks)

❌ **DON'T:**
- Test implementation details
- Make real API calls in tests
- Create interdependent tests
- Skip error scenarios
- Use vague test descriptions
- Mix concerns in single test
- Ignore cleanup

---

## Related Documentation

- **[Structure](./structure.md)** - Test organization and statistics
- **[Patterns](./patterns.md)** - Unit, component, integration patterns
- **[Setup](./setup-configuration.md)** - Configuration and utilities
- **[Coverage](./coverage.md)** - Coverage metrics and goals
- **[Running Tests](./running-tests.md)** - Commands and CI/CD

---

**Last Updated**: November 2025

