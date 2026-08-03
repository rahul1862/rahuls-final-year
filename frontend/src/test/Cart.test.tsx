import { describe, it, expect } from 'vitest';
import { useEffect } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Cart } from '../app/pages/Cart';
import { AuthProvider } from '../app/context/AuthContext';
import { CartProvider, useCart } from '../app/context/CartContext';
import { ToastProvider } from '../app/context/ToastContext';
import { getStock } from '../app/utils/stock';
import type { Product } from '../app/context/CartContext';

const productA: Product = {
  id: 1,
  name: 'Premium Wireless Headphones',
  price: 50,
  image: 'https://example.com/headphones.jpg',
  description: 'desc',
  category: 'Electronics',
  rating: 4.8,
  reviews: 1234,
  country: 'United States',
  flag: '🇺🇸',
};

const productLowStock: Product = {
  id: 2,
  name: 'Smart Watch Pro',
  price: 40,
  image: 'https://example.com/watch.jpg',
  description: 'desc',
  category: 'Electronics',
  rating: 4.6,
  reviews: 892,
  country: 'Germany',
  flag: '🇩🇪',
};

function SeedOnMount({ products }: { products: { product: Product; quantity: number }[] }) {
  const { addToCart } = useCart();
  useEffect(() => {
    products.forEach(({ product, quantity }) => addToCart(product, quantity));
  }, []);
  return null;
}

function renderCart(seedProducts: { product: Product; quantity: number }[] = []) {
  return render(
    <MemoryRouter initialEntries={['/cart']}>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            {seedProducts.length > 0 && <SeedOnMount products={seedProducts} />}
            <Cart />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Cart page', () => {
  it('shows the empty state with a link to /products when the cart has no items', () => {
    renderCart();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse products/i })).toHaveAttribute('href', '/products');
  });

  it('renders cart items with quantity controls when the cart is non-empty', async () => {
    renderCart([{ product: productA, quantity: 2 }]);
    expect(await screen.findByText(productA.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeInTheDocument();
  });

  it('disables the decrease button at quantity 1', async () => {
    renderCart([{ product: productA, quantity: 1 }]);
    await screen.findByText(productA.name);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
  });

  it('caps quantity at available stock, disabling the increase button and showing a max-reached hint', async () => {
    const stock = getStock(productLowStock.id);
    renderCart([{ product: productLowStock, quantity: stock }]);

    await screen.findByText(productLowStock.name);
    const increaseButton = screen.getByRole('button', { name: 'Increase quantity' });
    expect(increaseButton).toBeDisabled();
    expect(screen.getByText(`Only ${stock} available — max reached`)).toBeInTheDocument();
  });

  it('lets quantity grow when below the stock cap', async () => {
    const user = userEvent.setup();
    renderCart([{ product: productA, quantity: 1 }]);
    await screen.findByText(productA.name);

    const increaseButton = screen.getByRole('button', { name: 'Increase quantity' });
    await user.click(increaseButton);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(increaseButton).not.toBeDisabled();
  });

  it('removing an item shows an undo banner, and Undo restores the exact item and quantity', async () => {
    const user = userEvent.setup();
    renderCart([
      { product: productA, quantity: 3 },
      { product: productLowStock, quantity: 1 },
    ]);
    await screen.findByText(productA.name);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    await user.click(removeButtons[0]);

    expect(screen.getByText(/removed/i)).toBeInTheDocument();
    expect(screen.getByText(productLowStock.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(await screen.findByText(productA.name)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('computes subtotal/shipping/tax/total correctly below the free-shipping threshold', async () => {
    renderCart([{ product: productA, quantity: 1 }]);
    await screen.findByText(productA.name);

    const summary = within(screen.getByText('Order summary').parentElement as HTMLElement);
    expect(summary.getByText('€50.00')).toBeInTheDocument();
    expect(summary.getByText('€9.99')).toBeInTheDocument();
    expect(summary.getByText('€4.00')).toBeInTheDocument();
    expect(summary.getByText('€63.99')).toBeInTheDocument();
  });

  it('gives free shipping once the subtotal exceeds €100', async () => {
    renderCart([{ product: productA, quantity: 3 }]);
    await screen.findByText(productA.name);

    const summary = within(screen.getByText('Order summary').parentElement as HTMLElement);
    expect(summary.getByText('€150.00')).toBeInTheDocument();
    expect(summary.getByText('Free')).toBeInTheDocument();
    expect(summary.getByText('€12.00')).toBeInTheDocument();
    expect(summary.getByText('€162.00')).toBeInTheDocument();
  });

  it('links "Proceed to checkout" to /checkout', async () => {
    renderCart([{ product: productA, quantity: 1 }]);
    await screen.findByText(productA.name);
    expect(screen.getByRole('link', { name: /proceed to checkout/i })).toHaveAttribute('href', '/checkout');
  });
});
