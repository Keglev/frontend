# PR Security Review Checklist

## Overview

This checklist is designed for **code reviewers and security teams** to evaluate pull requests for security vulnerabilities, best practices, and compliance with StockEase security standards before merging to master.

**Purpose:** Prevent security regressions and ensure all code meets enterprise security requirements

**Timing:** Review BEFORE approving and merging pull requests  
**Responsibility:** Code reviewers, security team, and maintainers  
**Tools Required:** Code editor, git, npm audit, ESLint, TypeScript compiler

---

## 🔐 Authentication & Authorization

### A1: Token & Session Security

- [ ] **JWT Token handling**
  - [ ] Token is only stored in localStorage (not in URL, cookies, or session storage)
  - [ ] Token is never logged to console or error messages
  - [ ] Token extraction logic properly decodes JWT payload
  - [ ] Token format validation prevents malformed tokens
  - [ ] Token is cleared on 401 responses
  - [ ] Logout properly removes token from localStorage

- [ ] **Session management**
  - [ ] Session cleanup logic executes on authentication failure
  - [ ] User state cleared when token expires
  - [ ] No stale tokens remain after logout
  - [ ] Concurrent requests don't cause race conditions with token

- [ ] **Password handling**
  - [ ] Passwords are never logged or stored client-side
  - [ ] Password validation rules are enforced (minimum length, complexity)
  - [ ] Login errors don't reveal whether username or password is incorrect (prevents enumeration)
  - [ ] No plaintext passwords in error messages

### A2: Authorization & Access Control

- [ ] **Route protection**
  - [ ] Protected routes verify authentication before rendering
  - [ ] Unauthorized users cannot access admin/protected pages
  - [ ] Role-based access control (RBAC) is consistently applied
  - [ ] Component-level authorization checks user role/permissions

- [ ] **API call authorization**
  - [ ] All API calls include Bearer token in Authorization header
  - [ ] Token is refreshed if expired (or new login required)
  - [ ] Unauthorized API responses (401/403) are handled gracefully
  - [ ] User cannot modify API requests to access other user's data

---

## 🛡️ Input Validation & XSS Prevention

### B1: Input Validation

- [ ] **Form input validation**
  - [ ] All form inputs have validation rules (required, type, length, pattern)
  - [ ] Validation rules match backend validation
  - [ ] Error messages are user-friendly but don't expose system details
  - [ ] Special characters are properly handled

- [ ] **Dynamic data handling**
  - [ ] User input is never used directly in code execution
  - [ ] eval(), Function(), innerHTML with user data are NOT used
  - [ ] Template literals with user data are safe
  - [ ] Data from API responses are treated as untrusted

- [ ] **Search/filter inputs**
  - [ ] Search queries are validated and sanitized
  - [ ] Filters prevent SQL injection patterns (handled by backend)
  - [ ] Large input payloads are rejected (prevents DoS)

### B2: XSS Prevention

- [ ] **React best practices**
  - [ ] dangerouslySetInnerHTML is not used (or only with sanitized data)
  - [ ] innerHTML is not used
  - [ ] User data is rendered as text, not HTML
  - [ ] JSX automatically escapes content

- [ ] **DOM operations**
  - [ ] No direct DOM manipulation with user data
  - [ ] React refs are used safely
  - [ ] Event handlers don't accept HTML strings

- [ ] **Component output**
  - [ ] API responses displaying user data are escaped
  - [ ] Error messages don't contain unescaped user input
  - [ ] No rendering of error stack traces in production

---

## 🔗 API Security

### C1: API Request/Response Security

- [ ] **Request security**
  - [ ] All API requests use HTTPS (verified in base URL)
  - [ ] Bearer token is attached to Authorization header
  - [ ] Request body doesn't include sensitive data unnecessarily
  - [ ] Request logging doesn't expose credentials

- [ ] **Response handling**
  - [ ] API responses are validated before use
  - [ ] Response structure matches expected schema
  - [ ] Unexpected response formats are handled safely
  - [ ] API responses don't expose internal error details

- [ ] **Error responses**
  - [ ] 401 errors trigger token cleanup and re-authentication
  - [ ] 403 errors are handled without revealing why access was denied
  - [ ] 400 errors display user-friendly messages (not internal validation schema)
  - [ ] 5xx errors are generic ("An error occurred") without stack traces

### C2: CORS & Cross-Origin Security

- [ ] **CORS configuration**
  - [ ] API base URL matches approved origin in CORS headers
  - [ ] Wildcard origin (*) is not used with credentials
  - [ ] Credentials are included in requests to trusted origins only
  - [ ] CORS preflight requests are properly handled

- [ ] **Request headers**
  - [ ] Authorization header is set correctly (Bearer token format)
  - [ ] Content-Type is set appropriately (application/json)
  - [ ] Custom headers don't expose sensitive information
  - [ ] Headers don't include credentials in query parameters

---

## 📊 Data Protection & Logging

### D1: Sensitive Data Protection

- [ ] **Data in transit**
  - [ ] All API calls use HTTPS (not HTTP)
  - [ ] Credentials are never sent via URL parameters
  - [ ] Sensitive data (tokens, passwords, API keys) is not logged

- [ ] **Data in storage**
  - [ ] Tokens in localStorage are accessible only to the same domain
  - [ ] No PII (personally identifiable information) stored in localStorage
  - [ ] No passwords or API keys stored in localStorage
  - [ ] sessionStorage is cleared when browser closes

- [ ] **Error messages & logs**
  - [ ] Console logs don't contain tokens, passwords, or API keys
  - [ ] Error messages don't leak database connection strings
  - [ ] Error tracking services receive sanitized errors only
  - [ ] Stack traces don't include user-sensitive context

### D2: Logging & Monitoring

- [ ] **Application logging**
  - [ ] Authorization header is redacted from request logs
  - [ ] Response body logging is limited to non-sensitive fields
  - [ ] Error logging includes request ID (not full request/response)
  - [ ] No PII or credentials in error context objects

- [ ] **Audit trail**
  - [ ] Authentication failures are logged (server-side)
  - [ ] Access to admin features is logged
  - [ ] Data modifications are traceable to user

---

## 📦 Dependencies & Third-party Code

### E1: Dependency Security

- [ ] **Installed packages**
  - [ ] npm audit reports no critical or high vulnerabilities
  - [ ] package.json uses reasonable version constraints
  - [ ] No abandoned or inactive packages
  - [ ] License compatibility is verified

- [ ] **New dependencies**
  - [ ] New packages have been audited for vulnerabilities
  - [ ] Package functionality is needed (no unnecessary bloat)
  - [ ] Package maintainer is active and trusted
  - [ ] Install script doesn't execute dangerous code

- [ ] **Dependency imports**
  - [ ] Only necessary exports are imported from dependencies
  - [ ] Dependencies are not monkey-patched or extended dangerously
  - [ ] No loading of arbitrary code from user input

### E2: Supply Chain Security

- [ ] **Build and bundling**
  - [ ] Build process is reproducible
  - [ ] Bundled code includes no test files or private data
  - [ ] Source maps are not deployed to production (or restricted)
  - [ ] No secrets or environment variables hardcoded in build output

---

## 🔒 Cryptography & Secrets

### F1: Secrets Management

- [ ] **Environment variables**
  - [ ] No hardcoded API keys, tokens, or passwords
  - [ ] Sensitive config is in .env files (git-ignored)
  - [ ] VITE_* variables don't expose secrets (they're visible in frontend)
  - [ ] API base URL is configurable via environment

- [ ] **Build-time secrets**
  - [ ] GitHub Secrets are used for CI/CD (not in code)
  - [ ] Secrets are not logged in CI/CD output
  - [ ] Build artifacts don't contain secrets

---

## ✅ Code Quality & Best Practices

### G1: TypeScript & Type Safety

- [ ] **Type definitions**
  - [ ] All API responses have TypeScript interfaces
  - [ ] Function parameters and return types are defined
  - [ ] Any type is avoided (use unknown or specific types)
  - [ ] Null checks are performed where needed

- [ ] **Type checking**
  - [ ] `tsc --noEmit` passes without errors
  - [ ] No TypeScript compilation warnings
  - [ ] Type errors related to security are fixed (e.g., string vs Token type)

### G2: Code Style & Security Patterns

- [ ] **ESLint compliance**
  - [ ] ESLint passes without errors: `npm run lint`
  - [ ] Security-related rules are not disabled
  - [ ] No console.log of sensitive data
  - [ ] Promise/async error handling is correct

- [ ] **Naming & documentation**
  - [ ] Functions/variables clearly indicate their purpose
  - [ ] Security-critical logic has explanatory comments
  - [ ] No misleading or incorrect comments

- [ ] **Component structure**
  - [ ] Components follow single responsibility principle
  - [ ] Error handling is explicit and comprehensive
  - [ ] No side effects in render methods

### G3: Error Handling

- [ ] **Try-catch blocks**
  - [ ] Async functions properly handle promise rejections
  - [ ] Error objects are not directly exposed to users
  - [ ] Error messages are logged but sanitized

- [ ] **ErrorBoundary**
  - [ ] ErrorBoundary catches and handles component errors
  - [ ] Error UI is user-friendly (no stack traces)
  - [ ] Errors are logged to monitoring service (if used)

---

## 🧪 Testing

### H1: Security Test Coverage

- [ ] **Authentication tests**
  - [ ] Token storage and retrieval is tested
  - [ ] Token cleanup on 401 is tested
  - [ ] Login and logout workflows are tested
  - [ ] Unauthorized access is prevented

- [ ] **Authorization tests**
  - [ ] Protected routes reject unauthenticated users
  - [ ] Role-based restrictions are enforced
  - [ ] Admin features are not accessible to regular users

- [ ] **Input validation tests**
  - [ ] Invalid inputs are rejected
  - [ ] XSS payloads are handled safely
  - [ ] Boundary values are tested

- [ ] **Error handling tests**
  - [ ] API errors are handled gracefully
  - [ ] Error messages are appropriate
  - [ ] No sensitive data in error output

### H2: Test Execution

- [ ] **All tests pass**
  - [ ] `npm run test` passes
  - [ ] No test warnings or deprecations
  - [ ] Test coverage is reasonable (>70%)

---

## 📝 Documentation & Comments

### I1: Security Documentation

- [ ] **Code comments**
  - [ ] Security-critical code has explanatory comments
  - [ ] Why not how (explain the security reasoning)
  - [ ] No sensitive data in comments

- [ ] **PR description**
  - [ ] PR describes what changed
  - [ ] Security implications are explained
  - [ ] Any security-related decisions are documented

---

## 🚨 Manual Security Testing

### J1: Functional Verification

- [ ] **Authentication flow**
  - [ ] Login works with valid credentials
  - [ ] Login fails with invalid credentials
  - [ ] Session persists across page refreshes
  - [ ] Logout clears token and redirects

- [ ] **Authorization enforcement**
  - [ ] Protected pages redirect to login when not authenticated
  - [ ] Admin pages are inaccessible to non-admin users
  - [ ] User can only access their own data

- [ ] **Error handling**
  - [ ] Network errors display friendly messages
  - [ ] API errors don't expose sensitive information
  - [ ] Error recovery workflows are clear

### J2: Security Testing

- [ ] **XSS prevention**
  - [ ] Search inputs with `<script>` are rendered safely (no execution)
  - [ ] Form inputs with special characters are handled correctly
  - [ ] API response data is escaped

- [ ] **CORS validation**
  - [ ] Requests to API include Bearer token
  - [ ] Requests from incorrect origins are blocked
  - [ ] Preflight requests are handled correctly

---

## 🎯 Final Checklist

Before approving the PR, verify:

- [ ] All security items above are verified or N/A
- [ ] No hardcoded secrets are present
- [ ] No breaking changes to security controls
- [ ] Tests are passing and coverage is maintained
- [ ] Code follows team standards and best practices
- [ ] PR description documents security changes
- [ ] Potential security impacts are understood

---

## 📊 Review Sign-off

### Reviewer Information

**Reviewer Name:** _________________  
**Review Date:** _________________  
**GitHub Handle:** _________________  

### Review Result

- [ ] ✅ **Approved** — No security concerns found
- [ ] ⚠️ **Approved with Comments** — Minor security notes documented
- [ ] ❌ **Blocked** — Security issues must be resolved before merge

### Comments

```
[Document any security findings, concerns, or recommendations]
```

---

## 📚 Reference Links

- [StockEase Security Documentation](../overview.md)
- [API Security Guide](../api-communication/api-security.md)
- [Authentication & Authorization](../auth/overview.md)
- [XSS Prevention & Input Sanitization](../frontend/xss-and-sanitization.md)
- [Error Logging & Monitoring](../api-communication/error-logging.md)
- [Secrets & Configuration](../frontend/secrets-config.md)

---

## 🔄 Continuous Review

This checklist should be:
- **Used for every PR** with code changes
- **Updated quarterly** as new threats emerge
- **Customized** for specific PR types (docs-only PRs may skip some items)
- **Enforced** in branch protection rules and CODEOWNERS

---

**Last Updated:** November 13, 2025  
**Version:** 1.0.0  
**Maintained By:** StockEase Security Team  
**Review Frequency:** For every pull request  
**Classification:** Internal - Security Team & Developers
