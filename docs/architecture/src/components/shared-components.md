# Shared Components

## Purpose

Reusable UI components used across multiple pages.

**Location**: `src/components/`

---

## Component Directory

### 1. Header.tsx

**Purpose**: Top navigation bar with site title and user menu

**Features**:
- Navigation links (Home, Products, Admin)
- User profile dropdown
- Language selector (i18n)
- Logout functionality
- Responsive design

**Props**:
```typescript
interface HeaderProps {
  isAuthenticated: boolean;
  userRole?: 'admin' | 'user';
  onLogout: () => void;
}
```

**Usage**:
```typescript
<Header 
  isAuthenticated={isLoggedIn}
  userRole={role}
  onLogout={handleLogout}
/>
```

---

### 2. Sidebar.tsx

**Purpose**: Left navigation panel with route links

**Features**:
- Route navigation
- Collapse/expand toggle
- Active route highlighting
- Role-based menu items

**Props**:
```typescript
interface SidebarProps {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}
```

**Usage**:
```typescript
const [collapsed, setCollapsed] = useState(false);
<Sidebar 
  isCollapsed={collapsed}
  onCollapsedChange={setCollapsed}
/>
```

---

### 3. Footer.tsx

**Purpose**: Static footer with company info and links

**Features**:
- Company information
- Legal links (Privacy, Terms)
- Social media links
- Copyright notice

**Usage**:
```typescript
<Footer />
```

---

### 4. Buttons.tsx

**Purpose**: Reusable button components

**Variants**:
- `primary` - Main action buttons
- `secondary` - Secondary actions
- `danger` - Destructive actions (delete, logout)
- `ghost` - Minimal style

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

**Usage**:
```typescript
<Button variant="primary" size="lg" onClick={handleClick}>
  Create Product
</Button>

<Button variant="danger" isLoading={saving}>
  Delete
</Button>
```

---

### 5. ErrorBoundary.tsx

**Purpose**: Catch React errors and display fallback UI

**Features**:
- Error logging
- Fallback UI display
- Error recovery button
- Development error details

**Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}
```

**Usage**:
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

**Error Handling Example**:
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

### 6. HelpModal.tsx

**Purpose**: Display help documentation and FAQs

**Features**:
- Modal dialog
- Searchable help content
- Multiple language support
- Close button and overlay click

**Props**:
```typescript
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: string;
}
```

**Usage**:
```typescript
const [helpOpen, setHelpOpen] = useState(false);

<HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
<Button onClick={() => setHelpOpen(true)}>Help</Button>
```

---

### 7. SkeletonLoader.tsx

**Purpose**: Loading placeholder UI

**Features**:
- Animated skeleton
- Configurable variants
- Responsive sizing
- Accessibility compliance

**Props**:
```typescript
interface SkeletonLoaderProps {
  count?: number;
  variant?: 'text' | 'avatar' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave';
}
```

**Usage**:
```typescript
{loading ? (
  <SkeletonLoader count={5} variant="rectangular" />
) : (
  <ProductList products={products} />
)}
```

---

## Composition Patterns

### Component Composition

```typescript
// Complex component built from simpler ones
<Card>
  <Card.Header>
    <Heading>Product</Heading>
  </Card.Header>
  <Card.Body>
    <ProductForm onSubmit={handleSubmit} />
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Submit</Button>
    <Button variant="secondary">Cancel</Button>
  </Card.Footer>
</Card>
```

### Render Props Pattern

```typescript
<ErrorBoundary>
  {({ error, reset }) => (
    <>
      {error && <ErrorDisplay error={error} />}
      <button onClick={reset}>Retry</button>
    </>
  )}
</ErrorBoundary>
```

---

## Props Drilling Prevention

### Context for Shared State

```typescript
// Create context for theme
const ThemeContext = createContext<Theme>('light');

// Provider in root
<ThemeContext.Provider value={theme}>
  <App />
</ThemeContext.Provider>

// Use in any component
const theme = useContext(ThemeContext);
```

### Redux for Global State

```typescript
// Instead of prop drilling
const user = useSelector(selectUser);
const role = user.role;  // Available anywhere
```

---

## Accessibility Features

### ARIA Attributes

```typescript
<button
  aria-label="Close modal"
  aria-pressed={isPressed}
  role="button"
>
  ✕
</button>
```

### Keyboard Navigation

```typescript
<div
  role="listbox"
  onKeyDown={(e) => {
    if (e.key === 'ArrowDown') selectNext();
    if (e.key === 'ArrowUp') selectPrev();
    if (e.key === 'Enter') confirm();
  }}
>
  {items.map(item => <div role="option">{item}</div>)}
</div>
```

---

## Related Documentation

- **[Overview](./overview.md)** - Component architecture
- **[Page Components](./page-components.md)** - Page-level components
- **[Styling](./styling.md)** - CSS and Tailwind patterns
- **[Testing](./testing.md)** - Testing patterns

---

**Last Updated**: November 2025

