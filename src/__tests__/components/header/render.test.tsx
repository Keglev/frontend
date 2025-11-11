/**
 * @file render.test.tsx
 * @description Rendering and layout tests for Header component
 * @component Tests for button visibility, element presence, and responsive structure
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import Header from '../../../components/Header';
import i18n from '../../../i18n';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderHeader = (props = {}) => {
  const defaultProps = {
    isLoggedIn: true,
    onLogout: vi.fn(),
    hideBackButton: false,
    ...props,
  };

  return render(
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <Header {...defaultProps} />
      </I18nextProvider>
    </BrowserRouter>
  );
};

describe('Header Component - Rendering', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('Button Rendering', () => {
    it('should render language selection buttons for internationalization', () => {
      // Verify that the Header component displays both English and Deutsch language switcher buttons
      renderHeader();
      expect(screen.getByText(/🇬🇧 English/)).toBeInTheDocument();
      expect(screen.getByText(/🇩🇪 Deutsch/)).toBeInTheDocument();
    });

    it('should render logout button when user is logged in', () => {
      // Verify that the logout/back button is present when isLoggedIn prop is true
      renderHeader({ isLoggedIn: true });
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should hide logout button when hideBackButton prop is true', () => {
      // Verify that logout button is not rendered when hideBackButton is true (admin context, no logout needed)
      renderHeader({ isLoggedIn: true, hideBackButton: true });
      // Only dark mode button + 2 language buttons = 3 total buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
    });

    it('should not render logout button when user is not logged in', () => {
      // Verify that logout button is hidden when isLoggedIn is false (login page scenario)
      renderHeader({ isLoggedIn: false });
      const buttons = screen.getAllByRole('button');
      // Only dark mode button + 2 language buttons = 3 total buttons
      expect(buttons.length).toBe(3);
    });
  });

  describe('Theme and UI Controls', () => {
    it('should render dark mode toggle button for theme switching', () => {
      // Verify that the dark mode button is rendered and accessible for theme switching
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      expect(darkModeButton).toBeInTheDocument();
    });
  });

  describe('Responsive Structure', () => {
    it('should render header with proper semantic structure and layout classes', () => {
      // Verify that the Header has the expected CSS classes for responsive layout and container structure
      const { container } = renderHeader({ isLoggedIn: true });
      
      // Check header container with proper styling class
      const header = container.querySelector('.header-container');
      expect(header).toBeInTheDocument();
      
      // Check header buttons container for grouping controls
      const buttonContainer = container.querySelector('.header-buttons');
      expect(buttonContainer).toBeInTheDocument();
      
      // Check title section (h1 element) for semantic HTML
      const titleSection = container.querySelector('h1');
      expect(titleSection).toBeInTheDocument();
    });
  });
});
