import { Link } from 'react-router';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { isOutOfStock } from '../utils/stock';
import { EmptyState } from '../components/ui/EmptyState';
import { LinkButton } from '../components/ui/Button';

export function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-14 pb-8 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2 tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground text-sm">
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
                <div key={product.id} className="border border-border rounded-2xl overflow-hidden bg-card flex flex-col">
                  <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-secondary group">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${outOfStock ? 'grayscale opacity-60' : ''}`}
                    />
                    {outOfStock && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium bg-card border border-border text-foreground">
                        Out of stock
                      </span>
                    )}
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{product.flag}</span>
                      <span className="text-muted-foreground text-xs">{product.country}</span>
                    </div>
                    <h3 className="text-foreground font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-foreground font-bold mb-3 tabular-nums">${product.price.toFixed(2)}</p>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => { addToCart(product); removeFromWishlist(product.id); }}
                        disabled={outOfStock}
                        className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-40 disabled:pointer-events-none transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {outOfStock ? 'Unavailable' : 'Add to cart'}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        aria-label="Remove from wishlist"
                        className="w-9 h-9 border border-border rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
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
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Tap the heart icon on any product to save it here for later."
            action={
              <LinkButton to="/products">
                Browse products <ArrowRight className="w-4 h-4" />
              </LinkButton>
            }
          />
        )}
      </div>
    </div>
  );
}
