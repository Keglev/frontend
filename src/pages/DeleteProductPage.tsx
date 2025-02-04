import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';

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
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">{t('deleteProduct.title')}</h1>

        {/* ✅ Help Button - Now correctly updates when switching languages */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          key={i18n.language} // ✅ Ensures correct translation updates
        >
          {t('button', { ns: 'help' })} {/* ✅ Corrected reference */}
        </button>

        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          onClick={() => navigate('/admin')}
        >
          {t('deleteProduct.backToDashboard')}
        </button>
      </header>

      {/* ✅ Help Modal - Fix Close Button Translation */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="deleteProduct" />

      <main className="flex flex-col items-center w-full max-w-2xl p-4 mt-6 bg-white shadow rounded">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('deleteProduct.findProduct')}</h2>

        <input
          type="text"
          placeholder={t('deleteProduct.searchPlaceholder')}
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
        />

        {message && <p className="text-gray-500 text-center mt-4">{message}</p>}

        <ul className="w-full mt-4 space-y-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="p-2 bg-gray-100 border rounded hover:bg-gray-200 cursor-pointer"
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
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => setConfirmation('second')}
              >
                {t('deleteProduct.confirmYes')}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleDelete}
              >
                {t('deleteProduct.confirmYes')}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={cancelOperation}
              >
                {t('deleteProduct.confirmNo')}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
        <p className="text-sm text-gray-600">{t('footer.developer')}</p>
      </footer>
    </div>
  );
};

export default DeleteProductPage;
