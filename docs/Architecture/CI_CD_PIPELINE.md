# CI/CD Pipeline Documentation

## Overview

This document describes the automated Continuous Integration/Continuous Deployment (CI/CD) pipeline for the StockEase Frontend application.

---

## Pipeline Architecture

The pipeline is divided into **2 stages**:

### Stage 1: Test (Runs on all commits & PRs)
- ✅ Runs on every push and pull request
- ✅ Runs linter and unit/integration tests
- ✅ Reports test results back to GitHub
- ✅ Generates coverage reports
- ❌ Does NOT deploy
- **Purpose**: Catch issues early before code is merged

### Stage 2: Build & Deploy (Runs only on successful push to main/master)
- ✅ Runs only on successful push to `master` or `main` branch
- ✅ Only executes after Stage 1 tests pass
- ✅ Skipped on pull requests (tests only)
- ✅ Builds production Docker image
- ✅ Deploys to production (Vercel)
- **Purpose**: Automatically deploy tested code to production

---

## File Structure

```
.github/workflows/
├── deploy-frontend.yml          # Main CI/CD pipeline
.dockerignore                     # Excludes test files & docs from Docker image
Dockerfile                        # Multi-stage build (optimized, no tests)
```

---

## What Gets Deployed to Production?

### ✅ Included in Production Build
- `/src` - Application source code
- `/public` - Static assets
- Built `/dist` - Compiled production bundle
- Configuration files (vite.config.ts, tsconfig.json, etc.)
- Nginx configuration

### ❌ Excluded from Production Build
- `/src/__tests__` - Test files
- `docs/` - Documentation directory
- `*.test.ts`, `*.test.tsx` - Test files
- `*.spec.ts`, `*.spec.tsx` - Spec files
- `vitest.config.ts` - Test configuration
- `.github/` - GitHub configuration
- `*.md` - Markdown documentation files
- `node_modules/` - Dependencies (reinstalled from package.json)

---

## GitHub Secrets Required

Add these secrets to your repository settings (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VERCEL_TOKEN` | Vercel deployment token | `vercel_...` |
| `FRONTEND_API_BASE_URL` | API base URL for production | `https://api.stockease.com` |

### How to get VERCEL_TOKEN:
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy and paste into GitHub Secrets

### How to set FRONTEND_API_BASE_URL:
1. Get your production API URL
2. Add to GitHub Secrets as `FRONTEND_API_BASE_URL`

---

## Pipeline Triggers

### Stage 1: Test Suite
**Triggers on:**
- ✅ Every push to `master` or `main`
- ✅ Every pull request to `master` or `main`

**Example:**
```bash
git push origin feature-branch            # Triggers test on PR
git push origin main                       # Triggers test + deploy
```

### Stage 2: Build & Deploy
**Triggers on:**
- ✅ Push to `master` or `main` (only if tests pass)
- ❌ NOT on pull requests (tests only)

**Example:**
```bash
git push origin main                       # Triggers test + deploy
git push origin feature-branch             # Triggers test only
```

---

## How to Use

### For Development (Feature Branches)
1. Create a feature branch
2. Make changes
3. Push to GitHub
4. **Tests will run automatically** (but NOT deploy)
5. Create a Pull Request
6. **Tests run again** on the PR
7. After review and merge, code is deployed

### For Production Deployments
1. Ensure your code is on `master` or `main` branch
2. Push changes to the branch
3. **Pipeline automatically:**
   - Runs all tests
   - Builds production Docker image
   - Deploys to Vercel
4. Check the "Actions" tab in GitHub to see deployment status

---

## Monitoring & Troubleshooting

### View Pipeline Status
1. Go to GitHub repository
2. Click "Actions" tab
3. See all workflow runs with status (✓ pass or ✗ fail)

### View Logs
1. Click on a specific workflow run
2. Click on the failed job (if any)
3. Expand the step to see detailed logs

### Common Issues

#### Tests Fail
- Check the test output in the "Run tests" step
- Fix the failing tests locally
- Push the fix to trigger the pipeline again

#### Docker Build Fails
- Check the "Build Docker image" step logs
- Ensure no test files or docs are being included
- Verify `.dockerignore` is correct

#### Deployment Fails
- Check `VERCEL_TOKEN` secret is set correctly
- Check `FRONTEND_API_BASE_URL` secret is set
- Verify Vercel project is configured correctly

#### Secrets Not Found
- Go to Settings → Secrets and variables → Actions
- Verify secret names are exactly: `VERCEL_TOKEN`, `FRONTEND_API_BASE_URL`
- Secrets are case-sensitive!

---

## Dockerfile Optimization

The updated Dockerfile now:
1. **Excludes test files** - Uses explicit COPY commands
2. **Excludes documentation** - Uses `.dockerignore`
3. **Reduces image size** - Only copies necessary files
4. **Faster builds** - Fewer files to copy
5. **Cleaner production** - No unnecessary files

**Before**: 
```dockerfile
COPY . .                    # Copies everything including tests & docs
```

**After**:
```dockerfile
COPY src/ src/
COPY public/ public/
COPY index.html index.html
# ... other config files only
# Uses .dockerignore to exclude everything else
```

---

## Test Execution

### What Tests Run?
- All files in `src/__tests__/` with patterns:
  - `*.test.ts`
  - `*.test.tsx`
  - `*.spec.ts`
  - `*.spec.tsx`

### Test Framework
- **Vitest** v4.0.8 (configured in `vitest.config.ts`)
- **React Testing Library** for component tests
- **User Event** for user interaction simulation

### Coverage Requirements
- Phase 1: ✅ 109 tests (all passing)
- Phase 2: ⏳ 49 tests (ready to implement)
- Phase 3: ⏳ 46+ tests (ready to implement)

---

## Production Safety Checklist

Before each deployment, the pipeline verifies:

✅ **Tests Pass**
- All unit tests pass
- All integration tests pass
- ESLint passes

✅ **Build Succeeds**
- Vite build completes successfully
- No TypeScript errors
- No CSS/asset errors

✅ **Docker Image Built**
- Docker image builds without errors
- VITE_API_BASE_URL correctly set
- All config files present

✅ **No Test Files in Production**
- `/src/__tests__` excluded
- `*.test.*` files not included
- `vitest.config.ts` excluded

✅ **No Docs in Production**
- `/docs` directory excluded
- `*.md` files excluded
- README excluded from production build

✅ **Correct Deployment Target**
- VERCEL_TOKEN is valid
- FRONTEND_API_BASE_URL is set
- Deployment confirmed on Vercel dashboard

---

## Deployment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer pushes code                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │  STAGE 1: Test Suite          │
         │  (Runs on ALL push/PR)        │
         ├───────────────────────────────┤
         │ ✓ Checkout code               │
         │ ✓ Install dependencies        │
         │ ✓ Run linter                  │
         │ ✓ Run tests                   │
         │ ✓ Generate coverage           │
         └────────┬────────────────┬─────┘
                  │                │
           ✓ PASS │                │ ✗ FAIL
                  │                │
                  ▼                ▼
    ┌─────────────────────┐   ┌──────────────┐
    │ Continue to Stage 2 │   │ Report error │
    │ (if on master/main) │   │ Stop pipeline│
    └──────────┬──────────┘   └──────────────┘
               │
    ┌──────────▼──────────────────────────┐
    │  STAGE 2: Build & Deploy            │
    │  (Runs ONLY on master/main)         │
    ├─────────────────────────────────────┤
    │ ✓ Build production bundle           │
    │ ✓ Verify no tests in dist/          │
    │ ✓ Build Docker image                │
    │ ✓ Deploy to Vercel                  │
    │ ✓ Send summary notification         │
    └──────────┬─────────────────┬────────┘
               │                 │
        ✓ SUCCESS              ✗ FAILURE
               │                 │
               ▼                 ▼
    ┌──────────────────┐  ┌──────────────┐
    │ Production Live! │  │ Notify error │
    │ ✓ Tests passed   │  │ Fix & retry  │
    │ ✓ Build OK       │  │              │
    │ ✓ Deployed ✓     │  │              │
    └──────────────────┘  └──────────────┘
```

---

## Next Steps

### Phase 2: Implementation
After verifying this pipeline works:

1. ✅ Run tests locally: `npm test -- --run`
2. ✅ Commit changes: `git add . && git commit -m "CI/CD: Add pipeline and tests"`
3. ✅ Push to main: `git push origin main`
4. ✅ Watch Actions tab for pipeline to run
5. ✅ Once deployed, proceed to Phase 2 (49 more tests)

### Phase 2 Timeline
- Header tests (12 tests) - ~1 hour
- Sidebar tests (12 tests) - ~1 hour
- HelpModal tests (10 tests) - ~45 minutes
- Footer tests (8 tests) - ~45 minutes
- DashboardLogic tests (7 tests) - ~1 hour
- **Total Phase 2**: ~4.5 hours, 49 tests

---

## Useful Commands

```bash
# Run tests locally
npm test -- --run

# Run tests with coverage
npm run test:coverage

# Build production bundle
npm run build

# Build Docker image locally
docker build -f Dockerfile -t stockease-frontend:local .

# View GitHub Actions locally (with act)
act -j build-and-deploy

# Run linter
npm run lint

# Run linter with fix
npm run lint:fix
```

---

## Support & Debugging

### Pipeline stuck or not running?
1. Check GitHub Actions permissions are enabled
2. Verify secrets are set in Settings → Secrets
3. Check branch name is `master` or `main`
4. Review .github/workflows/ file syntax

### Tests failing after changes?
1. Run tests locally: `npm test -- --run`
2. Fix any failing tests
3. Commit and push: `git push origin branch-name`
4. Pipeline will automatically retry

### Deployment not working?
1. Verify VERCEL_TOKEN is set and valid
2. Check FRONTEND_API_BASE_URL is correct
3. View Vercel dashboard for deployment status
4. Check pipeline logs for detailed error messages

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Testing Framework](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Vercel Deployment Platform](https://vercel.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated**: 2024-11-10  
**Status**: ✅ Production Ready
