import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';
import ProductService from '../api/ProductService';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';

const AddProductPage: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

      <main className="flex flex-col items-center justify-center flex-grow">
        <div className="w-96 bg-white p-6 shadow-md rounded mt-6">
          <h2 className="text-lg font-semibold mb-4">{t('addProduct.detailsTitle')}</h2>

          {/* Form Fields */}
          <div className="mb-4">
            <label htmlFor="name" className="block font-medium mb-2">
              {t('addProduct.nameLabel')}
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
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
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
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
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={handleCancel}
            >
              {t('addProduct.cancelButton')}
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => setConfirmation(true)}
            >
              {t('addProduct.addButton')}
            </button>
          </div>

          {/* Confirmation Popup */}
          {confirmation && (
            <div className="mt-4 p-4 bg-gray-200 rounded">
              <p>{t('addProduct.confirmationMessage')}</p>
              <div className="flex justify-between mt-2">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleAddProduct}
                >
                  {t('addProduct.confirmYes')}
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={handleCancel}
                >
                  {t('addProduct.confirmNo')}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Message */}
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
