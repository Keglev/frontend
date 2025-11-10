/**
 * Footer.test.tsx
 * Comprehensive test suite for the Footer component
 * Tests: Copyright display, social media links, dark mode support, accessibility
 * Total: 8 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import Footer from '../../components/Footer';
import i18n from '../../i18n';

// Helper function to render component with required providers
const renderFooter = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Footer />
    </I18nextProvider>
  );
};

describe('Footer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ================================================================================
  // COPYRIGHT SECTION TESTS (2 tests)
  // ================================================================================

  describe('Copyright Section', () => {
    it('should render copyright notice', () => {
      renderFooter();
      
      const copyrightText = screen.getByText(/2025 StockEase/);
      expect(copyrightText).toBeInTheDocument();
    });

    it('should render footer as semantic footer element', () => {
      const { container } = renderFooter();
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });

  // ================================================================================
  // SOCIAL MEDIA LINKS TESTS (3 tests)
  // ================================================================================

  describe('Social Media Links', () => {
    it('should render GitHub link with correct URL', () => {
      renderFooter();
      
      const githubLink = screen.getByRole('link', { name: /GitHub/i });
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', 'https://github.com/Keglev');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render LinkedIn link with correct URL', () => {
      renderFooter();
      
      const linkedinLink = screen.getByRole('link', { name: /LinkedIn/i });
      expect(linkedinLink).toBeInTheDocument();
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/carloskeglevich');
      expect(linkedinLink).toHaveAttribute('target', '_blank');
      expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render both social media links', () => {
      renderFooter();
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(2);
      
      const githubLink = screen.getByText(/GitHub/);
      const linkedinLink = screen.getByText(/LinkedIn/);
      
      expect(githubLink).toBeInTheDocument();
      expect(linkedinLink).toBeInTheDocument();
    });
  });

  // ================================================================================
  // RESPONSIVE DESIGN TESTS (2 tests)
  // ================================================================================

  describe('Responsive Design', () => {
    it('should apply responsive width classes', () => {
      const { container } = renderFooter();
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('w-full');
    });

    it('should apply responsive padding classes', () => {
      const { container } = renderFooter();
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('py-4', 'mt-6');
    });
  });

  // ================================================================================
  // DARK MODE SUPPORT TEST (1 test)
  // ================================================================================

  describe('Dark Mode Support', () => {
    it('should apply dark mode styling classes', () => {
      const { container } = renderFooter();
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('dark:bg-gray-800', 'dark:text-white');
    });
  });
});
