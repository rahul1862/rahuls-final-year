import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SupportChat } from '../components/SupportChat';

export function Root() {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <SupportChat />
      <ScrollRestoration />
    </div>
  );
}
