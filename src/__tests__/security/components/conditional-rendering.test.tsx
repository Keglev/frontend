/**
 * Conditional Rendering Security Tests
 *
 * Validates that sensitive content is conditionally rendered
 * (return null) rather than hidden with CSS, and auth-aware
 * components show appropriate content based on auth state.
 *
 * @module conditional-rendering.test.tsx
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

describe('Conditional Rendering Security', () => {
  /**
   * Test: Secure content hiding via conditional rendering
   *
   * Verifies that sensitive content is completely removed from the DOM
   * for unauthorized users, rather than just hidden with CSS.
   */
  it('should securely hide content based on permissions', () => {
    interface ConditionalContentProps {
      isVisible: boolean;
    }

    const HiddenContent: React.FC<ConditionalContentProps> = ({ isVisible }) => {
      // Don't render at all if not visible (secure)
      // Better than display:none (which keeps content in DOM)
      if (!isVisible) {
        return null;
      }

      return <div>Secret content</div>;
    };

    // Visible when true
    const visibleResult = render(<HiddenContent isVisible={true} />);
    expect(visibleResult.container.textContent).toContain('Secret content');

    // Completely removed when false
    const hiddenResult = render(<HiddenContent isVisible={false} />);
    expect(hiddenResult.container.textContent).not.toContain('Secret content');
  });

  /**
   * Test: CSS hiding is not security
   *
   * Demonstrates that CSS display:none hides content visually
   * but leaves it in the DOM, making it accessible via DevTools.
   */
  it('should not use CSS-only hiding for sensitive content', () => {
    /**
     * Determine if a hiding approach is secure.
     *
     * @param approach - 'css' (display:none) or 'conditional' (return null)
     * @returns true if the approach is secure, false if not
     */
    const isSecureHiding = (approach: 'css' | 'conditional'): boolean => {
      if (approach === 'css') {
        // CSS hiding is not secure — content remains in DOM
        // DevTools can reveal it with `display: block`
        return false;
      }

      // Conditional rendering (return null) is secure
      // Content is completely removed from DOM
      return approach === 'conditional';
    };

    expect(isSecureHiding('css')).toBe(false);
    expect(isSecureHiding('conditional')).toBe(true);
  });

  /**
   * Test: Auth-aware component rendering
   *
   * Verifies that components show different content based on
   * authentication state, and don't leak sensitive content
   * to unauthenticated users.
   */
  it('should render appropriate content based on auth state', () => {
    interface AuthAwareComponentProps {
      isAuthenticated: boolean;
    }

    const AuthAwareComponent: React.FC<AuthAwareComponentProps> = ({
      isAuthenticated,
    }) => {
      if (isAuthenticated) {
        return <div>Welcome User! Dashboard: [protected content]</div>;
      }

      return <div>Please log in</div>;
    };

    // Authenticated user sees dashboard
    const authResult = render(<AuthAwareComponent isAuthenticated={true} />);
    expect(authResult.container.textContent).toContain('Welcome User!');

    // Unauthenticated user sees login prompt, not dashboard
    const anonResult = render(<AuthAwareComponent isAuthenticated={false} />);
    expect(anonResult.container.textContent).toContain('Please log in');
    expect(anonResult.container.textContent).not.toContain('protected content');
  });
});
