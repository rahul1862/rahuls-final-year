import type { Product } from '../context/CartContext';

const STORAGE_KEY = 'vendr-recently-viewed';
const MAX_ITEMS = 8;

export function recordView(product: Product): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: Product[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(existing)) throw new Error('recently-viewed data is not an array');
    const updated = [product, ...existing.filter(p => p.id !== product.id)].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
  }
}

export function getRecentlyViewed(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
