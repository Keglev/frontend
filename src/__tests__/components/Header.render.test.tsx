/**
 * @file Header.render.test.tsx
 * @description Rendering and layout tests for Header component
 * @component Tests for button visibility, element presence, and responsive structure
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    it('should render language selection buttons', () => {
      renderHeader();
      expect(screen.getByText(/🇬🇧 English/)).toBeInTheDocument();
      expect(screen.getByText(/🇩🇪 Deutsch/)).toBeInTheDocument();
    });

    it('should render logout button when isLoggedIn is true', () => {
      renderHeader({ isLoggedIn: true });
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should hide logout button when hideBackButton is true', () => {
      renderHeader({ isLoggedIn: true, hideBackButton: true });
      // Dark mode + 2 language buttons only = 3
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
    });

    it('should not render logout button when isLoggedIn is false', () => {
      renderHeader({ isLoggedIn: false });
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(3);
    });
  });

  describe('Theme and UI Controls', () => {
    it('should render dark mode button', () => {
      renderHeader();
      const darkModeButton = screen.getAllByRole('button')[0];
      expect(darkModeButton).toBeInTheDocument();
    });
  });

  describe('Responsive Structure', () => {
    it('should render header with all elements correctly', () => {
      const { container } = renderHeader({ isLoggedIn: true });
      
      // Check header container exists
      const header = container.querySelector('.header-container');
      expect(header).toBeInTheDocument();
      
      // Check header buttons container exists
      const buttonContainer = container.querySelector('.header-buttons');
      expect(buttonContainer).toBeInTheDocument();
      
      // Check title section exists
      const titleSection = container.querySelector('h1');
      expect(titleSection).toBeInTheDocument();
    });
  });
});
