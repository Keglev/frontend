import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, isLoggedIn, onLogout }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="flex justify-between items-center bg-blue-500 text-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm">{t('header.subtitle')}</p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Language Selection Buttons - Visible only when not logged in */}
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

        {/* Logout Button - Visible only when logged in */}
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
