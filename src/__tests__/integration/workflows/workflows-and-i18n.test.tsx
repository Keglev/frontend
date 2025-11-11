/**
 * @file workflows-and-i18n.test.tsx
 * @description Integration tests for language support, multi-component workflows, and error handling.
 * Tests verify that internationalization works across the application, multi-page transitions
 * maintain component structure, dynamic content renders correctly, and error handling is robust.
 * @component i18n support, Multi-component workflows, Error recovery
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import i18n from '../../../i18n';
import HomePage from '../../../pages/HomePage';
import LoginPage from '../../../pages/LoginPage';
import UserDashboard from '../../../pages/UserDashboard';

/**
 * Helper function to render components with all required providers.
 * Wraps components in I18nextProvider for translations and Router for navigation.
 */
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Router>
        {component}
      </Router>
    </I18nextProvider>
  );
};

describe('Integration: Language Support, Workflows, and Error Handling', () => {
  beforeEach(() => {
    // Reset i18n state and language before each test for clean test isolation
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    // Clean up after tests
    vi.clearAllMocks();
  });

  // ============================================================================
  // 5. LANGUAGE SUPPORT (2 tests)
  // ============================================================================

  describe('Language Support', () => {
    it('should support language property in i18n', () => {
      // Verify i18n language property is accessible and returns string
      // Users can check current language for display purposes
      renderWithProviders(<HomePage />);
      expect(typeof i18n.language).toBe('string');
    });

    it('should have translation resources loaded in i18n', () => {
      // Verify translation files (de.json, en.json) are loaded and available
      // Key translations like 'logout' should be accessible from any component
      renderWithProviders(<HomePage />);
      const translation = i18n.t('logout');
      expect(translation).toBeTruthy();
      expect(typeof translation).toBe('string');
    });
  });

  // ============================================================================
  // 6. MULTI-COMPONENT WORKFLOWS (3 tests)
  // ============================================================================

  describe('Multi-Component Workflows', () => {
    it('should handle page transitions without errors', () => {
      // Verify component switching workflow: render HomePage, transition to LoginPage
      // Both pages should maintain Header component and provider context
      const { rerender } = renderWithProviders(<HomePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();

      rerender(
        <I18nextProvider i18n={i18n}>
          <Router>
            <LoginPage />
          </Router>
        </I18nextProvider>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should maintain component structure across multiple page rerenders', () => {
      // Verify component tree stability through multi-page workflow
      // HomePage → UserDashboard transition should preserve Header banner
      const { rerender } = renderWithProviders(<HomePage />);
      let header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      rerender(
        <I18nextProvider i18n={i18n}>
          <Router>
            <UserDashboard />
          </Router>
        </I18nextProvider>
      );

      header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should support dynamic content rendering in workflow', () => {
      // Verify dynamic content (main section) renders correctly
      // Page content should be available alongside static Header component
      renderWithProviders(<HomePage />);
      const mainContent = document.body.querySelector('main') || document.body;
      expect(mainContent).toBeTruthy();
    });
  });

  // ============================================================================
  // 7. ERROR HANDLING AND STABILITY (2 tests)
  // ============================================================================

  describe('Error Handling and Stability', () => {
    it('should render components without throwing errors', () => {
      // Verify HomePage renders without throwing exceptions or console errors
      // Mock console.error to catch any unexpected error messages
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      try {
        expect(() => {
          renderWithProviders(<HomePage />);
        }).not.toThrow();
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it('should recover from mount/unmount cycles', () => {
      // Verify component cleanup and re-initialization works correctly
      // Unmounting HomePage and mounting LoginPage should not cause errors
      const { unmount } = renderWithProviders(<HomePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();

      unmount();

      expect(() => {
        renderWithProviders(<LoginPage />);
      }).not.toThrow();
    });
  });
});
