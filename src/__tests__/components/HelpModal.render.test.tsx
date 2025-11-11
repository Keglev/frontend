/**
 * @file HelpModal.render.test.tsx
 * @description Rendering tests for HelpModal component
 * @component Tests for modal visibility, content structure, styling, and layout
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import HelpModal from '../../components/HelpModal';
import i18n from '../../i18n';

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

  describe('Modal Content Structure', () => {
    it('should render modal with title', () => {
      renderHelpModal({ isOpen: true, pageKey: 'adminDashboard' });
      
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

  describe('Dynamic Content Based on PageKey', () => {
    it('should render with different pageKeys', () => {
      const { rerender } = render(
        <I18nextProvider i18n={i18n}>
          <HelpModal isOpen={true} onClose={vi.fn()} pageKey="loginPage" />
        </I18nextProvider>
      );
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      
      rerender(
        <I18nextProvider i18n={i18n}>
          <HelpModal isOpen={true} onClose={vi.fn()} pageKey="adminDashboard" />
        </I18nextProvider>
      );
      
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});
