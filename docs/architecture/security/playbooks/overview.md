# Security Playbooks

## Overview

Security playbooks are step-by-step operational procedures for handling security incidents, planned maintenance, and emergency scenarios. These playbooks ensure consistent, repeatable responses to common security situations in StockEase Frontend.

---

## Playbooks Index

### 1. **Token Revocation & Forced Logout**
📄 [revoke-tokens.md](./revoke-tokens.md)

**Purpose:** Handle forced user logout scenarios, revoke compromised tokens, and manage session termination.

**Key Topics:**
- When to revoke tokens (security incidents, account changes, policy updates)
- Token revocation methods (server-side blacklist, distributed cache, client-only)
- Current logout implementation vs. recommended improvements
- Batch token revocation for incidents
- Monitoring and verification
- Emergency response procedures

**Use Cases:**
```
Scenario: User reports account compromise
├─ Follow: Token Revocation & Forced Logout
├─ Action: Revoke all tokens for user
├─ Result: User forced to re-authenticate
└─ Follow-up: Password reset + security audit
```

**Current Implementation:**
- ✅ Client-side logout (remove token from localStorage)
- ❌ Server-side blacklist (not implemented - recommended)
- ❌ Batch revocation (not implemented - needed for incidents)

**Recommended Actions:**
1. Implement server-side token blacklist (Redis)
2. Create revocation endpoint for manual/programmatic revocation
3. Setup batch revocation for security incidents
4. Add audit logging for all revocations

---

### 2. **Key Rotation & Rollout**
📄 [key-rotation.md](./key-rotation.md)

**Purpose:** Plan and execute JWT signing key rotations, maintain availability, and recover from incidents.

**Key Topics:**
- Why rotate keys (security, compliance, maintenance)
- Current key architecture (HS256, environment variables)
- Three rotation strategies:
  - **Immediate** (emergency - key compromise)
  - **Graceful** (planned - 3-4 week rollout)
  - **Rolling** (continuous - 4 week rotation by cohort)
- Step-by-step rollout procedures
- Emergency rollback process
- Monitoring and metrics
- Key rotation schedule

**Use Cases:**
```
Scenario: Quarterly scheduled key rotation
├─ Follow: Key Rotation & Rollout
├─ Strategy: Graceful rotation (3-4 weeks)
├─ Timeline: Generate → Deploy dual-key → Monitor → Deprecate
└─ Result: All users migrated to new key

Scenario: Key compromise detected
├─ Follow: Key Rotation & Rollout (Immediate strategy)
├─ Timeline: Generate new key → Deploy → Force re-login
├─ Duration: < 1 hour
└─ Result: System secure, old tokens invalid
```

**Current Implementation:**
- ❌ Automated rotation (not implemented)
- ❌ Dual-key support (not implemented)
- ❌ Rotation monitoring (not implemented)

**Recommended Actions:**
1. Implement dual-key support in backend
2. Create key rotation monitoring dashboard
3. Schedule quarterly rotation (every 90 days)
4. Setup automated alerts for key rotation events

---

## Quick Reference: When to Use Which Playbook

| Situation | Playbook | Timeline | Impact |
|-----------|----------|----------|--------|
| User forgot password | None (use login) | N/A | None |
| User requests logout | Token Revocation | Immediate | Minimal |
| Account compromise suspected | Token Revocation | < 5 min | User session ends |
| Admin revokes user access | Token Revocation | < 1 min | User forced to login |
| Security breach detected | Token Revocation (batch) | < 30 min | Multiple users affected |
| Quarterly maintenance | Key Rotation (graceful) | 3-4 weeks | Minimal (transparent) |
| Key leaked/compromised | Key Rotation (immediate) | < 1 hour | All users re-login |
| Post-incident analysis | Both | 24 hours | Documentation |

---

## Security Incident Response Flow

### Token Compromise Detected

```
Step 1: Detection & Assessment
├─ Token found in logs/breach
├─ Attacker using token observed
├─ Multiple accounts affected
└─ Severity: CRITICAL

Step 2: Immediate Actions (< 5 min)
├─ See: Token Revocation & Forced Logout
├─ Action: Batch revoke all affected tokens
├─ Result: Tokens immediately invalid
└─ Next: Force affected users to re-login

Step 3: Containment (< 30 min)
├─ Determine scope: How many users?
├─ Determine cause: How was token leaked?
├─ Isolate: Stop further leaks
└─ Notify: Alert security team

Step 4: Recovery (< 1 hour)
├─ See: Key Rotation & Rollout (Immediate strategy)
├─ Action: Rotate signing key if compromised
├─ Result: New tokens cannot be forged
└─ Verify: All old tokens invalid

Step 5: Follow-up (24 hours)
├─ Audit: How did it happen?
├─ Fix: Prevent future leaks
├─ Notify: Communicate with users
├─ Document: Post-incident review
```

---

## Security Checklist for Operations Team

### Daily

- [ ] Monitor authentication metrics
- [ ] Check for unusual token verification errors
- [ ] Review audit logs for revocation activity
- [ ] Verify key rotation schedule remains on track

### Weekly

- [ ] Review token revocation audit log
- [ ] Check Redis cache (revoked tokens) health
- [ ] Monitor dual-key usage (during rotation)
- [ ] Test key rotation playbook (dry run)

### Monthly

- [ ] Full security audit of authentication system
- [ ] Review and update playbooks
- [ ] Test emergency procedures (incident simulation)
- [ ] Update documentation

### Quarterly

- [ ] Execute scheduled key rotation
- [ ] Review and rotate master keys
- [ ] Compliance audit (HIPAA, PCI DSS, SOC 2)
- [ ] Security training for team

---

## Playbook Activation Decision Tree

```
Security Event Detected
│
├─ Is it a token/session issue?
│  │
│  ├─ YES: User logout, permission change, account suspension?
│  │   └─ USE: Token Revocation & Forced Logout
│  │       ├─ Revoke user's tokens
│  │       ├─ Force re-authentication
│  │       └─ Document in audit log
│  │
│  └─ NO: Signing key issue?
│      │
│      ├─ YES: Key compromise suspected or scheduled rotation?
│      │   └─ USE: Key Rotation & Rollout
│      │       ├─ Generate new key
│      │       ├─ Deploy dual-key or immediate rollout
│      │       └─ Monitor migration
│      │
│      └─ NO: Unknown issue
│          └─ ESCALATE: Call incident commander
│
└─ Execute selected playbook
   └─ Document all actions
      └─ Post-incident review
```

---

## Communication Templates

### User Notification: Forced Re-login

```
Subject: Security Update - Please Log In Again

Hi [User],

For your account security, we're requiring all users to log in again.
This is part of our ongoing security maintenance.

Actions needed:
1. Click "Logout" or close your browser
2. Visit https://stockease.com
3. Log in with your credentials

The re-login process takes < 1 minute.

If you have any issues, contact support@stockease.com

Thank you,
Security Team
```

### Security Alert: Incident Response

```
Subject: URGENT - Security Incident Response

Hi Team,

A potential security incident has been detected and identified as [INCIDENT TYPE].

Status: [CONTAINED / IN PROGRESS / RESOLVED]

Timeline:
├─ [TIME] Detected
├─ [TIME] Containment actions started
├─ [TIME] Expected resolution

Impact:
├─ Affected users: [NUMBER]
├─ Service impact: [BRIEF DESCRIPTION]
├─ Data at risk: [YES/NO]

Actions taken:
- [ACTION 1]
- [ACTION 2]
- [ACTION 3]

Next steps:
- [NEXT STEP 1]
- [NEXT STEP 2]

Questions? Contact: security@stockease.com

Incident Commander: [NAME]
```

---

## Tools & Resources

### Monitoring Tools

```javascript
// Key Rotation Monitoring
https://monitoring.stockease.com/dashboards/key-rotation

// Token Revocation Audit
https://logging.stockease.com/queries/token-revocation

// Authentication Metrics
https://metrics.stockease.com/auth/dashboard
```

### Commands Reference

```bash
# Check Redis for revoked tokens
redis-cli keys "revoked_*" | wc -l

# Decode JWT token
jwt decode --secret=$JWT_SECRET <token>

# Generate new signing key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Monitor token verification errors
tail -f /var/log/stockease/auth.log | grep "VERIFICATION_ERROR"

# Check dual-key usage
curl https://api.stockease.com/metrics/auth/keys
```

### Escalation Contacts

```
Authentication Issue:
├─ Level 1: DevOps Team (ops@stockease.com)
├─ Level 2: Security Team (security@stockease.com)
└─ Level 3: CTO (cto@stockease.com)

Security Incident:
├─ Level 1: Security Team (security@stockease.com)
├─ Level 2: Incident Commander (on-call)
└─ Level 3: Executive Team (escalation list)

Key Compromise:
├─ Immediate: Page on-call security engineer
├─ Notify: Incident commander
└─ Execute: Key Rotation (Immediate strategy)
```

---

## Playbook Exercises

### Exercise 1: Quarterly Key Rotation

**Objective:** Test key rotation procedures

**Duration:** 4 weeks
**Environment:** Production (with monitoring)
**Success Criteria:**
- [ ] New key generated and secured
- [ ] Dual-key deployed to all servers
- [ ] Token usage metrics tracked
- [ ] Previous key deprecated
- [ ] Zero downtime
- [ ] Documentation updated

**Runbook:** See [Key Rotation & Rollout](./key-rotation.md)

---

### Exercise 2: Emergency Token Revocation

**Objective:** Test emergency revocation procedures

**Duration:** 1 hour
**Environment:** Staging (simulate production)
**Scenario:** "Admin account compromised, revoke all admin tokens"

**Success Criteria:**
- [ ] All admin tokens revoked in < 5 minutes
- [ ] Audit log records all revocations
- [ ] Affected users notified
- [ ] Users can re-login
- [ ] No legitimate user data lost
- [ ] System performance normal

**Runbook:** See [Token Revocation & Forced Logout](./revoke-tokens.md)

---

### Exercise 3: Incident Simulation

**Objective:** Test full incident response

**Duration:** 2 hours
**Environment:** Staging (full simulation)
**Scenario:** "Signing key found in GitHub repo history"

**Steps:**
1. Detect the compromise
2. Execute Emergency Key Rotation
3. Execute Batch Token Revocation
4. Notify users
5. Post-incident review
6. Document lessons learned

**Success Criteria:**
- [ ] Complete within 1 hour
- [ ] Zero downtime
- [ ] Full audit trail
- [ ] Clear communication
- [ ] Documented response

---

## Related Documentation

### Authentication & Authorization
- [Authentication Flow](../auth/authentication.md)
- [JWT Token Handling](../auth/jwt-tokens.md)
- [Authorization & Access Control](../auth/authorization.md)

### API Security
- [API Communication Security](../api-communication/api-security.md)
- [Error Logging & Monitoring](../api-communication/error-logging.md)

### Frontend Security
- [XSS Prevention & Input Sanitization](../frontend/xss-and-sanitization.md)
- [Secrets & Configuration](../frontend/secrets-config.md)

### Platform Security
- [CI/CD Secrets & Pipeline](../platform/ci-secrets.md)
- [Dependency Management](../platform/dependencies.md)

---

## Playbook Maintenance

### Version Control

```
Last Updated: November 13, 2025
Version: 1.0
Maintained By: Security Team
Review Schedule: Quarterly
```

### Change Log

```
2025-11-13 | v1.0 | Initial creation
           |      | - Token Revocation playbook
           |      | - Key Rotation playbook
           |      | - Incident response procedures
```

### Update Procedure

1. Draft proposed changes
2. Security team review
3. Test changes in staging
4. Update documentation
5. Announce to operations team
6. Archive old version

---

**Last Updated:** November 13, 2025  
**Status:** Operational (Ready for Use)  
**Priority:** High (Incident Response)  
**Maintainer:** Security Operations Team
