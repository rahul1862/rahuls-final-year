import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { getDiscountPercent, isValidDiscountCode, validateDiscountCode } from '../utils/discountCodes';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  country: string;
  flag: string;
}

export interface CartItem extends Product {
  quantity: number;
}

interface DiscountResult {
  ok: boolean;
  message: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  discountCode: string | null;
  discountPercent: number;
  applyDiscount: (code: string) => DiscountResult;
  clearDiscount: () => void;
}

const CART_STORAGE_KEY = 'vendr-cart';
const DISCOUNT_STORAGE_KEY = 'vendr-cart-discount';

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadDiscountCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(DISCOUNT_STORAGE_KEY);
    return saved && isValidDiscountCode(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [discountCode, setDiscountCode] = useState<string | null>(loadDiscountCode);

  const skipSync = useRef(false);

  useEffect(() => {
    try {
      if (discountCode) window.localStorage.setItem(DISCOUNT_STORAGE_KEY, discountCode);
      else window.localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    } catch {
    }
  }, [discountCode]);

  useEffect(() => {
    if (!user?.id) return;
    skipSync.current = true;
    api.get<{ items: CartItem[]; total: number }>('/api/cart')
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          setCart(data.items);
        }
      })
      .catch(() => {
      })
      .finally(() => { skipSync.current = false; });
  }, [user?.id]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
    }
    if (user?.id && !skipSync.current) {
      api.put('/api/cart', { items: cart })
        .catch(() => {
        });
    }
  }, [cart, user?.id]);

  const addToCart = (product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity) || 1);
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + safeQuantity } : item
        );
      }
      return [...current, { ...product, quantity: safeQuantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(current => current.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(current =>
      current.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => { setCart([]); setDiscountCode(null); };
  const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const discountPercent = getDiscountPercent(discountCode);

  const applyDiscount = (code: string): DiscountResult => {
    const result = validateDiscountCode(code);
    if (result.ok && result.code) setDiscountCode(result.code);
    return { ok: result.ok, message: result.message };
  };

  const clearDiscount = () => setDiscountCode(null);

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount,
        discountCode, discountPercent, applyDiscount, clearDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}