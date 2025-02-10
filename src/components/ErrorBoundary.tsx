// src/components/ErrorBoundary.tsx
// This component acts as a global error boundary to catch and display unexpected errors in the application.

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Define the expected props for the ErrorBoundary component
interface ErrorBoundaryProps {
  children: React.ReactNode; // The child components wrapped inside the error boundary
}

/**
 * ErrorBoundary Component - Captures and displays unexpected errors in the application.
 * 
 * This component listens for global JavaScript errors and unhandled promise rejections,
 * ensuring the application can handle errors gracefully and provide user-friendly feedback.
 * 
 * @param {React.ReactNode} children - The child components wrapped inside the boundary.
 * @returns {JSX.Element} - A fallback UI if an error occurs, otherwise renders children.
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [hasError, setHasError] = useState(false); // Tracks whether an error has occurred
  const [error, setError] = useState<Error | null>(null); // Stores the error details
  const { t } = useTranslation(); // Hook for internationalization (i18n)

  useEffect(() => {
    /**
     * Handles captured errors and updates state accordingly.
     * Logs the error to the console for debugging.
     *
     * @param {Error} error - The error object thrown.
     */
    const handleError = (error: Error) => {
      setHasError(true);
      setError(error);
      console.error('Error caught by ErrorBoundary:', error);
    };

    // Attach global error event listeners
    window.addEventListener('error', (event) => handleError(event.error));
    window.addEventListener('unhandledrejection', (event) => handleError(event.reason));

    return () => {
      //  Cleanup event listeners when the component unmounts
      window.removeEventListener('error', (event) => handleError(event.error));
      window.removeEventListener('unhandledrejection', (event) => handleError(event.reason));
    };
  }, []);

  //  If an error occurs, display a user-friendly error message with a reload option
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-red-500">
        <h1 className="text-3xl font-bold">{t('errorBoundary.title')}</h1>
        <p className="mt-4">{error?.message}</p>

        {/* Reload button to allow the user to refresh and recover from the error */}
        <button
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          {t('errorBoundary.reloadButton')}
        </button>
      </div>
    );
  }

  // Render child components if no error occurs
  return <>{children}</>;
};

// Export the component for use in wrapping other parts of the application
export default ErrorBoundary;
