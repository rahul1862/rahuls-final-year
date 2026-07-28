export type ProductBadgeVariant = 'sale' | 'new' | 'limited';

export interface ProductBadge {
  variant: ProductBadgeVariant;
  label: string;
}

export function getDiscountPercent(id: number): number | null {
  if (id % 4 !== 0) return null;
  return 10 + (id % 3) * 5;
}

function isNewArrival(id: number): boolean {
  return id % 5 === 0;
}

function isLimitedStock(id: number): boolean {
  return id % 9 === 0;
}

/**
 * A card shows at most one status badge — Sale beats Limited beats New —
 * so cards never get cluttered with conflicting claims.
 */
export function getProductBadge(id: number, outOfStock: boolean): ProductBadge | null {
  if (outOfStock) return null;
  const discount = getDiscountPercent(id);
  if (discount) return { variant: 'sale', label: `-${discount}%` };
  if (isLimitedStock(id)) return { variant: 'limited', label: 'Limited' };
  if (isNewArrival(id)) return { variant: 'new', label: 'New' };
  return null;
}
