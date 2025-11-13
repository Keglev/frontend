# CORS & CSRF Protection

## Overview

This document covers CORS (Cross-Origin Resource Sharing) validation and CSRF (Cross-Site Request Forgery) protection in StockEase Frontend. Note that StockEase uses a **cookie-less architecture** (token-based auth), which significantly reduces CSRF risk.

---

## CORS (Cross-Origin Resource Sharing)

### What is CORS?

CORS is a security mechanism that allows web pages to make requests to different domains.

**Problem CORS solves:**
```javascript
// Frontend at https://frontend.stockease.com
// Backend at https://api.stockease.com

// Browser blocks this by default (same-origin policy)
fetch('https://api.stockease.com/api/products')
// ❌ CORS Error: Access-Control-Allow-Origin missing
```

### How CORS Works

```
Frontend Request Flow:

Browser                    Frontend Server        Backend API
  │                             │                      │
  │ fetch('/api/products')      │                      │
  ├────────────────────────────>│                      │
  │                             │ GET /api/products    │
  │                             │ Origin: frontend.com │
  │                             │─────────────────────>│
  │                             │                      │
  │                             │ Check: Is origin     │
  │                             │ in allowed list?     │
  │                             │  ✓ Yes              │
  │                             │                      │
  │                             │ 200 OK               │
  │                             │ CORS Headers         │
  │                             │<─────────────────────┤
  │ Return response to JS       │                      │
  │<────────────────────────────┤                      │
```

### CORS Headers

**Request Headers (Browser Adds Automatically):**
```http
GET /api/products HTTP/1.1
Host: api.stockease.com
Origin: https://frontend.stockease.com
```

**Response Headers (Backend Must Send):**
```http
HTTP/1.1 200 OK

Access-Control-Allow-Origin: https://frontend.stockease.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

| Header | Purpose | Example |
|--------|---------|---------|
| `Access-Control-Allow-Origin` | Which origins allowed | `https://frontend.stockease.com` or `*` |
| `Access-Control-Allow-Methods` | Which HTTP methods allowed | `GET, POST, PUT, DELETE` |
| `Access-Control-Allow-Headers` | Which headers allowed | `Authorization, Content-Type` |
| `Access-Control-Allow-Credentials` | Allow cookies | `true` or omitted |
| `Access-Control-Max-Age` | Cache preflight response | `86400` (24 hours) |

### CORS Implementation in StockEase

**Frontend Side:**
```typescript
// src/services/apiClient.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 120000,
});

// Axios automatically includes Origin header
// Browser enforces CORS rules
// No frontend code needed for CORS validation
```

**Backend Side (Responsibility):**
```python
# Backend MUST validate CORS
# Frontend cannot control CORS enforcement

@app.route('/api/products', methods=['GET'])
def get_products():
    # Backend checks Origin header
    origin = request.headers.get('Origin')
    
    # If origin not in whitelist, don't add CORS headers
    if origin not in ALLOWED_ORIGINS:
        # No CORS headers → Browser blocks response
        return products, 200
    
    # If origin in whitelist, add CORS headers
    response = make_response(products, 200)
    response.headers['Access-Control-Allow-Origin'] = origin
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
    
    return response
```

### CORS Preflight Requests

For complex requests, browser sends preflight first:

**Preflight (OPTIONS) Request:**
```http
OPTIONS /api/products HTTP/1.1
Host: api.stockease.com
Origin: https://frontend.stockease.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type
```

**Backend Response:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://frontend.stockease.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Authorization, Content-Type
```

**Then Actual Request:**
```http
POST /api/products HTTP/1.1
Host: api.stockease.com
Origin: https://frontend.stockease.com
Authorization: Bearer token123
Content-Type: application/json

{ "name": "Product A" }
```

### CORS Issues & Solutions

#### Issue: CORS Error in Browser

**Symptom:**
```
Access to XMLHttpRequest at 'https://api.stockease.com/api/products'
from origin 'https://frontend.stockease.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causes:**
1. Backend not adding CORS headers
2. Origin not in backend's allowed list
3. Backend CORS configuration error

**Solution:**
```python
# Backend adds CORS headers
# Not frontend's responsibility
response.headers['Access-Control-Allow-Origin'] = 'https://frontend.stockease.com'
```

#### Issue: Preflight Fails

**Symptom:**
```
Response to preflight request doesn't pass CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Causes:**
- Backend doesn't handle OPTIONS requests
- Preflight response missing CORS headers

**Solution:**
```python
# Handle OPTIONS request
@app.route('/api/products', methods=['OPTIONS', 'POST'])
def options_products():
    if request.method == 'OPTIONS':
        response = make_response('', 204)
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin')
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
        return response
    
    # Handle POST...
```

### Testing CORS

**Using curl:**
```bash
# Send preflight
curl -i -X OPTIONS https://api.stockease.com/api/products \
  -H "Origin: https://frontend.stockease.com" \
  -H "Access-Control-Request-Method: GET"

# Should see:
# Access-Control-Allow-Origin: https://frontend.stockease.com
# Access-Control-Allow-Methods: GET
```

**In Browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Look for OPTIONS requests (preflight)
4. Check response headers for CORS headers

---

## CSRF (Cross-Site Request Forgery)

### What is CSRF?

CSRF is an attack where a malicious website tricks a user into making requests to another site where they're logged in.

**Example Attack:**
```
User logs into https://stockease.com
User has valid session/token

User visits malicious website: https://evil.com

Evil website contains:
<form action="https://stockease.com/api/products" method="POST">
  <input name="name" value="Malware Product">
  <input type="hidden" name="csrf_token" value="fake">
</form>
<script>
  document.forms[0].submit();  // Auto-submit form
</script>

Browser automatically includes user's session cookies with request
Request is processed as if user intentionally made it
Attacker successfully created product under user's account
```

### CSRF Protection Methods

#### Method 1: SameSite Cookies (Modern)

**Browser enforces this automatically:**
```http
Set-Cookie: session=xyz; SameSite=Strict; HttpOnly
```

**How it works:**
- `SameSite=Strict` — Cookie never sent to cross-origin requests
- `SameSite=Lax` — Cookie sent on top-level navigation only
- `SameSite=None` — Cookie sent everywhere (requires Secure flag)

**Protection:**
```
evil.com submits form to stockease.com
Browser sees: Cookie from stockease.com
Check: Is this a same-site request? NO
Action: Don't send cookie
Result: Request fails (no authentication)
```

#### Method 2: CSRF Tokens (Traditional)

**Without tokens:**
```html
<form action="/api/products" method="POST">
  <input name="name" value="Product">
</form>
```

**With tokens:**
```html
<form action="/api/products" method="POST">
  <input name="name" value="Product">
  <input type="hidden" name="csrf_token" value="unique-random-token">
</form>
```

**How it works:**
1. Server generates unique token per session
2. Server embeds token in form
3. User submits form with token
4. Server verifies token matches session
5. If token missing/invalid, request rejected

**Why it works:**
```
Attacker can see form HTML
But attacker cannot read CSRF token
Token is unique to victim's session
Attacker submits without valid token
Request fails
```

### CSRF Protection in StockEase

**Current Implementation: Token-Based Auth**

StockEase uses JWT tokens (not cookies):
```typescript
// Authentication via Authorization header
Authorization: Bearer jwt-token-123

// Stored in localStorage (not cookies)
localStorage.setItem('token', jwtToken);
```

**Why this is CSRF-safe:**
1. Tokens not auto-sent (unlike cookies)
2. Tokens stored in JavaScript (localStorage)
3. Attacker cannot access localStorage from different domain
4. Request must include header with token

**CSRF Attack Attempt:**
```javascript
// Attacker tries to make request to stockease.com
// From evil.com

fetch('https://stockease.com/api/products', {
  method: 'POST',
  body: JSON.stringify({ name: 'Malware' })
})

// ❌ Fails because:
// 1. Token not in Authorization header
// 2. Browser blocks CORS (no CORS headers from backend)
// 3. Request cannot access localStorage from evil.com

// ❌ Result: Request fails, attack prevented
```

### When CSRF Still Applies (If Using Cookies)

**If backend switches to cookies:**
```http
Set-Cookie: session=abc123; Path=/; HttpOnly
```

**Then CSRF tokens would be needed:**
```html
<form action="/api/products" method="POST">
  <input type="hidden" name="csrf_token" value="xyz-token">
</form>
```

**Or SameSite attribute:**
```http
Set-Cookie: session=abc123; SameSite=Strict; HttpOnly
```

### Testing CSRF Protection

**Current Setup (Token-Based):**
```typescript
// Simulate CSRF attack from console on evil.com
// Try to submit to stockease.com

// This will fail:
fetch('https://stockease.com/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Attack' })
})

// Fails because:
// 1. Authorization header missing
// 2. CORS blocks (origin doesn't match)
// ✅ Safe
```

**If Switched to Cookies:**
```html
<!-- Create form with CSRF token -->
<form action="https://stockease.com/api/products" method="POST">
  <input name="csrf_token" value="random-token-from-backend">
  <input name="name" value="Malware">
  <button type="submit">Click me</button>
</form>

<!-- Attacker cannot get csrf_token from backend -->
<!-- Request without token fails -->
```

---

## Securing API Requests

### Safe Request Pattern (Current Implementation)

```typescript
// 1. Store token in localStorage after login
localStorage.setItem('token', jwtToken);

// 2. Request interceptor attaches token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Backend validates token signature
// 4. Backend checks CORS origin
// 5. Backend processes request

// ✅ CSRF Safe because:
// - Token required in header (not auto-sent)
// - Attacker cannot read localStorage (XSS protected)
// - Attacker cannot forge token (backend validates signature)
```

### Request Validation Checklist

Frontend ensures:
- ✅ Token included in Authorization header
- ✅ Content-Type header set correctly
- ✅ Request timeout configured (120 seconds)

Backend ensures:
- ✅ Token signature valid
- ✅ Origin in allowed list
- ✅ Method allowed for endpoint
- ✅ User has required role
- ✅ CSRF token valid (if using cookies)

---

## Best Practices

### ✅ DO:

- ✅ Keep JWT tokens short-lived
- ✅ Use HTTPS everywhere
- ✅ Validate CORS on backend
- ✅ Use Authorization header (not cookies if possible)
- ✅ Implement SameSite cookies if using cookies
- ✅ Validate token signature on backend
- ✅ Check user role/permissions on backend
- ✅ Use specific allowed origins (not `*`)
- ✅ Monitor CORS violations

### ❌ DON'T:

- ❌ Use `Access-Control-Allow-Origin: *` with credentials
- ❌ Trust client-side origin validation
- ❌ Allow unlimited origins
- ❌ Skip backend CORS validation
- ❌ Store tokens in cookies without SameSite
- ❌ Skip CSRF token validation (if using cookies)
- ❌ Make token lifetime too long
- ❌ Log tokens in error messages

---

## Related Files

- **API Client:** `src/services/apiClient.ts`
- **Auth Service:** `src/api/auth.ts`
- **nginx Config:** `ops/nginx/nginx.conf`
- **Error Handling:** See [API Security](../api-communication/api-security.md)
- **XSS Prevention:** See [XSS & Sanitization](./xss-and-sanitization.md)

---

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP CORS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Origin_Resource_Sharing_Cheat_Sheet.html)
- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [SameSite Cookie Explained](https://web.dev/samesite-cookies-explained/)

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready (Token-Based)  
**Note:** CSRF risk is minimal due to token-based authentication architecture
