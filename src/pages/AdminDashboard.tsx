import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLogic from '../logic/DashboardLogic';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const [stockValue, setStockValue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<{ id: number; name: string; quantity: number; price: number }[]>([]);
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await DashboardLogic.fetchDashboardData();
        setStockValue(response.stockValue);
        setLowStockProducts(response.lowStock || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, [t]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 relative">
      <Header isLoggedIn={true} onLogout={() => { localStorage.clear(); navigate('/login'); }} />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <button onClick={() => setIsHelpOpen(true)} className="dashboard-button button-help" key={i18n.language}>
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="adminDashboard" />
        </div>
      )}

      <div className="flex flex-row p-6 space-x-6">
        <Sidebar stockValue={stockValue} lowStockProducts={lowStockProducts} />
        
          <div className="flex-1 bg-white shadow p-6 rounded min-h-[500px] flex flex-col">
            <h3 className="text-lg font-semibold">{t('adminDashboard.stockComparison')}</h3>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lowStockProducts.map(product => ({
                  name: product.name,
                  value: ((product.price * product.quantity) / stockValue) * 100, // Percentage of total stock value
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
