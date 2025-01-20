import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';

const DeleteProductPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);
  const [confirmation, setConfirmation] = useState<'first' | 'second' | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedProduct(null); // Clear selected product when query changes
    setMessage(''); // Clear messages

    if (query.length >= 3) {
      try {
        const results = await ProductService.searchProductsByName(query);
        if (!results || (Array.isArray(results) && results.length === 0)) {
          setProducts([]);
          setMessage('Product not found. Please try again.');
        } else {
          setProducts(results);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setMessage('An error occurred. Please try again later.');
      }
    } else {
      setProducts([]);
      setMessage('');
    }
  };

  const handleProductClick = (product: { id: number; name: string }) => {
    setSelectedProduct(product);
    setConfirmation('first'); // Trigger the first confirmation dialog
    setMessage(''); // Clear any previous messages
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await ProductService.deleteProduct(selectedProduct.id);
      setMessage('Product successfully deleted.');
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setSelectedProduct(null);
      setConfirmation(null); // Reset confirmation dialogs
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage('Failed to delete product. Please try again later.');
    }
  };

  const cancelOperation = () => {
    setConfirmation(null);
    setMessage('Operation canceled.');
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Delete Products</h1>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </button>
      </header>

      <main className="flex flex-col items-center w-full max-w-2xl p-4 mt-6 bg-white shadow rounded">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Find a Product to Delete</h2>

        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
        />

        {/* Product List or Messages */}
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

        {/* Confirmation Dialogs */}
        {confirmation === 'first' && selectedProduct && (
          <div className="mt-6 p-4 bg-gray-100 border rounded shadow-md">
            <p>Do you really want to delete this product?</p>
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={() => setConfirmation('second')}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={cancelOperation}
              >
                No
              </button>
            </div>
          </div>
        )}

        {confirmation === 'second' && (
          <div className="mt-6 p-4 bg-gray-100 border rounded shadow-md">
            <p>
              If this is a return due to non-conformity, please contact the supplier first. If the
              product is to be scrapped, contact the financial services before proceeding.
            </p>
            <div className="mt-4 flex justify-between">
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleDelete}
              >
                Yes
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={cancelOperation}
              >
                No
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );
};

export default DeleteProductPage;
