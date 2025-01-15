import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import FillFieldsPage from './pages/FillFieldsPage';
import InvalidCredentialsPage from './pages/InvalidCredentialsPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Redirect root URL to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Define other routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/fill-fields" element={<FillFieldsPage />} />
          <Route path="/invalid-credentials" element={<InvalidCredentialsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
