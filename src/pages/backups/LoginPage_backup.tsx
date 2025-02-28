import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import SkeletonLoader from '../components/SkeletonLoader';
import axios from 'axios';
import '../styles/login.css'; 
import '../styles/tailwindCustom.css'; 
import ErrorBoundary from '../components/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';

/**
 * LoginPage Component
 *
 * This component handles user authentication, including:
 * - Input fields for username and password.
 * - Login logic with API request handling.
 * - Error messaging and loading states.
 * - Navigation logic to the appropriate dashboard based on user role.
 */
const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  /**
   * Redirects logged-in users to their respective dashboards.
   */
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    }
  }, [navigate]);

  /**
   * Handles user login by sending credentials to the backend.
   * If successful, stores the token and redirects the user.
   */
  const handleLogin = async () => {
    if (!username || !password) {
      setError(t('login.error.emptyFields'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await login(username, password);
      const { token, role } = response;

      // Store authentication data in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      // Redirect user based on role
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    } catch (err) {
      setLoading(false);
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
      {/* Header without the back button for the login page */}
      <Header isLoggedIn={false} hideBackButton={true} />

      {/* Help Button - Positioned at the top center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="login" />

      {/* Main Login Form Section */}
      <div className="login-container">
        <h1 className="login-header">{t('login.title')}</h1>

        <div className="login-box w-64">
          {/* Username Input */}
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

          {/* Password Input */}
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

          {/* Show loading indicator while processing login */}
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Login Button */}
              <button onClick={handleLogin} className="login-button mt-4">
                {t('login.button')}
              </button>

              {/* Back to Home Button */}
              <button
                onClick={() => navigate('/')}
                className="button-secondary mt-4"
              >
                {t('login.backToHome')}
              </button>
            </>
          )}

          {/* Display Error Messages */}
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* Footer Section */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default LoginPage;
