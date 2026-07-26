import { describe, it, expect } from 'vitest';
import { getStoreEstimates } from '../app/utils/storePricing';

describe('getStoreEstimates', () => {
  it('returns one estimate per known store', () => {
    const estimates = getStoreEstimates(1, 'Test Product', 100);
    expect(estimates.map(e => e.store)).toEqual(['Amazon', 'eBay', 'Etsy', 'Tesco']);
  });

  it('is deterministic for the same product id, name, and price', () => {
    const a = getStoreEstimates(42, 'Widget', 59.99);
    const b = getStoreEstimates(42, 'Widget', 59.99);
    expect(a).toEqual(b);
  });

  it('varies between different product ids', () => {
    const a = getStoreEstimates(1, 'Widget', 59.99);
    const b = getStoreEstimates(2, 'Widget', 59.99);
    expect(a).not.toEqual(b);
  });

  it('keeps each estimate within that store\'s configured spread', () => {
    for (let id = 0; id < 50; id++) {
      const estimates = getStoreEstimates(id, 'Widget', 100);
      const byStore = Object.fromEntries(estimates.map(e => [e.store, e]));
      expect(byStore.Amazon.deltaPercent).toBeGreaterThanOrEqual(-5);
      expect(byStore.Amazon.deltaPercent).toBeLessThanOrEqual(15);
      expect(byStore.eBay.deltaPercent).toBeGreaterThanOrEqual(-20);
      expect(byStore.eBay.deltaPercent).toBeLessThanOrEqual(10);
      expect(byStore.Etsy.deltaPercent).toBeGreaterThanOrEqual(5);
      expect(byStore.Etsy.deltaPercent).toBeLessThanOrEqual(25);
      expect(byStore.Tesco.deltaPercent).toBeGreaterThanOrEqual(-10);
      expect(byStore.Tesco.deltaPercent).toBeLessThanOrEqual(5);
    }
  });

  it('computes price consistent with deltaPercent applied to the given base price', () => {
    const [estimate] = getStoreEstimates(1, 'Widget', 200);
    const expectedPrice = 200 * (1 + estimate.deltaPercent / 100);
    expect(estimate.price).toBeCloseTo(expectedPrice, 1);
  });

  it('builds a URL-encoded search link per store', () => {
    const estimates = getStoreEstimates(1, 'Wireless Headphones & More', 100);
    const amazon = estimates.find(e => e.store === 'Amazon')!;
    const ebay = estimates.find(e => e.store === 'eBay')!;
    const etsy = estimates.find(e => e.store === 'Etsy')!;
    const tesco = estimates.find(e => e.store === 'Tesco')!;

    expect(amazon.searchUrl).toBe('https://www.amazon.com/s?k=Wireless%20Headphones%20%26%20More');
    expect(ebay.searchUrl).toBe('https://www.ebay.com/sch/i.html?_nkw=Wireless%20Headphones%20%26%20More');
    expect(etsy.searchUrl).toBe('https://www.etsy.com/search?q=Wireless%20Headphones%20%26%20More');
    expect(tesco.searchUrl).toBe('https://www.tesco.com/groceries/en-GB/search?query=Wireless%20Headphones%20%26%20More');
  });
});
