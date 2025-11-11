/**
 * @file ErrorBoundary.edge-cases.test.tsx
 * @description Edge case and error handling tests for ErrorBoundary component
 * @component Tests for error scenarios, edge cases, and special conditions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

const originalError = console.error;

describe('ErrorBoundary Component - Edge Cases', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('Edge Cases', () => {
    it('should handle rapid re-renders without errors', () => {
      const { rerender, getByText } = render(
        <ErrorBoundary>
          <div>Content 1</div>
        </ErrorBoundary>
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <ErrorBoundary>
            <div>Content {i}</div>
          </ErrorBoundary>
        );
      }

      expect(getByText(/Content/)).toBeInTheDocument();
    });

    it('should handle nested ErrorBoundaries', () => {
      render(
        <ErrorBoundary>
          <div>Outer</div>
          <ErrorBoundary>
            <div>Inner</div>
          </ErrorBoundary>
        </ErrorBoundary>
      );

      expect(screen.getByText('Outer')).toBeInTheDocument();
      expect(screen.getByText('Inner')).toBeInTheDocument();
    });
  });
});
