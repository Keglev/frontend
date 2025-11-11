/**
 * @file LoginPage.tsx
 * @description
 * User authentication page with login form and credential validation.
 *
 * **Features:**
 * - Username and password input fields
 * - Login API integration with error handling
 * - Role-based dashboard redirection
 * - Loading states and error messages
 * - Help modal with contextual information
 * - Automatic redirect for already logged-in users
 *
 * **Authentication Flow:**
 * 1. Validate input fields (not empty)
 * 2. Send credentials to backend login API
 * 3. Store token and role in localStorage
 * 4. Redirect to admin or user dashboard based on role
 *
 * **Error Handling:**
 * - 401 Unauthorized: Invalid credentials
 * - Network errors: Unexpected error messages
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorBoundary from '../components/ErrorBoundary';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../styles/login.css';
import '../styles/tailwindCustom.css';

/**
 * Login page component
 * @component
 * @returns {JSX.Element} Login form with authentication
 */
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Redirect already logged-in users to appropriate dashboard
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    }
  }, [navigate]);

  /**
   * Handle login submission with validation and API call
   * Stores token/role in localStorage and redirects based on user role
   */
  const handleLogin = async () => {
    // Validate required fields are filled
    if (!username || !password) {
      setError(t('login.error.emptyFields'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await login(username, password);
      const { token, role } = response;

      // Persist authentication data for session management
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      // Redirect based on user role (admin or user dashboard)
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    } catch (err) {
      setLoading(false);
      // Differentiate between authentication failures and network errors
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.status === 401
            ? t('login.error.invalidCredentials')
            : t('login.error.unexpectedError')
        );
      } else {
        setError(t('login.error.unexpectedError'));
      }
    }
  };

  return (
    <ErrorBoundary>
      <Header isLoggedIn={false} hideBackButton={true} />

      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="login" />

      <div className="login-container">
        <h1 className="login-header">{t('login.title')}</h1>
        <p className="text-blue-500 mb-2">{t('login.defaultCredentials')}</p>

        <div className="login-box w-64">
          <label htmlFor="username" className="text-sm font-medium mb-2">
            {t('login.username')}
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />

          <label htmlFor="password" className="text-sm font-medium mb-2">
            {t('login.password')}
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input mb-4"
            required
            autoComplete="current-password"
          />

          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              <button onClick={handleLogin} className="login-button mt-4">
                {t('login.button')}
              </button>

              <button onClick={() => navigate('/')} className="button-secondary mt-4">
                {t('login.backToHome')}
              </button>
            </>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default LoginPage;
