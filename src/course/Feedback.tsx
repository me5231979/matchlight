import { BEHAVIORS } from './data';
import type { Line, ScoreResult } from './useJordan';

const LEVEL = ['Not yet', 'Started', 'Solid', 'Strong'];

export function ScoreBars({ result, focus, compare }: { result: ScoreResult; focus?: string; compare?: ScoreResult | null }) {
  const rows = focus ? BEHAVIORS.filter((b) => b.id === focus) : BEHAVIORS;
  return (
    <ul className="space-y-5">
      {rows.map((b) => {
        const s = result.scores.find((x) => x.id === b.id);
        const before = compare?.scores.find((x) => x.id === b.id)?.score;
        const score = s?.score ?? 0;
        return (
          <li key={b.id}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium text-bone">{b.name}</span>
              <span className="font-mono text-[13px] text-ash">
                {before !== undefined && <span className="mr-2">{LEVEL[before]} →</span>}
                <span className={score >= 2 ? 'text-bone' : ''}>{LEVEL[score]}</span>
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1" role="img" aria-label={`${b.name}: ${score} of 3`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className="h-1.5 rounded-full" style={{ background: n <= score ? 'var(--strike)' : 'rgba(245,242,236,0.1)' }} />
              ))}
            </div>
            {s && (
              <p className="mt-2 text-[14px] text-bone/75">
                {s.evidence && !/^no evidence|not part of/i.test(s.evidence) && <span className="text-bone">“{s.evidence}” </span>}
                {s.why}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CoachNote({ result }: { result: ScoreResult }) {
  return (
    <div className="card p-6">
      <p className="label text-ash">Coach</p>
      <p className="mt-3 text-body-l text-bone">{result.summary}</p>
      <p className="mt-5 label text-ash">Try this next time</p>
      <p className="mt-2 text-bone">
        <span className="accent text-[20px]">“</span>
        {result.try_this}
        <span className="accent text-[20px]">”</span>
      </p>
    </div>
  );
}

/** Transcript with the coach's turning points tagged in the margin. */
export function TaggedTranscript({ lines, result }: { lines: Line[]; result: ScoreResult | null }) {
  const byTurn = new Map((result?.moments ?? []).map((m) => [m.turn, m]));
  return (
    <ol className="space-y-3">
      {lines.map((l, i) => {
        const m = byTurn.get(i);
        const b = m && BEHAVIORS.find((x) => x.id === m.behavior);
        return (
          <li key={i} className="grid gap-2 md:grid-cols-12">
            <div className="md:col-span-8">
              <span className="label text-[11px] text-ash">{l.role === 'manager' ? 'You' : 'Jordan'}</span>
              <p className={`mt-1 text-[15px] ${l.role === 'manager' ? 'text-bone' : 'text-bone/70'}`}>{l.text}</p>
            </div>
            {m && b && (
              <p
                className={`self-start rounded-lg border px-3 py-2 text-[13px] md:col-span-4 ${
                  m.kind === 'strong' ? 'border-ember/50 text-bone' : 'border-bone/20 text-bone/80'
                }`}
              >
                <span className="label block text-[10px] text-ash">{m.kind === 'strong' ? 'Strong' : 'Missed'} · {b.short}</span>
                {m.note}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function scoringMessage(error: string) {
  if (error === 'not_configured')
    return 'The coach is not connected yet (the site owner needs to add a Claude API key). Your self-rating still counts.';
  if (error === 'rate_limited') return 'The coach is busy. Try again in a minute.';
  return 'The coach could not score this one. You can try again, or move on.';
}
