import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { CartItem } from './CartContext';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

export type OrderStatus =
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export interface Order {
  id: string;
  date: string;
  estimatedDelivery: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'estimatedDelivery'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const ORDERS_KEY = 'vendr-orders';
const OrderContext = createContext<OrderContextType | undefined>(undefined);

function loadOrders(): Order[] {
  try {
    const saved = window.localStorage.getItem(ORDERS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistOrders(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    if (!user?.id) return;
    api.get<{ orders: Order[] }>('/api/orders')
      .then(data => {
        setOrders(data.orders);
        persistOrders(data.orders);
      })
      .catch(() => {});
  }, [user?.id]);

  const addOrder = async (order: Omit<Order, 'id' | 'date' | 'status' | 'estimatedDelivery'>) => {
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + 5 + Math.floor(Math.random() * 3));
    const newOrder: Order = {
      ...order,
      id: `ORD-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toISOString(),
      status: 'Processing',
      estimatedDelivery: delivery.toISOString(),
    };
    setOrders(prev => {
      const next = [newOrder, ...prev];
      persistOrders(next);
      return next;
    });

    if (user?.id) {
      try {
        await api.post('/api/orders/checkout', {
          firstName: order.shippingInfo.firstName,
          lastName: order.shippingInfo.lastName,
          email: order.shippingInfo.email,
          address: order.shippingInfo.address,
          city: order.shippingInfo.city,
          zipCode: order.shippingInfo.zipCode,
        });
      } catch (error) {
        console.error('Failed to save checkout to backend:', error);
      }

      try {
        await api.post('/api/orders/create-with-items', {
          billingAddress: `${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.zipCode}`,
          billingName: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
          total: order.total,
          items: order.items.map(item => ({
            id: String(item.id),
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            country: item.country,
            description: item.description,
            category: item.category,
            rating: item.rating,
            reviews: item.reviews,
          })),
        });
      } catch (error) {
        console.error('Failed to save order to backend:', error);
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (user?.id) {
      api.patch(`/api/orders/${orderId}/status`, { status }).catch(() => {});
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within OrderProvider');
  return context;
}