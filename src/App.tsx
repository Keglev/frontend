// src/App.tsx

/**
 * Root component of the application.
 * Configures internationalization (i18n) and sets up routing using React Router.
 */

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importing all application pages
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
    // Provides internationalization support for the entire application
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          {/* Default Route: Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/delete-product" element={<DeleteProductPage />} />

          {/* User Dashboard Route */}
          <Route path="/user" element={<UserDashboard />} />

          {/* Product Management Routes */}
          <Route path="/search-product" element={<SearchProductPage />} />
          <Route path="/product/:productId/edit" element={<ChangeProductDetailsPage />} />
          <Route path="/list-stock" element={<ListStockPage />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
};

export default App;
