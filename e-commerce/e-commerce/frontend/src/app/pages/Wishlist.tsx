import { Link } from 'react-router';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { isOutOfStock } from '../utils/stock';

export function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-14 pb-8 border-b border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2 tracking-tight">Wishlist</h1>
          <p className="text-[#71717a] text-sm">
            {wishlist.length === 0 ? 'Nothing saved yet.' : `${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map(product => {
              const outOfStock = isOutOfStock(product.id);
              return (
                <div key={product.id} className="border border-[#e4e4e7] rounded-xl overflow-hidden bg-white flex flex-col">
                  <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-[#f4f4f5] group">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'grayscale opacity-60' : ''}`}
                    />
                    {outOfStock && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-white border border-[#e4e4e7] text-[#0a0a0a]">
                        Out of stock
                      </span>
                    )}
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{product.flag}</span>
                      <span className="text-[#a1a1aa] text-xs">{product.country}</span>
                    </div>
                    <h3 className="text-[#0a0a0a] font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-[#0a0a0a] font-bold mb-3">${product.price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => { addToCart(product); removeFromWishlist(product.id); }}
                        disabled={outOfStock}
                        className="flex-1 bg-[#0a0a0a] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#2a2a2a] disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {outOfStock ? 'Unavailable' : 'Add to cart'}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label="Remove from wishlist"
                        className="w-9 h-9 border border-[#e4e4e7] rounded-lg flex items-center justify-center text-[#a1a1aa] hover:text-[#0a0a0a] hover:border-[#0a0a0a] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center border border-[#e4e4e7] mx-auto mb-5">
              <Heart className="w-6 h-6 text-[#a1a1aa]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">Your wishlist is empty</h3>
            <p className="text-[#71717a] text-sm mb-6 max-w-sm mx-auto">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              Browse products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
