/**
 * @file render.test.tsx
 * @description Rendering tests for HelpModal component
 * @component Tests for modal visibility, content structure, styling, and layout
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import HelpModal from '../../../components/HelpModal';
import i18n from '../../../i18n';

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

describe('HelpModal Component - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should not render modal overlay when isOpen is false', () => {
      // Verify that when isOpen={false}, the modal does not appear in the DOM
      const { container } = renderHelpModal({ isOpen: false });
      
      const modal = container.querySelector('.fixed');
      expect(modal).not.toBeInTheDocument();
    });

    it('should render modal overlay when isOpen is true', () => {
      // Verify that when isOpen={true}, the modal container with fixed positioning renders
      const { container } = renderHelpModal({ isOpen: true });
      
      const modal = container.querySelector('.fixed');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Modal Content Structure', () => {
    it('should render modal with heading title for accessibility', () => {
      // Verify that the modal has an h2 heading element for semantic HTML structure
      renderHelpModal({ isOpen: true, pageKey: 'adminDashboard' });
      
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toBeInTheDocument();
    });

    it('should render modal with semi-transparent backdrop overlay', () => {
      // Verify that the modal has a dark semi-transparent backdrop (black with 50% opacity)
      const { container } = renderHelpModal({ isOpen: true });
      
      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      expect(backdrop).toBeInTheDocument();
    });

    it('should render modal content section with proper spacing', () => {
      // Verify that the modal content area with margin-top class exists for layout spacing
      const { container } = renderHelpModal({ isOpen: true });
      
      const contentDiv = container.querySelector('.mt-4');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Styling and Theme Support', () => {
    it('should apply dark mode classes for dark theme compatibility', () => {
      // Verify that the modal has Tailwind dark mode classes for theme switching
      const { container } = renderHelpModal({ isOpen: true });
      
      const modal = container.querySelector('.bg-white');
      expect(modal).toHaveClass('dark:bg-gray-800', 'dark:text-white');
    });

    it('should apply responsive width classes for mobile and desktop', () => {
      // Verify that the modal has responsive width classes (400px max, full width max)
      const { container } = renderHelpModal({ isOpen: true });
      
      const modal = container.querySelector('.w-\\[400px\\]');
      expect(modal).toHaveClass('w-[400px]', 'max-w-full');
    });
  });

  describe('Dynamic Content Based on PageKey', () => {
    it('should render with different page keys without errors', () => {
      // Verify that the HelpModal can render for different pages (loginPage, adminDashboard, etc)
      const { rerender } = render(
        <I18nextProvider i18n={i18n}>
          <HelpModal isOpen={true} onClose={vi.fn()} pageKey="loginPage" />
        </I18nextProvider>
      );
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();

      // Verify it can re-render with a different pageKey
      rerender(
        <I18nextProvider i18n={i18n}>
          <HelpModal isOpen={true} onClose={vi.fn()} pageKey="userDashboard" />
        </I18nextProvider>
      );

      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});
