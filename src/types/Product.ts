// src/types/Product.ts

/**
 * Interface representing a Product entity.
 * This defines the structure of a product object used across the application.
 */
export interface Product {
  /**
   * Unique identifier for the product.
   */
  id: number;

  /**
   * Name of the product.
   */
  name: string;

  /**
   * Available quantity of the product in stock.
   */
  quantity: number;

  /**
   * Price per unit of the product.
   */
  price: number;

  /**
   * Total value of the product stock (calculated as quantity * price).
   */
  totalValue: number;
}

  