import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { products as defaultProducts } from '../data/products';
import type { Product } from './CartContext';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children, initialProducts }: { children: ReactNode; initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? defaultProducts);
  const [loading, setLoading] = useState(!initialProducts);

  useEffect(() => {
    if (initialProducts) return;
    // Always use default products - no backend fetch needed for product display
    setProducts(defaultProducts);
    setLoading(false);
  }, [initialProducts]);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within ProductsProvider');
  return context;
}