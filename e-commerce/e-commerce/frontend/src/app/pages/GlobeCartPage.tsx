import { GCNavbar } from '../components/globecart/GCNavbar';
import { HeroSection } from '../components/globecart/HeroSection';
import { TrendingCountries } from '../components/globecart/TrendingCountries';
import { LiveFeed } from '../components/globecart/LiveFeed';
import { RecommendationsSection } from '../components/globecart/RecommendationsSection';
import { FeaturedProducts } from '../components/globecart/FeaturedProducts';
import { GCFooter } from '../components/globecart/GCFooter';
import { SupportChat } from '../components/SupportChat';

export function GlobeCartPage() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <GCNavbar />

      <div id="hero">
        <HeroSection />
      </div>

      <div id="countries">
        <TrendingCountries />
      </div>

      <div id="live-feed">
        <LiveFeed />
      </div>

      <div id="shop">
        <RecommendationsSection />
      </div>

      <div id="featured">
        <FeaturedProducts />
      </div>

      <GCFooter />
      <SupportChat />
    </div>
  );
}
