# Component Testing

## Purpose

Document testing patterns for React components including unit, integration, and accessibility testing.

**Location**: `src/__tests__/components/`

---

## Testing Structure

```
src/__tests__/components/
├── __snapshots__/
│   └── Button.test.tsx.snap
├── Button.test.tsx
├── Header.test.tsx
├── ErrorBoundary.test.tsx
├── SkeletonLoader.test.tsx
└── integration/
    └── ProductForm.integration.test.tsx
```

---

## Unit Testing Patterns

### Component Test Setup

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/Buttons';

describe('Button Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders button with label', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant class', () => {
    const { container } = render(
      <Button variant="primary">Button</Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('button--primary');
  });

  it('disables button when prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

### Props Testing

```typescript
describe('Button Props', () => {
  it('accepts all valid variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'];
    
    variants.forEach(variant => {
      const { container } = render(
        <Button variant={variant as any}>Test</Button>
      );
      
      expect(screen.getByRole('button')).toHaveClass(`button--${variant}`);
    });
  });

  it('shows loading state', () => {
    render(<Button isLoading>Save</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading|save/i)).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <Button icon={<span data-testid="icon">→</span>}>
        Action
      </Button>
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
```

---

## Integration Testing

### Component with State

```typescript
describe('Header Component Integration', () => {
  it('toggles user menu on click', async () => {
    render(<Header isAuthenticated={true} />);
    
    const menuButton = screen.getByRole('button', { name: /user menu/i });
    
    // Menu hidden initially
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    
    // Click to show menu
    await userEvent.click(menuButton);
    expect(screen.getByText('Logout')).toBeInTheDocument();
    
    // Click again to hide
    await userEvent.click(menuButton);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('calls onLogout when logout is clicked', async () => {
    const handleLogout = vi.fn();
    render(
      <Header 
        isAuthenticated={true} 
        onLogout={handleLogout}
      />
    );
    
    // Open menu
    await userEvent.click(
      screen.getByRole('button', { name: /user menu/i })
    );
    
    // Click logout
    await userEvent.click(screen.getByText('Logout'));
    
    expect(handleLogout).toHaveBeenCalled();
  });
});
```

### Form Component Testing

```typescript
describe('ProductForm Integration', () => {
  it('submits form with valid data', async () => {
    const handleSubmit = vi.fn();
    render(<ProductForm onSubmit={handleSubmit} />);
    
    // Fill form
    await userEvent.type(
      screen.getByLabelText(/product name/i),
      'Test Product'
    );
    await userEvent.type(
      screen.getByLabelText(/quantity/i),
      '10'
    );
    
    // Submit
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Product',
        quantity: 10
      })
    );
  });

  it('shows validation errors', async () => {
    render(<ProductForm onSubmit={vi.fn()} />);
    
    // Submit empty form
    await userEvent.click(
      screen.getByRole('button', { name: /submit/i })
    );
    
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
  });
});
```

---

## Snapshot Testing

### Basic Snapshot

```typescript
describe('Button Snapshots', () => {
  it('matches snapshot for primary variant', () => {
    const { container } = render(
      <Button variant="primary">Save</Button>
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot with loading state', () => {
    const { container } = render(
      <Button isLoading variant="primary">Save</Button>
    );
    
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### Update Snapshots

```bash
# Update all snapshots
npm run test -- -u

# Update specific file
npm run test Button.test.tsx -- -u
```

---

## Accessibility Testing (a11y)

### ARIA Roles and Labels

```typescript
describe('Button Accessibility', () => {
  it('has proper role', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('supports aria-label', () => {
    render(<Button aria-label="Close dialog">×</Button>);
    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  });

  it('shows disabled state to assistive tech', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
```

### Keyboard Navigation

```typescript
describe('Modal Accessibility', () => {
  it('closes on Escape key', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen onClose={handleClose}>
        Content
      </Modal>
    );
    
    await userEvent.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('supports tab navigation', async () => {
    render(
      <Modal isOpen>
        <input data-testid="first" />
        <input data-testid="second" />
      </Modal>
    );
    
    const firstInput = screen.getByTestId('first');
    const secondInput = screen.getByTestId('second');
    
    firstInput.focus();
    await userEvent.keyboard('{Tab}');
    
    expect(document.activeElement).toBe(secondInput);
  });
});
```

### Color Contrast and Readability

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button Accessibility Violations', () => {
  it('passes axe accessibility check', async () => {
    const { container } = render(
      <Button variant="primary">Accessible Button</Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## Mocking Strategies

### Mock Child Components

```typescript
vi.mock('@/components/Buttons', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} data-testid="mock-button" {...props}>
      {children}
    </button>
  )
}));

describe('Header with Mocked Button', () => {
  it('uses mocked Button component', () => {
    render(<Header />);
    expect(screen.getByTestId('mock-button')).toBeInTheDocument();
  });
});
```

### Mock Redux Store

```typescript
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      user: (state = initialState.user) => state,
      products: (state = initialState.products) => state
    }
  });
};

describe('UserDashboard with Redux', () => {
  it('displays user data from store', () => {
    const store = createMockStore({
      user: { name: 'John', role: 'admin' }
    });

    render(
      <Provider store={store}>
        <UserDashboard />
      </Provider>
    );

    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

---

## Testing Best Practices

### ✅ DO:

```typescript
// Test behavior, not implementation
it('shows error when form is invalid', async () => {
  render(<Form />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});

// Use meaningful data-testid only when necessary
<div data-testid="product-card">...</div>

// Test from user perspective
screen.getByRole('button', { name: /click me/i });
screen.getByLabelText('Email');

// Test accessibility
expect(button).toHaveAttribute('aria-label');
```

### ❌ DON'T:

```typescript
// Don't test implementation details
it('calls setState when clicked', () => { });

// Don't rely on CSS classes for testing
screen.getByClassName('primary-button');

// Don't test internal state
expect(component.state.isOpen).toBe(true);

// Don't use excessive mocking
vi.mock('everything');
```

---

## Test Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### View Coverage Report

```bash
npm run test -- --coverage

# HTML report
npm run test -- --coverage --reporter=html
```

---

## Related Documentation

- **[Overview](./overview.md)** - Component architecture
- **[Shared Components](./shared-components.md)** - Component details
- **[Styling](./styling.md)** - CSS patterns
- **[Testing Guide](../tests/overview.md)** - General testing guide

---

**Last Updated**: November 2025

