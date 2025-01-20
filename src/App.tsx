import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AddProductPage from './pages/AddProductPage';
import SearchProductPage from './pages/SearchProductPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ChangeProductDetailsPage from './pages/ChangeProductDetailsPage';
import DeleteProductPage from './pages/DeleteProductPage';
import ListStockPage from './pages/ListStockPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect root URL to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-product" element={<AddProductPage />} />

        {/* Inside <Routes> */}
        <Route path="/search-product" element={<SearchProductPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/product/:productId/edit" element={<ChangeProductDetailsPage />} />
        <Route path="/delete-product" element={<DeleteProductPage />} />
        <Route path="/list-stock" element={<ListStockPage />} />
      </Routes>
    </Router>
  );
};

export default App;

