/**
 * @file Buttons.tsx
 * @description
 * Navigation buttons component for product management actions.
 *
 * **Functionality:**
 * - Add Product - Navigates to product creation page
 * - Delete Product - Navigates to product deletion page (admin-only)
 * - Search Product - Navigates to product search page
 * - List Stock - Navigates to inventory listing page
 *
 * **Props:**
 * - `hideAdminButtons` - Controls visibility of admin-specific buttons
 *
 * @component
 * @example
 * const [hideAdmin, setHideAdmin] = useState(false);
 * return <Buttons hideAdminButtons={hideAdmin} />;
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Props for Buttons component
 * @interface ButtonsProps
 */
interface ButtonsProps {
  /** Hide admin-specific buttons (Add & Delete Product) */
  hideAdminButtons?: boolean;
}

/**
 * Navigation buttons for product-related actions
 * @component
 * @param {ButtonsProps} props - Component props
 * @returns {JSX.Element} Navigation button group
 */
const Buttons: React.FC<ButtonsProps> = ({ hideAdminButtons = false }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-4">
      {!hideAdminButtons && (
        <>
          <button
            className="dashboard-button button-add"
            onClick={() => navigate('/add-product')}
          >
            {t('buttons.addProduct')}
          </button>

          <button
            className="dashboard-button button-delete"
            onClick={() => navigate('/delete-product')}
          >
            {t('buttons.deleteProduct')}
          </button>
        </>
      )}

      <button
        className="dashboard-button button-search"
        onClick={() => navigate('/search-product')}
      >
        {t('buttons.searchProduct')}
      </button>

      <button
        className="dashboard-button button-stock"
        onClick={() => navigate('/list-stock')}
      >
        {t('buttons.listStock')}
      </button>
    </div>
  );
};

export default Buttons;
