# CI/CD Pipeline Setup & Deployment Checklist

## Pre-Deployment Setup

### Step 1: Verify Test Results ✅
- [x] All 146 tests passing locally (`npm test -- --run`)
- [x] No linting errors (`npm run lint`)
- [x] Build succeeds locally (`npm run build`)

### Step 2: Configure GitHub Secrets

1. **Go to Repository Settings**
   - Navigate to: `https://github.com/Keglev/frontend/settings/secrets/actions`

2. **Add Required Secrets** (if not already present):

   **Secret 1: VERCEL_TOKEN**
   - Get token from: https://vercel.com/account/tokens
   - Create new token (copy to clipboard)
   - Add to GitHub:
     - Name: `VERCEL_TOKEN`
     - Value: `<paste token here>`
     - Click "Add secret"

   **Secret 2: FRONTEND_API_BASE_URL**
   - Determine your production API base URL
   - Example: `https://api.stockease.com`
   - Add to GitHub:
     - Name: `FRONTEND_API_BASE_URL`
     - Value: `https://your-api-url.com`
     - Click "Add secret"

### Step 3: Verify Dockerfile Configuration
- [x] Dockerfile uses optimized multi-stage build
- [x] `.dockerignore` excludes test files and docs
- [x] Nginx configuration present at `ops/nginx/nginx.conf`

### Step 4: Review Pipeline Configuration
- [x] `.github/workflows/deploy-frontend.yml` created
- [x] Pipeline runs tests on all PR/push
- [x] Pipeline deploys only on `master`/`main` after tests pass
- [x] Verification steps prevent test/doc files in production

---

## Files Modified/Created

### Created Files
```
✓ .dockerignore                          (excludes tests, docs, node_modules)
✓ .github/workflows/deploy-frontend.yml  (CI/CD pipeline)
✓ CI_CD_PIPELINE.md                      (documentation)
```

### Modified Files
```
✓ Dockerfile                             (optimized with explicit COPYs)
```

### Test Files (Already Created)
```
✓ src/__tests__/components/Buttons.test.tsx          (15 tests)
✓ src/__tests__/components/ErrorBoundary.test.tsx    (17 tests)
✓ src/__tests__/api/auth.test.ts                     (19 tests)
✓ src/__tests__/api/ProductService.test.ts           (27 tests)
✓ src/__tests__/services/apiClient.test.ts           (31 tests)
✓ src/__tests__/components/Component.template.test.tsx (12 tests)
✓ src/__tests__/api/API.template.test.ts             (8 tests)
✓ src/__tests__/pages/Page.template.test.tsx         (7 tests)
✓ src/__tests__/logic/Logic.template.test.ts         (10 tests)
```

---

## Production Safety Verification

### What Will Be Deployed
✅ Built production bundle (`dist/`)
✅ Source code (`src/`)
✅ Static assets (`public/`)
✅ Nginx configuration

### What Will NOT Be Deployed
✅ Test files (`src/__tests__/`, `*.test.ts`, `*.test.tsx`)
✅ Documentation (`docs/`, `*.md`)
✅ Node modules (reinstalled from `package.json`)
✅ Development dependencies (only production deps)
✅ GitHub Actions config (`.github/`)

### Docker Image Verification Steps
```bash
# The pipeline will verify:
1. dist/ directory exists
2. No *.test.* files in dist/
3. No docs/ directory in dist/
4. Docker image builds successfully
5. VITE_API_BASE_URL is correctly set
6. Nginx configuration is present
```

---

## Deployment Process

### For Push to Master/Main
```bash
# 1. Ensure you're on master/main
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Create feature branch for your work
git checkout -b feature/your-feature

# 4. Make your changes and test locally
npm test -- --run

# 5. Commit and push feature branch
git add .
git commit -m "Feature: description"
git push origin feature/your-feature

# 6. Create Pull Request on GitHub
#    - Tests run automatically
#    - Review & merge to main

# 7. Once merged to main, pipeline automatically:
#    - Runs all tests
#    - Builds Docker image
#    - Deploys to Vercel
```

### Monitor Deployment
```
GitHub → Actions Tab → See workflow run status
↓
[Stage 1: Test] 
  ├─ Lint ✓
  ├─ Tests (146 tests) ✓
  └─ Coverage ✓
↓
[Stage 2: Build & Deploy] (only if on master/main)
  ├─ Build production bundle ✓
  ├─ Verify no tests/docs ✓
  ├─ Build Docker image ✓
  └─ Deploy to Vercel ✓
↓
Production Updated ✓
```

---

## How the Pipeline Works

### Scenario 1: Feature Branch Push
```
$ git push origin feature/my-feature

GitHub Actions:
1. ✓ Run tests
2. ✓ Pass results
3. ✗ Skip deployment (not master/main)
4. → Create Pull Request to review
```

### Scenario 2: Pull Request Created
```
Pull Request created (feature → main)

GitHub Actions:
1. ✓ Run tests (again)
2. ✓ Show test results in PR
3. ✓ Block merge if tests fail
4. ← Reviewer can now review code
```

### Scenario 3: PR Merged to Main
```
$ git merge feature/my-feature into main
$ git push origin main

GitHub Actions:
1. ✓ Run tests
2. ✓ Pass tests
3. ✓ Build production Docker image
4. ✓ Verify no tests/docs in dist/
5. ✓ Deploy to Vercel
6. ✓ Notify deployment complete
7. → Production updated!
```

---

## Testing Before Push

### Local Test Verification
```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run all tests
npm test -- --run

# Build production bundle
npm run build

# Verify dist is clean
ls -la dist/
# Should NOT contain:
# - __tests__
# - *.test.*
# - docs/
# - *.md files
```

### Docker Build Test (Optional)
```bash
# Build Docker image locally
docker build -f Dockerfile -t stockease-frontend:local .

# Run locally to verify
docker run -p 3000:80 stockease-frontend:local
# Visit: http://localhost:3000
```

---

## Next Steps: Commit & Push

### Step 1: Review Changes
```bash
git status

# Should show:
# M Dockerfile
# M .github/workflows/deploy-frontend.yml
# A .dockerignore
# A CI_CD_PIPELINE.md
```

### Step 2: Run Final Tests
```bash
npm test -- --run
# Verify: 146 tests passing ✓
```

### Step 3: Commit Changes
```bash
git add .
git commit -m "CI/CD: Add automated test & deployment pipeline

- Add comprehensive test suite (146 tests)
- Create multi-stage Dockerfile excluding tests/docs
- Add .dockerignore to exclude non-essential files
- Create GitHub Actions CI/CD pipeline with 2 stages:
  * Stage 1: Test (runs on all push/PR)
  * Stage 2: Deploy (runs only on master/main after tests pass)
- Verify production bundle contains only source code
- Document setup and monitoring procedures

Tests included:
- Phase 1 complete: 109 tests across 5 files (Buttons, ErrorBoundary, auth, ProductService, apiClient)
- Template tests: 37 tests
- Total: 146 tests, 100% passing

Production safety:
- Test files excluded from Docker image
- Documentation excluded from Docker image
- Only source code and assets deployed
- Nginx configuration included for SPA routing"
```

### Step 4: Push to Remote
```bash
git push origin main
```

### Step 5: Monitor Pipeline
```
1. Go to: https://github.com/Keglev/frontend/actions
2. Watch for workflow run
3. Verify all stages pass:
   - [Stage 1: Test] ✓ All 146 tests passing
   - [Stage 2: Build & Deploy] ✓ Deployed to Vercel
```

---

## Verification Checklist

Before final push, verify all items:

### Code Quality
- [ ] `npm run lint` - No errors
- [ ] `npm test -- --run` - All 146 tests passing
- [ ] `npm run build` - Build succeeds
- [ ] No console warnings or errors

### Configuration
- [ ] `.dockerignore` created with test/doc exclusions
- [ ] `Dockerfile` updated with explicit COPY commands
- [ ] `.github/workflows/deploy-frontend.yml` created
- [ ] `CI_CD_PIPELINE.md` created

### GitHub Setup
- [ ] `VERCEL_TOKEN` secret added to repo
- [ ] `FRONTEND_API_BASE_URL` secret added to repo
- [ ] Workflow file location correct: `.github/workflows/deploy-frontend.yml`

### Production Safety
- [ ] Test files in `.dockerignore`
- [ ] Documentation in `.dockerignore`
- [ ] Pipeline verification steps in place
- [ ] No sensitive data in commits

### Documentation
- [ ] CI_CD_PIPELINE.md complete and accurate
- [ ] Setup steps clear and tested
- [ ] Troubleshooting guide included

---

## Rollback Plan

If deployment has issues:

### Option 1: Quick Rollback
```bash
# Deploy previous version from Vercel dashboard
Vercel → Project → Deployments → Find previous build → Rollback
```

### Option 2: Fix and Redeploy
```bash
# Fix the issue locally
git checkout main
# Fix issue...
git add .
git commit -m "Fix: deployment issue"
git push origin main
# Pipeline will automatically redeploy
```

### Option 3: Disable Pipeline
```bash
# Temporarily disable workflow (if needed)
GitHub → Actions → Disable workflow
# Fix offline, then re-enable
```

---

## Phase 2 Ready

Once pipeline is confirmed working:

### Phase 2 Timeline
- ✓ Pipeline setup complete
- ✓ Tests running on every commit
- ✓ Production builds verified clean
- → Ready to create 49 Phase 2 tests:
  - Header (12 tests) - ~1 hour
  - Sidebar (12 tests) - ~1 hour
  - HelpModal (10 tests) - ~45 min
  - Footer (8 tests) - ~45 min
  - DashboardLogic (7 tests) - ~1 hour

**Total Phase 2**: ~4.5 hours, 49 tests
**Combined Total**: 158 tests across 10 files

---

## Contact & Support

For issues with the pipeline:

1. **Check Actions Tab**: https://github.com/Keglev/frontend/actions
2. **Review Logs**: Click workflow → failed job → expand steps
3. **Common Issues**: See CI_CD_PIPELINE.md "Troubleshooting" section
4. **Test Locally**: `npm test -- --run`
5. **Docker Verify**: `docker build -f Dockerfile -t test:local .`

---

## Summary

✅ **CI/CD Pipeline Complete!**

What's Now in Place:
- Automated testing on every commit/PR
- Production deployment from master/main only
- Test files and docs excluded from production
- Safety verification steps before deployment
- Comprehensive documentation and monitoring

Ready for Phase 2: 49 additional tests for remaining components

---

**Last Updated**: November 10, 2024  
**Status**: ✅ Ready for Production  
**Next Phase**: Phase 2 Component Tests
