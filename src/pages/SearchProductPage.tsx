import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductService from "../services/ProductOperations";
import { Product } from "../types/Product"; // Import Product type
import "../styles/searchProduct.css";

const SearchProductPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>([]); // Specify the type
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSearch = async (term: string) => {
    try {
      const response = await ProductService.searchProductsByName(term);
      if (response.length === 0) {
        setMessage("No products found.");
      } else {
        setMessage("");
        setProducts(response);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setMessage("Failed to fetch products. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 3) {
      handleSearch(value);
    } else {
      setProducts([]);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Header */}
      <header className="w-full bg-blue-500 text-white p-4">
        <div className="flex justify-between items-center">
          <button
            className="text-white font-semibold"
            onClick={() => navigate("/admin")}
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">Search Products</h1>
        </div>
      </header>

      {/* Content */}
      <div className="w-96 bg-white p-6 shadow-md rounded mt-6">
        <h2 className="text-lg font-bold mb-4">Search for a Product</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Start typing product name..."
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
        {message && <p className="mt-4 text-red-500">{message}</p>}

        <ul className="mt-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="p-2 bg-gray-200 rounded mb-2 hover:bg-gray-300 cursor-pointer"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );
};

export default SearchProductPage;
