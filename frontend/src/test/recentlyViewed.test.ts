import { describe, it, expect } from 'vitest';
import { recordView, getRecentlyViewed } from '../app/utils/recentlyViewed';
import type { Product } from '../app/context/CartContext';

function makeProduct(id: number): Product {
  return {
    id,
    name: `Product ${id}`,
    price: 10 + id,
    image: `https://example.com/${id}.jpg`,
    description: 'desc',
    category: 'Electronics',
    rating: 4.5,
    reviews: 10,
    country: 'United States',
    flag: '🇺🇸',
  };
}

describe('recentlyViewed utils', () => {
  it('returns an empty array when nothing has been viewed', () => {
    expect(getRecentlyViewed()).toEqual([]);
  });

  it('records a viewed product', () => {
    recordView(makeProduct(1));
    const viewed = getRecentlyViewed();
    expect(viewed).toHaveLength(1);
    expect(viewed[0].id).toBe(1);
  });

  it('puts the most recently viewed product first', () => {
    recordView(makeProduct(1));
    recordView(makeProduct(2));
    recordView(makeProduct(3));

    const viewed = getRecentlyViewed();
    expect(viewed.map(p => p.id)).toEqual([3, 2, 1]);
  });

  it('dedupes by id, moving a re-viewed item back to the front', () => {
    recordView(makeProduct(1));
    recordView(makeProduct(2));
    recordView(makeProduct(3));
    recordView(makeProduct(1));

    const viewed = getRecentlyViewed();
    expect(viewed.map(p => p.id)).toEqual([1, 3, 2]);
    expect(viewed).toHaveLength(3);
  });

  it('caps the list at 8 items, dropping the oldest', () => {
    for (let id = 1; id <= 10; id++) {
      recordView(makeProduct(id));
    }
    const viewed = getRecentlyViewed();
    expect(viewed).toHaveLength(8);
  
    expect(viewed.map(p => p.id)).toEqual([10, 9, 8, 7, 6, 5, 4, 3]);
  });

  it('persists to localStorage under the expected key', () => {
    recordView(makeProduct(5));
    const stored = JSON.parse(localStorage.getItem('vendr-recently-viewed') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(5);
  });
});
