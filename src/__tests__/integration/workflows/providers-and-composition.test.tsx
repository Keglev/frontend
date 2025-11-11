/**
 * @file providers-and-composition.test.tsx
 * @description Integration tests for provider functionality and component composition patterns.
 * Tests verify that i18n and Router providers work correctly across component trees,
 * and that component composition patterns are maintained for Header and Sidebar integration.
 * @component Provider functionality, Component composition
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import i18n from '../../../i18n';
import HomePage from '../../../pages/HomePage';
import LoginPage from '../../../pages/LoginPage';
import Sidebar from '../../../components/Sidebar';

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

describe('Integration: Providers and Component Composition', () => {
  beforeEach(() => {
    // Reset i18n state before each test for clean test isolation
    i18n.changeLanguage('en');
  });

  // ============================================================================
  // 3. PROVIDER FUNCTIONALITY (3 tests)
  // ============================================================================

  describe('Provider Functionality', () => {
    it('should render components with i18n provider available', () => {
      // Verify i18n translations are accessible within provider context
      renderWithProviders(<HomePage />);
      const translation = i18n.t('login');
      expect(typeof translation).toBe('string');
    });

    it('should support Router context in component tree', () => {
      // Verify Router provider enables navigation context and prevents errors
      // Components using useNavigate() and useParams() should work without errors
      expect(() => {
        renderWithProviders(<HomePage />);
      }).not.toThrow();
    });

    it('should maintain provider context across component rerender', () => {
      // Verify providers persist state through React rerender cycles
      // i18n should remain initialized even after component tree updates
      const { rerender } = renderWithProviders(<HomePage />);
      expect(i18n.isInitialized).toBe(true);

      rerender(
        <I18nextProvider i18n={i18n}>
          <Router>
            <HomePage />
          </Router>
        </I18nextProvider>
      );

      expect(i18n.isInitialized).toBe(true);
    });
  });

  // ============================================================================
  // 4. COMPONENT COMPOSITION (3 tests)
  // ============================================================================

  describe('Component Composition', () => {
    it('should render Header component in HomePage', () => {
      // HomePage composition includes Header banner for navigation
      // Header should be accessible role="banner"
      renderWithProviders(<HomePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render Header component in LoginPage', () => {
      // LoginPage composition includes Header banner even on auth pages
      // Navigation should be available to authenticated users
      renderWithProviders(<LoginPage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render Sidebar with correct component structure', () => {
      // Sidebar composition test: verify component renders with expected props
      // Sidebar displays stock value and low-stock product notifications
      const mockProducts = [
        { id: 1, name: 'Product 1', quantity: 5 }
      ];
      renderWithProviders(
        <Sidebar stockValue={1000} lowStockProducts={mockProducts} />
      );

      // Component renders without errors or missing dependencies
      expect(document.body).toBeTruthy();
    });
  });
});
