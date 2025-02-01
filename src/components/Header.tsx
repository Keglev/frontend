import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn }) => {
  const { t, i18n } = useTranslation(['translation', 'help']); // ✅ Ensure both namespaces are loaded
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState(t('header.defaultTitle'));
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng); // ✅ Ensure re-render on language change
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const getPageKey = () => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return 'adminDashboard';
    if (path.startsWith('/user')) return 'userDashboard';
    if (path.startsWith('/login')) return 'login';
    if (path.startsWith('/add-product')) return 'addProduct';
    if (path.startsWith('/delete-product')) return 'deleteProduct';
    if (path.startsWith('/product/')) return 'changeProduct';
    if (path.startsWith('/list-stock')) return 'listStock';
    if (path.startsWith('/search-product')) return 'searchProduct';
    return 'default';
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
  }, [i18n, i18n.language, t]);

  const changeLanguage = (lng: string) => {
    localStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
  };

  const isDashboard = location.pathname === '/admin' || location.pathname === '/user';
  const buttonLabel = isDashboard ? t('header.logout') : t(`${getPageKey()}.backToDashboard`);

  const handleButtonClick = () => {
    if (isDashboard) {
      localStorage.clear();
      navigate('/login', { replace: true });
    } else {
      const role = localStorage.getItem('role');
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    }
  };

  return (
    <header className="flex justify-between items-center bg-blue-500 text-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm">{t('header.subtitle')}</p>
      </div>
      <div className="flex items-center space-x-4">
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

        {/* ✅ Fix: Ensure Help Button Translates Correctly */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          key={currentLang} // ✅ Ensures translation updates
        >
          {t('help.button')} {/* ✅ Corrected reference */}
        </button>

        {isLoggedIn && (
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t(buttonLabel)}
          </button>
        )}
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey={getPageKey()} />
    </header>
  );
};

export default Header;
