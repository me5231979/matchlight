import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Wordmark } from '../components/Nav';

/**
 * Regal Services: the fictional client company the simulation takes place in.
 * Its own look (navy and gold, a serif wordmark) sits inside a Matchlight frame,
 * so it reads as "a client's world, built by Matchlight".
 */
export const REGAL = {
  name: 'Regal Services',
  domain: 'regalservices.co',
  navy: '#14213D',
  navyDeep: '#0B1428',
  gold: '#C8A24A',
  cream: '#F7F3EA',
};

export function RegalMark({ size = 22, light = true }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={REGAL.name}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="7" fill={REGAL.gold} />
        <path d="M10 24V8h7.2c3.4 0 5.6 1.9 5.6 4.8 0 2.2-1.3 3.8-3.4 4.4L23.4 24h-3.6l-3.6-6.4H13.2V24H10zm3.2-9.1h3.7c1.8 0 2.8-.8 2.8-2.1s-1-2.1-2.8-2.1h-3.7v4.2z" fill={REGAL.navyDeep} />
      </svg>
      <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: light ? REGAL.cream : REGAL.navy, fontSize: size * 0.7, letterSpacing: '0.01em' }}>
        Regal <span style={{ color: REGAL.gold }}>Services</span>
      </span>
    </span>
  );
}

/** A slim Matchlight strip: who built this, in Matchlight's own look. */
export function BuiltBy({ right }: { right?: ReactNode }) {
  return (
    <div className="theme-matchlight relative z-50 flex h-9 shrink-0 items-center justify-between gap-4 bg-ink px-3 text-[12px] text-bone/70 md:px-5" style={{ background: 'var(--ink)' }}>
      <a href="/" className="flex items-center gap-2 hover:text-bone" aria-label="Built by Matchlight. Go to Matchlight home">
        <span className="font-mono uppercase tracking-[0.1em] text-ash">Built by</span>
        <span className="text-[14px] text-bone">
          <Wordmark />
        </span>
      </a>
      {right ?? (
        <a href="/" className="inline-flex items-center gap-1.5 hover:text-bone">
          <ArrowLeft size={13} strokeWidth={1.5} aria-hidden /> Exit demo
        </a>
      )}
    </div>
  );
}

const STAGES = ['Before the call', 'The 1:1', 'Two weeks later'] as const;

/** The Matchlight frame: our bar on top, the client's world inset below. */
export function SimFrame({ stage, children }: { stage: 0 | 1 | 2; children: ReactNode }) {
  return (
    <div className="theme-matchlight fixed inset-0 flex flex-col bg-ink">
      <header className="flex h-11 shrink-0 items-center justify-between gap-4 px-3 md:px-5">
        <a href="/" className="flex items-center gap-2 text-[14px] text-bone" aria-label="Built by Matchlight. Go to Matchlight home">
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ash">Built by</span>
          <Wordmark />
        </a>
        <ol className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] sm:flex" aria-label="Simulation progress">
          <li className="mr-2 text-ash">Simulation · {REGAL.name}</li>
          {STAGES.map((s, i) => (
            <li key={s} className={`flex items-center gap-2 ${i === stage ? 'text-bone' : 'text-ash/60'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${i === stage ? 'bg-ember' : i < stage ? 'bg-bone/50' : 'bg-bone/15'}`} />
              {s}
            </li>
          ))}
        </ol>
        <a href="/" className="inline-flex items-center gap-1.5 text-[13px] text-bone/70 hover:text-bone">
          <ArrowLeft size={14} strokeWidth={1.5} aria-hidden /> Exit
        </a>
      </header>
      <div className="theme-regal relative min-h-0 flex-1 overflow-hidden rounded-t-xl ring-1 ring-bone/10 md:mx-3 md:mb-3 md:rounded-xl">{children}</div>
    </div>
  );
}
