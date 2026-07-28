import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import {
  Package, ShoppingBag, Search, Heart, ChevronDown, ChevronUp, Download,
  RotateCcw, MessageSquare, Truck, CheckCircle, Clock, Menu, X,
  ShoppingCart, ArrowRight, RefreshCw,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import type { Order } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import type { Product } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useToast } from '../context/ToastContext';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import { AccountSidebar } from '../components/AccountSidebar';
import { EmptyState } from '../components/ui/EmptyState';
import { Button, LinkButton } from '../components/ui/Button';
import { RatingStars } from '../components/ui/RatingStars';

type FilterMode = 'all' | 'active' | 'Delivered' | 'Cancelled';
type SortMode = 'latest' | 'oldest' | 'highest';

const TIMELINE_STEPS = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const STATUS_STEP: Record<string, number> = {
  Processing: 0, Packed: 1, Shipped: 2, 'Out for Delivery': 3, Delivered: 4,
};

const STATUS_STYLE: Record<string, { text: string; dot: string }> = {
  Processing:         { text: 'text-amber-700 bg-amber-50 border-amber-200',   dot: 'bg-amber-500' },
  Packed:             { text: 'text-blue-700 bg-blue-50 border-blue-200',      dot: 'bg-blue-500' },
  Shipped:            { text: 'text-blue-700 bg-blue-50 border-blue-200',      dot: 'bg-blue-500' },
  'Out for Delivery':  { text: 'text-indigo-700 bg-indigo-50 border-indigo-200', dot: 'bg-indigo-500' },
  Delivered:          { text: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  Cancelled:          { text: 'text-red-700 bg-red-50 border-red-200',         dot: 'bg-red-500' },
  Returned:           { text: 'text-purple-700 bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
};

function Timeline({ status }: { status: string }) {
  const step = STATUS_STEP[status] ?? -1;
  if (step < 0) return null;
  return (
    <div className="py-5">
      <div className="flex items-start">
        {TIMELINE_STEPS.map((label, i) => {
          const done = i <= step;
          const active = i === step;
          return (
            <div key={label} className="flex items-start flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                    done ? 'bg-primary border-primary' : 'bg-card border-border'
                  } ${active ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                >
                  {done
                    ? <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-border" />}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ maxWidth: 56 }}>
                  <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
                </span>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`flex-1 h-px mt-3.5 mx-1 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon, label, onClick, primary = false, danger = false,
}: {
  icon: React.ElementType; label: string; onClick: () => void;
  primary?: boolean; danger?: boolean;
}) {
  const cls = primary
    ? 'bg-primary text-primary-foreground border-transparent hover:bg-primary-hover'
    : danger
    ? 'text-destructive border-destructive/30 hover:bg-destructive/10'
    : 'text-muted-foreground border-border hover:bg-surface';
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${cls}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function OrderCard({
  order, onCancel, onReturn, onBuyAgain, onInvoice, onReview,
}: {
  order: Order;
  onCancel: () => void; onReturn: () => void; onBuyAgain: () => void;
  onInvoice: () => void; onReview: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const status = order.status ?? 'Processing';
  const style = STATUS_STYLE[status] ?? STATUS_STYLE['Processing'];
  const isClosed = ['Cancelled', 'Returned'].includes(status);
  const isActive = !['Delivered', 'Cancelled', 'Returned'].includes(status);
  const isDelivered = status === 'Delivered';

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${expanded ? 'bg-surface' : 'hover:bg-surface'}`}
      >
        <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{order.id}</p>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${style.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {status}
            </span>
          </div>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {fmtDate(order.date)}
            {order.estimatedDelivery && !isClosed ? ` · Est. ${fmtDate(order.estimatedDelivery)}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground">${order.total.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </p>
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border">
          {!isClosed ? (
            <Timeline status={status} />
          ) : (
            <div className="flex items-center gap-2 py-4">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${style.text}`}>
                <X className="w-3 h-3" />
              </div>
              <span className={`text-sm font-medium ${style.text.split(' ')[0]}`}>
                Order {status.toLowerCase()}
              </span>
            </div>
          )}

          <div className="space-y-3 mb-5">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-[10px] mt-0.5 text-muted-foreground">
                    {item.flag} {item.country} · Qty {item.quantity}
                  </p>
                  <div className="mt-1">
                    <RatingStars rating={item.rating} size="xs" />
                  </div>
                </div>
                <p className="text-xs font-semibold text-foreground shrink-0">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-muted-foreground">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-muted-foreground">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border font-semibold text-foreground">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs space-y-1 text-muted-foreground">
              <p className="text-foreground font-semibold text-sm mb-2">Shipped to</p>
              <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
              <p>{order.shippingInfo.address}</p>
              <p>{order.shippingInfo.city}, {order.shippingInfo.zipCode}</p>
              <p className="pt-0.5">{order.shippingInfo.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isActive && (
              <>
                <ActionBtn primary icon={Truck} label="Track order" onClick={() => {}} />
                <ActionBtn danger icon={X} label="Cancel order" onClick={onCancel} />
              </>
            )}
            {isDelivered && (
              <>
                <ActionBtn icon={MessageSquare} label="Leave review" onClick={onReview} />
                <ActionBtn icon={RotateCcw} label="Return item" onClick={onReturn} />
                <ActionBtn icon={Download} label="Download invoice" onClick={onInvoice} />
              </>
            )}
            <ActionBtn icon={RefreshCw} label="Buy again" onClick={onBuyAgain} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="border border-border rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground leading-none mb-0.5">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ProductMiniCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="cursor-pointer rounded-lg overflow-hidden shrink-0 w-44 border border-border hover:border-primary transition-colors"
    >
      <div className="w-full h-32 overflow-hidden bg-surface">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <p className="text-[10px] mb-0.5 text-muted-foreground">{product.flag} {product.country}</p>
        <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug mb-2">{product.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">${product.price.toFixed(2)}</span>
          <button
            onClick={e => { e.stopPropagation(); addToCart(product); }}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-surface"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCarousel({ title, items }: { title: string; items: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        <Link to="/products" className="text-xs font-medium flex items-center gap-1 text-muted-foreground hover:text-primary">
          See all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        {items.map(p => (
          <div key={p.id} className="snap-start">
            <ProductMiniCard product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NoOrdersYet() {
  const recentlyViewed = getRecentlyViewed();
  const { products } = useProducts();
  const trending = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 10);
  const flashDeals = products.filter(p => p.price < 80).slice(0, 10);
  return (
    <div>
      <div className="border border-border rounded-xl mb-10">
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="Once you place an order, you'll be able to track it here."
          action={
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <LinkButton to="/products">
                <ShoppingCart className="w-4 h-4" />
                Browse products
              </LinkButton>
              <LinkButton to="/deals" variant="secondary">See deals</LinkButton>
            </div>
          }
        />
      </div>

      {recentlyViewed.length > 0 && <ProductCarousel title="Recently viewed" items={recentlyViewed} />}
      <ProductCarousel title="Trending products" items={trending} />
      <ProductCarousel title="Flash deals" items={flashDeals} />
    </div>
  );
}

export function MyOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const { getWishlistCount } = useWishlist();
  const { addToCart } = useCart();
  const { show: showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort, setSort] = useState<SortMode>('latest');

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const inProgress = orders.filter(o =>
    !['Delivered', 'Cancelled', 'Returned'].includes(o.status ?? 'Processing')).length;
  const wishlistCnt = getWishlistCount();

  const filtered = orders
    .filter(o => {
      const s = o.status ?? 'Processing';
      if (filter === 'active') return !['Delivered', 'Cancelled', 'Returned'].includes(s);
      if (filter === 'Delivered') return s === 'Delivered';
      if (filter === 'Cancelled') return ['Cancelled', 'Returned'].includes(s);
      return true;
    })
    .filter(o => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return o.id.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sort === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === 'highest') return b.total - a.total;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handleBuyAgain = (order: Order) => {
    order.items.forEach(item => addToCart(item, item.quantity));
    showToast(`${order.items.length} item${order.items.length > 1 ? 's' : ''} added to cart`);
  };

  const handleInvoice = (order: Order) => {
    const html = `<!DOCTYPE html><html><head><title>Invoice ${order.id}</title>
<style>*{box-sizing:border-box}body{font-family:system-ui,sans-serif;padding:48px;color:#111;max-width:640px;margin:auto}
h1{font-size:1.5rem;margin-bottom:4px}p{margin:4px 0;font-size:.9rem;color:#555}
table{width:100%;border-collapse:collapse;margin:20px 0}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #eee;font-size:.875rem}
th{font-weight:600;color:#111;border-bottom:2px solid #ddd}.total{font-size:1rem;font-weight:700}hr{border:none;border-top:1px solid #eee;margin:16px 0}</style>
</head><body>
<h1>Invoice</h1>
<p><strong>Order:</strong> ${order.id}</p>
<p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
<hr/>
<p><strong>Ship to:</strong> ${order.shippingInfo.firstName} ${order.shippingInfo.lastName}</p>
<p>${order.shippingInfo.address}, ${order.shippingInfo.city} ${order.shippingInfo.zipCode}</p>
<p>${order.shippingInfo.email}</p>
<hr/>
<table>
  <tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
  ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${i.price.toFixed(2)}</td><td>$${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('')}
</table>
<hr/>
<p>Subtotal: $${order.subtotal.toFixed(2)}</p>
<p>Shipping: ${order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</p>
<p>Tax: $${order.tax.toFixed(2)}</p>
<p class="total">Total: $${order.total.toFixed(2)}</p>
</body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        <AccountSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6 lg:hidden">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg border border-border text-muted-foreground">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-foreground">My orders</h1>
                <p className="text-xs text-muted-foreground">Track your purchases</p>
              </div>
            </div>

            <div className="hidden lg:block mb-8">
              <h1 className="font-display text-3xl font-semibold text-foreground mb-1 tracking-tight">My orders</h1>
              <p className="text-muted-foreground text-sm">Track and manage everything you've bought.</p>
            </div>

            {orders.length > 0 && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatTile icon={Package} label="Total orders" value={orders.length} />
                <StatTile icon={Clock} label="In progress" value={inProgress} />
                <StatTile icon={Heart} label="Wishlist items" value={wishlistCnt} />
                <StatTile icon={Truck} label="Total spent" value={`$${totalSpent.toFixed(0)}`} />
              </div>
            )}

            {orders.length > 0 && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
                  <Search className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order ID or product name…"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(['all', 'active', 'Delivered', 'Cancelled'] as FilterMode[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        filter === f ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-surface'
                      }`}
                    >
                      {f === 'all' ? 'All orders' : f === 'active' ? 'In progress' : f}
                    </button>
                  ))}

                  <div className="ml-auto relative">
                    <select
                      value={sort}
                      onChange={e => setSort(e.target.value as SortMode)}
                      className="text-xs pl-3 pr-7 py-1.5 rounded-lg outline-none appearance-none cursor-pointer border border-border text-muted-foreground bg-card"
                    >
                      <option value="latest">Latest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest">Highest price</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-muted-foreground" />
                  </div>
                </div>
              </div>
            )}

            {orders.length === 0 ? (
              <NoOrdersYet />
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingBag className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground font-semibold mb-1">No orders match your filters</p>
                <p className="text-sm mb-4 text-muted-foreground">Try a different search or clear your filters.</p>
                <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setFilter('all'); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancel={() => { updateOrderStatus(order.id, 'Cancelled'); showToast('Order cancelled'); }}
                    onReturn={() => { updateOrderStatus(order.id, 'Returned'); showToast('Return initiated'); }}
                    onBuyAgain={() => handleBuyAgain(order)}
                    onInvoice={() => handleInvoice(order)}
                    onReview={() => showToast('Thank you for your review!')}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
