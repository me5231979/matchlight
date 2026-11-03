import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { gsap, getLenis, scrollToTarget, prefersReducedMotion } from '../lib/motion';
import { navLinks } from '../lib/content';

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold lowercase tracking-[-0.03em] ${className}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
        <defs>
          <linearGradient id="mk" x1="1" y1="13" x2="13" y2="1" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF5A1F" />
            <stop offset="0.75" stopColor="#FF5A1F" />
            <stop offset="1" stopColor="#FFB547" />
          </linearGradient>
        </defs>
        <path d="M2 12 L12 2" stroke="url(#mk)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      matchlight
    </span>
  );
}

/** Small abstract preview for each overlay link (Unseen Studio style). */
function Preview({ id }: { id: string }) {
  if (id === 'matchbook')
    return (
      <div className="flex h-full flex-col justify-between p-6">
        <span className="label text-ash">02 / Matchbook</span>
        <span className="font-mono text-[72px] leading-none text-bone">$99</span>
        <span className="text-sm text-bone/70">LMS file · Classroom version · Facilitator guide</span>
      </div>
    );
  if (id === 'how')
    return (
      <div className="flex h-full flex-col justify-center gap-6 p-6">
        <div className="strike-line w-full" />
        <div className="grid grid-cols-4 font-mono text-xs uppercase tracking-[0.08em] text-ash">
          <span className="text-ember">Strike</span>
          <span>First light</span>
          <span>Shape</span>
          <span>Ship</span>
        </div>
      </div>
    );
  return (
    <div className="flex h-full flex-col justify-between p-6">
      <span className="label text-ash">{id === 'studio' ? '01 / Studio' : '03 / Academy'}</span>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-md border border-line"
            style={{
              background:
                i === (id === 'studio' ? 1 : 4)
                  ? 'radial-gradient(circle at 30% 70%, rgba(255,90,31,0.55), rgba(28,27,25,1) 70%)'
                  : 'linear-gradient(160deg, #26241f, #1C1B19)',
            }}
          />
        ))}
      </div>
      <span className="text-sm text-bone/70">
        {id === 'studio' ? 'Simulations · Platforms · Sites · Media' : 'Cohorts for individuals'}
      </span>
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(navLinks[0].id);
  const overlay = useRef<HTMLDivElement>(null);
  const logoBtn = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number>();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 50);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // Open/close animation: ellipse wipe from the logo corner.
  useEffect(() => {
    const el = overlay.current!;
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      el.style.visibility = 'visible';
      if (prefersReducedMotion()) gsap.set(el, { clipPath: 'ellipse(150% 150% at 6% 4%)' });
      else
        gsap.fromTo(
          el,
          { clipPath: 'ellipse(0% 0% at 6% 4%)' },
          { clipPath: 'ellipse(150% 150% at 6% 4%)', duration: 0.8, ease: 'expo.out' },
        );
      gsap.fromTo(
        el.querySelectorAll('[data-ov-link]'),
        { yPercent: 110 },
        { yPercent: 0, duration: prefersReducedMotion() ? 0 : 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.1 },
      );
      el.querySelector<HTMLElement>('[data-ov-first]')?.focus({ preventScroll: true });
    } else {
      lenis?.start();
      gsap.to(el, {
        clipPath: 'ellipse(0% 0% at 6% 4%)',
        duration: prefersReducedMotion() ? 0 : 0.5,
        ease: 'power3.in',
        onComplete: () => {
          el.style.visibility = 'hidden';
        },
      });
    }
  }, [open]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) logoBtn.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        // Simple focus trap inside the overlay.
        const f = overlay.current!.querySelectorAll<HTMLElement>('a, button');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    close(false);
    window.setTimeout(() => scrollToTarget(href), 250);
  };

  const hoverOpen = () => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(true), 180);
  };
  const hoverCancel = () => window.clearTimeout(closeTimer.current);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,padding] duration-300 ${
          scrolled ? 'bg-ink/80 py-3 backdrop-blur-xl' : 'bg-transparent py-5 md:py-9'
        }`}
      >
        <nav aria-label="Primary" className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-12">
          <button
            ref={logoBtn}
            type="button"
            onMouseEnter={hoverOpen}
            onMouseLeave={hoverCancel}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label="Open menu"
            data-cursor="Menu"
            className="text-[20px] text-bone"
          >
            <Wordmark />
          </button>
          <ul className="hidden items-center gap-10 text-[15px] text-bone/80 lg:flex">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={l.href} onClick={go(l.href)} className="link-strike transition-colors hover:text-bone">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#cta"
            onClick={go('#cta')}
            className="rounded-full border border-bone/25 px-5 py-2.5 text-[14px] font-medium text-bone transition-colors hover:border-ember"
            data-cursor="Build"
          >
            Start a build
          </a>
        </nav>
      </header>

      <div
        ref={overlay}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="fixed inset-0 z-[70] bg-ink"
        style={{ visibility: 'hidden', clipPath: 'ellipse(0% 0% at 6% 4%)' }}
      >
        <div className="mx-auto flex h-full max-w-[1400px] flex-col px-6 py-6 md:px-12 md:py-9">
          <div className="flex items-center justify-between">
            <span className="text-[20px] text-bone">
              <Wordmark />
            </span>
            <button
              type="button"
              onClick={() => close()}
              className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 hover:border-ember"
              aria-label="Close menu"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
          <div className="grid flex-1 items-center gap-10 md:grid-cols-12">
            <ul className="md:col-span-7">
              {navLinks.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <a
                    data-ov-link
                    data-ov-first={i === 0 ? '' : undefined}
                    href={l.href}
                    onClick={go(l.href)}
                    onMouseEnter={() => setHovered(l.id)}
                    onFocus={() => setHovered(l.id)}
                    className="group flex items-baseline gap-5 py-1 text-[52px] font-semibold leading-[1.05] tracking-[-0.035em] text-bone/35 transition-colors duration-300 hover:text-bone focus-visible:text-bone md:text-[96px]"
                  >
                    <span className="label w-8 text-ash">0{i + 1}</span>
                    {l.label}
                    <ArrowUpRight
                      className="translate-y-1 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:text-ember"
                      size={36}
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
            <div className="hidden md:col-span-5 md:block">
              <div className="card aspect-[4/3] overflow-hidden">
                <Preview id={hovered} />
              </div>
              <p className="mt-4 text-ash">{navLinks.find((l) => l.id === hovered)?.preview}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-ash">
            <span>Learning isn’t the product. Capability is.</span>
            <a href="mailto:hello@matchlight.ai" className="link-strike text-bone">
              hello@matchlight.ai
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
