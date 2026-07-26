import { ChevronDown, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

type Category = 'Orders' | 'Shipping' | 'Customs & duties' | 'Returns' | 'Account' | 'Payments';

interface Faq {
  q: string;
  a: string;
  category: Category;
}

const faqs: Faq[] = [
  {
    category: 'Orders',
    q: 'How do I place an order?',
    a: "Find something you like, add it to your cart, and go through checkout. If something breaks mid-way, reach out and we'll sort it manually.",
  },
  {
    category: 'Orders',
    q: 'Can I cancel or change an order after placing it?',
    a: "Only within the first hour, before it's handed off to the seller for packing. After that it's already in motion — you'll need to use returns instead.",
  },
  {
    category: 'Orders',
    q: 'How do I track my order?',
    a: "We email a tracking link once your order ships. If your order has items from more than one seller, you'll get a separate tracking number for each.",
  },
  {
    category: 'Orders',
    q: "Why does my order have multiple tracking numbers?",
    a: "Vendr is a marketplace — different items in the same cart often come from different sellers, so they ship independently and can arrive on different days.",
  },
  {
    category: 'Shipping',
    q: 'How long does shipping take?',
    a: "Standard shipping runs 7–10 business days. Express is 2–3 days where it's offered. International orders can run longer depending on customs processing at the destination.",
  },
  {
    category: 'Shipping',
    q: 'Do you ship internationally?',
    a: 'Yes — over 150 countries. Import duties and taxes are calculated at checkout so there is no surprise bill when the package arrives.',
  },
  {
    category: 'Shipping',
    q: 'My tracking says delivered but I never got the package.',
    a: "Check with neighbors and any building mailroom first — carriers sometimes mark delivery slightly early. If it's genuinely missing after 48 hours, contact us and we'll open a claim with the carrier.",
  },
  {
    category: 'Customs & duties',
    q: 'Will I be charged customs fees on top of what I paid?',
    a: "No, not for orders where duties were collected at checkout — those are marked DDP (delivered duty paid) and the price you saw is the price you pay. A small number of remote destinations are DDU, meaning the carrier collects duty on delivery; we flag this clearly before you check out.",
  },
  {
    category: 'Customs & duties',
    q: "What's the difference between DDP and DDU?",
    a: "DDP means duties and import tax were already included in your total. DDU means the carrier will collect them from you when the package arrives. We default to DDP wherever the destination country supports it.",
  },
  {
    category: 'Returns',
    q: 'Can I return something?',
    a: "30 days, unused, tags on. Email us and we'll send a return label. No interrogation about why you changed your mind.",
  },
  {
    category: 'Returns',
    q: 'Who pays for return shipping?',
    a: "We do, for the standard 30-day window. If you're returning something outside that window as a goodwill exception, return shipping is on you.",
  },
  {
    category: 'Returns',
    q: "The seller won't accept my return. What now?",
    a: "That shouldn't happen — every order is covered by Vendr's buyer protection regardless of what an individual seller says. Contact us directly and we'll process the refund ourselves.",
  },
  {
    category: 'Returns',
    q: 'I received something damaged. What do I do?',
    a: "Take a photo and send it to us within 48 hours of delivery. We'll get a replacement out or refund you — whichever you prefer.",
  },
  {
    category: 'Account',
    q: 'I forgot my password.',
    a: "Use 'Forgot password' on the login screen — the reset link expires after 30 minutes, so use it promptly or request a new one.",
  },
  {
    category: 'Account',
    q: 'How do I change my email address?',
    a: "Settings → Account details. You'll need to confirm the change from both your old and new email addresses, mostly to stop someone else quietly hijacking your account.",
  },
  {
    category: 'Account',
    q: 'Can I save more than one shipping address?',
    a: 'Yes, under Settings → Addresses. You can set a default and switch between them at checkout.',
  },
  {
    category: 'Payments',
    q: 'What payment methods are accepted?',
    a: 'Cards (Visa, Mastercard, Amex), Apple Pay, Google Pay, and bank transfer. All the standard stuff.',
  },
  {
    category: 'Payments',
    q: 'Is my payment info safe?',
    a: "Yes — we don't store card details ourselves. All payments go through Stripe. We never see the actual numbers.",
  },
  {
    category: 'Payments',
    q: 'My card was declined but I was still charged.',
    a: "That's usually a temporary authorization hold from your bank, not an actual charge — it should drop off within 3–5 business days. If it's still there after a week, contact us with your bank statement and we'll chase it.",
  },
];

const categories: Category[] = ['Orders', 'Shipping', 'Customs & duties', 'Returns', 'Account', 'Payments'];

export function Help() {
  const [open, setOpen] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter(faq => {
      const matchesCategory = !activeCategory || faq.category === activeCategory;
      const matchesQuery = !q || faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  const clearFilters = () => {
    setQuery('');
    setActiveCategory(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#0a0a0a] mb-4 tracking-tight">Help</h1>
          <p className="text-[#71717a] text-lg max-w-xl">
            Answers to the most common questions about orders, shipping, and your account.
            If something's not here, use the contact form.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {(['Orders', 'Returns', 'Shipping', 'Account'] as Category[]).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`text-left bg-white rounded-lg p-5 border transition-colors ${
                  activeCategory === cat ? 'border-[#0a0a0a]' : 'border-[#e4e4e7] hover:border-[#0a0a0a]'
                }`}
              >
                <p className="text-[#0a0a0a] text-sm font-medium mb-1">{cat}</p>
                <p className="text-[#a1a1aa] text-xs">
                  {cat === 'Orders' && 'Track or change an order'}
                  {cat === 'Returns' && 'Start a return or exchange'}
                  {cat === 'Shipping' && 'Rates and delivery times'}
                  {cat === 'Account' && 'Profile and login issues'}
                </p>
              </button>
            ))}
          </div>

          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-[#0a0a0a] mb-4 tracking-tight">Common questions</h2>

            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#a1a1aa] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search, e.g. customs, tracking, password..."
                  className="w-full pl-10 pr-3.5 py-2.5 border border-[#e4e4e7] rounded-lg bg-white text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] placeholder-[#a1a1aa] text-sm transition-colors"
                />
              </div>
              <select
                value={activeCategory ?? ''}
                onChange={e => setActiveCategory((e.target.value || null) as Category | null)}
                className="px-3.5 py-2.5 border border-[#e4e4e7] rounded-lg bg-white text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] text-sm appearance-none"
              >
                <option value="">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {(query || activeCategory) && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#a1a1aa] text-xs">
                  {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                  {activeCategory ? ` in ${activeCategory}` : ''}
                </p>
                <button onClick={clearFilters} className="text-[#71717a] text-xs flex items-center gap-1 hover:text-[#0a0a0a]">
                  <X className="w-3 h-3" /> Clear
                </button>
              </div>
            )}

            <div className="space-y-2 mt-4">
              {filtered.length === 0 ? (
                <div className="bg-[#fafafa] rounded-lg border border-[#e4e4e7] p-6 text-center">
                  <p className="text-[#71717a] text-sm mb-3">No questions match "{query}".</p>
                  <Link to="/contact" className="text-[#0a0a0a] text-sm font-medium hover:underline">
                    Ask us directly instead →
                  </Link>
                </div>
              ) : (
                filtered.map((faq) => {
                  const i = faqs.indexOf(faq);
                  return (
                    <div key={faq.q} className="bg-white rounded-lg border border-[#e4e4e7] overflow-hidden">
                      <button
                        onClick={() => setOpen(open === i ? null : i)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                      >
                        <span className="text-[#0a0a0a] text-sm font-medium">{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#a1a1aa] shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div className={`overflow-hidden transition-all duration-200 ${open === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="px-5 pb-4 text-[#71717a] text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fafafa] rounded-lg border border-[#e4e4e7] p-8 max-w-2xl">
            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-2">Still stuck?</h3>
            <p className="text-[#71717a] text-sm mb-5">
              Our support team usually responds within a few hours. You can also reach us on live chat.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
