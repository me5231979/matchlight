import { useEffect, useRef } from 'react';
import { gsap, SplitText, afterIdle } from '../lib/motion';
import { problem } from '../lib/content';

/**
 * Burn the old model. Each legacy metric dissolves through an SVG noise
 * threshold with an Ember edge glow, shedding ash. Then "Capability." rises.
 */

const K_START = 0; // feFuncA intercept: fully intact
const K_END = -13; // fully burnt
const EDGE = 2.6; // how far ahead of the burn front the glowing rim reaches

type Ash = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; hot: boolean };

function BurnFilters() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        {problem.burn.map((_, i) => (
          <filter key={i} id={`burn-${i}`} x="-5%" y="-25%" width="110%" height="150%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.011 0.018" numOctaves="2" seed={i * 11 + 3} result="noise" />
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="n" />
            <feComponentTransfer in="n" result="keep">
              <feFuncA data-k type="linear" slope="14" intercept={K_START} />
            </feComponentTransfer>
            <feComponentTransfer in="n" result="edge">
              <feFuncA data-e type="linear" slope="14" intercept={K_START + EDGE} />
            </feComponentTransfer>
            <feComposite in="edge" in2="keep" operator="out" result="ring" />
            <feFlood floodColor="#FF5A1F" result="ember" />
            <feComposite in="ember" in2="ring" operator="in" result="emberRing" />
            <feComposite in="emberRing" in2="SourceAlpha" operator="in" result="emberText" />
            <feGaussianBlur in="emberText" stdDeviation="4" result="glow" />
            <feComposite in="SourceGraphic" in2="keep" operator="in" result="text" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="text" />
              <feMergeNode in="emberText" />
            </feMerge>
          </filter>
        ))}
      </defs>
    </svg>
  );
}

export default function BurnSection() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const body = useRef<HTMLParagraphElement>(null);

  useEffect(
    () =>
      afterIdle(() => {
        const mm = gsap.matchMedia();
        const words = Array.from(stage.current!.querySelectorAll<HTMLElement>('[data-burn]'));
        const filters = problem.burn.map((_, i) => document.getElementById(`burn-${i}`)!);
        const setBurn = (i: number, p: number) => {
          // Only run the (expensive) SVG filter while a word is actually burning.
          const burning = p > 0.001 && p < 0.999;
          const f = burning ? `url(#burn-${i})` : 'none';
          if (words[i].style.filter !== f) words[i].style.filter = f;
          const k = K_START + (K_END - K_START) * p;
          filters[i].querySelector('[data-k]')!.setAttribute('intercept', String(k));
          filters[i].querySelector('[data-e]')!.setAttribute('intercept', String(k + EDGE));
        };

        // Desktop: pinned stage, sequential burn, ash particles.
        mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
          const ctx = canvas.current!.getContext('2d')!;
          let ash: Ash[] = [];
          let raf = 0;
          let running = false;
          const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 1.5);
            canvas.current!.width = canvas.current!.clientWidth * dpr;
            canvas.current!.height = canvas.current!.clientHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          };
          resize();
          window.addEventListener('resize', resize);
          const frame = () => {
            const w = canvas.current!.clientWidth;
            const h = canvas.current!.clientHeight;
            ctx.clearRect(0, 0, w, h);
            ash = ash.filter((a) => (a.life += 1) < a.max);
            for (const a of ash) {
              a.vy -= 0.012;
              a.vx += (Math.random() - 0.5) * 0.06;
              a.x += a.vx;
              a.y += a.vy;
              const t = 1 - a.life / a.max;
              ctx.globalAlpha = t * (a.hot ? 0.9 : 0.55);
              ctx.fillStyle = a.hot && a.life < a.max * 0.35 ? '#FFB547' : a.hot ? '#FF5A1F' : '#8A857C';
              ctx.fillRect(a.x, a.y, a.r, a.r);
            }
            ctx.globalAlpha = 1;
            if (ash.length) raf = requestAnimationFrame(frame);
            else running = false;
          };
          const emit = (i: number, amount: number) => {
            const r = words[i].getBoundingClientRect();
            const c = canvas.current!.getBoundingClientRect();
            const n = Math.min(80, Math.round(amount));
            for (let j = 0; j < n; j++) {
              ash.push({
                x: r.left - c.left + Math.random() * r.width,
                y: r.top - c.top + r.height * (0.2 + Math.random() * 0.7),
                vx: (Math.random() - 0.5) * 0.8,
                vy: -0.3 - Math.random() * 1.1,
                life: 0,
                max: 50 + Math.random() * 70,
                r: 1 + Math.random() * 2.2,
                hot: Math.random() < 0.45,
              });
            }
            if (!running) {
              running = true;
              raf = requestAnimationFrame(frame);
            }
          };

          const state = words.map(() => ({ p: 0 }));
          const tl = gsap.timeline({
            scrollTrigger: { trigger: stage.current, start: 'top top', end: '+=260%', pin: true, scrub: 0.6 },
          });
          tl.from('[data-burn-intro]', { opacity: 0, y: 20, duration: 0.3 });
          words.forEach((_, i) => {
            let last = 0;
            tl.to(
              state[i],
              {
                p: 1,
                duration: 1,
                ease: 'none',
                onUpdate: () => {
                  const p = state[i].p;
                  setBurn(i, p);
                  const d = Math.abs(p - last);
                  if (p > 0.02 && p < 0.98) emit(i, d * 900);
                  last = p;
                },
              },
              i === 0 ? '+=0.1' : '-=0.55',
            ).to(words[i], { opacity: 0, duration: 0.15 }, '-=0.12');
          });
          tl.to('[data-burn-intro]', { opacity: 0, duration: 0.3 }, '-=0.6')
            .fromTo(
              '[data-capability]',
              { yPercent: 40, opacity: 0, filter: 'blur(14px)' },
              { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'expo.out' },
              '-=0.2',
            )
            .fromTo('[data-after]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
            .to({}, { duration: 0.6 });

          return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            words.forEach((_, i) => setBurn(i, 0));
          };
        });

        // Mobile: no pin. Each word burns as it passes through the viewport.
        mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
          words.forEach((w, i) => {
            const s = { p: 0 };
            gsap.to(s, {
              p: 1,
              ease: 'none',
              onUpdate: () => setBurn(i, s.p),
              scrollTrigger: { trigger: w, start: 'top 70%', end: 'top 25%', scrub: true },
            });
          });
          gsap.fromTo(
            '[data-capability]',
            { yPercent: 30, opacity: 0 },
            { yPercent: 0, opacity: 1, ease: 'expo.out', duration: 1.2, scrollTrigger: { trigger: '[data-capability]', start: 'top 85%' } },
          );
          return () => words.forEach((_, i) => setBurn(i, 0));
        });

        // Body copy: scroll-linked character reveal (prisma-landing), 0.2 to 1 opacity.
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          const split = SplitText.create(body.current!, { type: 'words,chars', aria: 'hidden' });
          gsap.fromTo(
            split.chars,
            { opacity: 0.2 },
            {
              opacity: 1,
              ease: 'none',
              stagger: 0.02,
              scrollTrigger: { trigger: body.current, start: 'top 80%', end: 'bottom 35%', scrub: true },
            },
          );
          return () => split.revert();
        });

        return () => mm.revert();
      }),
    [],
  );

  return (
    <section ref={section} id="problem" aria-labelledby="problem-title" className="relative bg-ink">
      <BurnFilters />
      <div ref={stage} className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden motion-safe:md:h-[100svh]">
        <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" />
        <div className="wrap relative py-24 md:py-0">
          <div data-burn-intro className="mb-8 md:mb-10">
            <p className="label mb-4 text-ash">The problem</p>
            <h2 id="problem-title" className="text-h3 text-bone md:text-[28px]">
              {problem.intro}
            </h2>
          </div>
          <ul className="relative" aria-label="What most training measures">
            {problem.burn.map((w) => (
              <li
                key={w}
                data-burn
                className="w-fit text-[52px] font-semibold leading-[1.02] tracking-[-0.04em] text-ash motion-reduce:line-through motion-reduce:decoration-ember/70 motion-reduce:decoration-2 md:text-[clamp(64px,8.6vw,132px)]"
              >
                {w}
              </li>
            ))}
          </ul>
          <div className="mt-16 motion-safe:md:pointer-events-none motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:mt-0 motion-safe:md:flex motion-safe:md:flex-col motion-safe:md:items-start motion-safe:md:justify-center motion-safe:md:px-6">
            <p data-after className="mb-2 max-w-xl text-body-l text-bone/80 md:mb-0">
              {problem.after}
            </p>
            <p data-capability className="accent text-[96px] leading-[0.95] md:text-[clamp(140px,19vw,300px)] md:leading-[0.9]">
              Capability.
            </p>
          </div>
        </div>
      </div>
      <div className="wrap pb-32 pt-8 md:pb-48 md:pt-24">
        <div className="grid gap-8 md:grid-cols-12">
          <p className="label text-ash md:col-span-3">Why we exist</p>
          <p
            ref={body}
            className="text-[26px] font-medium leading-[1.3] tracking-[-0.015em] text-bone md:col-span-9 md:text-[40px] md:leading-[1.2]"
          >
            {problem.body}
          </p>
        </div>
      </div>
    </section>
  );
}
