import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, FileArchive, Presentation, Users } from 'lucide-react';
import { gsap, scrollToTarget, afterIdle } from '../lib/motion';
import { offerings, type Offering } from '../lib/content';

function StudioVisual() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-ink/70">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-bone/20" />
        <span className="h-2 w-2 rounded-full bg-bone/20" />
        <span className="h-2 w-2 rounded-full bg-bone/20" />
        <span className="ml-3 font-mono text-[11px] text-ash">build / negotiation-sim / v0.3</span>
      </div>
      <div className="grid flex-1 grid-cols-5 gap-3 p-4">
        <div className="col-span-3 rounded-lg bg-char p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ash">Scenario 2 of 5</p>
          <p className="mt-3 text-[15px] leading-snug text-bone/90">The client pushes back on price. What do you say first?</p>
          <div className="mt-4 space-y-2">
            {['Hold the number and ask why.', 'Offer a smaller scope.', 'Discount 10%.'].map((t, i) => (
              <div
                key={t}
                className={`rounded-md border px-3 py-2 text-[13px] ${i === 0 ? 'border-bone/40 text-bone' : 'border-line text-bone/60'}`}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-2 flex flex-col justify-between rounded-lg bg-char p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ash">Able to</p>
          <div className="space-y-3">
            {[0.82, 0.56, 0.34].map((w, i) => (
              <div key={i} className="h-1 w-full rounded-full bg-bone/10">
                <div className="strike-line h-1 rounded-full" style={{ width: `${w * 100}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchbookVisual() {
  const items = [
    { icon: FileArchive, label: 'LMS file', meta: 'SCORM 1.2 · 2004' },
    { icon: Presentation, label: 'Classroom version', meta: 'Slides + exercises' },
    { icon: BookOpen, label: 'Facilitator guide', meta: 'Run it this week' },
  ];
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[64px] font-medium leading-none tracking-[-0.02em] text-bone md:text-[96px]">$99</span>
        <span className="label text-ash">per course</span>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map(({ icon: Icon, label, meta }) => (
          <li key={label} className="rounded-xl border border-line bg-ink/60 p-4">
            <Icon size={22} strokeWidth={1.5} className="text-bone" aria-hidden />
            <p className="mt-6 text-[15px] font-medium text-bone">{label}</p>
            <p className="mt-1 text-[13px] text-ash">{meta}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AcademyVisual() {
  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-line bg-ink/60 p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ash">Cohort 04 · Open</span>
        <Users size={18} strokeWidth={1.5} className="text-bone/70" aria-hidden />
      </div>
      <div className="grid grid-cols-8 gap-2 py-6">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={`aspect-square rounded-full ${i < 17 ? 'bg-bone/25' : 'border border-bone/15'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between text-[13px] text-ash">
        <span>6 weeks · live practice</span>
        <span>7 seats left</span>
      </div>
    </div>
  );
}

function Card({ o, active }: { o: Offering; active: boolean }) {
  const Visual = o.id === 'studio' ? StudioVisual : o.id === 'matchbook' ? MatchbookVisual : AcademyVisual;
  return (
    <article
      data-offer-card
      aria-labelledby={`offer-${o.id}`}
      className="card relative grid h-full gap-8 overflow-hidden p-6 transition-shadow duration-500 md:grid-cols-12 md:p-10"
      style={{
        boxShadow: active ? '0 0 0 1px rgba(255,90,31,0.55), 0 0 48px -8px rgba(255,90,31,0.28)' : '0 0 0 1px rgba(245,242,236,0.04)',
      }}
    >
      <div className="flex flex-col md:col-span-5">
        <p className="label text-ash">
          {o.num} / {o.label}
        </p>
        <h3 id={`offer-${o.id}`} className="mt-6 text-[36px] font-semibold leading-[1.05] tracking-[-0.025em] text-bone md:text-[52px]">
          {o.title}
        </h3>
        <p className="mt-2 text-ash">{o.audience}</p>
        <p className="mt-6 max-w-md text-bone/80">{o.copy}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {o.deliverables.map((d) => (
            <li
              key={d}
              className="rounded-full border border-line px-3 py-1 font-mono text-[12px] uppercase tracking-[0.06em] text-bone/70"
            >
              {d}
            </li>
          ))}
        </ul>
        <a
          href="#cta"
          onClick={(e) => (e.preventDefault(), scrollToTarget('#cta'))}
          className="group mt-auto inline-flex items-center gap-2 pt-8 font-medium text-bone"
          data-cursor="Build"
        >
          <span className="link-strike">{o.cta}</span>
          <ArrowRight size={18} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </a>
      </div>
      <div className="min-h-[260px] md:col-span-7">
        <Visual />
      </div>
      {/* Dims cards that are behind the active one to ~40%. */}
      <div data-dim aria-hidden className="pointer-events-none absolute inset-0 rounded-[16px] bg-ink opacity-0" />
    </article>
  );
}

/**
 * Three ways in. Based on nimbus-sticky-cards: cards rise and stack as you
 * scroll, tilting into place. Behind cards dim, the active card gets an
 * Ember edge. Mobile and reduced motion get a plain stacked list.
 */
export default function Offerings() {
  const root = useRef<HTMLElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(
    () =>
      afterIdle(() => {
        const mm = gsap.matchMedia();
        mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
          setPinned(true);
          const cards = gsap.utils.toArray<HTMLElement>('[data-offer-card]', stack.current);
          const dims = cards.map((c) => c.querySelector<HTMLElement>('[data-dim]')!);
          gsap.set(cards.slice(1), { yPercent: 115, rotate: 3.5, transformOrigin: '20% 100%' });
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: '+=220%',
              pin: true,
              scrub: 0.5,
              onUpdate: (st) => setActive(Math.min(cards.length - 1, Math.round(st.progress * (cards.length - 1) + 0.15))),
            },
          });
          cards.slice(1).forEach((c, idx) => {
            const i = idx + 1;
            tl.to(c, { yPercent: 0, y: i * 26, rotate: 0, duration: 1, ease: 'power2.out' }, idx)
              .to(
                cards.slice(0, i),
                { scale: (j: number) => 1 - (i - j) * 0.04, y: (j: number) => j * 26 - (i - j) * 10, duration: 1, ease: 'power2.out' },
                idx,
              )
              .to(dims.slice(0, i), { opacity: 0.6, duration: 1 }, idx);
          });
          tl.to({}, { duration: 0.3 });
          return () => setPinned(false);
        });
        return () => mm.revert();
      }),
    [],
  );

  return (
    <section ref={root} id="offerings" aria-labelledby="offerings-title" className="relative bg-ink lg:h-[100svh]">
      <div className="wrap flex h-full flex-col py-24 lg:py-0 lg:pt-28">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end lg:mb-8">
          <h2 id="offerings-title" className="text-[40px] font-semibold leading-[1.05] tracking-[-0.025em] text-bone md:text-h1">
            Three ways in.
          </h2>
          <p className="max-w-sm text-ash">Build with us, run our courses, or join a program. Same standard either way.</p>
        </div>
        <div ref={stack} className={pinned ? 'relative min-h-0 flex-1 pb-10' : 'flex flex-col gap-6'}>
          {offerings.map((o, i) => (
            <div
              key={o.id}
              className={pinned ? 'absolute inset-x-0 top-0 h-[calc(100%-80px)]' : ''}
              style={pinned ? { zIndex: i + 1 } : undefined}
            >
              <Card o={o} active={pinned ? active === i : false} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
