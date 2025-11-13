# Security Testing Overview

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Active

## Quick Navigation

The StockEase Frontend employs a comprehensive security testing program with three pillars:

| Testing Type | Focus | Timing | Tools | Coverage |
|---|---|---|---|---|
| **[SAST](sast.md)** | Code-level vulnerabilities | During development | ESLint, TypeScript | Syntax errors, patterns |
| **[Unit/Integration](strategy.md)** | Application logic security | Before merge | Vitest, jsdom | 85%+ code coverage |
| **[DAST](dast.md)** | Runtime vulnerabilities | Post-deploy | OWASP ZAP | API, UI, config |

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Security Testing Pyramid](#security-testing-pyramid)
3. [When to Use Each Testing Type](#when-to-use-each-testing-type)
4. [Testing Standards & Goals](#testing-standards--goals)
5. [Test Domains](#test-domains)
6. [Running Tests](#running-tests)
7. [Troubleshooting](#troubleshooting)
8. [Related Resources](#related-resources)

---

## Quick Start

### For Developers

**Before pushing code:**
```bash
# 1. Run SAST (takes ~10 seconds)
npm run lint

# 2. Run unit/integration tests (takes ~30 seconds)
npm test

# 3. Check coverage
npm test -- --coverage
```

**During code review:**
- Verify SAST violations are addressed
- Ensure test coverage ≥85% for security code
- Check for dangerous code patterns

### For Security Teams

**Weekly:**
```bash
# Run baseline DAST scan on staging
npm run dast:baseline -- --url https://staging.stockease.local
```

**Post-release:**
```bash
# Run full DAST scan on production
npm run dast:full -- --url https://stockease.app
```

**Continuous:**
- Monitor security test results
- Track vulnerability trends
- Review remediation progress

---

## Security Testing Pyramid

```
                    ▲
                   / \
                  /   \
                 / DAST \ (1-2 tests)
                /  Tests  \
               /           \
              /─────────────\
              │   Full UI   │
              │  Scenario   │
              │   Testing   │
              │             │
              ├─────────────┤
              │  Integration│  (10-20 tests per feature)
              │   Tests     │
              │             │
              ├─────────────┤
              │Unit & Focus │  (50-100+ unit tests)
              │  Security   │
              │   Tests     │
              │             │
              ├─────────────┤
              │   SAST      │  (Continuous - every keystroke)
              │   Analysis  │
              │(ESLint, TS) │
              └─────────────┘

Effort →     Low                        High
Speed →      Fast (continuous)          Slow (30-45 min)
Coverage →   Broad patterns             Deep vulnerabilities
Timing →     Dev time                   After deployment
```

### Test Count by Category

Based on analysis of `src/__tests__/` directory:

```
Total Test Files: 40+
Total Tests: 200+

Distribution:
├── SAST Rules:              ~500 linting rules active
├── Unit Security Tests:     ~120 tests
│   ├── Secrets (4 files):   ~30 tests
│   ├── XSS:                 ~15 tests
│   ├── CSRF:                ~12 tests
│   ├── CSP:                 ~10 tests
│   ├── Headers:             ~15 tests
│   └── Components:          ~18 tests
├── API Integration Tests:   ~30 tests
├── Service Tests:           ~20 tests
├── Component Tests:         ~15 tests
└── Scenario/Playbook:       ~15 tests
```

---

## When to Use Each Testing Type

### SAST (Static Analysis) - Use When...

✅ **Use SAST to:**
- Find syntax errors before runtime
- Detect dangerous code patterns early
- Enforce coding standards
- Prevent common vulnerabilities
- Get instant feedback during development

**Frequency:** Continuous (every save)
**Time:** <1 second per file
**Cost:** Free (built-in tooling)

**Example Issues Caught:**
- `eval()` usage
- Direct `innerHTML` assignment
- Missing null checks
- Type mismatches

**See:** [Static Analysis (SAST)](sast.md)

---

### Unit & Integration Tests - Use When...

✅ **Use Unit/Integration Tests to:**
- Validate security logic correctness
- Test edge cases and error handling
- Verify API integrations work safely
- Ensure proper token management
- Check authorization rules
- Test component security features

**Frequency:** Before code review (every commit)
**Time:** 20-30 seconds for full suite
**Cost:** Part of development

**Example Tests:**
- Token storage in localStorage
- XSS prevention in React components
- CSRF token validation
- CORS header checking
- Error message sanitization

**See:** [Testing Strategy](strategy.md)

---

### DAST (Dynamic Testing) - Use When...

✅ **Use DAST to:**
- Test running application behavior
- Find runtime configuration issues
- Detect authentication/authorization flaws
- Test API endpoints against payloads
- Validate security headers
- Identify race conditions
- Test with real browser environment

**Frequency:** On PR (baseline), after merge (full)
**Time:** 5-10 min (baseline) / 30-45 min (full)
**Cost:** Free (OWASP ZAP is open-source)

**Example Issues Caught:**
- CORS misconfiguration
- Missing security headers
- XSS in parameter handling
- CSRF protection gaps
- Authentication bypass

**See:** [Dynamic Testing (DAST)](dast.md)

---

## Testing Standards & Goals

### Coverage Targets

| Code Type | Target Coverage | Minimum | Check |
|-----------|---|---|---|
| Security-critical | **≥95%** | 90% | `npm test -- --coverage` |
| Auth/Authz | **≥90%** | 85% | CI/CD failure threshold |
| General | **≥80%** | 70% | Tracked in git |

### Security Test Goals

- **Unit Tests:** Every security function has ≥2 test cases
- **Integration Tests:** Every API endpoint has auth + validation tests
- **DAST Scans:** Zero critical issues before release
- **SAST:** 100% of security rules pass

### Quality Metrics

**Green Status Requires:**
```
✅ SAST: npm run lint                    (0 security errors)
✅ Unit: npm test -- security/          (all passing, ≥85% coverage)
✅ Integration: npm test -- api/         (all passing)
✅ Type Check: npx tsc --noEmit          (0 type errors)
✅ DAST: OWASP ZAP baseline              (0 critical findings)
```

---

## Test Domains

### Organized by Security Concern

#### 1. **Secrets & Sensitive Data** 🔐
**What's Tested:** Token storage, error messages, logging, environment variables  
**Location:** `src/__tests__/security/secrets/`  
**Importance:** Critical - prevents credential exposure  
**Effort:** 30 minutes to add new test

#### 2. **Cross-Site Scripting (XSS)** 🔗
**What's Tested:** Input escaping, DOM safety, React component safety  
**Location:** `src/__tests__/security/xss/`  
**Importance:** Critical - prevents account takeover  
**Effort:** 20 minutes to add new test

#### 3. **Cross-Site Request Forgery (CSRF)** 📝
**What's Tested:** Token validation, state-changing request protection  
**Location:** `src/__tests__/security/csrf/`  
**Importance:** High - prevents unauthorized actions  
**Effort:** 25 minutes to add new test

#### 4. **Content Security Policy (CSP)** 🛡️
**What's Tested:** CSP directive compliance, nonce validation  
**Location:** `src/__tests__/security/csp/`  
**Importance:** High - defense-in-depth against XSS  
**Effort:** 30 minutes to add new test

#### 5. **HTTP Headers** 📊
**What's Tested:** CORS headers, security headers, cache control  
**Location:** `src/__tests__/security/headers/`  
**Importance:** High - prevents several vulnerability classes  
**Effort:** 25 minutes to add new test

#### 6. **Authentication** 🔑
**What's Tested:** Login/logout, token refresh, session handling, RBAC  
**Location:** `src/__tests__/auth/authorization/`  
**Importance:** Critical - gates access to protected resources  
**Effort:** 35 minutes to add new test

#### 7. **API Security** 🔗
**What's Tested:** Endpoint auth, parameter validation, error handling  
**Location:** `src/__tests__/api/` and `src/__tests__/services/`  
**Importance:** Critical - backend integration security  
**Effort:** 30 minutes to add new test

#### 8. **Component Security** ⚛️
**What's Tested:** Component-level XSS, authorization, error boundaries  
**Location:** `src/__tests__/security/components/`  
**Importance:** Medium - UI-specific security  
**Effort:** 20 minutes to add new test

---

## Running Tests

### Development Workflow

```bash
# 1. Before commit: Run SAST
npm run lint                           # ESLint security checks

# 2. Before push: Run all tests
npm test                               # All unit/integration tests
npm test -- --coverage                 # With coverage report

# 3. Watch mode for development
npm test -- --watch                    # Re-run on file change

# 4. Run specific test category
npm test -- security/                  # All security tests
npm test -- security/xss/              # Only XSS tests
npm test -- auth/authorization         # Only auth tests
```

### Continuous Integration

```bash
# CI/CD runs these (see GitHub Actions)

# 1. SAST
npm run lint

# 2. Unit & Integration Tests
npm test -- --coverage --reporter=verbose

# 3. Type checking
npx tsc --noEmit

# 4. DAST (if PR/merge)
./scripts/run-dast-scan.sh
```

### Baseline DAST Scan (PR)

```bash
# Manual baseline run
npm run dast:baseline

# View report
open ./zap-reports/baseline-report.html
```

### Full DAST Scan (Staging)

```bash
# Requires staging deployment
npm run dast:full -- \
  --url https://staging.stockease.local \
  --report ./dast-reports/full-report.html
```

### Coverage Report

```bash
# Generate HTML coverage report
npm test -- --coverage

# Open in browser
open ./coverage/index.html

# Check specific file
npm test -- --coverage src/api/auth.ts
```

---

## Troubleshooting

### Common Issues

#### "Tests are failing, but code looks correct"

**Solution:**
1. Check test setup: `src/__tests__/setup.ts`
2. Verify mocks are configured: `src/__tests__/mocks/`
3. Run with debug info: `npm test -- --reporter=verbose`

**Example:**
```bash
npm test -- security/secrets/ --reporter=verbose
```

---

#### "Coverage report shows 0% for my file"

**Possible causes:**
- File isn't imported by any test
- Tests aren't actually running the code
- Import statement has an error

**Solution:**
```bash
# Check what's being covered
npm test -- --coverage src/api/auth.ts

# Check if file can be imported
node -e "import('./src/api/auth.ts')"
```

---

#### "DAST scan timeout or hanging"

**Solutions:**
1. Reduce scan depth: `--config spider.maxDepth=2`
2. Increase timeout: `--timeout 3600`
3. Limit threads: `--config ascan.threadPerHost=2`
4. Check app is running: `curl http://localhost:3000`

---

#### "SAST error: Plugin not found"

**Solution:**
```bash
# Reinstall dependencies
rm node_modules package-lock.json
npm install

# Verify ESLint config
npx eslint --print-config src/index.ts | head -20
```

---

## Making Changes to Tests

### Adding a New Security Test

**Steps:**
1. Create test file in appropriate domain
2. Use provided template
3. Run test to verify
4. Ensure ≥85% coverage
5. Update test count in this document

**Example - Add XSS test:**
```bash
# 1. Create file
cat > src/__tests__/security/xss/event-handler.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';

describe('XSS: Event Handler Injection', () => {
  it('should not allow onclick attributes', () => {
    // Your test here
  });
});
EOF

# 2. Run test
npm test -- security/xss/event-handler.test.ts

# 3. Check coverage
npm test -- --coverage src/__tests__/security/xss/event-handler.test.ts
```

### Updating ESLint Rules

**Steps:**
1. Edit `eslint.config.js`
2. Test with: `npm run lint`
3. Verify it catches the issue
4. Update documentation in `sast.md`

**Example - Add new rule:**
```bash
# 1. Update config
cat >> eslint.config.js << 'EOF'
// New rule
rules: {
  'no-eval': 'error',
  'no-implied-eval': 'error',
}
EOF

# 2. Test
npm run lint -- --rule 'no-implied-eval: error'
```

### Modifying DAST Scan

**Steps:**
1. Update ZAP config in `scripts/dast/`
2. Run baseline scan: `npm run dast:baseline`
3. Review findings: `open ./zap-reports/`
4. Update `dast.md` with new rules

---

## Related Resources

### Documentation
- [Security Testing Strategy](strategy.md) - Detailed testing approach
- [Static Analysis (SAST)](sast.md) - ESLint rules and code patterns
- [Dynamic Testing (DAST)](dast.md) - OWASP ZAP and API testing
- [Security Checklists](../checklists/) - Manual review guides
- [Compliance & Standards](../compliance/) - Standards mapping

### External Resources
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Vitest Documentation](https://vitest.dev/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)

### Tools
- ESLint - `npm run lint`
- Vitest - `npm test`
- OWASP ZAP - `npm run dast:*`
- TypeScript - `npx tsc --noEmit`

---

## Test Execution Matrix

**Quick reference for different scenarios:**

```
┌─────────────┬──────────────┬────────────┬──────────────┬──────────┐
│ Scenario    │ SAST         │ Unit Tests │ DAST         │ Time     │
├─────────────┼──────────────┼────────────┼──────────────┼──────────┤
│ Pre-commit  │ npm run lint │ npm test   │ (skip)       │ ~30 sec  │
│ Pre-push    │ npm run lint │ npm test   │ (baseline)   │ ~5 min   │
│ Code review │ ✓ Required   │ ✓ Required │ (PR status)  │ ~30 min  │
│ Post-merge  │ ✓ CI/CD      │ ✓ CI/CD    │ ✓ Full scan  │ ~45 min  │
│ Production  │ ✓ Enforce    │ ✓ Enforce  │ ✓ Scheduled  │ daily    │
└─────────────┴──────────────┴────────────┴──────────────┴──────────┘
```

---

## Metrics & Reporting

### Monthly Security Report

```
Month: [Month/Year]

SAST Status:
- Lint violations: [Count]
- Security errors: [Count]
- Trend: ↓ [Down is good]

Unit Test Status:
- Tests passing: [Count]
- Coverage: [%]
- New tests: [Count]

DAST Status:
- Critical findings: [Count]
- High findings: [Count]
- Remediation rate: [%]

Vulnerability Trends:
- Top issue type: [Type]
- Most common domain: [Domain]
- Resolution time avg: [Days]
```

---

## Version History

- **v1.0.0** - Initial testing documentation
  - Created strategy.md (unit, integration, scenario-based testing)
  - Created sast.md (ESLint security patterns)
  - Created dast.md (OWASP ZAP scanning)
  - Created overview.md (this document)
