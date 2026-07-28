import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, X, Tag, Truck } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getStock } from '../utils/stock';
import { EmptyState } from '../components/ui/EmptyState';
import { Button, LinkButton } from '../components/ui/Button';

const UNDO_WINDOW_MS = 6000;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;
const TAX_RATE = 0.08;

export function Cart() {
  const { cart, removeFromCart, updateQuantity, addToCart, getCartTotal, discountCode, discountPercent, applyDiscount, clearDiscount } = useCart();
  const { show: showToast } = useToast();
  const [pendingRemoval, setPendingRemoval] = useState<CartItem | null>(null);
  const [codeInput, setCodeInput] = useState('');
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

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const result = applyDiscount(codeInput);
    showToast(result.message, result.ok ? 'success' : 'error');
    if (result.ok) setCodeInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Nothing in here yet. Products you add will show up on this page, with a price breakdown before you check out."
          action={
            <LinkButton to="/products" size="lg">
              Browse products <ArrowRight className="w-4 h-4" />
            </LinkButton>
          }
        />
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const discount = subtotal * discountPercent;
  const total = subtotal + shipping + tax - discount;
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2 tracking-tight">Shopping cart</h1>
          <p className="text-muted-foreground text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
        </div>

        {pendingRemoval && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
            <span className="text-muted-foreground">Removed <span className="text-foreground font-medium">{pendingRemoval.name}</span> from cart.</span>
            <button onClick={handleUndo} className="ml-auto font-medium text-primary underline underline-offset-2">
              Undo
            </button>
            <button onClick={() => setPendingRemoval(null)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
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
                <div key={item.id} className="flex gap-5 rounded-xl p-5 border border-border bg-card">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-secondary">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">{item.category} · {item.flag} {item.country}</p>
                      <h3 className="font-semibold text-foreground text-base line-clamp-2">{item.name}</h3>
                      {atMax && <p className="text-xs text-primary mt-1">Only {stock} available — max reached</p>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 rounded-lg overflow-hidden border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <motion.span
                          key={item.quantity}
                          initial={{ scale: 0.6, opacity: 0.4 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                          className="block w-8 text-center text-sm font-semibold text-foreground"
                        >
                          {item.quantity}
                        </motion.span>
                        <button
                          onClick={() => updateQuantity(item.id, Math.min(item.quantity + 1, stock))}
                          disabled={atMax}
                          aria-label="Increase quantity"
                          className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-foreground text-base tabular-nums">${(item.price * item.quantity).toFixed(2)}</div>
                        <button
                          onClick={() => handleRemove(item)}
                          className="flex items-center gap-1 text-xs mt-1 text-muted-foreground hover:text-primary transition-colors"
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
            <div className="rounded-xl p-6 border border-border bg-card sticky top-24">
              <h2 className="text-base font-bold text-foreground mb-5">Order summary</h2>

              <div className="mb-5 pb-5 border-b border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" aria-hidden="true" /> Free shipping progress</span>
                  <span>{shipping === 0 ? 'Unlocked' : `$${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} to go`}</span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className={`h-full w-full rounded-full origin-left ${shipping === 0 ? 'bg-accent-pine' : 'bg-primary'}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: shippingProgress / 100 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-5 pb-5 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground tabular-nums">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="text-foreground tabular-nums">${tax.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-accent-pine flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" aria-hidden="true" /> {discountCode}
                    </span>
                    <span className="text-accent-pine tabular-nums">−${discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground tabular-nums">${total.toFixed(2)}</span>
              </div>

              {discountCode ? (
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-xs mb-5 border border-accent-pine/30 bg-accent-pine/5 text-accent-pine">
                  <span>Code <strong>{discountCode}</strong> applied</span>
                  <button onClick={clearDiscount} className="underline underline-offset-2 hover:no-underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCode} className="flex gap-2 mb-5">
                  <label htmlFor="discount-code" className="sr-only">Discount code</label>
                  <input
                    id="discount-code"
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value)}
                    placeholder="Discount code"
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder-muted-foreground outline-none focus:border-primary transition-colors"
                  />
                  <Button type="submit" variant="secondary" size="sm" className="whitespace-nowrap">
                    Apply
                  </Button>
                </form>
              )}

              {subtotal <= FREE_SHIPPING_THRESHOLD && (
                <div className="rounded-lg px-3 py-2.5 text-xs mb-5 border border-border text-muted-foreground bg-surface">
                  Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.
                </div>
              )}

              <LinkButton to="/checkout" size="lg" className="w-full mb-3">
                Proceed to checkout
              </LinkButton>
              <LinkButton to="/products" variant="ghost" className="w-full">
                Continue shopping
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
