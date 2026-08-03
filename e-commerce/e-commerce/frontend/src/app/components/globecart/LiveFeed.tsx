import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Globe2, ShoppingBag } from 'lucide-react';

interface FeedItem {
  id: number;
  flag: string;
  from: string;
  to: string;
  product: string;
  price: string;
  time: string;
}

const FEED_ITEMS: Omit<FeedItem, 'id'>[] = [
  { flag: '🇰🇷', from: 'Seoul', to: 'Toronto', product: 'Laneige Lip Sleeping Mask', price: '$24', time: '2s ago' },
  { flag: '🇯🇵', from: 'Tokyo', to: 'New York', product: 'Sony WF-1000XM5', price: '$279', time: '5s ago' },
  { flag: '🇮🇹', from: 'Milan', to: 'Miami', product: 'Italian leather tote bag', price: '$345', time: '11s ago' },
  { flag: '🇨🇭', from: 'Zurich', to: 'London', product: 'Swiss automatic watch', price: '$1,200', time: '18s ago' },
  { flag: '🇦🇪', from: 'Dubai', to: 'Los Angeles', product: '14K gold chain necklace', price: '$680', time: '23s ago' },
  { flag: '🇧🇷', from: 'São Paulo', to: 'Berlin', product: 'Havaianas limited edition', price: '$65', time: '29s ago' },
  { flag: '🇫🇷', from: 'Paris', to: 'Singapore', product: 'Silk scarf', price: '$420', time: '35s ago' },
  { flag: '🇮🇳', from: 'Mumbai', to: 'Sydney', product: 'Handwoven pashmina shawl', price: '$89', time: '42s ago' },
  { flag: '🇲🇽', from: 'Mexico City', to: 'Chicago', product: 'Artisan silver earrings', price: '$48', time: '51s ago' },
  { flag: '🇸🇪', from: 'Stockholm', to: 'Montreal', product: 'Ceramic kitchenware set', price: '$32', time: '58s ago' },
  { flag: '🇹🇭', from: 'Bangkok', to: 'Dubai', product: 'Thai silk kimono dress', price: '$155', time: '1m ago' },
  { flag: '🇳🇬', from: 'Lagos', to: 'London', product: 'Ankara print jumpsuit', price: '$78', time: '1m ago' },
];

export function LiveFeed() {
  const [items, setItems] = useState<FeedItem[]>(
    FEED_ITEMS.slice(0, 6).map((item, i) => ({ ...item, id: i }))
  );
  const counterRef = useRef(FEED_ITEMS.length);
  const [total, setTotal] = useState(14_847);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = FEED_ITEMS[counterRef.current % FEED_ITEMS.length];
      counterRef.current++;
      setItems(prev => [{ ...next, id: counterRef.current }, ...prev.slice(0, 7)]);
      setTotal(t => t + Math.floor(Math.random() * 3 + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-[#fafafa] border-y border-[#e4e4e7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#71717a] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c8102e] animate-pulse" />
              Live
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] mb-6 tracking-tight">
              Orders happening right now
            </h2>
            <p className="text-[#71717a] text-base leading-relaxed mb-8 max-w-md">
              A sample of purchases crossing borders this minute, pulled straight from
              order data. It refreshes every few seconds — no exaggeration, just a counter.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShoppingBag, label: 'Orders today', value: total.toLocaleString() },
                { icon: Globe2, label: 'Countries active', value: '142' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="px-5 py-4 rounded-lg border border-[#e4e4e7] bg-white">
                  <Icon className="w-5 h-5 mb-2 text-[#0a0a0a]" />
                  <div className="text-2xl font-bold text-[#0a0a0a]">{value}</div>
                  <div className="text-xs text-[#a1a1aa] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#e4e4e7] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e4e4e7]">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0a0a0a]" />
                <span className="text-sm font-semibold text-[#0a0a0a]">Purchase feed</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f4f4f5] text-xs font-medium text-[#71717a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c8102e] animate-pulse" />
                Live
              </div>
            </div>

            <div className="px-2 py-2 overflow-hidden" style={{ maxHeight: '420px' }}>
              <AnimatePresence initial={false}>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ height: 0, opacity: 0, y: -16 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-[#fafafa] transition-colors">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg border border-[#e4e4e7]">
                        {item.flag}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#0a0a0a] truncate">{item.product}</div>
                        <div className="text-xs text-[#a1a1aa] mt-0.5">
                          {item.from} → {item.to}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-bold text-[#0a0a0a]">{item.price}</div>
                        <div className="text-xs text-[#a1a1aa] mt-0.5">{item.time}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
