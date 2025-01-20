import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Buttons from '../components/Buttons';
import DashboardLogic from '../logic/DashboardLogic';
import '../styles/adminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [stockValue, setStockValue] = useState<number>(0);
  const [lowStockProducts, setLowStockProducts] = useState<{ id: number; name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

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
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="w-full bg-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center p-6">
        <h2 className="text-2xl font-semibold mb-4">Welcome, Admin!</h2>
        <p className="text-lg text-gray-700 mb-8">Manage your products and stock efficiently.</p>

        {loading ? (
          <p className="text-gray-500">Loading dashboard data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="w-full max-w-4xl space-y-6">
            {/* Total Stock Value */}
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">Total Stock Value</h3>
              <p className="text-xl text-blue-600 font-bold">${stockValue.toFixed(2)}</p>
            </div>

            {/* Low Stock Products */}
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-semibold">Low Stock Products</h3>
              {lowStockProducts.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {lowStockProducts.map((product) => (
                    <li
                      key={product.id}
                      className="p-2 bg-gray-100 border rounded"
                    >
                      {product.name} (Quantity: {product.quantity})
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">All products are sufficiently stocked.</p>
              )}
            </div>
          </div>
        )}

        {/* Buttons for Admin Actions */}
        <div className="mt-8">
          <Buttons />
        </div>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
