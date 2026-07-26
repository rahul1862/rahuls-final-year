import { Outlet, ScrollRestoration } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SupportChat } from '../components/SupportChat';

export function Root() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-white text-[#0a0a0a]" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <SupportChat />
      {/* Resets scroll position on route change, restores it on back/forward navigation */}
      <ScrollRestoration />
    </div>
  );
}
