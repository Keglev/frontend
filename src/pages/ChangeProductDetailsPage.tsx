import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import Header from '../components/Header';
import '../styles/tailwindCustom.css';
import Footer from '../components/Footer';

/**
 * ChangeProductDetailsPage Component
 * Allows users to update the quantity and price of a specific product.
 * 
 * Features:
 * - Fetches and displays product details.
 * - Enables input fields for modifying product attributes.
 * - Provides confirmation before saving changes.
 * - Supports role-based navigation after updates.
 */
const ChangeProductDetailsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<{ id: number; name: string; quantity: number; price: number } | null>(null);
  const [newQuantity, setNewQuantity] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  /**
   * Redirects the user back to the appropriate dashboard based on role.
   * If the role is undefined, the user is redirected to the login page.
   */
  const navigateToDashboard = () => {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') navigate('/admin');
    else if (role === 'ROLE_USER') navigate('/user');
    else navigate('/login');
  };

  /**
   * Fetches the product details based on the product ID from the URL.
   * Updates the state with the retrieved product data.
   */
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productDetails = await ProductService.getProductById(Number(productId));
        setProduct(productDetails);
        setNewQuantity(productDetails.quantity);
        setNewPrice(productDetails.price);
      } catch (error) {
        console.error(t('changeProduct.error.fetch'), error);
        setMessage(t('changeProduct.errorMessage'));
      }
    };

    fetchProductDetails();
  }, [productId, t]);

  /**
   * Ensures that the help button updates properly when the language is changed.
   */
  useEffect(() => {
    const handleLanguageChange = () => {
      setIsHelpOpen((prev) => prev);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  /**
   * Handles the process of saving updated product details.
   * Sends API requests to update the product's quantity and/or price.
   */
  const handleSaveChanges = async () => {
    setMessage('');
    try {
      if (newQuantity !== null) {
        await ProductService.updateProductQuantity(Number(productId), newQuantity);
      }
      if (newPrice !== null) {
        await ProductService.updateProductPrice(Number(productId), newPrice);
      }
      setMessage(t('changeProduct.successMessage'));

      // Redirects the user back to the dashboard after a short delay.
      setTimeout(() => navigateToDashboard(), 1500);
    } catch (error) {
      console.error(t('changeProduct.error.update'), error);
      setMessage(t('changeProduct.errorMessage'));
    }
    setConfirmation(false);
  };

  /**
   * Resets the input fields and cancels any pending updates.
   */
  const handleCancel = () => {
    setNewQuantity(product?.quantity || 0);
    setNewPrice(product?.price || 0);
    setConfirmation(false);
    setMessage(t('changeProduct.cancelMessage'));
  };

  // Displays a loading message if the product data has not been retrieved yet.
  if (!product) return <p>{t('loading')}</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Page header with logout functionality */}
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      {/* Help button positioned in the center of the header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="button-secondary"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* Help modal for guidance */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="changeProduct" />

      {/* Main section containing product details and input fields */}
      <main className="w-full max-w-2xl p-6 bg-white shadow-lg rounded mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>

        {/* Input field for updating product quantity */}
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('changeProduct.quantityLabel')}</label>
          <input
            type="number"
            value={newQuantity ?? product.quantity}
            onChange={(e) => setNewQuantity(Number(e.target.value))}
            className="input-field"
          />
        </div>

        {/* Input field for updating product price */}
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('changeProduct.priceLabel')}</label>
          <input
            type="number"
            step="0.01"
            value={newPrice ?? product.price}
            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
            className="input-field"
          />
        </div>

        {/* Action buttons for canceling or saving changes */}
        <div className="flex justify-between space-x-4">
          <button className="button-confirmation button-confirmation-no" onClick={handleCancel}>
            {t('changeProduct.cancelButton')}
          </button>
          <button className="button-confirmation button-confirmation-yes" onClick={() => setConfirmation(true)}>
            {t('changeProduct.saveButton')}
          </button>
        </div>

        {/* Confirmation popup before saving changes */}
        {confirmation && (
          <div className="confirmation-box mt-4">
            <p>{t('changeProduct.confirmationMessage')}</p>
            <div className="flex justify-between space-x-4">
              <button className="button-confirmation button-confirmation-yes" onClick={handleSaveChanges}>
                {t('changeProduct.confirmYes')}
              </button>
              <button className="button-confirmation button-confirmation-no" onClick={handleCancel}>
                {t('changeProduct.confirmNo')}
              </button>
            </div>
          </div>
        )}

        {/* Feedback message displayed after an action is performed */}
        {message && <p className="mt-4 text-blue-500 font-semibold">{message}</p>}
      </main>

      {/* Footer component for consistency across pages */}
      <Footer />
    </div>
  );
};

export default ChangeProductDetailsPage;
