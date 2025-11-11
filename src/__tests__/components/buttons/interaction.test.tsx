/**
 * @file interaction.test.tsx
 * @description Navigation and click interaction tests for Buttons component
 * @component Tests for button clicks, route navigation, and event handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Buttons from '../../../components/Buttons';

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
    mockNavigate.mockClear();
  });

  describe('Admin Button Navigation', () => {
    it('should navigate to /add-product when Add Product button is clicked', () => {
      // Verify that clicking the Add Product button navigates to the correct route
      renderWithRouter(<Buttons hideAdminButtons={false} />);
      const addButton = screen.getByText('Add Product');
      fireEvent.click(addButton);
      expect(mockNavigate).toHaveBeenCalledWith('/add-product');
    });

    it('should navigate to /delete-product when Delete Product button is clicked', () => {
      // Verify that clicking the Delete Product button navigates to the correct route
      renderWithRouter(<Buttons hideAdminButtons={false} />);
      const deleteButton = screen.getByText('Delete Product');
      fireEvent.click(deleteButton);
      expect(mockNavigate).toHaveBeenCalledWith('/delete-product');
    });
  });

  describe('Common Button Navigation', () => {
    it('should navigate to /search-product when Search Product button is clicked', () => {
      // Verify that clicking the Search Product button triggers navigation to search page
      renderWithRouter(<Buttons hideAdminButtons={true} />);
      const searchButton = screen.getByText('Search Product');
      fireEvent.click(searchButton);
      expect(mockNavigate).toHaveBeenCalledWith('/search-product');
    });

    it('should navigate to /list-stock when List Stock button is clicked', () => {
      // Verify that clicking the List Stock button triggers navigation to inventory page
      renderWithRouter(<Buttons hideAdminButtons={true} />);
      const listButton = screen.getByText('List Stock');
      fireEvent.click(listButton);
      expect(mockNavigate).toHaveBeenCalledWith('/list-stock');
    });
  });

  describe('Multiple Clicks and Edge Cases', () => {
    it('should handle multiple consecutive button clicks', () => {
      // Verify that multiple clicks on the same button trigger multiple navigation calls (no debouncing)
      renderWithRouter(<Buttons hideAdminButtons={false} />);
      const addButton = screen.getByText('Add Product');
      
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      fireEvent.click(addButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/add-product');
    });

    it('should handle rapid consecutive clicks on different buttons', () => {
      // Verify that rapid clicks on different buttons navigate to different routes in sequence
      renderWithRouter(<Buttons hideAdminButtons={false} />);
      const addButton = screen.getByText('Add Product');
      const deleteButton = screen.getByText('Delete Product');
      
      fireEvent.click(addButton);
      fireEvent.click(deleteButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/add-product');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/delete-product');
    });
  });
});
