# Platform & Deployment Security

## Overview

Platform security covers the deployment infrastructure, dependency management, and operational security for StockEase Frontend. This includes protecting CI/CD pipelines, managing build-time configuration, securing dependencies, and hardening the production environment through nginx headers and deployment practices.

---

## Security Domains

### 1. **Dependency Management & Supply Chain Security**
📄 [dependencies.md](./dependencies.md)

**Topics Covered:**
- npm audit for vulnerability scanning
- Renovate bot for automated dependency updates
- Software Composition Analysis (SCA) configuration
- Dependency resolution and conflict detection
- Vulnerability triage and severity assessment
- Version pinning strategies
- Security.md disclosure file setup

**Key Practices:**
- Regular security audits with `npm audit`
- Automated patch updates via Renovate
- Compliance tracking with SCA tools
- Vulnerability severity classification

**Status:** ✅ Configured

---

### 2. **CI/CD Pipeline & Secrets Management**
📄 [ci-secrets.md](./ci-secrets.md)

**Topics Covered:**
- GitHub Secrets for sensitive configuration
- OIDC (OpenID Connect) token-based authentication
- Secret masking in workflow logs
- Secret rotation and expiration practices
- Workflow permission scoping
- Environment-specific secrets
- Testing secrets access in CI/CD

**Key Practices:**
- Store all secrets in GitHub Secrets (never in code)
- Use OIDC tokens instead of long-lived credentials
- Mask sensitive values in logs
- Rotate secrets on a schedule
- Limit workflow permissions to minimum required
- Test secret access without exposing values

**Secrets Currently Used:**
| Secret | Purpose | Used In |
|--------|---------|---------|
| `FRONTEND_API_BASE_URL` | API endpoint for production | Build args |
| `DOCKER_USERNAME` | Docker Hub authentication | Registry push |
| `DOCKER_PASSWORD` | Docker Hub token | Registry push |
| `DEPLOY_SSH_KEY` | SSH key for deployment | SSH connections |
| `DEPLOY_HOST` | Production server hostname | Deployment target |
| `DEPLOY_PORT` | SSH port for deployment | Deployment target |

**Status:** ✅ Configured

---

### 3. **Security Headers & nginx Configuration**
📄 [headers-and-nginx.md](./headers-and-nginx.md)

**Topics Covered:**
- HTTP security headers (clickjacking, MIME sniffing, XSS)
- X-Content-Type-Options (MIME type sniffing prevention)
- X-Frame-Options (clickjacking prevention)
- X-XSS-Protection (legacy XSS protection)
- Referrer-Policy (prevent referrer leakage)
- HSTS (force HTTPS)
- CSP (Content Security Policy)
- nginx configuration and best practices

**Security Headers Implemented:**
| Header | Value | Purpose | Status |
|--------|-------|---------|--------|
| X-Content-Type-Options | nosniff | Prevent MIME sniffing | ✅ |
| X-Frame-Options | DENY | Prevent clickjacking | ✅ |
| X-XSS-Protection | 1; mode=block | Legacy XSS protection | ✅ |
| Referrer-Policy | strict-origin-when-cross-origin | Prevent referrer leakage | ✅ |
| Strict-Transport-Security | Not configured | Force HTTPS | ⚠️ Recommended |
| Content-Security-Policy | Not configured | Control content sources | ⚠️ Recommended |

**Key Practices:**
- Always set `always` flag for headers (even on errors)
- Test headers with curl or online tools
- Start conservative with max-age values
- Apply headers at server level (not per-route)
- Monitor header compliance

**Status:** ✅ Partially Configured (HSTS & CSP Recommended)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Source Code + package.json + ops/nginx/nginx.conf   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │   GitHub Actions   │ (CI/CD)
                   │  - Dependency Audit│
                   │  - Build Image     │
                   │  - Push Registry   │
                   │  - Deploy Server   │
                   └──────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼─────┐         ┌────▼──────┐      ┌──────▼─────┐
   │   Docker │         │  Docker   │      │  Production│
   │  Registry│         │ Container │      │   Server   │
   │(secrets) │         │           │      │  (nginx)   │
   └──────────┘         └─────┬─────┘      └──────▲─────┘
                              │                   │
                              │   SSH Deploy      │
                              └───────────────────┘
                        DEPLOY_SSH_KEY
                        (GitHub Secret)
```

---

## Security Checklist

### ✅ Dependency Management
- [ ] Run `npm audit` regularly
- [ ] Review Renovate updates weekly
- [ ] Check SCA tool for vulnerabilities
- [ ] Update critical vulnerabilities immediately
- [ ] Test updates before production

### ✅ CI/CD Pipeline
- [ ] All secrets in GitHub Secrets (not code)
- [ ] Use OIDC tokens for authentication
- [ ] Mask secrets in logs
- [ ] Rotate long-lived secrets monthly
- [ ] Review workflow permissions quarterly
- [ ] Limit deployment access to specific branches

### ✅ nginx Security
- [ ] Verify all security headers present
- [ ] Test with curl or online tools
- [ ] Monitor header compliance
- [ ] Keep nginx updated
- [ ] Review header policies quarterly
- [ ] Test HTTPS redirect functionality
- [ ] Consider HSTS implementation
- [ ] Implement CSP headers

### ✅ Docker Security
- [ ] Use specific image versions (not `latest`)
- [ ] Run as non-root user
- [ ] Keep base image updated
- [ ] Scan images for vulnerabilities
- [ ] Use multi-stage builds (minimize size)
- [ ] Don't include secrets in image

---

## Vulnerability Response Process

### 1. Detection
```
npm audit → Vulnerability found
            ↓
GitHub Renovate → Creates PR
                 ↓
            Automated tests run
```

### 2. Assessment
```
Evaluate severity:
├─ Critical → Fix immediately
├─ High → Fix within 1 week
├─ Medium → Fix within 1 month
└─ Low → Fix in next release
```

### 3. Remediation
```
Update dependency:
├─ npm install updated-package@x.y.z
├─ Run tests
├─ Review changes
├─ Merge to main
└─ Deploy
```

### 4. Monitoring
```
Ongoing:
├─ Weekly audit runs
├─ Renovate updates
├─ SCA tool checks
└─ GitHub Dependabot alerts
```

---

## Configuration Files

### Relevant Files

```
frontend/
├── ops/nginx/nginx.conf          (Security headers, caching)
├── Dockerfile                     (Build environment, base image)
├── package.json                   (Dependencies)
├── package-lock.json              (Locked versions)
└── .github/
    └── workflows/
        └── deploy-frontend.yml    (CI/CD with secrets)
```

### nginx Configuration Location

```nginx
# File: ops/nginx/nginx.conf
server {
  listen 80;
  
  # =========================================================================
  # Security Headers
  # =========================================================================
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

---

## Related Security Domains

### Frontend Security
- [Frontend Security Overview](../frontend/overview.md)
  - XSS prevention and input sanitization
  - Content Security Policy setup
  - CORS and CSRF protection
  - Secrets management in frontend code

### API Communication
- [API Communication Overview](../api-communication/overview.md)
  - JWT token authentication
  - Request/response interceptors
  - Error handling and logging
  - API error handling

### Authentication & Authorization
- [Authentication Overview](../auth/overview.md)
  - JWT token management
  - Authentication flow
  - Authorization rules
  - Token refresh strategy

---

## Next Steps & Recommendations

### Immediate (High Priority)
1. ✅ Implement security headers (DONE)
2. ✅ Configure CI/CD secrets (DONE)
3. ✅ Setup dependency scanning (DONE)
4. ⏳ **Enable HSTS headers** (See headers-and-nginx.md for implementation)

### Short Term (1-2 months)
1. Implement full CSP headers (See CSP documentation in frontend security)
2. Add subresource integrity (SRI) for CDN resources
3. Setup continuous compliance monitoring
4. Quarterly security header audit

### Long Term (Ongoing)
1. Incident response plan for supply chain attacks
2. Security training for developers
3. Regular penetration testing
4. Annual security audit

---

## Monitoring & Compliance

### Weekly Tasks
```bash
# Check for dependency vulnerabilities
npm audit

# Monitor Renovate PR status
# (GitHub notifications)
```

### Monthly Tasks
- Review GitHub Secrets usage
- Update security policies
- Check npm audit summary
- Verify HTTPS compliance

### Quarterly Tasks
- Full security header audit
- Penetration testing
- Access control review
- Dependency update analysis

---

## References

- [npm Security Best Practices](https://docs.npmjs.com/security)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [Renovate Documentation](https://docs.renovatebot.com/)
- [OWASP Security Headers](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_for_Your_Website_Cheat_Sheet.html)
- [nginx Security](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---

**Last Updated:** November 13, 2025  
**Status:** Implemented (Partial - HSTS & CSP Recommended)  
**Maintainer:** Frontend Security Team
