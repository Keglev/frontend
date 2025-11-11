# Styling Architecture

## Purpose

Document CSS organization, Tailwind CSS patterns, and responsive design strategies.

**Location**: `src/styles/` directory

---

## CSS Hierarchy

### 1. Global Styles (`src/styles/globals.css`)

**Contents**:
- CSS reset (Normalize.css or custom)
- Global typography
- Root variables
- Base element styles
- Utility classes

**Example**:
```css
/* CSS Variables */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6b7280;
  --danger-color: #ef4444;
  --spacing-unit: 8px;
}

/* Typography */
body {
  font-family: 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-primary);
}

h1 { font-size: 2rem; font-weight: 700; }
h2 { font-size: 1.5rem; font-weight: 600; }
```

### 2. Component Styles (`src/components/*.css`)

**Naming Convention**: BEM (Block-Element-Modifier)

```css
/* Block */
.button { }

/* Element */
.button__text { }
.button__icon { }

/* Modifier */
.button--primary { }
.button--loading { }
.button--disabled { }
```

**Example**:
```css
.header {
  display: flex;
  padding: var(--spacing-unit);
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header__title {
  font-size: 1.5rem;
  font-weight: bold;
}

.header__nav {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

@media (max-width: 768px) {
  .header__nav {
    flex-direction: column;
  }
}
```

### 3. Page Styles (`src/styles/pages/*.css`)

Layout and specific page styling:

```css
/* Login page specific styles */
.login-page {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-page__form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}
```

---

## Tailwind CSS Usage

### Configuration (`tailwind.config.js`)

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280'
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem'
      }
    }
  },
  plugins: []
}
```

### Utility Classes

```typescript
// Button with Tailwind utilities
<button className="
  px-4 py-2 
  bg-blue-500 hover:bg-blue-600 
  text-white font-semibold 
  rounded-lg 
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Click me
</button>
```

### Component Classes

```typescript
// Reusable component class with Tailwind
const variants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-500 hover:bg-red-600 text-white'
};

<button className={`px-4 py-2 rounded-lg ${variants[variant]}`}>
  {label}
</button>
```

---

## Responsive Design Patterns

### Mobile-First Approach

```css
/* Mobile (default) */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    width: 750px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    width: 960px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    width: 1200px;
  }
}
```

### Tailwind Breakpoints

```typescript
// Using Tailwind responsive prefixes
<div className="
  grid grid-cols-1     /* Mobile: 1 column */
  sm:grid-cols-2       /* Small: 2 columns */
  md:grid-cols-3       /* Medium: 3 columns */
  lg:grid-cols-4       /* Large: 4 columns */
  gap-4
">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

---

## State-Based Styling

### Disabled State

```typescript
<button
  disabled={isLoading}
  className={`
    px-4 py-2 rounded-lg
    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
  `}
>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### Active/Hover States

```css
.nav-link {
  padding: 0.75rem 1.5rem;
  color: inherit;
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: border-color 0.2s;
}

.nav-link:hover {
  border-bottom-color: var(--primary-color);
}

.nav-link.active {
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}
```

### Form States

```css
.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.form-input:invalid,
.form-input.error {
  border-color: var(--danger-color);
}

.form-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
```

---

## Layout Patterns

### Flexbox Layouts

```typescript
// Navigation row
<nav className="flex items-center justify-between p-4">
  <logo />
  <nav-links /> {/* flex-1 centers with justify-between */}
  <user-menu />
</nav>

// Form group
<div className="flex flex-col gap-2">
  <label>Email</label>
  <input type="email" />
  <p className="text-sm text-red-500">Error message</p>
</div>
```

### Grid Layouts

```typescript
// Product grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Two-column layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <main className="lg:col-span-2">{/* Content */}</main>
  <aside className="lg:col-span-1">{/* Sidebar */}</aside>
</div>
```

---

## Color System

### CSS Variables

```css
:root {
  /* Primary Colors */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #0ea5e9;

  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
}
```

### Usage

```typescript
<div className="flex gap-2">
  <p style={{ color: 'var(--color-primary-500)' }}>Primary</p>
  <p style={{ color: 'var(--color-success)' }}>Success</p>
  <p style={{ color: 'var(--color-danger)' }}>Danger</p>
</div>
```

---

## Dark Mode Support

### CSS Strategy

```css
/* Light mode (default) */
:root {
  --background: white;
  --text: #111827;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1f2937;
    --text: #f3f4f6;
  }
}

body {
  background-color: var(--background);
  color: var(--text);
  transition: background-color 0.3s, color 0.3s;
}
```

---

## Performance Optimization

### Critical CSS

```html
<!-- Inline critical above-the-fold CSS -->
<style>
  body { margin: 0; }
  .header { /* critical styles */ }
</style>
<link rel="stylesheet" href="styles.css">
```

### CSS Minification

- Production builds automatically minify CSS
- Remove unused Tailwind classes with PurgeCSS
- Lazy load component styles if needed

---

## Best Practices

✅ **DO:**
- Use CSS variables for theming
- Apply mobile-first responsive design
- Keep component styles scoped and modular
- Use semantic HTML with proper structure
- Optimize images and assets

❌ **DON'T:**
- Use inline styles (except for dynamic values)
- Create deeply nested selectors
- Use `!important` (unless absolutely necessary)
- Mix multiple CSS methodologies
- Forget accessibility (contrast, readability)

---

## Related Documentation

- **[Overview](./overview.md)** - Component architecture
- **[Shared Components](./shared-components.md)** - Component details
- **[Testing](./testing.md)** - Styling in tests
- **[Tailwind Config](../../tailwind.config.js)** - Configuration

---

**Last Updated**: November 2025

