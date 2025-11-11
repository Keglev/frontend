/**
 * @file ErrorBoundary.tsx
 * @description
 * Global error boundary component for catching and displaying application errors.
 *
 * **Features:**
 * - Catches unhandled JavaScript errors
 * - Catches unhandled promise rejections
 * - Displays user-friendly error messages
 * - Provides reload button for recovery
 * - Logs errors to console for debugging
 *
 * **Error Types Handled:**
 * - Runtime JavaScript errors
 * - Promise rejection errors
 * - Component render errors (indirectly)
 *
 * @component
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ErrorBoundary component props
 * @interface ErrorBoundaryProps
 */
interface ErrorBoundaryProps {
  /** Child components to protect */
  children: React.ReactNode;
}

/**
 * Error boundary component capturing global errors
 * @component
 * @param {ErrorBoundaryProps} props - Component props
 * @returns {JSX.Element} Fallback UI on error or children if safe
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation();

  // Attach error listeners for global error handling
  // Catches both synchronous errors and unhandled promise rejections
  useEffect(() => {
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      console.error('Error caught by ErrorBoundary:', error);
    };

    // 'error' event fires on synchronous runtime errors (e.g., undefined method calls)
    const errorHandler = (event: ErrorEvent) => handleError(event.error);
    
    // 'unhandledrejection' event fires for promises without .catch() or try/catch
    const rejectionHandler = (event: PromiseRejectionEvent) => handleError(event.reason);

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
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
