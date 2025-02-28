import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Buttons from '../../components/Buttons';
import DashboardLogic from '../../logic/DashboardLogic';
import Header from '../../components/Header';
import HelpModal from '../../components/HelpModal';
import { useTranslation } from 'react-i18next';
import Footer from '../../components/Footer';

/**
 * AdminDashboard Component
 * Displays an overview of the inventory for administrators.
 *
 * Features:
 * - Shows total stock value.
 * - Lists low-stock products.
 * - Provides navigation buttons for product management.
 * - Includes a help modal for guidance.
 */
const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']); // Load translations
  const [stockValue, setStockValue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<
    { id: number; name: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  /**
   * Ensures the correct language is set based on user preferences.
   */
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  /**
   * Fetches dashboard data including total stock value and low-stock products.
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch dashboard data using optimized logic
        const { stockValue, lowStock } = await DashboardLogic.fetchDashboardData();
        setStockValue(stockValue);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(t('adminDashboard.error')); // Display localized error message
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header with Logout Functionality */}
      <Header
        isLoggedIn={true}
        onLogout={() => {
          localStorage.clear();
          navigate('/login');
        }}
      />

      {/* Help Button (Centered in Header) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* Help Modal for User Guidance */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="adminDashboard" />

      {/* Main Content - Dashboard Overview */}
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-semibold">{t('adminDashboard.welcome')}</h2>
        <p className="text-lg text-gray-700 mb-8">{t('adminDashboard.subtitle')}</p>

        {/* Loading & Error Handling */}
        {loading ? (
          <p className="text-gray-500">{t('loading')}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="w-full max-w-4xl space-y-6">
            {/* Total Stock Value Section */}
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">{t('adminDashboard.stockValue')}</h3>
              <p className="text-xl text-blue-600 font-bold">${stockValue.toFixed(2)}</p>
            </div>

            {/* Low-Stock Products Section */}
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">{t('adminDashboard.lowStock')}</h3>
              {lowStockProducts.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {lowStockProducts.map((product) => (
                    <li key={product.id} className="p-2 bg-gray-100 border rounded">
                      {product.name} ({t('quantity')}: {product.quantity})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">{t('adminDashboard.sufficientStock')}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons for Inventory Management */}
        <div className="mt-8">
          <Buttons />
        </div>
      </main>

      {/* Footer for Consistency */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
