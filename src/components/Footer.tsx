import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer-container w-full text-center py-4 mt-6 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-white">
      <p className="text-sm">© 2025 StockEase. {t('footer.rights')}</p>

      {/* ✅ Social Links */}
      <div className="flex justify-center space-x-6 mt-2">
        <a
          href="https://github.com/Keglev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-gray-700 hover:text-black transition-all duration-200 dark:text-white dark:hover:text-yellow-400"
        >
          <FaGithub size={20} /> <span>GitHub</span>
        </a>

        <a
          href="https://linkedin.com/in/carloskeglevich"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-all duration-200 dark:text-white dark:hover:text-yellow-400"
        >
          <FaLinkedin size={20} /> <span>LinkedIn</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;

