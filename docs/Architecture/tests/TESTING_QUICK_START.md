# Frontend Testing - Quick Start Guide

## Installation

Dependencies have been added to your `package.json`. Install them with:

```bash
npm install
```

This installs:
- **Vitest**: Fast unit test framework for Vue and React
- **@testing-library/react**: React testing utilities
- **@testing-library/user-event**: User interaction simulation
- **@testing-library/jest-dom**: Custom matchers
- **jsdom**: DOM environment for Node.js tests

## Directory Structure

Your test structure has been set up at `src/__tests__/` with the following organization:

```
src/__tests__/
├── components/          # Component tests
├── pages/              # Page tests
├── services/           # Business logic tests
├── api/                # API service tests
├── logic/              # Utility function tests
├── types/              # Type definition tests
├── utils/              # Test helpers & utilities
├── fixtures/           # Mock data
├── mocks/              # API mocks
├── setup.ts            # Test configuration
└── README.md           # Detailed testing guide
```

## Running Tests

### Start with the test suite
```bash
npm test
```

### Interactive UI mode (recommended for development)
```bash
npm run test:ui
```

### Coverage report
```bash
npm run test:coverage
```

### Watch specific file
```bash
npm test -- src/__tests__/components/Header.test.tsx
```

## Writing Your First Test

### 1. Create a test file
Create `src/__tests__/components/Header.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/__tests__/utils/test-render';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('should render the header component', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
```

### 2. Use provided utilities

**Custom render with providers:**
```typescript
import { renderWithProviders } from '@/__tests__/utils/test-render';

renderWithProviders(<YourComponent />);
```

**Mock data factories:**
```typescript
import { createMockProduct, createMockProducts } from '@/__tests__/utils/mock-factories';

const product = createMockProduct({ name: 'Laptop' });
const products = createMockProducts(5);
```

**Test fixtures:**
```typescript
import { MOCK_PRODUCTS, MOCK_API_RESPONSES } from '@/__tests__/fixtures/data';
```

**Test helpers:**
```typescript
import { clickByText, typeInInput, waitForElement } from '@/__tests__/utils/test-helpers';

await clickByText('Submit');
await typeInInput('Email', 'test@example.com');
```

## Key Files to Review

1. **`vitest.config.ts`** - Test runner configuration
2. **`src/__tests__/setup.ts`** - Global test setup (mocks, providers)
3. **`src/__tests__/utils/test-render.tsx`** - Custom render function
4. **`src/__tests__/fixtures/data.ts`** - Reusable mock data
5. **`src/__tests__/README.md`** - Comprehensive testing guide

## Templates Available

Use these template files as starting points:

- **`components/Component.template.test.tsx`** - Component test example
- **`api/API.template.test.ts`** - API service test example
- **`pages/Page.template.test.tsx`** - Page component test example
- **`logic/Logic.template.test.ts`** - Business logic test example

Copy a template and adapt it to your needs.

## Next Steps

1. **Install dependencies**: `npm install`
2. **Review**: Check `src/__tests__/README.md` for detailed practices
3. **Create tests**: Start with components using the template files
4. **Run tests**: Use `npm run test:ui` for interactive debugging
5. **Check coverage**: Use `npm run test:coverage` to see coverage reports

## Common Test Patterns

### Testing Component Rendering
```typescript
it('should render with props', () => {
  renderWithProviders(<Component title="Test" />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Testing User Interactions
```typescript
import userEvent from '@testing-library/user-event';

it('should handle click', async () => {
  const handleClick = vi.fn();
  renderWithProviders(<Button onClick={handleClick} />);
  
  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Testing API Calls
```typescript
it('should fetch data', async () => {
  const mockData = createMockProducts();
  vi.mocked(apiService.getProducts).mockResolvedValueOnce(mockData);
  
  renderWithProviders(<ProductList />);
  
  await waitFor(() => {
    expect(screen.getByText(mockData[0].name)).toBeInTheDocument();
  });
});
```

## Debugging Tests

### Print the DOM
```typescript
it('should render', () => {
  renderWithProviders(<Component />);
  screen.debug(); // Prints DOM to console
});
```

### Interactive Debugging
```typescript
it('should work', () => {
  renderWithProviders(<Component />);
  screen.logTestingPlaygroundURL(); // Prints debugging URL
});
```

Run in watch mode to debug interactively:
```bash
npm test -- --watch
```

## Tips for Success

✅ **DO:**
- Use `renderWithProviders` for components with providers
- Use mock factories for test data
- Test user behavior, not implementation
- Organize tests with `describe` blocks
- Use fixtures for repeated data
- Test accessibility (ARIA labels, keyboard nav)

❌ **DON'T:**
- Use `render` directly (use `renderWithProviders`)
- Hardcode mock data (use factories/fixtures)
- Test internal state (test visible behavior)
- Skip error scenarios
- Ignore accessibility

## Need Help?

- **Detailed Guide**: `src/__tests__/README.md`
- **Template Examples**: Check the `.template.test.ts` files
- **Vitest Docs**: https://vitest.dev
- **Testing Library**: https://testing-library.com/docs/react-testing-library/intro/

---

**Happy testing! 🚀**
