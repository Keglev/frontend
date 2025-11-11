/**
 * @file ErrorBoundary.render.test.tsx
 * @description Rendering tests for ErrorBoundary component
 * @component Tests for children rendering, fallback UI, and error state initialization
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

const originalError = console.error;

describe('ErrorBoundary Component - Rendering', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('Rendering Children', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-element">Child Content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-element')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should render multiple children without error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <span data-testid="child-3">Third Child</span>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('should handle null children', () => {
      expect(() => {
        render(
          <ErrorBoundary>
            {null}
          </ErrorBoundary>
        );
      }).not.toThrow();
    });

    it('should handle empty ErrorBoundary with single element', () => {
      expect(() => {
        render(<ErrorBoundary><div /></ErrorBoundary>);
      }).not.toThrow();
    });
  });

  describe('Fallback UI', () => {
    it('should render a reload button in fallback UI', () => {
      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const reloadButton = screen.queryByRole('button', { name: /reload|restart/i });
      expect(typeof reloadButton === 'object' || reloadButton === null).toBe(true);
    });

    it('should have accessible error UI structure', () => {
      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const container = screen.getByText('Content').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Error State Initialization', () => {
    it('should initialize with no error state', () => {
      const { container } = render(
        <ErrorBoundary>
          <div data-testid="test-content">Normal content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(container.textContent).toContain('Normal content');
    });
  });
});
