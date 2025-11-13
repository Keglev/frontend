# Secrets & Configuration Management

## Overview

This document covers how StockEase Frontend manages sensitive configuration (API endpoints, secrets) and prevents accidental exposure of sensitive data in logs and console output.

---

## Environment Variables

### Purpose

Environment variables store configuration that varies between environments (dev, staging, production) without changing code.

**Examples:**
- API endpoint URL (different per environment)
- Feature flags (enable/disable features)
- Debug mode (verbose logging in dev, silent in prod)
- API keys (never in code)

### Environment File (`.env`)

**Location:** `src/.env`

```bash
# Development API endpoint
VITE_API_BASE_URL=https://stockeasebackend.koyeb.app
```

**⚠️ SECURITY NOTE:** This file is **committed to repository** and is **publicly visible**. Never put secrets here!

### What Can Go in `.env`

✅ **Safe to commit:**
- API endpoint URLs (public information)
- Feature flags
- Analytics keys (if not sensitive)
- Application name, version

❌ **NEVER commit:**
- API keys
- Passwords
- Tokens
- Private credentials
- Database connection strings

### Local Development File (`.env.local`)

**Location:** `.env.local` (not committed)

```bash
# Local development (private secrets)
VITE_API_KEY=secret-api-key-123
VITE_DEBUG_TOKEN=test-token-for-development
```

**In .gitignore:**
```
.env.local
.env.*.local
```

---

## Vite Environment Variables

### How Vite Exposes Variables

Vite replaces `import.meta.env.VITE_*` at **build time** (not runtime):

```typescript
// In source code
const apiUrl = import.meta.env.VITE_API_BASE_URL;
console.log(apiUrl);

// After build:
const apiUrl = 'https://stockeasebackend.koyeb.app';
console.log('https://stockeasebackend.koyeb.app');

// The URL is baked into the bundle!
// Not configurable after build
```

### vite.config.ts Configuration

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
  };
});
```

**How it works:**
1. Load environment variables at build time
2. Define constant in app
3. Build process replaces all references
4. Final bundle has hard-coded value

### Security Implication

**Everything in the bundle is public!**

```typescript
// This appears in compiled JavaScript:
const apiUrl = 'https://api.stockease.com';

// User can view in browser:
// 1. Open DevTools → Sources
// 2. Search for 'api.stockease.com'
// 3. Can see URL in compiled code
```

**Therefore:**
- ✅ OK to hardcode non-sensitive config
- ✅ OK to hardcode API endpoints (public information)
- ❌ NEVER hardcode API keys
- ❌ NEVER hardcode tokens
- ❌ NEVER hardcode passwords

---

## Production Secrets Management

### Current Implementation

**In GitHub Actions Pipeline:**

```yaml
# .github/workflows/deploy-frontend.yml

- name: Build Docker image
  run: |
    docker build \
      --build-arg VITE_API_BASE_URL="${{ secrets.FRONTEND_API_BASE_URL }}" \
      -f Dockerfile \
      -t stockease-frontend:latest .
```

**How it works:**
1. Secret stored in GitHub repository settings
2. GitHub Actions injects into environment
3. Docker build uses secret as build argument
4. Vite replaces variable at build time
5. Final image contains compiled value

### GitHub Secrets

**Setting Secrets:**
1. Go to Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `FRONTEND_API_BASE_URL`
4. Value: `https://api.stockease.com` (or staging URL)
5. Click "Add secret"

**Using Secrets in Workflows:**

```yaml
env:
  VITE_API_BASE_URL: ${{ secrets.FRONTEND_API_BASE_URL }}

# Or in build command:
docker build \
  --build-arg VITE_API_BASE_URL="${{ secrets.FRONTEND_API_BASE_URL }}" \
  .

# Or in echo:
- name: Show endpoint (safe)
  run: |
    echo "Building for: ${{ secrets.FRONTEND_API_BASE_URL }}"
    # Output is masked in logs
    # Shows: Building for: ***
```

### Build-Time Injection

**Dockerfile:**
```dockerfile
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build stage
RUN npm run build
# At this point, VITE_API_BASE_URL is baked into dist/
```

**After Build:**
- URL is embedded in compiled JavaScript
- Environment variable no longer needed
- Runtime configuration is not possible
- Cannot change API endpoint after deployment

---

## Never Log Sensitive Data

### The Problem

Developers often log requests for debugging:

```typescript
// ❌ WRONG: Logs everything including token
console.log('API Request:', config);

// Output:
// API Request: {
//   headers: {
//     Authorization: 'Bearer eyJhbGciOiJIUzI1NiI...'  ← TOKEN EXPOSED!
//   },
//   ...
// }
```

**Who can see logs:**
- Browser console (visible to user and potential XSS attacker)
- Network logs (visible in DevTools)
- Server logs (if forwarded)
- Error tracking services (if integrated)

### Safe Logging Implementation

**Filter sensitive headers:**

```typescript
// src/services/apiClient.ts

const sanitizeConfigForLogging = (config: any) => {
  const sensitiveHeaders = [
    'Authorization',
    'Cookie',
    'X-API-Key',
    'X-Auth-Token'
  ];

  const safeConfig = JSON.parse(JSON.stringify(config));

  // Redact sensitive headers
  sensitiveHeaders.forEach((header) => {
    if (safeConfig.headers?.[header]) {
      safeConfig.headers[header] = '[REDACTED]';
    }
  });

  return safeConfig;
};

// In request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log with redacted config
  const safeConfig = sanitizeConfigForLogging(config);
  console.log('API Request:', safeConfig);
  // Output shows: Authorization: '[REDACTED]'

  return config;  // Return original (with token) for actual request
});
```

**In error logs:**

```typescript
// ❌ WRONG: Logs entire error response with data
if (error.response?.status === 401) {
  console.error('Unauthorized:', error.response);
  // Might contain sensitive headers
}

// ✅ CORRECT: Log only relevant info
if (error.response?.status === 401) {
  console.warn('Unauthorized access - redirecting to login');
  // No sensitive data exposed
}
```

### Safe Logging Practices

**✅ Safe to log:**
```typescript
console.log('API Request:', {
  method: 'POST',
  endpoint: '/api/products',
  status: 200
});

console.log('User action:', {
  action: 'login_attempt',
  timestamp: new Date()
});
```

**❌ Unsafe to log:**
```typescript
console.log('Token:', token);  // DON'T
console.log('Password:', password);  // DON'T
console.log('Full config:', config);  // DON'T (includes headers)
console.log('Request body:', body);  // DON'T (might contain secrets)
console.error('Error:', error);  // RISKY (could expose data)
```

### Conditional Logging (Dev vs Prod)

**Only verbose logging in development:**

```typescript
const isDevelopment = import.meta.env.DEV;

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Verbose logging only in dev
  if (isDevelopment) {
    const safeConfig = sanitizeConfigForLogging(config);
    console.log('API Request:', safeConfig);
  }

  return config;
});
```

---

## Checking for Accidental Secrets in Code

### Common Mistakes

❌ **Checking in API key:**
```typescript
// In source code
const API_KEY = 'sk_live_abc123def456';  // EXPOSED!
```

❌ **Checking in token:**
```typescript
// In test file
const testToken = 'eyJhbGciOiJIUzI1NiI...';  // EXPOSED!
```

❌ **Checking in comments:**
```typescript
// Test with: VITE_API_KEY=secret123  // EXPOSED!
```

### Prevention Strategies

**1. Git Pre-commit Hook (Local)**

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for common secret patterns
if git diff --cached | grep -i "api_key\|password\|token\|secret"; then
  echo "❌ ERROR: Possible secret in staged changes"
  echo "Review changes before committing"
  exit 1
fi
```

**2. GitHub Secret Scanning**

GitHub automatically scans for known secret patterns:
- API keys
- Tokens
- Credentials
- And alerts maintainers

**3. Pre-deployment Audit**

Before deploying, search codebase:

```bash
# Find potential secrets
grep -r "password\|api_key\|secret\|token" src/

# Check .env files
ls -la | grep "\.env"

# Should only see: .env (no secrets) and .gitignore entries
```

---

## Configuration by Environment

### Development

**File:** `.env` or `.env.local`

```bash
VITE_API_BASE_URL=http://localhost:8081
VITE_DEBUG=true
```

**Characteristics:**
- localhost backend
- Verbose logging enabled
- Hot module reloading
- No code minification
- All features enabled

### Staging

**Set via GitHub Secrets:** `FRONTEND_API_BASE_URL_STAGING`

```bash
VITE_API_BASE_URL=https://api.staging.stockease.com
VITE_DEBUG=false
```

**Characteristics:**
- Production-like environment
- Real backend (staging)
- Compressed bundles
- Feature flags applied
- Error tracking enabled

### Production

**Set via GitHub Secrets:** `FRONTEND_API_BASE_URL`

```bash
VITE_API_BASE_URL=https://api.stockease.com
VITE_DEBUG=false
```

**Characteristics:**
- Production backend
- Maximum optimization
- No verbose logging
- Error tracking enabled
- CDN caching enabled

---

## Best Practices

### ✅ DO:

- ✅ Store secrets in GitHub Secrets (never in code)
- ✅ Use environment variables for config that changes
- ✅ Redact sensitive data before logging
- ✅ Use conditional logging (dev vs prod)
- ✅ Rotate secrets regularly
- ✅ Audit what gets built into the bundle
- ✅ Use `.gitignore` for `.env.local` files
- ✅ Document which env vars are needed
- ✅ Test configuration in all environments

### ❌ DON'T:

- ❌ Hardcode secrets in source code
- ❌ Commit `.env.local` with secrets
- ❌ Log tokens or passwords
- ❌ Include secrets in error messages
- ❌ Use `VITE_` prefix for secrets (gets exposed)
- ❌ Trust frontend secrets (all code is public)
- ❌ Reuse secrets across environments
- ❌ Store secrets in comments
- ❌ Log request/response without sanitization

---

## Troubleshooting

### Issue: API Endpoint Not Updating

**Problem:**
```
Changed VITE_API_BASE_URL in .env but app still uses old URL
```

**Causes:**
- Vite caches variables at build time
- Need to rebuild, not just reload

**Solution:**
```bash
# Stop dev server
# Clear node_modules/.vite cache
rm -rf node_modules/.vite

# Rebuild
npm run dev
```

### Issue: Secret Exposed in Build Log

**Problem:**
```
GitHub Actions workflow log shows secret value
```

**Solution:**
```yaml
# GitHub automatically masks secrets
# But in output, use sparingly:

- name: Build (secrets masked)
  run: |
    # ✅ Good: Secret in variable (masked in output)
    docker build --build-arg SECRET="${{ secrets.MY_SECRET }}" .
    
    # ❌ Bad: Secret echoed (might be visible)
    echo "Using secret: ${{ secrets.MY_SECRET }}"
```

### Issue: Debugging with Secrets in Dev

**Problem:**
```
Need to test with production API but don't want to commit secret
```

**Solution:**
```bash
# Create .env.local (ignored by git)
echo "VITE_API_BASE_URL=https://api.production.com" > .env.local

# Use in development
npm run dev

# Never commit .env.local
# Ensure it's in .gitignore
```

---

## Related Files

- **API Client:** `src/services/apiClient.ts`
- **vite.config.ts:** `vite.config.ts`
- **Environment File:** `src/.env`
- **.gitignore:** `.gitignore`
- **GitHub Actions:** `.github/workflows/deploy-frontend.yml`
- **Dockerfile:** `Dockerfile`

---

## References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Detecting Secrets in Code](https://github.blog/2023-05-09-introducing-secret-scanning-push-protection/)

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready  
**Priority:** Critical (Prevents data leaks)
