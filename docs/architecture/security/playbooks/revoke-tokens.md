# Token Revocation & Forced Logout Playbook

## Overview

Token revocation is the process of invalidating JWT tokens before their natural expiration. This playbook documents when and how to force logout users by revoking their active tokens in StockEase Frontend.

---

## When to Revoke Tokens

### Critical Security Incidents

#### 1. **Suspected Account Compromise**
```
Scenario: User's password is suspected compromised
├─ User reports unusual login activity
├─ Multiple failed login attempts detected
├─ Account shows activity from unexpected locations
└─ Action: Revoke all tokens immediately
```

**Steps:**
1. Force user logout on all devices
2. Invalidate all issued tokens
3. Require password reset before re-login
4. Send security alert to user email

#### 2. **Data Breach**
```
Scenario: Application security incident with potential token exposure
├─ JWT tokens leaked in logs
├─ Database breach with token storage
├─ Client-side token exposure (XSS)
└─ Action: Revoke tokens for affected users
```

**Steps:**
1. Identify affected users
2. Batch revoke their tokens
3. Force re-authentication
4. Rotate signing keys (see key-rotation.md)

#### 3. **Unauthorized Access**
```
Scenario: Unauthorized user actions detected
├─ Admin account used without authorization
├─ Unusual API calls from user token
├─ Permission escalation detected
└─ Action: Revoke suspect token immediately
```

**Steps:**
1. Terminate active session
2. Revoke all tokens for affected user
3. Log security incident
4. Notify user of suspicious activity

### Planned Maintenance

#### 4. **Policy Changes**
```
Scenario: Security policy updated requiring re-authentication
├─ MFA now required
├─ Permission levels changed
├─ Role assignments modified
└─ Action: Revoke tokens to enforce new policy
```

**Steps:**
1. Notify users of upcoming change
2. Set revocation date/time
3. Batch revoke tokens
4. Users automatically redirect to login

#### 5. **Account Deletion**
```
Scenario: User account is deleted or suspended
├─ User requests account deletion
├─ Account suspended for policy violation
├─ Employee terminated (HR system)
└─ Action: Revoke all tokens immediately
```

**Steps:**
1. Immediately terminate all sessions
2. Revoke all issued tokens
3. Delete or archive account data
4. Update audit logs

### Operational Changes

#### 6. **Role or Permission Changes**
```
Scenario: User role or permissions are modified
├─ User promoted/demoted
├─ Permission level changed
├─ Department transfer
└─ Action: Revoke token to force re-authentication with new permissions
```

**Steps:**
1. Update user role in database
2. Revoke all tokens for user
3. User forced to re-login
4. New token issued with updated claims

---

## Current Token Architecture

### Token Storage in StockEase

**Location:** `localStorage.token`

```javascript
// From src/services/apiClient.ts
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

**Token Lifecycle:**
```
1. Login → Backend generates JWT → Frontend stores in localStorage
2. API Request → Request interceptor attaches Bearer token
3. Response → Response interceptor checks status
4. 401 Error → Response interceptor removes token (cleanup)
5. Token Expired → Frontend redirect to login
6. Logout → Frontend removes token from localStorage
```

### Current Logout Implementation

**File:** `src/services/apiClient.ts`

```javascript
// Response interceptor
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

**How it works:**
1. Backend returns 401 (Unauthorized)
2. Frontend interceptor removes token
3. User redirected to login page
4. Effectively logs user out ✅

**Limitation:** This requires server to reject the token. If token is still valid in backend, user can reuse it if:
- Request doesn't trigger 401 response
- Token is cached in browser memory
- localStorage is not fully cleared

---

## Forced Logout Implementation

### Option 1: Server-Side Token Blacklist (Recommended)

**Concept:**
```
Backend maintains list of revoked tokens
Frontend presents token
Backend checks: "Is this token in revoked list?"
├─ Yes → Reject request (401)
└─ No → Accept request (200)
```

**Implementation:**

**Backend (Node.js example):**
```javascript
// Redis cache for revoked tokens
const redis = require('redis');
const client = redis.createClient();

// On token revocation request
app.post('/auth/revoke', authMiddleware, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.decode(token);
  
  // Add token to revoked list
  // TTL = token expiration time (prevents memory leak)
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  await client.setex(`revoked_${token}`, ttl, '1');
  
  res.json({ success: true, message: 'Token revoked' });
});

// In JWT verification middleware
const verifyToken = async (token) => {
  const isRevoked = await client.get(`revoked_${token}`);
  if (isRevoked) {
    throw new Error('Token has been revoked');
  }
  return jwt.verify(token, secret);
};
```

**Frontend (StockEase):**
```typescript
// src/services/apiClient.ts - Add revocation endpoint
export async function revokeToken(): Promise<void> {
  try {
    await axios.post('/auth/revoke', {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  } finally {
    // Clear local storage regardless of response
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }
}

// Usage in logout
export function logout(): void {
  revokeToken();
}
```

**Advantages:**
- ✅ Immediate invalidation
- ✅ Works across all sessions
- ✅ Prevents token reuse
- ✅ Secure and reliable

**Disadvantages:**
- ⚠️ Requires backend changes
- ⚠️ Uses backend resources (Redis/cache)
- ⚠️ Need to manage TTL expiration

---

### Option 2: Distributed Cache Invalidation

**Concept:**
```
Multiple backend servers share revoked token list
├─ Server A revokes token
├─ Writes to distributed cache (Redis/Memcached)
├─ All servers check same cache
└─ Token invalidated everywhere
```

**Implementation:**

```javascript
// Backend - Redis distributed cache
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB
});

// Revoke token endpoint
app.post('/auth/revoke', authMiddleware, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  
  // Publish revocation event to all servers
  await client.publish('token_revoked', JSON.stringify({
    token: token,
    userId: decoded.sub,
    timestamp: new Date().toISOString()
  }));
  
  // Store in revoked list
  await client.setex(`revoked_${token}`, ttl, JSON.stringify({
    userId: decoded.sub,
    revokedAt: new Date().toISOString()
  }));
  
  res.json({ success: true, message: 'Token revoked' });
});
```

**Advantages:**
- ✅ Works across distributed systems
- ✅ Real-time propagation
- ✅ Scalable to many servers

**Disadvantages:**
- ⚠️ Complex infrastructure
- ⚠️ Requires Redis/Memcached setup
- ⚠️ Network latency

---

### Option 3: Client-Side Only (Current - Limited)

**Concept:**
```
Frontend removes token from localStorage
├─ Token invalidated in browser
├─ But remains valid on backend
└─ If leaked/cached, can still be used
```

**Current Implementation:**

```typescript
// src/services/apiClient.ts
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  window.location.href = '/login';
}
```

**Limitations:**
- ❌ Token still valid on backend
- ❌ Cached token can be reused
- ❌ No protection against token theft
- ❌ Not suitable for security incidents

**Use Case:**
- Normal user-initiated logout only
- Not for security incidents

---

## Forced Logout Workflow

### User-Initiated Logout (Current)

```
User clicks "Logout"
        ↓
logout() called
        ↓
Remove token from localStorage
Remove username from localStorage
Remove role from localStorage
        ↓
Redirect to /login
        ↓
User must re-login
```

**File:** `src/services/apiClient.ts`

**Current Code:**
```typescript
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  window.location.href = '/login';
}
```

### Admin-Initiated Revocation (Recommended)

```
Admin revokes user token
        ↓
Backend receives revoke request
        ↓
Add token to blacklist (Redis)
        ↓
Publish revocation event
        ↓
If user online:
  ├─ Next API call returns 401
  ├─ Frontend interceptor removes token
  └─ User redirected to login
        ↓
User must re-authenticate
```

**Implementation Steps:**

**1. Backend Revocation Endpoint**
```javascript
POST /auth/revoke
Headers: { Authorization: 'Bearer <token>' }
Body: { userId?: '<user-id>' } // Optional: revoke other user

Response: { success: true, message: 'Token revoked' }
```

**2. Frontend Logout Component**
```typescript
// src/services/apiClient.ts
export async function revokeAndLogout(): Promise<void> {
  try {
    await axios.post('/auth/revoke', {});
  } catch (error) {
    console.error('Revocation failed:', error);
  } finally {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    
    // Redirect to login
    window.location.href = '/login';
  }
}
```

**3. Component Usage**
```typescript
// In logout button handler
import { revokeAndLogout } from '../services/apiClient';

<button onClick={revokeAndLogout}>
  Logout
</button>
```

---

## Batch Token Revocation

### Scenario: Security Incident

**Use Case:** Revoke tokens for multiple users after data breach

**Backend Implementation:**

```javascript
// POST /auth/revoke-batch (admin only)
app.post('/auth/revoke-batch', adminAuth, async (req, res) => {
  const { userIds, reason } = req.body;
  
  if (!userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: 'userIds must be array' });
  }
  
  try {
    // Find all tokens for these users
    const tokens = await Token.find({ userId: { $in: userIds } });
    
    // Add to revocation list
    for (const token of tokens) {
      const decoded = jwt.decode(token.token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      
      await redis.setex(
        `revoked_${token.token}`,
        ttl,
        JSON.stringify({
          userId: token.userId,
          reason: reason,
          revokedAt: new Date().toISOString(),
          revokedBy: req.user.id
        })
      );
    }
    
    // Log security incident
    await AuditLog.create({
      action: 'BATCH_TOKEN_REVOCATION',
      userIds: userIds,
      reason: reason,
      count: tokens.length,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: `Revoked ${tokens.length} tokens for ${userIds.length} users`,
      tokensRevoked: tokens.length
    });
  } catch (error) {
    console.error('Batch revocation error:', error);
    res.status(500).json({ error: 'Batch revocation failed' });
  }
});
```

**Frontend Admin Panel:**

```typescript
import axios from 'axios';

async function batchRevokeTokens(userIds: string[], reason: string): Promise<void> {
  try {
    const response = await axios.post('/auth/revoke-batch', {
      userIds,
      reason
    });
    
    console.log(`Revoked ${response.data.tokensRevoked} tokens`);
    alert(`Successfully revoked tokens for ${userIds.length} users`);
  } catch (error) {
    console.error('Batch revocation failed:', error);
    alert('Failed to revoke tokens');
  }
}

// Usage
await batchRevokeTokens(
  ['user1', 'user2', 'user3'],
  'Security incident - potential data breach'
);
```

---

## Monitoring & Verification

### Verify Token Revocation

**Check if token is revoked:**

```bash
# Using curl
curl -X GET https://api.stockease.com/auth/verify \
  -H "Authorization: Bearer <token>"

# If token is revoked:
# Response: 401 Unauthorized

# If token is valid:
# Response: 200 OK { "valid": true, "userId": "..." }
```

**Check revoked token count:**

```bash
# Redis CLI
redis-cli keys "revoked_*" | wc -l

# Expected: Number of revoked tokens in cache
```

### Audit Logging

**Log all revocation events:**

```typescript
// After revocation
await logAuditEvent({
  action: 'TOKEN_REVOKED',
  timestamp: new Date(),
  userId: revokedUserId,
  initiator: initiatorId,
  reason: revocationReason,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

**Audit Trail Example:**
```
2025-11-13T14:32:15Z | TOKEN_REVOKED | user123 | admin456 | Security incident | 192.168.1.100
2025-11-13T14:35:42Z | TOKEN_REVOKED | user456 | user456 | User logout | 10.0.0.50
2025-11-13T15:01:08Z | BATCH_TOKEN_REVOCATION | users: [u1,u2,u3] | admin789 | Data breach response | 203.0.113.42
```

---

## Checklist for Token Revocation

### ✅ Before Implementing

- [ ] Decide on revocation method (server-side blacklist recommended)
- [ ] Set up Redis or caching system
- [ ] Plan token TTL management
- [ ] Define revocation audit logging
- [ ] Determine who can revoke tokens (admins only)
- [ ] Test revocation flow end-to-end

### ✅ During Implementation

- [ ] Create backend revocation endpoint
- [ ] Update frontend logout function
- [ ] Add revocation to response interceptor
- [ ] Implement batch revocation for incidents
- [ ] Add audit logging for all revocations
- [ ] Test with live tokens

### ✅ After Implementation

- [ ] Monitor revocation metrics
- [ ] Test security incident response
- [ ] Verify tokens are actually invalidated
- [ ] Check audit logs for completeness
- [ ] Document revocation procedures
- [ ] Train team on emergency procedures

---

## Common Issues & Solutions

### Issue 1: Token Still Works After Revocation

**Problem:** User is revoked but can still access API

**Cause:** Backend not checking revocation list

**Solution:**
```javascript
// Ensure middleware checks revocation
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  // Check if revoked FIRST
  const isRevoked = await redis.get(`revoked_${token}`);
  if (isRevoked) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }
  
  // Then verify signature
  const decoded = jwt.verify(token, SECRET);
  req.user = decoded;
  next();
};
```

### Issue 2: Redis Not Connected

**Problem:** Revocation endpoint fails, tokens not actually revoked

**Cause:** Redis connection issue

**Solution:**
```javascript
// Add retry logic
const redis = require('redis');
const client = redis.createClient({
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis connection failed');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Fallback: Use database instead of Redis
const revokeToken = async (token) => {
  if (redisAvailable) {
    await redis.setex(`revoked_${token}`, ttl, '1');
  } else {
    await RevokedToken.create({ token, expiresAt });
  }
};
```

### Issue 3: Revocation List Memory Leak

**Problem:** Redis keeps growing, memory runs out

**Cause:** Not setting TTL on revoked tokens

**Solution:**
```javascript
// Always set TTL = token expiration time
const decoded = jwt.decode(token);
const expirationTime = decoded.exp * 1000; // Convert to ms
const ttl = Math.ceil((expirationTime - Date.now()) / 1000); // Seconds

// Only cache until token would expire anyway
await redis.setex(`revoked_${token}`, ttl, '1');
```

---

## Related Documentation

- **JWT Tokens:** See [JWT Token Handling](../auth/jwt-tokens.md)
- **Authentication:** See [Authentication Flow](../auth/authentication.md)
- **Key Rotation:** See [Key Rotation & Rollout](./key-rotation.md)
- **API Security:** See [API Communication Security](../api-communication/api-security.md)

---

**Last Updated:** November 13, 2025  
**Status:** Recommended Implementation  
**Priority:** High (Security Incident Response)  
**Maintainer:** Security Team
