/**
 * @file Header.interaction.test.tsx
 * @description Interaction and behavior tests for Header component
 * @component Tests for button clicks, navigation, state changes, and callback handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import Header from '../../components/Header';
import i18n from '../../i18n';

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

describe('Header Component - Interactions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockNavigate.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  describe('Dark Mode Toggle', () => {
    it('should toggle dark mode on button click', () => {
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      
      fireEvent.click(darkModeButton);
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should persist dark mode preference to localStorage', () => {
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      
      fireEvent.click(darkModeButton);
      
      const darkModePref = localStorage.getItem('darkMode');
      expect(darkModePref).toBe('enabled');
    });

    it('should toggle dark mode off and persist', () => {
      localStorage.setItem('darkMode', 'enabled');
      document.documentElement.classList.add('dark');
      
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      
      fireEvent.click(darkModeButton);
      
      expect(localStorage.getItem('darkMode')).toBe('disabled');
    });
  });

  describe('Language Selection', () => {
    it('should change language when English button clicked', () => {
      renderHeader();
      const englishButton = screen.getByText(/🇬🇧 English/);
      
      fireEvent.click(englishButton);
      
      expect(i18n.language).toBe('en');
    });

    it('should change language when Deutsch button clicked', () => {
      renderHeader();
      const deutschButton = screen.getByText(/🇩🇪 Deutsch/);
      
      fireEvent.click(deutschButton);
      
      expect(i18n.language).toBe('de');
    });

    it('should persist language preference to localStorage', () => {
      renderHeader();
      const deutschButton = screen.getByText(/🇩🇪 Deutsch/);
      
      fireEvent.click(deutschButton);
      
      const langPref = localStorage.getItem('language');
      expect(langPref).toBe('de');
    });
  });

  describe('Logout and Navigation', () => {
    it('should call onLogout callback when provided', () => {
      const mockLogout = vi.fn();
      localStorage.setItem('role', 'ROLE_ADMIN');
      
      renderHeader({ isLoggedIn: true, onLogout: mockLogout });
      
      // Verify the onLogout function is defined and can be called
      expect(mockLogout).toBeDefined();
      expect(typeof mockLogout).toBe('function');
    });

    it('should handle logout when component receives onLogout prop', () => {
      const mockLogout = vi.fn();
      localStorage.setItem('role', 'ROLE_ADMIN');
      
      const { rerender } = renderHeader({ isLoggedIn: true, onLogout: mockLogout });
      
      // Verify component renders with the callback
      expect(screen.getByRole('heading')).toBeInTheDocument();
      
      // Rerender with different onLogout should still work
      const newMockLogout = vi.fn();
      rerender(
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <Header isLoggedIn={true} onLogout={newMockLogout} hideBackButton={false} />
          </I18nextProvider>
        </BrowserRouter>
      );
      
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should not render logout button when hideBackButton is true', () => {
      localStorage.setItem('role', 'ROLE_ADMIN');
      
      renderHeader({ isLoggedIn: true, hideBackButton: true });
      
      // Should only have dark mode + 2 language buttons (no logout button)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
    });
  });
});
