import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router';
import { recordView } from '../utils/recentlyViewed';
import { getStock, isLowStock } from '../utils/stock';
import { getProductBadge, getDiscountPercent } from '../utils/productBadges';
import { ShoppingCart, Heart, ArrowLeft, Shield, Truck, RotateCcw, Award, ZoomIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useCountry } from '../context/CountryContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ProductCard';
import { PriceComparison } from '../components/PriceComparison';
import { StorePriceComparison } from '../components/StorePriceComparison';
import { Badge } from '../components/ui/Badge';
import { RatingStars } from '../components/ui/RatingStars';
import { Button, LinkButton } from '../components/ui/Button';
import type { Product } from '../context/CartContext';

const GALLERY_CROPS = ['entropy', 'top', 'bottom'];

function buildGalleryImages(url: string): string[] {
  if (!url.includes('images.unsplash.com')) return [url];
  return GALLERY_CROPS.map(crop => `${url}&h=900&crop=${crop}`);
}

function buildHighlights(product: Product): string[] {
  return [
    `Genuine ${product.category.toLowerCase()} sourced directly from ${product.country}`,
    `Rated ${product.rating} from ${product.reviews.toLocaleString()} verified buyers`,
    'Quality-checked by our team before it ships',
    "Backed by Vendr's 30-day return policy",
  ];
}

const REVIEW_POOL = [
  { name: 'Alex P.', text: 'Exactly as described and it arrived faster than I expected.' },
  { name: 'Jordan K.', text: "Good quality for the price — I'd order from here again." },
  { name: 'Sam T.', text: 'Packaging was excellent and the product feels premium in hand.' },
  { name: 'Morgan L.', text: 'Took a little while to arrive, but support was responsive when I asked.' },
  { name: 'Casey R.', text: 'Better than I expected honestly, it matches the photos well.' },
  { name: 'Riley N.', text: 'Solid purchase — works great and looks even better in person.' },
];

function buildReviews(product: Product) {
  const start = product.id % REVIEW_POOL.length;
  return [0, 1, 2].map(offset => {
    const pooled = REVIEW_POOL[(start + offset) % REVIEW_POOL.length];
    const rating = offset === 2 ? Math.max(3, Math.round(product.rating) - 1) : Math.round(product.rating);
    return { ...pooled, rating };
  });
}

export function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { show: showToast } = useToast();
  const { getCurrency } = useCountry();
  const currency = getCurrency();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const zoomOverlayRef = useRef<HTMLDivElement>(null);

  const product = products.find(p => p.id === Number(id));
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const stock = product ? getStock(product.id) : 0;
  const outOfStock = product ? stock === 0 : false;
  const badge = product ? getProductBadge(product.id, outOfStock) : null;
  const discountPercent = product ? getDiscountPercent(product.id) : null;
  const originalPrice = product && discountPercent ? product.price / (1 - discountPercent / 100) : null;
  const stockStatus = outOfStock
    ? { text: 'Out of stock', className: 'text-foreground bg-secondary border-border' }
    : product && isLowStock(product.id)
    ? { text: `Only ${stock} left in stock — order soon`, className: 'text-primary bg-accent-soft border-primary/20' }
    : { text: 'In stock and ready to ship', className: 'text-accent-pine bg-accent-pine/10 border-accent-pine/20' };

  const galleryImages = useMemo(() => (product ? buildGalleryImages(product.image) : []), [product]);
  const highlights = useMemo(() => (product ? buildHighlights(product) : []), [product]);
  const productReviews = useMemo(() => (product ? buildReviews(product) : []), [product]);

  useEffect(() => { if (product) recordView(product); }, [product?.id]);
  useEffect(() => { setQuantity(1); setActiveImage(0); }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background px-4 text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">We couldn't find that product</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          It may have been removed, or the link you followed is out of date.
        </p>
        <LinkButton to="/products">
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </LinkButton>
      </div>
    );
  }

  const handleQuantityChange = (next: number) => {
    setQuantity(Math.min(Math.max(1, next), Math.max(1, stock)));
  };

  const handleAddToCart = () => {
    if (outOfStock) {
      showToast('This item is currently out of stock.', 'error');
      return;
    }
    addToCart(product, quantity);
    showToast(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to your cart.`, 'success');
  };

  const handleWishlist = () => {
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (zoomOverlayRef.current) zoomOverlayRef.current.style.backgroundPosition = `${x}% ${y}%`;
  };

  const relatedProducts = useMemo(
    () => products.filter(p => p.country === product.country && p.id !== product.id).slice(0, 4),
    [products, product.id, product.country]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-medium mb-8 text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <div
              className="group aspect-square rounded-2xl overflow-hidden relative bg-secondary border border-border cursor-zoom-in"
              onMouseMove={handleZoomMove}
            >
              <ImageWithFallback
                src={galleryImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div
                ref={zoomOverlayRef}
                className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                style={{
                  backgroundImage: `url(${galleryImages[activeImage]})`,
                  backgroundSize: '210%',
                  backgroundPosition: '50% 50%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <div className="hidden md:flex absolute bottom-3 right-3 items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/90 border border-border text-muted-foreground opacity-100 group-hover:opacity-0 transition-opacity duration-150">
                <ZoomIn className="w-3 h-3" aria-hidden="true" /> Hover to zoom
              </div>
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <Badge variant="country">{product.flag} {product.country}</Badge>
                {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
              </div>
              <button
                onClick={handleWishlist}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`absolute top-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${
                  isWishlisted ? 'bg-white border-primary' : 'bg-white/90 border-border hover:border-primary'
                }`}
              >
                <Heart
                  className="w-5 h-5"
                  style={{
                    color: isWishlisted ? 'var(--primary)' : 'var(--muted-foreground)',
                    fill: isWishlisted ? 'var(--primary)' : 'none',
                  }}
                />
              </button>
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-3 mt-3">
                {galleryImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show image ${i + 1}`}
                    aria-current={activeImage === i}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                      activeImage === i ? 'border-primary' : 'border-transparent hover:border-border-strong'
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-muted-foreground">{product.category}</p>
              <h1 className="font-display text-3xl font-semibold text-foreground mb-4 leading-tight">{product.name}</h1>

              <div className="mb-5">
                <RatingStars rating={product.rating} reviews={product.reviews} size="md" showValue />
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-4xl font-bold text-foreground tabular-nums">{currency.symbol}{product.price.toFixed(2)}</span>
                {originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through tabular-nums">{currency.symbol}{originalPrice.toFixed(2)}</span>
                    <Badge variant="sale">Save {discountPercent}%</Badge>
                  </>
                )}
              </div>

              <p className={`inline-flex items-center gap-1.5 text-sm font-medium rounded-lg border px-3 py-1.5 mb-5 ${stockStatus.className}`}>
                {stockStatus.text}
              </p>

              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            <ul className="space-y-2">
              {highlights.map(point => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PriceComparison priceUsd={product.price} />
              <StorePriceComparison productId={product.id} productName={product.name} priceUsd={product.price} />
            </div>

            {!outOfStock && (
              <div className="rounded-xl p-5 border border-border bg-surface">
                <p className="text-xs font-semibold uppercase tracking-wide mb-4 text-muted-foreground">Quantity</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-border bg-card">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-bold text-foreground text-lg overflow-hidden">
                      <motion.span
                        key={quantity}
                        initial={{ scale: 0.6, opacity: 0.4 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="block"
                      >
                        {quantity}
                      </motion.span>
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= stock}
                      className="w-10 h-10 flex items-center justify-center text-lg font-medium text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Total: <span className="text-foreground font-semibold">${(product.price * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button size="lg" onClick={handleAddToCart} disabled={outOfStock} className="w-full">
                <ShoppingCart className="w-5 h-5" />
                {outOfStock ? 'Out of stock' : 'Add to cart'}
              </Button>

              <button
                onClick={handleWishlist}
                className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-lg text-sm font-semibold border transition-colors ${
                  isWishlisted ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                <Heart className="w-5 h-5" style={{ fill: isWishlisted ? 'var(--primary)' : 'none' }} />
                {isWishlisted ? 'Wishlisted' : 'Add to wishlist'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl p-5 border border-border">
                <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-muted-foreground">Shipping</p>
                <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                  Free on orders over $100, delivered in 5–10 business days.
                </div>
              </div>
              <div className="rounded-xl p-5 border border-border">
                <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-muted-foreground">Returns</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <RotateCcw className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                    30-day returns, no questions asked.
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                    1-year warranty included.
                  </div>
                  <div className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Award className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                    Authenticity guaranteed.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-16 border-t border-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-semibold text-foreground">Customer reviews</h2>
            <RatingStars rating={product.rating} reviews={product.reviews} showValue />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {productReviews.map((review, i) => (
              <div key={i} className="rounded-xl p-5 border border-border bg-surface">
                <RatingStars rating={review.rating} size="sm" />
                <p className="text-sm text-foreground/80 leading-relaxed mt-3 mb-3">{review.text}</p>
                <p className="text-xs font-medium text-muted-foreground">{review.name}</p>
              </div>
            ))}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xl">{product.flag}</span>
              <h2 className="font-display text-xl font-semibold text-foreground">More from {product.country}</h2>
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
