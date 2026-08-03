import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Search } from 'lucide-react';

const shortcuts = [
  { label: 'All products', path: '/products' },
  { label: 'Current deals', path: '/deals' },
  { label: 'Your orders', path: '/orders' },
  { label: 'Help center', path: '/help' },
];

export function NotFound() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/products?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-lg">
          <p className="font-mono text-sm text-[#a1a1aa] mb-4">Error 404</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#0a0a0a] mb-4 tracking-tight leading-tight">
            That page went missing
          </h1>
          <p className="text-[#71717a] leading-relaxed mb-8">
            Whatever you were looking for isn't at this address anymore — the link may be
            outdated, or the item was removed from the catalog. Try searching for it, or
            pick one of the pages below.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 mb-10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 border border-[#e4e4e7] rounded-lg text-sm text-[#0a0a0a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#c8102e] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#c8102e] text-white text-sm font-medium rounded-lg hover:bg-[#a10d26] transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          <div className="border-t border-[#e4e4e7] pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-3">
              Or go to
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {shortcuts.map(s => (
                <li key={s.path}>
                  <Link to={s.path} className="text-sm text-[#0a0a0a] hover:underline underline-offset-2">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
