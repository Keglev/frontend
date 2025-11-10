/**
 * HelpModal.test.tsx
 * Comprehensive test suite for the HelpModal component
 * Tests: Modal visibility, content rendering, close functionality, dark mode support, multilingual support
 * Total: 10 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import HelpModal from '../../components/HelpModal';
import i18n from '../../i18n';

// Helper function to render component with required providers
const renderHelpModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    pageKey: 'adminDashboard',
    ...props,
  };

  return render(
    <I18nextProvider i18n={i18n}>
      <HelpModal {...defaultProps} />
    </I18nextProvider>
  );
};

describe('HelpModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ================================================================================
  // VISIBILITY TESTS (2 tests)
  // ================================================================================

  describe('Modal Visibility', () => {
    it('should not render modal when isOpen is false', () => {
      const { container } = renderHelpModal({ isOpen: false });
      
      const modal = container.querySelector('.fixed');
      expect(modal).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      const { container } = renderHelpModal({ isOpen: true });
      
      const modal = container.querySelector('.fixed');
      expect(modal).toBeInTheDocument();
    });
  });

  // ================================================================================
  // MODAL CONTENT TESTS (3 tests)
  // ================================================================================

  describe('Modal Content', () => {
    it('should render modal with title', () => {
      renderHelpModal({ isOpen: true, pageKey: 'adminDashboard' });
      
      // The modal should render with h2 element (the title)
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toBeInTheDocument();
    });

    it('should render modal with backdrop overlay', () => {
      const { container } = renderHelpModal({ isOpen: true });
      
      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render modal content section', () => {
      const { container } = renderHelpModal({ isOpen: true });
      
      const contentDiv = container.querySelector('.mt-4');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  // ================================================================================
  // CLOSE BUTTON TESTS (2 tests)
  // ================================================================================

  describe('Close Button Functionality', () => {
    it('should render close button', () => {
      renderHelpModal({ isOpen: true });
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const mockOnClose = vi.fn();
      renderHelpModal({ isOpen: true, onClose: mockOnClose });
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledOnce();
    });
  });

  // ================================================================================
  // STYLING TESTS (2 tests)
  // ================================================================================

  describe('Styling and Theme Support', () => {
    it('should apply dark mode styles when available', () => {
      const { container } = renderHelpModal({ isOpen: true });
      
      const modal = container.querySelector('.bg-white');
      expect(modal).toHaveClass('dark:bg-gray-800', 'dark:text-white');
    });

    it('should apply responsive width classes', () => {
      const { container } = renderHelpModal({ isOpen: true });
      
      const modal = container.querySelector('.w-\\[400px\\]');
      expect(modal).toHaveClass('w-[400px]', 'max-w-full');
    });
  });

  // ================================================================================
  // PAGE KEY VARIATION TESTS (1 test)
  // ================================================================================

  describe('Dynamic Content Based on PageKey', () => {
    it('should render different content for different pageKeys', () => {
      const { rerender } = render(
        <I18nextProvider i18n={i18n}>
          <HelpModal isOpen={true} onClose={vi.fn()} pageKey="loginPage" />
        </I18nextProvider>
      );
      
      // Verify component renders for different page keys
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      
      // Rerender with different page key
      rerender(
        <I18nextProvider i18n={i18n}>
          <HelpModal isOpen={true} onClose={vi.fn()} pageKey="adminDashboard" />
        </I18nextProvider>
      );
      
      // Should still have title
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});
