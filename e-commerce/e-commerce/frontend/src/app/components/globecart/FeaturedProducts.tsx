import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ShoppingCart, Star, Heart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface Product {
  id: number;
  flag: string;
  country: string;
  name: string;
  category: string;
  price: string;
  priceNum: number;
  originalPrice?: string;
  rating: number;
  reviews: number;
  badge?: string;
  icon: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    flag: '🇯🇵',
    country: 'Japan',
    name: 'Sony WF-1000XM5 ANC Earbuds',
    category: 'Electronics',
    price: '$279',
    priceNum: 279,
    originalPrice: '$349',
    rating: 4.9,
    reviews: 8420,
    badge: 'Best seller',
    icon: '🎧',
  },
  {
    id: 2,
    flag: '🇰🇷',
    country: 'South Korea',
    name: 'COSRX Advanced Snail 96 Mucin',
    category: 'Skincare',
    price: '$28',
    priceNum: 28,
    rating: 4.8,
    reviews: 22100,
    badge: 'Viral',
    icon: '✨',
  },
  {
    id: 3,
    flag: '🇮🇹',
    country: 'Italy',
    name: 'Artisan Full-Grain Leather Tote',
    category: 'Fashion',
    price: '$345',
    priceNum: 345,
    rating: 4.7,
    reviews: 3200,
    badge: 'Handmade',
    icon: '👜',
  },
  {
    id: 4,
    flag: '🇨🇭',
    country: 'Switzerland',
    name: 'Hamilton Khaki Field Auto 38mm',
    category: 'Watches',
    price: '$495',
    priceNum: 495,
    originalPrice: '$595',
    rating: 4.9,
    reviews: 5670,
    badge: 'Premium',
    icon: '⌚',
  },
  {
    id: 5,
    flag: '🇦🇪',
    country: 'Dubai',
    name: '14K Gold Cuban Link Chain 20"',
    category: 'Jewelry',
    price: '$680',
    priceNum: 680,
    rating: 4.8,
    reviews: 1890,
    badge: 'Luxury',
    icon: '💎',
  },
  {
    id: 6,
    flag: '🇧🇷',
    country: 'Brazil',
    name: 'Havaianas × Artist Collab Edition',
    category: 'Footwear',
    price: '$65',
    priceNum: 65,
    rating: 4.6,
    reviews: 7340,
    badge: 'Limited',
    icon: '👟',
  },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.priceNum,
      image: product.icon,
      description: `${product.category} from ${product.country}`,
      category: product.category,
      rating: product.rating,
      reviews: product.reviews,
      country: product.country,
      flag: product.flag,
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); navigate('/cart'); }, 1000);
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="group border border-[#e4e4e7] rounded-lg overflow-hidden bg-white flex flex-col transition-colors hover:border-[#c8102e]"
    >
      <div className="relative h-48 flex-shrink-0 bg-[#fafafa] flex items-center justify-center">
        <span className="text-6xl select-none">{product.icon}</span>

        {product.badge && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium text-white bg-[#c8102e]">
            {product.badge}
          </div>
        )}

        {product.originalPrice && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs text-[#a1a1aa] bg-white border border-[#e4e4e7] line-through">
            {product.originalPrice}
          </div>
        )}

        <button
          onClick={e => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-white border border-[#e4e4e7] opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Wishlist"
        >
          <Heart
            className="w-4 h-4"
            style={{ color: wishlisted ? '#c8102e' : '#a1a1aa', fill: wishlisted ? '#c8102e' : 'none' }}
          />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">{product.flag}</span>
          <span className="text-xs text-[#a1a1aa]">{product.country}</span>
          <span className="text-[#e4e4e7]">·</span>
          <span className="text-xs text-[#a1a1aa]">{product.category}</span>
        </div>

        <h3 className="text-sm font-semibold text-[#0a0a0a] mb-3 line-clamp-2 leading-snug flex-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-[#e4e4e7]'}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-[#71717a]">{product.rating}</span>
          <span className="text-xs text-[#a1a1aa]">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f0f0f0]">
          <div>
            <span className="text-base font-bold text-[#0a0a0a]">{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-[#a1a1aa] ml-2 line-through">{product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e4e4e7] rounded-lg text-xs font-medium transition-all duration-200"
            style={added
              ? { background: '#c8102e', color: '#ffffff', borderColor: '#c8102e' }
              : { color: '#0a0a0a' }
            }
            onMouseEnter={e => { if (!added) { (e.currentTarget as HTMLElement).style.background = '#c8102e'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; (e.currentTarget as HTMLElement).style.borderColor = '#c8102e'; } }}
            onMouseLeave={e => { if (!added) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#0a0a0a'; (e.currentTarget as HTMLElement).style.borderColor = '#e4e4e7'; } }}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            {added ? 'Added!' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedProducts() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-[#fafafa] border-y border-[#e4e4e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-[#0a0a0a] tracking-tight mb-2">Featured products</h2>
            <p className="text-[#71717a] text-sm">A rotating pick of six items our sellers are shipping the most this week.</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-[#0a0a0a] border border-[#e4e4e7] bg-white hover:bg-[#f4f4f5] transition-colors self-start sm:self-auto"
          >
            View all products
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
