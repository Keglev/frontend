```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                   🧪 FRONTEND TESTING - QUICK REFERENCE CARD 🧪             ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════════════════════
📚 DOCUMENTATION QUICK LINKS
════════════════════════════════════════════════════════════════════════════════

START HERE ⭐
├─ SETUP_COMPLETE.md              ← You are reading this! Full overview
├─ TESTING_INDEX.md               ← Navigation guide to all docs
└─ TESTING_QUICK_START.md         ← 5-10 minute quick start

DEEP DIVES
├─ src/__tests__/README.md        ← Comprehensive 50+ page guide
├─ TEST_STANDARDS.md              ← Team standards & checklists
└─ CI_CD_TESTING_GUIDE.md         ← GitHub Actions setup

TECHNICAL
├─ TESTING_COMPLETE_SETUP.md      ← All technical details
├─ TESTING_SETUP_SUMMARY.md       ← Setup overview
└─ vitest.config.ts               ← Test configuration

════════════════════════════════════════════════════════════════════════════════
⚡ ESSENTIAL COMMANDS
════════════════════════════════════════════════════════════════════════════════

npm install                        # Install dependencies (FIRST!)
npm test                          # Run all tests
npm run test:ui                   # Interactive UI (BEST for development!)
npm run test:coverage             # Coverage report + HTML
npm test -- --watch               # Watch mode (auto-rerun on change)
npm test -- --grep "Header"       # Tests matching pattern

════════════════════════════════════════════════════════════════════════════════
📂 TEST FILE LOCATIONS & STRUCTURE
════════════════════════════════════════════════════════════════════════════════

Source File                        →  Test File
────────────────────────────────────────────────────────────────────────────
src/components/Header.tsx          →  src/__tests__/components/Header.test.tsx
src/pages/HomePage.tsx             →  src/__tests__/pages/HomePage.test.tsx
src/api/ProductService.ts          →  src/__tests__/api/ProductService.test.ts
src/services/apiClient.ts          →  src/__tests__/services/apiClient.test.ts
src/logic/DashboardLogic.ts        →  src/__tests__/logic/DashboardLogic.test.ts

════════════════════════════════════════════════════════════════════════════════
🎯 WRITING YOUR FIRST TEST
════════════════════════════════════════════════════════════════════════════════

1. COPY a template file
   └─ src/__tests__/components/Component.template.test.tsx

2. PASTE to create your test
   └─ src/__tests__/components/YourComponent.test.tsx

3. ADAPT for your needs
   └─ Change component name, add real test cases

4. RUN it
   └─ npm run test:ui

Example:
────────
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '@/__tests__/utils/test-render';
import { Header } from '@/components/Header';

describe('Header', () => {
  it('should render logo', () => {
    renderWithProviders(<Header />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });
});

════════════════════════════════════════════════════════════════════════════════
🔧 TEST UTILITIES
════════════════════════════════════════════════════════════════════════════════

Custom Render (use ALWAYS)
├─ renderWithProviders(<Component />)  # Never use plain render()
└─ From: src/__tests__/utils/test-render.tsx

Mock Data
├─ createMockProduct()              # Single product
├─ createMockProducts(5)            # Multiple products
├─ createMockApiResponse()          # API response
└─ From: src/__tests__/utils/mock-factories.ts

Test Fixtures
├─ MOCK_PRODUCTS                    # Pre-defined products
├─ MOCK_USER                        # Mock user data
├─ MOCK_API_RESPONSES               # API response examples
└─ From: src/__tests__/fixtures/data.ts

Helper Functions
├─ clickByText('Button')            # Click by text
├─ typeInInput('Email', 'text')     # Type in input
├─ waitForElement(...)              # Wait for element
├─ screen.debug()                   # See DOM
└─ From: src/__tests__/utils/test-helpers.ts

════════════════════════════════════════════════════════════════════════════════
📋 TEST TYPES TEMPLATES AVAILABLE
════════════════════════════════════════════════════════════════════════════════

Component Tests
└─ src/__tests__/components/Component.template.test.tsx
   ✓ Rendering tests        ✓ User interactions    ✓ Conditional rendering
   ✓ Props validation       ✓ Edge cases          ✓ Accessibility

Page Tests
└─ src/__tests__/pages/Page.template.test.tsx
   ✓ Page initialization    ✓ Navigation           ✓ Search & filter
   ✓ Error handling        ✓ Pagination          ✓ Retry logic

API Service Tests
└─ src/__tests__/api/API.template.test.ts
   ✓ GET requests          ✓ POST requests       ✓ Error handling
   ✓ Data transformation   ✓ Status codes        ✓ Network errors

Logic/Utility Tests
└─ src/__tests__/logic/Logic.template.test.ts
   ✓ Data transformation   ✓ Validation          ✓ Business logic
   ✓ Sorting/filtering     ✓ Edge cases          ✓ Error handling

════════════════════════════════════════════════════════════════════════════════
✅ COVERAGE TARGETS
════════════════════════════════════════════════════════════════════════════════

Component Tests           → 90%+ lines, 85%+ branches
Page Tests               → 85%+ lines, 80%+ branches
API/Service Tests        → 95%+ lines, 90%+ branches
Business Logic Tests     → 95%+ lines, 95%+ branches
────────────────────────────────────────────────────
OVERALL TARGET           → 80%+ lines, 75%+ branches

════════════════════════════════════════════════════════════════════════════════
🐛 DEBUGGING TESTS
════════════════════════════════════════════════════════════════════════════════

Use Interactive UI
└─ npm run test:ui                  # BEST way to debug!

Print DOM Tree
└─ screen.debug();                  # In your test to see HTML

Find Elements
├─ screen.getByText('text')         # By text
├─ screen.getByRole('button')       # By role
├─ screen.getByLabelText('label')   # By label
└─ screen.getByTestId('id')         # By data-testid

Wait for Async Operations
├─ await waitFor(() => {...})       # Wait for condition
├─ await screen.findByText('text')  # Wait and find
└─ See: src/__tests__/README.md     # Complete async patterns

════════════════════════════════════════════════════════════════════════════════
⚠️  DO'S AND DON'TS
════════════════════════════════════════════════════════════════════════════════

✅ DO
├─ Use renderWithProviders() (never plain render)
├─ Use mock factories for test data (not hardcoded)
├─ Test user-visible behavior (not implementation)
├─ Organize with describe blocks
├─ Use fixtures for repeated data
└─ Mock all external dependencies

❌ DON'T
├─ Hardcode test data (use factories/fixtures)
├─ Test internal component state (test output)
├─ Use setTimeout (use waitFor instead)
├─ Make tests dependent on execution order
├─ Leave console errors/warnings
└─ Test implementation details

════════════════════════════════════════════════════════════════════════════════
🚀 3-STEP QUICKSTART
════════════════════════════════════════════════════════════════════════════════

1️⃣  INSTALL
    npm install

2️⃣  EXPLORE
    npm run test:ui

3️⃣  CREATE YOUR FIRST TEST
    Copy template → Adapt → Run → ✨ Pass!

════════════════════════════════════════════════════════════════════════════════
📊 VIEWING RESULTS
════════════════════════════════════════════════════════════════════════════════

Terminal Output
└─ npm test

Interactive UI (RECOMMENDED)
└─ npm run test:ui
   • Shows test list
   • Run/re-run individual tests
   • See real-time results
   • Debug in browser

HTML Coverage Report
└─ npm run test:coverage
   Then open: coverage/index.html

════════════════════════════════════════════════════════════════════════════════
❓ QUICK FAQ
════════════════════════════════════════════════════════════════════════════════

Q: Where do I put test files?
A: Mirror your src/ structure in src/__tests__/

Q: What do I use to test components?
A: renderWithProviders() from src/__tests__/utils/test-render.tsx

Q: How do I get mock data for tests?
A: Use createMockProduct() or copy from src/__tests__/fixtures/data.ts

Q: How do I test API calls?
A: Use vi.mocked() and mock APIs. See API.template.test.ts

Q: Test fails with "cannot find module"?
A: Run npm install to install dependencies

Q: How do I debug a failing test?
A: Use npm run test:ui for interactive debugging

════════════════════════════════════════════════════════════════════════════════
🎓 LEARNING RESOURCES
════════════════════════════════════════════════════════════════════════════════

Quick Start (5 min)
└─ Read: TESTING_QUICK_START.md

Comprehensive Guide (20+ min)
├─ Read: src/__tests__/README.md
└─ Review: Template examples

Standards & Best Practices (10 min)
└─ Read: TEST_STANDARDS.md

GitHub Actions Setup (15 min)
└─ Read: CI_CD_TESTING_GUIDE.md

════════════════════════════════════════════════════════════════════════════════
📞 GET HELP
════════════════════════════════════════════════════════════════════════════════

Can't write a test?
└─ Check template in src/__tests__/ matching your test type

Need mock data?
└─ Review: src/__tests__/fixtures/data.ts or mock-factories.ts

Want to understand test patterns?
└─ See: src/__tests__/README.md section "Testing Best Practices"

Setup questions?
└─ Check: TESTING_COMPLETE_SETUP.md for all details

════════════════════════════════════════════════════════════════════════════════

Last Updated: November 2024
Status: ✅ READY TO USE
Next Step: npm install && npm run test:ui

════════════════════════════════════════════════════════════════════════════════
```
