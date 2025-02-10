// src/components/Header.tsx
// This component represents the application's main header, providing:
// - A dynamic title based on user role and page context
// - A dark mode toggle button
// - Language selection buttons
// - A logout/back navigation button (conditionally displayed)

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
import '../styles/header.css'; // Import custom styles for additional customization

// Define props for the Header component
interface HeaderProps {
  isLoggedIn: boolean; // Indicates whether the user is logged in
  onLogout?: () => void; // Optional function to handle user logout
  hideBackButton?: boolean; // If true, hides the back button
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLogout, hideBackButton = false }) => {
  const { t, i18n } = useTranslation(['translation', 'help']); // Multi-language support
  const location = useLocation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(
    localStorage.getItem('darkMode') === 'enabled'
  );

  // Toggle dark mode and update local storage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode ? 'enabled' : 'disabled');
    document.documentElement.classList.toggle('dark', newMode);
  };

  // Apply stored dark mode setting on page load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Change application language and persist selection in local storage
  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      localStorage.setItem('language', lng);
      i18n.changeLanguage(lng);
    }
  };

  // Determine the page key for translation purposes
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

  // Set page title based on user role or current location
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

  // Determine if the current page is a dashboard
  const isDashboard = location.pathname === '/admin' || location.pathname === '/user';
  const buttonLabel = isDashboard ? t('header.logout') : t(`${getPageKey()}.backToDashboard`);

  // Handle logout or navigate back to the dashboard
  const handleButtonClick = () => {
    if (isDashboard) {
      if (onLogout) {
        onLogout(); // Execute provided logout function
      } else {
        localStorage.clear(); // Clear session storage
        navigate('/login', { replace: true }); // Redirect to login page
      }
    } else {
      const role = localStorage.getItem('role');
      navigate(role === 'ROLE_ADMIN' ? '/admin' : '/user', { replace: true });
    }
  };

  return (
    <header className="header-container">
      <div>
        {/* Page Title and Subtitle */}
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{t('header.subtitle')}</p>
      </div>

      <div className="header-buttons">
        {/* Dark Mode Toggle Button */}
        <button className="dark-mode-button" onClick={toggleDarkMode}>
          {darkMode ? <FaMoon size={20} /> : <FaSun size={20} />}
        </button>

        {/* Language Selection Buttons */}
        <button className="language-button" onClick={() => changeLanguage('en')}>
          🇬🇧 English
        </button>
        <button className="language-button" onClick={() => changeLanguage('de')}>
          🇩🇪 Deutsch
        </button>

        {/* Logout / Back Button (only displayed when logged in and not explicitly hidden) */}
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
