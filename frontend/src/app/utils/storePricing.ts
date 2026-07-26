export interface StoreEstimate {
  store: string;
  price: number;
  deltaPercent: number;
  searchUrl: string;
}

interface StoreConfig {
  name: string;
  minPct: number;
  maxPct: number;
  searchUrl: (query: string) => string;
}

const STORES: StoreConfig[] = [
  { name: 'Amazon', minPct: -5, maxPct: 15, searchUrl: q => `https://www.amazon.com/s?k=${q}` },
  { name: 'eBay', minPct: -20, maxPct: 10, searchUrl: q => `https://www.ebay.com/sch/i.html?_nkw=${q}` },
  { name: 'Etsy', minPct: 5, maxPct: 25, searchUrl: q => `https://www.etsy.com/search?q=${q}` },
  { name: 'Tesco', minPct: -10, maxPct: 5, searchUrl: q => `https://www.tesco.com/groceries/en-GB/search?query=${q}` },
];

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 10000) / 10000;
}

export function getStoreEstimates(productId: number, productName: string, ourPrice: number): StoreEstimate[] {
  const query = encodeURIComponent(productName);
  return STORES.map(store => {
    const r = seededRandom(`${productId}-${store.name}`);
    const pct = store.minPct + r * (store.maxPct - store.minPct);
    const price = Math.round(ourPrice * (1 + pct / 100) * 100) / 100;
    return {
      store: store.name,
      price,
      deltaPercent: Math.round(pct * 10) / 10,
      searchUrl: store.searchUrl(query),
    };
  });
}
