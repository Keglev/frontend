"""# Testing Guide

## Overview

This directory contains all tests for the StockEase frontend application. It follows an enterprise-grade testing structure organized by feature/domain.

## Directory Structure

```
src/__tests__/
├── components/          # Component unit tests
├── pages/              # Page component tests
├── services/           # Business logic service tests
├── api/                # API service tests
├── logic/              # Logic/utility function tests
├── types/              # Type validation tests
├── utils/              # Test utilities and helpers
│   ├── test-render.tsx    # Custom render function with providers
│   ├── test-helpers.ts    # Common testing helper functions
│   └── mock-factories.ts  # Factory functions for test data
├── fixtures/           # Test data and constants
│   └── data.ts            # Mock data fixtures
├── mocks/              # Mock handlers and implementations
│   └── api-handlers.ts    # API mock handlers
└── setup.ts            # Test environment setup
```

## Key Files

### Configuration Files

- **vitest.config.ts**: Vitest configuration with coverage settings
- **src/__tests__/setup.ts**: Test environment initialization

### Test Utilities

- **test-render.tsx**: Custom render function that wraps components with all necessary providers (Router, Redux, i18n)
- **test-helpers.ts**: Helper functions for common testing patterns
- **mock-factories.ts**: Factory functions for creating mock data
- **data.ts**: Reusable test fixtures and mock responses

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode
```bash
npm run test:ui
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- src/__tests__/components/Header.test.tsx
```

### Run tests matching a pattern
```bash
npm test -- --grep "Header"
```

### Watch mode
```bash
npm test -- --watch
```

## Test Structure

### Naming Conventions

- Test files: `ComponentName.test.tsx` or `functionName.test.ts`
- Test directories mirror source structure
- Template files: `*.template.test.ts/tsx` (not executed)

### Test Anatomy

Each test file should follow this structure:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithProviders, screen } from '@/__tests__/utils/test-render';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<ComponentName />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = vi.fn();
      renderWithProviders(<ComponentName onClick={handleClick} />);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      renderWithProviders(<ComponentName items={[]} />);
      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });
  });
});
```

## Testing Best Practices

### 1. Use renderWithProviders Instead of render

```typescript
// ❌ Don't use plain render
render(<MyComponent />);

// ✅ Use renderWithProviders
import { renderWithProviders } from '@/__tests__/utils/test-render';
renderWithProviders(<MyComponent />);
```

### 2. Use Mock Factories for Test Data

```typescript
// ❌ Don't hardcode mock data
const product = { id: 1, name: 'Test', price: 99 };

// ✅ Use mock factories
import { createMockProduct } from '@/__tests__/utils/mock-factories';
const product = createMockProduct({ name: 'Custom Name' });
```

### 3. Test User Behavior, Not Implementation

```typescript
// ❌ Avoid testing internal state
expect(component.state.isOpen).toBe(true);

// ✅ Test visible behavior
expect(screen.getByText('Dialog content')).toBeInTheDocument();
```

### 4. Use Fixtures for Repeated Data

```typescript
// ❌ Don't repeat data across files
const mockProducts = [
  { id: 1, name: 'Laptop' },
  { id: 2, name: 'Mouse' }
];

// ✅ Use fixtures
import { MOCK_PRODUCTS } from '@/__tests__/fixtures/data';
// Use MOCK_PRODUCTS directly
```

### 5. Organize Tests with describe Blocks

```typescript
describe('Header Component', () => {
  describe('Rendering', () => {
    it('should render logo', () => {});
    it('should render navigation links', () => {});
  });

  describe('User Interactions', () => {
    it('should open menu on click', () => {});
    it('should close menu on link click', () => {});
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {});
  });
});
```

## Coverage Goals

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

View coverage report: `npm run test:coverage`

## Common Testing Patterns

### Testing Async Operations

```typescript
it('should fetch and display data', async () => {
  const mockData = createMockProducts();
  vi.mocked(apiService.getProducts).mockResolvedValueOnce(mockData);

  renderWithProviders(<ProductList />);
  
  await waitFor(() => {
    expect(screen.getByText(mockData[0].name)).toBeInTheDocument();
  });
});
```

### Testing Error States

```typescript
it('should display error message on API failure', async () => {
  const error = new Error('Network error');
  vi.mocked(apiService.getProducts).mockRejectedValueOnce(error);

  renderWithProviders(<ProductList />);
  
  await waitFor(() => {
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });
});
```

### Testing Form Submissions

```typescript
it('should submit form with correct data', async () => {
  const handleSubmit = vi.fn();
  const user = userEvent.setup();

  renderWithProviders(<ProductForm onSubmit={handleSubmit} />);
  
  const nameInput = screen.getByLabelText(/name/i);
  await user.type(nameInput, 'New Product');
  
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await user.click(submitButton);
  
  expect(handleSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'New Product' })
  );
});
```

## Debugging Tests

### Use screen.debug() to inspect DOM

```typescript
it('should render correctly', () => {
  renderWithProviders(<MyComponent />);
  screen.debug(); // Prints the DOM tree
});
```

### Use screen.logTestingPlaygroundURL() for Visual Debugging

```typescript
it('should render correctly', () => {
  renderWithProviders(<MyComponent />);
  screen.logTestingPlaygroundURL(); // Provides interactive debugging link
});
```

### Run Single Test

```bash
npm test -- --testNamePattern="should render logo"
```

## Mocking Guide

### Mock API Calls

```typescript
import { vi } from 'vitest';
import * as apiService from '@/services/apiService';

vi.spyOn(apiService, 'getProducts').mockResolvedValueOnce(mockData);
```

### Mock Modules

```typescript
vi.mock('@/services/apiService', () => ({
  getProducts: vi.fn().mockResolvedValue(mockData),
}));
```

### Mock localStorage

```typescript
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
```

## Frontend Testing Checklist

When creating tests for new features:

- [ ] Component renders without crashing
- [ ] Component renders with required props
- [ ] Component renders with optional props (if applicable)
- [ ] User interactions work (clicks, form input, etc.)
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Accessibility requirements met (ARIA labels, keyboard navigation)
- [ ] Edge cases handled (null values, empty arrays, etc.)
- [ ] API calls use mocks
- [ ] Test data uses fixtures/factories

## CI/CD Integration

Tests are run on every commit. Ensure:

1. All tests pass locally before pushing
2. Coverage thresholds are met
3. No console errors or warnings (except allowed)

```bash
# Before committing
npm test
npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Need Help?

- Check template test files in `components/` and `api/` directories
- Review fixture data in `fixtures/data.ts`
- Use helper functions from `utils/test-helpers.ts`
"""
