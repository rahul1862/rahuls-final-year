import { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Billing = 'monthly' | 'annual';
type TierId = 'free' | 'plus' | 'pro';

const AVG_ORDER_VALUE = 45;
const STANDARD_SHIPPING_COST = 6.99;
const EXPRESS_SHIPPING_COST = 9.99;
const PLUS_FREE_SHIP_QUALIFY_RATE = 0.9;
const PLUS_CASHBACK_RATE = 0.02;
const PRO_CASHBACK_RATE = 0.05;

interface Tier {
  id: TierId;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

const tiers: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'What every account gets by default',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Standard shipping rates apply',
      '30-day returns on everything',
      'Email support, 1–2 business days',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    description: 'For people who order regularly',
    monthlyPrice: 4.99,
    annualPrice: 49,
    features: [
      'Everything in Free',
      'Free standard shipping over €35',
      '2% cashback on every order',
      'Priority email support, same day',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For frequent shoppers who want it fast',
    monthlyPrice: 12.99,
    annualPrice: 119,
    features: [
      'Everything in Plus',
      'Free express shipping, no minimum',
      '5% cashback on every order',
      'Live chat, typically under an hour',
      '24-hour early access to sales',
    ],
  },
];

const addOns = [
  { name: 'Extended protection', description: 'Stretches the return window to 90 days and covers accidental damage.', price: '1.99', unit: 'per order' },
  { name: 'Gift wrapping', description: "Wrapped by the seller before it ships, with a note card if you'd like one.", price: '2.50', unit: 'per order' },
  { name: 'Priority processing', description: 'Packed and handed to the carrier within 4 hours of ordering.', price: '3.99', unit: 'per order' },
];

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: "Yes. Cancel whenever you like — you keep access through the end of the period you've already paid for. We don't prorate refunds for the unused time.",
  },
  {
    q: 'Is there a free trial?',
    a: "New members get their first 30 days of Plus or Pro free. Cancel before it renews and you won't be charged anything.",
  },
  {
    q: 'What payment methods work for membership?',
    a: 'Whatever you already use at checkout — cards, Apple Pay, Google Pay, or PayPal. It renews automatically on the same method.',
  },
  {
    q: 'Does this change what sellers pay to list?',
    a: "No. The 5% commission sellers pay on a sale is separate and unaffected by buyer membership tiers.",
  },
  {
    q: 'What happens to my cashback if I downgrade?',
    a: "Anything you've already earned stays in your account as store credit. It doesn't expire and isn't tied to your current tier.",
  },
];

function annualCostFor(tier: Tier, billing: Billing): number {
  if (tier.monthlyPrice === 0) return 0;
  return billing === 'monthly' ? tier.monthlyPrice * 12 : tier.annualPrice;
}

function annualValueFor(tierId: TierId, ordersPerYear: number): number {
  const spend = ordersPerYear * AVG_ORDER_VALUE;
  if (tierId === 'free') return 0;
  if (tierId === 'plus') {
    const qualifyingOrders = Math.round(ordersPerYear * PLUS_FREE_SHIP_QUALIFY_RATE);
    return qualifyingOrders * STANDARD_SHIPPING_COST + spend * PLUS_CASHBACK_RATE;
  }
  return ordersPerYear * EXPRESS_SHIPPING_COST + spend * PRO_CASHBACK_RATE;
}

function breakevenOrders(tierId: TierId, annualCost: number): number | null {
  if (annualCost === 0) return null;
  const perOrderRate = tierId === 'plus'
    ? PLUS_FREE_SHIP_QUALIFY_RATE * STANDARD_SHIPPING_COST + AVG_ORDER_VALUE * PLUS_CASHBACK_RATE
    : EXPRESS_SHIPPING_COST + AVG_ORDER_VALUE * PRO_CASHBACK_RATE;
  return Math.ceil(annualCost / perOrderRate);
}

const ORDER_FREQUENCY_OPTIONS = [6, 12, 24];

export function PricingChart() {
  const [billing, setBilling] = useState<Billing>('annual');
  const [ordersPerYear, setOrdersPerYear] = useState(12);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  const chartData = useMemo(
    () => tiers.map(tier => ({
      name: tier.name,
      value: Math.round(annualValueFor(tier.id, ordersPerYear)),
      cost: Math.round(annualCostFor(tier, billing)),
    })),
    [billing, ordersPerYear]
  );

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#0a0a0a] mb-4 tracking-tight">
            Membership plans
          </h1>
          <p className="text-[#71717a] text-lg max-w-xl">
            Free shipping thresholds and cashback rates, laid out plainly. No plan is required to
            buy or sell on Vendr — this only affects shipping cost and cashback.
          </p>
        </div>
      </section>

      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex gap-1 bg-[#f4f4f5] rounded-lg p-1">
            {(['monthly', 'annual'] as Billing[]).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  billing === b ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#71717a] hover:text-[#0a0a0a]'
                }`}
              >
                {b === 'annual' ? 'Annual (save ~20%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map(tier => {
              const cost = annualCostFor(tier, billing);
              const displayPrice = billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
              const breakeven = breakevenOrders(tier.id, cost);
              return (
                <div
                  key={tier.id}
                  className={`rounded-lg border p-6 lg:p-8 flex flex-col ${
                    tier.id === 'plus' ? 'border-[#0a0a0a] bg-[#fafafa]' : 'border-[#e4e4e7] bg-white'
                  }`}
                >
                  {tier.id === 'plus' && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#71717a] mb-3">Most members pick this</span>
                  )}
                  <h3 className="text-lg font-semibold text-[#0a0a0a]">{tier.name}</h3>
                  <p className="text-[#71717a] text-sm mt-1 mb-6">{tier.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-[#0a0a0a]">€{displayPrice.toFixed(displayPrice % 1 === 0 ? 0 : 2)}</span>
                    <span className="text-[#a1a1aa] text-sm ml-1">
                      {tier.monthlyPrice === 0 ? '' : billing === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {tier.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[#71717a]">
                        <Check className="w-4 h-4 text-[#0a0a0a] mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {breakeven !== null && (
                    <p className="text-[#a1a1aa] text-xs mb-4">
                      Breaks even after about {breakeven} order{breakeven === 1 ? '' : 's'} a year, based on a ${AVG_ORDER_VALUE} average order.
                    </p>
                  )}

                  <button
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      tier.id === 'plus'
                        ? 'bg-[#0a0a0a] text-white hover:bg-[#2a2a2a]'
                        : 'border border-[#e4e4e7] text-[#0a0a0a] hover:bg-white'
                    }`}
                  >
                    {tier.id === 'free' ? 'Current plan' : `Switch to ${tier.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Savings calculator */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg border border-[#e4e4e7] p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#0a0a0a]">Is it worth it for you?</h2>
                <p className="text-[#71717a] text-sm mt-1">
                  Estimated yearly value (shipping saved + cashback) against what each plan costs.
                </p>
              </div>
              <div className="flex gap-1 bg-[#f4f4f5] rounded-lg p-1 self-start">
                {ORDER_FREQUENCY_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setOrdersPerYear(n)}
                    className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      ordersPerYear === n ? 'bg-white text-[#0a0a0a] shadow-sm' : 'text-[#71717a] hover:text-[#0a0a0a]'
                    }`}
                  >
                    {n}/yr
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-72 flex items-end gap-6 px-2">
                {tiers.map(tier => (
                  <div key={tier.id} className="flex-1 bg-[#f4f4f5] rounded-t-md animate-pulse" style={{ height: `${25 + Math.random() * 55}%` }} />
                ))}
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-[#a1a1aa] text-sm">No plan data to show.</p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 13 }} axisLine={{ stroke: '#e4e4e7' }} tickLine={false} />
                    <YAxis
                      tick={{ fill: '#71717a', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(v: number) => `€${v}`}
                      label={{ value: 'Euros per year', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#fafafa' }}
                      contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 13 }}
                      formatter={(value, name) => [`€${value}`, name]}
                    />
                    <Legend
                      formatter={(value: string) => <span style={{ color: '#71717a', fontSize: 13 }}>{value}</span>}
                    />
                    <Bar dataKey="value" name="Estimated yearly value" fill="#0a0a0a" radius={[4, 4, 0, 0]} maxBarSize={56} />
                    <Bar dataKey="cost" name="Membership cost" fill="#d4d4d8" radius={[4, 4, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <p className="text-[#a1a1aa] text-xs mt-4 pt-4 border-t border-[#e4e4e7]">
              Assumes a €{AVG_ORDER_VALUE} average order, standard shipping at €{STANDARD_SHIPPING_COST.toFixed(2)}, and express at €{EXPRESS_SHIPPING_COST.toFixed(2)}.
              Plus assumes roughly {Math.round(PLUS_FREE_SHIP_QUALIFY_RATE * 100)}% of orders clear the €35 free-shipping minimum. Your actual savings will vary with what you buy.
            </p>
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-[#0a0a0a] mb-1">Per-order add-ons</h2>
          <p className="text-[#71717a] text-sm mb-6">Not a subscription — added at checkout, order by order, on any plan.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addOns.map(addon => (
              <div key={addon.name} className="rounded-lg border border-[#e4e4e7] p-5 bg-white">
                <h3 className="text-[#0a0a0a] font-medium mb-1.5">{addon.name}</h3>
                <p className="text-[#71717a] text-sm leading-relaxed mb-4">{addon.description}</p>
                <p className="text-[#0a0a0a] font-semibold">
                  €{addon.price} <span className="text-[#a1a1aa] font-normal text-sm">{addon.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-semibold text-[#0a0a0a] mb-6">Questions about membership</h2>
          <div className="space-y-4">
            {faqs.map(item => (
              <div key={item.q} className="border-b border-[#e4e4e7] pb-4 last:border-0">
                <h3 className="text-[#0a0a0a] text-sm font-medium mb-1.5">{item.q}</h3>
                <p className="text-[#71717a] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fafafa] rounded-lg border border-[#e4e4e7] p-8 text-center">
            <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">Ready to browse?</h3>
            <p className="text-[#71717a] text-sm mb-5">Plans can be changed or cancelled from your account at any time.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#2a2a2a] transition-colors"
            >
              Browse products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
