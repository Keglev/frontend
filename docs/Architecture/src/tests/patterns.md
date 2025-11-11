# Testing Patterns & Strategies

## Unit Testing Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('UnitBeing Tested', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SpecificFeature', () => {
    it('should do X when given Y', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe(expectedOutput);
    });

    it('handles error scenario', () => {
      const error = new Error('Test error');
      vi.mocked(dependency).mockRejectedValue(error);
      
      expect(() => functionUnderTest()).toThrow(error);
    });
  });
});
```

## Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Component', () => {
  it('renders with required props', () => {
    render(<Component required="value" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when button clicked', async () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies className variants', () => {
    const { container } = render(<Component variant="primary" />);
    expect(container.firstChild).toHaveClass('component--primary');
  });
});
```

## Integration Testing Pattern

```typescript
describe('Integration: Product Workflow', () => {
  it('creates, updates, and deletes product', async () => {
    // Mock API responses
    const mockProduct = { id: '1', name: 'Test' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockProduct });
    vi.mocked(apiClient.put).mockResolvedValue({ 
      data: { ...mockProduct, name: 'Updated' } 
    });
    vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 });

    // Execute workflow
    const created = await ProductService.createProduct(data);
    const updated = await ProductService.updateProduct(created.id, updates);
    await ProductService.deleteProduct(created.id);

    // Verify calls
    expect(apiClient.post).toHaveBeenCalled();
    expect(apiClient.put).toHaveBeenCalled();
    expect(apiClient.delete).toHaveBeenCalled();
  });
});
```

## Accessibility Testing Pattern

```typescript
describe('Accessibility', () => {
  it('button has proper ARIA label', () => {
    render(<Button aria-label="Close dialog">×</Button>);
    expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  });

  it('form inputs are keyboard accessible', async () => {
    render(<Form />);
    
    const firstInput = screen.getByLabelText('Name');
    const secondInput = screen.getByLabelText('Email');
    
    firstInput.focus();
    await userEvent.keyboard('{Tab}');
    
    expect(document.activeElement).toBe(secondInput);
  });
});
```

## Hook Testing Pattern

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';

describe('useCustomHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.value).toBe(initialValue);
  });

  it('updates state on action', async () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.setValue('newValue');
    });
    
    expect(result.current.value).toBe('newValue');
  });

  it('fetches data on mount', async () => {
    const { result } = renderHook(() => useDataFetch());
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
  });
});
```

## Error Testing Pattern

```typescript
describe('Error Handling', () => {
  it('catches and logs errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
    
    try {
      await functionThatThrows();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(consoleSpy).toHaveBeenCalled();
    }
    
    consoleSpy.mockRestore();
  });

  it('shows error message to user', async () => {
    vi.mocked(api.fetch).mockRejectedValue(new Error('Network failed'));
    
    const { result } = renderHook(() => useData());
    
    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```

## Snapshot Testing Pattern

```typescript
describe('Snapshots', () => {
  it('matches snapshot', () => {
    const { container } = render(<Component prop="value" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('snapshot with different variants', () => {
    ['primary', 'secondary'].forEach(variant => {
      const { container } = render(<Button variant={variant} />);
      expect(container.firstChild).toMatchSnapshot(variant);
    });
  });
});
```

## Mocking Patterns

### Mock Service

```typescript
vi.mock('@/api/ProductService', () => ({
  ProductService: {
    getProducts: vi.fn(),
    createProduct: vi.fn()
  }
}));
```

### Mock Custom Hook

```typescript
vi.mock('@/services/hooks/useProducts', () => ({
  useProducts: vi.fn().mockReturnValue({
    products: [],
    loading: false,
    error: null
  })
}));
```

### Mock Redux

```typescript
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const mockStore = configureStore({
  reducer: {
    products: () => ({ items: [] })
  }
});

render(
  <Provider store={mockStore}>
    <Component />
  </Provider>
);
```

## Common Assertions

```typescript
// Existence
expect(element).toBeInTheDocument();
expect(element).toBeDefined();

// Content
expect(element).toHaveTextContent('text');
expect(screen.getByText(/pattern/i)).toBeInTheDocument();

// Classes & Attributes
expect(element).toHaveClass('className');
expect(element).toHaveAttribute('disabled');

// State
expect(checkbox).toBeChecked();
expect(button).toBeDisabled();

// Counts
expect(listItems).toHaveLength(3);

// Functions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(expectedArg);
expect(mockFn).toHaveBeenCalledTimes(2);

// Errors
expect(() => throwingFn()).toThrow();
expect(promise).rejects.toThrow();

// Snapshots
expect(component).toMatchSnapshot();
```

---

## Related Documentation

- **[Overview](./overview.md)** - Testing overview
- **[Structure](./structure.md)** - Test organization
- **[Setup](./setup-configuration.md)** - Configuration
- **[Coverage](./coverage.md)** - Coverage goals
- **[Running Tests](./running-tests.md)** - Commands

---

**Last Updated**: November 2025

