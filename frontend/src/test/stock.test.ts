import { describe, it, expect } from 'vitest';
import { getStock, isOutOfStock, isLowStock } from '../app/utils/stock';

describe('stock utils', () => {
  describe('getStock', () => {
    it('computes stock deterministically from the product id', () => {
      expect(getStock(1)).toBe(16);
      expect(getStock(2)).toBe(1);
      expect(getStock(10)).toBe(5);
      expect(getStock(31)).toBe(0);
      expect(getStock(12)).toBe(6);
    });

    it('is periodic with period 31', () => {
      expect(getStock(1)).toBe(getStock(32));
      expect(getStock(2)).toBe(getStock(33));
    });
  });

  describe('isOutOfStock', () => {
    it('is true when stock is exactly 0', () => {
      expect(isOutOfStock(31)).toBe(true);
    });

    it('is false when stock is nonzero', () => {
      expect(isOutOfStock(1)).toBe(false);
      expect(isOutOfStock(2)).toBe(false);
    });
  });

  describe('isLowStock', () => {
    it('is true for stock in (0, 5]', () => {
      expect(isLowStock(2)).toBe(true);
      expect(isLowStock(10)).toBe(true);
    });

    it('is false for stock above the threshold', () => {
      expect(isLowStock(1)).toBe(false);
      expect(isLowStock(12)).toBe(false);
    });

    it('is false when out of stock (0 is not "low", it is "out")', () => {
      expect(isLowStock(31)).toBe(false);
    });
  });
});
