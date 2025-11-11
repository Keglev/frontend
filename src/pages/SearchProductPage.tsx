/**
 * @file SearchProductPage.tsx
 * @description
 * Product search interface allowing users to find products by name.
 *
 * **Features:**
 * - Real-time product search (minimum 3 characters)
 * - Display matching products in a list
 * - Click to view full product details
 * - Edit product functionality
 * - Help modal with contextual information
 *
 * **Search Flow:**
 * 1. User types product name (3+ characters)
 * 2. API returns matching products
 * 3. Click product to load full details
 * 4. Option to edit or cancel selection
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
import '../styles/tailwindCustom.css';

/**
 * Search product page component
 * @component
 * @returns {JSX.Element} Product search interface
 */
const SearchProductPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number;
    name: string;
    quantity?: number;
    price?: number;
    totalValue?: number;
  } | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  // Re-render on language changes (helps with help modal translations)
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
   * Handle product search with minimum 3 character requirement
   * Fetches matching products from backend API
   */
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedProduct(null);

    if (query.length >= 3) {
      try {
        const results = await ProductService.searchProductsByName(query);
        setProducts(results && results.length > 0 ? results : []);
      } catch (error) {
        console.error(t('searchProduct.error.fetch'), error);
        setProducts([]);
      }
    } else {
      setProducts([]);
    }
  };

  /**
   * Load full product details when user selects from search results
   */
  const handleProductClick = async (productId: number) => {
    try {
      const productDetails = await ProductService.getProductById(productId);
      setSelectedProduct(productDetails);
    } catch (error) {
      console.error(t('searchProduct.error.details'), error);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="searchProduct" />

      <main className="flex flex-col items-center w-full max-w-2xl p-6 mt-6 bg-white shadow-lg rounded mx-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('searchProduct.subtitle')}</h2>

        <input
          type="text"
          placeholder={t('searchProduct.placeholder')}
          value={searchQuery}
          onChange={handleSearch}
          className="input-field"
        />

        {searchQuery.length >= 3 &&
          (products.length > 0 ? (
            <ul className="w-full mt-4 space-y-2">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="p-2 bg-gray-100 border rounded hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  {product.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center mt-4">{t('searchProduct.noResults')}</p>
          ))}

        {selectedProduct && (
          <div className="mt-6 p-4 bg-gray-100 border rounded shadow-md">
            <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
            <p className="text-gray-700">
              {t('searchProduct.details.quantity')}: {selectedProduct.quantity}
            </p>
            <p className="text-gray-700">
              {t('searchProduct.details.price')}: ${selectedProduct.price?.toFixed(2)}
            </p>
            <p className="text-gray-700">
              {t('searchProduct.details.totalValue')}: ${selectedProduct.totalValue?.toFixed(2)}
            </p>

            <div className="mt-4 flex justify-between space-x-4">
              <button className="button-confirmation button-confirmation-no" onClick={() => setSelectedProduct(null)}>
                {t('searchProduct.cancelButton')}
              </button>
              <button
                className="button-confirmation button-confirmation-yes"
                onClick={() => navigate(`/product/${selectedProduct.id}/edit`)}
              >
                {t('searchProduct.editButton', { name: selectedProduct.name })}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SearchProductPage;
