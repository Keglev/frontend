import React from 'react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageKey: string;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, pageKey }) => {
  const { t } = useTranslation('help'); // Load translations from help_en.json or help_de.json

  if (!isOpen) return null; // Do not render if the modal is closed

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
        <h2 className="text-xl font-bold mb-4">{t(`${pageKey}.title`)}</h2>
        <p className="text-gray-700">{t(`${pageKey}.content`)}</p>
        
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {t('help.closeButton')}
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
