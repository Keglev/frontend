import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';

const AddProductPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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

  const resetFields = () => {
    setName('');
    setQuantity('');
    setPrice('');
  };

  const handleAddProduct = async () => {
    setMessage('');
    try {
      await ProductService.addProduct({
        name,
        quantity: parseInt(quantity, 10),
        price: parseFloat(price),
      });
      setMessage(t('addProduct.successMessage'));
      resetFields();
    } catch (error) {
      setMessage(t('addProduct.errorMessage'));
      console.error(t('addProduct.errorLog'), error);
    }
    setConfirmation(false);
  };

  const handleCancel = () => {
    resetFields();
    setMessage(t('addProduct.cancelMessage'));
    setConfirmation(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
    {/* ✅ Ensure Header is included */}
    <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

    {/* ✅ Help Button inside Header (Same as AdminDashboard.tsx & DeleteProductPage.tsx) */}
    <button
      onClick={() => setIsHelpOpen(true)}
      className="absolute top-4 left-1/2 transform -translate-x-1/2 button-secondary"
      key={i18n.language}
    >
      {t('button', { ns: 'help' })}
    </button>

    {/* ✅ Help Modal */}
    <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="addProduct" />

    <main className="flex flex-col items-center justify-center flex-grow">
      <div className="w-96 box-shadow mt-6">
        <h2 className="text-lg font-semibold mb-4">{t('addProduct.detailsTitle')}</h2>

        {/* ✅ Form Fields - Using Global Tailwind Styles */}
        <div className="mb-4">
          <label htmlFor="name" className="block font-medium mb-2">
            {t('addProduct.nameLabel')}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="quantity" className="block font-medium mb-2">
            {t('addProduct.quantityLabel')}
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="price" className="block font-medium mb-2">
            {t('addProduct.priceLabel')}
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field"
          />
        </div>

        {/* ✅ Action Buttons - Using Global Tailwind Styles */}
        <div className="flex justify-between mt-6">
          <button
            className="button-confirmation-no"
            onClick={handleCancel}
          >
            {t('addProduct.cancelButton')}
          </button>
          <button
            className="button-confirmation-yes"
            onClick={() => setConfirmation(true)}
          >
            {t('addProduct.addButton')}
          </button>
        </div>

        {/* ✅ Confirmation Popup */}
        {confirmation && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <p>{t('addProduct.confirmationMessage')}</p>
            <div className="flex justify-between mt-2">
              <button
                className="button-confirm-yes"
                onClick={handleAddProduct}
              >
                {t('addProduct.confirmYes')}
              </button>
              <button
                className="button-confirm-no"
                onClick={handleCancel}
              >
                {t('addProduct.confirmNo')}
              </button>
            </div>
          </div>
        )}

        {/* ✅ Feedback Message */}
        {message && (
          <p className="mt-4 text-center text-blue-500 font-semibold">{message}</p>
        )}
      </div>
    </main>

    {/* ✅ Corrected Footer with Proper Role Navigation */}
    <footer className="w-full bg-gray-200 text-center py-4 mt-6">
      <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
      <button
        className="text-blue-600 underline mt-2"
        onClick={navigateToDashboard}
      >
        {t('addProduct.backToDashboard')}
      </button>
    </footer>
  </div>
);
};

export default AddProductPage;