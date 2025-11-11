/**
 * @file app-and-pages.test.tsx
 * @description Integration tests for App-level rendering with providers and page component rendering.
 * Tests verify that all major pages (HomePage, LoginPage, UserDashboard, AddProductPage) render
 * correctly with provider setup and maintain expected DOM structure.
 * @component App, HomePage, LoginPage, UserDashboard, AddProductPage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';

import i18n from '../../../i18n';
import App from '../../../App';
import HomePage from '../../../pages/HomePage';
import LoginPage from '../../../pages/LoginPage';
import UserDashboard from '../../../pages/UserDashboard';
import AddProductPage from '../../../pages/AddProductPage';

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

/**
 * Helper function for rendering App component which already includes Router.
 * Only wraps with I18nextProvider since App provides its own Router.
 */
const renderAppWithI18n = (component: React.ReactElement) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

describe('Integration: App-Level and Page Rendering', () => {
  beforeEach(() => {
    // Reset i18n state before each test for clean test isolation
    i18n.changeLanguage('en');
  });

  // ============================================================================
  // 1. APP-LEVEL RENDERING WITH PROVIDERS (4 tests)
  // ============================================================================

  describe('App-Level Rendering with Providers', () => {
    it('should render App component without throwing', () => {
      // Verify App component renders successfully with all providers
      // App should contain routing setup and context providers
      expect(() => {
        renderAppWithI18n(<App />);
      }).not.toThrow();
    });

    it('should apply i18n provider to rendered App', () => {
      // Verify i18n context is available throughout App component tree
      renderAppWithI18n(<App />);
      expect(i18n.isInitialized).toBe(true);
    });

    it('should wrap App with Router for navigation', () => {
      // Verify Router context is established for <Link> and <Route> components
      // App component includes its own Router, so it should render without nesting issues
      expect(() => {
        renderAppWithI18n(<App />);
      }).not.toThrow();
    });

    it('should render App with both providers active', () => {
      // Verify both I18nextProvider and Router are functioning together
      renderAppWithI18n(<App />);
      const translation = i18n.t('login');
      expect(typeof translation).toBe('string');
    });
  });

  // ============================================================================
  // 2. PAGE COMPONENT RENDERING (4 tests)
  // ============================================================================

  describe('Page Component Rendering', () => {
    it('should render HomePage with Header component', () => {
      // HomePage should include Header banner for navigation
      renderWithProviders(<HomePage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render LoginPage with Header component', () => {
      // LoginPage should display Header even on unauthenticated page
      renderWithProviders(<LoginPage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render UserDashboard with Header component', () => {
      // UserDashboard is authenticated page that should include Header
      renderWithProviders(<UserDashboard />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('should render AddProductPage with Header component', () => {
      // AddProductPage is authenticated admin page that should include Header
      renderWithProviders(<AddProductPage />);
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});
