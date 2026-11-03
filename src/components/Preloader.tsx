import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/motion';

/**
 * The Strike. A 1px line draws left to right (transparent > Ember > Flare),
 * a spark flares at its tip, and the page ignites through a radial mask
 * growing from that point. 1.2s total. Skipped on repeat visits and under
 * reduced motion (decided before first paint in index.html).
 */
export default function Preloader({ onIgnite }: { onIgnite: () => void }) {
  const [active, setActive] = useState(() => document.documentElement.classList.contains('is-striking'));
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const spark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      onIgnite();
      return;
    }
    const el = root.current!;
    const ox = 72; // spark origin, % of width
    const oy = 50;
    el.style.setProperty('--ox', `${ox}%`);
    el.style.setProperty('--oy', `${oy}%`);
    const finish = () => {
      try {
        sessionStorage.setItem('ml-struck', '1');
      } catch {
        /* storage blocked */
      }
      document.documentElement.classList.remove('is-striking');
      setActive(false);
    };
    const tl = gsap.timeline({ onComplete: finish });
    tl.fromTo(line.current, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.in' })
      .fromTo(spark.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.14, ease: 'power2.out' }, '-=0.04')
      .to(spark.current, { scale: 2.6, opacity: 0, duration: 0.3, ease: 'power2.out' })
      .to(line.current, { opacity: 0, duration: 0.2 }, '<')
      .fromTo(el, { '--r': '0vmax' }, { '--r': '160vmax', duration: 0.6, ease: 'power3.in' }, '-=0.32')
      .call(onIgnite, [], '-=0.5');
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!active) return null;

  return (
    <div
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100] bg-ink"
      style={{
        // Ink everywhere except a growing hole at the spark point.
        WebkitMaskImage: 'radial-gradient(circle at var(--ox) var(--oy), transparent var(--r, 0vmax), #000 calc(var(--r, 0vmax) + 1px))',
        maskImage: 'radial-gradient(circle at var(--ox) var(--oy), transparent var(--r, 0vmax), #000 calc(var(--r, 0vmax) + 1px))',
      }}
    >
      <div className="absolute top-1/2" style={{ left: '20%', width: '52%' }}>
        <div ref={line} className="h-px w-full origin-left" style={{ background: 'var(--strike)', transform: 'scaleX(0)' }} />
        <div
          ref={spark}
          className="absolute -right-3 -top-3 h-6 w-6 rounded-full"
          style={{
            opacity: 0,
            background: 'radial-gradient(circle, #fff 0%, var(--flare) 28%, rgba(255,90,31,0.6) 52%, transparent 72%)',
            boxShadow: '0 0 40px 12px rgba(255,181,71,0.35)',
          }}
        />
      </div>
    </div>
  );
}
