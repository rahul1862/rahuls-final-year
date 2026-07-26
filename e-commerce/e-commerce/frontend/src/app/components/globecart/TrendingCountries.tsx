import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';

interface Country {
  flag: string;
  name: string;
  tagline: string;
  category: string;
  items: string[];
  stats: string;
}

const COUNTRIES: Country[] = [
  {
    flag: '🇯🇵',
    name: 'Japan',
    tagline: 'Anime, gaming and consumer tech',
    category: 'Electronics & culture',
    items: ['Sony WF-1000XM5', 'Gundam model kits', 'Nintendo merch'],
    stats: '2.1M listings',
  },
  {
    flag: '🇰🇷',
    name: 'South Korea',
    tagline: 'K-beauty and fashion exports',
    category: 'Skincare & apparel',
    items: ['Laneige Lip Mask', 'COSRX serum', 'Hanbok-inspired dresses'],
    stats: '3.4M listings',
  },
  {
    flag: '🇮🇹',
    name: 'Italy',
    tagline: 'Leather goods, made by hand',
    category: 'Fashion & accessories',
    items: ['Full-grain wallets', 'Artisan totes', 'Silk scarves'],
    stats: '1.8M listings',
  },
  {
    flag: '🇦🇪',
    name: 'Dubai',
    tagline: 'Gold, oud and fine jewelry',
    category: 'Jewelry',
    items: ['14K gold chains', 'Oud perfumes', 'Diamond rings'],
    stats: '950K listings',
  },
  {
    flag: '🇨🇭',
    name: 'Switzerland',
    tagline: 'Watches built to outlast you',
    category: 'Watches & instruments',
    items: ['Swiss automatics', 'Pocket watches', 'Watch straps'],
    stats: '680K listings',
  },
  {
    flag: '🇧🇷',
    name: 'Brazil',
    tagline: 'Streetwear and beach culture',
    category: 'Fashion & lifestyle',
    items: ['Havaianas', 'Street art prints', 'Carnival wear'],
    stats: '1.5M listings',
  },
];

function CountryRow({ country, index, onShopNow }: { country: Country; index: number; onShopNow: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      onClick={onShopNow}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-6 px-5 border border-[#e4e4e7] rounded-lg hover:bg-[#fafafa] transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4 sm:w-64 flex-shrink-0">
        <span className="text-3xl leading-none">{country.flag}</span>
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">{country.name}</h3>
          <p className="text-xs text-[#71717a]">{country.tagline}</p>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#a1a1aa] mb-1.5">{country.category}</p>
        <p className="text-sm text-[#71717a] truncate">{country.items.join(' · ')}</p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-56 flex-shrink-0">
        <span className="text-xs text-[#a1a1aa]">{country.stats}</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#0a0a0a]">
          Shop now
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.div>
  );
}

export function TrendingCountries() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();

  return (
    <section ref={ref} className="py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-[#0a0a0a] tracking-tight mb-2">Shop by country</h2>
          <p className="text-[#71717a] text-sm max-w-xl">
            Six markets where our sellers move the most product. Each one has its own
            specialty — this isn't a generic "international" catalog.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {COUNTRIES.map((country, i) => (
            <CountryRow
              key={country.name}
              country={country}
              index={i}
              onShopNow={() => navigate(`/products?country=${encodeURIComponent(country.name)}`)}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 rounded-lg text-sm font-medium text-[#0a0a0a] border border-[#e4e4e7] hover:bg-[#f4f4f5] transition-colors"
          >
            View all 195 countries
          </button>
        </div>
      </div>
    </section>
  );
}
