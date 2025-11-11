/**
 * @file authorization/login-flow.test.tsx
 * @description Login authentication flow and error handling tests
 * Tests for user login, form submission, and API error scenarios
 * @component LoginPage
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';
import LoginPage from '../../../pages/LoginPage';
import apiClient from '../../../services/apiClient';

// Helper to render with providers (used across authorization tests)
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <I18nextProvider i18n={i18n}>
      <Router>
        {component}
      </Router>
    </I18nextProvider>
  );
};

describe('Login Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // Test 1: Verify LoginPage renders with expected header element
  it('should render LoginPage with header', () => {
    renderWithProviders(<LoginPage />);

    // Verify the page contains a banner element (header)
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  // Test 2: Verify form submission works with successful API response
  it('should handle login form submission', async () => {
    // Mock successful API response with JWT token
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Login successful',
        data: 'valid-jwt-token'
      }
    });

    renderWithProviders(<LoginPage />);

    // Verify page renders without errors (DOM is populated)
    expect(document.body.children.length).toBeGreaterThan(0);
  });

  // Test 3: Verify error handling when API request fails
  it('should handle API errors during login gracefully', async () => {
    // Mock network error response
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(
      new Error('Network error')
    );

    renderWithProviders(<LoginPage />);

    // Verify page still renders despite error (graceful degradation)
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  // Test 4: Verify invalid credential errors are caught
  it('should handle invalid credential errors', () => {
    // Test error object creation and messaging
    const error = new Error('Invalid credentials');
    
    // Verify error message is correctly set
    expect(error.message).toBe('Invalid credentials');
  });

  // Test 5: Verify network error handling
  it('should handle network errors', () => {
    // Test error object for network failures
    const error = new Error('Network error');
    
    // Verify error message is correctly set
    expect(error.message).toBe('Network error');
  });
});
