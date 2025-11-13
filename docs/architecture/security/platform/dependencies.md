# Dependency Management & Security Audits

## Overview

Dependencies are one of the largest sources of vulnerabilities in modern applications. This document covers how StockEase Frontend manages dependencies, audits for vulnerabilities, and keeps them updated.

---

## Dependency Landscape

### Current Dependencies

**Production Dependencies:**
```json
{
  "axios": "^1.7.7",
  "i18next": "^24.0.5",
  "i18next-browser-languagedetector": "^8.0.2",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-i18next": "^15.4.0",
  "react-icons": "^5.4.0",
  "react-redux": "^9.2.0",
  "react-router-dom": "^7.1.1",
  "recharts": "^2.15.1"
}
```

**Development Dependencies:**
- TypeScript, Vite, ESLint
- Testing libraries (Vitest, Testing Library)
- Build tools (PostCSS, Tailwind)
- Documentation tools (TypeDoc)

### Dependency Count

- **Total dependencies:** ~150-200 (including transitive)
- **Direct dependencies:** ~15-20
- **DevDependencies:** ~40-50
- **Update frequency:** Regular (Renovate bot)

---

## Vulnerability Scanning

### npm audit

**Built into npm:**
```bash
npm audit
```

**What it does:**
1. Checks all dependencies against npm security database
2. Lists known vulnerabilities
3. Provides severity levels
4. Suggests fixes (upgrade, patch)

**Example output:**
```
found 3 vulnerabilities in 487 packages
  2 moderate
  1 high

Run `npm audit fix` to fix them, or `npm audit --audit-level=moderate` to ignore low
```

### npm audit fix

**Automatically fixes vulnerabilities:**
```bash
npm audit fix
```

**What it does:**
1. Updates vulnerable packages to patched versions
2. Updates package-lock.json
3. Preserves semver constraints

**Limitations:**
- ⚠️ May not fix all issues (breaking changes)
- ⚠️ May update transitive dependencies unexpectedly
- ⚠️ Should test after running

### Checking Specific Dependencies

**View package info:**
```bash
npm view axios versions
npm view axios bugs
npm view axios security
```

**Check for known vulnerabilities:**
```bash
npm audit --registry=https://registry.npmjs.org/
npm audit --audit-level=high
```

---

## Security Advisories

### npm Security Advisory Database

npm maintains a database of known vulnerabilities:
- **URL:** https://advisories.npmjs.com/
- **Updated:** Continuously
- **Coverage:** All published npm packages

### Types of Advisories

**1. Critical Vulnerabilities**
- Security exploits (RCE, auth bypass)
- Immediate action required
- Usually patched quickly

**2. High Severity**
- Data leakage (XSS, CSRF)
- Requires prompt patching
- May require app testing

**3. Moderate Severity**
- Logic errors, edge cases
- Update when convenient
- Test thoroughly

**4. Low Severity**
- Minor issues, rarely exploited
- Can defer update

### Checking Advisories

**View vulnerability details:**
```bash
npm audit --json | jq '.vulnerabilities'
```

**Check if package is safe:**
```bash
npm audit --json axios | jq '.advisories'
```

---

## Automated Dependency Updates with Renovate

### What is Renovate?

Renovate is a bot that automatically detects and updates dependencies:
- Checks for new versions daily
- Creates pull requests with updates
- Runs tests automatically
- Suggests merge when passing

### Current StockEase Setup

**Configuration file:** `.renovaterc` (or in `package.json`)

**Typical configuration:**
```json
{
  "extends": ["config:base"],
  "schedule": ["before 3am on Monday"],
  "dependencyDashboard": true,
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchDatasources": ["npm"],
      "matchUpdateTypes": ["major"],
      "automerge": false
    }
  ]
}
```

### How Renovate Works

```
Renovate Bot (GitHub App)
  ↓
Check for new versions daily
  ↓
For each dependency:
  ├─ Check npm registry
  ├─ Compare to current version
  ├─ Determine semver type (major/minor/patch)
  └─ Create PR if update available
  ↓
Pull Request Created:
  ├─ Title: "Update dependency-name to v1.2.3"
  ├─ Description: Changelog, commits, breaking changes
  ├─ Triggered CI tests
  └─ Labels: dependencies, renovate
  ↓
Tests Run:
  ├─ Build project
  ├─ Run unit tests
  ├─ Run integration tests
  └─ Check types (TypeScript)
  ↓
Review & Merge:
  ├─ If tests pass → May auto-merge (patch/minor)
  └─ If tests fail → Manual review required
```

### Renovate Rules

**StockEase Recommended Configuration:**

```json
{
  "extends": ["config:base"],
  
  "schedule": ["after 10pm on Monday"],
  
  "dependencyDashboard": true,
  
  "semanticCommits": true,
  
  "packageRules": [
    {
      "description": "Auto-merge patch and minor updates",
      "matchUpdateTypes": ["patch", "minor"],
      "automerge": true,
      "automergeType": "pr",
      "automergeStrategy": "squash"
    },
    {
      "description": "Require manual review for major updates",
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "assignees": ["@owner"]
    },
    {
      "description": "Security updates (critical)",
      "matchDatasources": ["npm"],
      "matchUpdateTypes": ["security"],
      "automerge": true,
      "schedule": ["at any time"]
    },
    {
      "description": "DevDependencies - more lenient",
      "matchDepTypes": ["devDependencies"],
      "automerge": true,
      "automergeType": "branch"
    }
  ]
}
```

### Renovate Security Best Practices

✅ **DO:**
- ✅ Enable automatic minor/patch updates
- ✅ Require manual review for major updates
- ✅ Fast-track security updates
- ✅ Monitor dependency dashboard
- ✅ Keep schedule during business hours
- ✅ Test before merging

❌ **DON'T:**
- ❌ Auto-merge all major updates
- ❌ Disable Renovate (manual updates miss security patches)
- ❌ Ignore security update PRs
- ❌ Merge PRs without tests passing
- ❌ Update dependencies in production without testing

---

## Supply Chain Attack Prevention

### What is Supply Chain Attack?

Malicious actors compromise dependencies to inject malware:

**Example:**
```
Popular package "lodash" is compromised
Hacker publishes version 4.17.21 with malware
npm publish lodash@4.17.21
All apps using ^4.17.x automatically install malware
```

### Prevention Strategies

#### 1. Pinning Versions

**Exact pinning (safest):**
```json
{
  "dependencies": {
    "axios": "1.7.7"
  }
}
```

**Caret (^) - allows minor updates:**
```json
{
  "dependencies": {
    "axios": "^1.7.7"
  }
}
```

**Lock file (package-lock.json):**
```
Locks exact versions for all transitive dependencies
Ensures reproducible builds
Required for security
```

#### 2. npm Integrity Checks

**npm verifies signatures:**
```
npm install
├─ Download package
├─ Verify checksum from package-lock.json
├─ Verify npm registry signature
└─ Install if checksums match
```

**Check integrity:**
```bash
npm install --audit
npm ci  # Cleaner install (uses lock file)
```

#### 3. Private Package Registry

**Option: Use private npm registry**
```bash
npm config set registry https://private.registry.com/
npm install  # Uses private registry instead of public npm
```

**Benefits:**
- Mirror of npm (security review before use)
- Block malicious packages
- Speed up installs (local copy)

#### 4. Monitor Package Popularity

**Check before installing:**
- Downloads per week
- GitHub stars
- Security advisories
- Last update date

**Red flags:**
- 0 downloads/week
- No GitHub presence
- Known vulnerabilities
- Unmaintained (last update > 1 year ago)

---

## SCA (Software Composition Analysis)

### What is SCA?

SCA tools identify all components (dependencies) and their vulnerabilities:

```
Your Application
  ├─ React 18.3.1
  │   ├─ Known Vulnerability: CVE-2024-1234
  │   └─ Fix: Update to 18.4.0
  ├─ Axios 1.7.7
  │   └─ No known vulnerabilities
  └─ Lodash 4.17.21
      ├─ Known Vulnerability: CVE-2024-5678
      └─ Fix: Update to 4.17.22
```

### SCA Tools

**npm audit (Built-in)**
```bash
npm audit
```
- Free
- Built into npm
- Good for quick scans

**Snyk**
```bash
npm install -g snyk
snyk test
```
- Commercial option
- Real-time monitoring
- Detailed reports

**OWASP Dependency Check**
```bash
# Java-based, supports multiple languages
dependency-check --project "StockEase Frontend" --scan ./node_modules
```

**GitHub Dependabot**
- Built into GitHub
- Free for public repos
- Automatic PR creation

### SCA Rules

**Example SCA policy:**
```yaml
rules:
  - severity: critical
    action: block
    message: "Do not allow critical vulnerabilities"
  
  - severity: high
    action: warn
    message: "Review high severity vulnerabilities"
  
  - severity: medium
    action: allow
    message: "Medium vulnerabilities allowed (plan updates)"
  
  - severity: low
    action: allow
    message: "Low severity vulnerabilities accepted"

  - deprecated: true
    action: block
    message: "Do not use deprecated packages"

  - unmaintained: true
    action: warn
    message: "Consider alternatives to unmaintained packages"
```

### Enforcing SCA Rules in CI/CD

**GitHub Actions:**
```yaml
- name: Run npm audit
  run: npm audit --audit-level=moderate

- name: Run Snyk scan
  run: |
    npm install -g snyk
    snyk test --severity-threshold=high
```

**Failing build if issues found:**
```yaml
- name: Check dependencies
  run: |
    if npm audit | grep -q "high"; then
      echo "❌ High severity vulnerabilities found"
      exit 1
    fi
```

---

## Auditing Workflow

### Weekly Audit Process

```
Monday Morning:
  ├─ Run `npm audit`
  ├─ Review results
  ├─ Create issues for vulnerabilities
  └─ Plan fixes

Tuesday-Thursday:
  ├─ Test updates in staging
  ├─ Verify functionality
  ├─ Check performance impact
  └─ Merge PRs

Friday:
  ├─ Final review of merged changes
  ├─ Deploy to production
  └─ Monitor for issues
```

### Quarterly Deep Audit

**Every 3 months:**
1. Full dependency audit
2. Review lock file for anomalies
3. Check for abandoned dependencies
4. Evaluate alternatives
5. Document findings

### Incident Response

**When vulnerability discovered:**
1. Check if StockEase is affected
2. Check if publicly exploited
3. Assess severity
4. Plan patch
5. Test thoroughly
6. Deploy immediately (if critical)

---

## Best Practices

### ✅ DO:

- ✅ Run `npm audit` regularly (daily/weekly)
- ✅ Use `package-lock.json` (commit to repo)
- ✅ Enable Renovate or Dependabot
- ✅ Test updates before merging
- ✅ Fast-track security updates
- ✅ Monitor npm advisories
- ✅ Keep Node.js updated
- ✅ Document dependency decisions
- ✅ Use exact versions for critical packages
- ✅ Review dependency changelogs

### ❌ DON'T:

- ❌ Ignore npm audit warnings
- ❌ Auto-merge without tests
- ❌ Use untrusted dependencies
- ❌ Pin old vulnerable versions
- ❌ Disable npm audit
- ❌ Remove package-lock.json
- ❌ Skip security update reviews
- ❌ Use deprecated packages
- ❌ Trust unverified sources
- ❌ Delay critical security updates

---

## Common Issues & Solutions

### Issue 1: npm audit Fails, Can't Fix

**Problem:**
```
npm audit fix
up to date, audited 250 packages
found 3 vulnerabilities
  1 critical
  2 high
```

**Causes:**
- Dependency conflict (package A requires lodash 3.x, package B requires 4.x)
- No patched version available yet
- Breaking change in patched version

**Solutions:**
```bash
# 1. Check if update exists
npm view vulnerable-package versions

# 2. Check for PR/issue on GitHub
# Does it have a fix in development?

# 3. Consider alternatives
# Is there a maintained fork?

# 4. Force update (use with caution)
npm install vulnerable-package@fixed-version --save
npm audit

# 5. Report to maintainers
# File issue if no fix exists
```

### Issue 2: Renovate Creates Too Many PRs

**Problem:** Renovate creates 50+ PRs per week

**Solution:**
```json
{
  "packageRules": [
    {
      "matchDatasources": ["npm"],
      "matchUpdateTypes": ["patch"],
      "groupName": "Patch updates",
      "schedule": ["after 10pm on Sunday"]
    }
  ]
}
```

### Issue 3: Dependency Conflict

**Problem:**
```
npm ERR! peer dep missing: react@^17.0.0, required by package-a@1.0.0
npm ERR! peer dep missing: react@^18.0.0, required by package-b@1.0.0
```

**Solution:**
```bash
# Option 1: Check if peer dep is optional
npm install --no-optional

# Option 2: Update conflicting package
npm install package-a@latest  # Version with react 18 support

# Option 3: Use npm override
```

---

## Tools & Resources

| Tool | Purpose | Cost |
|------|---------|------|
| `npm audit` | Built-in vulnerability scanning | Free |
| Renovate | Automated dependency updates | Free (GitHub) |
| Snyk | SCA + real-time monitoring | Paid (free tier) |
| Dependabot | GitHub native dependency management | Free |
| OWASP Dependency Check | Offline SCA tool | Free |
| npm advisories | Security advisory database | Free |

---

## Related Files

- **Workflow:** `.github/workflows/deploy-frontend.yml`
- **Config:** `package.json`, `package-lock.json`
- **Renovate Config:** `.renovaterc` (if configured)
- **CI/CD Secrets:** See [CI Secrets Documentation](./ci-secrets.md)

---

## References

- [npm audit Documentation](https://docs.npmjs.com/cli/v10/commands/npm-audit)
- [npm Security Advisories](https://advisories.npmjs.com/)
- [Renovate Documentation](https://docs.renovatebot.com/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)
- [Software Composition Analysis Explained](https://www.gartner.com/en/information-technology/glossary/software-composition-analysis-sca)

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready  
**Priority:** High (Prevents supply chain attacks)
