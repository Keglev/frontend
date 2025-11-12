# Troubleshooting & Support

## Common Pipeline Issues

### Tests Fail on CI But Pass Locally

**Symptoms**: Tests pass with `npm test` locally but fail in GitHub Actions

**Possible Causes**:
- Node version mismatch
- Missing environment variable
- Timing/async issues on slower CI runner
- File path issues (Windows vs Linux)

**Solutions**:
```bash
# Verify Node version matches
node -v  # Should be v20.x

# Check .nvmrc or package.json engines field
cat .nvmrc

# Recreate CI environment locally
npm ci  # Clean install like CI does
npm test -- --run  # Single run, not watch mode
```

### Build Fails with "Module Not Found"

**Symptoms**: `npm run build` fails with module resolution error

**Possible Causes**:
- Dependency not installed
- Incorrect import path
- Circular dependencies
- TypeScript configuration issue

**Solutions**:
```bash
# Clean install all dependencies
rm -rf node_modules package-lock.json
npm ci

# Check import path
ls -la src/[path/to/file]

# Verify TypeScript configuration
cat tsconfig.json | grep -A 5 "compilerOptions"

# Build with verbose output
npm run build -- --debug
```

### Docker Build Fails

**Symptoms**: Docker build step fails in pipeline

**Possible Causes**:
- Required files excluded by .dockerignore
- Missing build argument
- Base image unavailable
- Dockerfile syntax error

**Solutions**:
```bash
# Check what .dockerignore excludes
cat .dockerignore

# Verify Dockerfile is valid
docker build --dry-run .

# Build with build args
docker build --build-arg VITE_API_BASE_URL="..." -t test .

# Check base image
docker pull nginx:alpine  # Verify image exists
```

### Deployment Fails

**Symptoms**: Build succeeds but deployment step fails

**Possible Causes**:
- GitHub Secret not set or incorrect
- Docker registry credentials wrong
- SSH key invalid or unreachable host
- Insufficient permissions

**Solutions**:
```bash
# Verify secrets are set
# Go to Settings → Secrets and variables → Actions
# Check each secret exists and has value

# Test Docker credentials
docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

# Test SSH connection
ssh -i deploy_key.pem deploy@prod.server.com
```

### Tests Timeout

**Symptoms**: Tests hang or timeout after 30+ seconds

**Possible Causes**:
- Infinite loop in test
- Unresolved promise
- Missing timeout configuration
- Network request not mocked

**Solutions**:
```bash
# Check for infinite loops
grep -r "while(true)" src/__tests__/

# Verify all API calls are mocked
grep -r "fetch\|axios" src/__tests__/ | grep -v "vi.mock"

# Run specific test with timeout
npm test -- --testTimeout 10000 path/to/test.ts

# Check for async issues
npm run test:ui  # Visual debugging
```

---

## Debugging Pipeline

### View Full Logs

1. Go to GitHub repository → **Actions** tab
2. Click the workflow run that failed
3. Click the job name (e.g., "test")
4. Expand each step to see full logs
5. Look for error messages and stack traces

### Recreate Locally

```bash
# Match CI environment as closely as possible
node -v           # Check Node v20
npm -v            # Check npm version
npm ci             # Clean install
npm run lint       # Run linter
npm test -- --run  # Run tests once
npm run build      # Build bundle
```

### Enable Debug Logging

**In GitHub Actions**:
```yaml
- name: Enable debug logging
  run: echo "::debug::Debug message"
```

**In Node.js**:
```bash
DEBUG=* npm test  # Enable all debug output
```

### Check Git Status

```bash
git status        # Uncommitted changes
git log --oneline # Recent commits
git diff HEAD     # See what changed
```

---

## Specific Error Solutions

### Error: "Cannot find module"

```
Error: Cannot find module '@/components/Header'

Solution:
1. Verify file exists at src/components/Header.tsx
2. Check import path is correct (case-sensitive on Linux)
3. Verify tsconfig.json paths are configured
4. Run: npm ci (clean install)
```

### Error: "Tests failed: 123 tests passed, 1 failed"

```
Solution:
1. Run locally: npm test -- --grep "failing test name"
2. See test output and error message
3. Fix the test or code causing failure
4. Commit and re-push
```

### Error: "Docker image build failed"

```
Error: Step X/Y : COPY src ./src
COPY failed: file not found in build context

Solution:
1. Check .dockerignore - may be excluding needed files
2. Verify file path in COPY command
3. Check Dockerfile syntax (wrong quotes, etc.)
4. Test build locally: docker build .
```

### Error: "Secret not found"

```
Error: The following secrets were not found

Solution:
1. Go to Settings → Secrets and variables → Actions
2. Create any missing secrets
3. Verify spelling (case-sensitive: FRONTEND_API_BASE_URL)
4. Re-run workflow
```

### Error: "Permission denied"

```
Error: Permission denied (publickey)
Error: docker: permission denied while trying to connect

Solution:
1. Check SSH key/credentials are in GitHub Secrets
2. Verify permissions on deployment server
3. Test locally: docker login, ssh connection
4. Check service account has required permissions
```

---

## Performance Issues

### Pipeline Running Slowly

**Possible Causes**:
- npm cache not working
- Tests running sequentially
- Docker layer cache misses
- Large dependencies

**Solutions**:
```yaml
# Ensure npm cache is working
cache: 'npm'

# Parallel test execution (already default in Vitest)
# No action needed, Vitest parallelizes automatically

# Build Docker image efficiently
docker build --cache-from stockease:latest .
```

### Long Build Times

```
Solution:
1. Cache npm dependencies
2. Use multi-stage Docker builds (already configured)
3. Limit bundle size (tree-shake, code split)
4. Minimize Docker layer count
```

---

## When to Ask for Help

### Gather Information

Before asking for help, collect:

1. **Full error message**
   ```bash
   # Copy complete error from GitHub Actions logs
   ```

2. **Recent changes**
   ```bash
   git log --oneline -5  # Last 5 commits
   ```

3. **Local reproduction**
   ```bash
   npm ci && npm test -- --run  # Does it fail locally?
   ```

4. **Environment info**
   ```bash
   node --version
   npm --version
   git --version
   docker --version
   ```

### GitHub Issues

When creating issue:
- Title: Clear, specific (e.g., "Tests timeout in CI on docker build step")
- Description: What you were doing, what failed
- Error: Full error message/logs
- Reproduction: Steps to reproduce locally
- Environment: Node/npm versions, OS

---

## Useful Commands

### Local Testing

```bash
# Run tests once (like CI does)
npm test -- --run

# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test -- src/__tests__/components/Header.test.tsx

# Run tests matching pattern
npm test -- --grep "Header"

# Generate coverage
npm run test:coverage
```

### Building

```bash
# Build production bundle
npm run build

# List build output
ls -la dist/

# Check for test files (should be empty)
find dist -name "*.test.*"

# Build Docker image
docker build -f Dockerfile -t stockease:test .
```

### Linting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix

# Check specific file
npm run lint -- src/App.tsx
```

### Debugging

```bash
# View Node.js logs
npm test -- --reporter=verbose

# Interactive UI mode
npm run test:ui

# Debug specific test
npm test -- --testNamePattern="test name"
```

---

## Escalation Path

1. **Check logs** - Review full GitHub Actions logs
2. **Reproduce locally** - Can you recreate the issue?
3. **Search documentation** - Check this troubleshooting guide
4. **Consult team** - Ask teammates if they've seen it
5. **Create GitHub issue** - If unresolved, document and file issue

---

## Related Documentation

- [Main Pipeline Overview](./overview.md)
- [Testing Stage](./testing.md)
- [Build & Deployment](./build-deploy.md)
- [Secrets Configuration](./secrets.md)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: November 2025  
**Status**: Tested & Production Ready  
**Maintenance**: Reviewed monthly

