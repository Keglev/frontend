/**
 * @file DeleteProductPage.tsx
 * @description
 * Product deletion interface with two-step confirmation.
 *
 * **Features:**
 * - Search products by name (3+ characters)
 * - Click to select from search results
 * - Two-step confirmation process
 * - Real-time search suggestions
 * - Success/error messaging
 * - Help modal support
 *
 * **Deletion Workflow:**
 * 1. Search and select product
 * 2. First confirmation (are you sure?)
 * 3. Second confirmation (final check)
 * 4. Delete product from API
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * Delete product page component
 * @component
 * @returns {JSX.Element} Product deletion interface
 */
const DeleteProductPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);
  const [confirmation, setConfirmation] = useState<'first' | 'second' | null>(null);
  const [message, setMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Re-render help button on language changes
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
   * Search products by name (minimum 3 characters)
   */
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedProduct(null);
    setMessage('');

    if (query.length >= 3) {
      try {
        const results = await ProductService.searchProductsByName(query);
        if (!results || results.length === 0) {
          setProducts([]);
          setMessage(t('deleteProduct.messages.notFound'));
        } else {
          setProducts(results);
        }
      } catch (error) {
        console.error(t('deleteProduct.error.fetch'), error);
        setProducts([]);
        setMessage(t('deleteProduct.messages.error'));
      }
    } else {
      setProducts([]);
      setMessage('');
    }
  };

  /**
   * Select product and open first confirmation dialog
   */
  const handleProductClick = (product: { id: number; name: string }) => {
    setSelectedProduct(product);
    setConfirmation('first');
    setMessage('');
  };

  /**
   * Delete product after two-step confirmation
   * Remove from products list on success
   */
  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await ProductService.deleteProduct(selectedProduct.id);
      setMessage(t('deleteProduct.messages.success'));
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setSelectedProduct(null);
      setConfirmation(null);
    } catch (error) {
      console.error(t('deleteProduct.error.delete'), error);
      setMessage(t('deleteProduct.messages.failed'));
    }
  };

  /**
   * Cancel deletion and reset confirmation state
   */
  const cancelOperation = () => {
    setConfirmation(null);
    setMessage(t('deleteProduct.messages.canceled'));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page header with logout functionality */}
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      {/* Help button positioned at the top center of the page */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* Help modal for guidance */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="deleteProduct" />

      {/* Main content section */}
      <main className="flex flex-col items-center justify-center w-full max-w-2xl p-6 mt-6 bg-white shadow-lg rounded mx-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('deleteProduct.findProduct')}</h2>

        {/* Search input for finding products */}
        <input
          type="text"
          placeholder={t('deleteProduct.searchPlaceholder')}
          value={searchQuery}
          onChange={handleSearch}
          className="input-field"
        />

        {/* Display message if applicable */}
        {message && <p className="text-gray-500 text-center mt-4">{message}</p>}

        {/* List of products matching the search query */}
        <ul className="w-full mt-4 space-y-2">
          {products.map((product) => (
            <li
              key={product.id}
              className={`p-2 border rounded hover:bg-gray-200 cursor-pointer ${
                selectedProduct?.id === product.id ? 'selected-product' : 'bg-gray-100'
              }`}
              onClick={() => handleProductClick(product)}
            >
              {product.name}
            </li>
          ))}
        </ul>

        {confirmation === 'first' && selectedProduct && (
          <div className="mt-6 p-4 bg-gray-100 border rounded shadow-md">
            <p>{t('deleteProduct.confirmation.first')}</p>
            <div className="mt-4 flex justify-between">
              <button
                className="button-confirmation button-confirmation-yes"
                onClick={() => setConfirmation('second')}
              >
                {t('deleteProduct.confirmYes')}
              </button>
              <button
                className="button-confirmation button-confirmation-no"
                onClick={cancelOperation}
              >
                {t('deleteProduct.confirmNo')}
              </button>
            </div>
          </div>
        )}

        {confirmation === 'second' && (
          <div className="mt-6 p-4 bg-gray-100 border rounded shadow-md">
            <p>{t('deleteProduct.confirmation.second')}</p>
            <div className="mt-4 flex justify-between">
              <button
                className="button-confirmation button-confirmation-yes"
                onClick={handleDelete}
              >
                {t('deleteProduct.confirmYes')}
              </button>
              <button
                className="button-confirmation button-confirmation-no"
                onClick={cancelOperation}
              >
                {t('deleteProduct.confirmNo')}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DeleteProductPage;
