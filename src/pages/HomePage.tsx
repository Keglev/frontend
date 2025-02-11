import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/tailwindCustom.css';

/**
 * HomePage Component
 * 
 * This page serves as the landing page of the application.
 * 
 * Features:
 * - Displays an introduction to StockEase.
 * - Provides key information on inventory management.
 * - Includes a login button to access the system.
 * - Supports multiple languages.
 */
const HomePage: React.FC = () => {
  const { t } = useTranslation(); // Internationalization hook
  const navigate = useNavigate(); // Navigation hook

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header component with language selection options */}
      <Header isLoggedIn={false} />

      {/* Main content section */}
      <main className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="max-w-2xl text-center bg-white shadow-lg p-8 rounded-lg dark:bg-gray-800 dark:text-white">
          {/* Page title */}
          <h1 className="text-3xl font-bold mb-4">{t('home.title')}</h1>

          {/* Bullet point list with project details */}
          <div className="text-lg text-gray-700 text-justify mb-6 space-y-2 dark:text-gray-300">
            <ul className="list-disc list-inside">
              <li>{t('home.point1')}</li>
              <li>{t('home.point2')}</li>
              <li>{t('home.point3')}</li>
              <li>{t('home.point4')}</li>
              <li>{t('home.point5')}</li>
            </ul>
          </div>

          {/* Button to navigate to the login page */}
          <button
            className="button-primary px-6 py-3 text-lg min-w-[180px] max-w-{240px]"
            onClick={() => navigate('/login')}
          >
            {t('home.loginButton')}
          </button>
        </div>
      </main>

      {/* Footer component for page consistency */}
      <Footer />
    </div>
  );
};

export default HomePage;
