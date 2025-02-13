// src/components/SkeletonLoader.tsx
// This component provides a loading animation while fetching data or processing user actions.
// It displays a temporary "Loading..." message that disappears after a set duration.

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SkeletonLoader: React.FC = () => {
  const { t } = useTranslation(); // Load translations for "Loading..." message
  const [isVisible, setIsVisible] = useState(true); // State to control visibility of the loader

  useEffect(() => {
    // Automatically hide the skeleton loader after a delay (8 seconds)
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 8000); // Adjust timing if necessary (1000ms = 8 seconds)

    // Cleanup function to clear the timeout if the component unmounts early
    return () => clearTimeout(timeout);
  }, []);

  // If the loader has completed its duration, remove it from the UI
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

