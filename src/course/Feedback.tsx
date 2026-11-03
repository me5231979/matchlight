import { useState } from 'react';
import { BEHAVIORS } from './data';
import type { Line, ScoreResult } from './useJordan';

const LEVEL = ['Not yet', 'Started', 'Solid', 'Strong'];

function Dial({ score, before }: { score: number; before?: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const arc = (n: number) => (n / 3) * c * 0.75;
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20" aria-hidden>
      <defs>
        <linearGradient id="dialg" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0" stopColor="#FF5A1F" />
          <stop offset="1" stopColor="#FFB547" />
        </linearGradient>
      </defs>
      <g transform="rotate(135 40 40)">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(245,242,236,0.1)" strokeWidth="5" strokeDasharray={`${c * 0.75} ${c}`} strokeLinecap="round" />
        {before !== undefined && before > 0 && (
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(245,242,236,0.25)" strokeWidth="5" strokeDasharray={`${arc(before)} ${c}`} strokeLinecap="round" />
        )}
        {score > 0 && <circle cx="40" cy="40" r={r} fill="none" stroke="url(#dialg)" strokeWidth="5" strokeDasharray={`${arc(score)} ${c}`} strokeLinecap="round" />}
      </g>
      <text x="40" y="46" textAnchor="middle" fill="#F5F2EC" fontFamily="Geist, sans-serif" fontSize="20" fontWeight="600">
        {score}
      </text>
    </svg>
  );
}

/** Five dials, one per behavior. Tap a dial for the quote behind it. */
export function ScoreBars({ result, focus, compare }: { result: ScoreResult; focus?: string; compare?: ScoreResult | null }) {
  const rows = focus ? BEHAVIORS.filter((b) => b.id === focus) : BEHAVIORS;
  const [open, setOpen] = useState<string | null>(focus ?? null);
  return (
    <div>
      <ul className={`grid gap-3 ${rows.length > 1 ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-1'}`}>
        {rows.map((b) => {
          const s = result.scores.find((x) => x.id === b.id);
          const before = compare?.scores.find((x) => x.id === b.id)?.score;
          const score = s?.score ?? 0;
          const on = open === b.id;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => setOpen(on ? null : b.id)}
                aria-expanded={on}
                className={`flex h-full w-full flex-col items-center rounded-2xl border p-4 text-center transition-colors ${
                  on ? 'border-ember/60 bg-ember/[0.06]' : 'border-line bg-char/60 hover:border-bone/25'
                }`}
              >
                <Dial score={score} before={before} />
                <span className="mt-2 text-[14px] font-medium leading-tight text-bone">{b.name}</span>
                <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ash">
                  {before !== undefined ? `${LEVEL[before]} → ` : ''}
                  {LEVEL[score]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {open &&
        (() => {
          const s = result.scores.find((x) => x.id === open);
          const b = BEHAVIORS.find((x) => x.id === open)!;
          if (!s) return null;
          const hasQuote = s.evidence && !/^no evidence|not part of/i.test(s.evidence);
          return (
            <div className="mt-4 rounded-2xl border border-line bg-ink/60 p-5">
              <p className="label text-ash">{b.name}</p>
              {hasQuote && <p className="mt-3 text-[18px] leading-snug text-bone">“{s.evidence}”</p>}
              <p className="mt-2 text-bone/75">{s.why}</p>
            </div>
          );
        })()}
    </div>
  );
}

export function CoachNote({ result }: { result: ScoreResult }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-char/60 p-6 md:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,90,31,0.18), transparent 70%)' }} />
      <p className="label text-ash">The coach</p>
      <p className="mt-4 text-body-l text-bone/90">{result.summary}</p>
      <p className="label mt-8 text-ash">Next time, try saying</p>
      <p className="mt-3 font-serif text-[26px] italic leading-[1.25] text-bone md:text-[30px]">“{result.try_this}”</p>
    </div>
  );
}

/** Transcript with the coach's turning points tagged alongside. */
export function TaggedTranscript({ lines, result }: { lines: Line[]; result: ScoreResult | null }) {
  const byTurn = new Map((result?.moments ?? []).map((m) => [m.turn, m]));
  return (
    <ol className="relative space-y-5 border-l border-line pl-6">
      {lines.map((l, i) => {
        const m = byTurn.get(i);
        const b = m && BEHAVIORS.find((x) => x.id === m.behavior);
        return (
          <li key={i} className="relative">
            <span
              aria-hidden
              className={`absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full ${m ? (m.kind === 'strong' ? 'bg-ember' : 'border border-bone/60 bg-ink') : 'bg-bone/15'}`}
            />
            <p className="label text-[10px] text-ash">{l.role === 'manager' ? 'You' : 'Jordan'}</p>
            <p className={`mt-1 text-[16px] leading-relaxed ${l.role === 'manager' ? 'text-bone' : 'text-bone/65'}`}>{l.text}</p>
            {m && b && (
              <p className={`mt-2 inline-block rounded-full px-3 py-1 text-[12px] ${m.kind === 'strong' ? 'bg-ember/15 text-bone' : 'bg-bone/10 text-bone/80'}`}>
                {m.kind === 'strong' ? 'Strong' : 'Missed'} · {b.short}: {m.note}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function scoringMessage(error: string) {
  if (error === 'not_configured') return 'The coach is not connected yet: the site needs its Claude API key. Your self-rating still counts.';
  if (error === 'rate_limited') return 'The coach is busy. Try again in a minute.';
  return 'The coach could not score this one. You can run it again, or move on.';
}
