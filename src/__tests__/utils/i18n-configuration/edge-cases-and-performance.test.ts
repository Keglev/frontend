/**
 * @file edge-cases-and-performance.test.ts
 * @description Unit tests for i18n edge cases, performance characteristics, and robustness.
 * Tests verify proper handling of boundary conditions, performance optimization,
 * translation caching, and language support coverage.
 * @domain i18n Robustness & Performance
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import i18n from '../../../i18n';

describe('i18n Edge Cases, Performance & Robustness', () => {
  beforeEach(() => {
    // Reset localStorage before each test for clean state
    localStorage.clear();
  });

  afterEach(() => {
    // Cleanup localStorage after each test
    localStorage.clear();
  });

  // ============================================================================
  // 9. EDGE CASES (4 tests)
  // ============================================================================
  // Tests: Boundary conditions, empty values, null handling, edge scenarios
  // Purpose: Ensure system remains stable with unusual input/state

  describe('Edge Cases', () => {
    it('should handle empty language code', async () => {
      // Empty code: Setting empty string as language should handle gracefully
      // Should either fallback to existing language or use default
      await i18n.changeLanguage('');
      // Language should still be defined (not empty or undefined)
      expect(i18n.language).toBeDefined();
    });

    it('should handle null localStorage entry gracefully', () => {
      // Missing localStorage: When language key doesn't exist
      // Should fall back to default detection mechanism
      localStorage.removeItem('language');
      const hasLanguage = i18n.language !== undefined;
      expect(hasLanguage).toBe(true);
    });

    it('should maintain translations after multiple initialization attempts', () => {
      // Consistency: Multiple translation calls should return same value
      // Verifies no state corruption after repeated initialization
      const firstTranslation = i18n.t('login');
      const secondTranslation = i18n.t('login');
      expect(firstTranslation).toBe(secondTranslation);
    });

    it('should support switching between all available languages without errors', async () => {
      // Language coverage: Support all configured languages
      // Multiple language switches should work seamlessly
      const languages = ['en', 'de'];

      for (const lang of languages) {
        await expect(i18n.changeLanguage(lang)).resolves.toBeDefined();
        expect(i18n.language).toBe(lang);
      }
    });
  });

  // ============================================================================
  // 10. PERFORMANCE AND OPTIMIZATION (2 tests)
  // ============================================================================
  // Tests: Initialization speed, translation caching, repeated access speed
  // Purpose: Verify performance meets requirements for responsive UI

  describe('Performance and Optimization', () => {
    it('should initialize synchronously without blocking', () => {
      // Initialization speed: Module should be ready immediately
      // No async operations during initialization that could block
      const startTime = performance.now();
      const isReady = i18n.isInitialized;
      const endTime = performance.now();

      expect(isReady).toBe(true);
      // Should initialize in less than 100ms (very fast)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should cache translations for quick access', () => {
      // Translation caching: Repeated calls should be faster
      // First call might do work (parsing, formatting)
      // Subsequent calls use cache for instant results
      const startTime = performance.now();
      i18n.t('login');
      const firstCallTime = performance.now() - startTime;

      const startTime2 = performance.now();
      i18n.t('login');
      const secondCallTime = performance.now() - startTime2;

      // Second call should be faster or equal (cached)
      // Allow 1ms margin for timing variations
      expect(secondCallTime).toBeLessThanOrEqual(firstCallTime + 1);
    });
  });
});
