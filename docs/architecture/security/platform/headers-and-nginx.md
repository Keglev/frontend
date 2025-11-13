# Security Headers & nginx Configuration

## Overview

HTTP security headers instruct browsers how to handle content and prevent common attacks. This document covers StockEase Frontend's nginx configuration for clickjacking prevention, HSTS, MIME type sniffing, and other security headers.

---

## Security Headers in StockEase

### Current Implementation

StockEase Frontend has security headers configured in `ops/nginx/nginx.conf`:

```nginx
# =========================================================================
# Security Headers
# =========================================================================
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Header Overview

| Header | Purpose | Current Value |
|--------|---------|----------------|
| X-Content-Type-Options | MIME type sniffing prevention | nosniff |
| X-XSS-Protection | XSS protection in old browsers | 1; mode=block |
| X-Frame-Options | Clickjacking prevention | DENY |
| Referrer-Policy | Referrer leakage prevention | strict-origin-when-cross-origin |
| HSTS | HTTPS enforcement | ❌ Not configured (recommended) |
| CSP | Content Security Policy | ❌ Not configured (recommended) |

---

## X-Content-Type-Options: MIME Sniffing Prevention

### What is MIME Sniffing?

MIME (Multipurpose Internet Mail Extensions) describes file types:
```
image/png       → Image file
text/javascript → JavaScript file
application/json → JSON data
```

**Sniffing attack:**
```
Server sends: Content-Type: text/plain
              <script>alert('xss')</script>

Browser (without protection):
  ├─ Reads content
  ├─ Ignores Content-Type header (sniffs)
  ├─ Sees <script> tag
  ├─ Interprets as JavaScript
  └─ Executes script ❌
```

### X-Content-Type-Options Header

```http
X-Content-Type-Options: nosniff
```

**What it does:**
- Tells browser: "Trust the Content-Type header"
- Browser will NOT sniff the actual content
- If header says `text/plain`, treat as plain text (even if it's script)

**Example:**
```
Server sends:
  Content-Type: text/plain
  X-Content-Type-Options: nosniff
  <script>alert('xss')</script>

Browser:
  ├─ Reads Content-Type: text/plain
  ├─ Sees X-Content-Type-Options: nosniff
  ├─ Does NOT sniff content
  ├─ Treats as plain text
  └─ Displays as text (script not executed) ✅
```

### Current Configuration

```nginx
add_header X-Content-Type-Options "nosniff" always;
```

**Status:** ✅ Correctly configured

---

## X-Frame-Options: Clickjacking Prevention

### What is Clickjacking?

Clickjacking (UI redressing) tricks users into clicking hidden elements:

**Attack scenario:**
```html
<!-- Attacker's site -->
<div style="position: absolute; opacity: 0; top: 0; left: 0; width: 100%; height: 100%;">
  <iframe src="https://stockease.com/api/delete-product?id=123"></iframe>
  <!-- Invisible iframe on top -->
</div>

<!-- Visible content below -->
<div style="position: relative; z-index: -1; padding: 100px;">
  <h1>Free Prize! Click Here to Claim</h1>
  <button>Click Me!</button>
  <!-- User clicks visible button -->
  <!-- Actually clicks hidden iframe button -->
  <!-- Accidental API call executed ❌ -->
</div>
```

### X-Frame-Options Header

```http
X-Frame-Options: DENY
```

**Possible values:**

| Value | Effect |
|-------|--------|
| `DENY` | Cannot be embedded in ANY iframe |
| `SAMEORIGIN` | Can embed in iframe from same origin |
| `ALLOW-FROM origin` | Can embed in iframe from specific origin (deprecated) |

**How it works:**
```
Browser loads: <iframe src="https://stockease.com">

Check: X-Frame-Options header
  ├─ DENY → Refuse to load in iframe ❌
  ├─ SAMEORIGIN → Check if same origin
  │   ├─ iframe is from same origin → Load ✅
  │   └─ iframe is from different origin → Refuse ❌
  └─ ALLOW-FROM → Check if from allowed origin
```

### Current Configuration

```nginx
add_header X-Frame-Options "DENY" always;
```

**Status:** ✅ Correctly configured (most restrictive)

**Implications:**
- StockEase cannot be embedded in iframes (anywhere)
- Prevents clickjacking completely
- May affect some legitimate use cases (e.g., dashboard widgets)

### Adjust if Needed

**Allow same-origin iframes:**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
```

**Use case:** Admin dashboard in iframe on same domain

---

## X-XSS-Protection: Legacy XSS Protection

### What is X-XSS-Protection?

Legacy header for XSS protection in older browsers (IE, older Chrome):

```http
X-XSS-Protection: 1; mode=block
```

**Modes:**

| Value | Effect |
|-------|--------|
| `0` | Disable XSS protection |
| `1` | Enable XSS protection |
| `1; mode=block` | Block page if XSS detected |
| `1; report=uri` | Report to URI if XSS detected |

**How it works:**
```
Browser detects XSS (reflected):
  ├─ With "1; mode=block" → Don't render page ✅
  └─ With "1" → Sanitize and render ⚠️
```

### Current Configuration

```nginx
add_header X-XSS-Protection "1; mode=block" always;
```

**Status:** ✅ Correctly configured

**Modern browsers:** Ignore this header (use CSP instead)  
**Legacy browsers:** Benefit from protection

---

## Referrer-Policy: Prevent Referrer Leakage

### What is Referrer Leakage?

When user navigates from one site to another, browser sends `Referer` header:

```
User on https://stockease.com/admin/secret-page
Clicks link to https://example.com

Browser sends:
  Referer: https://stockease.com/admin/secret-page
  
Attacker now knows:
  ├─ User visited StockEase
  └─ They viewed /admin/secret-page
```

**Sensitive data in URLs:**
```
https://stockease.com/user/settings?email=john@example.com&password=temp123
^                                      ^ Leaks email and password to next site!
```

### Referrer-Policy Header

```http
Referrer-Policy: strict-origin-when-cross-origin
```

**Possible values:**

| Policy | HTTPS→HTTPS | HTTPS→HTTP | HTTP→HTTPS | HTTP→HTTP |
|--------|-------------|------------|------------|-----------|
| no-referrer | None | None | None | None |
| strict-origin | Origin | None | Origin | Origin |
| no-referrer-when-downgrade | Full | None | Full | Full |
| same-origin | Full | None | None | Full |
| origin | Origin | Origin | Origin | Origin |
| strict-origin-when-cross-origin | Full | None | Origin | Full |

### Current Configuration

```nginx
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

**What it does:**
- HTTPS to HTTPS: Send full URL
- HTTPS to HTTP: Send nothing (prevent downgrade)
- HTTP to HTTPS: Send origin only
- HTTP to HTTP: Send full URL

**Status:** ✅ Good balance of privacy and functionality

---

## HSTS (HTTP Strict Transport Security)

### What is HSTS?

HSTS forces browsers to use HTTPS only:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### How HSTS Works

```
Browser visits: http://stockease.com (plain HTTP)

Server responds:
  HTTP/1.1 200 OK
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  
Browser remembers:
  ├─ For 31536000 seconds (1 year)
  ├─ Always use HTTPS for this domain
  └─ Apply to all subdomains too

Next request to: http://stockease.com
  ├─ Before HSTS: Browser sends HTTP ❌
  └─ With HSTS: Browser upgrades to HTTPS ✅
```

### HSTS Directives

| Directive | Purpose | Example |
|-----------|---------|---------|
| `max-age` | How long to enforce (seconds) | 31536000 (1 year) |
| `includeSubDomains` | Apply to all subdomains | Recommended |
| `preload` | Add to HSTS preload list | Optional (stricter) |

### Current Configuration

**❌ NOT CONFIGURED**

StockEase should add:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### HSTS Benefits

✅ **Prevents downgrade attacks**
- Attacker cannot force HTTP
- Forces HTTPS upgrade automatically

✅ **Improves performance**
- Skips HTTP request (goes straight to HTTPS)
- Reduces one round-trip

✅ **Enhances security**
- Protects against MITM (Man-in-the-Middle)
- Works even if first visit is HTTP

### HSTS Risks

⚠️ **max-age too long**
- If you stop using HTTPS, users stuck
- Can't access site until max-age expires

⚠️ **includeSubDomains**
- All subdomains must support HTTPS
- Enforce consistently

### Recommended Implementation

**Start conservative:**
```nginx
# 2 weeks (test period)
add_header Strict-Transport-Security "max-age=1209600" always;
```

**After testing:**
```nginx
# 1 month (adjust when comfortable)
add_header Strict-Transport-Security "max-age=2592000" always;
```

**Production (final):**
```nginx
# 1 year (after confirming HTTPS is permanent)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

## Recommended Headers for Production

### Enhanced Configuration

```nginx
# =========================================================================
# Enhanced Security Headers (Recommended)
# =========================================================================

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Prevent clickjacking
add_header X-Frame-Options "DENY" always;

# Legacy XSS protection (old browsers)
add_header X-XSS-Protection "1; mode=block" always;

# Control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Force HTTPS (only after full HTTPS migration)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy (see CSP documentation)
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

# Additional security headers
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header X-Permitted-Cross-Domain-Policies "none" always;
```

---

## nginx Configuration Locations

### File Location

```
ops/nginx/nginx.conf
├─ Server block
│   ├─ Security headers
│   ├─ Caching rules
│   ├─ Compression
│   └─ Routing
```

### Current Security Section

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  # ... SPA routing, caching, compression ...

  # =========================================================================
  # Security Headers
  # =========================================================================
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # =========================================================================
  # Error Pages
  # =========================================================================
  error_page 404 /index.html;
}
```

---

## Testing Security Headers

### Using curl

```bash
# Get all response headers
curl -i https://frontend.stockease.com

# Get specific header
curl -i https://frontend.stockease.com | grep -i "X-Frame-Options"

# Output:
# X-Frame-Options: DENY
```

### Using Online Tools

- [Security Headers Scanner](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [DigitalOcean DNS Checker](https://tools.digitalocean.com/)

### Expected Output

```
Checking https://frontend.stockease.com

Headers found:
✓ X-Content-Type-Options: nosniff
✓ X-XSS-Protection: 1; mode=block
✓ X-Frame-Options: DENY
✓ Referrer-Policy: strict-origin-when-cross-origin
⚠ Strict-Transport-Security: MISSING (recommended)
⚠ Content-Security-Policy: MISSING (recommended)

Score: A (good)
Grade: B+ (add HSTS and CSP for A+)
```

---

## Common Issues & Solutions

### Issue 1: HSTS Causes Redirect Loop

**Problem:**
```
Browser tries: http://stockease.com
HSTS forces: https://stockease.com
nginx redirects: http://stockease.com
Loop ❌
```

**Cause:** HSTS set but no HTTP→HTTPS redirect in nginx

**Solution:**
```nginx
# Ensure HTTP listener redirects
server {
  listen 80;
  server_name _;
  return 301 https://$server_name$request_uri;
}

# HTTPS server with headers
server {
  listen 443 ssl http2;
  server_name _;
  
  add_header Strict-Transport-Security "max-age=31536000" always;
}
```

### Issue 2: DENY Too Restrictive

**Problem:** Legitimate admin dashboard cannot embed in iframe

**Solution:**
```nginx
# Allow same-origin embedding
add_header X-Frame-Options "SAMEORIGIN" always;
```

### Issue 3: Headers Not Appearing

**Problem:**
```bash
curl -i https://stockease.com | grep "X-Frame-Options"
# No output
```

**Cause:** 
- nginx not reloaded after config change
- Headers only added for specific routes

**Solution:**
```bash
# Reload nginx
docker exec nginx nginx -s reload

# Or restart container
docker restart nginx-container

# Verify
curl -i https://stockease.com | head -20
```

---

## Best Practices

### ✅ DO:

- ✅ Include all recommended security headers
- ✅ Set `always` flag (even for error responses)
- ✅ Test headers before production
- ✅ Document why each header is needed
- ✅ Keep headers consistent across all pages
- ✅ Monitor header compliance

### ❌ DON'T:

- ❌ Disable security headers for convenience
- ❌ Set max-age too high initially
- ❌ Forget to reload nginx after config changes
- ❌ Ignore header warnings
- ❌ Set conflicting headers

---

## Related Files

- **nginx Config:** `ops/nginx/nginx.conf`
- **Docker Setup:** `Dockerfile`
- **CI/CD:** `.github/workflows/deploy-frontend.yml`
- **CSP Documentation:** See [Frontend Security - CSP](../frontend/csp.md)

---

## References

- [OWASP Security Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_for_Your_Website_Cheat_Sheet.html)
- [MDN HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [nginx Documentation](https://nginx.org/en/docs/)
- [Security Headers Scanner](https://securityheaders.com/)
- [HSTS Preload List](https://hstspreload.org/)

---

**Last Updated:** November 13, 2025  
**Status:** Partially Configured (HSTS & CSP Recommended)  
**Priority:** High (Defense against common attacks)
