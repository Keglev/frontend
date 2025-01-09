import React from 'react';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, description, price }) => {
  return (
    <div className="p-4 border rounded shadow-sm hover:shadow-lg transition">
      <h2 className="text-lg font-bold">{name}</h2>
      <p className="text-gray-600">{description}</p>
      <p className="text-blue-500 font-semibold">€{price}</p>
    </div>
  );
};

export default ProductCard;
