/**
 * @fileoverview Buttons Component Test Suite
 * Tests navigation buttons for product management in the admin dashboard
 * 
 * Enterprise-grade test coverage:
 * - Component rendering with/without admin buttons
 * - Navigation routing on button clicks
 * - Translation labels
 * - Accessibility and styling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Buttons from '../../components/Buttons';

/**
 * Mock useNavigate from react-router-dom
 */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/**
 * Mock react-i18next for translation
 */
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

/**
 * Helper function to render component with Router
 */
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Buttons Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
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

  describe('Navigation - Admin Buttons', () => {
    it('should navigate to /add-product when Add Product button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons hideAdminButtons={false} />);

      const addButton = screen.getByText('Add Product');
      await user.click(addButton);

      expect(mockNavigate).toHaveBeenCalledWith('/add-product');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to /delete-product when Delete Product button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons hideAdminButtons={false} />);

      const deleteButton = screen.getByText('Delete Product');
      await user.click(deleteButton);

      expect(mockNavigate).toHaveBeenCalledWith('/delete-product');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation - Common Buttons', () => {
    it('should navigate to /search-product when Search Product button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons />);

      const searchButton = screen.getByText('Search Product');
      await user.click(searchButton);

      expect(mockNavigate).toHaveBeenCalledWith('/search-product');
    });

    it('should navigate to /list-stock when List Stock button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons />);

      const listButton = screen.getByText('List Stock');
      await user.click(listButton);

      expect(mockNavigate).toHaveBeenCalledWith('/list-stock');
    });
  });

  describe('Multiple Clicks', () => {
    it('should handle multiple button clicks without issues', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons />);

      await user.click(screen.getByText('Search Product'));
      expect(mockNavigate).toHaveBeenCalledWith('/search-product');

      await user.click(screen.getByText('List Stock'));
      expect(mockNavigate).toHaveBeenCalledWith('/list-stock');

      expect(mockNavigate).toHaveBeenCalledTimes(2);
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

  describe('Styling', () => {
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

  describe('Props Behavior', () => {
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
  });

  describe('Edge Cases', () => {
    it('should render with hideAdminButtons explicitly set to false', () => {
      renderWithRouter(<Buttons hideAdminButtons={false} />);

      expect(screen.getByText('Add Product')).toBeInTheDocument();
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
    });

    it('should handle rapid consecutive clicks', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons />);

      const button = screen.getByText('Search Product');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/search-product');
    });
  });
});
