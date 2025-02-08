import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import SkeletonLoader from '../components/SkeletonLoader';
import axios from 'axios';
import '../styles/login.css'; // ✅ Import Login Styles
import '../styles/tailwindCustom.css'; // ✅ Import Global Tailwind Styles
import ErrorBoundary from '../components/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import HelpModal from '../components/HelpModal';
import Footer from '../components/Footer';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role) {
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    }
  }, [navigate]);

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

      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

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
      {/* ✅ Ensure Header does NOT include "Back to Dashboard" button */}
      <Header isLoggedIn={false} hideBackButton={true} />

      {/* ✅ Help Button - Positioned in the Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="dashboard-button button-help"
          key={i18n.language}
        >
          {t('button', { ns: 'help' })}
        </button>
      </div>

      {/* ✅ Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey="login" />

      <div className="login-container">
        <h1 className="login-header">{t('login.title')}</h1>

        <div className="login-box w-64">
          <label htmlFor="username" className="text-sm font-medium mb-2">{t('login.username')}</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />

          <label htmlFor="password" className="text-sm font-medium mb-2">{t('login.password')}</label>
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
              {/* ✅ Login Button */}
              <button onClick={handleLogin} className="login-button mt-4">
                {t('login.button')}
              </button>

              {/* ✅ Back to Home Button */}
              <button
                onClick={() => navigate('/')}
                className="button-secondary mt-4"
              >
                {t('login.backToHome')}
              </button>
            </>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
        {/* ✅ Footer - Same as Other Pages */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default LoginPage;
