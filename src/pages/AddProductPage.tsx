/**
 * @file AddProductPage.tsx
 * @description
 * Admin interface for adding new products to the inventory.
 *
 * **Features:**
 * - Input fields for product name, quantity, and price
 * - Two-step confirmation (preview + confirmation)
 * - API integration for product creation
 * - Success/error messaging
 * - Help modal with guidance
 *
 * **Workflow:**
 * 1. Fill in product name, quantity, and price
 * 2. Click "Add" to confirm details
 * 3. Submit confirmation dialog
 * 4. API saves product or shows error
 *
 * @component
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';
import '../styles/addProduct.css';
import '../styles/tailwindCustom.css';

/**
 * Add product page component
 * @component
 * @returns {JSX.Element} Product creation form
 */
const AddProductPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * Reset form fields to initial state
   */
  const resetFields = () => {
    setName('');
    setQuantity('');
    setPrice('');
  };

  /**
   * Submit new product to API with type conversion
   * Convert string inputs to appropriate numeric types
   */
  const handleAddProduct = async () => {
    setMessage('');
    try {
      await ProductService.addProduct({
        name,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
      });
      setMessage(t('addProduct.successMessage'));
      resetFields();
    } catch (error) {
      setMessage(t('addProduct.errorMessage'));
      console.error(t('addProduct.errorLog'), error);
    }
    setConfirmation(false);
  };

  /**
   * Cancel operation and reset form state
   */
  const handleCancel = () => {
    resetFields();
    setMessage(t('addProduct.cancelMessage'));
    setConfirmation(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="button-secondary"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="addProduct" />

      <main className="flex flex-col items-center justify-center flex-grow">
        <div className="w-96 box-shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">{t('addProduct.detailsTitle')}</h2>

          <div className="mb-4">
            <label htmlFor="name" className="block font-medium mb-2">
              {t('addProduct.nameLabel')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="quantity" className="block font-medium mb-2">
              {t('addProduct.quantityLabel')}
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block font-medium mb-2">
              {t('addProduct.priceLabel')}
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex justify-between mt-6">
            <button className="button-confirmation-no" onClick={handleCancel}>
              {t('addProduct.cancelButton')}
            </button>
            <button
              className="button-confirmation-yes"
              onClick={() => setConfirmation(true)}
            >
              {t('addProduct.addButton')}
            </button>
          </div>

          {confirmation && (
            <div className="confirmation-box mt-4">
              <p>{t('addProduct.confirmationMessage')}</p>
              <div className="flex justify-between mt-2">
                <button
                  className="button-confirmation-yes"
                  onClick={handleAddProduct}
                >
                  {t('addProduct.confirmYes')}
                </button>
                <button className="button-confirmation-no" onClick={handleCancel}>
                  {t('addProduct.confirmNo')}
                </button>
              </div>
            </div>
          )}

          {message && (
            <p className="mt-4 text-center text-blue-500 font-semibold">{message}</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AddProductPage;
