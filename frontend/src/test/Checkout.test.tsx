import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Checkout } from '../app/pages/Checkout';
import { AuthProvider } from '../app/context/AuthContext';
import { CartProvider } from '../app/context/CartContext';
import { OrderProvider } from '../app/context/OrderContext';
import type { CartItem } from '../app/context/CartContext';

const cartItem: CartItem = {
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
  quantity: 1,
};

function renderCheckout({ seed = true }: { seed?: boolean } = {}) {
  if (seed) {
    localStorage.setItem('vendr-cart', JSON.stringify([cartItem]));
  }
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <Routes>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/cart" element={<div>Cart Page</div>} />
              <Route path="/orders" element={<div>Orders Page</div>} />
            </Routes>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

function fieldByName(container: HTMLElement, name: string): HTMLInputElement {
  const el = container.querySelector(`[name="${name}"]`);
  if (!el) throw new Error(`No field with name="${name}"`);
  return el as HTMLInputElement;
}

function futureExpiry(): string {
  const now = new Date();
  const year = (now.getFullYear() + 2) % 100;
  return `12/${String(year).padStart(2, '0')}`;
}

async function fillShipping(user: ReturnType<typeof userEvent.setup>, container: HTMLElement) {
  await user.type(fieldByName(container, 'firstName'), 'Jane');
  await user.type(fieldByName(container, 'lastName'), 'Doe');
  await user.type(fieldByName(container, 'email'), 'jane@example.com');
  await user.type(fieldByName(container, 'address'), '123 Main St, Apt 4B');
  await user.type(fieldByName(container, 'city'), 'Metropolis');
  await user.type(fieldByName(container, 'zipCode'), '10001');
}

describe('Checkout page', () => {
  it('redirects to /cart when the cart is empty', async () => {
    renderCheckout({ seed: false });
    expect(await screen.findByText('Cart Page')).toBeInTheDocument();
  });

  it('shows validation errors on an empty submit and does not redirect', async () => {
    const user = userEvent.setup();
    const { container } = renderCheckout();
    await screen.findByText(/checkout/i);

    await user.click(screen.getByRole('button', { name: /place order/i }));

    expect(await screen.findAllByText('Required.')).not.toHaveLength(0);
    expect(fieldByName(container, 'cardNumber')).toBeInTheDocument();
  });

  it('rejects an invalid card number', async () => {
    const user = userEvent.setup();
    const { container } = renderCheckout();
    await screen.findByText(/checkout/i);

    await fillShipping(user, container);
    await user.type(fieldByName(container, 'cardNumber'), '1234 5678 9012 3456');
    await user.type(fieldByName(container, 'expiry'), futureExpiry());
    await user.type(fieldByName(container, 'cvv'), '123');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    expect(await screen.findByText('Enter a valid card number.')).toBeInTheDocument();
  });

  it('formats the card number in groups of 4 and the expiry as MM/YY', async () => {
    const user = userEvent.setup();
    const { container } = renderCheckout();
    await screen.findByText(/checkout/i);

    await user.type(fieldByName(container, 'cardNumber'), '4242424242424242');
    expect(fieldByName(container, 'cardNumber').value).toBe('4242 4242 4242 4242');

    await user.type(fieldByName(container, 'expiry'), '1228');
    expect(fieldByName(container, 'expiry').value).toBe('12/28');
  });

  it('submits successfully with valid shipping info and a Luhn-valid test card, showing the confirmation and clearing the cart', async () => {
    const user = userEvent.setup();
    const { container } = renderCheckout();
    await screen.findByText(/checkout/i);

    await fillShipping(user, container);
    await user.type(fieldByName(container, 'cardNumber'), '4242424242424242');
    await user.type(fieldByName(container, 'expiry'), futureExpiry().replace('/', ''));
    await user.type(fieldByName(container, 'cvv'), '123');

    await user.click(screen.getByRole('button', { name: /place order/i }));

    expect(await screen.findByText('Order placed')).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('vendr-cart') || '[]');
      expect(stored).toHaveLength(0);
    });

    const orders = JSON.parse(localStorage.getItem('vendr-orders') || '[]');
    expect(orders).toHaveLength(1);
    expect(orders[0].shippingInfo.email).toBe('jane@example.com');
  }, 10000);

  it('navigates to /orders 3 seconds after the order is placed', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ delay: null });
    const { container } = renderCheckout();
    await screen.findByText(/checkout/i);

    await fillShipping(user, container);
    await user.type(fieldByName(container, 'cardNumber'), '4242424242424242');
    await user.type(fieldByName(container, 'expiry'), futureExpiry().replace('/', ''));
    await user.type(fieldByName(container, 'cvv'), '123');
    await user.click(screen.getByRole('button', { name: /place order/i }));

    expect(await screen.findByText('Order placed')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });

    expect(await screen.findByText('Orders Page')).toBeInTheDocument();
    vi.useRealTimers();
  }, 10000);
});
