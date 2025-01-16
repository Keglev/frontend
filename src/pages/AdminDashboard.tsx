import React from 'react';
import { useNavigate } from 'react-router-dom';
import Buttons from '../components/Buttons';
import '../styles/adminDashboard.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

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

      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-semibold mb-4">Welcome, Admin!</h2>
        <p className="text-lg text-gray-700 mb-8">Manage your products and stock efficiently.</p>

        {/* Buttons for Admin Actions */}
        <Buttons />

        {/* Instructions */}
        <p className="mt-8 text-gray-600 italic text-sm">
          Use the buttons above to add, delete, or search for products.
        </p>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
