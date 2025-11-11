# Authentication Service (`auth.ts`)

## Purpose

Handles user login, JWT token extraction, and role-based authorization.

**Location**: `src/api/auth.ts`

---

## Primary Function: login()

### Signature

```typescript
async function login(username: string, password: string): Promise<{
  token: string;
  role: 'admin' | 'user';
  userId: string;
}>
```

### Process Flow

```mermaid
sequenceDiagram
    participant UI as LoginPage
    participant Service as auth.login()
    participant API as apiClient
    participant Backend as Backend /api/auth/login
    participant Storage as localStorage
    participant Redux as Redux Store

    UI->>Service: login('user@example.com', 'pass')
    Service->>API: POST with credentials
    API->>Backend: HTTP POST
    Backend->>Backend: Validate credentials
    Backend-->>API: {success, data: {token, role}}
    API-->>Service: Response
    Service->>Service: Decode JWT
    Service->>Service: Extract role from payload
    Service-->>UI: {token, role, userId}
    UI->>Storage: Save token
    UI->>Redux: dispatch(setUser)
    UI->>UI: Navigate to dashboard
```

### Implementation Example

```typescript
export const auth = {
  login: async (username: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        username,
        password,
      });
      
      const { token } = response.data;
      
      // Decode JWT to extract payload
      const decodedPayload = JSON.parse(
        atob(token.split('.')[1])
      );
      
      const role = decodedPayload.role;
      const userId = decodedPayload.sub;
      
      return { token, role, userId };
    } catch (error) {
      throw new Error('Login failed: Invalid credentials');
    }
  },
};
```

---

## JWT Token Structure

### Full JWT Format

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJ1c2VybmFtZSI6ImpvaG4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjEyMzQ1Njc4OTAsImV4cCI6MTIzNDU3MTQ5MH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Three Components

1. **Header**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

2. **Payload**
```json
{
  "sub": "user_123",
  "username": "john_doe",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234571490
}
```

3. **Signature**
```
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

---

## Token Decoding Logic

### Extract Payload

```typescript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJ1c2VybmFtZSI6ImpvaG4iLCJyb2xlIjoiYWRtaW4ifQ.signature";

// Split by dots
const parts = token.split('.');
const payload = parts[1];  // Middle part

// Decode Base64URL
const decodedPayload = JSON.parse(atob(payload));

console.log(decodedPayload);
// {
//   sub: "123",
//   username: "john",
//   role: "admin"
// }
```

### Extract Role

```typescript
const role = decodedPayload.role;  // 'admin' or 'user'
```

---

## Token Storage & Persistence

### Saving Token After Login

```typescript
// In LoginPage or similar
const { token, role } = await auth.login(username, password);

// Save to localStorage
localStorage.setItem('authToken', token);
localStorage.setItem('userRole', role);

// Update Redux
dispatch({
  type: 'SET_USER',
  payload: { token, role }
});
```

### Restoring Token on App Load

```typescript
// In App.tsx or root component
useEffect(() => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('userRole');
  
  if (token && role) {
    // Restore session
    dispatch({
      type: 'SET_USER',
      payload: { token, role }
    });
  }
}, [dispatch]);
```

---

## Logout

### Clear Token

```typescript
const logout = () => {
  // Remove from localStorage
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  
  // Update Redux
  dispatch({ type: 'LOGOUT' });
  
  // Navigate to login
  navigate('/login');
};
```

---

## Error Scenarios

### Invalid Credentials

```typescript
// Backend response
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "Username or password incorrect"
}

// Service throws
throw new Error('Invalid credentials');
```

### Network Error

```typescript
try {
  await auth.login(username, password);
} catch (error) {
  if (!error.response) {
    // Network error
    console.error('Network error - check connection');
  }
}
```

### Server Error

```typescript
// 500 response from server
// Propagate to UI for user to see
```

---

## Integration with apiClient

### Automatic Token Injection

After login, all subsequent requests automatically include token:

```typescript
// Login
const { token } = await auth.login(username, password);

// Save token
localStorage.setItem('authToken', token);

// Any subsequent apiClient call automatically includes:
// Authorization: "Bearer {token}"
const products = await apiClient.get('/api/products');
```

---

## Testing

### Mock Login

```typescript
vi.mock('@/api/auth', () => ({
  auth: {
    login: vi.fn().mockResolvedValue({
      token: 'fake-jwt-token',
      role: 'admin',
      userId: '123'
    })
  }
}));
```

### Test Token Extraction

```typescript
test('extracts role from JWT token', () => {
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYWRtaW4ifQ.signature';
  const payload = JSON.parse(atob(token.split('.')[1]));
  
  expect(payload.role).toBe('admin');
});
```

---

## Best Practices

### ✅ DO:

```typescript
// Decode token carefully
const payload = JSON.parse(atob(token.split('.')[1]));

// Check for token expiration
if (decodedPayload.exp < Date.now() / 1000) {
  // Token expired
  localStorage.removeItem('authToken');
  navigate('/login');
}

// Clear token on 401
apiClient interceptor handles this automatically
```

### ❌ DON'T:

```typescript
// Don't store passwords
localStorage.setItem('password', password);

// Don't trust token without backend validation
// Always verify on server side

// Don't expose token in logs
console.log('Token:', token);  // Bad!

// Don't ignore token expiration
// Check exp claim if implementing refresh tokens
```

---

## Related Documentation

- [HTTP Client Configuration](./client.md)
- [Error Handling & Security](./error-handling.md)
- [API Overview](./overview.md)
- [Testing API Layer](./testing.md)

---

**Last Updated**: November 2025

