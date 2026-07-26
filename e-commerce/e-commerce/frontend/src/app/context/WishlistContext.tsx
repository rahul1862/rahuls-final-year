import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Product } from './CartContext';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  getWishlistCount: () => number;
}

const WISHLIST_STORAGE_KEY = 'vendr-wishlist';
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function loadWishlist(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>(loadWishlist);
  const skipSync = useRef(false);

  useEffect(() => {
    if (!user?.id) return;
    skipSync.current = true;
    api.get<{ items: Product[] }>('/api/wishlist')
      .then(data => {
        if (data.items.length > 0) setWishlist(data.items);
      })
      .catch(() => {})
      .finally(() => { skipSync.current = false; });
  }, [user?.id]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch {
    }
    if (user?.id && !skipSync.current) {
      api.put('/api/wishlist', { items: wishlist }).catch(() => {});
    }
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist(current =>
      current.some(item => item.id === product.id) ? current : [...current, product]
    );
  };

  const removeFromWishlist = (productId: number) => {
    setWishlist(current => current.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: number) => wishlist.some(item => item.id === productId);
  const getWishlistCount = () => wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
