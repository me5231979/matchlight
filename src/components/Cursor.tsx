import { useEffect, useRef, useState } from 'react';
import { gsap, useFinePointer, useReducedMotion } from '../lib/motion';

/**
 * 10px Bone dot that grows into a 48px ring over interactive elements,
 * showing a label from data-cursor ("View", "Build"). Fine pointers only.
 */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-cursor');
    const el = dot.current!;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.18, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.18, ease: 'power3.out' });
    let hovering = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      xTo(e.clientX);
      yTo(e.clientY);
      el.style.opacity = '1';
      const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor]');
      const next = !!t;
      if (next !== hovering) {
        hovering = next;
        gsap.to(el, { width: next ? 48 : 10, height: next ? 48 : 10, duration: 0.3, ease: 'expo.out' });
        el.classList.toggle('is-ring', next);
      }
      setLabel(t?.dataset.cursor ?? '');
    };
    const onLeave = () => (el.style.opacity = '0');
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <style>{`
        .ml-cursor { background: var(--bone); }
        .ml-cursor.is-ring { background: transparent; border: 1px solid var(--bone); }
      `}</style>
      <div
        ref={dot}
        aria-hidden
        className="ml-cursor pointer-events-none fixed left-0 top-0 z-[200] grid h-[10px] w-[10px] place-items-center rounded-full opacity-0"
        style={{ translate: '-50% -50%' }}
      >
        <span className="whitespace-nowrap font-mono text-[9px] font-medium uppercase tracking-[0.08em] text-bone">{label}</span>
      </div>
    </>
  );
}
