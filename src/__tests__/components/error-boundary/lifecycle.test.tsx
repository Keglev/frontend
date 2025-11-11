/**
 * @file lifecycle.test.tsx
 * @description Lifecycle and event listener tests for ErrorBoundary component
 * @component Tests for event listener registration, cleanup, and component lifecycle
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ErrorBoundary from '../../../components/ErrorBoundary';

const originalError = console.error;

describe('ErrorBoundary Component - Lifecycle', () => {
  beforeEach(() => {
    // Mock console.error to prevent error logging during tests
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore original console.error after tests
    console.error = originalError;
  });

  describe('Event Listeners', () => {
    it('should register window error listener on component mount', () => {
      // Verify that ErrorBoundary subscribes to global window 'error' events to catch uncaught errors
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const errorListenerCalls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'error'
      );
      // Verify at least one error listener was registered
      expect(errorListenerCalls.length).toBeGreaterThanOrEqual(1);

      addEventListenerSpy.mockRestore();
    });

    it('should register unhandledrejection listener on component mount', () => {
      // Verify that ErrorBoundary subscribes to 'unhandledrejection' events to catch promise rejection errors
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      const rejectionListenerCalls = addEventListenerSpy.mock.calls.filter(
        call => call[0] === 'unhandledrejection'
      );
      // Verify at least one rejection listener was registered
      expect(rejectionListenerCalls.length).toBeGreaterThanOrEqual(1);

      addEventListenerSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on component unmount', () => {
      // Verify that ErrorBoundary properly cleans up event listeners when component is removed from DOM
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      unmount();

      // Verify that removeEventListener was called to clean up event handlers
      expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThanOrEqual(1);

      removeEventListenerSpy.mockRestore();
    });

    it('should handle cleanup gracefully even with no active listeners', () => {
      // Verify that unmount operation doesn't throw errors even if no listeners were registered
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
    it('should maintain error boundary state and stability through re-renders', () => {
      // Verify that when props change, ErrorBoundary re-renders children without losing its state
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

      // Verify that new children are rendered after prop update
      expect(getByText('Updated')).toBeInTheDocument();
    });

    it('should handle component updates with different children gracefully', () => {
      // Verify that ErrorBoundary can swap out its children via key or new content
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

      // Verify that new content is rendered after update
      expect(getByText('Content B')).toBeInTheDocument();
    });
  });

  describe('Global Error Handling Integration', () => {
    it('should be prepared to handle global window errors', () => {
      // Verify that ErrorBoundary sets up global error handling capabilities on mount
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(
        <ErrorBoundary>
          <div>Content</div>
        </ErrorBoundary>
      );

      // Verify listeners were registered for global error handling
      expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(0);

      addEventListenerSpy.mockRestore();
    });
  });
});
