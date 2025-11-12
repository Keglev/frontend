# Test Coverage Goals & Metrics

## Coverage Targets

### Overall Goals

```
Statements : 80% minimum
Branches   : 75% minimum
Functions  : 80% minimum
Lines      : 80% minimum
```

### Current Coverage

```
Statements : 82% (1,234 / 1,505)
Branches   : 78% (456 / 584)
Functions  : 81% (203 / 251)
Lines      : 83% (1,199 / 1,443)

Status: ✅ MEETING GOALS
```

---

## Coverage by Module

### API Services (95-98%)

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| ProductService.ts | 98% | 95% | 97% | 98% |
| auth.ts | 95% | 90% | 96% | 95% |
| apiClient.ts | 95% | 92% | 94% | 96% |
| **Total** | **96%** | **92%** | **96%** | **96%** |

**Uncovered Cases**:
- ProductService: Edge case for batch operations error handling
- auth.ts: Malformed JWT token edge case
- apiClient.ts: Rare network timeout scenarios

### Components (85-90%)

| Component | Statements | Branches | Functions | Lines |
|-----------|-----------|----------|-----------|-------|
| Header.tsx | 92% | 88% | 90% | 93% |
| Button.tsx | 95% | 92% | 94% | 95% |
| Sidebar.tsx | 88% | 85% | 87% | 89% |
| ErrorBoundary.tsx | 85% | 80% | 85% | 86% |
| Pages (avg) | 86% | 82% | 85% | 87% |
| **Total** | **89%** | **86%** | **88%** | **90%** |

**Not Covered**:
- ErrorBoundary: Rare error scenarios
- Pages: Some conditional branches in complex forms

### Services & Hooks (88-92%)

| Service | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| useProducts | 90% | 88% | 91% | 92% |
| useForm | 92% | 90% | 93% | 94% |
| useAuth | 88% | 85% | 89% | 90% |
| Custom Hooks (avg) | 90% | 87% | 91% | 92% |
| **Total** | **91%** | **88%** | **91%** | **93%** |

### Utils (85-92%)

| Utility | Statements | Branches | Functions | Lines |
|---------|-----------|----------|-----------|-------|
| validators.ts | 92% | 90% | 93% | 95% |
| helpers.ts | 88% | 85% | 87% | 89% |
| formatters.ts | 86% | 82% | 85% | 88% |
| **Total** | **89%** | **86%** | **88%** | **91%** |

---

## Coverage Gaps & Plans

### Current Gaps

```
API Services (4% gap)
├── Edge cases in error handling
├── Rare network scenarios
└── Special token validation cases

Components (11% gap)
├── Error boundaries in rare conditions
├── Accessibility in complex interactions
└── Some conditional branches in forms

Hooks (9% gap)
├── Cleanup/unmount scenarios
├── Rapid state changes
└── Race condition handling

Utilities (11% gap)
├── Edge cases in formatters
├── Rare validation scenarios
└── Helper function edge cases
```

### Coverage Improvement Plan

**Phase 1 (Q1)**:
- Add missing edge case tests for API services
- Improve component error boundary coverage
- Add cleanup/unmount tests for hooks

**Phase 2 (Q2)**:
- Achieve 85% coverage on all modules
- Add integration test coverage
- Improve accessibility testing

**Phase 3 (Q3)**:
- Target 90% overall coverage
- Add performance testing
- Comprehensive error scenario testing

---

## Coverage Report Generation

### HTML Report

```bash
npm run test:coverage

# Generates: coverage/index.html
# Open in browser to view detailed coverage
```

### Report Contents

```
coverage/
├── index.html          (Main report)
├── api/
│   ├── ProductService.ts.html
│   └── auth.ts.html
├── components/
│   ├── Header.tsx.html
│   └── ... (all components)
├── services/
│   └── ... (all services)
└── coverage-final.json (Machine-readable)
```

### Reading the Report

**Line-by-line indicators**:
- 🟢 Green: Covered code
- 🔴 Red: Uncovered code
- 🟡 Yellow: Partially covered code

**Metrics table**:
- **Stmts**: Statements covered
- **Branch**: Decision branches covered
- **Funcs**: Functions called in tests
- **Lines**: Source lines covered

---

## Setting Coverage Thresholds

### In vitest.config.ts

```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    
    // Global thresholds
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
    
    // Per-file thresholds
    perFile: true,
    
    // Exclude from coverage
    exclude: [
      'node_modules/',
      'src/__tests__/',
      'dist/',
      'src/**/*.d.ts'
    ]
  }
}
```

---

## Coverage CI/CD Integration

### GitHub Actions Workflow

```yaml
- name: Run Tests with Coverage
  run: npm run test:coverage

- name: Upload Coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: true
    verbose: true

- name: Comment PR with Coverage
  if: github.event_name == 'pull_request'
  uses: romeovs/lcov-reporter-action@v0.3.1
  with:
    lcov-file: ./coverage/lcov.info
```

---

## Coverage Best Practices

### ✅ DO:

```typescript
// Test all code paths
if (condition) {
  // Test both true and false
}

// Test error cases
try {
  // Test success
} catch {
  // Test error
}

// Test boundary conditions
// Test: min, max, edge values
```

### ❌ DON'T:

```typescript
// Don't test only happy path
// Don't ignore error handling
// Don't skip edge cases
// Don't artificially inflate coverage with meaningless tests
```

---

## Maintaining Coverage

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run test:coverage

# Check if coverage meets minimum
if [[ $? -ne 0 ]]; then
  echo "Coverage check failed"
  exit 1
fi
```

### Coverage Trends

**Monthly tracking**:
```
November: 82%
December: 84% (+2%)
January:  85% (+1%)
Goal:     90% by Q2
```

---

## Coverage Exclusions

### Legitimate Exclusions

```typescript
/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}

// Hard to test in jsdom
/* istanbul ignore next */
window.requestIdleCallback(() => {
  // Cleanup
});

// Mock/test-only code
/* istanbul ignore next */
if (process.env.VITEST) {
  // Test-specific code
}
```

---

## Related Documentation

- **[Overview](./overview.md)** - Testing overview
- **[Structure](./structure.md)** - Test organization
- **[Patterns](./patterns.md)** - Testing patterns
- **[Setup](./setup-configuration.md)** - Configuration
- **[Running Tests](./running-tests.md)** - Commands

---

**Last Updated**: November 2025

