/**
 * @file ListStockPage.tsx
 * @description
 * Stock inventory display with pagination and CSV export.
 *
 * **Features:**
 * - Paginated product listing (10 per page)
 * - Product cards showing name, quantity, and total value
 * - CSV export of current page
 * - Pagination controls (previous/next)
 * - Role-based dashboard navigation
 * - Help modal support
 *
 * **CSV Export:**
 * Downloads products from current page as CSV file
 * Filename: products_page_N.csv
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';
import { Product } from '../types/Product';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import '../styles/tailwindCustom.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PRODUCTS_PER_PAGE = 10;

/**
 * Stock list page component
 * @component
 * @returns {JSX.Element} Paginated product inventory
 */
const ListStockPage: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * Navigate to role-appropriate dashboard
   */
  const navigateToDashboard = () => {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') navigate('/admin');
    else if (role === 'ROLE_USER') navigate('/user');
    else navigate('/login');
  };

  // Fetch products for current page
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await ProductService.fetchPagedProducts(currentPage, PRODUCTS_PER_PAGE);
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

  // Re-render help button on language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setIsHelpOpen((prev) => prev);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  /**
   * Update current page if valid
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  /**
   * Export current page products as CSV
   * Format: name,quantity,price,totalValue
   */
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header isLoggedIn={true} onLogout={() => navigate('/login')} />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="button-secondary"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="listStock" />

      <main className="w-full max-w-4xl p-6 bg-white shadow-lg rounded mx-auto mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('listStock.totalStock')}</h2>
          <button className="button-primary px-3 py-2 h-10 min-w-[120px] max-w-[180px] text-sm" onClick={downloadCSV}>
            {t('listStock.downloadCSV')}
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <p>
                  <strong>{t('listStock.labels.name')}:</strong> {product.name}
                </p>
                <p>
                  <strong>{t('listStock.labels.quantity')}:</strong> {product.quantity}
                </p>
                <p>
                  <strong>{t('listStock.labels.totalValue')}:</strong> ${product.totalValue?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">{t('listStock.noProducts')}</p>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <button
            className="button-secondary"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            {t('listStock.pagination.previous')}
          </button>
          <span>
            {t('listStock.pagination.page')} {currentPage + 1} {t('listStock.pagination.of')} {totalPages}
          </span>
          <button
            className="button-secondary"
            disabled={currentPage === totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {t('listStock.pagination.next')}
          </button>
        </div>
      </main>

      <div className="mt-6 flex justify-center">
        <button className="logout-button" onClick={navigateToDashboard}>
          {t('listStock.backToDashboard')}
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default ListStockPage;
