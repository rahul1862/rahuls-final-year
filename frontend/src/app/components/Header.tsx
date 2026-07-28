import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Search, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

const NAV_ITEMS = [
  { label: 'Products',  path: '/products' },
  { label: 'Deals',     path: '/deals' },
  { label: 'Sell',      path: '/sell' },
  { label: 'My Orders', path: '/orders' },
  { label: 'About',     path: '/about' },
  { label: 'Contact',   path: '/contact' },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { getCartCount }     = useCart();
  const { getWishlistCount } = useWishlist();
  const { user, logout }     = useAuth();
  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);

  const cartCount     = getCartCount();
  const wishlistCount = getWishlistCount();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setUserMenuOpen(false);
      setSearchOpen(false);
      setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `relative text-sm font-medium py-2 transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[2px] after:bg-primary after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100 ${
      isActive(path) ? 'text-foreground after:scale-x-100' : 'text-muted-foreground hover:text-foreground after:scale-x-0'
    }`;

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="sticky top-0 z-50"
    >
      <div
        className="transition-all duration-300 border-b border-border"
        style={{
          background:     scrolled ? 'rgba(251,248,243,0.88)' : 'var(--background)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <button
              onClick={() => navigate('/')}
              className="font-display italic text-2xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors duration-200"
            >
              Vendr
            </button>

            <nav aria-label="Main" className="hidden md:flex items-center gap-7">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  aria-current={isActive(item.path) ? 'page' : undefined}
                  className={navLinkClass(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(v => !v)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label="Search"
                aria-expanded={searchOpen}
                aria-controls="header-search"
              >
                <Search style={{ width: '1.05rem', height: '1.05rem' }} />
              </button>

              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label={wishlistCount > 0 ? `Wishlist, ${wishlistCount} items` : 'Wishlist'}
              >
                <Heart style={{ width: '1.05rem', height: '1.05rem' }} aria-hidden="true" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] bg-primary text-primary-foreground rounded-full text-[9px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'}
              >
                <ShoppingCart style={{ width: '1.05rem', height: '1.05rem' }} aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] bg-primary text-primary-foreground rounded-full text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-all text-sm"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                  >
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[11px] font-bold shrink-0">
                      {user.name[0]?.toUpperCase()}
                    </span>
                    <span className="text-foreground font-medium max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div role="menu" className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lift py-1.5 z-50">
                        <div className="px-3.5 py-2.5 border-b border-border">
                          <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <button
                          role="menuitem"
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="w-full text-left px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" /> Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:block">
                  <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
                    Sign in
                  </Button>
                </div>
              )}

              <div className="hidden sm:block ml-1">
                <Button size="sm" onClick={() => navigate('/products')}>
                  Shop now
                </Button>
              </div>

              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                key="search"
                id="header-search"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSearch} className="pb-4">
                  <label htmlFor="header-search-input" className="sr-only">Search products</label>
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-border bg-surface focus-within:border-primary transition-colors">
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                    <input
                      id="header-search-input"
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground" aria-label="Clear search">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile"
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden border-t border-border bg-background"
            >
              <div className="px-6 py-6 flex flex-col gap-1">
                <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-border bg-surface mb-4 focus-within:border-primary transition-colors">
                  <label htmlFor="mobile-search-input" className="sr-only">Search products</label>
                  <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="mobile-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none"
                  />
                </form>

                {NAV_ITEMS.map((item, i) => (
                  <motion.button
                    key={item.path}
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                    className="text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      color:      isActive(item.path) ? 'var(--foreground)' : 'var(--muted-foreground)',
                      background: isActive(item.path) ? 'var(--secondary)'  : 'transparent',
                    }}
                  >
                    {item.label}
                  </motion.button>
                ))}

                <Button className="mt-4" onClick={() => { navigate('/products'); setMobileOpen(false); }}>
                  Shop now
                </Button>

                {user ? (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 px-2 py-2 mb-2">
                      <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {user.name[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" aria-hidden="true" /> Sign out
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                    <Button variant="secondary" onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                      Sign in
                    </Button>
                    <Button variant="secondary" onClick={() => { navigate('/register'); setMobileOpen(false); }}>
                      Create account
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
