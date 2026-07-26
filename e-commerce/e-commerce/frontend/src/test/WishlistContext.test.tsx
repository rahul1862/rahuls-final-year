import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '../app/context/WishlistContext';
import { AuthProvider } from '../app/context/AuthContext';
import type { Product } from '../app/context/CartContext';

const mockProduct: Product = {
  id: 1,
  name: 'Premium Wireless Headphones',
  price: 299.99,
  image: 'https://example.com/headphones.jpg',
  description: 'Crystal-clear audio.',
  category: 'Electronics',
  rating: 4.8,
  reviews: 1234,
  country: 'United States',
  flag: '🇺🇸',
};

const mockProduct2: Product = {
  id: 2,
  name: 'Smart Watch Pro',
  price: 399.99,
  image: 'https://example.com/watch.jpg',
  description: 'Track your fitness goals.',
  category: 'Electronics',
  rating: 4.6,
  reviews: 892,
  country: 'Germany',
  flag: '🇩🇪',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <WishlistProvider>{children}</WishlistProvider>
  </AuthProvider>
);

describe('WishlistContext', () => {
  it('starts with an empty wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.wishlist).toHaveLength(0);
  });

  it('adds a product to the wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
    });

    expect(result.current.wishlist).toHaveLength(1);
    expect(result.current.wishlist[0].name).toBe('Premium Wireless Headphones');
  });

  it('does not add duplicate products to the wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
      result.current.addToWishlist(mockProduct);
    });

    expect(result.current.wishlist).toHaveLength(1);
  });

  it('removes a product from the wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
      result.current.removeFromWishlist(mockProduct.id);
    });

    expect(result.current.wishlist).toHaveLength(0);
  });

  it('returns true from isInWishlist when product is in wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
    });

    expect(result.current.isInWishlist(mockProduct.id)).toBe(true);
  });

  it('returns false from isInWishlist when product is not in wishlist', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.isInWishlist(999)).toBe(false);
  });

  it('returns correct count from getWishlistCount', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
      result.current.addToWishlist(mockProduct2);
    });

    expect(result.current.getWishlistCount()).toBe(2);
  });

  it('persists wishlist to localStorage', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => {
      result.current.addToWishlist(mockProduct);
    });

    const stored = JSON.parse(localStorage.getItem('vendr-wishlist') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(1);
  });
});
