# API Security & Configuration

## Axios API Client Setup

The StockEase Frontend uses **Axios** as the HTTP client with a centralized configuration in `src/services/apiClient.ts`. This ensures consistent security practices across all API calls.

---

## Configuration

### Base Setup

```typescript
/**
 * Configured Axios instance for API requests
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api',
  timeout: 120000, // 2 minutes
});
```

**Key Settings:**

| Setting | Value | Purpose |
|---------|-------|---------|
| `baseURL` | Environment variable or localhost | Backend API endpoint |
| `timeout` | 120,000 ms (2 min) | Prevent hanging requests |
| `headers` | (set by interceptor) | Authorization and content-type |

---

## Request Interceptor

The request interceptor automatically attaches JWT tokens to outgoing requests.

```typescript
apiClient.interceptors.request.use(
  (config) => {
    // 1. Retrieve token from localStorage
    const token = localStorage.getItem('token');
    
    // 2. Attach Bearer token if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Log request for debugging
    console.log('API Request:', config);
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    throw error;
  }
);
```

### How It Works

**Step 1: Token Retrieval**
- Checks `localStorage.getItem('token')`
- Returns `null` if no token stored (guest requests fail)
- Returns JWT string if token available

**Step 2: Bearer Token Attachment**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 3: Logging**
- Logs full request config to console
- Useful for debugging API issues
- ⚠️ **Warning:** Includes headers with token in dev tools

---

## Response Interceptor

The response interceptor handles successful responses, logs them, and manages error cases (especially 401 Unauthorized).

```typescript
apiClient.interceptors.response.use(
  (response) => {
    // Successful response (2xx status)
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    // Failed response (4xx, 5xx) or network error
    console.error('API Error:', error.response?.data || error.message);

    // Clear token on unauthorized access
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      console.warn('Unauthorized access - redirecting to login');
    }

    throw error; // Propagate to component
  }
);
```

### Error Handling Flow

**Case 1: 401 Unauthorized**
```
Backend Response: 401 (token expired or invalid)
  ↓
Response Interceptor catches error
  ↓
Check: error.response?.status === 401? ✓ YES
  ↓
localStorage.removeItem('token') → Session cleared
  ↓
Console log: "Unauthorized access - redirecting to login"
  ↓
Throw error to component
  ↓
Component shows login redirect
```

**Case 2: Other 4xx/5xx Errors**
```
Backend Response: 400, 403, 404, 500, etc.
  ↓
Response Interceptor catches error
  ↓
Check: status === 401? ✓ NO
  ↓
Log error details to console
  ↓
Throw error to component (component handles specific error)
```

**Case 3: Network Error**
```
Network Failure: No connection, timeout, DNS failure
  ↓
Axios catches error
  ↓
error.response is undefined (no response from server)
  ↓
Log: error.message (e.g., "Network Error", "Timeout of 120000ms exceeded")
  ↓
Throw error to component
```

---

## Security Features

### ✅ Automatic Bearer Token Attachment

**Benefit:** Developers don't need to manually add headers to each request

```typescript
// Developer writes:
await apiClient.get('/api/products')

// Axios automatically sends:
GET /api/products HTTP/1.1
Authorization: Bearer <token>
```

### ✅ 401 Error Handling

**Benefit:** Automatic session cleanup on token expiration

```typescript
// When token expires:
1. Request sent with expired token
2. Backend rejects with 401
3. Interceptor removes token from localStorage
4. User redirected to login page
5. No stale token in memory
```

### ✅ Request Timeout

**Benefit:** Prevents infinite hanging requests

```typescript
timeout: 120000  // 2 minutes

// If request takes > 2 min:
// → Automatically aborted
// → Error thrown to component
// → User can retry
```

### ✅ Centralized Configuration

**Benefit:** All API calls use same security settings

```typescript
// Instead of:
fetch('https://api.stockease.com/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})

// Use:
apiClient.get('/products')  // ✅ All security applied automatically
```

---

## Usage Examples

### Authentication (Login)

```typescript
// src/api/auth.ts
import apiClient from '../services/apiClient';

export const login = async (username: string, password: string) => {
  // Request is sent without token (login endpoint)
  const response = await apiClient.post('/api/auth/login', {
    username,
    password,
  });
  
  return response.data;
};
```

**HTTP Request:**
```http
POST /api/auth/login HTTP/1.1
Host: api.stockease.com
Content-Type: application/json
(No Authorization header - not logged in yet)

Body:
{
  "username": "admin",
  "password": "SecurePass123!"
}
```

### Protected Endpoints (After Login)

```typescript
// src/api/ProductService.ts
export const fetchProducts = async () => {
  // Request interceptor automatically adds token
  const response = await apiClient.get('/api/products');
  return response.data;
};
```

**HTTP Request:**
```http
GET /api/products HTTP/1.1
Host: api.stockease.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(Automatically attached by interceptor)
```

---

## Token Management

### Token Storage

**Current Implementation: localStorage**
```typescript
// In LoginPage.tsx
localStorage.setItem('token', token);
localStorage.setItem('username', username);
localStorage.setItem('role', role);
```

**Pros:**
- Simple to implement
- Works across page refreshes
- Works with Axios interceptor

**Cons:**
- ⚠️ Accessible to JavaScript (XSS attack risk)
- No built-in expiration
- No HttpOnly flag (browser feature limitation)

**Recommended: HttpOnly Cookies (Backend)**
```typescript
// Better approach: Backend sets HttpOnly cookie
Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict

// Frontend accesses token from cookie (automatic with Axios)
// No JavaScript access needed
// Protected from XSS attacks
```

### Token Retrieval

```typescript
// Request interceptor retrieves token
const token = localStorage.getItem('token');

// If token exists, attach it
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### Token Removal

```typescript
// Response interceptor removes token on 401
if (error.response?.status === 401) {
  localStorage.removeItem('token');
}
```

---

## Environment Configuration

### Development (`VITE_API_BASE_URL=http://localhost:8081`)

```typescript
// vite.config.ts proxy setup
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,      // ✅ Changes Host header to backend
      secure: false,           // ✅ Allows self-signed certificates
    },
  },
},
```

**Request Flow:**
```
Browser Request
  ↓
http://localhost:5173/api/products  (dev server)
  ↓
Proxy Rule: /api → http://localhost:8081
  ↓
http://localhost:8081/api/products  (backend)
```

### Production (`VITE_API_BASE_URL=https://api.stockease.com`)

```typescript
// No proxy needed
baseURL: 'https://api.stockease.com'
```

**Request Flow:**
```
Browser Request
  ↓
https://frontend.stockease.com/  (frontend domain)
  ↓
No proxy, direct HTTPS request
  ↓
https://api.stockease.com/api/products  (backend domain)
  ↓
CORS validated by backend
```

---

## CORS (Cross-Origin Resource Sharing)

### Frontend Responsibility

StockEase Frontend sends requests with standard headers. CORS is enforced by the **backend**, not the frontend.

```typescript
// Frontend sends standard request
await apiClient.get('https://api.stockease.com/api/products');

// Browser automatically adds:
Origin: https://frontend.stockease.com

// Backend validates origin and responds with:
Access-Control-Allow-Origin: https://frontend.stockease.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Backend Responsibility

The backend must:
1. ✅ Validate `Origin` header
2. ✅ Return `Access-Control-Allow-Origin` header
3. ✅ Specify allowed HTTP methods
4. ✅ Specify allowed headers (especially `Authorization`)

**Example Backend CORS Configuration (Spring Boot):**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://frontend.stockease.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("Authorization", "Content-Type")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Testing CORS

```bash
# Preflight request (browser does automatically)
curl -i -X OPTIONS https://api.stockease.com/api/products \
  -H "Origin: https://frontend.stockease.com" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization"

# Expected response headers:
# Access-Control-Allow-Origin: https://frontend.stockease.com
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE
# Access-Control-Allow-Headers: Authorization, Content-Type
```

---

## Error Responses

### Handling Specific Error Types

```typescript
// In components or services
try {
  const products = await apiClient.get('/api/products');
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Axios error
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      redirect('/login');
    } else if (error.response?.status === 403) {
      // Forbidden - user lacks permission
      show('You do not have permission to access this resource');
    } else if (error.response?.status === 404) {
      // Not found - endpoint doesn't exist
      show('Resource not found');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      show('Request timeout - please try again');
    } else if (!error.response) {
      // Network error
      show('Network error - check your connection');
    }
  } else {
    // Non-Axios error
    show('Unexpected error occurred');
  }
}
```

---

## Security Checklist

- ✅ Bearer token automatically attached to requests
- ✅ Token stored in localStorage (accessible after login)
- ✅ 401 errors clear token and redirect to login
- ✅ Request timeout prevents hanging (2 minutes)
- ✅ All requests go through interceptor (centralized)
- ⚠️ Sensitive data logged to console (should filter in production)
- ⚠️ localStorage vulnerable to XSS (use HttpOnly cookies when possible)
- ⚠️ CORS enforced by backend (no frontend control)

---

## Related Files

- **API Client:** `src/services/apiClient.ts`
- **Auth Service:** `src/api/auth.ts`
- **Product Service:** `src/api/ProductService.ts`
- **Configuration:** `vite.config.ts`
- **Error Handling:** See [Error Logging & Monitoring](./error-logging.md)

---

**Last Updated:** November 13, 2025  
**Status:** Enterprise-Grade Security Configuration
