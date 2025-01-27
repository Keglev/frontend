import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      console.error('Error caught by ErrorBoundary:', error);
    };

    window.addEventListener('error', (event) => handleError(event.error));
    window.addEventListener('unhandledrejection', (event) => handleError(event.reason));

    return () => {
      window.removeEventListener('error', (event) => handleError(event.error));
      window.removeEventListener('unhandledrejection', (event) => handleError(event.reason));
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-500">
        <h1 className="text-3xl font-bold">{t('errorBoundary.title')}</h1>
        <p className="mt-4">{error?.message}</p>
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          {t('errorBoundary.reloadButton')}
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
