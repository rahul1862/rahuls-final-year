import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Clock, ArrowRight } from 'lucide-react';

interface Deal {
  id: number;
  title: string;
  percentOff: string;
  description: string;
  durationHours: number;
}

const DEALS: Deal[] = [
  { id: 1, title: 'Summer clearance', percentOff: '30% off', description: 'End-of-season items from across the catalog, discounted while stock lasts.', durationHours: 96 },
  { id: 2, title: 'New arrivals', percentOff: '15% off', description: 'Just-added products from our latest sourcing trip to South Korea and Japan.', durationHours: 60 },
  { id: 3, title: 'Flash sale', percentOff: '45% off', description: 'A short clearout on last season\'s stock — we need the warehouse space.', durationHours: 5 },
  { id: 4, title: 'Bundle deal', percentOff: 'Buy 2, get 1 free', description: 'Mix and match across categories. A candle with some skincare works fine.', durationHours: 144 },
];

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return 'Deal ended';
  const totalMinutes = Math.floor(msRemaining / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `Ends in ${days}d ${hours}h`;
  if (hours > 0) return `Ends in ${hours}h ${minutes}m`;
  return `Ends in ${minutes}m`;
}

export function Deals() {
  const dealEndTimes = useMemo(() => {
    const start = Date.now();
    return DEALS.reduce<Record<number, number>>((acc, deal) => {
      acc[deal.id] = start + deal.durationHours * 60 * 60 * 1000;
      return acc;
    }, {});
  }, []);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-16 pb-10 border-b border-[#e4e4e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0a0a0a] mb-3 tracking-tight">Current deals</h1>
          <p className="text-[#71717a] max-w-xl">
            Real discounts off the standard price — nothing here is marked up first so it can be marked down.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {DEALS.map(deal => {
            const remaining = dealEndTimes[deal.id] - now;
            const ended = remaining <= 0;
            return (
              <div key={deal.id} className="rounded-lg border border-[#e4e4e7] p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-sm text-[#71717a]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatCountdown(remaining)}</span>
                </div>
                <p className="text-3xl font-bold text-[#0a0a0a] mb-1">{deal.percentOff}</p>
                <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">{deal.title}</h3>
                <p className="text-[#71717a] text-sm mb-5 leading-relaxed flex-1">{deal.description}</p>
                <Link
                  to="/products"
                  aria-disabled={ended}
                  className={`inline-flex items-center gap-1.5 self-start px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    ended
                      ? 'bg-[#f4f4f5] text-[#a1a1aa] pointer-events-none'
                      : 'bg-[#c8102e] text-white hover:bg-[#a10d26]'
                  }`}
                >
                  {ended ? 'Deal ended' : 'Shop this deal'}
                  {!ended && <ArrowRight className="w-3.5 h-3.5" />}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-[#fafafa] rounded-lg p-8 border border-[#e4e4e7]">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold text-[#0a0a0a] mb-2">Get deal alerts</h3>
            <p className="text-[#71717a] text-sm mb-6">
              We'll email you when we run sales. No more than once a week.
            </p>
            <form
              onSubmit={e => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                placeholder="you@email.com"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white border border-[#e4e4e7] text-[#0a0a0a] placeholder-[#a1a1aa] focus:outline-none focus:border-[#c8102e] text-sm transition-colors"
              />
              <button
                type="submit"
                className="bg-[#c8102e] text-white px-5 py-2.5 rounded-lg hover:bg-[#a10d26] transition-colors font-medium text-sm whitespace-nowrap"
              >
                Notify me
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
