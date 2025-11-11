/**
 * @file setup.ts
 * @description Global test setup and configuration including mocks for browser APIs and cleanup handlers
 * @domain test-environment
 * 
 * Enterprise-grade test utilities:
 * - localStorage mock with persistent storage behavior
 * - Cleanup handlers for test isolation
 * - window.matchMedia mock for responsive testing
 * - IntersectionObserver and ResizeObserver polyfills
 * - Console error filtering for clean test output
 */

import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * Mock localStorage with real storage behavior
 * Provides persistent key-value storage simulation for tests
 */
const localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => {
    // Verification: Retrieve value from mock storage or return null if not found
    return key in localStorageStore ? localStorageStore[key] : null;
  },
  setItem: (key: string, value: string) => {
    // Verification: Store value in mock storage with string conversion
    localStorageStore[key] = String(value);
  },
  removeItem: (key: string) => {
    // Verification: Remove key from mock storage
    delete localStorageStore[key];
  },
  clear: () => {
    // Verification: Clear all items from mock storage
    Object.keys(localStorageStore).forEach(key => {
      delete localStorageStore[key];
    });
  },
};
global.localStorage = localStorageMock as unknown as Storage;

/**
 * Global cleanup handler - executed after each test
 * Ensures proper test isolation and prevents state leakage between tests
 * 
 * Verification:
 * - DOM cleanup to remove rendered components
 * - Mock clearing to reset spy/mock call counts
 * - Storage clearing to ensure clean state for next test
 */
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear(); // Clear localStorage between tests
});

/**
 * Mock window.matchMedia for responsive component tests
 * Allows testing of media query-based responsive behavior without actual screen resizing
 * 
 * Verification:
 * - Simulates CSS media query matching
 * - Provides listeners for media query changes
 * - Returns false by default (matches: false) to simulate non-matching queries
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/**
 * Mock IntersectionObserver
 * Polyfill for IntersectionObserver API used in lazy loading and visibility detection
 * 
 * Verification:
 * - Implements required IntersectionObserver interface
 * - Allows tests to run without browser IntersectionObserver
 * - Prevents "IntersectionObserver is not defined" errors in test environment
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

/**
 * Mock ResizeObserver (required for recharts and responsive libraries)
 * Polyfill for ResizeObserver API used in responsive component sizing
 * 
 * Verification:
 * - Implements required ResizeObserver interface
 * - Allows recharts and responsive components to work in test environment
 * - Prevents "ResizeObserver is not defined" errors during testing
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

/**
 * Suppress specific console errors in test output
 * Filters out React deprecation warnings to keep test output clean and focused
 * 
 * Verification:
 * - Allows selective console.error filtering
 * - Preserves all other errors for proper debugging
 * - Reduces noise from known React deprecation warnings
 * 
 * Note: Comment out if you need to see all console output for debugging
 */
const originalError = console.error;
console.error = (...args: unknown[]) => {
  const firstArg = args[0];
  // Filter out specific warning patterns (e.g., React deprecation warnings)
  if (
    typeof firstArg === 'string' &&
    firstArg.includes('Warning: ReactDOM.render')
  ) {
    return;
  }
  // Pass through all other console.error calls
  originalError.call(console, ...args);
};
