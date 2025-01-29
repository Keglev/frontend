import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
}

const ProductDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Determine role and navigate back to the correct dashboard
  const navigateToDashboard = () => {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') {
      navigate('/admin');
    } else if (role === 'ROLE_USER') {
      navigate('/user');
    } else {
      navigate('/login'); // Fallback to login if role is undefined
    }
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
        <button
          className="text-white font-semibold"
          onClick={() => navigate('/search-product')}
        >
          ← {t('productDetails.backToSearch')}
        </button>
        <h1 className="text-xl font-bold">{t('productDetails.title')}</h1>
      </header>

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

        <div className="mt-6">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={navigateToDashboard} // Navigate back to correct dashboard
          >
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
