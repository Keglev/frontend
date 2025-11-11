/**
 * @file SkeletonLoader.tsx
 * @description
 * Loading spinner component displayed during data fetching operations.
 *
 * **Behavior:**
 * - Shows loading message for 10 seconds maximum
 * - Auto-hides after duration expires
 * - Supports light and dark modes
 * - Responsive full-screen overlay
 *
 * @component
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Skeleton loading component with auto-hide timeout
 * @component
 * @returns {JSX.Element|null} Loading overlay or null if timeout expired
 */
const SkeletonLoader: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide loader after 10 seconds timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="skeleton-loader-container flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="skeleton-box p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <p className="skeleton-text text-lg font-semibold text-gray-700 dark:text-white">
          {t('loading')}
        </p>
      </div>
    </div>
  );
};

export default SkeletonLoader;

