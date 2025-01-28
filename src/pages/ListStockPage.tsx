import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { Product } from '../types/Product';
import { useTranslation } from 'react-i18next';

const ListStockPage: React.FC = () => {
  const { t } = useTranslation();
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
        if (response && response.content) {
          setProducts(response.content);
          setTotalPages(response.totalPages || 0);
        } else {
          setProducts([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error(t('listStock.error.fetch'), err);
        setError(t('listStock.error.general'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, t]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const downloadCSV = () => {
    if (products.length === 0) {
      alert(t('listStock.alert.noProducts'));
      return;
    }

    const csvHeader = `${t('listStock.csvHeader.name')},${t('listStock.csvHeader.quantity')},${t('listStock.csvHeader.price')},${t('listStock.csvHeader.totalValue')}\n`;
    const csvRows = products
      .map((product) => `${product.name},${product.quantity},${product.price},${product.totalValue}`)
      .join('\n');

    const csvContent = csvHeader + csvRows;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_page_${currentPage + 1}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>{t('loading')}</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">{t('listStock.title')}</h1>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          onClick={() => navigate('/admin')}
        >
          {t('listStock.backToDashboard')}
        </button>
      </header>

      <main className="w-full max-w-4xl p-6 bg-white shadow-md rounded mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('listStock.totalStock')}</h2>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={downloadCSV}
          >
            {t('listStock.downloadCSV')}
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 border rounded shadow hover:bg-gray-100"
              >
                <p>
                  <strong>{t('listStock.labels.name')}:</strong> {product.name}
                </p>
                <p>
                  <strong>{t('listStock.labels.quantity')}:</strong> {product.quantity}
                </p>
                <p>
                  <strong>{t('listStock.labels.totalValue')}:</strong> $
                  {product.totalValue?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">{t('listStock.noProducts')}</p>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            {t('listStock.pagination.previous')}
          </button>
          <span>
            {t('listStock.pagination.page')} {currentPage + 1} {t('listStock.pagination.of')} {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {t('listStock.pagination.next')}
          </button>
        </div>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
      </footer>
    </div>
  );
};

export default ListStockPage;
