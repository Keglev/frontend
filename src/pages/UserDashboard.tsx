import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Buttons from '../components/Buttons';
import { useTranslation } from 'react-i18next';

const UserDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') {
      setWelcomeMessage(t('adminDashboard.welcome'));
    } else {
      setWelcomeMessage(t('userDashboard.welcome'));
    }
  }, [t]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header
        isLoggedIn={true}
        onLogout={() => {
          localStorage.clear();
          navigate('/login');
        }}
      />
      <main className="flex-grow flex flex-col items-center p-6">
        <h2 className="text-2xl font-semibold mb-4">{welcomeMessage}</h2>
        <p className="text-lg text-gray-700 mb-8">{t('userDashboard.subtitle')}</p>
        <Buttons hideAdminButtons={true} />
      </main>
      <footer className="w-full bg-gray-200 text-center py-4">
        <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
        <p className="text-sm text-gray-600">{t('footer.developer')}</p>
      </footer>
    </div>
  );
};

export default UserDashboard;
