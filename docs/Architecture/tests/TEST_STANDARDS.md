# Frontend Testing Checklist & Standards

## Test Quality Standards

Every test should meet these criteria:

### ✅ Structure
- [ ] Test file name matches component/function name (e.g., `Header.test.tsx`)
- [ ] Test file location mirrors source structure
- [ ] Tests organized in logical `describe` blocks
- [ ] Related tests grouped together

### ✅ Content
- [ ] Clear, descriptive test names (what should happen, not how)
- [ ] Each test focuses on ONE behavior
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] No duplicate test logic (use `beforeEach` instead)

### ✅ Assertions
- [ ] At least one assertion per test
- [ ] Assertions test user-visible behavior (not implementation)
- [ ] Error messages are helpful for debugging
- [ ] Edge cases covered

### ✅ Mocking
- [ ] All external dependencies are mocked
- [ ] Mocks are reset between tests
- [ ] Mock data uses factories/fixtures
- [ ] API calls never hit real backend in tests

### ✅ Performance
- [ ] Tests complete in < 1 second
- [ ] No unnecessary waiting/delays
- [ ] No unintended console errors/warnings
- [ ] Memory leaks prevented (cleanup happens)

## Coverage Requirements by Component Type

### Components (UI)
- **Target Coverage**: 90% lines, 85% branches
- **Must Test**:
  - Rendering with props
  - User interactions (click, type, hover)
  - Conditional rendering
  - Error states
  - Empty/loading states
  - Accessibility attributes

### Pages
- **Target Coverage**: 85% lines, 80% branches
- **Must Test**:
  - Initial data loading
  - Page navigation
  - Search/filter functionality
  - Error handling
  - Retry logic
  - Pagination (if applicable)

### Services/API
- **Target Coverage**: 95% lines, 90% branches
- **Must Test**:
  - Successful responses
  - Error responses (all status codes)
  - Data transformation
  - Edge cases
  - Network errors

### Business Logic
- **Target Coverage**: 95% lines, 95% branches
- **Must Test**:
  - Normal cases
  - Edge cases
  - Error conditions
  - Null/undefined handling
  - Boundary conditions

## Component Test Checklist

### Before submitting a component with tests:

**Rendering**
- [ ] Component renders without props
- [ ] Component renders with required props
- [ ] Component renders with optional props
- [ ] Component handles missing props gracefully

**User Interactions**
- [ ] Buttons trigger correct callbacks
- [ ] Form inputs capture values correctly
- [ ] Keyboard navigation works
- [ ] Touch/click events work

**States**
- [ ] Loading state displays
- [ ] Error state displays with error message
- [ ] Empty state displays
- [ ] Success state displays

**Accessibility**
- [ ] All buttons/links have accessible names
- [ ] Form inputs have associated labels
- [ ] ARIA attributes used where needed
- [ ] Color contrast sufficient
- [ ] Keyboard navigation complete

**Edge Cases**
- [ ] Handles null/undefined data
- [ ] Handles empty arrays
- [ ] Handles very long content (text truncation)
- [ ] Handles special characters in data

## API Service Test Checklist

### Before submitting an API service with tests:

**Success Cases**
- [ ] GET request returns correct data
- [ ] POST request creates resource
- [ ] PUT request updates resource
- [ ] DELETE request removes resource
- [ ] Response data is transformed correctly

**Error Cases**
- [ ] 400 Bad Request handled
- [ ] 401 Unauthorized handled
- [ ] 403 Forbidden handled
- [ ] 404 Not Found handled
- [ ] 500 Server Error handled
- [ ] Network timeout handled
- [ ] Connection refused handled

**Data Validation**
- [ ] Request payload validated
- [ ] Response validated
- [ ] Type errors caught
- [ ] Empty data handled

## Review Checklist

### Code Review Checklist for Tests

**Clarity**
- [ ] Test names clearly describe what they test
- [ ] Test logic is easy to follow
- [ ] Magic numbers/strings are explained
- [ ] Complex setups have comments

**Correctness**
- [ ] Tests actually test the right thing
- [ ] Assertions check real behavior
- [ ] Tests don't have hidden dependencies
- [ ] Tests pass consistently (no flakiness)

**Maintainability**
- [ ] Uses provided utilities (renderWithProviders, factories, fixtures)
- [ ] Avoids hardcoding test data
- [ ] Mocks are minimal/focused
- [ ] DRY principle followed

**Coverage**
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] Coverage goals met

## Common Issues & How to Fix Them

### ❌ "Test passed locally but failed in CI"
- [ ] Check for console warnings/errors
- [ ] Verify no race conditions (use `waitFor`)
- [ ] Ensure test doesn't depend on execution order
- [ ] Mock all external dependencies

### ❌ "Test is flaky (sometimes passes, sometimes fails)"
- [ ] Replace `setTimeout` with `waitFor`
- [ ] Ensure async operations complete
- [ ] Check for timing-dependent tests
- [ ] Use `waitFor` with explicit conditions

### ❌ "Test is slow (> 1 second)"
- [ ] Remove unnecessary `setTimeout`
- [ ] Avoid rendering multiple heavy components
- [ ] Check for infinite loops in mocks
- [ ] Profile with `npm run test:ui`

### ❌ "Can't find element in test"
- [ ] Check element is actually rendered
- [ ] Use `screen.debug()` to see DOM
- [ ] Verify correct query selector (`getBy` vs `queryBy`)
- [ ] Check for async rendering (use `waitFor` or `findBy`)

### ❌ "Mock isn't being used"
- [ ] Verify `vi.mocked()` wrapping
- [ ] Check mock setup runs before component render
- [ ] Ensure import path matches exactly
- [ ] Check for multiple mock setups conflicting

## Git Commit Standards

When committing test changes:

### ✅ Good commit messages
```
feat: add tests for Product component
- Add rendering tests
- Add user interaction tests
- Add error state tests
- Coverage: 92%
```

### ❌ Bad commit messages
```
Add tests
fix: tests
work in progress
```

## PR Review Standards

### Tests in PR must:
- [ ] All tests pass locally (`npm test`)
- [ ] Coverage increased or maintained
- [ ] New tests follow established patterns
- [ ] No console errors/warnings
- [ ] Mocks are minimal and clear
- [ ] Test names are descriptive
- [ ] No test code duplicated
- [ ] No hardcoded test data

## Continuous Improvement

### Quarterly Test Audit:
- [ ] Review and update template files
- [ ] Update test utilities as needed
- [ ] Document new testing patterns
- [ ] Refactor flaky tests
- [ ] Increase coverage targets if possible

### Team Training:
- [ ] Review template files with new team members
- [ ] Do code review focused on test quality
- [ ] Share testing learnings in team meetings
- [ ] Document solutions to common issues

## Resources

- **Quick Start**: `TESTING_QUICK_START.md`
- **Detailed Guide**: `src/__tests__/README.md`
- **Template Examples**: `src/__tests__/components/Component.template.test.tsx`
- **Vitest Docs**: https://vitest.dev
- **Testing Library Docs**: https://testing-library.com/

---

**Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Frontend Team
