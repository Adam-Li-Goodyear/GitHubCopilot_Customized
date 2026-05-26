import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../api/config';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  sku: string;
  unit: string;
  supplierId: number;
  discount?: number;
}

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return data;
};

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { darkMode } = useTheme();
  const { data: allProducts, isLoading } = useQuery('products', fetchProducts);

  const wishlistProducts = allProducts?.filter(p => wishlist.includes(p.productId)) ?? [];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>
            My Wishlist
            {wishlist.length > 0 && (
              <span className={`ml-2 text-lg font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h1>
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <svg
              className={`w-24 h-24 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
              Your wishlist is empty — browse products to save some!
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map(product => (
              <div
                key={product.productId}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-lg flex flex-col transition-colors duration-300`}
              >
                <div className={`relative h-56 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} transition-colors duration-300`}>
                  <img
                    src={`/${product.imgName}`}
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                  />
                  {product.discount && (
                    <div className="absolute top-8 left-0 bg-primary text-white px-3 py-1 -rotate-90 transform -translate-x-5 shadow-md">
                      {Math.round(product.discount * 100)}% OFF
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2 transition-colors duration-300`}>
                    {product.name}
                  </h3>
                  <div className="mt-auto space-y-3">
                    {product.discount ? (
                      <div>
                        <span className="text-gray-500 line-through text-sm mr-2">${product.price.toFixed(2)}</span>
                        <span className="text-primary text-xl font-bold">${(product.price * (1 - product.discount)).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-primary text-xl font-bold">${product.price.toFixed(2)}</span>
                    )}
                    <button
                      onClick={() => removeFromWishlist(product.productId)}
                      className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
