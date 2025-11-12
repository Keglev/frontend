# Page Lifecycle & Implementation Patterns

## Typical Page Component Structure

Every page component in StockEase follows a consistent pattern with predictable lifecycle stages:

---

## Page Component Template

```typescript
/**
 * Example Page Component: AdminDashboard.tsx
 * 
 * This template demonstrates the typical structure of a page component,
 * including authentication, state management, data fetching, and rendering.
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from '../components/ErrorBoundary';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import SkeletonLoader from '../components/SkeletonLoader';

const AdminDashboard: React.FC = () => {
  // ============================================================
  // STAGE 1: Setup & Authentication Check
  // ============================================================
  
  // Access Redux state
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  
  // i18n for translations
  const { t } = useTranslation();
  
  // Perform authentication check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check authorization (role-based)
  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // ============================================================
  // STAGE 2: State Initialization
  // ============================================================
  
  // Local component state
  const [filters, setFilters] = useState({
    status: 'all',        // 'all', 'low-stock', 'in-stock'
    sortBy: 'name',       // 'name', 'price', 'quantity'
    searchQuery: ''
  });
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // ============================================================
  // STAGE 3: Data Fetching & Side Effects
  // ============================================================
  
  // Fetch products when component mounts or filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Show loading state
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Fetch from API/service
        const data = await ProductService.getAllProducts({
          ...filters,
          page,
          pageSize
        });
        
        // Update Redux store
        dispatch({ type: 'SET_PRODUCTS', payload: data.products });
        dispatch({ type: 'SET_TOTAL', payload: data.total });
        
      } catch (error) {
        console.error('Error fetching products:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchProducts();
  }, [filters, page, pageSize, dispatch]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: clear state on unmount
      dispatch({ type: 'CLEAR_ERROR' });
    };
  }, [dispatch]);
  
  // ============================================================
  // STAGE 4: Event Handlers
  // ============================================================
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);  // Reset to first page when filtering
  };
  
  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
    setPage(1);
  };
  
  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
    setPage(1);
  };
  
  const handleDeleteProduct = async (productId: number) => {
    // Confirm deletion
    if (!window.confirm(t('confirm.delete_product'))) {
      return;
    }
    
    try {
      // Call API to delete
      await ProductService.deleteProduct(productId);
      
      // Update Redux store (remove product)
      dispatch({ type: 'REMOVE_PRODUCT', payload: productId });
      
      // Show success message
      showSuccessMessage(t('messages.product_deleted'));
      
    } catch (error) {
      console.error('Error deleting product:', error);
      showErrorMessage(error.message);
    }
  };
  
  const handleEditProduct = (productId: number) => {
    // Navigate to edit page
    navigate(`/product/${productId}/edit`);
  };
  
  // ============================================================
  // STAGE 5: Get Current Data from Redux
  // ============================================================
  
  const { products, loading, error, total } = useSelector(
    state => state.products
  );
  
  // ============================================================
  // STAGE 6: Conditional Rendering (Loading/Error States)
  // ============================================================
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <SkeletonLoader count={5} />
          </main>
        </div>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            <ErrorBoundary message={error}>
              <div className="alert alert-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                  {t('buttons.retry')}
                </button>
              </div>
            </ErrorBoundary>
          </main>
        </div>
        <Footer />
      </>
    );
  }
  
  // ============================================================
  // STAGE 7: Main Content Rendering
  // ============================================================
  
  return (
    <ErrorBoundary>
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <div className="admin-dashboard">
            {/* Page Header */}
            <h1>{t('pages.admin_dashboard')}</h1>
            
            {/* Filter/Search Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              onSearchChange={handleSearchChange}
            />
            
            {/* Statistics Cards */}
            <div className="stats-grid">
              <StatCard label="Total Products" value={total} />
              <StatCard label="Low Stock" value={getLowStockCount(products)} />
              <StatCard label="Total Value" value={getTotalValue(products)} />
            </div>
            
            {/* Products Table */}
            <ProductTable
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
            
            {/* Pagination */}
            <Pagination
              current={page}
              total={Math.ceil(total / pageSize)}
              onChange={setPage}
            />
          </div>
        </main>
      </div>
      <Footer />
    </ErrorBoundary>
  );
};

export default AdminDashboard;
```

---

## Lifecycle Stages Explained

### Stage 1: Setup & Authentication

```typescript
const { user, isAuthenticated } = useSelector(state => state.auth);

// Check if authenticated
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}

// Check role
if (user?.role !== 'admin') {
  return <Navigate to="/unauthorized" />;
}
```

**Purpose**: Prevent unauthorized access before component renders

**When to use**: All protected pages need authentication checks

---

### Stage 2: State Initialization

```typescript
const [filters, setFilters] = useState({
  status: 'all',
  sortBy: 'name',
  searchQuery: ''
});

const [page, setPage] = useState(1);
```

**Purpose**: Initialize component-level state for UI management

**Common states**:
- Filters and sorting
- Pagination
- Form inputs
- UI state (modals open, dropdowns expanded)

---

### Stage 3: Data Fetching & Effects

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await ProductService.getProducts(filters);
      dispatch({ type: 'SET_PRODUCTS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  fetchData();
}, [filters, dispatch]);
```

**Purpose**: Fetch data when component mounts or dependencies change

**Pattern**: useEffect with dependency array

**Dependencies**: Filters, pagination, sorting that trigger re-fetch

---

### Stage 4: Event Handlers

```typescript
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  setPage(1);  // Reset pagination
};

const handleDeleteProduct = async (id) => {
  if (!confirm('Sure?')) return;
  
  try {
    await ProductService.deleteProduct(id);
    dispatch({ type: 'REMOVE_PRODUCT', payload: id });
    showSuccessMessage('Deleted!');
  } catch (error) {
    showErrorMessage(error.message);
  }
};
```

**Purpose**: Handle user interactions (clicks, form submissions, etc.)

**Pattern**: Synchronize state and Redux store

---

### Stage 5: Get Current Data

```typescript
const { products, loading, error, total } = useSelector(
  state => state.products
);
```

**Purpose**: Get latest data from Redux before rendering

**Pattern**: Access data just before render

---

### Stage 6: Conditional Rendering

```typescript
if (loading) return <SkeletonLoader />;
if (error) return <ErrorMessage />;
```

**Purpose**: Show appropriate UI based on state

**States to handle**:
- Loading: Show skeleton or spinner
- Error: Show error message with retry
- Empty: Show empty state message
- Success: Show normal content

---

### Stage 7: Main Content Rendering

```typescript
return (
  <ErrorBoundary>
    <Header />
    <div className="layout">
      <Sidebar />
      <main>
        {/* Page-specific content */}
      </main>
    </div>
    <Footer />
  </ErrorBoundary>
);
```

**Purpose**: Render the actual page content

**Pattern**: Wrap in ErrorBoundary, include layout components

---

## Performance Optimization Patterns

### Memoization

```typescript
import React from 'react';

const AdminDashboard = React.memo(() => {
  // Component logic
});

export default AdminDashboard;
```

Prevents unnecessary re-renders when parent component updates.

### Lazy Loading Pages

```typescript
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// In routes:
<Suspense fallback={<SkeletonLoader />}>
  <AdminDashboard />
</Suspense>
```

Code-splits pages for faster initial load.

### Memoizing Selectors

```typescript
import { useMemo } from 'react';

const AdminDashboard = () => {
  const { products, filters } = useSelector(state => state.products);
  
  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => /* filter logic */);
  }, [products, filters]);
};
```

---

## Error Handling Patterns

### Try-Catch Pattern

```typescript
try {
  await ProductService.deleteProduct(id);
  showSuccessMessage('Deleted!');
} catch (error) {
  showErrorMessage(error.message);
  console.error('Error:', error);
}
```

### Error Boundary

```typescript
return (
  <ErrorBoundary fallback={<ErrorPage />}>
    {/* Content */}
  </ErrorBoundary>
);
```

---

## Related Documentation

- [Overview](./overview.md) - Page structure and routing
- [Page Components](./components.md) - Individual page details
- [Authentication](./authentication.md) - Protected routes and access
- [Performance](./performance.md) - Optimization techniques
- [Testing](./testing.md) - Testing strategies

---

**Last Updated**: November 2025

