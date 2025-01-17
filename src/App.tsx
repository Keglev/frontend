import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AddProductPage from './pages/AddProductPage';
import SearchProductPage from './pages/SearchProductPage';

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
        <Route path="/search-products" element={<SearchProductPage />} />
      </Routes>
    </Router>
  );
};

export default App;

