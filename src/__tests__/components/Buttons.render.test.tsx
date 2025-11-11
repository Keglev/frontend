/**
 * @file Buttons.render.test.tsx
 * @description Rendering and styling tests for Buttons component
 * @component Tests for button visibility, CSS classes, and layout structure
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Buttons from '../../components/Buttons';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'buttons.addProduct': 'Add Product',
        'buttons.deleteProduct': 'Delete Product',
        'buttons.searchProduct': 'Search Product',
        'buttons.listStock': 'List Stock',
        'buttons.changeProduct': 'Change Product',
      };
      return translations[key] || key;
    },
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Buttons Component - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Button Visibility', () => {
    it('should render all buttons when hideAdminButtons is false', () => {
      renderWithRouter(<Buttons hideAdminButtons={false} />);
      expect(screen.getByText('Add Product')).toBeInTheDocument();
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
      expect(screen.getByText('Search Product')).toBeInTheDocument();
      expect(screen.getByText('List Stock')).toBeInTheDocument();
    });

    it('should render all buttons by default (hideAdminButtons defaults to false)', () => {
      renderWithRouter(<Buttons />);
      expect(screen.getByText('Add Product')).toBeInTheDocument();
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
    });

    it('should hide admin buttons when hideAdminButtons is true', () => {
      renderWithRouter(<Buttons hideAdminButtons={true} />);
      expect(screen.queryByText('Add Product')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Product')).not.toBeInTheDocument();
      expect(screen.getByText('Search Product')).toBeInTheDocument();
      expect(screen.getByText('List Stock')).toBeInTheDocument();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('should have correct CSS classes on buttons', () => {
      renderWithRouter(<Buttons hideAdminButtons={false} />);
      expect(screen.getByText('Add Product')).toHaveClass('button-add');
      expect(screen.getByText('Delete Product')).toHaveClass('button-delete');
      expect(screen.getByText('Search Product')).toHaveClass('button-search');
    });

    it('should have flex wrapper with gap', () => {
      const { container } = renderWithRouter(<Buttons />);
      const wrapper = container.querySelector('.flex');
      expect(wrapper).toHaveClass('flex', 'flex-wrap', 'gap-4');
    });
  });

  describe('Accessibility', () => {
    it('should have button elements with proper role', () => {
      renderWithRouter(<Buttons />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button).toHaveClass('dashboard-button');
      });
    });

    it('should have semantic button elements', () => {
      const { container } = renderWithRouter(<Buttons />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Props Behavior - Visibility', () => {
    it('should respect hideAdminButtons prop changes', () => {
      const { rerender } = renderWithRouter(<Buttons hideAdminButtons={false} />);
      expect(screen.getByText('Add Product')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <Buttons hideAdminButtons={true} />
        </BrowserRouter>
      );

      expect(screen.queryByText('Add Product')).not.toBeInTheDocument();
      expect(screen.getByText('Search Product')).toBeInTheDocument();
    });

    it('should render with hideAdminButtons explicitly set to false', () => {
      renderWithRouter(<Buttons hideAdminButtons={false} />);
      expect(screen.getByText('Add Product')).toBeInTheDocument();
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
    });
  });
});
