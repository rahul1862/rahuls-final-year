import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router';
import { ShoppingCart, Search, Menu, X, Globe } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

interface NavLink {
  label: string;
  sectionId?: string;
  path?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Explore',   sectionId: 'hero' },
  { label: 'Countries', sectionId: 'countries' },
  { label: 'Assistant', sectionId: 'shop' },
  { label: 'Trending',  sectionId: 'featured' },
  { label: 'Deals',     path: '/deals' },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function GCNavbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [open, setOpen]           = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const navigate  = useNavigate();
  const location  = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const isHome    = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleLink = (link: NavLink) => {
    setOpen(false);
    if (link.path) {
      navigate(link.path);
      return;
    }
    if (link.sectionId) {
      if (isHome) {
        scrollTo(link.sectionId);
      } else {
        navigate('/');
        setTimeout(() => scrollTo(link.sectionId!), 200);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchVal.trim();
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
    setSearchVal('');
    setOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="sticky top-0 z-50"
    >
      <div
        className="transition-all duration-300"
        style={{
          background:    scrolled ? 'rgba(255,255,255,0.92)' : '#ffffff',
          borderBottom:  '1px solid #e4e4e7',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <button
              onClick={() => { isHome ? scrollTo('hero') : navigate('/'); }}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#0a0a0a]">
                Globe<span className="text-[#71717a]">Cart</span>
              </span>
            </button>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(link => (
                <button
                  key={link.label}
                  onClick={() => handleLink(link)}
                  className="text-sm font-medium text-[#71717a] hover:text-[#0a0a0a] transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e4e4e7] bg-[#fafafa]">
                <Search className="w-3.5 h-3.5 text-[#a1a1aa] flex-shrink-0" />
                <input
                  type="text"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent text-xs text-[#0a0a0a] placeholder-[#a1a1aa] outline-none w-28 focus:w-44 transition-all duration-300"
                />
              </form>

              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 rounded-lg text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#f4f4f5] transition-all"
                aria-label="Cart"
              >
                <ShoppingCart className="w-[1.05rem] h-[1.05rem]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[17px] h-[17px] bg-[#0a0a0a] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/products')}
                className="hidden sm:block px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                Shop now
              </button>

              <button
                className="md:hidden p-2 text-[#71717a] hover:text-[#0a0a0a] transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden border-t border-[#e4e4e7] bg-white"
            >
              <div className="px-6 py-6 flex flex-col gap-1">
                <form onSubmit={handleSearch} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-[#e4e4e7] bg-[#fafafa] mb-4">
                  <Search className="w-4 h-4 text-[#a1a1aa]" />
                  <input
                    type="text"
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder-[#a1a1aa] outline-none"
                  />
                </form>

                {NAV_LINKS.map((link, i) => (
                  <motion.button
                    key={link.label}
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleLink(link)}
                    className="text-left px-4 py-3 rounded-lg text-sm font-medium text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#f4f4f5] transition-colors"
                  >
                    {link.label}
                  </motion.button>
                ))}

                <button
                  onClick={() => { navigate('/products'); setOpen(false); }}
                  className="mt-4 px-5 py-3 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors"
                >
                  Shop now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
