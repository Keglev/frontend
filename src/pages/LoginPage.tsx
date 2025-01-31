import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import SkeletonLoader from '../components/SkeletonLoader';
import axios from 'axios';
import '../styles/login.css';
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">{t('login.title')}</h1>
        <div className="flex flex-col w-64 bg-white p-6 rounded-lg shadow-md">
          <label htmlFor="username" className="text-sm font-medium mb-2">{t('login.username')}</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <label htmlFor="password" className="text-sm font-medium mb-2">{t('login.password')}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 mb-6 border rounded focus:outline-none focus:ring focus:ring-blue-300"
            required
            autoComplete="current-password"
          />
          {loading ? (
            <SkeletonLoader />
          ) : (
            <button
              onClick={handleLogin}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
