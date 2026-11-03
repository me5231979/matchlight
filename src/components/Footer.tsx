import { useEffect, useRef } from 'react';
import { gsap, afterIdle } from '../lib/motion';
import { company } from '../lib/company';

const columns = [
  { title: 'Services', links: [['Capability consulting', '#offerings'], ['Custom builds', '#offerings'], ['Development partner', '#offerings']] },
  { title: 'We build', links: [['Simulations', '#offerings'], ['AI practice partners', '#offerings'], ['Platforms and sites', '#offerings']] },
  { title: 'Studio', links: [['How we work', '#process'], ['What we believe', '#beliefs'], ['Try the demo', '/demo'], ['Start a build', '#cta']] },
];

/**
 * Footer, after nietzsche-sustainibilty: columns over a plate with an
 * oversized wordmark bleeding off the bottom edge. Char on Ink.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      afterIdle(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          gsap.fromTo(
            line.current,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.4, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 90%' } },
          );
          gsap.fromTo(
            '[data-wordmark]',
            { yPercent: 30 },
            { yPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true } },
          );
        });
        return () => mm.revert();
      }),
    [],
  );

  return (
    <footer ref={root} className="relative overflow-hidden bg-ink">
      <div ref={line} className="strike-line w-full" aria-hidden />
      <div className="wrap grid gap-12 pb-10 pt-20 md:grid-cols-12 md:pt-28">
        <div className="md:col-span-4">
          <p className="max-w-xs text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-bone">
            Learning isn’t the product. <span className="accent">Capability</span> is.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:col-span-8 md:col-start-5 lg:grid-cols-5">
          {columns.map((c) => (
            <div key={c.title}>
              <p className="label mb-4 text-ash">{c.title}</p>
              <ul className="space-y-2.5 text-[15px] text-bone/80">
                {c.links.map(([l, href]) => (
                  <li key={l}>
                    <a href={href} className="link-strike hover:text-bone">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="label mb-4 text-ash">Contact</p>
            <ul className="space-y-2.5 text-[15px] text-bone/80">
              <li>
                <a href="mailto:hello@matchlight.ai" className="link-strike hover:text-bone">
                  hello@matchlight.ai
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="label mb-4 text-ash">Follow</p>
            <ul className="space-y-2.5 text-[15px] text-bone/80">
              <li>
                <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="link-strike hover:text-bone">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-4 pb-6 text-[13px] text-ash">
        <span>
          © {new Date().getFullYear()} {company.legalName}
        </span>
        <span className="flex gap-6">
          <a href="/privacy" className="link-strike hover:text-bone">
            Privacy
          </a>
          <a href="/legal" className="link-strike hover:text-bone">
            Legal notice
          </a>
        </span>
      </div>
      <div aria-hidden className="pointer-events-none relative -mb-[5vw] select-none overflow-hidden px-2">
        <svg data-wordmark viewBox="0 0 1000 200" className="block w-full" role="presentation">
          <text
            x="500"
            y="172"
            textAnchor="middle"
            textLength="980"
            lengthAdjust="spacingAndGlyphs"
            fill="#1C1B19"
            style={{ font: '600 236px Geist, sans-serif', letterSpacing: '-0.06em' }}
          >
            matchlight
          </text>
        </svg>
      </div>
    </footer>
  );
}
