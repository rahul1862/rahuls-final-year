import { useState } from 'react';
import { Link } from 'react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

function isOutOfStock(id: number) {
  return id % 7 === 0;
}

function getDiscountPercent(id: number) {
  if (id % 4 !== 0) return null;
  return 10 + (id % 3) * 5;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const outOfStock = isOutOfStock(product.id);
  const discountPercent = outOfStock ? null : getDiscountPercent(product.id);
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
      <div className="border border-[#e4e4e7] rounded-xl overflow-hidden bg-white h-full flex flex-col transition-all duration-300 group-hover:border-[#0a0a0a] group-focus-within:border-[#0a0a0a] group-hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="aspect-square overflow-hidden relative bg-[#f4f4f5]">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              outOfStock ? 'grayscale opacity-70' : 'group-hover:scale-105'
            }`}
          />

          <button
            onClick={handleWishlist}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={isWishlisted}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity bg-white border border-[#e4e4e7] hover:border-[#0a0a0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a]"
          >
            <Heart
              className="w-4 h-4"
              aria-hidden="true"
              style={{ color: isWishlisted ? '#0a0a0a' : '#a1a1aa', fill: isWishlisted ? '#0a0a0a' : 'none' }}
            />
          </button>

          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-[#0a0a0a] border border-[#e4e4e7]">
              {product.flag} {product.country}
            </div>
            {discountPercent && (
              <div className="px-2 py-1 bg-[#0a0a0a] rounded-md text-xs font-semibold text-white">
                -{discountPercent}%
              </div>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-x-0 bottom-0 bg-[#0a0a0a]/90 text-white text-xs font-medium text-center py-1.5">
              Out of stock
            </div>
          )}
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-[#a1a1aa] mb-1">{product.category}</p>
          <h3 className="text-sm font-semibold text-[#0a0a0a] mb-3 line-clamp-2 leading-snug flex-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className={`text-base font-bold ${outOfStock ? 'text-[#a1a1aa]' : 'text-[#0a0a0a]'}`}>
                ${product.price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-xs text-[#a1a1aa] line-through">${originalPrice.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              aria-label={outOfStock ? `${product.name} is out of stock` : added ? 'Added to cart' : `Add ${product.name} to cart`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a] ${
                outOfStock
                  ? 'border-[#e4e4e7] text-[#a1a1aa] cursor-not-allowed'
                  : added
                    ? 'bg-[#0a0a0a] text-white border-[#0a0a0a]'
                    : 'border-[#e4e4e7] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white hover:border-[#0a0a0a]'
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
