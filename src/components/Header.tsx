/**
 * @file Header.tsx
 * @description
 * Main application header with navigation, language, and theme controls.
 *
 * **Features:**
 * - Dynamic page titles based on user role
 * - Dark mode toggle with localStorage persistence
 * - Language switcher (English/Deutsch)
 * - Logout/back navigation button
 * - Responsive design with Tailwind CSS
 *
 * **Props:**
 * - `isLoggedIn` - User authentication state
 * - `onLogout` - Custom logout handler (optional)
 * - `hideBackButton` - Hide navigation/logout button
 *
 * @component
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import '../styles/header.css';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
  hideBackButton?: boolean;
}

/**
 * Application header component
 * @component
 * @param {HeaderProps} props - Component props
 * @returns {JSX.Element} Header with controls
 */
const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout, hideBackButton = false }) => {
  const { t, i18n } = useTranslation(['translation', 'help']);
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('darkMode') === 'enabled'
  );

  // Toggle dark mode and update document class
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode ? 'enabled' : 'disabled');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Apply dark mode on component mount/change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Change language and persist in localStorage
  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      localStorage.setItem('language', lng);
      i18n.changeLanguage(lng);
    }
  };

  // Map route to translation key
  const getPageKey = () => {
    const path = location.pathname;
    const pathMap: Record<string, string> = {
      '/admin': 'adminDashboard',
      '/user': 'userDashboard',
      '/login': 'login',
      '/add-product': 'addProduct',
      '/delete-product': 'deleteProduct',
      '/list-stock': 'listStock',
      '/search-product': 'searchProduct',
    };
    
    // Check exact matches first, then path prefixes for dynamic routes
    if (pathMap[path]) return pathMap[path];
    // Product edit route uses dynamic ID in path (e.g., /product/123/edit)
    if (path.startsWith('/product/')) return 'changeProduct';
    return 'default';
  };

  // Set title based on user role
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

  const isDashboard = location.pathname === '/admin' || location.pathname === '/user';
  const buttonLabel = isDashboard ? t('header.logout') : t(`${getPageKey()}.backToDashboard`);

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
        <button className="dark-mode-button" onClick={toggleDarkMode}>
          {darkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
        </button>

        <button className="language-button" onClick={() => changeLanguage('en')}>
          🇬🇧 English
        </button>
        <button className="language-button" onClick={() => changeLanguage('de')}>
          🇩🇪 Deutsch
        </button>

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
