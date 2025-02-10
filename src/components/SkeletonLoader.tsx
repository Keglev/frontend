import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SkeletonLoader: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // ✅ Delay Skeleton Loader for 3 seconds before hiding it
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Adjust time as needed (3000ms = 3 seconds)

    return () => clearTimeout(timeout);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="skeleton-loader-container">
      <div className="skeleton-box">
        <p className="skeleton-text">{t('loading')}</p>
      </div>
    </div>
  );
};

export default SkeletonLoader;

