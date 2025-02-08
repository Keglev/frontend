import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import Header from '../components/Header';
import '../styles/tailwindCustom.css'; // ✅ Import Tailwind styles
import Footer from '../components/Footer'; // ✅ Import Footer component

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
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ✅ Consistent Header with Language Buttons */}
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      {/* ✅ Help Button - Centered in Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="button-secondary"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* ✅ Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="changeProduct" />

      {/* ✅ Main Section */}
      <main className="w-full max-w-2xl p-6 bg-white shadow-lg rounded mx-auto mt-6">
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>

        {/* ✅ Quantity Input */}
        <div className="mb-4">
          <label className="block font-medium mb-2">{t('changeProduct.quantityLabel')}</label>
          <input
            type="number"
            value={newQuantity ?? product.quantity}
            onChange={(e) => setNewQuantity(Number(e.target.value))}
            className="input-field"
          />
        </div>

        {/* ✅ Price Input */}
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

        {/* ✅ Action Buttons */}
        <div className="flex justify-between space-x-4">
          <button className="button-confirmation button-confirmation-no" onClick={handleCancel}>
            {t('changeProduct.cancelButton')}
          </button>
          <button className="button-confirmation button-confirmation-yes" onClick={() => setConfirmation(true)}>
            {t('changeProduct.saveButton')}
          </button>
        </div>

        {/* ✅ Confirmation Popup */}
        {confirmation && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
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

        {/* ✅ Feedback Message */}
        {message && <p className="mt-4 text-blue-500 font-semibold">{message}</p>}
      </main>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default ChangeProductDetailsPage;