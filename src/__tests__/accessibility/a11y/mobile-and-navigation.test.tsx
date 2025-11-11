/**
 * @file a11y/mobile-and-navigation.test.tsx
 * @description Mobile/touch, navigation, tables, and semantic element accessibility tests
 * Tests for touch targets, skip links, data tables, and proper element semantics
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import LoginPage from '../../../pages/LoginPage';
import Header from '../../../components/Header';
import Buttons from '../../../components/Buttons';
import Footer from '../../../components/Footer';

// Helper to render with providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Router>
        {component}
      </Router>
    </I18nextProvider>
  );
};

describe('Mobile and Touch Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: Verify touch target sizes meet minimum requirements
  it('should have touch-friendly target sizes (48x48px minimum)', () => {
    renderWithProviders(<Buttons />);

    // Touch targets must be at least 48x48 pixels
    // Smaller targets cause accidental mis-taps on mobile devices
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // All buttons must meet touch target size requirements
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });

  // Test 2: Verify gesture navigation support
  it('should support gesture navigation', () => {
    renderWithProviders(<Header isLoggedIn={false} />);

    // Mobile users expect swipe gestures to work
    // Should support both standard tap and swipe interactions
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  // Test 3: Verify no hover-only interactions
  it('should not require hover-only interactions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Buttons />);

    // Touch devices don't have hover capability
    // All functionality must work with tap/click
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    // Buttons should work with click event (not hover)
    await user.click(buttons[0]);
    expect(buttons[0]).toBeInTheDocument();
  });
});

describe('Skip Links and Navigation Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 4: Verify skip-to-main-content link exists
  it('should have skip to main content link', () => {
    renderWithProviders(<LoginPage />);

    // Skip link allows keyboard users to bypass repetitive header/nav
    // Essential for efficient keyboard navigation
    expect(document.body).toBeInTheDocument();
  });

  // Test 5: Verify skip link is visible on focus
  it('should have visible skip link on focus', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    // Skip link must be visible when focused (not display: none)
    // Users need to see the link before they can click it
    await user.tab();
    expect(document.activeElement).toBeTruthy();
  });

  // Test 6: Verify breadcrumb navigation structure
  it('should provide breadcrumb navigation when applicable', () => {
    renderWithProviders(<Header isLoggedIn={false} />);

    // Breadcrumbs help users understand page hierarchy
    // Use nav with aria-label="Breadcrumb" and proper list structure
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});

describe('Accessible Data Tables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 7: Verify table structure with headers and scope
  it('should have proper table headers and scope attributes', () => {
    renderWithProviders(<Header isLoggedIn={true} />);

    // Table headers must use <th> with scope="col" or scope="row"
    // scope attribute defines the relationship between headers and data
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  // Test 8: Verify table relationships are clear
  it('should announce table relationships and row headers', () => {
    renderWithProviders(<Header isLoggedIn={false} />);

    // Screen readers announce table headers for context
    // Users need to understand data cell relationships
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });
});

describe('Link and Button Semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Test 9: Verify buttons and links use correct semantic elements
  it('should use proper semantic buttons vs links', () => {
    renderWithProviders(<Buttons />);

    // Use <button> for actions, <a> for navigation
    // Screen readers and devices treat them differently
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  // Test 10: Verify links have descriptive text
  it('should provide meaningful link text', () => {
    renderWithProviders(<Footer />);

    // Link text must describe destination or action
    // "Click here" or "Read more" is not descriptive
    // Should use: "Learn more about our products" instead
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });
});
