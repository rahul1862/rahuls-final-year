const LOW_STOCK_THRESHOLD = 5;

export function getStock(productId: number): number {
  return (productId * 47) % 31;
}

export function isOutOfStock(productId: number): boolean {
  return getStock(productId) === 0;
}

export function isLowStock(productId: number): boolean {
  const stock = getStock(productId);
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
}
