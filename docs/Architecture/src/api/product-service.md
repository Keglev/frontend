# Product Service (`ProductService.ts`)

## Purpose

Provides all product-related API operations including CRUD, search, filtering, and batch operations.

**Location**: `src/api/ProductService.ts`

---

## Core Methods

### 1. Get All Products

```typescript
async getProducts(options?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}): Promise<Product[]>
```

**Data Flow**:
```
Frontend → apiClient.get('/api/products') → Product[] → Store
```

**Example**:
```typescript
const products = await ProductService.getProducts({
  page: 1,
  limit: 20,
  sortBy: 'name',
  order: 'asc'
});
```

### 2. Get Product by ID

```typescript
async getProductById(id: string): Promise<Product>
```

**Usage**:
```typescript
const product = await ProductService.getProductById('prod-123');

// Returns
{
  id: 'prod-123',
  name: 'Laptop',
  quantity: 45,
  category: 'Electronics',
  sku: 'LAP-001',
  price: 999.99,
  description: 'High-performance laptop',
  lastUpdated: '2024-11-20T10:30:00Z'
}
```

### 3. Create Product

```typescript
async createProduct(productData: Omit<Product, 'id'>): Promise<Product>
```

**Request Body**:
```json
{
  "name": "New Product",
  "quantity": 100,
  "category": "Electronics",
  "sku": "NEW-001",
  "price": 49.99,
  "description": "Product description"
}
```

**Response**:
```json
{
  "id": "prod-789",
  "name": "New Product",
  "quantity": 100,
  "category": "Electronics",
  "sku": "NEW-001",
  "price": 49.99,
  "description": "Product description",
  "createdAt": "2024-11-20T10:45:00Z"
}
```

### 4. Update Product

```typescript
async updateProduct(id: string, updates: Partial<Product>): Promise<Product>
```

**Example**:
```typescript
const updated = await ProductService.updateProduct('prod-123', {
  quantity: 50,
  price: 899.99
});
```

**Endpoint**: `PUT /api/products/prod-123`

### 5. Delete Product

```typescript
async deleteProduct(id: string): Promise<void>
```

**Endpoint**: `DELETE /api/products/prod-123`

**Response**: HTTP 204 No Content

### 6. Search Products

```typescript
async searchProducts(query: string): Promise<Product[]>
```

**Example**:
```typescript
const results = await ProductService.searchProducts('laptop');

// Searches across: name, description, SKU, category
```

---

## Batch Operations

### 6. Batch Update Stock

```typescript
async updateStock(updates: Array<{
  productId: string;
  quantity: number;
}>): Promise<Product[]>
```

**Request**:
```json
{
  "updates": [
    { "productId": "prod-123", "quantity": 50 },
    { "productId": "prod-456", "quantity": 30 },
    { "productId": "prod-789", "quantity": 100 }
  ]
}
```

**Endpoint**: `PUT /api/products/stock/batch`

### 7. Bulk Delete

```typescript
async deleteProducts(ids: string[]): Promise<void>
```

**Request**:
```json
{
  "ids": ["prod-123", "prod-456", "prod-789"]
}
```

---

## Service Implementation

### Complete ProductService Class

```typescript
export class ProductService {
  private static baseUrl = '/api/products';

  static async getProducts(options?: any): Promise<Product[]> {
    const response = await apiClient.get(this.baseUrl, { params: options });
    return response.data;
  }

  static async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  static async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    const response = await apiClient.post(this.baseUrl, data);
    return response.data;
  }

  static async updateProduct(
    id: string,
    updates: Partial<Product>
  ): Promise<Product> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, updates);
    return response.data;
  }

  static async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  static async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get(
      `${this.baseUrl}/search`,
      { params: { q: query } }
    );
    return response.data;
  }
}
```

---

## Error Handling

### Common Errors

```typescript
try {
  await ProductService.createProduct(data);
} catch (error) {
  if (error.response?.status === 400) {
    // Validation error - missing required fields
    console.error(error.response.data.message);
  } else if (error.response?.status === 409) {
    // Conflict - SKU already exists
    console.error('Product SKU already exists');
  } else if (error.response?.status === 500) {
    // Server error
    console.error('Failed to create product');
  }
}
```

### Validation Errors

```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Invalid product data",
  "details": [
    { "field": "name", "message": "Name is required" },
    { "field": "quantity", "message": "Quantity must be >= 0" }
  ]
}
```

---

## Real-World Usage Patterns

### In Components

```typescript
// AddProductPage.tsx
const handleAddProduct = async (formData: ProductFormData) => {
  try {
    const newProduct = await ProductService.createProduct(formData);
    dispatch(setProducts([...products, newProduct]));
    showSuccessNotification(`Product "${newProduct.name}" added`);
  } catch (error) {
    showErrorNotification(error.response?.data?.message);
  }
};
```

### With Pagination

```typescript
const [page, setPage] = useState(1);
const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
  ProductService.getProducts({
    page,
    limit: 20,
    sortBy: 'name',
    order: 'asc'
  }).then(setProducts);
}, [page]);
```

### Stock Management

```typescript
const updateMultipleStocks = async (items: CartItem[]) => {
  const updates = items.map(item => ({
    productId: item.id,
    quantity: item.quantity - item.requestedQuantity
  }));
  
  await ProductService.updateStock(updates);
};
```

---

## Performance Considerations

### Caching

Cache products to avoid repeated API calls:

```typescript
const [cache, setCache] = useState<Map<string, Product>>(new Map());

const getProduct = async (id: string) => {
  if (cache.has(id)) {
    return cache.get(id);
  }
  
  const product = await ProductService.getProductById(id);
  setCache(new Map(cache).set(id, product));
  return product;
};
```

### Pagination

Always paginate large result sets:

```typescript
// Good
await ProductService.getProducts({ limit: 20, page: 1 });

// Bad - fetches all products at once
await ProductService.getProducts();
```

### Request Debouncing

Debounce search requests:

```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    ProductService.searchProducts(query);
  }, 300),
  []
);
```

---

## Testing

### Mock Service

```typescript
vi.mock('@/api/ProductService', () => ({
  ProductService: {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn()
  }
}));
```

### Test Example

```typescript
test('creates product successfully', async () => {
  const newProductData = {
    name: 'Test Product',
    quantity: 10,
    category: 'Test',
    sku: 'TEST-001',
    price: 19.99,
    description: 'Test description'
  };

  vi.mocked(ProductService.createProduct).mockResolvedValue({
    id: 'prod-123',
    ...newProductData,
    createdAt: '2024-11-20T10:00:00Z'
  });

  const result = await ProductService.createProduct(newProductData);
  
  expect(result.id).toBe('prod-123');
  expect(result.name).toBe('Test Product');
});
```

---

## Data Contract

### Product Type

```typescript
interface Product {
  id: string;
  name: string;
  quantity: number;
  category: string;
  sku: string;
  price: number;
  description: string;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

**Constraints**:
- `name`: Required, max 255 characters
- `quantity`: Required, must be >= 0
- `sku`: Required, unique, max 50 characters
- `price`: Required, must be > 0
- `category`: Required from predefined list
- `description`: Optional, max 1000 characters

---

## Related Documentation

- [HTTP Client Configuration](./client.md)
- [Authentication Service](./auth.md)
- [Error Handling & Security](./error-handling.md)
- [API Overview](./overview.md)

---

**Last Updated**: November 2025

