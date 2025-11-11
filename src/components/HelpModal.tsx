/**
 * @file HelpModal.tsx
 * @description
 * Modal dialog providing contextual help content for application pages.
 *
 * **Features:**
 * - Dynamic help content based on page context
 * - Multi-language support via i18n
 * - Markdown-style formatting (headers, lists, paragraphs)
 * - Dark mode styling
 * - Responsive design
 *
 * **Props:**
 * - `isOpen` - Modal visibility
 * - `onClose` - Callback to close modal
 * - `pageKey` - Translation key for help content
 *
 * @component
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * HelpModal component props
 * @interface HelpModalProps
 */
interface HelpModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when close button is clicked */
  onClose: () => void;
  /** Translation key for help content */
  pageKey: string;
}

/**
 * Modal component for displaying contextual help
 * @component
 * @param {HelpModalProps} props - Component props
 * @returns {JSX.Element|null} Modal dialog or null if not open
 */
const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, pageKey }) => {
  const { t } = useTranslation('help');

  if (!isOpen) return null;

  // Parse help content and format as markdown-style elements
  // Supports headers (###), lists (-), and paragraphs
  const content = t(`${pageKey}.content`).split('\n');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-full dark:bg-gray-800 dark:text-white">
        <h2 className="help-modal-title text-2xl font-semibold border-b pb-2 dark:text-white">
          {t(`${pageKey}.title`)}
        </h2>

        <div className="mt-4 text-gray-700 space-y-2 dark:text-gray-300">
          {content.map((line, index) => {
            // Render level-3 headers with h3 styling
            if (line.startsWith('### ')) {
              return (
                <h3 key={index} className="text-lg font-bold mt-2 dark:text-white">
                  {line.replace('### ', '')}
                </h3>
              );
            // Render list items with bullet styling
            } else if (line.startsWith('- ')) {
              return (
                <li key={index} className="list-disc ml-6 dark:text-gray-300">
                  {line.replace('- ', '')}
                </li>
              );
            // Render plain text as paragraphs
            }
            return <p key={index}>{line}</p>;
          })}
        </div>

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
