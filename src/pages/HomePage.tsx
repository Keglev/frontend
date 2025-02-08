import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/tailwindCustom.css';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ✅ Use Header with Language Buttons Only */}
      <Header isLoggedIn={false} />

      {/* ✅ Main Content */}
      <main className="flex flex-col items-center justify-center flex-grow p-6">
        <div className="max-w-2xl text-center bg-white shadow-lg p-8 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">{t('home.title')}</h1>
          
          {/* ✅ Justify text & Add Bullet Points */}
          <div className="text-lg text-gray-700 text-justify mb-6 space-y-2">
            <ul className="list-disc list-inside">
              <li>{t('home.point1')}</li>
              <li>{t('home.point2')}</li>
              <li>{t('home.point3')}</li>
              <li>{t('home.point4')}</li>
              <li>{t('home.point5')}</li>
            </ul>
          </div>
          
          {/* ✅ Login Button */}
          <button
            className="button-primary px-6 py-3 text-lg min-w-[180px] max-w-{240px]"
            onClick={() => navigate('/login')}
          >
            {t('home.loginButton')}
          </button>
        </div>
      </main>

      {/* ✅ Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
