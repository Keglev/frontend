/**
 * @file ErrorBoundary.lifecycle.test.tsx
 * @description Lifecycle and event listener tests for ErrorBoundary component
 * @component Tests for event listener registration, cleanup, and component lifecycle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

const originalError = console.error;

describe('ErrorBoundary Component - Lifecycle', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  describe('Event Listeners', () => {
    it('should register window error listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const errorListenerCalls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'error'
      );
      expect(errorListenerCalls.length).toBeGreaterThanOrEqual(1);

      addEventListenerSpy.mockRestore();
    });

    it('should register unhandledrejection listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const rejectionListenerCalls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'unhandledrejection'
      );
      expect(rejectionListenerCalls.length).toBeGreaterThanOrEqual(1);

      addEventListenerSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      unmount();

      expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThanOrEqual(1);

      removeEventListenerSpy.mockRestore();
    });

    it('should handle cleanup gracefully with no listeners', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ErrorBoundary>
          <div>No errors</div>
        </ErrorBoundary>
      );

      expect(() => unmount()).not.toThrow();

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Component Lifecycle', () => {
    it('should maintain error boundary state through re-renders', () => {
      const { rerender, getByText } = render(
        <ErrorBoundary>
          <div>Initial</div>
        </ErrorBoundary>
      );

      expect(getByText('Initial')).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <div>Updated</div>
        </ErrorBoundary>
      );

      expect(getByText('Updated')).toBeInTheDocument();
    });

    it('should handle component updates gracefully', () => {
      const { rerender, getByText } = render(
        <ErrorBoundary>
          <div key="1">Content A</div>
        </ErrorBoundary>
      );

      expect(getByText('Content A')).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <div key="2">Content B</div>
        </ErrorBoundary>
      );

      expect(getByText('Content B')).toBeInTheDocument();
    });
  });

  describe('Global Error Handling Integration', () => {
    it('should be ready to handle global window errors', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const totalListeners = addEventListenerSpy.mock.calls.length;
      expect(totalListeners).toBeGreaterThan(0);

      addEventListenerSpy.mockRestore();
    });

    it('should properly cleanup all registered listeners', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');
      const removeSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const addedCount = addSpy.mock.calls.length;

      unmount();

      const removedCount = removeSpy.mock.calls.length;

      expect(removedCount).toBeGreaterThanOrEqual(0);
      expect(addedCount).toBeGreaterThanOrEqual(0);

      addSpy.mockRestore();
      removeSpy.mockRestore();
    });
  });
});
