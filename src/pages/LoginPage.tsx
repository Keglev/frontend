// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import SkeletonLoader from '../components/SkeletonLoader';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorCard, setShowErrorCard] = useState(false); // Track error card visibility
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    setShowErrorCard(false); // Reset error card

    try {
      const { token, role } = await login(username, password);

      // Store credentials in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      // Redirect based on the role
      if (role === 'ROLE_ADMIN') {
        navigate('/admin-dashboard');
      } else if (role === 'ROLE_USER') {
        navigate('/user-dashboard');
      } else {
        throw new Error('Unknown role received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      setShowErrorCard(true); // Show the error card
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {showErrorCard ? (
        <div className="bg-red-100 text-red-800 p-6 rounded shadow-md text-center">
          <p className="font-semibold mb-4">Invalid username or password</p>
          <button
            onClick={() => setShowErrorCard(false)} // Close card and return to login form
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Return to Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-64">
          <h1 className="text-2xl font-bold mb-6">Login</h1>
          <label htmlFor="username" className="text-sm font-medium mb-2">
            Username
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
            Password
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
              LOGIN
            </button>
          )}
          <button
            onClick={() => alert('Admin: admin/admin123\nUser: user/user123')}
            className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Help
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default LoginPage;
