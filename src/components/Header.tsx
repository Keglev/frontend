import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/header.css'; // ✅ Import custom styles

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
  hideBackButton?: boolean; // ✅ NEW PROP to hide the back button when needed
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout, hideBackButton = false }) => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');

  // 🔍 Determine the current page key for correct translation
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

  // 🌍 Update language and title when page changes
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
  }, [i18n, i18n.language, location.pathname, t]);

  // 🔄 Change Language
  const changeLanguage = (lng: string) => {
    localStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
  };

  // 🚀 Determine if we are on a Dashboard
  const isDashboard = location.pathname === '/admin' || location.pathname === '/user';
  const buttonLabel = isDashboard ? t('header.logout') : t(`${getPageKey()}.backToDashboard`);

  // 🏃‍♂️ Handle Logout or Navigation
  const handleButtonClick = () => {
    if (isDashboard) {
      if (onLogout) {
        onLogout();
      } else {
        localStorage.clear();
        navigate('/login', { replace: true });
      }
    } else {
      const role = localStorage.getItem('role');
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    }
  };

  return (
    <header className="header-container">
      <div>
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{t('header.subtitle')}</p>
      </div>
      <div className="header-buttons">
        {/* ✅ Language Buttons */}
        <button className="language-button" onClick={() => changeLanguage('en')}>
          🇬🇧 English
        </button>
        <button className="language-button" onClick={() => changeLanguage('de')}>
          🇩🇪 Deutsch
        </button>

        {/* ✅ Logout / Back Button - ONLY if `hideBackButton` is false */}
        {isLoggedIn && !hideBackButton && (
          <button onClick={handleButtonClick} className="logout-button">
            {buttonLabel}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
