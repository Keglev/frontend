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

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      <Header isLoggedIn={false} />
      <div className="login-container">
        <h1 className="login-header">{t('login.title')}</h1>

        {/* ✅ Apply 'login-box' class for shadow effect */}
        <div className="login-box w-64">
          <label htmlFor="username" className="text-sm font-medium mb-2">{t('login.username')}</label>
          {/* ✅ Apply 'login-input' class (linked to global 'input-field') */}
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            required
          />

          <label htmlFor="password" className="text-sm font-medium mb-2">{t('login.password')}</label>
          {/* ✅ Apply 'login-input' class (linked to global 'input-field') */}
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
            autoComplete="current-password"
          />

          {loading ? (
            <SkeletonLoader />
          ) : (
            // ✅ Apply 'login-button' class (linked to global 'button-primary')
            <button
              onClick={handleLogin}
              className="login-button"
            >
              {t('login.button')}
            </button>
          )}

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LoginPage;
