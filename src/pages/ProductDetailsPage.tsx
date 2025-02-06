import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
}

const ProductDetailsPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Role-based navigation
  const navigateToDashboard = () => {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') navigate('/admin');
    else if (role === 'ROLE_USER') navigate('/user');
    else navigate('/login');
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const fetchedProduct = await ProductService.getProductById(Number(id));
        setProduct(fetchedProduct);
      } catch (err) {
        console.error(t('productDetails.error.fetch'), err);
        setError(t('productDetails.error.general'));
      }
    };

    fetchProductDetails();
  }, [id, t]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsHelpOpen((prev) => prev);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-500">{t('error.title')}</h1>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/search-product')}
        >
          {t('productDetails.backToSearch')}
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <header className="w-full bg-blue-500 text-white p-4 flex justify-between items-center">
        {/* ✅ Standardized Help Button */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="button-secondary min-w-[120px]"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>

        <h1 className="text-xl font-bold">{t('productDetails.title')}</h1>

        {/* ✅ Standardized Back Button */}
        <button className="button-primary min-w-[140px]" onClick={() => navigate('/search-product')}>
          {t('productDetails.backToSearch')}
        </button>
      </header>

      {/* ✅ Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="productDetails" />

      <main className="w-full max-w-md bg-white shadow-md rounded p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">{product.name}</h2>
        <p>
          <strong>{t('productDetails.quantity')}:</strong> {product.quantity}
        </p>
        <p>
          <strong>{t('productDetails.price')}:</strong> ${product.price.toFixed(2)}
        </p>
        <p>
          <strong>{t('productDetails.totalValue')}:</strong> ${product.totalValue.toFixed(2)}
        </p>

        <div className="mt-6 flex justify-between">
          {/* ✅ Standardized Buttons */}
          <button className="button-secondary min-w-[140px]" onClick={() => navigate('/search-product')}>
            {t('productDetails.backToSearch')}
          </button>
          <button className="button-primary min-w-[140px]" onClick={navigateToDashboard}>
            {t('productDetails.backToDashboard')}
          </button>
        </div>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
        <p className="text-sm text-gray-600">{t('footer.developer')}</p>
      </footer>
    </div>
  );
};

export default ProductDetailsPage;