/**
 * @file Product.ts
 * @description
 * Product entity interface and type definitions.
 *
 * @module
 */

/**
 * Product inventory item
 * @interface Product
 * @property {number} id - Unique product identifier
 * @property {string} name - Product name
 * @property {number} quantity - Available stock quantity
 * @property {number} price - Unit price
 * @property {number} totalValue - Total stock value (quantity × price)
 */
export interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
}