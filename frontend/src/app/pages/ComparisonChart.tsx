import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LinkButton } from '../components/ui/Button';

type Metric = 'commission' | 'delivery';

interface Platform {
  name: string;
  code: string;
  rating: number;
  reviews: number;
  commission: string;
  commissionValue: number;
  deliveryDays: number;
  description: string;
}

const platforms: Platform[] = [
  {
    name: 'Vendr',
    code: 'VDR',
    rating: 4.8,
    reviews: 86400,
    commission: '5%',
    commissionValue: 5,
    deliveryDays: 8,
    description: 'Curated marketplace, verified sellers only',
  },
  {
    name: 'Amazon',
    code: 'AMZ',
    rating: 4.6,
    reviews: 8200000,
    commission: '15%',
    commissionValue: 15,
    deliveryDays: 3,
    description: 'Largest general marketplace',
  },
  {
    name: 'eBay',
    code: 'EBY',
    rating: 4.3,
    reviews: 3100000,
    commission: '13.25%',
    commissionValue: 13.25,
    deliveryDays: 6,
    description: 'Auctions and fixed-price listings',
  },
  {
    name: 'Etsy',
    code: 'ETY',
    rating: 4.5,
    reviews: 1400000,
    commission: '6.5%',
    commissionValue: 6.5,
    deliveryDays: 9,
    description: 'Handmade and independent sellers',
  },
];

interface FeatureRow {
  label: string;
  values: Record<string, boolean>;
}

const featureRows: FeatureRow[] = [
  { label: 'Every seller identity-verified', values: { Vendr: true, Amazon: false, eBay: false, Etsy: false } },
  { label: 'Free 30-day returns, no questions', values: { Vendr: true, Amazon: true, eBay: false, Etsy: false } },
  { label: 'Buyer protection on every order', values: { Vendr: true, Amazon: true, eBay: true, Etsy: true } },
  { label: 'Live chat support', values: { Vendr: true, Amazon: true, eBay: false, Etsy: false } },
  { label: 'Ships to 150+ countries', values: { Vendr: true, Amazon: true, eBay: true, Etsy: true } },
  { label: 'Same-day delivery available', values: { Vendr: false, Amazon: true, eBay: false, Etsy: false } },
  { label: 'Focused on independent makers', values: { Vendr: true, Amazon: false, eBay: false, Etsy: true } },
  { label: 'Auction-style listings', values: { Vendr: false, Amazon: false, eBay: true, Etsy: false } },
];

const metricConfig: Record<Metric, { label: string; unit: string; axisLabel: string; getValue: (p: Platform) => number; formatTooltip: (v: number) => string }> = {
  commission: {
    label: 'Seller commission',
    unit: '%',
    axisLabel: 'Commission on each sale (%)',
    getValue: p => p.commissionValue,
    formatTooltip: v => `${v}% commission`,
  },
  delivery: {
    label: 'Average delivery time',
    unit: 'days',
    axisLabel: 'Average days to arrival',
    getValue: p => p.deliveryDays,
    formatTooltip: v => `${v} day${v === 1 ? '' : 's'} on average`,
  },
};

export function ComparisonChart() {
  const [metric, setMetric] = useState<Metric>('commission');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(t);
  }, []);

  const config = metricConfig[metric];
  const chartData = platforms.map(p => ({ name: p.name, value: config.getValue(p) }));

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            How Vendr compares
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            An honest look at where Vendr sits next to the marketplaces you already know —
            including the places we don't win.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map(platform => (
              <div
                key={platform.name}
                className={`rounded-lg p-5 border ${
                  platform.name === 'Vendr' ? 'border-primary bg-surface' : 'border-border bg-card'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold mb-4 ${
                  platform.name === 'Vendr' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {platform.code}
                </div>
                <h3 className="text-foreground font-semibold mb-1">{platform.name}</h3>
                <p className="text-muted-foreground text-xs mb-4">{platform.description}</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-foreground font-bold text-lg">{platform.rating}</span>
                  <span className="text-muted-foreground text-xs">/ 5</span>
                </div>
                <p className="text-muted-foreground text-xs">{platform.reviews.toLocaleString()} reviews</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg border border-border p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">{config.label}</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {metric === 'commission'
                    ? 'What each platform keeps from a typical sale.'
                    : 'How long a standard (non-express) order usually takes to arrive.'}
                </p>
              </div>
              <div className="flex gap-1 bg-secondary rounded-lg p-1 self-start">
                {(Object.keys(metricConfig) as Metric[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      metric === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {metricConfig[m].label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-72 flex items-end gap-4 px-2">
                {platforms.map(p => (
                  <div key={p.name} className="flex-1 bg-secondary rounded-t-md animate-pulse" style={{ height: `${30 + Math.random() * 50}%` }} />
                ))}
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-72 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No comparison data available right now.</p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 13 }}
                      axisLine={{ stroke: 'var(--border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      label={{ value: config.axisLabel, angle: -90, position: 'insideLeft', fill: 'var(--muted-foreground)', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--surface)' }}
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}
                      formatter={(value) => [config.formatTooltip(Number(value)), config.label]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={64}>
                      {chartData.map(entry => (
                        <Cell key={entry.name} fill={entry.name === 'Vendr' ? 'var(--primary)' : 'var(--border-strong)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-primary" />
                <span className="text-muted-foreground text-xs">Vendr</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-border-strong" />
                <span className="text-muted-foreground text-xs">Other marketplaces</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">Feature by feature</h2>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Feature</th>
                    {platforms.map(platform => (
                      <th key={platform.name} className="px-6 py-4 text-center font-medium text-foreground">
                        {platform.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {featureRows.map(row => (
                    <tr key={row.label}>
                      <td className="px-6 py-4 text-foreground">{row.label}</td>
                      {platforms.map(platform => (
                        <td key={platform.name} className="px-6 py-4 text-center">
                          {row.values[platform.name] ? (
                            <Check className="w-4 h-4 text-foreground mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-border-strong mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-muted-foreground text-xs mt-3">
            Figures are approximate, based on published rate cards as of this writing, and can change without notice on any of these platforms.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface rounded-lg border border-border p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-1">Want to see it for yourself?</h3>
              <p className="text-muted-foreground text-sm">Browse the catalog, or check what selling here actually costs.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <LinkButton to="/products">Browse products</LinkButton>
              <LinkButton to="/pricing" variant="secondary">See pricing</LinkButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
