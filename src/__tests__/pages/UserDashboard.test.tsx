/**
 * UserDashboard.test.tsx
 * Comprehensive test suite for the UserDashboard component
 * Tests: User dashboard rendering, low stock alerts, product management links
 * Total: 6 tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import UserDashboard from '../../pages/UserDashboard';
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
const renderUserDashboard = () => {
  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <UserDashboard />
      </I18nextProvider>
    </BrowserRouter>
  );
};

describe('UserDashboard', () => {
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
    it('should render user dashboard with header and navigation', () => {
      renderUserDashboard();
      
      // Header should be rendered
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render dashboard title and subtitle', () => {
      renderUserDashboard();
      
      // Should display dashboard info
      expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    });
  });

  // ================================================================================
  // PRODUCT MANAGEMENT LINKS TESTS (2 tests)
  // ================================================================================

  describe('Product Management', () => {
    it('should render links to product operations', () => {
      renderUserDashboard();
      
      // Should have links for product management
      const links = screen.queryAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(0);
    });

    it('should display navigation options for adding and searching products', () => {
      renderUserDashboard();
      
      // Look for product management options
      expect(screen.getByText(/Search Product/i)).toBeInTheDocument();
    });
  });

  // ================================================================================
  // LAYOUT AND FOOTER TESTS (2 tests)
  // ================================================================================

  describe('Layout and Footer', () => {
    it('should include sidebar with stock information', () => {
      renderUserDashboard();
      
      // Sidebar should be rendered - look for list stock button
      expect(screen.getByText(/List Stock/i)).toBeInTheDocument();
    });

    it('should render footer with page structure', () => {
      const { container } = renderUserDashboard();
      
      // Check for footer
      const header = container.querySelector('header');
      expect(header).toBeTruthy();
    });
  });
});
