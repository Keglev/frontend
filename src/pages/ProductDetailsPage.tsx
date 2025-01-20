import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  totalValue: number;
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const fetchedProduct = await ProductService.getProductById(Number(id));
        setProduct(fetchedProduct);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to fetch product details. Please try again.');
      }
    };

    fetchProductDetails();
  }, [id]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p>{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate('/search-product')}
        >
          Back to Search
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <header className="w-full bg-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <button
            className="text-white font-semibold"
            onClick={() => navigate('/search-product')}
          >
            ← Back to Search
          </button>
          <h1 className="text-xl font-bold">Product Details</h1>
        </div>
      </header>

      <main className="w-full max-w-md bg-white shadow-md rounded p-6 mt-6">
        <h2 className="text-xl font-bold mb-4">{product.name}</h2>
        <p>
          <strong>Quantity in Stock:</strong> {product.quantity}
        </p>
        <p>
          <strong>Price:</strong> ${product.price.toFixed(2)}
        </p>
        <p>
          <strong>Total Value:</strong> ${product.totalValue.toFixed(2)}
        </p>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );
};

export default ProductDetailsPage;
