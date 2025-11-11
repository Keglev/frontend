/**
 * @file interaction.test.tsx
 * @description Interaction tests for HelpModal component
 * @component Tests for close button functionality and user interactions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('HelpModal Component - Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Close Button Functionality', () => {
    it('should render close button when modal is open', () => {
      // Verify that a close button is present and accessible when the modal is displayed
      renderHelpModal({ isOpen: true });
      
      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose callback when close button is clicked', () => {
      // Verify that clicking the close button triggers the onClose callback function
      const mockOnClose = vi.fn();
      renderHelpModal({ isOpen: true, onClose: mockOnClose });
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledOnce();
    });

    it('should handle multiple close button clicks correctly', () => {
      // Verify that the onClose callback can be called multiple times (no throttling/debouncing)
      const mockOnClose = vi.fn();
      renderHelpModal({ isOpen: true, onClose: mockOnClose });
      
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });
  });
});
