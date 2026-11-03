import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { gsap, afterIdle } from '../lib/motion';

/**
 * Bring the light. Full-screen Ink; the cursor carries a soft ember glow with
 * eased lag, and the one big button burns brighter as the cursor gets close.
 * Structure and motion beat adapted from rocket-cta (staggered fade-up of
 * headline, line, button) and rebuilt around the glow.
 */
export default function CTA() {
  const root = useRef<HTMLElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLAnchorElement>(null);

  useEffect(
    () =>
      afterIdle(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            root.current,
            { clipPath: 'ellipse(10% 8% at 50% 50%)' },
            {
              clipPath: 'ellipse(150% 150% at 50% 50%)',
              ease: 'none',
              scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 10%', scrub: true },
            },
          );
          gsap.fromTo(
            root.current!.querySelectorAll('[data-rise]'),
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: 'expo.out',
              stagger: 0.12,
              scrollTrigger: { trigger: root.current, start: 'top 45%' },
            },
          );
        });

        mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
          const el = root.current!;
          const g = glow.current!;
          const b = btn.current!;
          const xTo = gsap.quickTo(g, 'x', { duration: 0.9, ease: 'power3.out' });
          const yTo = gsap.quickTo(g, 'y', { duration: 0.9, ease: 'power3.out' });
          const heat = gsap.quickTo(b, '--heat', { duration: 0.4, ease: 'power2.out' });
          const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo(e.clientX - r.left);
            yTo(e.clientY - r.top);
            const br = b.getBoundingClientRect();
            const d = Math.hypot(e.clientX - (br.left + br.width / 2), e.clientY - (br.top + br.height / 2));
            heat(Math.max(0, 1 - d / 520));
          };
          const onEnter = () => gsap.to(g, { opacity: 1, duration: 0.6 });
          const onLeave = () => {
            gsap.to(g, { opacity: 0, duration: 0.8 });
            heat(0);
          };
          const r = el.getBoundingClientRect();
          gsap.set(g, { x: r.width / 2, y: r.height / 2 });
          el.addEventListener('pointermove', onMove);
          el.addEventListener('pointerenter', onEnter);
          el.addEventListener('pointerleave', onLeave);
          return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerenter', onEnter);
            el.removeEventListener('pointerleave', onLeave);
          };
        });
        return () => mm.revert();
      }),
    [],
  );

  return (
    <section
      ref={root}
      id="cta"
      aria-labelledby="cta-title"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink"
    >
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[900px] w-[900px] rounded-full opacity-0"
        style={{
          background:
            'radial-gradient(circle, rgba(255,181,71,0.16) 0%, rgba(255,90,31,0.10) 22%, rgba(255,90,31,0.04) 42%, transparent 66%)',
          marginLeft: -450,
          marginTop: -450,
        }}
      />
      <div className="wrap relative text-center">
        <p data-rise className="label mb-8 text-ash">
          Start a build
        </p>
        <h2
          id="cta-title"
          data-rise
          className="mx-auto max-w-4xl text-[48px] font-semibold leading-[1.02] tracking-[-0.03em] text-bone md:text-[clamp(64px,7vw,104px)]"
        >
          The work changed.
          <br />
          Your people <span className="accent pr-[0.05em]">can</span> too.
        </h2>
        <div data-rise className="mt-14 flex justify-center">
          <a
            ref={btn}
            href="mailto:hello@matchlight.ai?subject=Start%20a%20build"
            data-cursor="Build"
            className="group inline-flex items-center gap-4 rounded-full bg-ember py-3 pl-10 pr-3 text-[22px] font-medium text-ink transition-[gap] duration-300 md:py-4 md:pl-14 md:pr-4 md:text-[28px]"
            style={
              {
                '--heat': 0,
                boxShadow:
                  '0 0 calc(24px + var(--heat) * 90px) calc(var(--heat) * 18px) rgba(255,181,71, calc(0.18 + var(--heat) * 0.5)), 0 0 0 1px rgba(255,181,71, calc(var(--heat) * 0.6))',
              } as React.CSSProperties
            }
          >
            Start a build
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-bone transition-transform duration-300 group-hover:scale-110 md:h-16 md:w-16">
              <ArrowRight size={24} strokeWidth={1.5} aria-hidden />
            </span>
          </a>
        </div>
        <p data-rise className="mt-8 text-ash">
          One conversation to scope it. A working version in days.
        </p>
      </div>
    </section>
  );
}
