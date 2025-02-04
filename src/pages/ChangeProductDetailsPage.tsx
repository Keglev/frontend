import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';

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

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsHelpOpen((prev) => prev); // Ensures Help Button updates properly
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

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
      setTimeout(() => navigateToDashboard(), 1500);
    } catch (error) {
      console.error(t('changeProduct.error.update'), error);
      setMessage(t('changeProduct.errorMessage'));
    }
    setConfirmation(false);
  };

  const handleCancel = () => {
    setNewQuantity(product?.quantity || 0);
    setNewPrice(product?.price || 0);
    setConfirmation(false);
    setMessage(t('changeProduct.cancelMessage'));
  };

  if (!product) return <p>{t('loading')}</p>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>

        <h1 className="text-lg font-semibold">{t('changeProduct.title')}</h1>

        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          onClick={navigateToDashboard}
        >
          {t('changeProduct.backToDashboard')}
        </button>
      </header>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="changeProduct" />

      <main className="w-full max-w-2xl p-6 bg-white shadow rounded mt-6">
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>

        <div className="mb-4">
          <label className="block font-medium mb-2">{t('changeProduct.quantityLabel')}</label>
          <input
            type="number"
            value={newQuantity ?? product.quantity}
            onChange={(e) => setNewQuantity(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">{t('changeProduct.priceLabel')}</label>
          <input
            type="number"
            step="0.01"
            value={newPrice ?? product.price}
            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={handleCancel}
          >
            {t('changeProduct.cancelButton')}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setConfirmation(true)}
          >
            {t('changeProduct.saveButton')}
          </button>
        </div>

        {confirmation && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <p>{t('changeProduct.confirmationMessage')}</p>
            <div className="flex justify-between mt-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleSaveChanges}
              >
                {t('changeProduct.confirmYes')}
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleCancel}
              >
                {t('changeProduct.confirmNo')}
              </button>
            </div>
          </div>
        )}

        {message && <p className="mt-4 text-blue-500 font-semibold">{message}</p>}
      </main>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
      </footer>
    </div>
  );
};

export default ChangeProductDetailsPage;
