import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const { wishlist, removeFromWishlist, addMultipleToWishlist, clearWishlist, toggleComparison, isInComparison, comparisonList } = useWishlist();
  const { darkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [copiedToast, setCopiedToast] = useState(false);

  const { data: products } = useQuery('products', fetchProducts);

  // On mount, populate wishlist from ?ids= query param
  useEffect(() => {
    const idsParam = searchParams.get('ids');
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .slice(0, 50) // limit to 50 IDs to prevent DoS
        .map(Number)
        .filter(n => !isNaN(n) && n > 0 && Number.isInteger(n));
      if (ids.length > 0) {
        addMultipleToWishlist(ids);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wishlistProducts = products?.filter(p => wishlist.includes(p.productId)) ?? [];

  const handleShareWishlist = async () => {
    const url = `${window.location.origin}/wishlist?ids=${wishlist.join(',')}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      // Fallback for non-HTTPS environments
      window.prompt('Copy this link to share your wishlist:', url);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>My Wishlist</h1>
          <div className="flex items-center gap-3">
            {wishlist.length > 0 && (
              <>
                <div className="relative">
                  <button
                    onClick={handleShareWishlist}
                    className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Share Wishlist
                  </button>
                  {copiedToast && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap">
                      Copied!
                    </span>
                  )}
                </div>
                <button
                  onClick={clearWishlist}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:border-red-400 hover:text-red-400' : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-400'}`}
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className={`text-center py-20 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="mx-auto mb-4 w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-xl font-medium mb-2">Your wishlist is empty</p>
            <p className="text-sm mb-6">Browse products and click the heart icon to save items.</p>
            <Link to="/products" className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistProducts.map(product => {
              const inComparison = isInComparison(product.productId);
              const comparisonFull = comparisonList.length >= 4 && !inComparison;
              const effectivePrice = product.discount ? product.price * (1 - product.discount) : product.price;

              return (
                <div
                  key={product.productId}
                  className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden shadow-lg flex flex-col transition-colors duration-300`}
                >
                  {/* Image */}
                  <div className={`relative h-48 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'}`}>
                    <img
                      src={`/${product.imgName}`}
                      alt={product.name}
                      className="w-full h-full object-contain p-2"
                    />
                    {product.discount && (
                      <div className="absolute top-8 left-0 bg-primary text-white px-3 py-1 -rotate-90 transform -translate-x-5 shadow-md text-xs">
                        {Math.round(product.discount * 100)}% OFF
                      </div>
                    )}
                    {/* Remove from wishlist */}
                    <button
                      onClick={() => removeFromWishlist(product.productId)}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 text-red-500 hover:bg-white transition-colors shadow"
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-1`}>{product.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-3 flex-grow`}>{product.description}</p>

                    <div className="mb-3">
                      {product.discount ? (
                        <div>
                          <span className="text-gray-500 line-through text-sm mr-2">${product.price.toFixed(2)}</span>
                          <span className="text-primary font-bold">${effectivePrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-primary font-bold">${effectivePrice.toFixed(2)}</span>
                      )}
                    </div>

                    {/* Compare toggle */}
                    <button
                      onClick={() => toggleComparison(product.productId)}
                      disabled={comparisonFull}
                      title={comparisonFull ? 'Max 4 products' : undefined}
                      className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                        inComparison
                          ? 'bg-primary border-primary text-white'
                          : comparisonFull
                          ? `${darkMode ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400'} cursor-not-allowed`
                          : `${darkMode ? 'border-gray-600 text-gray-300 hover:border-primary hover:text-primary' : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'}`
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2h2a2 2 0 012-2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
                      </svg>
                      {inComparison ? '✓ Comparing' : 'Add to Compare'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky comparison bar */}
      {comparisonList.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-white py-3 px-6 flex items-center justify-between z-50 shadow-lg">
          <span className="font-medium">Comparing {comparisonList.length} products</span>
          <Link
            to="/compare"
            className="bg-white text-primary font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            View Comparison
          </Link>
        </div>
      )}
    </div>
  );
}
