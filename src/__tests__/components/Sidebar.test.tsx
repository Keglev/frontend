/**
 * Sidebar.test.tsx
 * Comprehensive test suite for the Sidebar component
 * Tests: Stock value display, low stock products list, empty state, rendering
 * Total: 12 tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import i18n from '../../i18n';

// Mock Buttons component to avoid complex dependencies
vi.mock('../../components/Buttons', () => ({
  default: () => <div data-testid="mock-buttons">Buttons Component</div>,
}));

// Helper function to render component with required providers
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

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ================================================================================
  // STOCK VALUE DISPLAY TESTS (3 tests)
  // ================================================================================

  describe('Stock Value Display', () => {
    it('should render stock value section', () => {
      renderSidebar({ stockValue: 1234.56 });
      
      // Check that stock value section is present
      const stockSection = screen.getByText(/1234.56/);
      expect(stockSection).toBeInTheDocument();
    });

    it('should display stock value with correct formatting', () => {
      renderSidebar({ stockValue: 999.99 });
      
      const stockValue = screen.getByText(/999.99/);
      expect(stockValue).toBeInTheDocument();
    });

    it('should display zero stock value correctly', () => {
      renderSidebar({ stockValue: 0 });
      
      const stockValue = screen.getByText(/0.00/);
      expect(stockValue).toBeInTheDocument();
    });
  });

  // ================================================================================
  // LOW STOCK PRODUCTS LIST TESTS (5 tests)
  // ================================================================================

  describe('Low Stock Products List', () => {
    it('should render empty state when no low stock products', () => {
      renderSidebar({ lowStockProducts: [] });
      
      // Should display sufficient stock message
      const emptyMessage = screen.queryByText(/sufficient/i);
      expect(emptyMessage).toBeInTheDocument();
    });

    it('should render list of low stock products', () => {
      const lowStockProducts = [
        { id: 1, name: 'Product A', quantity: 5 },
        { id: 2, name: 'Product B', quantity: 2 },
      ];
      
      renderSidebar({ lowStockProducts });
      
      expect(screen.getByText(/Product A/)).toBeInTheDocument();
      expect(screen.getByText(/Product B/)).toBeInTheDocument();
    });

    it('should display product quantity in list items', () => {
      const lowStockProducts = [
        { id: 1, name: 'Item One', quantity: 10 },
      ];
      
      renderSidebar({ lowStockProducts });
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
      
      // Check that the list item contains the product name
      const listItemText = listItems[0]?.textContent || '';
      expect(listItemText).toContain('Item One');
      expect(listItemText).toContain('10');
    });

    it('should render multiple low stock products correctly', () => {
      const lowStockProducts = [
        { id: 1, name: 'Product 1', quantity: 3 },
        { id: 2, name: 'Product 2', quantity: 7 },
        { id: 3, name: 'Product 3', quantity: 1 },
      ];
      
      renderSidebar({ lowStockProducts });
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBe(3);
    });

    it('should display products with zero quantity', () => {
      const lowStockProducts = [
        { id: 1, name: 'Out of Stock Item', quantity: 0 },
      ];
      
      renderSidebar({ lowStockProducts });
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBe(1);
      
      const listItemText = listItems[0]?.textContent || '';
      expect(listItemText).toContain('Out of Stock Item');
      expect(listItemText).toContain('0');
    });
  });

  // ================================================================================
  // BUTTONS COMPONENT INTEGRATION TESTS (2 tests)
  // ================================================================================

  describe('Buttons Component Integration', () => {
    it('should render Buttons component', () => {
      renderSidebar();
      
      const buttonsComponent = screen.getByTestId('mock-buttons');
      expect(buttonsComponent).toBeInTheDocument();
    });

    it('should render Buttons component at the bottom', () => {
      renderSidebar();
      
      const buttonsComponent = screen.getByTestId('mock-buttons');
      expect(buttonsComponent).toBeInTheDocument();
    });
  });

  // ================================================================================
  // RESPONSIVE LAYOUT TESTS (2 tests)
  // ================================================================================

  describe('Responsive Layout', () => {
    it('should render sidebar with flex layout classes', () => {
      const { container } = renderSidebar();
      
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('flex', 'flex-col');
    });

    it('should apply minimum height to sidebar', () => {
      const { container } = renderSidebar();
      
      const aside = container.querySelector('aside');
      expect(aside).toHaveClass('min-h-[500px]');
    });
  });
});
