// src/components/Buttons.tsx
// This component renders a set of navigation buttons for managing product-related actions in the admin dashboard.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Define the expected props for the Buttons component
interface ButtonsProps {
  hideAdminButtons?: boolean; // If true, hides admin-specific buttons (Add & Delete Product)
}

/**
 * Buttons Component - Provides navigation buttons for product-related actions.
 * 
 * @param {boolean} hideAdminButtons - Determines whether admin-only buttons (Add & Delete Product) should be displayed.
 * @returns {JSX.Element} - A set of buttons for product management actions.
 */
const Buttons: React.FC<ButtonsProps> = ({ hideAdminButtons = false }) => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { t } = useTranslation(); // Hook for internationalization (i18n)

  return (
    <div className="flex flex-wrap gap-4">
      {/* Render admin-specific buttons only if hideAdminButtons is false */}
      {!hideAdminButtons && (
        <>
          {/* Button: Navigate to Add Product Page */}
          <button
            className="dashboard-button button-add"
            onClick={() => navigate('/add-product')}
          >
            {t('buttons.addProduct')}
          </button>

          {/* Button: Navigate to Delete Product Page */}
          <button
            className="dashboard-button button-delete"
            onClick={() => navigate('/delete-product')}
          >
            {t('buttons.deleteProduct')}
          </button>
        </>
      )}

      {/* Button: Navigate to Search Product Page */}
      <button
        className="dashboard-button button-search"
        onClick={() => navigate('/search-product')}
      >
        {t('buttons.searchProduct')}
      </button>

      {/* Button: Navigate to List Stock Page */}
      <button
        className="dashboard-button button-stock"
        onClick={() => navigate('/list-stock')}
      >
        {t('buttons.listStock')}
      </button>
    </div>
  );
};

// Export the component for use in other parts of the application
export default Buttons;
