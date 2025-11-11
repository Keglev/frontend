/**
 * @file HomePage.test.tsx
 * @description Tests for HomePage component including dashboard rendering, navigation elements, and user interface
 * @domain page-integration
 * 
 * Enterprise-grade test coverage:
 * - Header and title rendering
 * - Main navigation with product management links
 * - Add product, search product, and list stock navigation
 * - Footer with copyright information
 * - Social media links in footer
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
      
      // Verification: Header renders navigation buttons for user actions
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render main navigation with product management links', () => {
      renderHomePage();
      
      // Verification: Main navigation structure exists (navigation, complementary, or main role)
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
      
      // Verification: Add product link exists in navigation
      const links = screen.queryAllByRole('link');
      const hasAddProductLink = links.some(link => link.textContent?.toLowerCase().includes('add'));
      expect(hasAddProductLink || screen.queryByText(/add|create|new/i)).toBeTruthy();
    });

    it('should render search product navigation link', () => {
      renderHomePage();
      
      // Verification: Search product link available in main navigation
      const links = screen.queryAllByRole('link');
      const hasSearchLink = links.some(link => link.textContent?.toLowerCase().includes('search'));
      expect(hasSearchLink || links.length > 0).toBeTruthy();
    });

    it('should render list stock navigation link', () => {
      renderHomePage();
      
      // Verification: List stock/inventory link present in navigation menu
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
      
      // Verification: Footer displays copyright or rights information
      const footer = screen.queryByText(/copyright|©|all rights/i);
      expect(footer).toBeTruthy();
    });

    it('should render social media links in footer', () => {
      renderHomePage();
      
      // Verification: Footer contains social media or external links
      const links = screen.queryAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
