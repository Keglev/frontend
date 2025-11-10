# Testing Analysis for StockEase Frontend

## Executive Summary
Analyzed all source files in `src/` directory to identify testing requirements. Created comprehensive testing roadmap based on application architecture.

---

## 1️⃣ COMPONENT TESTING (Priority: HIGH)

### Components Identified: 7

#### ✅ `Header.tsx` - NEEDS TESTING
**Purpose**: Main header with title, dark mode toggle, language selection, logout button

**Requirements**:
- [ ] Render with `isLoggedIn` prop
- [ ] Render with `onLogout` callback
- [ ] Dark mode toggle: state change + localStorage persistence
- [ ] Dark mode CSS class applied to document
- [ ] Language change: i18n language switch + localStorage update
- [ ] Page title changes based on URL location
- [ ] Logout button: calls onLogout when isLoggedIn=true
- [ ] Back button: navigates to dashboard when not on dashboard
- [ ] hideBackButton prop hides the button
- [ ] Conditional rendering based on user role (ROLE_ADMIN vs ROLE_USER)

**Test Cases Needed**: ~12-15 tests

---

#### ✅ `Sidebar.tsx` - NEEDS TESTING
**Purpose**: Shows stock value and low-stock products list

**Requirements**:
- [ ] Render with `stockValue` prop
- [ ] Format currency correctly ($X.XX)
- [ ] Render `lowStockProducts` array as list
- [ ] Show each product with name and quantity
- [ ] Show "Sufficient Stock" message when array is empty
- [ ] Buttons component renders within sidebar
- [ ] Proper styling (w-2/5, bg-white, shadow, etc.)

**Test Cases Needed**: ~8 tests

---

#### ✅ `Buttons.tsx` - NEEDS TESTING
**Purpose**: Navigation buttons for product management

**Requirements**:
- [ ] Render all buttons by default
- [ ] Hide admin buttons when `hideAdminButtons=true`
- [ ] Navigation buttons trigger correct routes:
  - Add Product → `/add-product`
  - Delete Product → `/delete-product`
  - Search Product → `/search-product`
- [ ] Button labels use translations
- [ ] All buttons render when hideAdminButtons=false

**Test Cases Needed**: ~8 tests

---

#### ✅ `ErrorBoundary.tsx` - NEEDS TESTING
**Purpose**: Global error handler for uncaught exceptions

**Requirements**:
- [ ] Render children normally when no error
- [ ] Catch global `error` event
- [ ] Catch `unhandledrejection` event
- [ ] Display error message when caught
- [ ] Show reload button
- [ ] Reload button calls `window.location.reload()`
- [ ] Event listeners cleanup on unmount
- [ ] Error logged to console

**Test Cases Needed**: ~10 tests

---

#### ✅ `HelpModal.tsx` - NEEDS TESTING
**Purpose**: Displays contextual help content based on current page

**Requirements**:
- [ ] Render modal when `isOpen=true`
- [ ] Don't render when `isOpen=false`
- [ ] Display title from i18n help namespace
- [ ] Display content from i18n help namespace
- [ ] Parse markdown-like syntax (### headers, - bullets)
- [ ] Close button calls `onClose` callback
- [ ] Modal styling (dark mode support)
- [ ] Correct `pageKey` used for content lookup

**Test Cases Needed**: ~10 tests

---

#### ✅ `Footer.tsx` - NEEDS TESTING
**Purpose**: Footer with copyright and social links

**Requirements**:
- [ ] Render copyright year and translated rights text
- [ ] Render GitHub link (external)
- [ ] Render LinkedIn link (external)
- [ ] Links have correct href and target="_blank"
- [ ] Social icons render
- [ ] Dark mode styling applied

**Test Cases Needed**: ~8 tests

---

#### ✅ `SkeletonLoader.tsx` - NEEDS TESTING
**Purpose**: Loading state indicator

**Requirements**:
- [ ] Initial render shows loader
- [ ] Loader disappears after 10 seconds
- [ ] Cleanup timeout on unmount
- [ ] Return null after timeout
- [ ] Display "Loading..." translation
- [ ] Dark mode styling

**Test Cases Needed**: ~6 tests

**Note**: Will need to mock `setTimeout` with `vi.useFakeTimers()`

---

### Component Testing Summary
**Total Test Files Needed**: 7
**Estimated Test Cases**: ~67 tests
**Priority**: 🔴 HIGH - These are the core UI layer

---

## 2️⃣ AUTHENTICATION & AUTHORIZATION (Priority: HIGH)

### Files Identified: 2

#### ✅ `auth.ts` - NEEDS TESTING
**Purpose**: Handles login API call and JWT token extraction

**Requirements**:
- [ ] Successful login: returns `{ token, role }`
- [ ] JWT decoding: correctly extracts role from base64 payload
- [ ] Failed login: throws error with server message
- [ ] Invalid response: throws error if success=false
- [ ] Network error: propagates error
- [ ] Console logging (without password)
- [ ] Handles various token formats

**Test Cases Needed**: ~8 tests

**Mocking Needs**:
- Mock `apiClient.post()`
- Mock `atob()` for base64 decoding
- Mock valid and invalid JWT tokens

---

### Auth Testing Summary
**Total Test Files Needed**: 1
**Estimated Test Cases**: ~8 tests
**Priority**: 🔴 HIGH - Critical for security

---

## 3️⃣ API INTERACTION (Priority: HIGH)

### Files Identified: 2

#### ✅ `ProductService.ts` - NEEDS TESTING
**Purpose**: CRUD operations for products

**Methods to Test**:
1. `fetchProducts()` - GET all products
   - [ ] Returns data from response
   - [ ] Handles errors

2. `fetchPagedProducts(page, size)` - GET paginated products
   - [ ] Accepts page and size parameters
   - [ ] Extracts `.data` from response
   - [ ] Handles 204 No Content response
   - [ ] Handles errors

3. `addProduct(product)` - POST new product
   - [ ] Sends product object
   - [ ] Returns response data
   - [ ] Validates required fields

4. `deleteProduct(id)` - DELETE product
   - [ ] Sends correct ID in URL
   - [ ] Returns response data
   - [ ] Handles errors

5. `searchProductsByName(name)` - GET search results
   - [ ] Sends name as query param
   - [ ] Returns empty array on 204
   - [ ] Returns matching products
   - [ ] Handles errors

6. `getProductById(id)` - GET single product
   - [ ] Sends correct ID in URL
   - [ ] Extracts `.data.data` from response
   - [ ] Handles errors

**Test Cases Needed**: ~18 tests

**Mocking Needs**:
- Mock `apiClient` methods
- Mock various response structures
- Mock error scenarios

---

#### ✅ `apiClient.ts` - NEEDS TESTING
**Purpose**: Axios instance with interceptors

**Requirements**:
- [ ] Creates axios instance with correct baseURL
- [ ] Request interceptor adds Bearer token from localStorage
- [ ] Request interceptor logs requests
- [ ] Response interceptor logs responses
- [ ] Response interceptor removes token on 401
- [ ] Error interceptor propagates errors
- [ ] Timeout is 120 seconds

**Test Cases Needed**: ~10 tests

**Mocking Needs**:
- Mock axios.create
- Mock localStorage
- Mock console methods

---

### API Testing Summary
**Total Test Files Needed**: 2
**Estimated Test Cases**: ~28 tests
**Priority**: 🔴 HIGH - Critical for backend integration

---

## 4️⃣ BUSINESS LOGIC (Priority: MEDIUM)

### Files Identified: 1

#### ✅ `DashboardLogic.ts` - NEEDS TESTING
**Purpose**: Fetch dashboard metrics

**Requirements**:
- [ ] `fetchDashboardData()` calls both API endpoints in parallel
- [ ] Returns `{ stockValue, lowStock }`
- [ ] Handles missing `stockValue` (default 0)
- [ ] Handles non-array `lowStock` (default [])
- [ ] Propagates errors
- [ ] Uses Promise.all for parallel requests

**Test Cases Needed**: ~8 tests

**Mocking Needs**:
- Mock `apiClient.get()`
- Mock Promise.all

---

### Logic Testing Summary
**Total Test Files Needed**: 1
**Estimated Test Cases**: ~8 tests
**Priority**: 🟡 MEDIUM - Important for data flow

---

## 5️⃣ PAGES (Priority: MEDIUM)

### Files Identified: 9 pages
- LoginPage.tsx
- HomePage.tsx
- AdminDashboard.tsx
- UserDashboard.tsx
- AddProductPage.tsx
- DeleteProductPage.tsx
- ChangeProductDetailsPage.tsx
- ListStockPage.tsx
- SearchProductPage.tsx

**Status**: NOT YET ANALYZED
**Action**: Requires separate deep-dive into each page
**Test Type**: Integration tests combining components + API calls

---

## 6️⃣ TYPES & STYLES (Priority: LOW)

### Files Identified:
- `types/Product.ts` - Type definitions (no tests needed - types only)
- `styles/*.css` - CSS files (no tests needed)

---

## TESTING ROADMAP & PRIORITY

### Phase 1 (Week 1) - 🔴 CRITICAL
**Focus**: Core components + Auth + API

| Item | Tests | Est. Time |
|------|-------|-----------|
| Buttons.tsx | 8 | 1h |
| auth.ts | 8 | 1h |
| apiClient.ts | 10 | 1.5h |
| ProductService.ts | 18 | 2h |
| ErrorBoundary.tsx | 10 | 1.5h |
| **Phase 1 Total** | **54** | **7h** |

---

### Phase 2 (Week 2) - 🟠 HIGH
**Focus**: More components + Business logic

| Item | Tests | Est. Time |
|------|-------|-----------|
| Header.tsx | 15 | 2h |
| Sidebar.tsx | 8 | 1.5h |
| HelpModal.tsx | 10 | 1.5h |
| Footer.tsx | 8 | 1h |
| DashboardLogic.ts | 8 | 1.5h |
| **Phase 2 Total** | **49** | **7.5h** |

---

### Phase 3 (Week 3) - 🟡 MEDIUM
**Focus**: Remaining components + Pages

| Item | Tests | Est. Time |
|------|-------|-----------|
| SkeletonLoader.tsx | 6 | 1h |
| Page Integration Tests | 40+ | 6h+ |
| **Phase 3 Total** | **46+** | **7h+** |

---

## TESTING CHECKLIST - POINT 1 REVIEW ✅

### Component Testing (Your question about Point 1)

Based on analysis, here's what NEEDS COMPONENT TESTS:

| Component | Render | Interactions | Conditional | Snapshot |
|-----------|--------|--------------|-------------|----------|
| **Header** | ✅ | ✅ Dark mode, Lang, Logout | ✅ Role-based | ✅ |
| **Sidebar** | ✅ | ✅ None direct | ✅ Empty state | ✅ |
| **Buttons** | ✅ | ✅ Navigation clicks | ✅ hideAdminButtons | ✅ |
| **ErrorBoundary** | ✅ | ✅ Error capture | ✅ Error state | ✅ |
| **HelpModal** | ✅ | ✅ Open/Close | ✅ Modal display | ✅ |
| **Footer** | ✅ | ✅ Link clicks | ❌ None | ✅ |
| **SkeletonLoader** | ✅ | ✅ Timeout | ✅ Visibility | ✅ |

**Summary**: All 7 components need comprehensive component tests.

---

## WHAT'S NOT NEEDED YET

❌ Custom Hooks - None found in codebase
❌ Performance Tests - Not needed at this stage
❌ Advanced Accessibility - Basic accessibility covered in component tests

---

## NEXT STEPS

1. ✅ Create test file for each component from Phase 1
2. ✅ Write test cases following established patterns
3. ✅ Mock i18n, localStorage, useNavigate, etc.
4. ✅ Run tests: `npm test`
5. ✅ Check coverage: `npm run test:coverage`

---

**Total Estimated Tests**: ~150+ tests
**Total Estimated Time**: ~21.5+ hours
**Recommended Speed**: 2-3 tests per day = ~50-75 days
**OR**: 1 week intensive (20+ tests/day)
