import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, ChevronRight, Tag, Globe, ShieldCheck, Truck, BadgeCheck, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../context/ProductsContext';
import type { Product } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { RatingStars } from '../components/ui/RatingStars';
import { LinkButton } from '../components/ui/Button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { getRecentlyViewed } from '../utils/recentlyViewed';

const reviews = [
  { name: 'Rahul M.', location: 'London', text: 'The Moroccan rug I ordered showed up in four days. Genuinely impressed with how well it was packaged too.', rating: 5 },
  { name: 'Carlos R.', location: 'São Paulo', text: 'Bought a few things over the past year. Quality has been consistent, which is rare for international shipping.', rating: 4 },
  { name: 'Yuki T.', location: 'Tokyo', text: 'I was skeptical about the skincare products being authentic but they were the real deal. Would order again.', rating: 5 },
  { name: 'Priya K.', location: 'Mumbai', text: 'Decent selection and reasonable prices. Shipping to India took about a week, which is fine.', rating: 4 },
];

const sellPoints = [
  { icon: Tag, label: 'List for free' },
  { icon: Globe, label: '150+ countries' },
  { icon: ShieldCheck, label: 'Seller protection' },
];

const featureStrip = [
  { icon: Truck, title: 'Free shipping', copy: 'On orders over $99' },
  { icon: BadgeCheck, title: 'Verified sellers', copy: 'Every product checked' },
  { icon: Globe, title: 'Fast delivery', copy: '5–10 business days' },
  { icon: RotateCcw, title: 'Easy returns', copy: '30-day window' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09 } },
};

function buildCategoryTiles(products: Product[]) {
  const byCategory = new Map<string, { image: string; count: number }>();
  for (const p of products) {
    const existing = byCategory.get(p.category);
    if (existing) existing.count++;
    else byCategory.set(p.category, { image: p.image, count: 1 });
  }
  return Array.from(byCategory.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, data], i) => ({
      name,
      image: data.image,
      count: data.count,
      span: i === 0 ? 'col-span-2 row-span-2' : i === 3 ? 'row-span-2' : '',
    }));
}

export function Home() {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);
  const bestSellers = useMemo(() => {
    const featuredIds = new Set(featuredProducts.map(p => p.id));
    return [...products]
      .filter(p => !featuredIds.has(p.id))
      .sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)
      .slice(0, 4);
  }, [products]);
  const newArrivals      = products.slice(8, 14);
  const categoryTiles       = useMemo(() => buildCategoryTiles(products), [products]);
  const [recentlyViewed]    = useState(getRecentlyViewed);

  return (
    <div className="min-h-screen bg-background">

      <section className="relative min-h-[88vh] flex items-center bg-gradient-warm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary mb-7">
                14 countries · 150+ destinations
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold mb-7 leading-[0.98] text-foreground tracking-tight">
                Products worth<br />crossing borders<br /><span className="italic text-primary">for</span>
              </h1>
              <p className="text-lg mb-10 text-muted-foreground leading-relaxed max-w-md">
                We work with makers and sellers in 14 countries to bring you things you won't find at your local mall.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <LinkButton to="/products" size="lg">
                  Browse products <ArrowRight className="w-4 h-4" />
                </LinkButton>
                <LinkButton to="/deals" variant="secondary" size="lg">
                  See current deals
                </LinkButton>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RatingStars rating={5} />
                <span>Based on 12,000+ reviews</span>
              </div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-surface-strong shadow-lift">
                    <ImageWithFallback src={products[3]?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden aspect-square bg-surface-strong shadow-soft">
                    <ImageWithFallback src={products[9]?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-3 pt-8">
                  <div className="rounded-2xl overflow-hidden aspect-square bg-surface-strong shadow-soft">
                    <ImageWithFallback src={products[5]?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden aspect-[3/4] bg-surface-strong shadow-lift">
                    <ImageWithFallback src={products[7]?.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {featureStrip.map(({ icon: Icon, title, copy }) => (
              <div key={title} className="py-6 px-4 lg:px-6 flex items-start gap-3">
                <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-foreground text-sm font-medium">{title}</p>
                  <p className="text-muted-foreground text-sm mt-0.5">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-end justify-between mb-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground tracking-tight">Featured products</h2>
              <p className="text-muted-foreground mt-2 text-sm">Hand-picked pieces we think you'll like right now</p>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {featuredProducts.map(product => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-end justify-between mb-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground tracking-tight">Best sellers</h2>
              <p className="text-muted-foreground mt-2 text-sm">The most-loved items across every country we ship from</p>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {bestSellers.map(product => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-lg font-semibold text-foreground mb-5">Pick up where you left off</h2>
            <div className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory">
              {recentlyViewed.map(product => (
                <div key={product.id} className="min-w-[220px] sm:min-w-[240px] snap-start shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-end justify-between mb-10"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-semibold text-foreground tracking-tight">Shop by category</h2>
            <Link to="/products" className="hidden md:inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm">
              All categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] gap-3">
            {categoryTiles.map((cat, i) => (
              <motion.div
                key={cat.name}
                className={cat.span}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to="/products" className="group relative rounded-2xl overflow-hidden block h-full">
                  <ImageWithFallback
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="text-white text-base font-semibold">{cat.name}</h3>
                    <p className="text-white/70 text-xs mt-0.5">{cat.count} products</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <motion.div
            className="flex items-end justify-between"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl font-semibold text-foreground tracking-tight">New arrivals</h2>
            <Link to="/products" className="hidden md:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
              See more <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
          {newArrivals.map(product => (
            <div key={product.id} className="min-w-[260px] sm:min-w-[300px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-gradient-ink relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-texture opacity-40" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-3">Limited time</p>
              <h2 className="font-display text-3xl font-semibold text-white tracking-tight mb-2">Up to 70% off, through this weekend</h2>
              <p className="text-white/65 max-w-lg text-sm leading-relaxed">
                Past-season stock at real markdowns — we don't inflate the price first and discount it after.
              </p>
            </div>
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 border border-white/25 text-white px-7 py-3.5 rounded-xl hover:bg-white hover:text-foreground transition-colors font-medium text-sm whitespace-nowrap"
            >
              See all deals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="font-display text-3xl font-semibold text-foreground mb-10 tracking-tight"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            What customers are saying
          </motion.h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {reviews.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-card rounded-2xl p-6 border border-border shadow-soft"
                style={{ transform: `rotate(${i % 2 === 0 ? '-0.4deg' : '0.4deg'})` }}
              >
                <RatingStars rating={t.rating} size="sm" />
                <p className="text-foreground/80 leading-relaxed mb-4 mt-3 text-sm">{t.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground text-xs font-semibold">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground tracking-tight mb-4">Got something to sell?</h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                List it in a couple of minutes and reach buyers in 150+ countries. We handle
                payments and cover both sides if something goes wrong.
              </p>
              <LinkButton to="/sell" size="lg">
                Start selling <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {sellPoints.map(({ icon: Icon, label }) => (
                <div key={label} className="bg-card rounded-xl border border-border p-5 text-center shadow-soft">
                  <Icon className="w-5 h-5 text-primary mx-auto mb-3" />
                  <p className="text-xs font-medium text-foreground leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
