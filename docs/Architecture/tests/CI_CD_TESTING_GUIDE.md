# Test Automation & CI/CD Integration Guide

## GitHub Actions Integration

Create `.github/workflows/test.yml`:

```yaml
name: Frontend Tests

on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          lcov-file: ./coverage/lcov.info
```

## Pre-commit Hook (Husky)

### 1. Install Husky
```bash
npm install husky --save-dev
npx husky install
```

### 2. Create Pre-commit Hook
```bash
npx husky add .husky/pre-commit "npm run test"
```

This runs tests before every commit, preventing broken code from being pushed.

## Testing Best Practices for CI

### 1. Run Tests in CI
```bash
npm test -- --run  # Non-watch mode
```

### 2. Collect Coverage
```bash
npm run test:coverage
```

### 3. Upload Coverage
Use Codecov, Coveralls, or similar service.

## Local Development Workflow

### Before Pushing
```bash
# 1. Run tests
npm test

# 2. Check coverage
npm run test:coverage

# 3. Fix linting issues
npm run lint -- --fix

# 4. Verify all pass
npm test && npm run lint
```

### During Development
```bash
# Watch mode for active development
npm test -- --watch

# UI mode for debugging
npm run test:ui
```

## Performance Optimization

### Parallel Test Execution
Tests run in parallel by default in Vitest. To control:

```bash
# Single thread (slower, more stable)
npm test -- --no-coverage --reporter=verbose

# Limit threads (if CI machine has constraints)
npm test -- --threads=2
```

### Caching
- Test results are cached automatically
- Force no cache: `npm test -- --no-cache`
- Clear cache: `npm test -- --clearCache`

## Troubleshooting CI Failures

### Tests Pass Locally But Fail in CI

**Common Causes:**
1. **Environment differences** - Set same Node version locally
2. **Race conditions** - Use `waitFor` instead of timeouts
3. **Mock inconsistencies** - Ensure mocks reset between tests
4. **File path issues** - Use forward slashes consistently
5. **Time-dependent tests** - Mock Date/Timer functions

**Solution Checklist:**
```bash
# Match CI environment
node --version  # Verify Node version

# Run in CI mode locally
npm run test:ci

# Check for async issues
npm test -- --reporter=verbose

# Debug specific test
npm test -- --grep "failing test name"
```

### Coverage Report Not Generating

**Check:**
1. Coverage folder exists: `./coverage/`
2. vitest.config.ts has coverage settings
3. Dependencies installed: `npm install`

## Recommended Configurations

### vitest.config.ts (Already Configured)
```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html', 'lcov'],
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
}
```

### package.json Scripts
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage",
  "test:ci": "vitest --run --coverage",
  "test:watch": "vitest --watch",
  "test:debug": "vitest --inspect-brk --inspect --single-thread"
}
```

## Code Coverage Tracking

### View Coverage Report
```bash
npm run test:coverage
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

### Coverage Goals
- **Overall**: 80%+ lines
- **Critical paths**: 90%+
- **Components**: 85%+
- **Services**: 95%+

### Setting Up Coverage Badge

Add to `README.md`:
```markdown
[![codecov](https://codecov.io/gh/YOUR_ORG/YOUR_REPO/branch/master/graph/badge.svg)](https://codecov.io/gh/YOUR_ORG/YOUR_REPO)
```

## Multi-environment Testing

### Test Different Browsers (with Playwright)
```bash
npm install --save-dev @vitest/ui playwright
```

### Test Different Node Versions
Use GitHub Actions matrix (see example above).

## Test Documentation

### Auto-generate Test Report
```bash
npm test -- --reporter=html
```

This creates an HTML report of all tests.

## Performance Monitoring

### Check Test Speed
```bash
npm test -- --reporter=verbose
```

### Profile Tests
```bash
npm test -- --inspect-brk --inspect --single-thread
```

## Continuous Integration Checklist

- [ ] GitHub Actions workflow configured
- [ ] Pre-commit hooks installed locally
- [ ] Coverage reports uploading to service
- [ ] Coverage badge in README
- [ ] Tests run on all PRs
- [ ] Tests must pass before merge
- [ ] Coverage thresholds enforced
- [ ] Performance benchmarks tracked

## Common CI Commands

### Local CI Simulation
```bash
# Run exactly like CI would
npm ci              # Install with lockfile
npm run lint       # Check linting
npm test -- --run  # Run tests once
npm run test:coverage  # Generate coverage
```

### Debug Failed Tests
```bash
# Verbose output
npm test -- --reporter=verbose

# Single test
npm test -- --grep "test name"

# With debugging
npm test -- --inspect-brk
```

## Next Steps

1. **Set up GitHub Actions**: Create `.github/workflows/test.yml`
2. **Install Husky**: `npx husky install`
3. **Configure coverage**: Set up Codecov account
4. **Add badge**: Update README with coverage badge
5. **Team training**: Share CI setup with team

---

**For questions or issues, check:**
- Vitest docs: https://vitest.dev/config/
- GitHub Actions: https://docs.github.com/en/actions
- Codecov docs: https://docs.codecov.io/
