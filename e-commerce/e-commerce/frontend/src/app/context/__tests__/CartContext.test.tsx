import { describe, it, expect, beforeEach } from 'vitest';

// Mock CartContext functions
describe('CartContext - Shopping Cart Management', () => {
  let cartState;

  beforeEach(() => {
    cartState = {
      items: [],
      addToCart: function(product) {
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          this.items.push({ ...product, quantity: 1 });
        }
      },
      removeFromCart: function(id) {
        this.items = this.items.filter(item => item.id !== id);
      },
      updateQuantity: function(id, quantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
          item.quantity = quantity;
        }
      },
      clearCart: function() {
        this.items = [];
      }
    };
  });

  it('should add product to empty cart', () => {
    const product = { id: '1', name: 'Test Product', price: 29.99 };
    cartState.addToCart(product);

    expect(cartState.items).toHaveLength(1);
    expect(cartState.items[0].name).toBe('Test Product');
    expect(cartState.items[0].quantity).toBe(1);
  });

  it('should increase quantity when adding existing product', () => {
    const product = { id: '1', name: 'Test Product', price: 29.99 };
    cartState.addToCart(product);
    cartState.addToCart(product);

    expect(cartState.items).toHaveLength(1);
    expect(cartState.items[0].quantity).toBe(2);
  });

  it('should add multiple different products', () => {
    const product1 = { id: '1', name: 'Product 1', price: 29.99 };
    const product2 = { id: '2', name: 'Product 2', price: 49.99 };

    cartState.addToCart(product1);
    cartState.addToCart(product2);

    expect(cartState.items).toHaveLength(2);
  });

  it('should remove product from cart', () => {
    const product1 = { id: '1', name: 'Product 1', price: 29.99 };
    const product2 = { id: '2', name: 'Product 2', price: 49.99 };

    cartState.addToCart(product1);
    cartState.addToCart(product2);
    cartState.removeFromCart('1');

    expect(cartState.items).toHaveLength(1);
    expect(cartState.items[0].id).toBe('2');
  });

  it('should update product quantity', () => {
    const product = { id: '1', name: 'Test Product', price: 29.99 };
    cartState.addToCart(product);
    cartState.updateQuantity('1', 5);

    expect(cartState.items[0].quantity).toBe(5);
  });

  it('should calculate cart total correctly', () => {
    const product1 = { id: '1', name: 'Product 1', price: 29.99, quantity: 2 };
    const product2 = { id: '2', name: 'Product 2', price: 49.99, quantity: 1 };

    cartState.items.push(product1, product2);

    const total = cartState.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    expect(total).toBe(109.97);
  });

  it('should clear entire cart', () => {
    const product1 = { id: '1', name: 'Product 1', price: 29.99 };
    const product2 = { id: '2', name: 'Product 2', price: 49.99 };

    cartState.addToCart(product1);
    cartState.addToCart(product2);
    expect(cartState.items).toHaveLength(2);

    cartState.clearCart();
    expect(cartState.items).toHaveLength(0);
  });

  it('should handle remove from empty cart gracefully', () => {
    cartState.removeFromCart('1');
    expect(cartState.items).toHaveLength(0);
  });

  it('should validate cart item count', () => {
    const product = { id: '1', name: 'Test Product', price: 29.99 };
    cartState.addToCart(product);
    cartState.addToCart(product);

    const itemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
    expect(itemCount).toBe(2);
  });
});
