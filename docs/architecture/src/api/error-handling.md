# Error Handling & Security

## Purpose

Document API error patterns, security best practices, and token management strategies.

**Location**: Part of `src/api/` architecture

---

## Error Categories

### 1. Client Errors (4xx)

#### 400 Bad Request
- **Cause**: Invalid request format, missing required fields
- **Example**: Creating product without name
- **Handling**: Display field-level validation errors to user

```typescript
catch (error) {
  if (error.response?.status === 400) {
    const details = error.response.data.details;
    details.forEach(err => {
      showFieldError(err.field, err.message);
    });
  }
}
```

#### 401 Unauthorized
- **Cause**: Token missing, expired, or invalid
- **Example**: Making request without valid JWT
- **Handling**: Redirect to login, clear session

```typescript
catch (error) {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    navigate('/login');
    showNotification('Session expired. Please login again.');
  }
}
```

#### 403 Forbidden
- **Cause**: Insufficient permissions for resource
- **Example**: User trying to delete when only admin can
- **Handling**: Show permission denied message

```typescript
catch (error) {
  if (error.response?.status === 403) {
    showNotification('You do not have permission for this action');
  }
}
```

#### 404 Not Found
- **Cause**: Resource doesn't exist
- **Example**: Accessing deleted product
- **Handling**: Navigate away or show not found page

```typescript
catch (error) {
  if (error.response?.status === 404) {
    showNotification('Product not found');
    navigate('/products');
  }
}
```

#### 409 Conflict
- **Cause**: Conflict with existing data
- **Example**: SKU already exists
- **Handling**: Show conflict message with suggestions

```typescript
catch (error) {
  if (error.response?.status === 409) {
    showNotification(error.response.data.message);
  }
}
```

### 2. Server Errors (5xx)

#### 500 Internal Server Error
- **Cause**: Unhandled exception on server
- **Handling**: Show generic error, retry option

```typescript
catch (error) {
  if (error.response?.status >= 500) {
    showNotification('Server error. Please try again later.');
    logToSentry(error);  // Send to monitoring
  }
}
```

#### 503 Service Unavailable
- **Cause**: Server maintenance or overloaded
- **Handling**: Show maintenance message

```typescript
catch (error) {
  if (error.response?.status === 503) {
    showNotification('Service temporarily unavailable. Please try again.');
  }
}
```

### 3. Network Errors

#### No Response
- **Cause**: Network failure, server unreachable
- **Handling**: Show offline message

```typescript
catch (error) {
  if (!error.response) {
    showNotification('Network error. Check your connection.');
  }
}
```

---

## Error Response Format

### Standard Error Response

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable message",
  "timestamp": "2024-11-20T10:30:00Z",
  "path": "/api/products"
}
```

### With Validation Details

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid product data",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "quantity",
      "message": "Quantity must be >= 0"
    }
  ]
}
```

### With Error Context

```json
{
  "success": false,
  "error": "DUPLICATE_SKU",
  "message": "SKU already exists",
  "context": {
    "existingProductId": "prod-123",
    "existingProductName": "Laptop"
  }
}
```

---

## Security Best Practices

### 1. Token Management

#### Secure Storage
```typescript
// ✅ Good: Use httpOnly cookie (set by server)
// Server sets: Set-Cookie: authToken=...; HttpOnly; Secure; SameSite=Strict

// ✅ Good: Use sessionStorage for sensitive tokens
sessionStorage.setItem('authToken', token);

// ❌ Bad: localStorage is vulnerable to XSS
localStorage.setItem('authToken', token);  // Don't do this

// ❌ Bad: In-memory without persistence
// User loses token on refresh
```

#### Token Injection
```typescript
// ✅ Good: Automatic via interceptor
// apiClient interceptor adds: Authorization: Bearer {token}

// ❌ Bad: Manual token injection
const response = await axios.get(url, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### Token Expiration Check
```typescript
// ✅ Good: Check expiration before use
const isTokenExpired = (token: string) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expirationTime = payload.exp * 1000;  // Convert to ms
  return Date.now() > expirationTime;
};

if (isTokenExpired(token)) {
  // Request new token or redirect to login
  refreshToken();
}

// ❌ Bad: Trust token without checking expiration
```

### 2. Request Validation

#### Input Sanitization
```typescript
// ✅ Good: Validate before sending
const validateProductName = (name: string): boolean => {
  return name && name.trim().length > 0 && name.length <= 255;
};

if (!validateProductName(productName)) {
  showError('Invalid product name');
  return;
}

// ❌ Bad: Send raw user input
await ProductService.createProduct({
  name: userInput  // Could contain malicious data
});
```

#### CSRF Protection
```typescript
// ✅ Good: Server validates CSRF token
// Request includes CSRF token from form or header
// Server verifies token matches session

// apiClient automatically includes CSRF token from meta tag
const csrfToken = document.querySelector(
  'meta[name="csrf-token"]'
)?.getAttribute('content');
```

### 3. Response Validation

#### Validate Data Type
```typescript
// ✅ Good: Validate response structure
interface Product {
  id: string;
  name: string;
  quantity: number;
}

const validateProduct = (data: any): data is Product => {
  return (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.quantity === 'number'
  );
};

const response = await apiClient.get('/api/products');
if (!validateProduct(response.data)) {
  throw new Error('Invalid response format');
}
```

#### Size Limits
```typescript
// ✅ Good: Check response size
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;  // 10MB
if (response.headers['content-length'] > MAX_RESPONSE_SIZE) {
  throw new Error('Response too large');
}
```

### 4. Sensitive Data Handling

#### Never Log Tokens
```typescript
// ❌ Bad: Token exposed in logs
console.log('Authenticating with token:', authToken);
console.log(response.data);  // If contains token

// ✅ Good: Mask sensitive data
console.log('Authenticated successfully');
console.log({
  ...response.data,
  token: '[REDACTED]'
});
```

#### Never Send Passwords
```typescript
// ❌ Bad: Password in headers
const response = await apiClient.post('/api/auth/login', {
  username,
  password  // Sent in request body (over HTTPS)
});

// ✅ Good: Use HTTPS + secure session
// 1. Send credentials over HTTPS only
// 2. Server returns opaque session token
// 3. Store token securely
// 4. Use token for subsequent requests
```

---

## Response Interceptor Error Handling

### Implementation

```typescript
apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    
    switch (status) {
      case 401:
        // Unauthorized - token invalid/expired
        handleUnauthorized();
        break;
      case 403:
        // Forbidden - insufficient permissions
        handleForbidden();
        break;
      case 404:
        // Not found
        handleNotFound();
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server errors
        handleServerError(status);
        break;
      default:
        // Generic error
        handleGenericError(error);
    }
    
    return Promise.reject(error);
  }
);
```

### handleUnauthorized

```typescript
const handleUnauthorized = () => {
  // Clear stored credentials
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  
  // Clear Redux state
  dispatch({ type: 'LOGOUT' });
  
  // Redirect to login
  window.location.href = '/login';
};
```

---

## Testing Error Scenarios

### Mock Error Response

```typescript
test('handles 401 unauthorized', async () => {
  vi.mocked(apiClient.get).mockRejectedValue({
    response: {
      status: 401,
      data: { message: 'Token expired' }
    }
  });

  try {
    await ProductService.getProducts();
    fail('Should have thrown error');
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});
```

### Test Validation Error

```typescript
test('validates product name', async () => {
  vi.mocked(apiClient.post).mockRejectedValue({
    response: {
      status: 400,
      data: {
        details: [
          { field: 'name', message: 'Name is required' }
        ]
      }
    }
  });

  await expect(
    ProductService.createProduct(invalidData)
  ).rejects.toThrow();
});
```

---

## Related Documentation

- [HTTP Client Configuration](./client.md)
- [Authentication Service](./auth.ts)
- [Product Service](./product-service.md)
- [API Overview](./overview.md)
- [API Testing](./testing.md)

---

**Last Updated**: November 2025

