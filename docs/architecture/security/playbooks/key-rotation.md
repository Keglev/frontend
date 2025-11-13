# Key Rotation & Rollout Playbook

## Overview

Key rotation is the process of replacing cryptographic signing keys used for JWT tokens. This playbook documents the rotation strategy, rollout procedures, and rollback processes for StockEase Frontend's authentication keys.

---

## Why Rotate Keys?

### Security Reasons

#### 1. **Compromise Mitigation**
```
If signing key is leaked:
├─ Attacker can forge valid JWT tokens
├─ Attacker impersonates any user
├─ System is completely compromised
└─ Action: Rotate key immediately to invalidate forged tokens
```

**Scenario:**
```
Date: 2025-11-10
Event: Developer accidentally commits signing key to GitHub

Actions:
├─ Key rotated immediately
├─ All existing tokens invalidated
├─ Attackers cannot forge new tokens
├─ System remains secure
```

#### 2. **Insider Threat Mitigation**
```
If employee with key access leaves:
├─ Former employee could create tokens
├─ Access to systems they shouldn't have
├─ Audit trail difficult to track
└─ Action: Rotate key on departure
```

#### 3. **Regular Maintenance (Planned)**
```
Every 90 days:
├─ Rotate keys as preventive measure
├─ Limit window of compromise
├─ Maintain security hygiene
└─ Ensure proper procedures work
```

### Compliance Reasons

- **HIPAA:** Requires regular key rotation
- **PCI DSS:** Requires annual key rotation
- **SOC 2:** Documents key rotation procedures
- **ISO 27001:** Key management requirements

---

## Current Key Architecture

### JWT Signing in StockEase

**Backend (Node.js example):**

```javascript
// Key storage (should be in environment variable)
const JWT_SECRET = process.env.JWT_SECRET;

// Token generation (on login)
const generateToken = (userId) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
  };
  
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
};

// Token verification (on each request)
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    throw new Error('Invalid token');
  }
};
```

**Frontend Storage:**

```typescript
// src/services/apiClient.ts
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### Key Properties

| Property | Value | Notes |
|----------|-------|-------|
| Key Type | HMAC-SHA256 | Symmetric (same key signs & verifies) |
| Key Length | 32+ bytes | Minimum for HS256 |
| Storage | Environment variable | `JWT_SECRET` |
| Rotation | Manual | No automated rotation yet |
| Expiration | 24 hours | Token expiration time |

---

## Key Rotation Strategies

### Strategy 1: Immediate Rotation (Emergency)

**Use Case:** Key compromise, security incident

**Timeline:**
```
T+0:00   Key compromised discovered
T+0:05   Immediate rotation initiated
T+0:15   New key deployed to all servers
T+0:20   Old key revocation list created
T+0:30   All tokens invalidated (force re-login)
T+0:45   Verify all users re-authenticated
T+1:00   Post-incident analysis begins
```

**Process:**

```javascript
// 1. Generate new key
const crypto = require('crypto');
const newKey = crypto.randomBytes(32).toString('hex');
console.log('New JWT Secret:', newKey);
// Store in secure location (not in code!)

// 2. Deploy to primary server
// Update environment variable: JWT_SECRET = newKey
// Restart application

// 3. Create revocation list
// All tokens issued with old key are now invalid

// 4. Force all users to re-login
app.get('/force-reauth', (req, res) => {
  res.json({
    message: 'Re-authentication required',
    reason: 'Security update'
  });
});

// 5. Clear client tokens
// Send notification: "Please login again"
```

**Advantages:**
- ✅ Immediate security recovery
- ✅ Old tokens completely invalidated
- ✅ No grace period for attackers

**Disadvantages:**
- ⚠️ All users must re-login
- ⚠️ Service disruption
- ⚠️ High support burden

---

### Strategy 2: Graceful Rotation (Planned)

**Use Case:** Regular maintenance, no security incident

**Timeline:**
```
Week 1:  Generate new key (keep both active)
         New tokens signed with new key
         Old tokens still accepted
         
Week 2:  Monitor dual-key environment
         Gradual user login (new tokens)
         Old sessions continue (old key)
         
Week 3:  Deprecate old key
         Stop accepting old key tokens
         Force remaining users to re-login
         
Week 4:  Archive and destroy old key
         Verify no old tokens active
         Document rotation completion
```

**Process:**

**Phase 1: Dual-Key Setup**

```javascript
// Backend maintains both keys
const JWT_SECRET_CURRENT = process.env.JWT_SECRET_NEW;  // New key
const JWT_SECRET_PREVIOUS = process.env.JWT_SECRET_OLD; // Old key

// Sign with NEW key
const generateToken = (userId) => {
  return jwt.sign(
    { sub: userId, iat: Date.now() },
    JWT_SECRET_CURRENT,
    { algorithm: 'HS256' }
  );
};

// Verify with EITHER key
const verifyToken = (token) => {
  try {
    // Try new key first
    return jwt.verify(token, JWT_SECRET_CURRENT, { algorithms: ['HS256'] });
  } catch (error) {
    // Fall back to old key
    try {
      return jwt.verify(token, JWT_SECRET_PREVIOUS, { algorithms: ['HS256'] });
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
};
```

**Phase 2: Migration Period**

```
Monitor token usage:
├─ New tokens: JWT_SECRET_CURRENT
├─ Old tokens: JWT_SECRET_PREVIOUS
├─ Acceptance rate: Track which key is used
└─ Timeline: Wait until 90% migrated
```

**Dashboard Metrics:**
```
Token Usage (Daily)
├─ New key tokens: 98%
├─ Old key tokens: 2%
├─ Expiration: 7 days until old key disabled
└─ Status: Ready to deprecate
```

**Phase 3: Deprecation**

```javascript
// Only accept NEW key
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET_CURRENT, { algorithms: ['HS256'] });
};

// Old key tokens will fail
// Users with old tokens forced to re-login
```

**Phase 4: Key Destruction**

```javascript
// Remove old key from environment
// Ensure only current key in secrets management
// Archive old key for audit purposes (encrypted)
// Document rotation completion
```

**Advantages:**
- ✅ Minimal service disruption
- ✅ Graceful migration
- ✅ Users only re-login if necessary

**Disadvantages:**
- ⚠️ Takes 3-4 weeks
- ⚠️ Complex dual-key logic
- ⚠️ Longer exposure window

---

### Strategy 3: Rolling Rotation (Continuous)

**Use Case:** High-security environments, automated systems

**Concept:**
```
Rotate keys quarterly without user notice

Week 1:  Rotate 25% of users to new key
Week 2:  Rotate 50% of users to new key
Week 3:  Rotate 75% of users to new key
Week 4:  Rotate 100% of users to new key

No users forced to re-login
Transparent rotation process
```

**Requirements:**
- Dual-key support in backend
- Automated token refresh in frontend
- Scheduling system for rotation phases

**Implementation:**

```javascript
// Assign users to "rotation cohorts"
const getUserCohort = (userId) => {
  return parseInt(userId) % 4; // Groups users 0-3
};

// Rotate one cohort per week
const getActiveKey = (userId) => {
  const cohort = getUserCohort(userId);
  const week = Math.floor((Date.now() - rotationStartDate) / (7 * 24 * 60 * 60 * 1000));
  
  if (week >= cohort) {
    return JWT_SECRET_NEW;    // User's key rotated
  } else {
    return JWT_SECRET_CURRENT; // User still on old key
  }
};

// On token refresh, always use new key
const generateToken = (userId) => {
  return jwt.sign(
    { sub: userId, cohort: getUserCohort(userId) },
    JWT_SECRET_NEW,
    { algorithm: 'HS256' }
  );
};
```

**Advantages:**
- ✅ No user disruption
- ✅ Completely transparent
- ✅ Automated process

**Disadvantages:**
- ⚠️ Complex implementation
- ⚠️ Requires dual-key period
- ⚠️ Needs good monitoring

---

## Rollout Procedures

### Step-by-Step Rollout

#### 1. Prepare New Key

```bash
# Generate cryptographically secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output (example):
# a7f3b9c2e1d4f6a8b5c7d9e2f4a6b8c0e2d4f6a8b9c1d3e5f7a9b0c2d4e5f6

# Store in secure location:
# - Vault (HashiCorp Vault)
# - AWS Secrets Manager
# - GitHub Secrets (for CI/CD)
# - Environment variable (.env.production)
```

**Security Checklist:**
- [ ] Key generated with sufficient entropy (32+ bytes)
- [ ] Key not logged or printed
- [ ] Key stored in secrets management
- [ ] Key access logged and audited
- [ ] Key backup created (encrypted)

#### 2. Deploy Dual-Key Configuration

**Backend Configuration:**

```javascript
// .env.production
JWT_SECRET_CURRENT=new_key_hex_string
JWT_SECRET_PREVIOUS=old_key_hex_string

// app.js
const JWT_SECRET_CURRENT = process.env.JWT_SECRET_CURRENT;
const JWT_SECRET_PREVIOUS = process.env.JWT_SECRET_PREVIOUS;
```

**Deployment:**

```bash
# 1. Update environment variables in production
gcloud secrets versions add JWT_SECRET_PREVIOUS --data-file=- <<< $OLD_KEY
gcloud secrets versions add JWT_SECRET_CURRENT --data-file=- <<< $NEW_KEY

# 2. Restart application
kubectl rollout restart deployment/api-server

# 3. Verify both keys active
curl https://api.stockease.com/health/keys
# Response: { current: 'new_key...', previous: 'old_key...' }

# 4. Monitor token verification
# Watch for errors with old/new keys
```

#### 3. Monitor Dual-Key Period

**Metrics to Track:**

```javascript
// Logging on token verification
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_CURRENT);
    metrics.increment('token.verified', { key: 'current' });
    return decoded;
  } catch (error) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET_PREVIOUS);
      metrics.increment('token.verified', { key: 'previous' });
      return decoded;
    } catch (error) {
      metrics.increment('token.invalid');
      throw error;
    }
  }
};
```

**Dashboard:**
```
Token Verification (Last 24h)
├─ Current key:  2,847 ✅ (98.2%)
├─ Previous key: 52 ✅ (1.8%)
├─ Invalid:      2 ❌ (0.06%)
└─ Status: Ready to deprecate previous key
```

**Success Criteria:**
- Previous key usage < 5%
- No errors with current key
- Average latency unchanged
- Zero downtime events

**Timeline:**
- Monitoring period: 1-2 weeks
- Extend if issues detected
- Continue with deprecation if healthy

#### 4. Deprecate Previous Key

**Disable Old Key:**

```javascript
// Update app to only accept current key
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET_CURRENT, { algorithms: ['HS256'] });
  
  // Old key tokens will be rejected
  // Users redirected to login
};
```

**Deployment:**

```bash
# Remove previous key from configuration
# Keep only current key

# Update environment
gcloud secrets versions destroy JWT_SECRET_PREVIOUS

# Restart application
kubectl rollout restart deployment/api-server

# Monitor error rates
```

**User Impact:**

```
User with old token:
├─ Makes API request
├─ Token verification fails
├─ Response: 401 Unauthorized
├─ Frontend interceptor removes token
├─ User redirected to login
└─ User re-authenticates (forced logout)

Estimated users affected:
├─ Previous key usage: 1-2%
├─ = ~100-200 users (in 10k user base)
├─ Support spike: Expect login help requests
└─ Duration: 1-2 hours
```

#### 5. Verify and Document

**Verification:**

```bash
# Confirm no old key tokens in system
redis-cli keys "token:*" | while read key; do
  TOKEN=$(redis-cli get $key | jq -r '.token')
  jwt decode $TOKEN --secret=$OLD_KEY 2>/dev/null && echo "Found old key token: $key"
done

# Expected output: (empty - no old tokens)
```

**Documentation:**

```markdown
# Key Rotation - November 13, 2025

## Timeline
- 2025-11-13 09:00 - New key generated
- 2025-11-13 10:00 - Dual-key deployment started
- 2025-11-13 11:00 - Dual-key active (both keys accepting tokens)
- 2025-11-20 14:00 - Dual-key monitoring complete (2,847 current key, 52 previous key)
- 2025-11-20 15:00 - Previous key deprecated
- 2025-11-20 16:00 - Verification completed
- 2025-11-21 09:00 - Post-rotation audit

## Key Metrics
- Dual-key period: 7 days
- Previous key usage at deprecation: 1.8%
- Users forced to re-login: ~52
- Support impact: Minimal
- Zero-downtime: Yes ✅

## New Key Details
- Generation date: 2025-11-13
- Generated by: automation@stockease.com
- Algorithm: HS256
- Key size: 256 bits (32 bytes)
- Expiration policy: Rotate in 90 days

## Old Key Archive
- Stored: Encrypted vault
- Retention: 1 year (compliance)
- Access: Limited to security team
- Destruction date: 2026-11-13
```

---

## Emergency Rollback

### Scenario: New Key Causes Issues

**Problem:**
```
After key rotation:
├─ High error rates
├─ Users cannot login
├─ System degradation
└─ Need to rollback
```

**Rollback Procedure:**

```bash
# 1. Identify problem
# Spike in 401 errors or token failures

# 2. Immediate action
# Switch back to previous key

# Update to dual-key with roles swapped
export JWT_SECRET_CURRENT=$OLD_KEY  # Restore old key
export JWT_SECRET_PREVIOUS=$NEW_KEY # Keep new key for fallback

# 3. Restart service
kubectl rollout restart deployment/api-server

# 4. Monitor recovery
# Token verification errors should drop to zero

# 5. Investigate
# Why did new key cause issues?
# Was it generated correctly?
# Was deployment correct?

# 6. Generate new key again
# Once root cause is fixed
# Follow full rotation procedure again
```

**Timeline:**
```
T+0:00   Issue detected
T+0:05   Alert triggered
T+0:15   Rollback started
T+0:25   Rollback completed, monitoring
T+0:35   Errors normalized
T+1:00   All systems stable
T+2:00   Investigation begins
```

**Success Criteria:**
- Token verification errors < 0.1%
- Users can login successfully
- API response times normal
- Zero downtime during rollback

---

## Monitoring & Metrics

### Key Rotation Metrics

```javascript
// Track during rotation process
metrics = {
  'key.rotation.start_time': timestamp,
  'key.rotation.duration_days': number,
  'key.rotation.tokens_current_key': count,
  'key.rotation.tokens_previous_key': count,
  'key.rotation.tokens_invalid': count,
  'key.rotation.user_relogins': count,
  'key.rotation.errors': count,
  'key.rotation.success': boolean
};

// Example dashboard
console.log(`
Key Rotation Status
├─ Duration: 7 days (target: 7-14 days)
├─ Current key tokens: 98.2% ✅
├─ Previous key tokens: 1.8% (target: < 5%)
├─ Invalid tokens: 0.06% (target: < 0.1%)
├─ Users forced to login: 52 (1.8%)
├─ Errors: 0
└─ Status: On track for deprecation
`);
```

### Alerts to Set Up

```javascript
// Alert if previous key usage doesn't decrease
if (previousKeyUsagePercent > 10 && daysIntoRotation > 7) {
  alert('Previous key usage still high - investigate');
}

// Alert if token verification errors spike
if (tokenVerificationErrors > avgErrors * 2) {
  alert('Spike in token verification errors');
}

// Alert if old key tokens still exist after deprecation
if (deprecationComplete && oldKeyTokensFound) {
  alert('Old key tokens still in system after deprecation');
}
```

---

## Checklist for Key Rotation

### ✅ Before Rotation

- [ ] New key generated securely
- [ ] Key stored in secrets management
- [ ] Backup of old key created (encrypted)
- [ ] Dual-key verification code tested
- [ ] Monitoring dashboards ready
- [ ] Communication plan prepared
- [ ] Rollback procedure documented
- [ ] Scheduled during low-traffic period

### ✅ During Rotation

- [ ] New key deployed to all servers
- [ ] Both keys active and verified
- [ ] Monitoring metrics healthy
- [ ] No spike in errors
- [ ] Token generation working
- [ ] Old and new tokens accepted
- [ ] Gradual migration observed

### ✅ After Rotation

- [ ] Previous key deprecated
- [ ] No old key tokens in system
- [ ] All users migrated to new key
- [ ] Error rates normalized
- [ ] Audit log complete
- [ ] Documentation updated
- [ ] Post-rotation analysis done
- [ ] Next rotation scheduled

---

## Key Rotation Schedule

### Recommended Schedule

**Production Keys:**
```
Rotation Frequency: Every 90 days
Last Rotation: 2025-11-13
Next Rotation: 2026-02-11
Scheduled: 2nd Thursday of quarter at 02:00 UTC
```

**Critical Incident Rotation:**
```
Trigger: Key compromise or suspected breach
Timeline: Immediate (< 1 hour)
Notification: All users notified of forced re-login
Follow-up: Post-incident analysis within 24 hours
```

**Emergency Procedures:**
```
If key leaked:
├─ Activate emergency rotation (< 15 min)
├─ Deploy to all servers
├─ Invalidate all existing tokens
├─ Force all users to re-login
└─ Post-incident review (within 24h)
```

---

## Related Documentation

- **JWT Tokens:** See [JWT Token Handling](../auth/jwt-tokens.md)
- **Token Revocation:** See [Token Revocation & Forced Logout](./revoke-tokens.md)
- **Authentication:** See [Authentication Flow](../auth/authentication.md)
- **Secrets Management:** See [Secrets & Configuration](../frontend/secrets-config.md)

---

**Last Updated:** November 13, 2025  
**Status:** Operational Procedures  
**Priority:** High (Security Incident Response)  
**Maintainer:** Security & Infrastructure Team
