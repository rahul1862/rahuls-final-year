import { memo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/Badge';
import { getStock, isLowStock } from '../utils/stock';
import { getProductBadge, getDiscountPercent } from '../utils/productBadges';

interface ProductCardProps {
  product: Product;
}

function ProductCardComponent({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const stock = getStock(product.id);
  const outOfStock = stock === 0;
  const lowStock = isLowStock(product.id);
  const badge = getProductBadge(product.id, outOfStock);
  const discountPercent = getDiscountPercent(product.id);
  const originalPrice = discountPercent ? product.price / (1 - discountPercent / 100) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  return (
    <Link to={`/products/${product.id}`} className="group block h-full">
      <div className="rounded-2xl overflow-hidden bg-card h-full flex flex-col border border-border transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-card-hover group-focus-within:-translate-y-1 group-focus-within:border-primary/30 group-focus-within:shadow-card-hover">
        <div className="aspect-square overflow-hidden relative bg-secondary">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
              outOfStock ? 'grayscale opacity-70' : 'group-hover:scale-[1.07]'
            }`}
          />

          {!outOfStock && (
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          )}

          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={isWishlisted}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity bg-white/95 border border-border hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <motion.span
              key={isWishlisted ? 'on' : 'off'}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="flex"
            >
              <Heart
                className="w-4 h-4"
                aria-hidden="true"
                style={{
                  color: isWishlisted ? 'var(--primary)' : 'var(--muted-foreground)',
                  fill: isWishlisted ? 'var(--primary)' : 'none',
                }}
              />
            </motion.span>
          </button>

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            <Badge variant="country">
              {product.flag} {product.country}
            </Badge>
            {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
          </div>

          {outOfStock && (
            <div className="absolute inset-x-0 bottom-0 bg-foreground/90 text-white text-xs font-medium text-center py-1.5">
              Out of stock
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="text-sm font-semibold text-foreground mb-3 line-clamp-2 leading-snug flex-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-base font-bold tabular-nums ${outOfStock ? 'text-muted-foreground' : 'text-foreground'}`}>
                  ${product.price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-xs text-muted-foreground line-through tabular-nums">${originalPrice.toFixed(2)}</span>
                )}
              </div>
              {!outOfStock && lowStock && (
                <p className="text-[11px] font-medium text-primary mt-0.5">Only {stock} left</p>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              aria-label={outOfStock ? `${product.name} is out of stock` : added ? 'Added to cart' : `Add ${product.name} to cart`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                outOfStock
                  ? 'border-border text-muted-foreground cursor-not-allowed'
                  : added
                    ? 'bg-accent-pine text-accent-pine-foreground border-accent-pine'
                    : 'border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
              {outOfStock ? 'Sold out' : added ? 'Added!' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export const ProductCard = memo(ProductCardComponent);
