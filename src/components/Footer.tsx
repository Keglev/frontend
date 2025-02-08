import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa'; // ✅ Import icons
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-gray-200 text-center py-4 mt-6">
      <p className="text-sm text-gray-600">© 2025 StockEase. {t('footer.rights')}</p>
      
      {/* ✅ Social Links Section */}
      <div className="flex justify-center space-x-6 mt-2">
        <a 
          href="https://github.com/Keglev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-gray-700 hover:text-black transition-all duration-200"
        >
          <FaGithub size={20} /> <span>GitHub</span>
        </a>

        <a 
          href="https://linkedin.com/in/carloskeglevich"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-all duration-200"
        >
          <FaLinkedin size={20} /> <span>LinkedIn</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;

