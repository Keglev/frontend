/**
 * @file HomePage.tsx
 * @description
 * Landing page for StockEase application.
 *
 * **Features:**
 * - Introduction to StockEase inventory management
 * - Key information about system capabilities
 * - Login button for authenticated access
 * - Multi-language support
 * - Dark mode support
 *
 * @component
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/tailwindCustom.css';

/**
 * Home page component
 * @component
 * @returns {JSX.Element} Landing page with introduction and login option
 */
const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header isLoggedIn={false} />

      <main className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="max-w-2xl text-center bg-white shadow-lg p-8 rounded-lg dark:bg-gray-800 dark:text-white">
          <h1 className="text-3xl font-bold mb-4">{t('home.title')}</h1>

          <div className="text-lg text-gray-700 text-justify mb-6 space-y-2 dark:text-gray-300">
            <ul className="list-disc list-inside">
              <li>{t('home.point1')}</li>
              <li>{t('home.point2')}</li>
              <li>{t('home.point3')}</li>
              <li>{t('home.point4')}</li>
              <li>{t('home.point5')}</li>
            </ul>
          </div>

          <button
            className="button-primary px-6 py-3 text-lg min-w-[180px] max-w-{240px]"
            onClick={() => navigate('/login')}
          >
            {t('home.loginButton')}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
