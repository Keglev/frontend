# Authorization & Access Control

## Overview

Authorization determines **what an authenticated user can do**. This document explains:
- Role-based access control (RBAC) in StockEase
- How permissions are enforced
- Protecting routes and endpoints
- Error handling and security considerations

---

## Role-Based Access Control (RBAC)

### Roles in StockEase

StockEase implements a two-tier role system:

| Role | Description | Permissions |
|------|-------------|-------------|
| **ROLE_ADMIN** | Administrator | Full system access, manage users, view all products, system settings |
| **ROLE_USER** | Regular User | Limited access, view own products, basic operations |

### Where Roles Come From

**1. During Login:**
```typescript
// Backend returns JWT with role
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ROLE_ADMIN"  // Backend determines this
}
```

**2. Frontend Extracts Role:**
```typescript
// Login service extracts from JWT
const decodedPayload = JSON.parse(atob(token.split('.')[1]));
const role = decodedPayload.role;

// Store for later use
localStorage.setItem('role', role);
```

**3. Backend Assigns Role:**
```python
# Backend database stores user role
class User:
  id: int
  username: str
  email: str
  password_hash: str
  role: str  # "ROLE_ADMIN" or "ROLE_USER"

# When issuing token
payload = {
  'user': user.username,
  'role': user.role,  # From database
  'exp': datetime.utcnow() + timedelta(hours=24)
}
```

---

## Frontend Authorization

### Route Protection

**Using Protected Routes Component:**

```typescript
// In App.tsx
interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiredRole
}) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // No token = not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Has required role requirement?
  if (requiredRole && role !== requiredRole) {
    return <ErrorPage status={403} message="Forbidden" />;
  }

  // Authorized, render component
  return element;
};

// Define routes
const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/user',
    element: <ProtectedRoute element={<UserDashboard />} />
  },
  {
    path: '/admin',
    element: <ProtectedRoute 
      element={<AdminDashboard />} 
      requiredRole="ROLE_ADMIN"
    />
  }
]);
```

**Route Protection Flow:**
```
User visits /admin
  ↓
ProtectedRoute checks: Do we have token?
  ├─ No → Redirect to /login
  └─ Yes → Continue
  ↓
ProtectedRoute checks: Do we have required role?
  ├─ No role required → Render component
  ├─ Role required → Check if user has it
    ├─ Yes → Render component
    └─ No → Show 403 error page
```

### Component-Level Authorization

**Conditionally Render Admin Features:**

```typescript
import { useAuth } from '@hooks/useAuth';

const UserDashboard: React.FC = () => {
  const { role, username } = useAuth();

  return (
    <div>
      <h1>Welcome {username}</h1>

      {/* All users see this */}
      <ProductList />

      {/* Only admins see this */}
      {role === 'ROLE_ADMIN' && (
        <AdminSection>
          <UserManagement />
          <SystemSettings />
        </AdminSection>
      )}
    </div>
  );
};
```

### useAuth Hook

**Implementation:**

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';

interface AuthContext {
  isAuthenticated: boolean;
  role: 'ROLE_ADMIN' | 'ROLE_USER' | null;
  username: string | null;
  logout: () => void;
}

export const useAuth = (): AuthContext => {
  const [auth, setAuth] = useState<AuthContext>({
    isAuthenticated: false,
    role: null,
    username: null,
    logout: () => {}
  });

  useEffect(() => {
    // Read from localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    setAuth({
      isAuthenticated: !!token,
      role: (role as any) || null,
      username: username || null,
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '/login';
      }
    });
  }, []);

  return auth;
};
```

**Usage:**
```typescript
const { isAuthenticated, role, username, logout } = useAuth();

// Check authentication
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}

// Check specific role
if (role === 'ROLE_ADMIN') {
  // Show admin features
}

// Logout
<button onClick={logout}>Logout</button>
```

---

## Backend Authorization

### Endpoint Protection

**Backend must verify authorization on every request:**

```python
from functools import wraps
from flask import request, jsonify

def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get Authorization header
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'Missing Authorization header'}), 401
            
            try:
                # Extract token
                token = auth_header.replace('Bearer ', '')
                
                # Verify signature and decode
                payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                
                # Check role
                if payload['role'] != required_role:
                    return jsonify({'error': 'Forbidden'}), 403
                
                # Token valid and authorized, call endpoint
                return f(*args, **kwargs)
            
            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Token expired'}), 401
            except jwt.InvalidSignatureError:
                return jsonify({'error': 'Invalid token'}), 401
        
        return decorated_function
    return decorator

# Usage:
@app.route('/api/admin/users', methods=['GET'])
@require_role('ROLE_ADMIN')  # Only admins can access
def get_all_users():
    return jsonify(users)

@app.route('/api/products', methods=['GET'])
def get_products():  # Anyone authenticated can access
    # (no @require_role, so token just needs to be valid)
    return jsonify(products)
```

### Permission Levels

**Common approach:**

```python
# Level 0: Public endpoint (no auth required)
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

# Level 1: Authenticated users (any role)
@app.route('/api/products', methods=['GET'])
def get_products():
    # Require valid token
    token = verify_token(request)  # Raises 401 if invalid
    return jsonify(products)

# Level 2: Specific role required
@app.route('/api/admin/settings', methods=['GET'])
@require_role('ROLE_ADMIN')
def get_settings():
    return jsonify(settings)

# Level 3: Multiple roles allowed
@app.route('/api/reports', methods=['GET'])
@require_any_role(['ROLE_ADMIN', 'ROLE_MANAGER'])
def get_reports():
    return jsonify(reports)
```

---

## Permission Matrix

### StockEase Permissions

```
Endpoint                      ROLE_USER   ROLE_ADMIN
─────────────────────────────────────────────────────
GET /api/products             ✅           ✅
POST /api/products            ✅*          ✅
PUT /api/products/{id}        ✅*          ✅
DELETE /api/products/{id}     ✅*          ✅
GET /api/admin/users          ❌           ✅
POST /api/admin/users         ❌           ✅
PUT /api/admin/users/{id}     ❌           ✅
DELETE /api/admin/users/{id}  ❌           ✅
GET /api/admin/logs           ❌           ✅
POST /api/admin/settings      ❌           ✅
```

**Key:**
- ✅ = Allowed
- ❌ = Forbidden (403 error)
- ✅* = Allowed but restricted (e.g., can only modify own products)

### Resource-Level Authorization

**Users can only modify their own products:**

```python
@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    # Get user from token
    token = verify_token(request)
    user_id = token['user_id']
    
    # Get product from database
    product = Product.query.get(product_id)
    
    # Check ownership (unless admin)
    if product.user_id != user_id and token['role'] != 'ROLE_ADMIN':
        return jsonify({'error': 'Forbidden'}), 403
    
    # User owns product or is admin, update allowed
    product.update(request.json)
    return jsonify(product)
```

**Flow:**
```
User (ID: 5) tries to update product (ID: 123, owner: ID: 5)
  ↓
Backend checks: product.user_id (5) == user_id (5)?
  ├─ Yes → Allow update
  └─ No → Check is_admin?
    ├─ Yes → Allow update
    └─ No → Return 403 Forbidden
```

---

## Error Handling

### Authentication Errors (401)

**When:** Token is missing, invalid, or expired

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Causes:**
- No Authorization header
- Invalid token signature
- Expired token
- Malformed token

**Frontend response:**
```typescript
// In API response interceptor
if (error.response?.status === 401) {
  // Clear session
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  
  // Redirect to login
  navigate('/login');
}
```

### Authorization Errors (403)

**When:** User is authenticated but doesn't have required role

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Insufficient privileges"
}
```

**Causes:**
- User role doesn't match endpoint requirement
- User trying to access admin feature
- User trying to modify another user's resource

**Frontend response:**
```typescript
// Show error to user
if (error.response?.status === 403) {
  setError('You do not have permission to access this resource');
}

// In ProtectedRoute
if (requiredRole && role !== requiredRole) {
  return <ErrorPage status={403} message="Forbidden" />;
}
```

---

## Common Patterns

### Pattern 1: Owner or Admin

**Allow if user owns resource OR is admin:**

```typescript
const canModifyProduct = (
  product: Product,
  currentUserId: string,
  userRole: string
): boolean => {
  // Owner can modify
  if (product.userId === currentUserId) {
    return true;
  }
  
  // Admin can modify
  if (userRole === 'ROLE_ADMIN') {
    return true;
  }
  
  // Otherwise, cannot modify
  return false;
};
```

**Usage:**
```typescript
if (canModifyProduct(product, currentUserId, userRole)) {
  // Show edit button
  <button onClick={editProduct}>Edit</button>
} else {
  // Hide edit button
}
```

### Pattern 2: Role-Based Feature Flags

**Show features based on role:**

```typescript
const features = {
  canViewReports: role === 'ROLE_ADMIN',
  canManageUsers: role === 'ROLE_ADMIN',
  canDeleteProducts: role === 'ROLE_ADMIN',
  canViewProductStats: role === 'ROLE_ADMIN' || role === 'ROLE_USER'
};

// Usage
{features.canViewReports && <ReportsSection />}
{features.canManageUsers && <UserManagement />}
```

### Pattern 3: Conditional API Calls

**Only make API call if authorized:**

```typescript
const fetchAdminData = async () => {
  const role = localStorage.getItem('role');
  
  if (role !== 'ROLE_ADMIN') {
    setError('Not authorized');
    return;
  }
  
  try {
    const data = await apiClient.get('/api/admin/data');
    setData(data);
  } catch (error) {
    // Handle 403 Forbidden
  }
};
```

---

## Security Best Practices

### ✅ DO:

- ✅ Always verify token on backend
- ✅ Always check role on backend
- ✅ Check ownership of resources
- ✅ Log authorization failures
- ✅ Use clear role names
- ✅ Fail securely (default to deny)
- ✅ Validate on both frontend and backend
- ✅ Clear token on logout

### ❌ DON'T:

- ❌ Rely only on frontend authorization
- ❌ Trust client-provided role information
- ❌ Skip authorization checks
- ❌ Use vague permission names
- ❌ Fail open (default to allow)
- ❌ Store passwords with roles
- ❌ Change role in localStorage
- ❌ Share tokens between users

### Additional Safeguards

**1. Don't Trust Frontend Authorization:**
```typescript
// ❌ WRONG: Trust frontend
const role = localStorage.getItem('role');
if (role === 'ROLE_ADMIN') {
  // This could be faked!
}

// ✅ CORRECT: Backend verifies
const response = await apiClient.get('/api/admin/users');
// Backend checks token and role
```

**2. Implement Rate Limiting:**
```python
# Backend: Limit API calls per user
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: get_current_user_id())

@app.route('/api/products', methods=['GET'])
@limiter.limit('100 per hour')  # Max 100 requests per hour
def get_products():
    return products
```

**3. Audit Authorization Failures:**
```python
# Backend: Log failed authorization attempts
def log_auth_failure(user_id, endpoint, reason):
    AuthLog.create(
        user_id=user_id,
        endpoint=endpoint,
        reason=reason,
        timestamp=datetime.utcnow()
    )

# Usage
@app.route('/api/admin/users')
def admin_endpoint():
    if role != 'ROLE_ADMIN':
        log_auth_failure(user_id, '/api/admin/users', 'insufficient_privileges')
        return {'error': 'Forbidden'}, 403
```

---

## Testing Authorization

### Frontend Tests

```typescript
// Test protected route redirects unauthorized users
describe('ProtectedRoute', () => {
  it('redirects to login if no token', () => {
    localStorage.removeItem('token');
    
    render(<ProtectedRoute element={<AdminPage />} />);
    
    expect(screen.getByText('redirected to')).toHaveTextContent('/login');
  });

  it('shows forbidden if role not matching', () => {
    localStorage.setItem('token', 'valid-token');
    localStorage.setItem('role', 'ROLE_USER');  // Not admin
    
    render(
      <ProtectedRoute 
        element={<AdminPage />} 
        requiredRole="ROLE_ADMIN"
      />
    );
    
    expect(screen.getByText('Forbidden')).toBeInTheDocument();
  });
});
```

### Backend Tests

```python
# Test endpoint authorization
def test_admin_endpoint_requires_admin_role():
    # User token
    user_token = create_token(role='ROLE_USER')
    
    response = client.get(
        '/api/admin/users',
        headers={'Authorization': f'Bearer {user_token}'}
    )
    
    assert response.status_code == 403
    assert 'Forbidden' in response.json['error']

def test_admin_endpoint_allows_admin():
    # Admin token
    admin_token = create_token(role='ROLE_ADMIN')
    
    response = client.get(
        '/api/admin/users',
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    
    assert response.status_code == 200
```

---

## Troubleshooting

### Issue: User sees 403 Forbidden on Admin Page

**Possible causes:**
1. User role is not 'ROLE_ADMIN'
2. Token doesn't contain role claim
3. Backend doesn't recognize role

**Solution:**
```typescript
// Check what role is stored
console.log('Stored role:', localStorage.getItem('role'));

// Check JWT token contents
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Token role:', decoded.role);

// They should match
// If not, the issue is during login
```

### Issue: Admin can't access protected endpoint

**Possible causes:**
1. Token not being sent in request
2. Authorization header malformed
3. Backend not recognizing token

**Solution:**
```typescript
// Check if Authorization header is being sent
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Sending token:', token.substring(0, 20) + '...');
  }
  return config;
});

// Check network tab in DevTools
// Look for Authorization: Bearer ... header
```

---

## Related Files

- **Protected Routes:** `src/App.tsx`
- **Auth Hook:** `src/hooks/useAuth.ts`
- **Login Page:** `src/pages/LoginPage.tsx`
- **Admin Dashboard:** `src/pages/AdminDashboard.tsx`
- **API Client:** `src/services/apiClient.ts`
- **Auth Service:** `src/api/auth.ts`

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready
