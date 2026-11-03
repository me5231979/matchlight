import { useEffect, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

/** Prisma ease [0.16, 1, 0.3, 1] expressed for GSAP. */
export const EASE_PRISMA = 'expo.out';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function query(q: string) {
  return typeof window !== 'undefined' && window.matchMedia(q).matches;
}

function useMedia(q: string) {
  const [match, setMatch] = useState(() => query(q));
  useEffect(() => {
    const mql = window.matchMedia(q);
    const on = () => setMatch(mql.matches);
    mql.addEventListener('change', on);
    return () => mql.removeEventListener('change', on);
  }, [q]);
  return match;
}

export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)');
export const useIsMobile = () => useMedia('(max-width: 767px)');
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)');

export const prefersReducedMotion = () => query('(prefers-reduced-motion: reduce)');
export const isMobile = () => query('(max-width: 767px)');

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/** Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    lenis = new Lenis({ lerp: 0.16, smoothWheel: true, wheelMultiplier: 1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    // Keep GSAP's default lag smoothing: a long first frame must not fast-forward the preloader.
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, [enabled]);
}

export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

/**
 * Run section setup (ScrollTriggers, SplitText) one section per idle slot,
 * in mount order, so no single long task blocks the main thread at load.
 * Returns a cleanup that cancels a pending setup or reverts a finished one.
 */
type Job = { run: () => void; cancelled: boolean };
const queue: Job[] = [];
let draining = false;
const ric = (cb: () => void) => {
  const w = window as Window & typeof globalThis;
  if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(cb, { timeout: 400 });
  else w.setTimeout(cb, 16);
};
function drain() {
  const job = queue.shift();
  if (!job) {
    draining = false;
    ScrollTrigger.refresh();
    return;
  }
  if (!job.cancelled) job.run();
  ric(drain);
}
export function afterIdle(setup: () => void | (() => void)) {
  let cleanup: void | (() => void);
  const job: Job = { cancelled: false, run: () => (cleanup = setup()) };
  queue.push(job);
  if (!draining) {
    draining = true;
    ric(drain);
  }
  return () => {
    job.cancelled = true;
    if (typeof cleanup === 'function') cleanup();
  };
}
