// src/components/Footer.tsx
// This component represents the footer of the application, containing copyright information and social media links.

import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; // Import social media icons
import { useTranslation } from 'react-i18next'; // Import translation hook

/**
 * Footer Component - Displays the application's footer with copyright notice and social media links.
 * 
 * The footer includes:
 * - A dynamic copyright message with internationalization (i18n)
 * - Links to the developer's GitHub and LinkedIn profiles
 * - Proper styling for light and dark modes
 * 
 * @returns {JSX.Element} - The footer component containing the copyright and social links.
 */
const Footer: React.FC = () => {
  const { t } = useTranslation(); // Access translation function for multi-language support

  return (
    <footer className="footer-container w-full text-center py-4 mt-6 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white">
      {/* Copyright Notice - Dynamically Translated */}
      <p className="text-sm">© 2025 StockEase. {t('footer.rights')}</p>

      {/* Social Media Links */}
      <div className="flex justify-center space-x-6 mt-2">
        {/* GitHub Link */}
        <a
          href="https://github.com/Keglev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-gray-700 hover:text-black transition-all duration-200 
            dark:text-white dark:hover:text-yellow-400"
        >
          <FaGithub size={20} /> <span>GitHub</span>
        </a>

        {/* LinkedIn Link */}
        <a
          href="https://linkedin.com/in/carloskeglevich"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-all duration-200 
            dark:text-white dark:hover:text-yellow-400"
        >
          <FaLinkedin size={20} /> <span>LinkedIn</span>
        </a>
      </div>
    </footer>
  );
};

// Export the Footer component for use in the application layout
export default Footer;
