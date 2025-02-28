import React from 'react';
import { useTranslation } from 'react-i18next';
import Buttons from './Buttons';

interface SidebarProps {
  stockValue: number;
  lowStockProducts: { id: number; name: string; quantity: number }[];
}

const Sidebar: React.FC<SidebarProps> = ({ stockValue, lowStockProducts }) => {
  const { t } = useTranslation();

  return (
    <aside className="w-2/5 bg-white shadow p-4 rounded flex flex-col space-y-6 min-h-[500px]">
      <div>
        <h3 className="text-lg font-semibold">{t('adminDashboard.stockValue')}</h3>
        <p className="text-xl text-blue-600 font-bold">${stockValue.toFixed(2)}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">{t('adminDashboard.lowStock')}</h3>
        {lowStockProducts.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {lowStockProducts.map((product) => (
              <li key={product.id} className="p-2 bg-gray-100 border rounded">
                {product.name} ({t('quantity')}: {product.quantity})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mt-2">{t('adminDashboard.sufficientStock')}</p>
        )}
      </div>
      <div className="mt-auto">
        <Buttons />
      </div>
    </aside>
  );
};

export default Sidebar;
