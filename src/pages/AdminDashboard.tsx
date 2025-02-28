import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLogic from '../logic/DashboardLogic';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * AdminDashboard Component
 *
 * This component provides an administrative dashboard for managing stock inventory.
 * It displays total stock value, low-stock products, and a bar chart showing the
 * contribution of low-stock products to the total stock value.
 * It includes a sidebar for inventory actions and a help modal for guidance.
 */

const AdminDashboard: React.FC = () => {
  // Initialize translation hook for multi-language support
  const { t, i18n } = useTranslation(['translation', 'help']);
  
  // State to store total stock value
  const [stockValue, setStockValue] = useState<number>(0);
  
  // State to store list of low stock products with name, quantity, and price
  const [lowStockProducts, setLowStockProducts] = useState<{ id: number; name: string; quantity: number; price: number }[]>([]);
  
  // Navigation hook for redirecting users
  const navigate = useNavigate();
  
  // State to control the visibility of the help modal
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Effect to ensure the selected language persists across sessions
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  // Fetch dashboard data from backend and update states
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
      {/* Header with Logout Button */}
      <Header isLoggedIn={true} onLogout={() => { localStorage.clear(); navigate('/login'); }} />

      {/* Help Button Positioned at the Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <button onClick={() => setIsHelpOpen(true)} className="dashboard-button button-help" key={i18n.language}>
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* Help Modal - Displays Help Content */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="adminDashboard" />
        </div>
      )}

      {/* Main Content Layout: Sidebar + Graph */}
      <div className="flex flex-row p-6 space-x-6">
        {/* Sidebar with Stock Information and Controls */}
        <Sidebar stockValue={stockValue} lowStockProducts={lowStockProducts} />
        
        {/* Main Graph Displaying Contribution of Low-Stock Products to Total Stock Value */}
        <div className="flex-1 bg-white shadow p-6 rounded min-h-[500px] flex flex-col">
          <h3 className="text-lg font-semibold">{t('adminDashboard.lowStockContribution')}</h3>
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
      
      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default AdminDashboard;
