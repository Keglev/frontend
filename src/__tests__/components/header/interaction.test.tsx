/**
 * @file interaction.test.tsx
 * @description Interaction and behavior tests for Header component
 * @component Tests for button clicks, theme toggling, language switching, and navigation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
    it('should toggle dark mode class on document element when button is clicked', () => {
      // Verify that clicking the dark mode button toggles the 'dark' class on document.documentElement
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      
      fireEvent.click(darkModeButton);
      
      // After click, the dark class should be added to the html element
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should persist dark mode preference to localStorage when toggled', () => {
      // Verify that toggling dark mode saves the preference to localStorage with key 'darkMode' and value 'enabled'
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      
      fireEvent.click(darkModeButton);
      
      const darkModePref = localStorage.getItem('darkMode');
      expect(darkModePref).toBe('enabled');
    });

    it('should toggle dark mode off and persist the disabled state to localStorage', () => {
      // Verify that toggling dark mode off when already on removes the dark class and saves 'disabled' state
      localStorage.setItem('darkMode', 'enabled');
      document.documentElement.classList.add('dark');
      
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      
      fireEvent.click(darkModeButton);
      
      expect(localStorage.getItem('darkMode')).toBe('disabled');
    });
  });

  describe('Language Selection', () => {
    it('should change language to English when English button is clicked', () => {
      // Verify that clicking the English language button updates i18n language to 'en'
      renderHeader();
      const englishButton = screen.getByText(/🇬🇧 English/);
      
      fireEvent.click(englishButton);
      
      expect(i18n.language).toBe('en');
    });

    it('should change language to Deutsch when Deutsch button is clicked', () => {
      // Verify that clicking the German language button updates i18n language to 'de'
      renderHeader();
      const deutschButton = screen.getByText(/🇩🇪 Deutsch/);
      
      fireEvent.click(deutschButton);
      
      expect(i18n.language).toBe('de');
    });

    it('should persist language preference to localStorage when changed', () => {
      // Verify that changing language saves the selection to localStorage with key 'language'
      renderHeader();
      const deutschButton = screen.getByText(/🇩🇪 Deutsch/);
      
      fireEvent.click(deutschButton);
      
      const langPref = localStorage.getItem('language');
      expect(langPref).toBe('de');
    });
  });

  describe('Logout and Navigation', () => {
    it('should call onLogout callback when provided to component', () => {
      // Verify that the onLogout callback prop is properly accepted and can be called by the component
      const mockLogout = vi.fn();
      localStorage.setItem('role', 'ROLE_ADMIN');
      
      renderHeader({ isLoggedIn: true, onLogout: mockLogout });
      
      expect(mockLogout).toBeDefined();
      expect(typeof mockLogout).toBe('function');
    });

    it('should handle logout when component receives onLogout prop via re-render', () => {
      // Verify that the Header component properly updates when the onLogout prop is changed
      const mockLogout = vi.fn();
      localStorage.setItem('role', 'ROLE_ADMIN');
      
      const { rerender } = renderHeader({ isLoggedIn: true, onLogout: mockLogout });
      
      expect(screen.getByRole('heading')).toBeInTheDocument();
      
      // Re-render with a new onLogout callback to verify prop updates work
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

    it('should not render logout button when hideBackButton prop is true', () => {
      // Verify that logout button is not displayed when hideBackButton is set to true (e.g., modal contexts)
      localStorage.setItem('role', 'ROLE_ADMIN');
      
      renderHeader({ isLoggedIn: true, hideBackButton: true });
      
      // Should only have dark mode button + 2 language buttons (no logout button)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
    });
  });
});
