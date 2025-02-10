import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import Header from '../components/Header'; // ✅ Use the correct Header component
import Footer from '../components/Footer';

const DeleteProductPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']); // ✅ Use correct namespaces
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);
  const [confirmation, setConfirmation] = useState<'first' | 'second' | null>(null);
  const [message, setMessage] = useState('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // ✅ Ensure Help Button updates when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setIsHelpOpen((prev) => prev); // ✅ Forces re-render
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // ✅ Handle Product Search
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

  // ✅ Handle Product Selection
  const handleProductClick = (product: { id: number; name: string }) => {
    setSelectedProduct(product);
    setConfirmation('first');
    setMessage('');
  };

  // ✅ Handle Product Deletion
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

  // ✅ Cancel Confirmation
  const cancelOperation = () => {
    setConfirmation(null);
    setMessage(t('deleteProduct.messages.canceled'));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ✅ Ensures uniform Header with language buttons */}
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      {/* ✅ Help Button - Placed inside the Header section but remains part of this page */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* ✅ Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="deleteProduct" />

      <main className="flex flex-col items-center justify-center w-full max-w-2xl p-6 mt-6 bg-white shadow-lg rounded mx-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('deleteProduct.findProduct')}</h2>

        {/* ✅ Search Input Field */}
        <input
          type="text"
          placeholder={t('deleteProduct.searchPlaceholder')}
          value={searchQuery}
          onChange={handleSearch}
          className="input-field"
        />

        {message && <p className="text-gray-500 text-center mt-4">{message}</p>}

        {/* ✅ List of Products Found */}
        <ul className="w-full mt-4 space-y-2">
          {products.map((product) => (
            <li
              key={product.id}
              className={`p-2 border rounded hover:bg-gray-200 cursor-pointer ${
                selectedProduct?.id === product.id ? 'selected-product' : 'be-gray-100'
              }`}
              onClick={() => handleProductClick(product)}
            >
              {product.name}
            </li>
          ))}
        </ul>

        {/* ✅ Confirmation Step 1 */}
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

        {/* ✅ Confirmation Step 2 */}
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