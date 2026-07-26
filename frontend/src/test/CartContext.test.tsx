import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../app/context/CartContext';
import { AuthProvider } from '../app/context/AuthContext';
import type { Product } from '../app/context/CartContext';

const mockProduct: Product = {
  id: 1,
  name: 'Premium Wireless Headphones',
  price: 299.99,
  image: 'https://example.com/headphones.jpg',
  description: 'Crystal-clear audio with noise cancellation.',
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
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cart).toHaveLength(0);
  });

  it('adds a product to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].name).toBe('Premium Wireless Headphones');
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it('increases quantity when the same product is added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it('adds a product with a custom quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct, 3);
    });

    expect(result.current.cart[0].quantity).toBe(3);
  });

  it('removes a product from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.removeFromCart(mockProduct.id);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('updates the quantity of an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.updateQuantity(mockProduct.id, 5);
    });

    expect(result.current.cart[0].quantity).toBe(5);
  });

  it('removes an item when quantity is updated to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.updateQuantity(mockProduct.id, 0);
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('clears all items from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
      result.current.addToCart(mockProduct2);
      result.current.clearCart();
    });

    expect(result.current.cart).toHaveLength(0);
  });

  it('calculates the correct cart total', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.addToCart(mockProduct2, 1);
    });

    expect(result.current.getCartTotal()).toBeCloseTo(999.97, 2);
  });

  it('returns the correct cart item count', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct, 2);
      result.current.addToCart(mockProduct2, 3);
    });

    expect(result.current.getCartCount()).toBe(5);
  });

  it('persists cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    const stored = JSON.parse(localStorage.getItem('vendr-cart') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(1);
  });
});
