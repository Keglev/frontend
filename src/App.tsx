/**
 * @file App.tsx
 * @description
 * Root application component that configures routing and internationalization.
 *
 * **Architecture:**
 * - Sets up the I18nextProvider for multi-language support
 * - Configures React Router with all application routes
 * - Provides a centralized routing configuration point
 *
 * **Routes Structure:**
 * - Home: `/` - Landing page
 * - Auth: `/login` - User authentication
 * - Admin: `/admin`, `/add-product`, `/delete-product` - Admin-only features
 * - User: `/user` - User dashboard
 * - Products: `/search-product`, `/list-stock`, `/product/:id/edit` - Product management
 *
 * **Responsibilities:**
 * - Route configuration and matching
 * - Internationalization context provision
 * - Application-wide provider setup
 *
 * @component
 * @returns {JSX.Element} Root application element with routing
 */

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import i18n from './i18n';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AddProductPage from './pages/AddProductPage';
import DeleteProductPage from './pages/DeleteProductPage';
import SearchProductPage from './pages/SearchProductPage';
import ChangeProductDetailsPage from './pages/ChangeProductDetailsPage';
import ListStockPage from './pages/ListStockPage';

/**
 * App Component
 * Wraps the application with I18n provider and configures all routes
 */
const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/add-product" element={<AddProductPage />} />
          <Route path="/delete-product" element={<DeleteProductPage />} />
          <Route path="/search-product" element={<SearchProductPage />} />
          <Route path="/list-stock" element={<ListStockPage />} />
          <Route path="/product/:productId/edit" element={<ChangeProductDetailsPage />} />
        </Routes>
      </Router>
    </I18nextProvider>
  );
};

export default App;
