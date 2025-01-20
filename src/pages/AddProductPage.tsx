import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/addProduct.css';
import ProductService from '../api/ProductService';

const AddProductPage: React.FC = () => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      setMessage('Product successfully added.');
      resetFields();
    } catch (error) {
      setMessage('Failed to add product. Please try again.');
      console.error('Error adding product:', error);
    }
    setConfirmation(false);
  };

  const handleCancel = () => {
    resetFields();
    setMessage('Operation canceled.');
    setConfirmation(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="w-full bg-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <button
            className="text-white font-semibold"
            onClick={() => navigate('/admin')}
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Add New Product</h1>
        </div>
      </header>

      <div className="w-96 bg-white p-6 shadow-md rounded mt-6">
        <h2 className="text-lg font-semibold mb-4">Enter Product Details</h2>

        {/* Form Fields */}
        <div className="mb-4">
          <label htmlFor="name" className="block font-medium mb-2">
            Name and Model
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
            Quantity
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
            Price
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
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setConfirmation(true)}
          >
            Add Product
          </button>
        </div>

        {/* Confirmation Popup */}
        {confirmation && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <p>Are you sure you want to add this product?</p>
            <div className="flex justify-between mt-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleAddProduct}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleCancel}
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {message && (
          <p className="mt-4 text-center text-blue-500 font-semibold">{message}</p>
        )}
      </div>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );
};

export default AddProductPage;
