# Page Components & Routes

## Overview

Nine main page components mapped to routes with specific purposes.

**Location**: `src/pages/`

---

## Page Component Mapping

| Page | Route | Purpose | Auth Required |
|------|-------|---------|-----------------|
| LoginPage | `/login` | User authentication | ❌ No |
| HomePage | `/` | Landing page | ❌ No |
| UserDashboard | `/dashboard` | User analytics & overview | ✅ Yes |
| ListStockPage | `/products` | Product inventory list | ✅ Yes |
| AddProductPage | `/products/add` | Create new product | ✅ Yes (Admin) |
| ChangeProductDetailsPage | `/products/:id/edit` | Modify product | ✅ Yes (Admin) |
| DeleteProductPage | `/products/:id/delete` | Remove product | ✅ Yes (Admin) |
| SearchProductPage | `/search` | Search products | ✅ Yes |
| AdminDashboard | `/admin` | Admin management | ✅ Yes (Admin) |

---

## Page Lifecycle

```
App.tsx
├── Router Setup
│   ├── Public Routes
│   │   ├── LoginPage
│   │   └── HomePage
│   │
│   └── Protected Routes
│       ├── ProtectedRoute wrapper
│       │   ├── Check authentication
│       │   ├── Check authorization
│       │   └── Render page or redirect
│       │
│       ├── UserDashboard
│       ├── ListStockPage
│       ├── SearchProductPage
│       ├── AdminDashboard (admin only)
│       ├── AddProductPage (admin only)
│       ├── ChangeProductDetailsPage (admin only)
│       └── DeleteProductPage (admin only)
```

---

## Detailed Page Components

### 1. LoginPage

**Purpose**: User authentication form

**Features**:
- Email/password input
- Form validation
- Error messages
- Remember me checkbox
- Language selector
- API integration

**Key Props**: None (route component)

**State Management**:
- Local form state (email, password)
- Redux: Set user on successful login

**API Calls**:
```typescript
await auth.login(email, password)
```

**Error Handling**:
- Invalid credentials
- Network errors
- Server errors

---

### 2. HomePage

**Purpose**: Landing page with product overview

**Features**:
- Welcome message
- Featured products
- Quick stats
- Call-to-action buttons
- Navigation hints

---

### 3. UserDashboard

**Purpose**: User-specific analytics and overview

**Features**:
- Statistics (total products, recent additions)
- Quick action cards
- Recent activity
- Search quick access
- Performance charts

**Data Requirements**:
- Product count
- Recent products
- User activity log

---

### 4. ListStockPage

**Purpose**: Complete product inventory display

**Features**:
- Product table with sorting
- Pagination
- Filtering by category
- Search integration
- Bulk actions
- Row actions (edit, delete, view)

**State**:
```typescript
interface ListStockState {
  products: Product[];
  filter: { category?: string };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}
```

**API Calls**:
- GET /api/products (with pagination)
- DELETE /api/products/:id
- PUT /api/products/stock/batch

---

### 5. AddProductPage

**Purpose**: Create new product form

**Features**:
- Form with validation
- Required field indicators
- Real-time validation feedback
- SKU uniqueness check
- Category dropdown
- Cancel & Save buttons

**Form Fields**:
- name (text, required)
- quantity (number, required, >= 0)
- category (select, required)
- sku (text, required, unique)
- price (number, required, > 0)
- description (textarea, optional)

**API Calls**:
```typescript
await ProductService.createProduct(formData)
```

---

### 6. ChangeProductDetailsPage

**Purpose**: Edit existing product

**Features**:
- Load product by ID
- Pre-populate form
- Validation
- Conflict handling
- Cancel & Save buttons

**URL Param**: `:id`

**Data Flow**:
1. Route with product ID
2. Fetch product details
3. Display in form
4. Submit updates
5. Navigate back to list

---

### 7. DeleteProductPage

**Purpose**: Product deletion confirmation

**Features**:
- Display product details
- Confirmation dialog
- Prevent accidental deletion
- Error handling
- Success redirection

**API Calls**:
```typescript
await ProductService.deleteProduct(productId)
```

**Confirmation Flow**:
1. Display product info
2. Show warning message
3. Request confirmation
4. Execute deletion
5. Redirect to product list

---

### 8. SearchProductPage

**Purpose**: Product search interface

**Features**:
- Search input with debouncing
- Real-time results
- Result filtering
- Result count
- Empty state handling

**API Calls**:
```typescript
const results = await ProductService.searchProducts(query)
```

**Search Scope**:
- Product name
- SKU
- Description
- Category

---

### 9. AdminDashboard

**Purpose**: Administrative management interface

**Features**:
- User management
- System statistics
- Configuration options
- Audit logs
- Bulk operations

**Sections**:
- Statistics overview
- User list with actions
- System health
- Recent activity

---

## Routing Configuration

### Router Setup

```typescript
// src/main.tsx or App.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public routes
      { path: 'login', element: <LoginPage /> },
      { path: '/', element: <HomePage /> },

      // Protected routes
      {
        path: '/dashboard',
        element: <ProtectedRoute><UserDashboard /></ProtectedRoute>
      },
      {
        path: '/products',
        element: <ProtectedRoute><ListStockPage /></ProtectedRoute>
      },
      {
        path: '/products/add',
        element: <ProtectedRoute adminOnly><AddProductPage /></ProtectedRoute>
      },
      {
        path: '/products/:id/edit',
        element: <ProtectedRoute adminOnly><ChangeProductDetailsPage /></ProtectedRoute>
      },
      {
        path: '/products/:id/delete',
        element: <ProtectedRoute adminOnly><DeleteProductPage /></ProtectedRoute>
      },
      {
        path: '/search',
        element: <ProtectedRoute><SearchProductPage /></ProtectedRoute>
      },
      {
        path: '/admin',
        element: <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
      }
    ]
  }
]);
```

---

## Common Page Patterns

### Pattern 1: Form Page (Add/Edit)

```typescript
const FormPage = () => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitForm(formData);
      navigate('/previous-page');
    } catch (error) {
      setErrors(error.response?.data?.details);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" isLoading={isSubmitting}>Save</Button>
    </form>
  );
};
```

### Pattern 2: List Page with Pagination

```typescript
const ListPage = () => {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        const data = await fetchItems({ page, limit: 20 });
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    loadItems();
  }, [page]);

  return (
    <>
      {loading ? <SkeletonLoader /> : <ItemList items={items} />}
      <Pagination page={page} onPageChange={setPage} />
    </>
  );
};
```

---

## Related Documentation

- **[Overview](./overview.md)** - Component architecture
- **[Shared Components](./shared-components.md)** - Reusable UI components
- **[Styling](./styling.md)** - CSS and design patterns
- **[Testing](./testing.md)** - Component testing strategies

---

**Last Updated**: November 2025

