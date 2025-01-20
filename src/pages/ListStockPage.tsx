import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { Product } from '../types/Product';

const ListStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10; // Number of items per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ProductService.fetchPagedProducts(currentPage, pageSize);
        console.log('Fetched Products:', response);

        if (response && response.content) {
          setProducts(response.content);
          setTotalPages(response.totalPages || 0);
        } else {
          setProducts([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const downloadCSV = () => {
    if (products.length === 0) {
      alert('No products available to download.');
      return;
    }

    // Convert products to CSV format
    const csvHeader = 'Name,Quantity,Price,Total Value\n';
    const csvRows = products
      .map((product) => `${product.name},${product.quantity},${product.price},${product.totalValue}`)
      .join('\n');

    const csvContent = csvHeader + csvRows;

    // Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_page_${currentPage + 1}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* Header with Back to Dashboard */}
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">List Stock</h1>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </button>
      </header>

      {/* Main Section */}
      <main className="w-full max-w-4xl p-6 bg-white shadow-md rounded mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Total Stock</h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={downloadCSV}
          >
            Download CSV
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 border rounded shadow hover:bg-gray-100"
              >
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Quantity:</strong> {product.quantity}</p>
                <p><strong>Total Value:</strong> ${product.totalValue?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No products available.</p>
        )}

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ListStockPage;
