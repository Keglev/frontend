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
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => navigate('/add-product')}
          >
            {t('buttons.addProduct')}
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={() => navigate('/delete-product')}
          >
            {t('buttons.deleteProduct')}
          </button>
        </>
      )}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => navigate('/search-product')}
      >
        {t('buttons.searchProduct')}
      </button>
      <button
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        onClick={() => navigate('/list-stock')}
      >
        {t('buttons.listStock')}
      </button>
    </div>
  );
};

export default Buttons;
