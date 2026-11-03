import { useCallback, useEffect, useState } from 'react';
import Preloader from './components/Preloader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import BurnSection from './components/BurnSection';
import Offerings from './components/Offerings';
import StrikeProcess from './components/StrikeProcess';
import Beliefs from './components/Beliefs';
import ProofStrip from './components/ProofStrip';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import Grain from './components/Grain';
import { ScrollTrigger, useReducedMotion, useSmoothScroll } from './lib/motion';

export default function App() {
  const reduced = useReducedMotion();
  const [ignited, setIgnited] = useState(false);
  const onIgnite = useCallback(() => setIgnited(true), []);

  useSmoothScroll(!reduced);

  // Fonts change line lengths; re-measure every pinned section once they land.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  return (
    <>
      <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[300] rounded-full bg-bone px-4 py-2 text-ink">
        Skip to content
      </a>
      <Preloader onIgnite={onIgnite} />
      <Nav />
      <main id="main">
        <Hero ignited={ignited} />
        <BurnSection />
        <Offerings />
        <StrikeProcess />
        <Beliefs />
        <ProofStrip />
        <CTA />
      </main>
      <Footer />
      <Cursor />
      <Grain />
    </>
  );
}
