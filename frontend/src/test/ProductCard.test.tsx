import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ProductCard } from '../app/components/ProductCard';
import { CartProvider } from '../app/context/CartContext';
import { WishlistProvider } from '../app/context/WishlistContext';
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

function renderProductCard(product = mockProduct) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ProductCard product={product} />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  it('renders the product name', () => {
    renderProductCard();
    expect(screen.getByText('Premium Wireless Headphones')).toBeInTheDocument();
  });

  it('renders the product price formatted to 2 decimal places', () => {
    renderProductCard();
    expect(screen.getByText('$299.99')).toBeInTheDocument();
  });

  it('renders the product category', () => {
    renderProductCard();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('renders the country badge with flag', () => {
    renderProductCard();
    expect(screen.getByText(/United States/)).toBeInTheDocument();
  });

  it('renders the product image with correct alt text', () => {
    renderProductCard();
    const img = screen.getByAltText('Premium Wireless Headphones');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockProduct.image);
  });

  it('renders the Add to Cart button', () => {
    renderProductCard();
    expect(screen.getByRole('button', { name: /add.*to cart/i })).toBeInTheDocument();
  });

  it('shows "Added!" after clicking the Add to Cart button', () => {
    renderProductCard();
    const button = screen.getByRole('button', { name: /add.*to cart/i });
    fireEvent.click(button);
    expect(screen.getByText('Added!')).toBeInTheDocument();
  });

  it('card links to the correct product detail page', () => {
    renderProductCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/1');
  });

  describe('wishlist toggle', () => {
    it('renders the wishlist button initially unpressed with an "Add" label', () => {
      renderProductCard();
      const button = screen.getByRole('button', { name: `Add ${mockProduct.name} to wishlist` });
      expect(button).toHaveAttribute('aria-pressed', 'false');
    });

    it('adds the product to the wishlist on click and flips to a "Remove" label', () => {
      renderProductCard();
      const button = screen.getByRole('button', { name: `Add ${mockProduct.name} to wishlist` });
      fireEvent.click(button);

      const toggled = screen.getByRole('button', { name: `Remove ${mockProduct.name} from wishlist` });
      expect(toggled).toHaveAttribute('aria-pressed', 'true');
    });

    it('removes the product from the wishlist on a second click', () => {
      renderProductCard();
      const addButton = screen.getByRole('button', { name: `Add ${mockProduct.name} to wishlist` });
      fireEvent.click(addButton);

      const removeButton = screen.getByRole('button', { name: `Remove ${mockProduct.name} from wishlist` });
      fireEvent.click(removeButton);

      const backToAdd = screen.getByRole('button', { name: `Add ${mockProduct.name} to wishlist` });
      expect(backToAdd).toHaveAttribute('aria-pressed', 'false');
    });

    it('persists the wishlist toggle to localStorage', () => {
      renderProductCard();
      const button = screen.getByRole('button', { name: `Add ${mockProduct.name} to wishlist` });
      fireEvent.click(button);

      const stored = JSON.parse(localStorage.getItem('vendr-wishlist') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe(mockProduct.id);
    });
  });
});
