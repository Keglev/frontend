import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductService from '../api/ProductService';

const SearchProductPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; quantity?: number; price?: number; totalValue?: number } | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedProduct(null); // Clear selected product when the query changes

    if (query.length >= 3) {
      try {
        const results = await ProductService.searchProductsByName(query);
        
        // Handle 204 No Content (results might be an empty object or array)
        if (!results || (Array.isArray(results) && results.length === 0)) {
          setProducts([]); // No products found
        } else {
          setProducts(results); // Update with found products
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]); // Clear products list on error
      }
    } else {
      setProducts([]); // Clear product list for queries shorter than 3 characters
    }
  };

  const handleProductClick = async (productId: number) => {
    try {
      const productDetails = await ProductService.getProductById(productId); // Fetch product details by ID
      setSelectedProduct(productDetails);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <header className="w-full bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Search Products</h1>
        <button
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded"
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </button>
      </header>

      <main className="flex flex-col items-center w-full max-w-2xl p-4 mt-6 bg-white shadow rounded">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Find Your Products</h2>

        <div className="w-full flex flex-col gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
          />

          {/* Product List or No Results Message */}
          {searchQuery.length >= 3 && (
            products.length > 0 ? (
              <ul className="w-full mt-4 space-y-2">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="p-2 bg-gray-100 border rounded hover:bg-gray-200 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center mt-4">Product not found. Please try again.</p>
            )
          )}

          {/* Product Details */}
          {selectedProduct && (
            <div className="mt-6 p-4 bg-gray-100 border rounded shadow-md">
              <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
              <p className="text-gray-700">Quantity: {selectedProduct.quantity}</p>
              <p className="text-gray-700">Price: ${selectedProduct.price?.toFixed(2)}</p>
              <p className="text-gray-700">Total Value: ${selectedProduct.totalValue?.toFixed(2)}</p>

              <div className="mt-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => navigate(`/product/${selectedProduct.id}/edit`)}
                >
                  Edit {selectedProduct.name}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full bg-gray-200 text-center py-4 mt-6">
        <p className="text-sm text-gray-600">© 2025 StockEase. All rights reserved.</p>
        <p className="text-sm text-gray-600">Developed by Carlos Keglevich</p>
      </footer>
    </div>
  );

};

export default SearchProductPage;
