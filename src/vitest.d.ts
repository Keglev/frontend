/**
 * @file vitest.d.ts
 * @description
 * Type definitions for Vitest testing framework.
 *
 * **Purpose:**
 * - Provides TypeScript type declarations for Vitest APIs
 * - Enables global test function access (describe, it, expect, etc.)
 * - Ensures type checking for assertion methods and test utilities
 *
 * **Global Functions Enabled:**
 * - `describe()` - Test suite grouping
 * - `it()` / `test()` - Individual test cases
 * - `expect()` - Assertion library
 * - `beforeEach()`, `afterEach()` - Test lifecycle hooks
 *
 * @see https://vitest.dev/guide/globals.html
 */

/// <reference types="vitest" />
import 'vitest/globals';
