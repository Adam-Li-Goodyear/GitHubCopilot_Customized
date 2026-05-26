import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
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

export default function Compare() {
  const { comparisonList, toggleComparison, clearComparison } = useWishlist();
  const { darkMode } = useTheme();

  const { data: products, isLoading } = useQuery('products', fetchProducts);

  const compareProducts = products?.filter(p => comparisonList.includes(p.productId)) ?? [];

  const getEffectivePrice = (product: Product) =>
    product.discount ? product.price * (1 - product.discount) : product.price;

  const lowestPriceId =
    compareProducts.length >= 2
      ? compareProducts.reduce((best, p) =>
          getEffectivePrice(p) < getEffectivePrice(best) ? p : best
        ).productId
      : null;

  const bgClass = darkMode ? 'bg-dark' : 'bg-gray-100';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textMain = darkMode ? 'text-light' : 'text-gray-800';
  const textSub = darkMode ? 'text-gray-400' : 'text-gray-500';
  const stickyBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgClass} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (comparisonList.length < 2) {
    return (
      <div className={`min-h-screen ${bgClass} pt-20 pb-16 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto text-center py-20">
          <svg className="mx-auto mb-4 w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2h2a2 2 0 002-2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
          </svg>
          <p className={`text-xl font-medium mb-2 ${textMain}`}>Add at least 2 products to compare</p>
          <p className={`text-sm mb-6 ${textSub}`}>Go to your wishlist and select products to compare.</p>
          <Link to="/wishlist" className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Go to Wishlist
          </Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; render: (p: Product) => ReactNode }[] = [
    {
      label: 'Image',
      render: p => (
        <div className={`h-32 ${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} rounded-lg p-2`}>
          <img src={`/${p.imgName}`} alt={p.name} className="w-full h-full object-contain" />
        </div>
      ),
    },
    {
      label: 'Name',
      render: p => <span className={`font-bold ${textMain}`}>{p.name}</span>,
    },
    {
      label: 'SKU',
      render: p => <span className={textSub}>{p.sku}</span>,
    },
    {
      label: 'Unit',
      render: p => <span className={textSub}>{p.unit}</span>,
    },
    {
      label: 'Price',
      render: p =>
        p.discount ? (
          <div>
            <span className="text-gray-500 line-through text-sm mr-1">${p.price.toFixed(2)}</span>
            <span className="text-primary font-bold">${getEffectivePrice(p).toFixed(2)}</span>
          </div>
        ) : (
          <span className="text-primary font-bold">${p.price.toFixed(2)}</span>
        ),
    },
    {
      label: 'Effective Price',
      render: p => <span className="text-primary font-semibold">${getEffectivePrice(p).toFixed(2)}</span>,
    },
    {
      label: 'Supplier ID',
      render: p => <span className={textSub}>{p.supplierId}</span>,
    },
  ];

  return (
    <div className={`min-h-screen ${bgClass} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-3xl font-bold ${textMain}`}>Product Comparison</h1>
          <button
            onClick={clearComparison}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:border-red-400 hover:text-red-400' : 'border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-400'}`}
          >
            Clear All
          </button>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Attribute label column */}
                <th className={`sticky left-0 ${stickyBg} ${textMain} text-left px-4 py-3 font-semibold text-sm border-b ${borderClass} w-32 z-10`}>
                  Attribute
                </th>
                {compareProducts.map(p => (
                  <th
                    key={p.productId}
                    className={`${cardBg} px-4 py-3 text-center border-b ${borderClass} min-w-[180px] ${p.productId === lowestPriceId ? 'ring-2 ring-primary rounded-t-lg' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className={`font-semibold text-sm ${textMain}`}>{p.name}</span>
                      <button
                        onClick={() => toggleComparison(p.productId)}
                        className="text-xs text-red-400 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.label} className={`border-b ${borderClass}`}>
                  <td className={`sticky left-0 ${stickyBg} ${textSub} px-4 py-3 font-medium text-sm z-10`}>
                    {row.label}
                  </td>
                  {compareProducts.map(p => (
                    <td
                      key={p.productId}
                      className={`${cardBg} px-4 py-3 text-center text-sm ${p.productId === lowestPriceId ? 'ring-2 ring-primary' : ''}`}
                    >
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lowestPriceId !== null && (
          <p className={`mt-4 text-sm ${textSub}`}>
            <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2"></span>
            Highlighted border shows the best (lowest) effective price.
          </p>
        )}
      </div>
    </div>
  );
}
