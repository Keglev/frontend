import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Buttons from '../components/Buttons';
import DashboardLogic from '../logic/DashboardLogic';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';

const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [stockValue, setStockValue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<
    { id: number; name: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { stockValue, lowStock } = await DashboardLogic.fetchDashboardData();
        setStockValue(stockValue);
        setLowStockProducts(lowStock);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(t('adminDashboard.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header
        title={t('adminDashboard.title')}
        isLoggedIn={true}
        onLogout={() => {
          localStorage.clear(); // Clear language and user data
          navigate('/login');
        }}
      />

      <main className="flex-grow flex flex-col items-center p-6">
        <h2 className="text-2xl font-semibold mb-4">{t('adminDashboard.welcome')}</h2>
        <p className="text-lg text-gray-700 mb-8">{t('adminDashboard.subtitle')}</p>

        {loading ? (
          <p className="text-gray-500">{t('loading')}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="w-full max-w-4xl space-y-6">
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">{t('adminDashboard.stockValue')}</h3>
              <p className="text-xl text-blue-600 font-bold">${stockValue.toFixed(2)}</p>
            </div>

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

        <div className="mt-8">
          <Buttons />
        </div>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
        <p className="text-sm text-gray-600">{t('footer.developer')}</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
