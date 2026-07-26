import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Heart, MapPin,
  CreditCard, Settings, LogOut, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/' },
  { icon: Package,         label: 'My Orders',       path: '/orders' },
  { icon: Heart,           label: 'Wishlist',         path: '/wishlist' },
  { icon: MapPin,          label: 'Addresses',        path: '/addresses' },
  { icon: CreditCard,      label: 'Payment Methods',  path: '/payment-methods' },
  { icon: Settings,        label: 'Settings',         path: '/settings' },
];

export function AccountSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const nav = (
    <div className="h-full flex flex-col py-6">
      <div className="px-6 mb-6 flex items-center gap-3">
        <span className="w-9 h-9 bg-[#0a0a0a] text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
          {user?.name[0]?.toUpperCase() ?? 'A'}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0a0a0a] truncate">{user?.name ?? 'Your account'}</p>
          <p className="text-xs text-[#a1a1aa] truncate">{user?.email ?? 'Not signed in'}</p>
        </div>
      </div>

      <nav aria-label="Account" className="flex-1 px-3 space-y-1 overflow-y-auto">
        {LINKS.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <button
              key={label}
              onClick={() => { navigate(path); onClose(); }}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                active
                  ? 'bg-[#f4f4f5] text-[#0a0a0a]'
                  : 'text-[#71717a] hover:bg-[#fafafa] hover:text-[#0a0a0a]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pt-4 border-t border-[#e4e4e7]">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        aria-label="Account navigation"
        className="hidden lg:flex flex-col w-60 shrink-0 sticky top-16 self-start border-r border-[#e4e4e7] bg-white"
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        {nav}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              key="drawer"
              aria-label="Account navigation"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="fixed top-0 left-0 h-full w-60 z-50 lg:hidden overflow-y-auto bg-white border-r border-[#e4e4e7] shadow-xl"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#f4f4f5] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
              {nav}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
