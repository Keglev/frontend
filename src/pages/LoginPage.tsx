import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import SkeletonLoader from '../components/SkeletonLoader';
import axios, { AxiosError } from 'axios';
import '../styles/login.css';
import ErrorBoundary from '../components/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header'; // Add the Header

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // New State for login
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      console.warn('Validation Error: Fields are empty');
      setError(t('login.error.emptyFields')); // Translated error
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Initiating login request...');
      const response = await login(username, password);
      console.log('Login API Response:', response);

      const role = response.role;
      console.log('User Role:', role);

      localStorage.setItem('token', response.token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      setIsLoggedIn(true); // Update login state
      console.log('User authenticated successfully. Navigating to dashboard...');
      setTimeout(() => {
        if (role === 'ROLE_ADMIN') {
          navigate('/admin');
        } else if (role === 'ROLE_USER') {
          navigate('/user');
        } else {
          throw new Error('Unexpected role');
        }
      }, 1500);
    } catch (err) {
      setLoading(false);

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<{ message: string }>;
        console.error('Axios Error:', axiosError.response?.data?.message || axiosError.message);
        if (axiosError.response?.status === 401) {
          setError(t('login.error.invalidCredentials')); // Translated error
        } else {
          setError(t('login.error.unexpectedError')); // Translated error
        }
      } else {
        console.error('Unexpected Error:', err);
        setError(t('login.error.unexpectedError')); // Translated error
      }
    }
  };

  return (
    <ErrorBoundary>
      <Header
        title={t('login.title')}
        isLoggedIn={isLoggedIn}
        onLogout={() => {
          localStorage.clear();
          setIsLoggedIn(false); // Reset login state
          navigate('/login');
        }}
      />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">{t('login.title')}</h1>
        <div className="flex flex-col w-64">
          <label htmlFor="username" className="text-sm font-medium mb-2">
            {t('login.username')}
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300"
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
