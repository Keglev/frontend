import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';
import '../styles/tailwindCustom.css';

/**
 * AddProductPage Component
 * Allows an admin user to add a new product by providing product details.
 * 
 * Features:
 * - Takes user input for name, quantity, and price.
 * - Provides a confirmation step before submission.
 * - Displays success or error messages based on API response.
 * - Includes a help modal for guidance.
 */
const AddProductPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']); // Load translations
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  /**
   * Resets all input fields after submission or cancellation.
   */
  const resetFields = () => {
    setName('');
    setQuantity('');
    setPrice('');
  };

  /**
   * Handles adding a new product.
   * Calls the ProductService API to create a new product.
   * Displays success or error messages accordingly.
   */
  const handleAddProduct = async () => {
    setMessage('');
    try {
      await ProductService.addProduct({
        name,
        quantity: parseInt(quantity, 10), // Convert input to an integer
        price: parseFloat(price), // Convert input to a float
      });
      setMessage(t('addProduct.successMessage')); // Display success message
      resetFields();
    } catch (error) {
      setMessage(t('addProduct.errorMessage')); // Display error message
      console.error(t('addProduct.errorLog'), error);
    }
    setConfirmation(false);
  };

  /**
   * Cancels the current operation, resets fields, and provides feedback.
   */
  const handleCancel = () => {
    resetFields();
    setMessage(t('addProduct.cancelMessage'));
    setConfirmation(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header with Logout Functionality */}
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      {/* Help Button (Accessible for Guidance) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="button-secondary"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* Help Modal for User Assistance */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="addProduct" />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow">
        <div className="w-96 box-shadow mt-6">
          <h2 className="text-lg font-semibold mb-4">{t('addProduct.detailsTitle')}</h2>

          {/* Product Name Input */}
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

          {/* Quantity Input */}
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

          {/* Price Input */}
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

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              className="button-confirmation-no"
              onClick={handleCancel}
            >
              {t('addProduct.cancelButton')}
            </button>
            <button
              className="button-confirmation-yes"
              onClick={() => setConfirmation(true)}
            >
              {t('addProduct.addButton')}
            </button>
          </div>

          {/* Confirmation Popup */}
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
                <button
                  className="button-confirmation-no"
                  onClick={handleCancel}
                >
                  {t('addProduct.confirmNo')}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Message Display */}
          {message && (
            <p className="mt-4 text-center text-blue-500 font-semibold">{message}</p>
          )}
        </div>
      </main>

      {/* Footer for Consistency */}
      <Footer />
    </div>
  );
};

export default AddProductPage;
