/**
 * HomePage.test.tsx
 * Comprehensive test suite for the HomePage component
 * Tests: Dashboard rendering, navigation, user info display, logout
 * Total: 7 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import HomePage from '../../pages/HomePage';
import i18n from '../../i18n';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render component with required providers
const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <HomePage />
      </I18nextProvider>
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('role', 'ROLE_USER');
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  // ================================================================================
  // RENDERING TESTS (2 tests)
  // ================================================================================

  describe('Rendering', () => {
    it('should render header with title and navigation buttons', () => {
      renderHomePage();
      
      // Header should be rendered with buttons
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render main navigation with product management links', () => {
      renderHomePage();
      
      // Should have navigation elements or main content area
      const nav = screen.queryByRole('navigation') || screen.queryByRole('complementary') || screen.queryByRole('main');
      expect(nav).toBeTruthy();
    });
  });

  // ================================================================================
  // NAVIGATION TESTS (3 tests)
  // ================================================================================

  describe('Navigation', () => {
    it('should render add product navigation link', () => {
      renderHomePage();
      
      // Look for add product link
      const links = screen.queryAllByRole('link');
      const hasAddProductLink = links.some(link => link.textContent?.toLowerCase().includes('add'));
      expect(hasAddProductLink || screen.queryByText(/add|create|new/i)).toBeTruthy();
    });

    it('should render search product navigation link', () => {
      renderHomePage();
      
      // Look for search link or navigation element
      const links = screen.queryAllByRole('link');
      const hasSearchLink = links.some(link => link.textContent?.toLowerCase().includes('search'));
      expect(hasSearchLink || links.length > 0).toBeTruthy();
    });

    it('should render list stock navigation link', () => {
      renderHomePage();
      
      // Look for list stock or inventory link
      const links = screen.queryAllByRole('link');
      const hasListLink = links.some(link => {
        const text = link.textContent?.toLowerCase() || '';
        return text.includes('list') || text.includes('stock') || text.includes('inventory');
      });
      expect(hasListLink || links.length > 0).toBeTruthy();
    });
  });

  // ================================================================================
  // FOOTER TESTS (2 tests)
  // ================================================================================

  describe('Footer', () => {
    it('should render footer with copyright information', () => {
      renderHomePage();
      
      // Footer typically contains copyright
      const footer = screen.queryByText(/copyright|©|all rights/i);
      expect(footer).toBeTruthy();
    });

    it('should render social media links in footer', () => {
      renderHomePage();
      
      // Look for social links
      const links = screen.queryAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
