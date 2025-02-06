import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ButtonsProps {
  hideAdminButtons?: boolean;
}

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
