import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { recordView } from '../utils/recentlyViewed';
import { getStock, isLowStock } from '../utils/stock';
import { Star, ShoppingCart, Heart, ArrowLeft, Shield, Truck, RotateCcw, Award, Check, AlertTriangle } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ProductCard';

export function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const product = products.find(p => p.id === Number(id));
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const stock = product ? getStock(product.id) : 0;
  const outOfStock = product ? stock === 0 : false;

  useEffect(() => { if (product) recordView(product); }, [product?.id]);
  useEffect(() => { if (!status) return; const t = setTimeout(() => setStatus(null), 2500); return () => clearTimeout(t); }, [status]);
  useEffect(() => { setQuantity(1); }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-white px-4 text-center">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">We couldn't find that product</h1>
        <p className="text-[#71717a] text-sm max-w-sm">
          It may have been removed, or the link you followed is out of date.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#0a0a0a] text-white hover:bg-[#2a2a2a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (next: number) => {
    setQuantity(Math.min(Math.max(1, next), Math.max(1, stock)));
  };

  const handleAddToCart = () => {
    if (outOfStock) {
      setStatus({ type: 'error', message: 'This item is currently out of stock.' });
      return;
    }
    addToCart(product, quantity);
    setStatus({ type: 'success', message: `Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to your cart.` });
  };

  const handleWishlist = () => {
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const relatedProducts = products.filter(p => p.country === product.country && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 text-[#71717a] hover:text-[#0a0a0a] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden relative bg-[#f4f4f5] border border-[#e4e4e7]">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/90 backdrop-blur-sm border border-[#e4e4e7] text-[#0a0a0a]">
                <span>{product.flag}</span>
                <span>{product.country}</span>
              </div>
              <button
                onClick={handleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`absolute top-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                  isWishlisted ? 'bg-white border-[#0a0a0a]' : 'bg-white/90 border-[#e4e4e7] hover:border-[#0a0a0a]'
                }`}
              >
                <Heart className="w-5 h-5" style={{ color: isWishlisted ? '#0a0a0a' : '#a1a1aa', fill: isWishlisted ? '#0a0a0a' : 'none' }} />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-[#a1a1aa]">{product.category}</p>
              <h1 className="text-3xl font-bold text-[#0a0a0a] mb-4 leading-tight">{product.name}</h1>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4"
                      style={{ color: i < Math.floor(product.rating) ? '#f59e0b' : '#e4e4e7', fill: i < Math.floor(product.rating) ? '#f59e0b' : 'none' }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-[#0a0a0a]">{product.rating}</span>
                <span className="text-sm text-[#a1a1aa]">{product.reviews} reviews</span>
              </div>

              <div className="text-4xl font-bold text-[#0a0a0a] mb-4">${product.price.toFixed(2)}</div>

              {outOfStock ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0a0a] bg-[#f4f4f5] border border-[#e4e4e7] rounded-lg px-3 py-1.5 mb-5">
                  Out of stock
                </p>
              ) : isLowStock(product.id) ? (
                <p className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a0a0a] bg-[#f4f4f5] border border-[#e4e4e7] rounded-lg px-3 py-1.5 mb-5">
                  Only {stock} left in stock
                </p>
              ) : (
                <p className="text-sm text-[#71717a] mb-5">In stock</p>
              )}

              <p className="text-sm leading-relaxed text-[#71717a]">{product.description}</p>
            </div>

            {/* Quantity selector */}
            {!outOfStock && (
              <div className="rounded-lg p-5 border border-[#e4e4e7]">
                <p className="text-xs font-semibold uppercase tracking-wide mb-4 text-[#a1a1aa]">Quantity</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-[#e4e4e7]">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-lg font-medium text-[#71717a] hover:bg-[#fafafa] hover:text-[#0a0a0a] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-bold text-[#0a0a0a] text-lg">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= stock}
                      className="w-10 h-10 flex items-center justify-center text-lg font-medium text-[#71717a] hover:bg-[#fafafa] hover:text-[#0a0a0a] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-[#71717a]">
                    Total: <span className="text-[#0a0a0a] font-semibold">${(product.price * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-semibold text-white bg-[#0a0a0a] hover:bg-[#2a2a2a] disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {outOfStock ? 'Out of stock' : 'Add to cart'}
              </button>

              {status && (
                <div
                  className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2.5 border ${
                    status.type === 'success' ? 'border-[#e4e4e7] text-[#0a0a0a] bg-[#fafafa]' : 'border-[#e4e4e7] text-[#0a0a0a] bg-[#f4f4f5]'
                  }`}
                >
                  {status.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{status.message}</span>
                  {status.type === 'success' && (
                    <Link to="/cart" className="ml-auto underline underline-offset-2 shrink-0">View cart</Link>
                  )}
                </div>
              )}

              <button
                onClick={handleWishlist}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-semibold border transition-colors ${
                  isWishlisted ? 'border-[#0a0a0a] text-[#0a0a0a]' : 'border-[#e4e4e7] text-[#71717a] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                }`}
              >
                <Heart className="w-5 h-5" style={{ fill: isWishlisted ? '#0a0a0a' : 'none' }} />
                {isWishlisted ? 'Wishlisted' : 'Add to wishlist'}
              </button>
            </div>

            {/* Included */}
            <div className="rounded-lg p-5 border border-[#e4e4e7]">
              <p className="text-xs font-semibold uppercase tracking-wide mb-4 text-[#a1a1aa]">Included</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Truck, label: 'Free shipping on $100+' },
                  { icon: RotateCcw, label: '30-day returns' },
                  { icon: Shield, label: '1-year warranty' },
                  { icon: Award, label: 'Authenticity guaranteed' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-[#71717a]">
                    <Icon className="w-4 h-4 shrink-0 text-[#0a0a0a]" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xl">{product.flag}</span>
              <h2 className="text-xl font-bold text-[#0a0a0a]">More from {product.country}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
