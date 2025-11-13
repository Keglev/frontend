# CI/CD Secrets & GitHub Actions Security

## Overview

GitHub Actions workflows require secrets for deployment, Docker registries, and external services. This document covers secure secret management, OIDC authentication, and CI/CD pipeline security.

---

## GitHub Actions Secrets

### What are Secrets?

Secrets are encrypted environment variables that GitHub Actions can use without exposing values.

**Key features:**
- Encrypted at rest and in transit
- Masked in logs (shown as `***`)
- Accessible only to workflow runs
- Cannot be accessed from outside GitHub
- Per-repository or per-organization

### Creating Secrets

**Step 1: Go to Repository Settings**
1. Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `FRONTEND_API_BASE_URL`
4. Value: `https://api.stockease.com`
5. Click "Add secret"

**Step 2: Use in Workflow**
```yaml
# .github/workflows/deploy.yml
env:
  VITE_API_BASE_URL: ${{ secrets.FRONTEND_API_BASE_URL }}

- name: Build
  run: npm run build
```

### Secret Naming Conventions

**Recommended pattern:**
```
ENVIRONMENT_SERVICE_TYPE

Examples:
- FRONTEND_API_BASE_URL    (Frontend, API, URL)
- DOCKER_USERNAME          (Docker, Registry, Username)
- DOCKER_PASSWORD          (Docker, Registry, Password)
- DEPLOY_SSH_KEY           (Deployment, SSH, Key)
- DEPLOY_HOST              (Deployment, Host)
```

### Organization Secrets

**For shared secrets across repos:**
1. Organization Settings → Secrets and variables → Actions
2. Create secret once
3. Accessible to all repos in organization
4. Control which repos can access

---

## Current Secrets in StockEase

### Required Secrets

**1. FRONTEND_API_BASE_URL**
- **Purpose:** Production API endpoint
- **Example:** `https://api.stockease.com`
- **Used in:** Build stage (Vite replacement)
- **Sensitivity:** Low (endpoint is public)

**2. DOCKER_USERNAME**
- **Purpose:** Docker registry login
- **Example:** `my-dockerhub-username`
- **Used in:** Docker build/push
- **Sensitivity:** Medium

**3. DOCKER_PASSWORD**
- **Purpose:** Docker registry token/password
- **Example:** `dckr_pat_xxxxx`
- **Used in:** Docker login
- **Sensitivity:** 🔴 Critical (do not share)

**4. VERCEL_TOKEN** (if using Vercel)
- **Purpose:** Vercel deployment authentication
- **Example:** `vercel_xxxxxxxxxxxxxxxx`
- **Used in:** Vercel deploy step
- **Sensitivity:** 🔴 Critical

### Optional Secrets

**DEPLOY_SSH_KEY** (if using SSH deployment)
- Private SSH key for server access
- Sensitivity: 🔴 Critical

**DEPLOY_HOST**
- Server IP or hostname
- Sensitivity: Low

**DEPLOY_USER**
- SSH username
- Sensitivity: Low

---

## Secure Secret Handling

### ✅ Safe Practices

**Masking in Logs:**
```yaml
- name: Build Docker
  env:
    DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  run: |
    # Secret is automatically masked
    docker login -u user -p $DOCKER_PASSWORD
    # Output shows: docker login -u user -p ***
```

**Using in Scripts:**
```yaml
- name: Deploy
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    # Secret available as environment variable
    # Automatically masked in logs
    curl -H "X-API-Key: $API_KEY" https://api.example.com
```

### ❌ Dangerous Practices

**Don't echo secrets:**
```yaml
# ❌ WRONG (secrets printed to log)
run: echo "Secret is: ${{ secrets.MY_SECRET }}"
```

**Don't save to files (unless encrypted):**
```yaml
# ❌ WRONG (secret written to file in logs)
run: echo ${{ secrets.MY_SECRET }} > ~/.ssh/key
```

**Don't pass through stdout:**
```yaml
# ❌ WRONG (secret visible in output)
run: some-command "${{ secrets.MY_SECRET }}" 2>&1
```

**Don't add to environment variables without reason:**
```yaml
# ❌ WRONG (all env vars logged)
env:
  EVERYTHING: ${{ toJson(secrets) }}
```

---

## OIDC (OpenID Connect) Authentication

### What is OIDC?

OIDC is a modern alternative to static API tokens:
- **No static secrets stored** (reduces compromise risk)
- **Temporary credentials** (short-lived)
- **Per-workflow authentication** (least privilege)
- **Auditability** (tracks which workflow used credentials)

### How OIDC Works

```
GitHub Actions Workflow
  ↓
Request OIDC token from GitHub
  ↓
GitHub issues short-lived OIDC token
  ↓
Workflow exchanges OIDC token for AWS/cloud credentials
  ↓
Cloud provider validates GitHub's signature
  ↓
Temporary credentials issued (15 minutes)
  ↓
Workflow uses credentials for deployment
  ↓
Credentials automatically expire
```

### OIDC Benefits

✅ **No Static Secrets**
- No token/password stored in GitHub
- No risk of token compromise
- No token rotation needed

✅ **Short-lived Credentials**
- Auto-expire after 15 minutes
- Limits damage if leaked
- Smaller window for exploitation

✅ **Per-Workflow Audit Trail**
- Track which workflow used credentials
- When and for how long
- Compliance-friendly

✅ **Least Privilege**
- Grant specific permissions per workflow
- Only what's needed for that deployment
- Reduce blast radius

### Implementing OIDC (AWS Example)

**Step 1: Trust GitHub in AWS IAM**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Keglev/stockease-frontend:*"
        }
      }
    }
  ]
}
```

**Step 2: Workflow Configuration**
```yaml
name: Deploy with OIDC

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::ACCOUNT-ID:role/GithubActionsRole
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: aws s3 sync dist/ s3://my-bucket/
```

### OIDC vs Static Secrets

| Aspect | OIDC | Static Secrets |
|--------|------|----------------|
| Rotation | Automatic | Manual |
| Storage | None | GitHub |
| Lifetime | 15 minutes | Until revoked |
| Audit Trail | Per workflow | General |
| Complexity | Higher | Lower |
| Security | Better | Good |

---

## Secret Rotation

### When to Rotate

🔴 **Immediately:**
- Secret compromised
- Employee departure
- Credential leak detected
- Suspicious activity

🟡 **Regularly:**
- Monthly (best practice)
- Quarterly (minimum)
- After major incidents

### Rotation Process

**Step 1: Generate New Secret**
```bash
# For API keys
openssl rand -base64 32

# For SSH keys
ssh-keygen -t rsa -b 4096 -f new_key -N ""
```

**Step 2: Update in GitHub**
1. Settings → Secrets
2. Edit secret
3. Enter new value
4. Click "Update secret"

**Step 3: Update in External Service**
```bash
# Docker Hub
docker logout
docker login  # Use new token

# AWS
aws configure  # Set new credentials
```

**Step 4: Verify Workflow Still Works**
```bash
# Trigger manual workflow run
# Verify deployment succeeds
# Check logs show successful authentication
```

**Step 5: Document Change**
```markdown
2025-11-13: Rotated DOCKER_PASSWORD
2025-11-13: Rotated VERCEL_TOKEN
```

---

## Secret Scanning & Leak Detection

### GitHub Secret Scanning

GitHub automatically scans for exposed secrets:

**What it detects:**
- GitHub tokens
- AWS credentials
- Docker tokens
- Private keys
- API keys (various services)

**When it triggers:**
- Commit pushed to repo
- PR created
- Code review

**Notifications:**
- Repository maintainer notified
- Alert in Security tab
- Can dismiss (if false positive)

### Preventing Accidental Leaks

**1. Pre-commit Hook**
```bash
#!/bin/bash
# .git/hooks/pre-commit

if git diff --cached | grep -i "password\|secret\|token\|api_key"; then
  echo "❌ ERROR: Possible secret in commit"
  exit 1
fi
```

**2. .gitignore**
```bash
# Exclude sensitive files
.env.local
.env.*.local
*.key
*.pem
deploy_key
```

**3. Audit Before Commit**
```bash
# View staged changes
git diff --cached

# Check for sensitive patterns
git diff --cached | grep -E "password|secret|token|api_key"
```

### If Secret Leaked

**1. Revoke Immediately**
```bash
# For GitHub token
# Settings → Developer settings → Personal access tokens
# Click "Delete"

# For API keys
# Service console → API Keys → Revoke
```

**2. Create New Secret**
```bash
# Generate new credentials
```

**3. Update in GitHub**
```bash
# Settings → Secrets and variables → Actions
# Edit secret with new value
```

**4. Check Logs**
```bash
# Verify no unauthorized access
# Check deployment logs
```

**5. Document Incident**
```markdown
INCIDENT: Secret leaked in commit abc123
- Revoked: DOCKER_PASSWORD
- Created: New Docker token
- Updated: GitHub secret
- Time to fix: 5 minutes
- Impact: None (caught immediately)
```

---

## Workflow Security Best Practices

### ✅ DO:

- ✅ Use secrets for all sensitive data
- ✅ Rotate secrets regularly (monthly)
- ✅ Audit secret usage
- ✅ Use OIDC when possible
- ✅ Enable branch protection
- ✅ Require PR reviews before deployment
- ✅ Log all deployments
- ✅ Limit secret access to needed workflows
- ✅ Monitor failed workflow runs

### ❌ DON'T:

- ❌ Hardcode secrets in YAML
- ❌ Echo secrets to logs
- ❌ Store secrets locally without encryption
- ❌ Share secrets via email/chat
- ❌ Use personal access tokens (use OIDC instead)
- ❌ Keep old secrets after rotation
- ❌ Allow unreviewed deploys
- ❌ Grant secrets to unnecessary workflows
- ❌ Ignore security alerts

---

## Workflow Configuration

### Basic Workflow

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ master, main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Build
        env:
          VITE_API_BASE_URL: ${{ secrets.FRONTEND_API_BASE_URL }}
        run: npm run build
      
      - name: Deploy
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npx vercel deploy --prod --token $VERCEL_TOKEN
```

### With Docker

```yaml
- name: Login to Docker
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: myregistry/myimage:latest
    build-args: |
      VITE_API_BASE_URL=${{ secrets.FRONTEND_API_BASE_URL }}
```

---

## Troubleshooting

### Issue: Secret Not Available in Workflow

**Symptom:**
```
Error: FRONTEND_API_BASE_URL is empty
```

**Causes:**
- Secret name misspelled (case-sensitive)
- Secret not created in this repository
- Workflow doesn't have permission

**Solution:**
```bash
# Verify secret exists
# Settings → Secrets and variables → Actions
# Check name matches exactly: FRONTEND_API_BASE_URL

# Verify syntax in workflow
# Should be: ${{ secrets.FRONTEND_API_BASE_URL }}
# Not: $FRONTEND_API_BASE_URL or ${FRONTEND_API_BASE_URL}
```

### Issue: Secret Visible in Logs

**Symptom:**
```
Step logs show: docker login -u user -p dckr_pat_xxxxx
```

**Causes:**
- Secret printed directly
- Saved to file and file displayed
- Passed through stdout

**Solution:**
```yaml
# ✅ Correct: Use official actions that handle secrets
- uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}

# ❌ Wrong: Manual login
run: docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
```

### Issue: Can't Access Secret from Organization

**Symptom:**
```
Error: Secret DEPLOY_SSH_KEY is not available
```

**Cause:**
- Organization secret not shared with repository

**Solution:**
1. Organization Settings → Secrets and variables → Actions
2. Click on organization secret
3. Under "Repository access" → Add repository
4. Select stockease-frontend repo

---

## Related Files

- **Main Workflow:** `.github/workflows/deploy-frontend.yml`
- **Secrets Management:** Settings → Secrets and variables → Actions
- **Dependencies:** See [Dependency Management](./dependencies.md)
- **Headers:** See [Headers & nginx Security](./headers-and-nginx.md)

---

## References

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [GitHub OIDC Provider](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)

---

**Last Updated:** November 13, 2025  
**Status:** Production-Ready  
**Priority:** Critical (Prevents credential compromise)
