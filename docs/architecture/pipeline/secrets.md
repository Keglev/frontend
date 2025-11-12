# Secrets & Environment Configuration

## Overview

GitHub Secrets are used to securely store sensitive configuration like API endpoints and credentials. These are referenced in the pipeline without exposing values.

---

## Required Secrets

### FRONTEND_API_BASE_URL

**Purpose**: Production API endpoint  
**Example**: `https://api.stockease.com/api`  
**Usage**: Injected as `VITE_API_BASE_URL` during build  
**Required**: Yes

### DOCKER_USERNAME

**Purpose**: Docker registry login username  
**Example**: `myusername`  
**Usage**: Docker login for pushing images  
**Required**: If using Docker registry

### DOCKER_PASSWORD

**Purpose**: Docker registry authentication token  
**Example**: `dckr_pat_xxxxx`  
**Usage**: Docker login for pushing images  
**Required**: If using Docker registry

### DEPLOY_SSH_KEY

**Purpose**: SSH key for production server access  
**Usage**: Deploying to self-hosted server  
**Required**: If using SSH deployment

### DEPLOY_HOST

**Purpose**: Production server IP or domain  
**Example**: `prod.stockease.com`  
**Usage**: SSH deployment target  
**Required**: If using SSH deployment

---

## Setting Secrets in GitHub

### Step 1: Go to Repository Settings

1. Navigate to your GitHub repository
2. Click **Settings** (top-right menu)
3. In left sidebar, select **Secrets and variables** → **Actions**

### Step 2: Create New Secret

1. Click **New repository secret**
2. Enter secret name (e.g., `FRONTEND_API_BASE_URL`)
3. Enter secret value
4. Click **Add secret**

### Step 3: Repeat for All Secrets

Add each required secret following the same process.

---

## Using Secrets in Pipeline

### Reference in Environment

```yaml
env:
  FRONTEND_API_BASE_URL: ${{ secrets.FRONTEND_API_BASE_URL }}
```

### Reference in Steps

```yaml
- name: Build production bundle
  run: |
    export VITE_API_BASE_URL="${{ secrets.FRONTEND_API_BASE_URL }}"
    npm run build
```

### Reference in Docker Build

```yaml
- name: Build Docker image
  run: |
    docker build \
      --build-arg VITE_API_BASE_URL="${{ secrets.FRONTEND_API_BASE_URL }}" \
      -t stockease-frontend:latest .
```

---

## Security Best Practices

### ✅ Do's

- ✓ Use GitHub Secrets for all sensitive data
- ✓ Rotate secrets regularly
- ✓ Use strong, unique values
- ✓ Limit secret access to necessary workflows
- ✓ Log secret usage for audit trail
- ✓ Never commit secrets to repository

### ❌ Don'ts

- ✗ Never hardcode secrets in .yml files
- ✗ Never log or print secret values
- ✗ Never use weak or shared credentials
- ✗ Don't reuse secrets across projects
- ✗ Don't grant all team members secret access
- ✗ Never commit .env files with secrets

---

## Common Secrets by Use Case

### Vercel Deployment

| Secret | Purpose |
|--------|---------|
| VERCEL_TOKEN | Vercel authentication |
| VERCEL_ORG_ID | Vercel organization ID |
| VERCEL_PROJECT_ID | Project ID on Vercel |

### Docker Hub Deployment

| Secret | Purpose |
|--------|---------|
| DOCKER_USERNAME | Docker Hub username |
| DOCKER_PASSWORD | Docker Hub access token |
| DOCKER_REGISTRY | Registry URL (if not Docker Hub) |

### Custom Server Deployment

| Secret | Purpose |
|--------|---------|
| DEPLOY_SSH_KEY | SSH private key |
| DEPLOY_HOST | Server IP/domain |
| DEPLOY_USER | SSH username |
| DEPLOY_PORT | SSH port (default 22) |

### API Configuration

| Secret | Purpose |
|--------|---------|
| FRONTEND_API_BASE_URL | Production API endpoint |
| API_KEY | If API requires key |
| API_SECRET | If API requires secret |

---

## Testing Secrets Access

### Verify Secret is Available

```yaml
- name: Verify secrets
  run: |
    if [ -z "${{ secrets.FRONTEND_API_BASE_URL }}" ]; then
      echo "ERROR: FRONTEND_API_BASE_URL not set!"
      exit 1
    fi
    echo "✓ Secrets configured correctly"
```

### Debugging Secret Issues

1. **Secret not found in workflow**
   - Verify secret name spelling (case-sensitive)
   - Check Settings → Secrets for exact name
   - Ensure workflow has permission to access secrets

2. **Secret value incorrect**
   - Go to Settings → Secrets
   - Edit secret and verify value
   - Common issue: Extra spaces or quotes

3. **Secret not injecting into code**
   - Verify syntax: `${{ secrets.SECRET_NAME }}`
   - Check if using in correct context
   - Secrets only available in GitHub Actions, not in built app

---

## Managing Secrets

### View All Secrets

1. Go to Settings → Secrets and variables → Actions
2. List shows secret names (values hidden)
3. Can only see that secret exists, not its value

### Update Secret

1. Go to Settings → Secrets and variables → Actions
2. Find secret in list
3. Click **pencil icon** to edit
4. Enter new value
5. Click **Update secret**

### Delete Secret

1. Go to Settings → Secrets and variables → Actions
2. Find secret in list
3. Click **trash icon** to delete
4. Confirm deletion
5. Workflow must not reference deleted secret

---

## Environment Variable Best Practices

### In .env Files (Development Only)

```bash
# .env (local development only)
VITE_API_BASE_URL=http://localhost:3000/api
```

### In GitHub Secrets (CI/CD Only)

```yaml
# .github/workflows/deploy.yml
env:
  VITE_API_BASE_URL: ${{ secrets.FRONTEND_API_BASE_URL }}
```

### Never Commit

```bash
# Add to .gitignore
.env
.env.local
.env.*.local
```

---

## Rotating Secrets

### When to Rotate

- Monthly as security best practice
- Immediately if compromised
- After employee departure
- When upgrading to new service version

### How to Rotate

1. Generate new secret value
2. Update in GitHub Settings → Secrets
3. Update in external service (if applicable)
4. Verify workflow still works
5. Keep old value until rotation verified

---

## Related Documentation

- [Main Pipeline Overview](./overview.md)
- [Build & Deployment](./build-deploy.md)
- [Testing Stage](./testing.md)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

---

**Last Updated**: November 2025  
**Security Level**: Production Ready  
**Recommended Rotation**: Monthly

