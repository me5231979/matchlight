import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, SplitText, useIsoLayoutEffect, useIsMobile, useReducedMotion, scrollToTarget, isMobile } from '../lib/motion';
import { hero } from '../lib/content';
import { NewWorld, OldWorld } from './HeroWorlds';

const SparkField = lazy(() => import('./SparkField'));

// MotionSites background d38a1a89 (abstract dark motion loop), graded warm. Lives in the new world.
const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_031045_0e1165dd-ab48-46e3-ad3d-5fe77f217647.mp4';

/** Warm gradient behind the video; also what you see before it loads. */
const NEW_BG =
  'radial-gradient(120% 90% at 78% 40%, rgba(255,90,31,0.38) 0%, rgba(184,54,10,0.2) 30%, rgba(14,14,12,0) 64%), radial-gradient(80% 60% at 18% 20%, rgba(255,181,71,0.14) 0%, rgba(14,14,12,0) 60%), linear-gradient(180deg, #1C1B19 0%, #0E0E0C 100%)';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

type Lens = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  r: number;
  base: number;
  boost: number;
  scrollGrow: number;
  lastMove: number;
  t: number;
  started: boolean;
};

/**
 * Hero: Ignition. The surface is L&D as it runs today, gray and on a loop.
 * The cursor is the match: an ember lens follows it and burns through to the
 * world of work underneath, live and lit. With no cursor (touch, idle) the
 * lens drifts on its own. Scrolling out widens it until the old world is gone.
 */
export default function Hero({ ignited }: { ignited: boolean }) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const section = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const old = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const side = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const lens = useRef<Lens | null>(null);
  const [fx, setFx] = useState(false);

  // Headline chars sit low and faint under the strike overlay, then rise on ignition.
  useIsoLayoutEffect(() => {
    if (reduced) return;
    const split = SplitText.create(title.current!, { type: 'chars,words', charsClass: 'split-char', aria: 'hidden' });
    gsap.set(split.chars, { y: 40, opacity: 0.12 });
    gsap.set(side.current!.children, { y: 20, opacity: 0.15 });
    return () => split.revert();
  }, [reduced]);

  useEffect(() => {
    if (!ignited || reduced) return;
    const chars = title.current!.querySelectorAll('.split-char');
    const tl = gsap.timeline();
    tl.to(chars, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.03 }).to(
      side.current!.children,
      { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.12 },
      0.5,
    );
    return () => {
      tl.kill();
    };
  }, [ignited, reduced]);

  // The lens. One ticker loop eases position and radius, then writes the mask.
  useEffect(() => {
    const c = card.current!;
    const o = old.current!;
    const ringEl = ring.current!;
    const write = (x: number, y: number, rad: number) => {
      const m = `radial-gradient(circle ${Math.max(0, rad)}px at ${x}px ${y}px, transparent 0, transparent 80%, #000 100%)`;
      o.style.webkitMaskImage = m;
      o.style.maskImage = m;
      ringEl.style.transform = `translate3d(${x - rad}px, ${y - rad}px, 0)`;
      ringEl.style.width = ringEl.style.height = `${rad * 2}px`;
      ringEl.style.opacity = rad > 4 ? '1' : '0';
    };

    if (reduced) {
      const b = c.getBoundingClientRect();
      write(b.width * 0.72, b.height * 0.36, Math.min(260, b.width * 0.32));
      return;
    }

    const size = () => c.getBoundingClientRect();
    const b0 = size();
    // Start where the strike's spark flared (72% / 50%).
    const s: Lens = {
      x: b0.width * 0.72,
      y: b0.height * 0.5,
      tx: b0.width * 0.72,
      ty: b0.height * 0.5,
      r: 0,
      base: 0,
      boost: 0,
      scrollGrow: 0,
      lastMove: -1e9,
      t: 0,
      started: false,
    };
    lens.current = s;

    const onMove = (e: PointerEvent) => {
      const b = size();
      const nx = e.clientX - b.left;
      const ny = e.clientY - b.top;
      s.boost = Math.min(90, s.boost + Math.hypot(nx - s.tx, ny - s.ty) * 0.35);
      s.tx = nx;
      s.ty = ny;
      s.lastMove = performance.now();
    };
    c.addEventListener('pointermove', onMove, { passive: true });
    c.addEventListener('pointerdown', onMove, { passive: true });

    const tick = (_t: number, dt: number) => {
      const b = size();
      s.t += dt / 1000;
      const idle = performance.now() - s.lastMove > 2400;
      if (idle) {
        // Drift on a slow figure eight across the upper part of the card.
        s.tx = b.width * (0.6 + 0.24 * Math.sin(s.t * 0.33));
        s.ty = b.height * (0.34 + 0.14 * Math.sin(s.t * 0.66));
      }
      const follow = idle ? 0.03 : 0.16;
      s.x += (s.tx - s.x) * follow;
      s.y += (s.ty - s.y) * follow;
      s.boost *= 0.93;
      const target = s.started ? s.base + s.boost + s.scrollGrow : 0;
      s.r += (target - s.r) * 0.1;
      // Flame flicker on the rim.
      const flicker = 1 + Math.sin(s.t * 13) * 0.006 + Math.sin(s.t * 7.3) * 0.008;
      write(s.x, s.y, s.r * flicker);
    };
    gsap.ticker.add(tick);

    const setBase = () => (s.base = Math.min(240, Math.max(120, size().width * 0.15)));
    setBase();
    window.addEventListener('resize', setBase);

    // Scrolling out of the hero: the lens widens until the old world is gone.
    const grow = gsap.to(s, {
      scrollGrow: () => Math.hypot(size().width, size().height),
      ease: 'power1.in',
      scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom 20%', scrub: true, invalidateOnRefresh: true },
    });

    return () => {
      gsap.ticker.remove(tick);
      c.removeEventListener('pointermove', onMove);
      c.removeEventListener('pointerdown', onMove);
      window.removeEventListener('resize', setBase);
      grow.scrollTrigger?.kill();
      grow.kill();
      lens.current = null;
    };
  }, [reduced]);

  // Ignition strikes the match and opens the lens.
  useEffect(() => {
    const s = lens.current;
    if (ignited && s) {
      s.started = true;
      s.boost = 120;
    }
  }, [ignited, reduced]);

  // Video and WebGL load after first paint so the headline owns LCP.
  useEffect(() => {
    if (reduced) return;
    const w = window as Window & typeof globalThis;
    const idle = (cb: () => void): number =>
      typeof w.requestIdleCallback === 'function' ? w.requestIdleCallback(cb, { timeout: 1500 }) : w.setTimeout(cb, 600);
    const id = idle(() => {
      const v = video.current;
      if (v && !v.src) {
        v.src = HERO_VIDEO;
        v.play().catch(() => {});
      }
      if (!isMobile() && hasWebGL()) setFx(true);
    });
    return () => {
      if (typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [reduced]);

  return (
    <section ref={section} id="top" className="relative h-[100svh] min-h-[640px] w-full p-3 md:p-6" aria-labelledby="hero-title">
      <div ref={card} data-hero-card className="relative h-full w-full overflow-hidden rounded-[20px] md:rounded-[32px]">
        {/* New world (underneath): graded video, sparks, live work. */}
        <div className="absolute inset-0" style={{ background: NEW_BG }}>
          {!reduced && (
            <video ref={video} className="absolute inset-0 h-full w-full object-cover opacity-70" muted loop playsInline preload="none" aria-hidden />
          )}
          <div className="pointer-events-none absolute inset-0 bg-ember opacity-30 mix-blend-color" />
          <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-overlay" />
          {fx && !mobile && (
            <Suspense fallback={null}>
              <SparkField count={2000} />
            </Suspense>
          )}
          <NewWorld />
        </div>

        {/* Old world (surface), cut away by the lens. */}
        <div ref={old} className="absolute inset-0">
          <OldWorld />
        </div>

        {/* The match: ember rim around the lens. */}
        <div
          ref={ring}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-full opacity-0"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255,181,71,0.55), inset 0 0 40px 6px rgba(255,90,31,0.35), 0 0 60px 8px rgba(255,90,31,0.22)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Legibility fall-off for the headline, above both worlds. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-ink via-ink/80 to-transparent" />

        <p className="label pointer-events-none absolute bottom-6 right-12 z-10 hidden text-bone/45 lg:block" aria-hidden>
          Move to strike a light
        </p>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-5 pb-8 md:px-12 md:pb-14">
          <div className="grid grid-cols-12 items-end gap-y-8 md:gap-x-6">
            <h1
              id="hero-title"
              ref={title}
              className="col-span-12 text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] text-bone sm:text-[56px] lg:text-[clamp(64px,6.1vw,88px)] lg:leading-[1.04]"
            >
              <span className="block">{hero.line1}</span>
              <span className="block">
                {hero.line2[0]} <span className="accent pr-[0.06em]">{hero.line2[1]}</span> {hero.line2[2]}
              </span>
            </h1>
            <div ref={side} className="pointer-events-auto col-span-12 flex max-w-md flex-col gap-7 lg:col-span-5 lg:col-start-8 lg:max-w-none">
              <p className="text-[16px] leading-[1.55] text-bone/80 md:text-body">{hero.sub}</p>
              <div className="flex flex-wrap items-center gap-3">
                <a href="#cta" className="btn-primary" data-cursor="Build" onClick={(e) => (e.preventDefault(), scrollToTarget('#cta'))}>
                  Start a build
                  <span className="chip">
                    <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
                  </span>
                </a>
                <a
                  href="#offerings"
                  className="btn-secondary"
                  data-cursor="View"
                  onClick={(e) => (e.preventDefault(), scrollToTarget('#offerings'))}
                >
                  See the catalog
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
