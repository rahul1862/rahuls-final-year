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
    if (user?.id) {
      try {
        const data = await api.post<{ order: Order }>('/api/orders', order);
        setOrders(prev => {
          const next = [data.order, ...prev];
          persistOrders(next);
          return next;
        });
        return;
      } catch {
      }
    }
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
