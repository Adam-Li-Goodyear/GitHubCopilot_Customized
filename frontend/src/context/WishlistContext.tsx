/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WishlistContextType {
  wishlist: number[];
  addToWishlist: (id: number) => void;
  addMultipleToWishlist: (ids: number[]) => void;
  removeFromWishlist: (id: number) => void;
  toggleWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;

  comparisonList: number[];
  toggleComparison: (id: number) => void;
  isInComparison: (id: number) => boolean;
  clearComparison: () => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? (JSON.parse(stored) as number[]) : [];
    } catch {
      return [];
    }
  });

  const [comparisonList, setComparisonList] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('comparison');
      return stored ? (JSON.parse(stored) as number[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('comparison', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToWishlist = (id: number) => {
    setWishlist(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const addMultipleToWishlist = (ids: number[]) => {
    setWishlist(prev => {
      const newIds = ids.filter(id => !prev.includes(id));
      return newIds.length > 0 ? [...prev, ...newIds] : prev;
    });
  };

  const removeFromWishlist = (id: number) => {
    setWishlist(prev => prev.filter(item => item !== id));
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const isInWishlist = (id: number) => wishlist.includes(id);

  const clearWishlist = () => setWishlist([]);

  const toggleComparison = (id: number) => {
    setComparisonList(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 4) {
        return prev; // max 4, do nothing
      }
      return [...prev, id];
    });
  };

  const isInComparison = (id: number) => comparisonList.includes(id);

  const clearComparison = () => setComparisonList([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        addMultipleToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        comparisonList,
        toggleComparison,
        isInComparison,
        clearComparison,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
