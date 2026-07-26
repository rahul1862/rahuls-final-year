import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

const LINKS: Record<string, { label: string; path: string }[]> = {
  Company: [
    { label: 'About',    path: '/about' },
    { label: 'Careers',  path: '/about' },
    { label: 'Press',    path: '/about' },
  ],
  Products: [
    { label: 'All Products', path: '/products' },
    { label: 'Deals',        path: '/deals' },
    { label: 'Pricing',      path: '/pricing' },
    { label: 'Compare',      path: '/comparison' },
  ],
  Support: [
    { label: 'Help Center', path: '/help' },
    { label: 'Shipping',    path: '/help' },
    { label: 'Returns',     path: '/help' },
    { label: 'Contact',     path: '/contact' },
  ],
};

const PAYMENT_METHODS = [
  { abbr: 'Visa', full: 'Visa' },
  { abbr: 'MC',   full: 'Mastercard' },
  { abbr: 'PayPal', full: 'PayPal' },
  { abbr: 'AMEX', full: 'American Express' },
];

export function Footer() {
  const [email,      setEmail]      = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#fafafa] border-t border-[#e4e4e7]">
      <div className="border-b border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">Stay in the loop</h3>
              <p className="text-sm text-[#71717a]">New products and occasional deals. One email a week, max.</p>
            </div>
            {subscribed ? (
              <p className="text-sm font-medium text-[#0a0a0a]">You're subscribed.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 w-full lg:w-auto">
                <label htmlFor="footer-email" className="sr-only">Email address</label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 lg:w-64 px-4 py-2.5 border border-[#e4e4e7] rounded-lg text-sm text-[#0a0a0a] placeholder-[#a1a1aa] outline-none focus:border-[#0a0a0a] bg-white transition-colors"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors whitespace-nowrap"
                >
                  Subscribe <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-bold text-[#0a0a0a] mb-3 tracking-tight">Vendr</p>
            <p className="text-sm text-[#71717a] leading-relaxed max-w-[220px]">
              Authentic products from makers and sellers in 14 countries.
            </p>
          </div>
          {Object.entries(LINKS).map(([heading, links]) => (
            <nav key={heading} aria-label={`${heading} links`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-4">{heading}</p>
              <ul className="space-y-3">
                {links.map(({ label, path }) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate(path)}
                      className="text-sm text-[#71717a] hover:text-[#0a0a0a] transition-colors"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#a1a1aa]">&copy; {new Date().getFullYear()} Vendr. All rights reserved.</p>
            <div className="flex items-center gap-2" aria-label="Accepted payment methods">
              {PAYMENT_METHODS.map(({ abbr, full }) => (
                <div key={abbr} className="px-2.5 py-1 rounded border border-[#e4e4e7] text-[10px] font-semibold text-[#71717a]" title={full}>
                  {abbr}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
