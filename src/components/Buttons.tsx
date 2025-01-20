import React from 'react';
import { useNavigate } from 'react-router-dom';

const Buttons: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-4">
      <button
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={() => navigate('/add-product')}
      >
        Add Product
      </button>
      <button
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        onClick={() => navigate('/delete-product')} // Placeholder, if applicable
      >
        Delete Product
      </button>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => navigate('/search-product')}
      >
        Search Product
      </button>
      <button
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        onClick={() => navigate('/list-stock')}
      >
        List Stock
      </button>
    </div>
  );
};

export default Buttons;
