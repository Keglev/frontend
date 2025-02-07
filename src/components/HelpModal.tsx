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

  // Split the content into an array for better readability
  const content = t(`${pageKey}.content`).split('\n');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-full">
        {/* ✅ Title */}
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">
          {t(`${pageKey}.title`)}
        </h2>

        {/* ✅ Content */}
        <div className="mt-4 text-gray-700 space-y-2">
          {content.map((line, index) => {
            if (line.startsWith('### ')) {
              return <h3 key={index} className="text-lg font-bold mt-2">{line.replace('### ', '')}</h3>;
            } else if (line.startsWith('- ')) {
              return <li key={index} className="list-disc ml-6">{line.replace('- ', '')}</li>;
            } else {
              return <p key={index}>{line}</p>;
            }
          })}
        </div>

        {/* ✅ Close Button with Consistent Style */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="button-secondary"
          >
            {t('helpModal.closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
