# Authentication Flow & Implementation

## Overview

This document provides a detailed technical walkthrough of the StockEase authentication system, including the login process, JWT token handling, and credential validation.

---

## Login Component (`src/pages/LoginPage.tsx`)

### Component Structure

```typescript
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
```

**State Variables:**
- `username` — User input for username/email
- `password` — User input for password
- `loading` — Shows skeleton loader during API call
- `error` — Error message to display (401, network, etc.)

### Auto-Redirect for Logged-In Users

```typescript
useEffect(() => {
  const role = localStorage.getItem('role');
  if (role) {
    navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
  }
}, [navigate]);
```

**Logic:**
1. Check if user already has a role in localStorage
2. If logged in → redirect to dashboard (no need to login again)
3. If not logged in → show login page

**Benefits:**
- Prevents users from seeing login page after refresh if session active
- Automatically routes to correct dashboard based on role
- `replace: true` removes login page from browser history

### Login Submission Handler

```typescript
const handleLogin = async () => {
  // Step 1: Validate input
  if (!username || !password) {
    setError(t('login.error.emptyFields'));
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Step 2: Call auth service
    const response = await login(username, password);
    const { token, role } = response;

    // Step 3: Store credentials
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);

    // Step 4: Navigate to dashboard
    navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
  } catch (err) {
    setLoading(false);
    
    // Step 5: Handle errors
    if (axios.isAxiosError(err)) {
      setError(
        err.response?.status === 401
          ? t('login.error.invalidCredentials')
          : t('login.error.unexpectedError')
      );
    } else {
      setError(t('login.error.unexpectedError'));
    }
  }
};
```

**Execution Flow:**
```
Step 1: Input Validation
  └─ Check username and password not empty
  └─ If empty, show error and exit

Step 2: API Call to Backend
  └─ POST /api/auth/login with { username, password }
  └─ Backend validates credentials in database
  └─ Backend returns JWT token or 401 error

Step 3: Store Session Data
  └─ localStorage.setItem('token', jwt)
  └─ localStorage.setItem('role', 'ROLE_ADMIN' or 'ROLE_USER')
  └─ localStorage.setItem('username', username)

Step 4: Navigate to Dashboard
  └─ If admin → /admin
  └─ If user → /user

Step 5: Error Handling
  └─ 401 error → "Invalid credentials"
  └─ Network error → "Unexpected error"
  └─ Show error message to user
```

---

## Auth Service (`src/api/auth.ts`)

### Login Function

```typescript
export const login = async (
  username: string,
  password: string
): Promise<{ token: string; role: string }> => {
  // POST credentials to backend
  const response = await apiClient.post<LoginResponse>(
    '/api/auth/login',
    { username, password }
  );

  // Validate response
  if (!response.data.success) {
    throw new Error(response.data.message || 'Login failed');
  }

  // Extract JWT token
  const token = response.data.data;

  // Decode JWT payload to get role
  const decodedPayload = JSON.parse(atob(token.split('.')[1]));
  const role = decodedPayload.role;

  return { token, role };
};
```

### Step-by-Step Breakdown

#### 1. API Request

```typescript
const response = await apiClient.post<LoginResponse>(
  '/api/auth/login',
  { username, password }
);
```

**What happens:**
- Axios sends POST request to `/api/auth/login`
- Request body: `{ "username": "admin", "password": "SecurePass123!" }`
- Request headers: `Content-Type: application/json`
- No Authorization header (not authenticated yet)

**Backend expectation:**
```http
POST /api/auth/login HTTP/1.1
Host: api.stockease.com
Content-Type: application/json

{
  "username": "admin",
  "password": "SecurePass123!"
}
```

#### 2. Response Validation

```typescript
if (!response.data.success) {
  throw new Error(response.data.message || 'Login failed');
}
```

**Expected response format:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiUk9MRV9BRE1JTiIsImV4cCI6MTczMjEzOTIwMH0...."
}
```

**Error cases:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Axios Interceptor will also:**
- Return `error.response?.status === 401` for invalid credentials
- Caught in LoginPage and shown as "Invalid credentials"

#### 3. JWT Token Extraction

```typescript
const token = response.data.data;
// token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiUk9MRV9BRE1JTiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
```

**JWT Structure (3 parts separated by `.`):**
```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (algorithm, type)
.
eyJ1c2VyIjoiYWRtaW4iLCJyb2xlIjoiUk9MRV9BRE1JTiJ9  ← Payload (claims)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (backend verifies)
```

#### 4. Payload Decoding

```typescript
const decodedPayload = JSON.parse(atob(token.split('.')[1]));
// atob() = "Ascii to Binary" = base64 decode
// token.split('.')[1] = the middle part (payload)

// Decoded:
// {
//   "user": "admin",
//   "role": "ROLE_ADMIN",
//   "exp": 1732139200,
//   "iat": 1732052800
// }
```

**⚠️ Security Note:**
- Payload is Base64 encoded, **NOT encrypted**
- Visible to anyone who has the token
- **Never put secrets in JWT payload**
- Backend verifies signature using secret key (not done in frontend)

#### 5. Role Extraction

```typescript
const role = decodedPayload.role;
// role = "ROLE_ADMIN" or "ROLE_USER"

return { token, role };
```

---

## Complete Login Sequence Diagram

```
Browser                    Frontend App           Backend API
  │                              │                      │
  │ User clicks Login            │                      │
  ├─────────────────────────────>│                      │
  │                              │                      │
  │ Show Login Form              │                      │
  │<─────────────────────────────┤                      │
  │                              │                      │
  │ User enters credentials      │                      │
  │ Clicks "Login" button        │                      │
  ├─────────────────────────────>│                      │
  │                              │                      │
  │                              │ POST /api/auth/login │
  │                              │ {username, password} │
  │                              │─────────────────────>│
  │                              │                      │
  │                              │  Database lookup     │
  │                              │  Verify password     │
  │                              │  Generate JWT        │
  │                              │                      │
  │                              │ 200 OK               │
  │                              │ {token: "jwt..."}    │
  │                              │<─────────────────────┤
  │                              │                      │
  │                              │ Decode JWT           │
  │                              │ Extract role         │
  │                              │ Store in localStorage│
  │                              │                      │
  │ Show Dashboard               │                      │
  │<─────────────────────────────┤                      │
  │                              │                      │
  │ Request /api/products        │                      │
  ├─────────────────────────────>│                      │
  │                              │                      │
  │                              │ GET /api/products    │
  │                              │ Authorization: Bearer│
  │                              │─────────────────────>│
  │                              │                      │
  │ Display products             │ 200 OK               │
  │<──────────────────────────────<─────────────────────┤
  │                              │                      │
```

---

## Error Scenarios

### Scenario 1: Invalid Credentials (401)

```typescript
// User enters wrong password
POST /api/auth/login
{ "username": "admin", "password": "WrongPassword123!" }

← 401 Unauthorized
{ "success": false, "message": "Invalid credentials" }

// LoginPage catches error:
if (axios.isAxiosError(err) && err.response?.status === 401) {
  setError(t('login.error.invalidCredentials'));  // "Invalid credentials"
}
```

**User sees:** ❌ "Invalid credentials or account locked"

### Scenario 2: Empty Field Validation

```typescript
// User doesn't enter password
handleLogin() called
  ↓
Check: !password? → TRUE
  ↓
setError('Fields are required')
  ↓
Return early (don't call API)

// No API request made, immediate feedback
```

**User sees:** ❌ "Please fill in all fields"

### Scenario 3: Network Error

```typescript
// User loses internet connection
POST /api/auth/login
  ↓
Network timeout after 120 seconds
  ↓
error.code === 'ECONNABORTED'
error.response === undefined (no response from server)
  ↓
setError('Unexpected error')
```

**User sees:** ❌ "An unexpected error occurred"

---

## Password Security & Validation

### Frontend Validation (UX)

```typescript
// In login form, validate password requirements
export const validatePassword = (password: string) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Must contain lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Must contain digit');
  }
  if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Must contain special character');
  }

  return { valid: errors.length === 0, errors };
};
```

**Requirements:**
- 8+ characters minimum
- At least 1 UPPERCASE letter
- At least 1 lowercase letter
- At least 1 digit (0-9)
- At least 1 special character (!@#$%^&* etc.)

### Backend Validation (Security)

Backend **must also validate**:
- ✅ Password against hash in database (bcrypt/scrypt)
- ✅ Account not locked (failed login attempts)
- ✅ Account not suspended
- ✅ Password meets complexity requirements

### Password Best Practices

✅ **DO:**
- ✅ Enforce complexity requirements
- ✅ Hash passwords with bcrypt/scrypt (backend)
- ✅ Never log passwords
- ✅ Use HTTPS for transmission
- ✅ Implement rate limiting (max 5 failed attempts)
- ✅ Implement account lockout (30 min after failures)

❌ **DON'T:**
- ❌ Send password in subsequent requests
- ❌ Store password in localStorage
- ❌ Display password requirements on submit (show during input)
- ❌ Transmit over HTTP (use HTTPS only)
- ❌ Use weak hashing (MD5, SHA1)
- ❌ Store plaintext passwords

---

## Token Lifetime

### Token Generation

```
Backend generates JWT with expiration:

Header: { alg: "HS256", typ: "JWT" }
Payload: {
  user: "admin",
  role: "ROLE_ADMIN",
  iat: 1732052800,  ← Issued at (current time)
  exp: 1732139200   ← Expires in 24 hours
}
Signature: HMAC-SHA256(header.payload, secret)
```

### Token Expiration

**Current Implementation:**
- No automatic refresh
- Token expires after backend-defined duration (usually 24 hours)
- Expired token causes 401 error
- User must login again

**Process:**
```
User makes request with expired token
  ↓
Backend returns: 401 Unauthorized (token expired)
  ↓
Response interceptor: localStorage.removeItem('token')
  ↓
User redirected to login page
  ↓
User must re-authenticate
```

**Recommended Future Enhancement:**
```typescript
// Implement refresh token mechanism
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const newToken = await refreshToken();
      
      if (newToken) {
        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config);
      } else {
        // Refresh failed, logout
        localStorage.removeItem('token');
      }
    }
    throw error;
  }
);
```

---

## Security Considerations

### Secure:
- ✅ Credentials sent only during login (not stored/reused)
- ✅ Token sent via Authorization header (not in URL)
- ✅ Token transmitted over HTTPS (encrypted in transit)
- ✅ Backend verifies JWT signature
- ✅ 401 errors trigger automatic logout

### Improvements Needed:
- ⚠️ localStorage accessible to JavaScript (XSS risk)
- ⚠️ No HttpOnly cookies (cannot mitigate XSS completely)
- ⚠️ No automatic token refresh (user must relogin when expired)
- ⚠️ No rate limiting on frontend (backend responsibility)
- ⚠️ No account lockout on frontend (backend responsibility)

### Recommendations:
1. **Use HttpOnly Cookies** (if possible with backend support)
2. **Implement Token Refresh** (reduce token lifetime)
3. **Add Rate Limiting** (backend, limit failed attempts)
4. **Implement Account Lockout** (backend, after N failed attempts)
5. **Add CSRF Protection** (if using cookies)

---

## Related Files

- **Login Component:** `src/pages/LoginPage.tsx`
- **Auth Service:** `src/api/auth.ts`
- **API Client:** `src/services/apiClient.ts`
- **App Routes:** `src/App.tsx`
- **Password Validation:** `src/__tests__/utils/validation-rules/auth-validation.test.ts`

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready Implementation
