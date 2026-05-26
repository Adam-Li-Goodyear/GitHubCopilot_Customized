import { createContext, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from './AuthContext';
import { api } from '../api/config';

interface WishlistItem {
  email: string;
  productId: number;
}

interface WishlistContextType {
  wishlist: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

const fetchWishlist = async (email: string): Promise<WishlistItem[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.wishlists}/${encodeURIComponent(email)}`);
  return data;
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, userEmail } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistData } = useQuery(
    ['wishlist', userEmail],
    () => fetchWishlist(userEmail!),
    { enabled: isLoggedIn && !!userEmail }
  );

  const wishlist: number[] = (wishlistData ?? []).map(item => item.productId);

  const addMutation = useMutation(
    (productId: number) =>
      axios.post(`${api.baseURL}${api.endpoints.wishlists}`, { email: userEmail, productId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist', userEmail]);
      }
    }
  );

  const removeMutation = useMutation(
    (productId: number) =>
      axios.delete(`${api.baseURL}${api.endpoints.wishlists}/${encodeURIComponent(userEmail!)}/${productId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['wishlist', userEmail]);
      }
    }
  );

  const toggleWishlist = (productId: number) => {
    if (!isLoggedIn || !userEmail) return;
    if (wishlist.includes(productId)) {
      removeMutation.mutate(productId);
    } else {
      addMutation.mutate(productId);
    }
  };

  const isInWishlist = (id: number) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
