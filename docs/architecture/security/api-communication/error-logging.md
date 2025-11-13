# Error Logging & Monitoring

## Overview

Proper error logging and monitoring are critical for security. This document describes how StockEase Frontend logs API errors, handles different error scenarios, and protects sensitive data during logging.

---

## Error Logging Strategy

### Current Implementation

The Axios API client logs all requests, responses, and errors:

```typescript
// Request logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config);  // Logs full config including headers
    return config;
  }
);

// Response logging
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);  // Logs full response
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);
```

### Risk: Sensitive Data Exposure

**Problem:** Full request/response logging includes sensitive information:

```typescript
// Logged to console:
{
  config: {
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // ⚠️ TOKEN EXPOSED
      'Content-Type': 'application/json',
      Cookie: 'sessionId=abc123...',  // ⚠️ SESSION EXPOSED
    },
    data: {
      username: 'admin',
      password: 'SecurePass123!',  // ⚠️ PASSWORD EXPOSED
    }
  }
}
```

**Impact:**
- Token visible in browser dev tools
- Password visible if logged before hashing
- Session cookies visible in console
- Exposed to browser extensions or malware

---

## Secure Logging Implementation

### 1. Filter Sensitive Headers

```typescript
/**
 * Sanitizes config object for safe logging
 * Removes or redacts sensitive headers
 */
const sanitizeConfigForLogging = (config: any) => {
  const sensitiveHeaders = ['Authorization', 'Cookie', 'X-API-Key', 'X-Auth-Token'];
  const safeConfig = JSON.parse(JSON.stringify(config));

  sensitiveHeaders.forEach((header) => {
    if (safeConfig.headers?.[header]) {
      safeConfig.headers[header] = '[REDACTED]';
    }
  });

  return safeConfig;
};

// Usage in interceptor:
apiClient.interceptors.request.use(
  (config) => {
    const safeConfig = sanitizeConfigForLogging(config);
    console.log('API Request:', safeConfig);  // ✅ Token is [REDACTED]
    return config;  // Return original (with token) for actual request
  }
);
```

### 2. Filter Sensitive Request Data

```typescript
/**
 * Sanitizes request body for safe logging
 * Redacts passwords and sensitive fields
 */
const sanitizeRequestData = (data: any) => {
  if (!data) return data;

  const sensitiveFields = ['password', 'pin', 'secret', 'apiKey', 'token'];
  const sanitized = JSON.parse(JSON.stringify(data));

  const redactField = (obj: any) => {
    Object.keys(obj).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        redactField(obj[key]);
      }
    });
  };

  redactField(sanitized);
  return sanitized;
};

// Usage:
const safeData = sanitizeRequestData(config.data);
console.log('Request Body:', safeData);  // ✅ password is [REDACTED]
```

### 3. Environment-Based Logging

```typescript
/**
 * Logs only in development environment
 * Disables logging in production
 */
const isDevelopment = process.env.NODE_ENV === 'development';

apiClient.interceptors.request.use((config) => {
  if (isDevelopment) {
    const safeConfig = sanitizeConfigForLogging(config);
    console.log('API Request:', safeConfig);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (isDevelopment) {
      console.log('API Response:', response.status, response.statusText);
    }
    return response;
  },
  (error) => {
    if (isDevelopment) {
      console.error('API Error:', error.message);
    }
    // Always log errors to monitoring service in production
    logToMonitoringService(error);
    throw error;
  }
);
```

---

## Error Types & Handling

### 1. Authentication Errors (401 Unauthorized)

**When it happens:**
- Token expired
- Token invalid or tampered
- User logged out
- Credentials invalid

**Current handling:**
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('token');  // Clear session
  console.warn('Unauthorized access - redirecting to login');
}
```

**Component level:**
```typescript
const handleLogin = async () => {
  try {
    const response = await login(username, password);
    localStorage.setItem('token', response.token);
    navigate('/dashboard');
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      setError(t('login.error.invalidCredentials'));  // Show user message
    } else {
      setError(t('login.error.unexpectedError'));
    }
  }
};
```

**User Message:**
```
❌ "Invalid credentials or account locked"
```

**Never Show:**
```
❌ "Token expired" (technical detail)
❌ JWT decode error (technical detail)
❌ Exact API error message (may leak info)
```

### 2. Validation Errors (400 Bad Request)

**When it happens:**
- Invalid input data
- Missing required fields
- Data format mismatch

**Handling:**
```typescript
catch (err) {
  if (axios.isAxiosError(err) && err.response?.status === 400) {
    // Backend returns field-specific errors
    const validationErrors = err.response.data.errors;
    // Display field-level error messages to user
    Object.entries(validationErrors).forEach(([field, message]) => {
      setFieldError(field, message);
    });
  }
}
```

### 3. Permission Errors (403 Forbidden)

**When it happens:**
- User lacks permission to access resource
- Role-based access control (RBAC) violation
- Attempting to delete another user's data

**Handling:**
```typescript
catch (err) {
  if (axios.isAxiosError(err) && err.response?.status === 403) {
    setError(t('error.forbidden'));  // "You do not have permission to perform this action"
    // Optionally: Log to analytics
    logSecurityEvent('unauthorized_access_attempt', { endpoint, role });
  }
}
```

### 4. Resource Not Found (404)

**When it happens:**
- Endpoint doesn't exist
- Resource was deleted
- Incorrect URL construction

**Handling:**
```typescript
catch (err) {
  if (axios.isAxiosError(err) && err.response?.status === 404) {
    setError(t('error.notFound'));  // "Resource not found"
    // Check if product was deleted by another user
    navigate('/products');
  }
}
```

### 5. Server Errors (5xx)

**When it happens:**
- Backend crash or unhandled exception
- Database connection failure
- Third-party service failure

**Handling:**
```typescript
catch (err) {
  if (axios.isAxiosError(err) && err.response?.status >= 500) {
    setError(t('error.serverError'));  // "Server error - please try again later"
    // Log to error tracking service for backend team
    logToSentry({
      level: 'error',
      message: 'Backend API error',
      statusCode: err.response.status,
      endpoint: err.config.url,
      timestamp: new Date(),
    });
  }
}
```

### 6. Network Errors

**When it happens:**
- No internet connection
- Request timeout
- DNS failure
- Network unreachable

**Handling:**
```typescript
catch (err) {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      // Network error (no response from server)
      if (err.code === 'ECONNABORTED') {
        setError(t('error.timeout'));  // "Request timeout - please try again"
      } else {
        setError(t('error.networkError'));  // "Network connection failed"
      }
      // Try to reconnect after delay
      setTimeout(() => retry(), 3000);
    }
  }
}
```

---

## Error Logging Service

### Centralized Error Logging

```typescript
/**
 * Centralized error logging service
 * Sends errors to monitoring service (Sentry, DataDog, etc.)
 */
class ErrorLoggingService {
  static logError(error: any, context: string) {
    const errorData = {
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      // API-specific data
      ...(axios.isAxiosError(error) && {
        statusCode: error.response?.status,
        endpoint: error.config?.url,
        method: error.config?.method,
      }),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorLogging]', errorData);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry
      Sentry.captureException(error, {
        contexts: {
          app: errorData,
        },
      });
    }
  }

  static logSecurityEvent(event: string, details: any) {
    const eventData = {
      event,
      details,
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('username'),
    };

    // Security events always logged
    console.warn('[Security Event]', eventData);

    // Send to SIEM or security dashboard
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/security/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
    }
  }
}

// Usage in components:
try {
  await apiClient.delete(`/api/products/${id}`);
} catch (err) {
  ErrorLoggingService.logError(err, 'delete_product');
}

// Usage in interceptor:
if (error.response?.status === 401) {
  ErrorLoggingService.logSecurityEvent('unauthorized_access', {
    endpoint: error.config.url,
    attempts: localStorage.getItem('loginAttempts'),
  });
}
```

---

## Monitoring & Alerts

### Metrics to Track

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| 401 Errors | Token issues, session expiration | > 10 per minute |
| 403 Errors | Permission/RBAC issues | > 5 per minute |
| 500 Errors | Backend crashes | Any occurrence |
| Network Errors | Connectivity issues | > 50 per minute |
| Request Latency | Performance degradation | > 5 seconds |
| Failed Logins | Brute force attacks | > 5 attempts / 15 min |

### Example Monitoring Dashboard

```
Real-time API Health
═════════════════════════════════════
✅ Success Rate:     98.5%
❌ Error Rate:       1.5%
   ├─ 401 Errors:    0.3%
   ├─ 403 Errors:    0.2%
   ├─ 500 Errors:    0.4%
   └─ Network:       0.6%

📊 Request Volume:   12,450 req/min
⏱️  Avg Latency:      245ms
🚨 Alerts:           None active
```

---

## Best Practices

### ✅ DO

- ✅ **Filter sensitive data** before logging
- ✅ **Log in development**, disable in production
- ✅ **Use error tracking service** (Sentry, DataDog, etc.)
- ✅ **Differentiate error types** in user messages
- ✅ **Log security events** separately
- ✅ **Include context** (user, endpoint, timestamp)
- ✅ **Monitor error rates** for anomalies
- ✅ **Implement retry logic** for transient errors

### ❌ DON'T

- ❌ **Never log passwords** or secrets
- ❌ **Never expose tokens** in console output
- ❌ **Never show technical errors** to users
- ❌ **Never log in production** without filtering
- ❌ **Never expose API implementation details**
- ❌ **Never ignore 401 errors** (always clear session)
- ❌ **Never retry indefinitely** (implement backoff)

---

## Troubleshooting Common Issues

### Problem: Token Mysteriously Cleared

```
Symptom: User logged in, but suddenly redirected to login
Cause: API returned 401, interceptor cleared token

Debug:
1. Open browser DevTools → Console
2. Look for: "API Error:" logs showing 401
3. Check if token is expired: https://jwt.io (paste token)
4. Look for: "Unauthorized access - redirecting to login"
```

### Problem: "Network Error" Message Too Frequent

```
Symptom: User sees network errors but connection is fine
Cause: Backend slow or frontend timeout too short

Debug:
1. Check request latency: DevTools → Network tab
2. If > 120 seconds, increase timeout in apiClient.ts
3. If network looks fine, check backend logs
4. Check for DNS resolution issues: ping api.stockease.com
```

### Problem: API Endpoint Returns 403, But User Has Permission

```
Symptom: Permission denied error, but user is admin
Cause: Token doesn't have correct role claim, or RBAC misconfigured

Debug:
1. Decode token: localStorage.getItem('token') → https://jwt.io
2. Check 'role' claim in payload
3. Verify token matches stored role: localStorage.getItem('role')
4. Check backend RBAC configuration
5. Retry after re-login to refresh token
```

---

## Related Documentation

- **[API Security & Configuration](./api-security.md)** — Axios setup and bearer tokens
- **[Overview](./overview.md)** — Complete API communication security guide
- **[Testing & Security Audits](../../testing/api-security.md)** — How to test error handling

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready  
**Review Cycle:** Quarterly
