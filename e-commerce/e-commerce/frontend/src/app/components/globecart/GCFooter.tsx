import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Globe, Twitter, Instagram, Youtube, Github, ArrowRight, MapPin } from 'lucide-react';

const FOOTER_LINKS: Record<string, { label: string; path: string }[]> = {
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Careers', path: '/about' },
    { label: 'Press', path: '/about' },
  ],
  Products: [
    { label: 'Featured', path: '/products' },
    { label: 'New arrivals', path: '/products' },
    { label: 'Flash deals', path: '/deals' },
  ],
  Countries: [
    { label: 'Japan', path: '/products?country=Japan' },
    { label: 'South Korea', path: '/products?country=South+Korea' },
    { label: 'Italy', path: '/products?country=Italy' },
    { label: 'Dubai', path: '/products?country=Dubai' },
    { label: 'Switzerland', path: '/products?country=Switzerland' },
    { label: 'Brazil', path: '/products?country=Brazil' },
  ],
  Support: [
    { label: 'Help center', path: '/help' },
    { label: 'Shipping info', path: '/help' },
    { label: 'Returns', path: '/help' },
    { label: 'Contact', path: '/contact' },
  ],
};

const SOCIAL = [
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Youtube, label: 'YouTube' },
  { Icon: Github, label: 'GitHub' },
];

const COUNTRIES_SELECT = ['🇺🇸 United States', '🇬🇧 United Kingdom', '🇨🇦 Canada', '🇦🇺 Australia', '🇩🇪 Germany', '🇫🇷 France', '🇸🇬 Singapore', '🇯🇵 Japan'];

export function GCFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [country, setCountry] = useState('🇺🇸 United States');
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#fafafa] border-t border-[#e4e4e7]">
      <div className="border-b border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">Stay ahead of global trends</h3>
              <p className="text-sm text-[#71717a]">Weekly picks from the markets in this catalog. One email, no spam.</p>
            </div>
            {subscribed ? (
              <p className="text-sm font-medium text-[#0a0a0a]">You're subscribed.</p>
            ) : (
              <div className="flex gap-2 w-full lg:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                  placeholder="your@email.com"
                  className="flex-1 lg:w-64 px-4 py-2.5 border border-[#e4e4e7] rounded-lg text-sm text-[#0a0a0a] placeholder-[#a1a1aa] outline-none focus:border-[#0a0a0a] bg-white transition-colors"
                />
                <button
                  onClick={handleSubscribe}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a2a] transition-colors whitespace-nowrap"
                >
                  Subscribe <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[#0a0a0a]">
                Globe<span className="text-[#71717a]">Cart</span>
              </span>
            </div>
            <p className="text-sm text-[#71717a] leading-relaxed mb-5">
              Authentic products sourced from sellers in 195 countries.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#a1a1aa] mb-6">
              <MapPin className="w-3.5 h-3.5" />
              <span>Shipping to 150+ destinations</span>
            </div>
            <div className="flex gap-2">
              {SOCIAL.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#e4e4e7] bg-white hover:border-[#0a0a0a] transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-3.5 h-3.5 text-[#71717a]" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-4">{heading}</p>
              <ul className="space-y-3">
                {links.map(({ label, path }) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate(path)}
                      className="text-sm text-[#71717a] hover:text-[#0a0a0a] transition-colors text-left"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#a1a1aa]">© 2026 GlobeCart. All rights reserved.</p>

            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#e4e4e7] bg-white text-xs text-[#71717a] outline-none cursor-pointer"
            >
              {COUNTRIES_SELECT.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              {['Visa', 'MC', 'PayPal', 'AMEX', 'Crypto'].map(method => (
                <div key={method} className="px-2.5 py-1 rounded border border-[#e4e4e7] text-[10px] font-semibold text-[#71717a]">
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
