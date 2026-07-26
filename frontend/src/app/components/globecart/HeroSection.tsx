import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, TrendingUp, Globe2, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Globe3D } from './Globe3D';

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const STATS = [
  { icon: Globe2,  label: 'Countries with sellers', value: '195' },
  { icon: Package, label: 'Listings live',           value: '12M+' },
  { icon: Users,   label: 'Buyers this month',       value: '2.4M' },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { y: 32, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.1 + i * 0.1, duration: 0.65, ease: EASE },
  }),
};

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[88vh] flex items-center bg-[#fafafa] border-b border-[#e4e4e7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">

          <div className="flex flex-col justify-center order-2 lg:order-1">
            <motion.p
              custom={0} variants={fadeUp} initial="hidden" animate="show"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a1a1aa] mb-7"
            >
              195 countries, one cart
            </motion.p>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="show"
              className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-[#0a0a0a]"
            >
              Everywhere is closer than it looks
            </motion.h1>

            <motion.p
              custom={2} variants={fadeUp} initial="hidden" animate="show"
              className="text-lg leading-relaxed mb-10 max-w-[480px] text-[#71717a]"
            >
              Spin the globe, land on a country, and see what people there are actually
              buying — real listings from real sellers, not a stock photo of a marketplace.
            </motion.p>

            <motion.div
              custom={3} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-wrap gap-3 mb-14"
            >
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center gap-2 bg-[#0a0a0a] text-white px-7 py-3.5 rounded-lg hover:bg-[#2a2a2a] transition-colors font-medium text-sm"
              >
                Browse products <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTo('countries')}
                className="inline-flex items-center gap-2 text-[#0a0a0a] px-7 py-3.5 rounded-lg hover:bg-[#f4f4f5] transition-colors font-medium text-sm border border-[#e4e4e7]"
              >
                <TrendingUp className="w-4 h-4" />
                See what's trending
              </button>
            </motion.div>

            <motion.div
              custom={4} variants={fadeUp} initial="hidden" animate="show"
              className="flex flex-wrap gap-8"
            >
              {STATS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-[#e4e4e7]">
                    <Icon className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-[#0a0a0a]">{value}</div>
                    <div className="text-xs text-[#a1a1aa]">{label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="relative order-1 lg:order-2 flex items-center justify-center"
          >
            <div
              className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[480px]"
              style={{ aspectRatio: '1 / 1' }}
            >
              <Globe3D />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3.6, ease: 'easeInOut' }}
                className="absolute z-10 px-4 py-3 rounded-lg bg-white border border-[#e4e4e7] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                style={{ top: '16%', left: '-6%', minWidth: '190px' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇯🇵</span>
                  <div>
                    <div className="text-[#0a0a0a] font-semibold text-xs">Tokyo → New York</div>
                    <div className="text-xs text-[#a1a1aa]">Sony WF-1000XM5 · just shipped</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 9, 0] }}
                transition={{ repeat: Infinity, duration: 4.3, ease: 'easeInOut', delay: 1 }}
                className="absolute z-10 px-4 py-3 rounded-lg bg-white border border-[#e4e4e7] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                style={{ bottom: '24%', right: '-6%', minWidth: '180px' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇰🇷</span>
                  <div>
                    <div className="text-[#0a0a0a] font-semibold text-xs">Seoul → Toronto</div>
                    <div className="text-xs text-[#a1a1aa]">Laneige Lip Mask · 847 sold today</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.9, ease: 'easeInOut', delay: 0.6 }}
                className="absolute z-10 px-4 py-3 rounded-lg bg-white border border-[#e4e4e7] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                style={{ bottom: '-2%', left: '6%', minWidth: '180px' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇦🇪</span>
                  <div>
                    <div className="text-[#0a0a0a] font-semibold text-xs">Dubai → Los Angeles</div>
                    <div className="text-xs text-[#a1a1aa]">14K gold chain · in transit</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
