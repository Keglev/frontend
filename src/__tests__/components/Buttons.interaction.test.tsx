/**
 * @file Buttons.interaction.test.tsx
 * @description Navigation and click interaction tests for Buttons component
 * @component Tests for button clicks, route navigation, and user interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('Buttons Component - Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Button Navigation', () => {
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

  describe('Common Button Navigation', () => {
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

  describe('Multiple Clicks and Edge Cases', () => {
    it('should handle multiple button clicks without issues', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons />);

      await user.click(screen.getByText('Search Product'));
      expect(mockNavigate).toHaveBeenCalledWith('/search-product');

      await user.click(screen.getByText('List Stock'));
      expect(mockNavigate).toHaveBeenCalledWith('/list-stock');

      expect(mockNavigate).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid consecutive clicks', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Buttons />);
      const button = screen.getByText('Search Product');

      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/search-product');
    });
  });
});
