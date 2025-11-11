/**
 * @file render.test.tsx
 * @description Rendering tests for Sidebar component
 * @component Tests for stock value display, low stock product list rendering, and layout
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import Sidebar from '../../../components/Sidebar';
import i18n from '../../../i18n';

// Mock the Buttons component since we're testing Sidebar in isolation
vi.mock('../../../components/Buttons', () => ({
  default: () => <div data-testid="mock-buttons">Buttons Component</div>,
}));

const renderSidebar = (props = {}) => {
  const defaultProps = {
    stockValue: 1000,
    lowStockProducts: [],
    ...props,
  };

  return render(
    <I18nextProvider i18n={i18n}>
      <Sidebar {...defaultProps} />
    </I18nextProvider>
  );
};

describe('Sidebar Component - Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Stock Value Display', () => {
    it('should render total stock value section with correct number', () => {
      // Verify that the Sidebar displays the total stock value passed via props
      renderSidebar({ stockValue: 1234.56 });
      
      const stockSection = screen.getByText(/1234.56/);
      expect(stockSection).toBeInTheDocument();
    });

    it('should display stock value with correct decimal formatting', () => {
      // Verify that stock value appears in the DOM with proper formatting (2 decimal places)
      renderSidebar({ stockValue: 999.99 });
      
      const stockValue = screen.getByText(/999.99/);
      expect(stockValue).toBeInTheDocument();
    });

    it('should display zero stock value correctly', () => {
      // Verify that zero stock value is formatted and displayed properly (0.00)
      renderSidebar({ stockValue: 0 });
      
      const stockValue = screen.getByText(/0.00/);
      expect(stockValue).toBeInTheDocument();
    });
  });

  describe('Low Stock Products List', () => {
    it('should render empty state message when no low stock products exist', () => {
      // Verify that when lowStockProducts array is empty, a "no items" or "sufficient" message appears
      renderSidebar({ lowStockProducts: [] });
      
      const emptyMessage = screen.queryByText(/sufficient/i);
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should render list of low stock products with their names', () => {
      // Verify that each low stock product in the array appears as list items in the DOM
      const lowStockProducts = [
        { id: 1, name: 'Product A', quantity: 5 },
        { id: 2, name: 'Product B', quantity: 2 },
      ];
      
      renderSidebar({ lowStockProducts });
      
      expect(screen.getByText(/Product A/)).toBeInTheDocument();
      expect(screen.getByText(/Product B/)).toBeInTheDocument();
    });

    it('should render correct number of low stock product list items', () => {
      // Verify that exactly the right number of products appear (no duplicates or missing items)
      const lowStockProducts = [
        { id: 1, name: 'Product 1', quantity: 3 },
        { id: 2, name: 'Product 2', quantity: 1 },
        { id: 3, name: 'Product 3', quantity: 0 },
      ];
      
      renderSidebar({ lowStockProducts });
      
      expect(screen.getByText(/Product 1/)).toBeInTheDocument();
      expect(screen.getByText(/Product 2/)).toBeInTheDocument();
      expect(screen.getByText(/Product 3/)).toBeInTheDocument();
    });
  });
});
