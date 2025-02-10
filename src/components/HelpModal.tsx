// src/components/HelpModal.tsx
// This component renders a modal window that provides help content based on the current page.
// The modal content is dynamically loaded using internationalization (i18n) for multilingual support.

import React from 'react';
import { useTranslation } from 'react-i18next';

// Define props for the HelpModal component
interface HelpModalProps {
  isOpen: boolean; // Determines whether the modal is visible
  onClose: () => void; // Function to close the modal
  pageKey: string; // Key used to fetch the appropriate help content for the current page
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, pageKey }) => {
  const { t } = useTranslation('help'); // Load translations from the "help" namespace

  // If the modal is not open, return null to prevent rendering
  if (!isOpen) return null;

  // Retrieve the help content based on the provided page key and split it into lines for better formatting
  const content = t(`${pageKey}.content`).split('\n');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-full dark:bg-gray-800 dark:text-white">
        {/* Modal Title (Dynamically Loaded Based on Page Context) */}
        <h2 className="help-modal-title text-2xl font-semibold border-b pb-2 dark:text-white">
          {t(`${pageKey}.title`)}
        </h2>

        {/* Modal Content */}
        <div className="mt-4 text-gray-700 space-y-2 dark:text-gray-300">
          {content.map((line, index) => {
            if (line.startsWith('### ')) {
              return (
                <h3 key={index} className="text-lg font-bold mt-2 dark:text-white">
                  {line.replace('### ', '')}
                </h3>
              );
            } else if (line.startsWith('- ')) {
              return (
                <li key={index} className="list-disc ml-6 dark:text-gray-300">
                  {line.replace('- ', '')}
                </li>
              );
            } else {
              return <p key={index}>{line}</p>;
            }
          })}
        </div>

        {/* Close Button with Consistent Styling */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="button-secondary dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {t('helpModal.closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
