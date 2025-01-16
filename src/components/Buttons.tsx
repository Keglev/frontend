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
        onClick={() => alert('Delete Product functionality coming soon!')}
      >
        Delete Product
      </button>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => alert('Search by ID functionality coming soon!')}
      >
        Search by ID
      </button>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => alert('Search by Name functionality coming soon!')}
      >
        Search by Name
      </button>
    </div>
  );
};

export default Buttons;

