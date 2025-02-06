import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import '../styles/tailwindCustom.css'; // ✅ Import global styles

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

  // Role-based navigation
  const navigateToDashboard = () => {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') navigate('/admin');
    else if (role === 'ROLE_USER') navigate('/user');
    else navigate('/login');
  };

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsHelpOpen((prev) => prev);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedProduct(null); // Clear selected product when the query changes

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
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        {/* ✅ Standardized Help Button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="button-secondary min-w-[120px]"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>

        <h1 className="text-lg font-semibold">{t('searchProduct.title')}</h1>

        {/* ✅ Standardized Back Button */}
        <button className="button-primary min-w-[140px]" onClick={navigateToDashboard}>
          {t('searchProduct.backToDashboard')}
        </button>
      </header>

      {/* ✅ Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="searchProduct" />

      <main className="flex flex-col items-center w-full max-w-2xl p-4 mt-6 bg-white shadow rounded">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('searchProduct.subtitle')}</h2>

        <div className="w-full flex flex-col gap-4">
          {/* ✅ Standardized Input Field */}
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

              <div className="mt-4 flex justify-between">
                {/* ✅ Standardized Buttons */}
                <button className="button-secondary min-w-[140px]" onClick={() => setSelectedProduct(null)}>
                  {t('searchProduct.cancelButton')}
                </button>
                <button
                  className="button-primary min-w-[140px]"
                  onClick={() => navigate(`/product/${selectedProduct.id}/edit`)}
                >
                  {t('searchProduct.editButton', { name: selectedProduct.name })}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
        <p className="text-sm text-gray-600">{t('footer.developer')}</p>
      </footer>
    </div>
  );
};

export default SearchProductPage;
