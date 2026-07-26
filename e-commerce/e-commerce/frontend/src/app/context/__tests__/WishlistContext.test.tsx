import { describe, it, expect, beforeEach } from 'vitest';

describe('WishlistContext - Wishlist Management', () => {
  let wishlistState;

  beforeEach(() => {
    wishlistState = {
      items: [],
      addToWishlist: function(product) {
        if (!this.items.find(item => item.id === product.id)) {
          this.items.push(product);
        }
      },
      removeFromWishlist: function(id) {
        this.items = this.items.filter(item => item.id !== id);
      },
      isInWishlist: function(id) {
        return this.items.some(item => item.id === id);
      },
      clearWishlist: function() {
        this.items = [];
      }
    };
  });

  it('should add product to wishlist', () => {
    const product = { id: '1', name: 'Wishlist Product', price: 39.99 };
    wishlistState.addToWishlist(product);

    expect(wishlistState.items).toHaveLength(1);
    expect(wishlistState.items[0].name).toBe('Wishlist Product');
  });

  it('should not add duplicate products to wishlist', () => {
    const product = { id: '1', name: 'Wishlist Product', price: 39.99 };
    wishlistState.addToWishlist(product);
    wishlistState.addToWishlist(product);

    expect(wishlistState.items).toHaveLength(1);
  });

  it('should remove product from wishlist', () => {
    const product1 = { id: '1', name: 'Product 1', price: 29.99 };
    const product2 = { id: '2', name: 'Product 2', price: 49.99 };

    wishlistState.addToWishlist(product1);
    wishlistState.addToWishlist(product2);
    wishlistState.removeFromWishlist('1');

    expect(wishlistState.items).toHaveLength(1);
    expect(wishlistState.items[0].id).toBe('2');
  });

  it('should check if product is in wishlist', () => {
    const product = { id: '1', name: 'Test Product', price: 29.99 };
    wishlistState.addToWishlist(product);

    expect(wishlistState.isInWishlist('1')).toBe(true);
    expect(wishlistState.isInWishlist('2')).toBe(false);
  });

  it('should add multiple products to wishlist', () => {
    const product1 = { id: '1', name: 'Product 1', price: 29.99 };
    const product2 = { id: '2', name: 'Product 2', price: 49.99 };
    const product3 = { id: '3', name: 'Product 3', price: 59.99 };

    wishlistState.addToWishlist(product1);
    wishlistState.addToWishlist(product2);
    wishlistState.addToWishlist(product3);

    expect(wishlistState.items).toHaveLength(3);
  });

  it('should clear entire wishlist', () => {
    const product1 = { id: '1', name: 'Product 1', price: 29.99 };
    const product2 = { id: '2', name: 'Product 2', price: 49.99 };

    wishlistState.addToWishlist(product1);
    wishlistState.addToWishlist(product2);
    expect(wishlistState.items).toHaveLength(2);

    wishlistState.clearWishlist();
    expect(wishlistState.items).toHaveLength(0);
  });

  it('should handle remove from empty wishlist gracefully', () => {
    wishlistState.removeFromWishlist('1');
    expect(wishlistState.items).toHaveLength(0);
  });

  it('should maintain wishlist order', () => {
    const products = [
      { id: '1', name: 'Product 1', price: 29.99 },
      { id: '2', name: 'Product 2', price: 49.99 },
      { id: '3', name: 'Product 3', price: 59.99 }
    ];

    products.forEach(product => wishlistState.addToWishlist(product));

    expect(wishlistState.items[0].id).toBe('1');
    expect(wishlistState.items[1].id).toBe('2');
    expect(wishlistState.items[2].id).toBe('3');
  });
});
