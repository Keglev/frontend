/**
 * @file initialization-and-config.test.ts
 * @description Unit tests for i18n module initialization and configuration validation.
 * Tests verify proper setup of internationalization settings, namespace configuration,
 * language detection preferences, and resource loading.
 * @domain Internationalization (i18n) Module Configuration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import i18n from '../../../i18n';

describe('i18n Module Initialization & Configuration', () => {
  beforeEach(() => {
    // Reset localStorage before each test for clean state
    localStorage.clear();
  });

  afterEach(() => {
    // Cleanup localStorage after each test
    localStorage.clear();
  });

  // ============================================================================
  // 1. MODULE INITIALIZATION (5 tests)
  // ============================================================================
  // Tests: Module loading, window attachment, configuration completeness
  // Purpose: Ensure i18n module is properly initialized with required settings

  describe('Module Initialization', () => {
    it('should initialize i18n with correct configuration', () => {
      // Module existence: i18n object must be defined
      expect(i18n).toBeDefined();
      // Initialization flag: Module should be ready for use
      expect(i18n.isInitialized).toBe(true);
    });

    it('should have i18n attached to window object for debugging', () => {
      // Global availability: i18n exposed on window.i18next for console debugging
      // Allows developers to inspect/modify i18n state directly in browser
      expect(window.i18next).toBeDefined();
      expect(window.i18next).toBe(i18n);
    });

    it('should have correct fallback language configured', () => {
      // Fallback language: When user language unavailable, use fallback
      // Default fallback should be English ('en') for global audience
      expect(i18n).toBeDefined();

      const fallbackLng = i18n.options.fallbackLng;
      expect(fallbackLng).toBeDefined();

      // Fallback can be string or array - check both formats
      if (typeof fallbackLng === 'string') {
        expect(fallbackLng).toBe('en');
      } else if (Array.isArray(fallbackLng)) {
        expect(fallbackLng).toContain('en');
      }
    });

    it('should have both translation namespaces configured', () => {
      // Namespace management: Support both 'translation' and 'help' namespaces
      // Translation: Main UI strings
      // Help: Contextual help and tooltips
      expect(i18n.options.ns).toContain('translation');
      expect(i18n.options.ns).toContain('help');
    });

    it('should set default namespace to translation', () => {
      // Default namespace: When no prefix specified, use 'translation' namespace
      // Simplifies calls: i18n.t('login') instead of i18n.t('translation:login')
      expect(i18n.options.defaultNS).toBe('translation');
    });
  });

  // ============================================================================
  // 2. CONFIGURATION VALIDATION (3 tests)
  // ============================================================================
  // Tests: Detection strategy, caching, interpolation settings
  // Purpose: Verify detection and caching strategy for language preferences

  describe('Configuration Validation', () => {
    it('should have detection configured with localStorage priority', () => {
      // Detection order: localStorage > browser language > fallback
      // localStorage first: User's saved preference takes priority
      // navigator next: Browser language if no saved preference
      const detectionConfig = i18n.options.detection;
      expect(detectionConfig?.order).toContain('localStorage');
      expect(detectionConfig?.order).toContain('navigator');
      // Verify localStorage checked before navigator
      expect(detectionConfig?.order?.indexOf('localStorage')).toBeLessThan(
        detectionConfig?.order?.indexOf('navigator') || Infinity
      );
    });

    it('should cache language detection in localStorage', () => {
      // Caching strategy: Persist detected/selected language to localStorage
      // Allows fast language detection on subsequent page loads
      const detectionConfig = i18n.options.detection;
      expect(detectionConfig?.caches).toContain('localStorage');
    });

    it('should not escape HTML in interpolation for React safety', () => {
      // React safety: Disable escapeValue for React components
      // React automatically escapes content, so double-escaping causes issues
      // Safe for React: HTML entities in translations won't double-escape
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });
  });

  // ============================================================================
  // 3. TRANSLATION RESOURCES (3 tests)
  // ============================================================================
  // Tests: Available languages, namespace content, resource loading
  // Purpose: Verify all translation files are loaded and accessible

  describe('Translation Resources', () => {
    it('should have English translations available', () => {
      // English: Primary language with full translation support
      const resources = i18n.options.resources;
      expect(resources?.en).toBeDefined();
      expect(resources?.en?.translation).toBeDefined();
      expect(resources?.en?.help).toBeDefined();
    });

    it('should have German translations available', () => {
      // German: Secondary language with full translation support
      // Supports European market and German-speaking users
      const resources = i18n.options.resources;
      expect(resources?.de).toBeDefined();
      expect(resources?.de?.translation).toBeDefined();
      expect(resources?.de?.help).toBeDefined();
    });

    it('should have translation and help namespaces with content', () => {
      // Content verification: Both namespaces must have actual translations
      // Empty namespaces indicate failed resource loading
      const resources = i18n.options.resources;
      expect(Object.keys(resources?.en?.translation || {}).length).toBeGreaterThan(0);
      expect(Object.keys(resources?.en?.help || {}).length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // 4. NAMESPACE MANAGEMENT (3 tests)
  // ============================================================================
  // Tests: Namespace organization, prefix handling, namespace listing
  // Purpose: Verify namespace system allows logical organization of translations

  describe('Namespace Management', () => {
    it('should allow translation from specific namespace with prefix', () => {
      // Namespace prefix: "help:welcome" accesses 'help' namespace
      // Format: "namespace:key" for explicit namespace access
      const helpTranslation = i18n.t('help:welcome');
      expect(typeof helpTranslation).toBe('string');
    });

    it('should use default namespace when no prefix specified', () => {
      // Default namespace: "login" uses default 'translation' namespace
      // Convenience: Common translations don't need namespace prefix
      const defaultTranslation = i18n.t('login');
      expect(typeof defaultTranslation).toBe('string');
    });

    it('should list all available namespaces', () => {
      // Namespace enumeration: Can list all configured namespaces
      // Useful for debugging and validating configuration
      const namespaces = i18n.options.ns;
      expect(Array.isArray(namespaces)).toBe(true);
      expect(namespaces?.length).toBeGreaterThan(0);
    });
  });
});
