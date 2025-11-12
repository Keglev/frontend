# Components Architecture

## Overview

The components layer provides reusable UI building blocks organized into shared components (buttons, modals, loaders) and page-specific components. All components follow React best practices with proper TypeScript typing, error boundaries, and accessibility.

## Quick Navigation

- **[Shared Components](./shared-components.md)** - Reusable components (Header, Sidebar, Footer, Buttons, ErrorBoundary, HelpModal, SkeletonLoader)
- **[Page Components](./page-components.md)** - Page-level components and route mapping (9 pages)
- **[Styling](./styling.md)** - CSS hierarchy, Tailwind CSS, responsive design patterns
- **[Testing](./testing.md)** - Component testing patterns, accessibility testing, snapshot testing
- **[Overview](./overview.md)** - This file

---

## Component Hierarchy

```
src/components/
├── Buttons.tsx           # Reusable button components
├── ErrorBoundary.tsx     # Error boundary wrapper
├── Footer.tsx            # Footer component
├── Header.tsx            # Header with navigation
├── HelpModal.tsx         # Help documentation modal
├── Sidebar.tsx           # Navigation sidebar
└── SkeletonLoader.tsx    # Loading placeholder

src/pages/
├── AdminDashboard.tsx    # Admin management interface
├── ChangeProductDetailsPage.tsx
├── DeleteProductPage.tsx
├── HomePage.tsx          # Landing page
├── ListStockPage.tsx     # Product inventory list
├── LoginPage.tsx         # Authentication
├── SearchProductPage.tsx
├── UserDashboard.tsx     # User dashboard
└── AddProductPage.tsx    # Product creation
```

---

## Data Flow

```
App.tsx (Root)
├── Router (React Router)
│   ├── Layout Components
│   │   ├── Header (Navigation, User Menu)
│   │   ├── Sidebar (Route Links)
│   │   └── Footer (Static Info)
│   │
│   └── Page Components (Routed)
│       ├── LoginPage
│       ├── HomePage
│       ├── ListStockPage
│       ├── AdminDashboard
│       └── ... (other pages)
│
└── Redux Store (Global State)
    ├── Products State
    ├── User/Auth State
    └── UI State (Modals, Notifications)
```

---

## Component Types

### 1. Shared/Layout Components

Used across multiple pages:

| Component | Purpose | Props |
|-----------|---------|-------|
| Header | Top navigation, user menu | navigation links |
| Sidebar | Left sidebar navigation | routes, collapsed state |
| Footer | Bottom footer | static content |
| Buttons | Action buttons | variant, onClick, disabled |
| ErrorBoundary | Catch React errors | children, fallback |
| HelpModal | Help documentation | isOpen, onClose |
| SkeletonLoader | Loading state | count, variant |

### 2. Page Components

Route-specific components:

| Page | Route | Purpose |
|------|-------|---------|
| LoginPage | /login | User authentication |
| HomePage | / | Landing page |
| ListStockPage | /products | Product inventory |
| AddProductPage | /products/add | Create new product |
| ChangeProductDetailsPage | /products/:id/edit | Modify product |
| DeleteProductPage | /products/:id/delete | Remove product |
| SearchProductPage | /search | Product search interface |
| UserDashboard | /dashboard | User analytics |
| AdminDashboard | /admin | Admin management |

---

## Component Communication Patterns

### Parent to Child (Props)

```typescript
// Parent
<ProductList products={products} onSelectProduct={handleSelect} />

// Child
interface ProductListProps {
  products: Product[];
  onSelectProduct: (id: string) => void;
}
```

### Child to Parent (Callbacks)

```typescript
// Parent state
const [selectedId, setSelectedId] = useState<string | null>(null);

// Pass callback
<ProductItem onSelect={setSelectedId} />

// Child calls callback
const handleClick = () => props.onSelect(product.id);
```

### Global State (Redux)

```typescript
// In page component
const products = useSelector(selectProducts);
const dispatch = useDispatch();

const loadProducts = () => {
  dispatch(fetchProducts());
};
```

---

## Styling Strategy

### Three-Layer CSS Architecture

1. **Global Styles** (`src/styles/globals.css`)
   - Reset, typography, base styles

2. **Component Styles** (`src/components/*.css` and `.module.css`)
   - Component-specific styles
   - BEM or utility-first (Tailwind)

3. **Page Styles** (`src/styles/pages/*.css`)
   - Page-specific layouts and styling

---

## Best Practices

✅ **DO:**
- Use TypeScript for all components
- Memoize components with React.memo for performance
- Keep components focused (single responsibility)
- Use custom hooks for logic extraction
- Add proper prop validation with interfaces
- Include accessibility attributes (aria-*)

❌ **DON'T:**
- Prop drilling (pass through multiple levels)
- Inline styles (use CSS/Tailwind)
- Create components inside components
- Use index.js as default export
- Skip error boundaries
- Ignore loading states

---

## File Structure Standards

```typescript
// Standard component file structure

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import '@/styles/componentName.css';

// ===== Types =====
interface ComponentProps {
  prop1: string;
  prop2?: number;
  onChange?: (value: string) => void;
}

// ===== Component =====
export const ComponentName: React.FC<ComponentProps> = ({
  prop1,
  prop2,
  onChange
}) => {
  // Hooks
  const state = useSelector(selectState);
  const dispatch = useDispatch();

  // Event handlers
  const handleClick = () => {
    onChange?.(prop1);
  };

  // JSX
  return (
    <div className="component">
      <h2>{prop1}</h2>
      <button onClick={handleClick}>Action</button>
    </div>
  );
};

export default ComponentName;
```

---

## Performance Optimization

### Memoization

```typescript
// Prevent unnecessary re-renders
export const ProductItem = React.memo(
  ({ product, onSelect }: Props) => (
    <div onClick={() => onSelect(product.id)}>
      {product.name}
    </div>
  ),
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.product.id === nextProps.product.id;
  }
);
```

### Code Splitting

```typescript
// Lazy load pages
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

<Suspense fallback={<SkeletonLoader />}>
  <AdminDashboard />
</Suspense>
```

---

## Testing Overview

All components include:
- Unit tests for props and behavior
- Integration tests with parent components
- Accessibility tests (a11y)
- Snapshot tests for UI consistency

See [Component Testing](./testing.md) for detailed patterns.

---

## Related Documentation

- **[Shared Components Details](./shared-components.md)** - Header, Sidebar, Footer, Buttons, etc.
- **[Page Components](./page-components.md)** - Page-level components and routes
- **[Styling](./styling.md)** - CSS organization and Tailwind usage
- **[Testing Components](./testing.md)** - Testing patterns and examples
- **[Pages Architecture](../pages/overview.md)** - Page structure and lifecycle
- **[Services](../services/overview.md)** - Data layer integration

---

**Last Updated**: November 2025

