import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../app/context/AuthContext';
import { OrderProvider, useOrders } from '../app/context/OrderContext';
import type { CartItem } from '../app/context/CartContext';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

const mockItem: CartItem = {
  id: 1,
  name: 'Premium Wireless Headphones',
  price: 100,
  image: 'https://example.com/headphones.jpg',
  description: 'desc',
  category: 'Electronics',
  rating: 4.8,
  reviews: 1234,
  country: 'United States',
  flag: '🇺🇸',
  quantity: 1,
};

const orderInput = {
  items: [mockItem],
  subtotal: 100,
  shipping: 0,
  tax: 8,
  total: 108,
  shippingInfo: {
    firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com',
    address: '1 Main St', city: 'Metropolis', zipCode: '12345',
  },
  paymentMethod: 'card',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <OrderProvider>{children}</OrderProvider>
  </AuthProvider>
);

describe('OrderContext', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('guest (no user) path', () => {
    it('starts with no orders and makes no network calls', () => {
      const { result } = renderHook(() => useOrders(), { wrapper });
      expect(result.current.orders).toHaveLength(0);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('addOrder synthesizes a local order without calling the API', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      await act(async () => {
        await result.current.addOrder(orderInput);
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(result.current.orders).toHaveLength(1);

      const order = result.current.orders[0];
      expect(order.id).toMatch(/^ORD-/);
      expect(order.status).toBe('Processing');
      expect(order.total).toBe(108);

      const created = new Date(order.date).getTime();
      const delivery = new Date(order.estimatedDelivery).getTime();
      const daysUntilDelivery = (delivery - created) / (1000 * 60 * 60 * 24);
      expect(daysUntilDelivery).toBeGreaterThanOrEqual(4.99);
      expect(daysUntilDelivery).toBeLessThanOrEqual(8);
    });

    it('persists local orders to localStorage', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      await act(async () => {
        await result.current.addOrder(orderInput);
      });

      const stored = JSON.parse(localStorage.getItem('vendr-orders') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toMatch(/^ORD-/);
    });

    it('updateOrderStatus updates locally without calling the API', async () => {
      const { result } = renderHook(() => useOrders(), { wrapper });

      await act(async () => {
        await result.current.addOrder(orderInput);
      });
      const orderId = result.current.orders[0].id;

      act(() => {
        result.current.updateOrderStatus(orderId, 'Shipped');
      });

      expect(result.current.orders[0].status).toBe('Shipped');
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('authenticated path', () => {
    beforeEach(() => {
      localStorage.setItem('vendr-session', JSON.stringify({ id: '1', name: 'Jane Doe', email: 'jane@example.com' }));
      localStorage.setItem('vendr-token', 'test-token-123');
    });

    it('fetches existing orders on mount via GET /api/orders', async () => {
      const serverOrder = {
        id: 'ORD-SERVER1', date: new Date().toISOString(), estimatedDelivery: new Date().toISOString(),
        status: 'Shipped', items: [mockItem], subtotal: 100, shipping: 0, tax: 8, total: 108,
        shippingInfo: orderInput.shippingInfo, paymentMethod: 'card',
      };
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ orders: [serverOrder] }));

      const { result } = renderHook(() => useOrders(), { wrapper });

      await waitFor(() => {
        expect(result.current.orders).toHaveLength(1);
      });
      expect(result.current.orders[0].id).toBe('ORD-SERVER1');
      expect(fetch).toHaveBeenCalledWith('/api/orders', expect.objectContaining({ method: 'GET' }));
    });

    it('addOrder POSTs to /api/orders/checkout and /api/orders/create-with-items, then prepends a local order', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ orders: [] }));

      const { result } = renderHook(() => useOrders(), { wrapper });
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ message: 'Checkout saved successfully' }));
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ message: 'Order created successfully' }));

      await act(async () => {
        await result.current.addOrder(orderInput);
      });

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenNthCalledWith(2, '/api/orders/checkout', expect.objectContaining({
        method: 'POST',
      }));
      expect(fetch).toHaveBeenNthCalledWith(3, '/api/orders/create-with-items', expect.objectContaining({
        method: 'POST',
      }));
      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].id).toMatch(/^ORD-/);
      expect(result.current.orders[0].status).toBe('Processing');
    });

    it('falls back to a local order if the authenticated POST throws', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ orders: [] }));

      const { result } = renderHook(() => useOrders(), { wrapper });
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

      (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('Failed to fetch'));
      (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await act(async () => {
        await result.current.addOrder(orderInput);
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].id).toMatch(/^ORD-/);
      expect(result.current.orders[0].status).toBe('Processing');
    });

    it('updateOrderStatus calls PATCH /api/orders/:id/status', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ orders: [] }));

      const { result } = renderHook(() => useOrders(), { wrapper });
      await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ message: 'Checkout saved' }));
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ message: 'Order created' }));
      await act(async () => {
        await result.current.addOrder(orderInput);
      });
      const orderId = result.current.orders[0].id;

      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ ok: true }));
      act(() => {
        result.current.updateOrderStatus(orderId, 'Delivered');
      });

      expect(result.current.orders[0].status).toBe('Delivered');
      await waitFor(() => {
        expect(fetch).toHaveBeenLastCalledWith(`/api/orders/${orderId}/status`, expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'Delivered' }),
        }));
      });
    });
  });
});
