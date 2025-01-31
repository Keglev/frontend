import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HelpModal from '../components/HelpModal';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState(t('header.defaultTitle'));
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // ✅ **Keeps the logic for dynamically determining the Help Section**
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

  // ✅ **Keeps Role-Based Title Updates**
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

  // ✅ **Keeps the fix for language not updating after logout**
  const changeLanguage = (lng: string) => {
    localStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
    window.location.reload(); // ✅ Ensures immediate language update
  };

  // ✅ **Determine Button Label & Action (Dashboard vs Logout)**
  const isDashboard = location.pathname === '/admin' || location.pathname === '/user';
  const buttonLabel = isDashboard ? t('header.logout') : t('header.returnToDashboard');

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
        {/* ✅ Language Selection (Keeps Fix for Logout Language Issue) */}
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

        {/* ✅ Help Button - Now Appears on All Pages */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          key={i18n.language} // ✅ Forces re-render when language changes
        >
          {t('help.button')}
        </button>

        {/* ✅ "Logout" (on Dashboard) OR "Return to Dashboard" (on Other Pages) */}
        {isLoggedIn && (
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t(buttonLabel)}
          </button>
        )}
      </div>

      {/* ✅ Help Modal (Ensures Correct PageKey is Passed) */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey={getPageKey()} />
    </header>
  );

  return (
    <header className="flex justify-between items-center bg-blue-500 text-white px-6 py-4">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm">{t('header.subtitle')}</p>
      </div>
      <div className="flex items-center space-x-4">
        {/* ✅ Language Selection (Keeps Fix for Logout Language Issue) */}
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

        {/* ✅ Help Button - Now Appears on All Pages */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          key={i18n.language} // ✅ Forces re-render when language changes
        >
          {t('help.button')}
        </button>

        {/* ✅ "Logout" (on Dashboard) OR "Return to Dashboard" (on Other Pages) */}
        {isLoggedIn && (
          <button
            onClick={handleButtonClick}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t(buttonLabel)}
          </button>
        )}
      </div>

      {/* ✅ Help Modal (Ensures Correct PageKey is Passed) */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} pageKey={getPageKey()} />
    </header>
  );
};

export default Header;
