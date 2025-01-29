import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState(t('header.defaultTitle'));

  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
      localStorage.setItem('language', lng);
    }
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }

    const role = localStorage.getItem('role');
    if (role === 'ROLE_ADMIN') {
      setTitle(t('adminDashboard.title'));
    } else if (role === 'ROLE_USER') {
      setTitle(t('userDashboard.title'));
    } else {
      setTitle(t('header.defaultTitle'));
    }
  }, [i18n, t]); // ✅ **Now includes dependencies correctly**

  return (
    <header className="flex justify-between items-center bg-blue-500 text-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm">{t('header.subtitle')}</p>
      </div>
      <div className="flex items-center space-x-4">
        {!isLoggedIn && (
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-200"
              onClick={() => changeLanguage('en')}
            >
              🇬🇧 English
            </button>
            <button
              className="px-4 py-2 bg-gray-100 text-black rounded hover:bg-gray-200"
              onClick={() => changeLanguage('de')}
            >
              🇩🇪 Deutsch
            </button>
          </div>
        )}

        {isLoggedIn && onLogout && (
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t('header.logout')}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
