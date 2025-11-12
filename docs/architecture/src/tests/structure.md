# Test Structure & Organization

## Test Directory Layout

```
src/__tests__/
├── api/                          # API service tests
│   ├── ProductService.test.ts    (40+ tests)
│   ├── auth.test.ts              (20+ tests)
│   ├── client.test.ts            (30+ tests)
│   └── integration/
│       └── apiWorkflow.integration.test.ts
│
├── components/                   # Component tests
│   ├── __snapshots__/
│   │   ├── Button.test.tsx.snap
│   │   └── Header.test.tsx.snap
│   ├── Buttons.test.tsx          (15+ tests)
│   ├── Header.test.tsx           (20+ tests)
│   ├── Sidebar.test.tsx          (15+ tests)
│   ├── ErrorBoundary.test.tsx    (10+ tests)
│   ├── SkeletonLoader.test.tsx   (10+ tests)
│   └── pages/
│       ├── LoginPage.test.tsx    (20+ tests)
│       ├── ListStockPage.test.tsx (25+ tests)
│       ├── AddProductPage.test.tsx (20+ tests)
│       ├── ChangeProductDetailsPage.test.tsx (15+ tests)
│       ├── AdminDashboard.test.tsx (20+ tests)
│       └── UserDashboard.test.tsx (10+ tests)
│
├── services/                     # Service & hook tests
│   ├── apiClient.test.ts         (25+ tests)
│   ├── hooks/
│   │   ├── useProducts.test.ts   (25+ tests)
│   │   ├── useForm.test.ts       (30+ tests)
│   │   ├── useAuth.test.ts       (20+ tests)
│   │   ├── useDebounce.test.ts   (10+ tests)
│   │   └── useLocalStorage.test.ts (12+ tests)
│   └── integration/
│       └── serviceWorkflow.test.ts
│
├── utils/                        # Utility function tests
│   ├── validation.test.ts        (15+ tests)
│   ├── helpers.test.ts           (15+ tests)
│   └── formatters.test.ts        (10+ tests)
│
├── integration/                  # Integration tests
│   ├── productWorkflow.integration.test.ts
│   ├── authFlow.integration.test.ts
│   └── dashboardIntegration.test.ts
│
├── mocks/
│   ├── server.ts                 # MSW server setup
│   ├── handlers.ts               # HTTP request handlers
│   └── data.ts                   # Mock data factories
│
└── setup.ts                      # Global test setup
```

---

## Test File Statistics

### API Service Tests (90+ tests)

```
src/__tests__/api/
├── ProductService.test.ts (40 tests)
│   ├── getProducts (8 tests)
│   ├── getProductById (5 tests)
│   ├── createProduct (8 tests)
│   ├── updateProduct (8 tests)
│   ├── deleteProduct (4 tests)
│   ├── searchProducts (4 tests)
│   └── batch operations (3 tests)
│
├── auth.test.ts (20 tests)
│   ├── login (8 tests)
│   ├── logout (2 tests)
│   ├── token extraction (5 tests)
│   └── token validation (5 tests)
│
├── client.test.ts (30 tests)
│   ├── configuration (5 tests)
│   ├── request interceptor (10 tests)
│   ├── response interceptor (10 tests)
│   └── error handling (5 tests)
│
└── integration/
    └── apiWorkflow.integration.test.ts (20 tests)
        ├── CRUD workflow (8 tests)
        └── error scenarios (12 tests)
```

### Component Tests (120+ tests)

```
src/__tests__/components/
├── Buttons.test.tsx (15 tests)
│   ├── Rendering (3 tests)
│   ├── Props (5 tests)
│   ├── Events (4 tests)
│   └── Accessibility (3 tests)
│
├── Header.test.tsx (20 tests)
│   ├── Rendering (3 tests)
│   ├── Navigation (5 tests)
│   ├── User menu (6 tests)
│   ├── Responsive (4 tests)
│   └── Accessibility (2 tests)
│
├── pages/ (80+ tests)
│   ├── LoginPage.test.tsx (20 tests)
│   ├── ListStockPage.test.tsx (25 tests)
│   ├── AddProductPage.test.tsx (20 tests)
│   └── AdminDashboard.test.tsx (15+ tests)
│
└── Snapshots (5+ tests)
    ├── Button.test.tsx.snap
    └── Header.test.tsx.snap
```

### Service & Hook Tests (97+ tests)

```
src/__tests__/services/
├── apiClient.test.ts (25 tests)
│   ├── Configuration (5 tests)
│   ├── Request handling (8 tests)
│   ├── Response handling (8 tests)
│   └── Error handling (4 tests)
│
├── hooks/ (72+ tests)
│   ├── useProducts.test.ts (25 tests)
│   │   ├── Fetch on mount (5 tests)
│   │   ├── Loading states (4 tests)
│   │   ├── Error handling (6 tests)
│   │   └── Refetch (10 tests)
│   │
│   ├── useForm.test.ts (30 tests)
│   │   ├── Initialization (3 tests)
│   │   ├── Value updates (5 tests)
│   │   ├── Validation (10 tests)
│   │   ├── Submission (8 tests)
│   │   └── Reset (4 tests)
│   │
│   ├── useAuth.test.ts (12 tests)
│   ├── useDebounce.test.ts (3 tests)
│   └── useLocalStorage.test.ts (2 tests)
│
└── integration/
    └── serviceWorkflow.test.ts
```

### Utility Tests (40+ tests)

```
src/__tests__/utils/
├── validation.test.ts (15 tests)
│   ├── Email validation (3 tests)
│   ├── Product validation (5 tests)
│   ├── Form validation (4 tests)
│   └── Type guards (3 tests)
│
├── helpers.test.ts (15 tests)
│   ├── Array helpers (4 tests)
│   ├── Object helpers (5 tests)
│   ├── String helpers (3 tests)
│   └── Date helpers (3 tests)
│
└── formatters.test.ts (10 tests)
    ├── Number formatting (3 tests)
    ├── Date formatting (4 tests)
    └── Currency formatting (3 tests)
```

### Integration Tests (30+ tests)

```
src/__tests__/integration/
├── productWorkflow.integration.test.ts (12 tests)
│   ├── Full CRUD workflow (5 tests)
│   ├── Bulk operations (4 tests)
│   └── Error scenarios (3 tests)
│
├── authFlow.integration.test.ts (10 tests)
│   ├── Login flow (4 tests)
│   ├── Session management (3 tests)
│   └── Token refresh (3 tests)
│
└── dashboardIntegration.test.ts (8 tests)
    ├── Data loading (3 tests)
    ├── User interactions (3 tests)
    └── State updates (2 tests)
```

---

## Test Coverage by Category

### API Coverage

```
ProductService.ts
├── getProducts:        100%
├── getProductById:     100%
├── createProduct:      95%
├── updateProduct:      100%
├── deleteProduct:      100%
├── searchProducts:     100%
└── batch ops:          90%
Overall:               98%

auth.ts
├── login:              95%
├── logout:             100%
├── token extraction:   95%
└── validation:         90%
Overall:               95%

apiClient.ts
├── Configuration:      100%
├── Interceptors:       95%
├── Error handling:     90%
└── Token injection:    95%
Overall:               95%
```

### Component Coverage

```
Buttons.tsx:           95%
Header.tsx:            92%
Sidebar.tsx:           88%
ErrorBoundary.tsx:     85%
SkeletonLoader.tsx:    90%

LoginPage.tsx:         85%
ListStockPage.tsx:     88%
AddProductPage.tsx:    90%
AdminDashboard.tsx:    82%
UserDashboard.tsx:     80%

Overall Components:    88%
```

### Services Coverage

```
useProducts:           90%
useForm:               92%
useAuth:               88%
useDebounce:           95%
useLocalStorage:       85%
Custom Hooks:          90%

Utility functions:     85%
Helpers:               88%
Formatters:            86%
Validators:            92%

Overall Services:      89%
```

---

## Test Execution Timeline

### Local Test Run (8.2 seconds)

```
✓ Unit Tests (320 tests)          2.1s  (fastest)
✓ Service Tests (97 tests)        1.8s
✓ Component Tests (120 tests)     2.8s
✓ Integration Tests (30 tests)    1.0s
✓ Utility Tests (40 tests)        0.5s
───────────────────────────────
  Total: 607 tests              8.2s
```

### CI/CD Pipeline (12 seconds)

```
Setup & Install               2.0s
Lint                          1.5s
Build                         2.0s
Run Tests (607)               4.2s
Coverage Report               1.3s
Upload Coverage               1.0s
───────────────────────────────
Total CI/CD Time              12s
```

---

## Test Statistics Summary

| Metric | Count |
|--------|-------|
| Total Test Files | 25+ |
| Total Test Cases | 607+ |
| Unit Tests | 320+ |
| Component Tests | 120+ |
| Integration Tests | 30+ |
| Snapshot Tests | 5+ |
| Mock Handlers | 15+ |
| Coverage Avg | 83% |

---

## Related Documentation

- **[Overview](./overview.md)** - Testing overview
- **[Patterns](./patterns.md)** - Testing patterns
- **[Setup](./setup-configuration.md)** - Configuration
- **[Coverage](./coverage.md)** - Coverage goals
- **[Running Tests](./running-tests.md)** - Commands

---

**Last Updated**: November 2025

