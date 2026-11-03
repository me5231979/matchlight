import { useEffect, useRef } from 'react';
import { gsap, afterIdle } from '../lib/motion';
import { steps } from '../lib/content';

/**
 * How a build works. A pinned horizontal track; one strike line draws across
 * all four steps, scrubbed to scroll. Each step lights when the tip reaches it.
 * Mobile: a vertical line drawn down the left edge.
 */
export default function StrikeProcess() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const vline = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      afterIdle(() => {
        const mm = gsap.matchMedia();
        const light = (el: Element, on: boolean) => {
          if (el.classList.contains('is-lit') === on) return;
          el.classList.toggle('is-lit', on);
          const burst = el.querySelector('[data-burst]');
          if (on && burst) gsap.fromTo(burst, { scale: 0.2, opacity: 1 }, { scale: 3.2, opacity: 0, duration: 0.7, ease: 'expo.out' });
        };

        mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
          const t = track.current!;
          const markers = Array.from(t.querySelectorAll<HTMLElement>('[data-step]'));
          const distance = () => t.scrollWidth - window.innerWidth;
          gsap.set(line.current, { scaleX: 0 });
          gsap.to(t, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top top',
              end: () => `+=${distance() * 1.1}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (st) => {
                const offset = st.progress * distance();
                // The tip sits at 62% of the viewport, so a step lights just after it crosses center.
                const tip = offset + window.innerWidth * 0.62;
                gsap.set(line.current, { scaleX: Math.min(1, tip / t.scrollWidth) });
                markers.forEach((m) => light(m, tip >= m.offsetLeft + 8));
              },
            },
          });
          return () => markers.forEach((m) => m.classList.remove('is-lit'));
        });

        mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
          const markers = Array.from(root.current!.querySelectorAll<HTMLElement>('[data-vstep]'));
          gsap.fromTo(
            vline.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: vline.current!.parentElement,
                start: 'top 60%',
                end: 'bottom 60%',
                scrub: true,
                onUpdate: (st) => {
                  const h = vline.current!.parentElement!.offsetHeight * st.progress;
                  markers.forEach((m) => light(m, h >= m.offsetTop + 6));
                },
              },
            },
          );
          return () => markers.forEach((m) => m.classList.remove('is-lit'));
        });

        mm.add('(prefers-reduced-motion: reduce)', () => {
          root.current!.querySelectorAll('[data-step],[data-vstep]').forEach((m) => m.classList.add('is-lit'));
        });

        return () => mm.revert();
      }),
    [],
  );

  return (
    <section ref={root} id="process" aria-label="How a build works" className="relative overflow-hidden bg-ink md:h-[100svh]">
      <style>{`
        .step-num { color: var(--ash); transition: color 400ms ease; }
        .is-lit .step-num { color: var(--ember); }
        .step-dot { background: var(--char); border-color: rgba(245,242,236,0.2); transition: background 300ms ease, border-color 300ms ease; }
        .is-lit .step-dot { background: var(--flare); border-color: var(--flare); box-shadow: 0 0 18px 4px rgba(255,181,71,0.45); }
        .step-copy { color: var(--ash); transition: color 500ms ease; }
        .is-lit .step-copy { color: rgba(245,242,236,0.85); }
      `}</style>

      {/* Desktop: horizontal track */}
      <div className="hidden h-full flex-col justify-center md:flex motion-reduce:md:h-auto motion-reduce:md:py-40">
        <div className="wrap mb-16">
          <p className="label mb-4 text-ash">How a build works</p>
          <h2 className="text-h1 text-bone">Days, not quarters.</h2>
        </div>
        <div
          ref={track}
          className="relative flex w-max items-start pl-[max(24px,calc((100vw-1200px)/2+24px))] pr-[30vw] motion-reduce:w-full motion-reduce:pr-6"
        >
          <div className="absolute left-0 right-0 top-[54px]">
            <div className="h-px w-full bg-bone/10" />
            <div ref={line} className="strike-line absolute inset-x-0 top-0" />
          </div>
          {steps.map((s) => (
            <div key={s.num} data-step className="relative w-[min(42vw,520px)] shrink-0 pr-16 motion-reduce:w-1/4">
              <span className="step-num block font-mono text-[15px] font-medium tracking-[0.08em]">{s.num}</span>
              <span className="relative mt-[26px] block h-3 w-3">
                <span className="step-dot absolute inset-0 rounded-full border" />
                <span
                  data-burst
                  aria-hidden
                  className="absolute inset-0 rounded-full opacity-0"
                  style={{ background: 'radial-gradient(circle, var(--flare), rgba(255,90,31,0.5) 50%, transparent 70%)' }}
                />
              </span>
              <h3 className="mt-10 text-[56px] font-semibold leading-none tracking-[-0.03em] text-bone lg:text-[72px]">{s.title}.</h3>
              <p className="step-copy mt-6 max-w-sm text-body-l">{s.copy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical line down the left edge */}
      <div className="wrap py-24 md:hidden">
        <p className="label mb-4 text-ash">How a build works</p>
        <h2 className="mb-12 text-[40px] font-semibold leading-[1.05] tracking-[-0.025em] text-bone">Days, not quarters.</h2>
        <div className="relative">
          <div className="absolute bottom-0 left-[5px] top-0 w-px bg-bone/10" aria-hidden />
          <div
            ref={vline}
            aria-hidden
            className="absolute bottom-0 left-[5px] top-0 w-px origin-top"
            style={{ background: 'linear-gradient(180deg, transparent 0%, var(--ember) 70%, var(--flare) 100%)' }}
          />
          <ol className="pl-10">
            {steps.map((s) => (
              <li key={s.num} data-vstep className="relative pb-14 last:pb-0">
                <span className="step-dot absolute -left-10 top-1.5 h-3 w-3 rounded-full border" />
                <span
                  data-burst
                  aria-hidden
                  className="absolute -left-10 top-1.5 h-3 w-3 rounded-full opacity-0"
                  style={{ background: 'radial-gradient(circle, var(--flare), rgba(255,90,31,0.5) 50%, transparent 70%)' }}
                />
                <span className="step-num font-mono text-[13px] font-medium tracking-[0.08em]">{s.num}</span>
                <h3 className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.03em] text-bone">{s.title}.</h3>
                <p className="step-copy mt-3">{s.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
