/**
 * @file error-handling.test.tsx
 * @description Edge case and error handling tests for ErrorBoundary component
 * @component Tests for error scenarios, edge cases, and special conditions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../../components/ErrorBoundary';

const originalError = console.error;

describe('ErrorBoundary Component - Error Handling', () => {
  beforeEach(() => {
    // Mock console.error to suppress error output during edge case tests
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore original console.error after tests
    console.error = originalError;
  });

  describe('Edge Cases', () => {
    it('should handle rapid re-renders without losing error boundary stability', () => {
      // Verify that ErrorBoundary can handle rapid successive re-renders and updates without crashing
      const { rerender, getByText } = render(
        <ErrorBoundary>
          <div>Content 1</div>
        </ErrorBoundary>
      );

      // Simulate 5 rapid re-renders with different content
      for (let i = 0; i < 5; i++) {
        rerender(
          <ErrorBoundary>
            <div>Content {i}</div>
          </ErrorBoundary>
        );
      }

      // Verify that some content is still in the DOM after rapid updates
      expect(getByText(/Content/)).toBeInTheDocument();
    });

    it('should handle nested ErrorBoundaries without conflicts', () => {
      // Verify that multiple ErrorBoundary instances can be nested and work together
      render(
        <ErrorBoundary>
          <div>Outer</div>
          <ErrorBoundary>
            <div>Inner</div>
          </ErrorBoundary>
        </ErrorBoundary>
      );

      // Verify that both outer and inner content render successfully
      expect(screen.getByText('Outer')).toBeInTheDocument();
      expect(screen.getByText('Inner')).toBeInTheDocument();
    });

    it('should gracefully handle undefined children', () => {
      // Verify that ErrorBoundary can handle undefined children without throwing
      expect(() => {
        render(
          <ErrorBoundary>
            {undefined}
          </ErrorBoundary>
        );
      }).not.toThrow();
    });
  });
});
