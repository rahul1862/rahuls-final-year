import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { getStock } from '../utils/stock';

const UNDO_WINDOW_MS = 6000;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

export function Cart() {
  const { cart, removeFromCart, updateQuantity, addToCart, getCartTotal } = useCart();
  const [pendingRemoval, setPendingRemoval] = useState<CartItem | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.id);
    setPendingRemoval(item);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setPendingRemoval(null), UNDO_WINDOW_MS);
  };

  const handleUndo = () => {
    if (!pendingRemoval) return;
    addToCart(pendingRemoval, pendingRemoval.quantity);
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setPendingRemoval(null);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-white px-4 text-center">
        <div className="w-16 h-16 rounded-lg flex items-center justify-center border border-[#e4e4e7]">
          <ShoppingBag className="w-7 h-7 text-[#a1a1aa]" />
        </div>
        <h2 className="text-2xl font-bold text-[#0a0a0a]">Your cart is empty</h2>
        <p className="text-sm text-[#71717a] max-w-sm">
          Nothing in here yet. Products you add will show up on this page, with a price breakdown before you check out.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#0a0a0a] hover:bg-[#2a2a2a] transition-colors"
        >
          Browse products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2 tracking-tight">Shopping cart</h1>
          <p className="text-[#71717a] text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
        </div>

        {pendingRemoval && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-4 py-3 text-sm">
            <span className="text-[#71717a]">Removed <span className="text-[#0a0a0a] font-medium">{pendingRemoval.name}</span> from cart.</span>
            <button onClick={handleUndo} className="ml-auto font-medium text-[#0a0a0a] underline underline-offset-2">
              Undo
            </button>
            <button onClick={() => setPendingRemoval(null)} aria-label="Dismiss" className="text-[#a1a1aa] hover:text-[#0a0a0a]">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => {
              const stock = getStock(item.id);
              const atMax = item.quantity >= stock;
              return (
                <div key={item.id} className="flex gap-5 rounded-lg p-5 border border-[#e4e4e7]">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-[#f4f4f5]">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="text-xs mb-1 text-[#a1a1aa]">{item.category} · {item.flag} {item.country}</p>
                      <h3 className="font-semibold text-[#0a0a0a] text-base line-clamp-2">{item.name}</h3>
                      {atMax && <p className="text-xs text-[#71717a] mt-1">Only {stock} available — max reached</p>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-[#e4e4e7]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 flex items-center justify-center text-[#71717a] hover:bg-[#fafafa] hover:text-[#0a0a0a] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-[#0a0a0a]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, stock))}
                          disabled={atMax}
                          aria-label="Increase quantity"
                          className="w-9 h-9 flex items-center justify-center text-[#71717a] hover:bg-[#fafafa] hover:text-[#0a0a0a] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#0a0a0a] text-base">${(item.price * item.quantity).toFixed(2)}</div>
                        <button
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1 text-xs mt-1 text-[#a1a1aa] hover:text-[#0a0a0a] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-lg p-6 border border-[#e4e4e7] sticky top-24">
              <h2 className="text-base font-bold text-[#0a0a0a] mb-6">Order summary</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-[#e4e4e7]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#71717a]">Subtotal</span>
                  <span className="text-[#0a0a0a]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#71717a]">Shipping</span>
                  <span className="text-[#0a0a0a]">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#71717a]">Tax (8%)</span>
                  <span className="text-[#0a0a0a]">${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-[#0a0a0a]">Total</span>
                <span className="text-xl font-bold text-[#0a0a0a]">${total.toFixed(2)}</span>
              </div>

              {subtotal <= FREE_SHIPPING_THRESHOLD && (
                <div className="rounded-lg px-3 py-2.5 text-xs mb-5 border border-[#e4e4e7] text-[#71717a] bg-[#fafafa]">
                  Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.
                </div>
              )}

              <Link
                to="/checkout"
                className="block w-full text-center py-3.5 rounded-lg text-sm font-semibold text-white bg-[#0a0a0a] hover:bg-[#2a2a2a] transition-colors mb-3"
              >
                Proceed to checkout
              </Link>
              <Link
                to="/products"
                className="block w-full text-center py-2.5 rounded-lg text-sm font-medium text-[#71717a] hover:text-[#0a0a0a] transition-colors"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
