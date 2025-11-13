# Frontend Security & Client-Side Protection

## Overview

This section covers security practices for the React frontend, including input validation, XSS prevention, CORS/CSRF protection, and secure configuration management. Frontend security is critical because it's the first line of defense against client-side attacks.

---

## Security Architecture

```
User Input
    ↓
Input Validation (sanitizeString, validateNonEmptyString)
    ├─ Type check
    ├─ Length limits
    ├─ Special character removal
    └─ Format validation
    ↓
React Component (Auto-Escaping)
    ├─ JSX prevents XSS by default
    ├─ HTML entities escaped
    └─ Script tags rendered as text
    ↓
API Request (Safe Transmission)
    ├─ Bearer token in header (not URL)
    ├─ HTTPS encryption
    ├─ CORS validation by backend
    └─ CSRF tokens (if using cookies)
    ↓
Backend Validation (Defense in Depth)
    ├─ Re-validate all input
    ├─ Verify token signature
    ├─ Check CORS origin
    └─ Validate authorization
    ↓
Database Storage (Safe Data)
```

---

## Documentation Files

### 📄 [XSS Prevention & Input Sanitization](./xss-and-sanitization.md)

**Covers:**
- What is XSS and attack scenarios
- Input validation rules by field type
- Sanitization implementation (`sanitizeString`)
- Dangerous sinks (innerHTML, eval, etc.)
- Safe alternatives (React JSX, text content)
- Testing for XSS vulnerabilities
- Best practices and patterns

**Key Components:**
- `sanitizeString()` — Remove angle brackets and trim
- `validateNonEmptyString()` — Type and empty checking
- React JSX auto-escaping
- Dangerous sink prevention

---

### 📄 [Content Security Policy (CSP)](./csp.md)

**Covers:**
- What is CSP and how it works
- CSP directives and policy sources
- Implementation in nginx
- Report-Only mode for safe testing
- Gradual rollout strategy (Phase 1-3)
- Dealing with `unsafe-inline`
- Testing and violation handling

**Key Points:**
- Prevents unauthorized script execution
- Enforced via HTTP headers (not code)
- Complements input validation
- Recommended for production implementation

---

### 📄 [CORS & CSRF Protection](./cors-and-csrf.md)

**Covers:**
- CORS (Cross-Origin Resource Sharing)
- How CORS headers work
- Preflight requests (OPTIONS)
- CORS validation (backend responsibility)
- CSRF (Cross-Site Request Forgery)
- Token-based CSRF protection
- Cookie-less architecture advantages

**Key Points:**
- CORS enforced by browser
- StockEase is CSRF-safe (token-based auth)
- CORS validation is backend responsibility
- Frontend cannot override CORS policy

---

### 📄 [Secrets & Configuration Management](./secrets-config.md)

**Covers:**
- Environment variables (.env files)
- Vite build-time variable replacement
- Production secrets in GitHub Actions
- Never logging sensitive data
- Sanitizing logs and console output
- Checking for accidental secrets in code
- Configuration by environment

**Key Points:**
- Secrets in GitHub Actions only
- Vite variables baked into bundle
- Redact sensitive headers before logging
- Conditional logging (dev vs prod)
- `.env.local` for local development

---

## Security Checklist

### Input Validation
- [ ] All text inputs validated (non-empty, type, length)
- [ ] Email fields use regex validation
- [ ] Numbers validated as positive integers
- [ ] Special characters removed where needed
- [ ] Backend re-validates all input

### XSS Prevention
- [ ] No `innerHTML` with user data
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] React JSX auto-escaping used
- [ ] User content displayed as text
- [ ] No `eval()` or `Function()` with user input
- [ ] Input sanitization applied before storage

### CORS Protection
- [ ] Backend validates CORS origin
- [ ] OPTIONS preflight handled
- [ ] Specific origins whitelisted (not `*`)
- [ ] Authorization header allowed in CORS headers
- [ ] Credentials only sent to allowed origins

### CSRF Protection
- [ ] Using token-based auth (not cookies)
- [ ] Tokens in Authorization header
- [ ] Tokens not in URL parameters
- [ ] HTTPS enforced (no HTTP)
- [ ] If using cookies: SameSite attribute set

### Secrets Management
- [ ] No hardcoded secrets in code
- [ ] `.env.local` in `.gitignore`
- [ ] GitHub Secrets used for CI/CD
- [ ] Sensitive headers redacted in logs
- [ ] No tokens logged to console
- [ ] Environment-specific configuration

### Content Security Policy
- [ ] CSP header configured in nginx
- [ ] `default-src 'self'` set
- [ ] External resources whitelisted
- [ ] `unsafe-eval` not used
- [ ] `unsafe-inline` minimized

---

## Common Vulnerabilities & Fixes

### Vulnerability 1: XSS via User Input

**Scenario:**
```typescript
// Attacker enters: <img src=x onerror="stealToken()">
const productName = userInput;
document.getElementById('name').innerHTML = productName;  // ❌ VULNERABLE
```

**Fix:**
```typescript
// Validate and sanitize
const validation = validateProductName(productName);
if (!validation.valid) {
  showError(validation.error);
  return;
}

const sanitized = sanitizeString(productName);

// Display safely with React
<div>{productName}</div>  // ✅ SAFE (auto-escaped)
```

### Vulnerability 2: Exposed Secrets in Console

**Scenario:**
```typescript
console.log('API Request:', config);  // ❌ Logs Authorization header with token
```

**Fix:**
```typescript
const safeConfig = sanitizeConfigForLogging(config);
console.log('API Request:', safeConfig);  // ✅ Token is [REDACTED]
```

### Vulnerability 3: CSRF Attack via Form

**Scenario (if using cookies):**
```html
<!-- Attacker's site -->
<form action="https://stockease.com/api/products" method="POST">
  <input name="name" value="Malware">
</form>
<script>
  document.forms[0].submit();  // ❌ Auto-submits with user's cookie
</script>
```

**Protection (Current):**
```typescript
// Token-based auth prevents this
// Attacker cannot access token from localStorage
// Request fails without Authorization header
```

### Vulnerability 4: Accidental Secret Exposure

**Scenario:**
```bash
# Committed to repo
VITE_API_KEY=secret_key_123  # ❌ Exposed to anyone with repo access
```

**Fix:**
```bash
# Use GitHub Secrets instead
# In .github/workflows/deploy.yml:
docker build --build-arg VITE_API_KEY="${{ secrets.API_KEY }}" .

# .env.local (local development, never committed)
VITE_API_KEY=local_test_key
```

---

## Performance & Security Trade-offs

### CSP Impact

**Benefit:** Strong XSS protection  
**Trade-off:** Cannot use inline scripts/styles (requires refactoring)  
**Recommendation:** Implement report-only mode first, migrate gradually

### Input Sanitization

**Benefit:** Prevents injection attacks  
**Trade-off:** Some characters removed (e.g., `<>`)  
**Recommendation:** Validate at both frontend and backend

### Token Lifetime

**Benefit (Short-lived):** Limits damage if token compromised  
**Trade-off:** User must re-authenticate frequently  
**Recommendation:** 24 hours (balance security and UX)

### HttpOnly Cookies vs localStorage

**Benefit (HttpOnly):** Protected from XSS  
**Trade-off:** Cannot manually manage, requires backend support  
**Current:** localStorage (good if XSS prevention strict)

---

## Environment-Specific Configuration

### Development
```bash
VITE_API_BASE_URL=http://localhost:8081
VITE_DEBUG=true
```
- Localhost backend
- Verbose logging
- All features enabled

### Staging
```bash
VITE_API_BASE_URL=https://api.staging.stockease.com
VITE_DEBUG=false
```
- Production-like setup
- Feature validation
- Real backend

### Production
```bash
VITE_API_BASE_URL=https://api.stockease.com
VITE_DEBUG=false
```
- Optimized bundle
- Minimal logging
- CDN delivery

---

## Testing Frontend Security

### Unit Tests
```typescript
// Test input validation
describe('Input Validation', () => {
  it('should reject empty strings', () => {
    const result = validateNonEmptyString('');
    expect(result.valid).toBe(false);
  });

  it('should remove XSS vectors', () => {
    const sanitized = sanitizeString('<script>alert("xss")</script>');
    expect(sanitized).not.toContain('<');
  });
});
```

### Integration Tests
```typescript
// Test API requests with tokens
describe('API Security', () => {
  it('should include Authorization header', () => {
    localStorage.setItem('token', 'test-token');
    // Make request, verify header included
  });

  it('should handle 401 by clearing token', () => {
    // Simulate 401 response
    // Verify token removed from localStorage
  });
});
```

### Manual Testing
```bash
# Test XSS payloads
- <script>alert('xss')</script>
- <img src=x onerror="alert('xss')">
- <svg onload="alert('xss')">

# Expected: Rejected or displayed as text

# Test CSRF
- Open DevTools console
- Try: fetch('https://api.stockease.com/api/products', {method: 'POST'})
# Expected: CORS error (no Authorization header)

# Check CSP violations
# Open DevTools Console
# Look for CSP error messages
```

---

## Security Metrics

### Track These

```
Input Validation
├─ Failed validation attempts
├─ Blocked XSS payloads
└─ Sanitization impact (characters removed)

API Security
├─ 401 errors (token issues)
├─ 403 errors (authorization failures)
├─ CORS preflight success rate
└─ Average request latency

Configuration
├─ Accidentally committed secrets (0 goal)
├─ Exposed API keys (0 goal)
├─ Configuration mismatches between environments
└─ Unredacted logs in production
```

---

## Best Practices Summary

### ✅ Always Do

1. **Validate All Input** — Type, length, format
2. **Use React JSX** — Automatic HTML escaping
3. **Secure API Requests** — Bearer tokens, HTTPS
4. **Redact Logs** — Remove sensitive headers before logging
5. **Test Regularly** — XSS payloads, CSRF scenarios
6. **Backend Defense** — Re-validate everything

### ❌ Never Do

1. **Trust Client-Side Validation** — Backend must validate too
2. **Log Sensitive Data** — Redact tokens, passwords
3. **Use innerHTML with User Data** — Use React JSX
4. **Hardcode Secrets** — Use environment variables
5. **Skip HTTPS** — Always use HTTPS in production
6. **Allow Unlimited Origins** — Whitelist specific origins

---

## Incident Response

### If XSS is Discovered

1. **Isolate** — Disable affected feature
2. **Investigate** — Find root cause
3. **Fix** — Patch vulnerability
4. **Test** — Verify with XSS payloads
5. **Deploy** — Roll out fix immediately
6. **Monitor** — Watch for exploitation attempts

### If Secret is Exposed

1. **Revoke** — Deactivate exposed secret immediately
2. **Search** — Check git history for other exposures
3. **Rotate** — Generate new secret
4. **Update** — Update in GitHub Secrets
5. **Redeploy** — Deploy with new secret
6. **Audit** — Check logs for misuse

---

## Related Documentation

- **[API Communication Security](../api-communication/overview.md)** — JWT tokens, request interceptors, error handling
- **[Authentication & Authorization](../auth/overview.md)** — Login flow, RBAC, token management
- **[Deployment Security](../../pipeline/secrets.md)** — CI/CD secrets, GitHub Actions configuration

---

## Quick Links

| Document | Purpose | Priority |
|----------|---------|----------|
| [XSS & Sanitization](./xss-and-sanitization.md) | Input validation, attack prevention | 🔴 Critical |
| [Content Security Policy](./csp.md) | Extra XSS protection layer | 🟡 High |
| [CORS & CSRF](./cors-and-csrf.md) | API security, request validation | 🟡 High |
| [Secrets & Config](./secrets-config.md) | Prevent data leaks | 🔴 Critical |

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready  
**Maintained By:** Security Team  
**Review Cycle:** Quarterly
