import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductService from '../api/ProductService';

const ChangeProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<{ id: number; name: string; quantity: number; price: number } | null>(null);
  const [newQuantity, setNewQuantity] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const productDetails = await ProductService.getProductById(Number(productId));
        setProduct(productDetails);
        setNewQuantity(productDetails.quantity);
        setNewPrice(productDetails.price);
      } catch (error) {
        console.error('Error fetching product details:', error);
        setMessage('Failed to load product details. Please try again.');
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleSaveChanges = async () => {
    setMessage(''); // Clear any previous messages
    try {
      if (newQuantity !== null) {
        await ProductService.updateProductQuantity(Number(productId), newQuantity);
      }
      if (newPrice !== null) {
        await ProductService.updateProductPrice(Number(productId), newPrice);
      }
      setMessage('Product details updated successfully.');
      setTimeout(() => navigate('/search-product'), 1500); // Redirect back after success
    } catch (error) {
      console.error('Error updating product details:', error);
      setMessage('Failed to update product details. Please try again.');
    }
    setConfirmation(false); // Close confirmation modal
  };

  const handleCancel = () => {
    setNewQuantity(product?.quantity || 0);
    setNewPrice(product?.price || 0);
    setConfirmation(false); // Close confirmation modal
    setMessage('Operation canceled.');
  };

  if (!product) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Edit Product</h1>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          onClick={() => navigate('/search-product')}
        >
          Back to Search
        </button>
      </header>

      <main className="w-full max-w-2xl p-6 bg-white shadow rounded mt-6">
        <h2 className="text-2xl font-bold mb-4">{product.name}</h2>

        <div className="mb-4">
          <label className="block font-medium mb-2">Current Quantity</label>
          <input
            type="number"
            value={newQuantity ?? product.quantity}
            onChange={(e) => setNewQuantity(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-2">Current Price</label>
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
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setConfirmation(true)}
          >
            Save Changes
          </button>
        </div>

        {confirmation && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <p>Are you sure you want to save these changes?</p>
            <div className="flex justify-between mt-2">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleSaveChanges}
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

        {message && <p className="mt-4 text-blue-500 font-semibold">{message}</p>}
      </main>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );
};

export default ChangeProductDetailsPage;
