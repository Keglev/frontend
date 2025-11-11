# Running Tests & CI/CD Integration

## Local Test Execution

### Basic Commands

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Debug tests (Node inspector)
npm run test:debug
```

### Filtering Tests

```bash
# Run only specific file
npm run test ProductService.test.ts

# Run tests matching pattern
npm run test -- --grep "should create"

# Run only unit tests
npm run test -- --grep "Unit"

# Run only integration tests
npm run test -- --grep "Integration"

# Run tests in specific directory
npm run test src/__tests__/api/
```

### Test Modes

```bash
# Watch mode with specific reporter
npm run test:watch -- --reporter=verbose

# Run once, exit on first failure
npm run test -- --bail

# Run with reporter UI
npm run test -- --ui

# Run with browser console
npm run test -- --inspect-brk
```

---

## CI/CD Integration

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: true

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info

      - name: Build application
        run: npm run build

      - name: Archive test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/
          retention-days: 30
```

---

## Test Output Examples

### Standard Output

```bash
$ npm run test

 ✓ src/__tests__/api/ProductService.test.ts (40)
 ✓ src/__tests__/api/auth.test.ts (20)
 ✓ src/__tests__/api/client.test.ts (30)
 ✓ src/__tests__/services/hooks/useProducts.test.ts (25)
 ✓ src/__tests__/services/hooks/useForm.test.ts (30)
 ✓ src/__tests__/components/Buttons.test.tsx (15)
 ✓ src/__tests__/components/Header.test.tsx (20)
 ✓ src/__tests__/components/pages/LoginPage.test.tsx (20)
 ✓ src/__tests__/integration/productWorkflow.test.ts (12)

  607 tests passed (8.2s)
  Coverage: 82%
```

### Watch Mode

```bash
$ npm run test:watch

 PASS  src/__tests__/api/ProductService.test.ts
 PASS  src/__tests__/services/hooks/useProducts.test.ts
 FAIL  src/__tests__/components/Header.test.tsx
  ✕ Header (1)
    ✕ renders with user menu (1)
      ✕ TypeError: Cannot read property 'toBeInTheDocument' of undefined

 Test Files  3 passed + 1 failed (4)
 Tests       607 passed + 1 failed (608)

Rerun with -t Header to filter tests
```

### Coverage Report

```bash
$ npm run test:coverage

────────────────────────────────────────────
File                    | % Stmts | % Branch | % Funcs | % Lines |
────────────────────────────────────────────
All files               |   82.2  |   77.8   |   81.4  |   83.1  |
 src/api/              |   96.0  |   92.0   |   96.0  |   96.0  |
  ProductService.ts    |   98.0  |   95.0   |   97.0  |   98.0  |
  auth.ts              |   95.0  |   90.0   |   96.0  |   95.0  |
  client.ts            |   95.0  |   92.0   |   94.0  |   96.0  |
 src/services/        |   91.0  |   88.0   |   91.0  |   93.0  |
 src/components/      |   89.0  |   86.0   |   88.0  |   90.0  |
 src/utils/           |   89.0  |   86.0   |   88.0  |   91.0  |
────────────────────────────────────────────
```

---

## Debugging Tests

### VS Code Debugging

**File**: `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:debug"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Debug Commands

```bash
# Start debugger
npm run test:debug

# With breakpoints in VS Code
# 1. Set breakpoint in test file
# 2. Run: npm run test:debug
# 3. Open chrome://inspect
# 4. Click "inspect" on node process

# Or use VS Code launcher:
# Press F5 to start debugging with launch.json config
```

### Debug Output

```bash
$ npm run test:debug

Debugger listening on ws://127.0.0.1:9229/...
To start debugging, open the following URL in a Chrome browser:
    chrome://inspect

[Process listening on port 9229]

 ✓ src/__tests__/api/ProductService.test.ts
 Paused at breakpoint (line 42)
 > expect(result).toBe(expectedValue)
```

---

## Test Performance Optimization

### Slow Test Analysis

```bash
# Run tests with timing
npm run test -- --reporter=verbose

# Output shows slowest tests
SLOW TESTS:
  ✓ LoginPage integration (245ms)
  ✓ ProductForm submission (189ms)
  ✓ Dashboard data loading (156ms)
```

### Performance Tips

```typescript
// ❌ Slow - making actual network calls
test('fetches data', async () => {
  const data = await fetch('/api/data');
});

// ✅ Fast - mocked API
test('fetches data', async () => {
  vi.mocked(api.get).mockResolvedValue({ data });
  const result = await getProducts();
});

// ❌ Slow - waiting for real timeouts
test('debounce works', async () => {
  await new Promise(r => setTimeout(r, 1000));
});

// ✅ Fast - fake timers
test('debounce works', () => {
  vi.useFakeTimers();
  // ... test
  vi.advanceTimersByTime(1000);
  vi.restoreAllMocks();
});
```

---

## Test Checklist for PRs

Before submitting a PR, ensure:

- [ ] All tests pass locally (`npm run test`)
- [ ] Coverage hasn't decreased (`npm run test:coverage`)
- [ ] No console errors or warnings
- [ ] New features have test coverage (>80%)
- [ ] Tests follow naming conventions
- [ ] No hardcoded timeouts (use vi.fake Timers)
- [ ] Mocks are cleared between tests
- [ ] No `only` or `skip` left in tests
- [ ] CI/CD pipeline passes

---

## Common Issues & Solutions

### Tests Pass Locally but Fail in CI

```
Cause: Different Node version or missing dependencies
Fix:
- Check .nvmrc or package.json engines
- Run: npm ci instead of npm install
- Clear: rm -rf node_modules && npm ci
```

### Random Test Failures

```
Cause: Async operations, timing issues
Fix:
- Use waitFor() instead of setTimeout
- Use vi.fakeTimers() for time-based tests
- Ensure proper cleanup in afterEach
```

### Timeout Errors

```
Cause: Tests taking too long
Fix:
- Increase timeout: test('...', async () => {...}, 10000)
- Mock slower operations
- Remove unnecessary delays
```

### Memory Leaks in Tests

```
Cause: Not cleaning up subscriptions/listeners
Fix:
- Cleanup in afterEach hook
- Unsubscribe from observables
- Remove event listeners
```

---

## Performance Benchmarks

### Target Times

```
Unit Tests:        < 1ms per test
Component Tests:   1-5ms per test
Integration Tests: 5-50ms per test
Total Suite:       < 10 seconds
```

### Current Performance

```
Unit Tests (320):        2.1s  (6.6ms avg) ✅
Component Tests (120):   2.8s  (23ms avg)  ⚠️
Integration Tests (30):  1.0s  (33ms avg)  ✅
Utility Tests (40):      0.5s  (12ms avg)  ✅
────────────────────────────
Total (607 tests):       8.2s            ✅
```

---

## Continuous Monitoring

### Coverage Tracking

```bash
# Generate monthly report
npm run test:coverage > coverage-$(date +%Y-%m-%d).txt

# Track trends over time
# Aim to increase coverage 1-2% per month
```

### Test Metrics Dashboard

```
Total Tests: 607
Pass Rate: 100%
Avg Duration: 8.2s
Coverage: 82%
Trend: ↗️ +2% (this month)
```

---

## Related Documentation

- **[Overview](./overview.md)** - Testing overview
- **[Structure](./structure.md)** - Test organization
- **[Patterns](./patterns.md)** - Testing patterns
- **[Setup](./setup-configuration.md)** - Configuration
- **[Coverage](./coverage.md)** - Coverage goals

---

**Last Updated**: November 2025

