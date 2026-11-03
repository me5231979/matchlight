import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, afterIdle } from '../lib/motion';
import { beliefs } from '../lib/content';

/**
 * What we believe. One statement per viewport beat. Words scrub from blur and
 * 0.1 opacity to sharp (cinematic-landing-page) while weight and tracking
 * shift as each line enters and leaves (Epic). The section itself arrives
 * through a clip-path ellipse wipe from the center of the screen.
 */
export default function Beliefs() {
  const root = useRef<HTMLElement>(null);

  useEffect(
    () =>
      afterIdle(() => {
        const mm = gsap.matchMedia();
        mm.add(
          {
            motion: '(prefers-reduced-motion: no-preference)',
            desktop: '(min-width: 768px)',
          },
          (ctx) => {
            const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
            if (!motion) return;

            const el = root.current!;
            const wipe = (progress: number) => {
              if (progress >= 1) return gsap.set(el, { clipPath: 'none' });
              const top = el.getBoundingClientRect().top;
              const vw = window.innerWidth;
              const vh = window.innerHeight;
              const cy = Math.max(0, (vh - top) / 2);
              const e = progress * progress;
              gsap.set(el, { clipPath: `ellipse(${Math.max(1, e * vw * 0.8)}px ${Math.max(1, e * vh * 0.8)}px at 50% ${cy}px)` });
            };
            wipe(0);
            ScrollTrigger.create({
              trigger: el,
              start: 'top bottom',
              end: 'top top',
              onUpdate: (st) => wipe(st.progress),
              onLeave: () => wipe(1),
              onEnterBack: (st) => wipe(st.progress),
            });

            gsap.utils.toArray<HTMLElement>('[data-belief]', root.current).forEach((block) => {
              const line = block.querySelector<HTMLElement>('[data-line]')!;
              const words = line.querySelectorAll<HTMLElement>('[data-w]');
              const enter = gsap.timeline({
                scrollTrigger: { trigger: block, start: 'top 85%', end: 'center 55%', scrub: true },
              });
              enter
                .fromTo(line, { rotate: 3, transformOrigin: '0% 50%' }, { rotate: 0, ease: 'none' }, 0)
                .fromTo(words, { opacity: 0.1, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none', stagger: 0.05 }, 0);
              if (desktop) {
                enter.fromTo(
                  line,
                  { fontWeight: 400, letterSpacing: '0.01em' },
                  { fontWeight: 600, letterSpacing: '-0.035em', ease: 'none' },
                  0,
                );
                gsap.to(line, {
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  opacity: 0.25,
                  ease: 'none',
                  scrollTrigger: { trigger: block, start: 'center 35%', end: 'bottom top', scrub: true },
                });
              }
            });
          },
        );
        return () => mm.revert();
      }),
    [],
  );

  return (
    <section ref={root} id="beliefs" aria-labelledby="beliefs-title" className="relative bg-char">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(60% 40% at 50% 0%, rgba(255,90,31,0.07), transparent 70%)' }}
      />
      <div className="wrap relative pt-28 md:pt-40">
        <p className="label text-ash" id="beliefs-title">
          What we believe
        </p>
      </div>
      <ol className="relative">
        {beliefs.map((b, i) => {
          const parts = b.text.split(' ');
          return (
            <li key={i} data-belief className="flex min-h-[70svh] items-center md:min-h-[100svh]">
              <div className="wrap grid gap-6 md:grid-cols-12">
                <span className="label pt-3 text-ash md:col-span-2">0{i + 1}</span>
                <p
                  data-line
                  className="text-[40px] font-semibold leading-[1.06] tracking-[-0.03em] text-bone md:col-span-10 md:text-[clamp(56px,6.4vw,96px)]"
                >
                  {parts.map((w, j) => (
                    <span key={j}>
                      <span data-w className={`inline-block ${w === b.accent ? 'accent pr-[0.05em]' : ''}`}>
                        {w}
                      </span>
                      {j < parts.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
