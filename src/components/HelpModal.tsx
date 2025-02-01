import React from 'react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageKey: string;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, pageKey }) => {
  const { t } = useTranslation('help'); // ✅ Load only the "help" namespace

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold">
          {t(`${pageKey}.title`)} {/* ✅ Corrected reference */}
        </h2>
        <p className="mt-2 text-gray-700">
          {t(`${pageKey}.content`)} {/* ✅ Corrected reference */}
        </p>

        {/* ✅ Fix Close Button Label */}
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('helpModal.closeButton')} {/* ✅ Ensures proper namespace reference */}
        </button>
      </div>
    </div>
  );
};

export default HelpModal;
