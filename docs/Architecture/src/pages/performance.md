# Performance & Optimization

## Page-Level Optimization Techniques

StockEase implements several optimization strategies to ensure fast page loads and smooth user experience.

---

## Lazy Loading Pages

### What Is Lazy Loading?

Lazy loading delays loading a page component until it's needed, reducing initial bundle size.

### Implementation

```typescript
/**
 * App.tsx - Define lazy pages
 */

import { lazy, Suspense } from 'react';
import SkeletonLoader from './components/SkeletonLoader';

// Lazy load heavy page components
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AddProductPage = lazy(() => import('./pages/AddProductPage'));
const SearchProductPage = lazy(() => import('./pages/SearchProductPage'));
const ListStockPage = lazy(() => import('./pages/ListStockPage'));
const ChangeProductDetailsPage = lazy(
  () => import('./pages/ChangeProductDetailsPage')
);

// Keep small pages as regular imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Route setup with Suspense
<Routes>
  {/* Small pages - regular import */}
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  
  {/* Large pages - lazy loaded */}
  <Route 
    path="/user" 
    element={
      <Suspense fallback={<SkeletonLoader />}>
        <UserDashboard />
      </Suspense>
    }
  />
  
  <Route 
    path="/admin" 
    element={
      <Suspense fallback={<SkeletonLoader />}>
        <AdminDashboard />
      </Suspense>
    }
  />
</Routes>
```

### Bundle Impact

```
Without Lazy Loading:
app.js (500 KB)
  ├─ HomePage
  ├─ LoginPage
  ├─ AdminDashboard (200 KB)
  ├─ UserDashboard (180 KB)
  └─ Other pages

With Lazy Loading:
app.js (150 KB) ← Initial bundle (60KB smaller)
└─ Admin chunk (200 KB) ← Loaded when needed
└─ User chunk (180 KB) ← Loaded when needed
```

### Loading Fallback

```typescript
// Simple skeleton loader
<Suspense fallback={<SkeletonLoader />}>
  <AdminDashboard />
</Suspense>

// Custom fallback
<Suspense fallback={
  <div className="loading">
    <Spinner />
    <p>Loading dashboard...</p>
  </div>
}>
  <AdminDashboard />
</Suspense>
```

---

## React.memo - Prevent Unnecessary Re-renders

### Problem: Unnecessary Re-renders

```typescript
// Without memo - re-renders on every parent update
const UserDashboard = () => {
  return <div>User Dashboard</div>;
};

// Parent component
const App = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <UserDashboard />  {/* Re-renders when count changes */}
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
};
```

### Solution: Memoize Component

```typescript
// With memo - only re-renders if props change
const UserDashboard = React.memo(() => {
  console.log('UserDashboard rendered');
  return <div>User Dashboard</div>;
});

export default UserDashboard;

// Parent component
const App = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <UserDashboard />  {/* Won't re-render */}
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
};
```

### When to Use memo

```typescript
// ✅ USE MEMO: Heavy component, rarely changing props
const AdminDashboard = React.memo(() => {
  // Complex rendering, expensive calculations
});

// ❌ DON'T USE: Simple component, props always change
const FilterBar = (props) => {
  // Simple JSX, props change frequently
};

// ✅ USE MEMO: Expensive child components
const ProductTable = React.memo(({ products }) => {
  // Renders 1000 rows
});

// ❌ DON'T USE: Props always different
const Button = React.memo(({ onClick }) => {
  // onClick function changes every render
});
```

---

## useMemo - Memoize Expensive Computations

### Problem: Recalculating on Every Render

```typescript
const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  
  // PROBLEM: Filters 1000 items every render
  // Even if products and filters haven't changed!
  const filteredProducts = products.filter(p => 
    matchesFilters(p, filters)
  );
  
  return <ProductTable products={filteredProducts} />;
};
```

### Solution: Memoize the Calculation

```typescript
const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  
  // Only recalculate if products or filters change
  const filteredProducts = useMemo(() => {
    console.log('Filtering products...');
    return products.filter(p => matchesFilters(p, filters));
  }, [products, filters]);  // Dependency array
  
  return <ProductTable products={filteredProducts} />;
};
```

### Use Cases

```typescript
// Expensive calculation
const statistics = useMemo(() => {
  return {
    totalPrice: products.reduce((sum, p) => sum + p.price, 0),
    totalQuantity: products.reduce((sum, p) => sum + p.qty, 0),
    avgPrice: totalPrice / products.length
  };
}, [products]);

// Complex filtering
const filtered = useMemo(() => {
  return applyFiltersAndSort(products, filters, sortBy);
}, [products, filters, sortBy]);

// Derived data
const groupedByCategory = useMemo(() => {
  return groupBy(products, 'category');
}, [products]);
```

---

## useCallback - Memoize Event Handlers

### Problem: Function References Change

```typescript
const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  
  // PROBLEM: Function reference changes every render
  // ProductTable will re-render even if it has memo()
  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  return (
    <ProductTable 
      products={products}
      onDelete={handleDelete}  {/* New function every time */}
    />
  );
};
```

### Solution: Memoize the Handler

```typescript
const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  
  // Function reference stays the same
  const handleDelete = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);  // No dependencies = same function always
  
  return (
    <ProductTable 
      products={products}
      onDelete={handleDelete}  {/* Same function reference */}
    />
  );
};
```

### With Dependencies

```typescript
const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  
  // Only recreate handler if filter changes
  const handleSearch = useCallback((query) => {
    // Use current filter value
    const results = searchProducts(query, filter);
    displayResults(results);
  }, [filter]);  // Recreate if filter changes
  
  return <SearchBar onSearch={handleSearch} />;
};
```

---

## Code Splitting Best Practices

### Split by Route

```typescript
// pages/
// ├── HomePage.tsx (small)
// ├── LoginPage.tsx (small)
// ├── AdminDashboard.tsx (large)
// └── UserDashboard.tsx (large)

import { lazy } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
```

### Split Large Components

```typescript
// Before: Everything in one file
// AdminDashboard.tsx (400 lines)

// After: Break into chunks
// AdminDashboard.tsx (100 lines - main)
// AdminDashboard/
//   ├── ProductTable.tsx
//   ├── FilterBar.tsx
//   └── StatisticsCards.tsx
```

### Analyze Bundle

```bash
# Install analyzer
npm install --save-dev vite-plugin-visualizer

# Build and analyze
npm run build

# Open generated HTML file to see bundle composition
```

---

## Data Fetching Optimization

### Pagination

```typescript
// Load only 10 items at a time
const ListStockPage = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  useEffect(() => {
    // Only fetch current page
    const start = (page - 1) * pageSize;
    ProductService.getProducts({
      skip: start,
      take: pageSize
    });
  }, [page]);
  
  return (
    <div>
      <ProductTable products={products} />
      <Pagination 
        current={page}
        total={totalPages}
        onChange={setPage}
      />
    </div>
  );
};
```

### Debounced Search

```typescript
const SearchProductPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    // Debounce: wait 300ms before searching
    const timer = setTimeout(() => {
      if (query.trim()) {
        ProductService.search(query)
          .then(setResults);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <SearchResults results={results} />
    </div>
  );
};
```

### Virtual Scrolling (For Large Lists)

```typescript
// Use react-window for large lists
import { FixedSizeList as List } from 'react-window';

const LargeProductList = ({ products }) => {
  return (
    <List
      height={600}
      itemCount={products.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {products[index].name} - ${products[index].price}
        </div>
      )}
    </List>
  );
};
```

---

## Image Optimization

### Use Lazy Loading for Images

```typescript
<img 
  src="product.jpg"
  loading="lazy"  {/* Don't load until near viewport */}
  alt="Product"
/>
```

### Responsive Images

```typescript
<picture>
  <source 
    media="(max-width: 640px)"
    srcSet="product-sm.jpg"
  />
  <source 
    media="(min-width: 641px)"
    srcSet="product-lg.jpg"
  />
  <img src="product.jpg" alt="Product" />
</picture>
```

---

## Network Performance

### Reduce API Calls

```typescript
// Before: Multiple calls
await getUser();
await getProducts();
await getStats();

// After: Single combined call
const data = await getInitialData();
// Returns { user, products, stats }
```

### Cache API Responses

```typescript
const apiClient = axios.create();
const cache = new Map();

apiClient.interceptors.request.use(config => {
  if (cache.has(config.url)) {
    return Promise.resolve(cache.get(config.url));
  }
  return config;
});

apiClient.interceptors.response.use(response => {
  cache.set(response.config.url, response);
  return response;
});
```

---

## Performance Monitoring

### Measure Component Render Time

```typescript
import { useState, useEffect } from 'react';

const AdminDashboard = () => {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`AdminDashboard render time: ${end - start}ms`);
    };
  }, []);
  
  return <div>Dashboard</div>;
};
```

### Monitor Web Vitals

```typescript
// Use web-vitals library
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

---

## Performance Checklist

### ✅ DO:

```typescript
// Lazy load heavy pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Memoize expensive components
const ProductTable = React.memo(({ products }) => {});

// Memoize expensive calculations
const stats = useMemo(() => calculate(products), [products]);

// Memoize event handlers
const handleDelete = useCallback((id) => delete(id), []);

// Paginate large lists
ProductService.getProducts({ page, pageSize });

// Debounce search input
useEffect(() => {
  const timer = setTimeout(() => search(query), 300);
  return () => clearTimeout(timer);
}, [query]);
```

### ❌ DON'T:

```typescript
// Don't load all pages in initial bundle
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
// ... 10 more imports

// Don't calculate in render without memoization
const filtered = products.filter(...);  // Every render!

// Don't pass new objects/arrays as props
<Component onClick={() => handler()} />  // New function!

// Don't load all data at once
ProductService.getProducts();  // 100,000 items!

// Don't search on every keystroke
<input onChange={(e) => search(e.target.value)} />  // 1000 API calls!
```

---

## Related Documentation

- [Overview](./overview.md) - Page structure
- [Page Lifecycle](./lifecycle.md) - Component patterns
- [Authentication](./authentication.md) - Protected routes
- [Testing](./testing.md) - Testing strategies

---

**Last Updated**: November 2025

