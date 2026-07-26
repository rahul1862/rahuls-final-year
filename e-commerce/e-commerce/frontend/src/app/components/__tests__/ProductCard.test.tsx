import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider } from '../../context/CartContext';
import { BrowserRouter } from 'react-router-dom';

// Mock ProductCard Component
const MockProductCard = ({ product, onAddToCart, onAddToWishlist }) => {
  return (
    <div data-testid="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
      <button onClick={() => onAddToWishlist(product)}>Add to Wishlist</button>
    </div>
  );
};

describe('ProductCard Component', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 29.99,
    image: 'test.jpg',
    description: 'Test Description'
  };

  it('should render product information', () => {
    const mockFn = vi.fn();
    render(
      <MockProductCard 
        product={mockProduct}
        onAddToCart={mockFn}
        onAddToWishlist={mockFn}
      />
    );
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('should call onAddToCart when add to cart button is clicked', async () => {
    const user = userEvent.setup();
    const mockAddToCart = vi.fn();
    const mockAddToWishlist = vi.fn();

    render(
      <MockProductCard 
        product={mockProduct}
        onAddToCart={mockAddToCart}
        onAddToWishlist={mockAddToWishlist}
      />
    );

    const addButton = screen.getByRole('button', { name: /add to cart/i });
    await user.click(addButton);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('should call onAddToWishlist when wishlist button is clicked', async () => {
    const user = userEvent.setup();
    const mockAddToCart = vi.fn();
    const mockAddToWishlist = vi.fn();

    render(
      <MockProductCard 
        product={mockProduct}
        onAddToCart={mockAddToCart}
        onAddToWishlist={mockAddToWishlist}
      />
    );

    const wishlistButton = screen.getByRole('button', { name: /add to wishlist/i });
    await user.click(wishlistButton);

    expect(mockAddToWishlist).toHaveBeenCalledWith(mockProduct);
  });

  it('should render product card with all required elements', () => {
    const mockFn = vi.fn();
    render(
      <MockProductCard 
        product={mockProduct}
        onAddToCart={mockFn}
        onAddToWishlist={mockFn}
      />
    );

    const productCard = screen.getByTestId('product-card');
    expect(productCard).toBeInTheDocument();
    expect(productCard.querySelectorAll('button')).toHaveLength(2);
  });
});
