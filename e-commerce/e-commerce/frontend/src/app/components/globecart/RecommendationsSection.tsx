import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, ArrowRight, Star } from 'lucide-react';

const SUGGESTIONS = [
  "What's trending in Japan right now?",
  'Find me luxury watches under $500',
  'Best Korean skincare for dry skin',
  'Italian leather bags for travel',
];

interface RecommendCard {
  flag: string;
  name: string;
  price: string;
  rating: number;
}

const DEFAULT_RESPONSE: { text: string; cards: RecommendCard[] } = {
  text: "Here's what matched: three highly-rated picks currently in stock, ranked by rating and recent sales.",
  cards: [
    { flag: '🇯🇵', name: 'Sony WF-1000XM5', price: '$279', rating: 4.9 },
    { flag: '🇰🇷', name: 'Laneige Water Bank', price: '$38', rating: 4.8 },
    { flag: '🇨🇭', name: 'Hamilton Khaki', price: '$495', rating: 4.7 },
  ],
};

function RecommendCardEl({ card, index }: { card: RecommendCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.1, duration: 0.4 }}
      className="px-4 py-4 rounded-lg border border-[#e4e4e7] bg-white"
      style={{ minWidth: '180px' }}
    >
      <div className="text-3xl mb-3">{card.flag}</div>
      <div className="text-sm font-semibold text-[#0a0a0a] mb-2 leading-tight">{card.name}</div>
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-[#0a0a0a]">{card.price}</span>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs text-[#71717a]">{card.rating}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function RecommendationsSection() {
  const [input, setInput] = useState('');
  const [active, setActive] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [cards, setCards] = useState<RecommendCard[]>([]);
  const [loading, setLoading] = useState(false);

  const triggerRecommendations = (_query?: string, scrollAfter?: boolean) => {
    setInput('');
    setLoading(true);
    setCards([]);
    setResponseText('');
    setActive(true);
    setTimeout(() => {
      setLoading(false);
      setResponseText(DEFAULT_RESPONSE.text);
      setCards(DEFAULT_RESPONSE.cards);
      if (scrollAfter) {
        setTimeout(() => {
          const el = document.getElementById('featured');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    }, 1200);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    triggerRecommendations(input);
  };

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a1a1aa] mb-6">
              Quick search assistant
            </p>

            <h2 className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] mb-6 leading-tight tracking-tight">
              Not sure what you're looking for?
            </h2>

            <p className="text-[#71717a] text-base leading-relaxed mb-8 max-w-md">
              Describe it in plain language — a budget, an occasion, a country — and
              we'll match it against listings across our seller network. Faster than
              clicking through category filters.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              {['Matches by budget', 'Filters by country', 'Updated hourly'].map(label => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#71717a] border border-[#e4e4e7]"
                >
                  {label}
                </div>
              ))}
            </div>

            <button
              onClick={() => triggerRecommendations(undefined, true)}
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-lg text-sm font-medium text-white bg-[#c8102e] hover:bg-[#a10d26] transition-colors"
            >
              Show me options
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-lg border border-[#e4e4e7] bg-white overflow-hidden">
            <div className="px-6 py-5 flex items-center gap-4 border-b border-[#e4e4e7] bg-[#fafafa]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#c8102e] flex-shrink-0">
                <Search className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0a0a0a]">Search assistant</div>
                <div className="text-xs text-[#a1a1aa]">Matches current listings, not a chatbot</div>
              </div>
            </div>

            <div className="px-6 py-6 min-h-[280px]">
              {!active && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                  <p className="text-xs text-[#a1a1aa] mb-4 uppercase tracking-widest font-medium">Try asking</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => triggerRecommendations(s)}
                        className="px-3 py-2 rounded-lg text-xs text-[#71717a] hover:text-[#0a0a0a] hover:bg-[#fafafa] transition-colors border border-[#e4e4e7]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 mb-4 px-4 py-3 rounded-lg bg-[#fafafa] w-fit"
                  >
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
                        className="w-1.5 h-1.5 rounded-full bg-[#a1a1aa]"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {responseText && (
                  <motion.div
                    key="response"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5"
                  >
                    <p className="text-sm text-[#71717a] leading-relaxed mb-5 px-4 py-3 rounded-lg bg-[#fafafa] w-fit">
                      {responseText}
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                      {cards.map((card, i) => (
                        <RecommendCardEl key={card.name} card={card} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-4 py-4 border-t border-[#e4e4e7]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Search global products..."
                  className="flex-1 bg-transparent text-sm text-[#0a0a0a] placeholder-[#a1a1aa] outline-none"
                />
                <button
                  onClick={handleSend}
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#c8102e] hover:bg-[#a10d26] transition-colors"
                  aria-label="Send"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
