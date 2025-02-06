import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Buttons from '../components/Buttons';
import DashboardLogic from '../logic/DashboardLogic';
import HelpModal from '../components/HelpModal';
import { useTranslation } from 'react-i18next';

const UserDashboard: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const navigate = useNavigate();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [stockValue, setStockValue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<
    { id: number; name: string; quantity: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') {
      setWelcomeMessage(t('adminDashboard.welcome'));
    } else {
      setWelcomeMessage(t('userDashboard.welcome'));
    }
  }, [t]);

  // ✅ Fetch dashboard data (same as AdminDashboard.tsx)
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
        setError(t('userDashboard.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ✅ Ensure Header is included */}
      <Header
        isLoggedIn={true}
        onLogout={() => {
          localStorage.clear();
          navigate('/login');
        }}
      />

      {/* ✅ Help Button - centered in Header (same as AdminDashboard.tsx) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* ✅ Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="userDashboard" />

      <main className="flex-grow flex flex-col items-center p-6">
        <h2 className="text-2xl font-semibold mb-4">{welcomeMessage}</h2>
        <p className="text-lg text-gray-700 mb-8">{t('userDashboard.subtitle')}</p>

        {loading ? (
          <p className="text-gray-500">{t('loading')}</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="w-full max-w-4xl space-y-6">
            {/* ✅ Stock Value Section (same as AdminDashboard.tsx) */}
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">{t('userDashboard.stockValue')}</h3>
              <p className="text-xl text-blue-600 font-bold">${stockValue.toFixed(2)}</p>
            </div>

            {/* ✅ Low Stock Products Section (same as AdminDashboard.tsx) */}
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">{t('userDashboard.lowStock')}</h3>
              {lowStockProducts.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {lowStockProducts.map((product) => (
                    <li key={product.id} className="p-2 bg-gray-100 border rounded">
                      {product.name} ({t('quantity')}: {product.quantity})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">{t('userDashboard.sufficientStock')}</p>
              )}
            </div>
          </div>
        )}

        {/* ✅ Buttons moved below Stock Information */}
        <div className="mt-8">
          <Buttons hideAdminButtons={true} />
        </div>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
        <p className="text-sm text-gray-600">{t('footer.developer')}</p>
      </footer>
    </div>
  );
};

export default UserDashboard;
