#!/bin/bash

# Verify production build excludes test files and documentation
# This script is run by GitHub Actions before deploying to production

set -e

echo "=========================================="
echo "Production Build Verification"
echo "=========================================="
echo ""

ERRORS=0

# 1. Verify dist directory exists
echo "1. Checking dist/ directory..."
if [ ! -d "dist" ]; then
  echo "✗ ERROR: dist/ directory not found!"
  exit 1
fi
echo "✓ dist/ directory exists"
echo ""

# 2. Verify no test files in dist
echo "2. Checking for test files in dist/..."
TEST_FILES=$(find dist -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*spec.ts" -o -name "*spec.tsx" \) 2>/dev/null | wc -l)
if [ "$TEST_FILES" -gt 0 ]; then
  echo "✗ ERROR: Found $TEST_FILES test files in dist/"
  find dist -type f \( -name "*.test.ts" -o -name "*.test.tsx" -o -name "*spec.ts" -o -name "*spec.tsx" \) 2>/dev/null | head -5
  ERRORS=$((ERRORS + 1))
else
  echo "✓ No test files in dist/"
fi
echo ""

# 3. Verify no __tests__ directory in dist
echo "3. Checking for __tests__/ directory in dist/..."
if [ -d "dist/__tests__" ]; then
  echo "✗ ERROR: __tests__/ directory found in dist/"
  ERRORS=$((ERRORS + 1))
else
  echo "✓ No __tests__/ directory in dist/"
fi
echo ""

# 4. Verify no docs in dist
echo "4. Checking for docs/ directory in dist/..."
if [ -d "dist/docs" ]; then
  echo "✗ ERROR: docs/ directory found in dist/"
  ERRORS=$((ERRORS + 1))
else
  echo "✓ No docs/ directory in dist/"
fi
echo ""

# 5. Verify no markdown files in dist (except for specific runtime files)
echo "5. Checking for markdown files in dist/..."
MD_FILES=$(find dist -type f -name "*.md" 2>/dev/null | wc -l)
if [ "$MD_FILES" -gt 0 ]; then
  echo "⚠ WARNING: Found $MD_FILES markdown files in dist/"
  find dist -type f -name "*.md" 2>/dev/null
  # Don't fail for this, as some build tools might generate .md files
else
  echo "✓ No markdown files in dist/"
fi
echo ""

# 6. Verify vitest/jest config files are NOT in dist
echo "6. Checking for test config files in dist/..."
CONFIG_FILES=$(find dist -type f \( -name "vitest.config.*" -o -name "jest.config.*" -o -name "vitest.setup.*" \) 2>/dev/null | wc -l)
if [ "$CONFIG_FILES" -gt 0 ]; then
  echo "✗ ERROR: Found $CONFIG_FILES test config files in dist/"
  ERRORS=$((ERRORS + 1))
else
  echo "✓ No test config files in dist/"
fi
echo ""

# 7. Summary
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
  echo "✓ All production build checks PASSED"
  echo "=========================================="
  exit 0
else
  echo "✗ Production build verification FAILED ($ERRORS errors found)"
  echo "=========================================="
  exit 1
fi
