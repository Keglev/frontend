import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AddProductPage from './pages/AddProductPage';
import SearchProductPage from './pages/SearchProductPage';
import ChangeProductDetailsPage from './pages/ChangeProductDetailsPage';
import DeleteProductPage from './pages/DeleteProductPage';
import ListStockPage from './pages/ListStockPage';
import UserDashboard from './pages/UserDashboard';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          {/* Redirect root URL to HomePage */}
          <Route path="/" element={<HomePage />} />

          {/* Login Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/delete-product" element={<DeleteProductPage />} />

          {/* User Routes */}
          <Route path="/user" element={<UserDashboard />} />

          {/* Inside <Routes> */}
          <Route path="/search-product" element={<SearchProductPage />} />
          <Route path="/product/:productId/edit" element={<ChangeProductDetailsPage />} />
          
          <Route path="/list-stock" element={<ListStockPage />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
};

export default App;

