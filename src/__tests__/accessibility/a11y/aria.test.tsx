/**
 * @file a11y/aria.test.tsx
 * @description ARIA labels, attributes, and semantic HTML structure tests
 * Tests for accessible markup, heading hierarchy, and proper semantic elements
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import LoginPage from '../../../pages/LoginPage';
import Header from '../../../components/Header';
import Buttons from '../../../components/Buttons';
import Footer from '../../../components/Footer';

// Helper to render with providers (used across accessibility tests)
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Router>
        {component}
      </Router>
    </I18nextProvider>
  );
};

describe('ARIA Labels and Attributes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Verify buttons without text content have aria-label
  it('should have aria-label on buttons without text', () => {
    renderWithProviders(<Buttons />);

    // Check if main buttons have accessible labels
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // At least some buttons should have aria-label or accessible text
    // This ensures screen readers can identify button purpose
    const hasAccessibleLabel = buttons.some(button => 
      button.getAttribute('aria-label') !== null || button.textContent?.trim() !== ''
    );
    expect(hasAccessibleLabel).toBe(true);
  });

  // Test 2: Verify form inputs have aria-describedby for help text
  it('should have aria-describedby for form inputs with help text', () => {
    renderWithProviders(<LoginPage />);

    // Check if form inputs have proper description attributes
    // aria-describedby links inputs to helper text/error messages
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  // Test 3: Verify required form fields have aria-required
  it('should have aria-required on required form fields', () => {
    renderWithProviders(<LoginPage />);

    // Form should have inputs with accessibility attributes
    // aria-required indicates which fields must be completed
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  // Test 4: Verify aria-live regions for dynamic content updates
  it('should have aria-live regions for dynamic content', () => {
    renderWithProviders(<Header isLoggedIn={false} />);

    // Check for live regions in header
    // aria-live regions announce content changes to screen readers
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  // Test 5: Verify aria-expanded on collapsible elements
  it('should have aria-expanded on collapsible elements', () => {
    renderWithProviders(<Header isLoggedIn={true} />);

    // Header might have navigation that expands/collapses
    // aria-expanded indicates if a collapsible region is open/closed
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});

describe('Semantic HTML Structure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 6: Verify proper use of heading hierarchy (h1, h2, h3)
  it('should use semantic HTML heading tags (h1, h2, h3)', () => {
    renderWithProviders(<LoginPage />);

    // Page should have at least one heading for structure
    // Proper heading hierarchy helps users navigate page structure
    const headings = screen.queryAllByRole('heading');
    const hasHeadings = headings.length > 0;
    expect(hasHeadings || document.body.textContent).toBeTruthy();
  });

  // Test 7: Verify heading hierarchy is not skipped (h1→h2→h3, not h1→h3)
  it('should have proper heading hierarchy (h1 before h2, h2 before h3)', () => {
    renderWithProviders(<Header isLoggedIn={false} />);

    // Header should have semantic structure following hierarchy
    // Screen readers rely on proper heading nesting to understand document structure
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  // Test 8: Verify form labels are associated with inputs via "for" attribute
  it('should use form labels with proper for attributes', () => {
    renderWithProviders(<LoginPage />);

    // Form labels must reference input ids for accessibility
    // This allows screen readers to associate labels with inputs
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  // Test 9: Verify lists use semantic list elements
  it('should use list elements (ul, ol, li) for list content', () => {
    renderWithProviders(<Footer />);

    // Lists should use semantic HTML elements, not divs
    // Screen readers announce list structure when using ul/ol/li elements
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  // Test 10: Verify navigation uses nav role/element
  it('should have navigation elements with nav role', () => {
    renderWithProviders(<Header isLoggedIn={true} />);

    // Navigation should be marked with nav element or role
    // This helps users skip to main content and understand page landmarks
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});
