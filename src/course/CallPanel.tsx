import { useEffect, useRef, useState } from 'react';
import { Mic, PhoneOff, Send } from 'lucide-react';
import type { CallStatus, Line } from './useJordan';
import { BEHAVIORS } from './data';

type Props = {
  status: CallStatus;
  lines: Line[];
  speaking: boolean;
  elapsed: number;
  limit?: number;
  typed: boolean;
  error: string;
  hints?: boolean;
  volume: () => number;
  onSend: (t: string) => void;
  onEnd: () => void;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** The live call: an orb that breathes with the voices, live captions, and controls. */
export default function CallPanel({ status, lines, speaking, elapsed, limit, typed, error, hints, volume, onSend, onEnd }: Props) {
  const orb = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const v = Math.min(1, volume() * 2.2);
      if (orb.current) {
        orb.current.style.transform = `scale(${1 + v * 0.18})`;
        orb.current.style.opacity = String(0.55 + v * 0.45);
      }
      raf = requestAnimationFrame(loop);
    };
    if (status === 'live' && !typed) raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, typed, volume]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const live = status === 'live';
  const label =
    status === 'connecting'
      ? 'Connecting to Jordan…'
      : status === 'error'
        ? 'Connection problem'
        : !live
          ? 'Call ended'
          : typed
            ? 'Typing with Jordan'
            : speaking
              ? 'Jordan is talking'
              : 'Your turn. Speak naturally.';

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="card flex flex-col items-center justify-between gap-6 p-6 lg:col-span-5">
        <div className="flex w-full items-center justify-between text-ash">
          <span className="label">Jordan Ellis</span>
          <span className="font-mono text-[13px]" aria-label="Elapsed time">
            {fmt(elapsed)}
            {limit ? ` / ${fmt(limit)}` : ''}
          </span>
        </div>
        <div className="relative grid h-48 w-48 place-items-center" aria-hidden>
          <div
            ref={orb}
            className="absolute inset-0 rounded-full transition-[transform,opacity] duration-75"
            style={{
              background: 'radial-gradient(circle at 40% 35%, #FFB547 0%, #FF5A1F 38%, rgba(184,54,10,0.6) 62%, transparent 72%)',
              filter: speaking ? 'saturate(1.2)' : 'saturate(0.7)',
              opacity: live ? 0.6 : 0.25,
            }}
          />
          <span className="relative font-semibold text-ink">JE</span>
        </div>
        <p className="text-center text-bone/80" role="status" aria-live="polite">
          {!typed && live && !speaking && <Mic size={16} strokeWidth={1.5} className="mr-2 inline text-ember" aria-hidden />}
          {label}
        </p>
        {error && <p className="text-center text-[14px] text-flare">{error}</p>}
        <button
          type="button"
          onClick={onEnd}
          disabled={!live && status !== 'connecting'}
          className="inline-flex items-center gap-2 rounded-full border border-bone/30 px-5 py-2.5 text-[15px] hover:border-ember disabled:opacity-40"
        >
          <PhoneOff size={16} strokeWidth={1.5} aria-hidden /> End conversation
        </button>
      </div>

      <div className="flex min-h-[360px] flex-col lg:col-span-7">
        <div
          ref={log}
          className="card flex-1 space-y-3 overflow-y-auto p-5"
          style={{ maxHeight: 420 }}
          aria-label="Live captions"
          aria-live="polite"
        >
          {lines.length === 0 && <p className="text-ash">Captions appear here as you talk.</p>}
          {lines.map((l, i) => (
            <div key={i} className={l.role === 'manager' ? 'text-right' : ''}>
              <span className="label mb-1 block text-[11px] text-ash">{l.role === 'manager' ? 'You' : 'Jordan'}</span>
              <p
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-left text-[15px] leading-relaxed ${
                  l.role === 'manager' ? 'bg-bone/10 text-bone' : 'border border-line bg-ink/60 text-bone/85'
                }`}
              >
                {l.text}
              </p>
            </div>
          ))}
        </div>
        {typed && (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onSend(draft);
              setDraft('');
            }}
          >
            <label htmlFor="say" className="sr-only">
              Your reply to Jordan
            </label>
            <input
              id="say"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!live}
              placeholder={live ? 'Type what you would say…' : 'Conversation ended'}
              className="flex-1 rounded-full border border-line bg-char px-5 py-3 text-bone placeholder:text-ash focus:border-ember focus:outline-none"
              autoComplete="off"
            />
            <button type="submit" disabled={!live || !draft.trim()} className="grid h-12 w-12 place-items-center rounded-full bg-ember text-ink disabled:opacity-40" aria-label="Send">
              <Send size={18} strokeWidth={1.5} />
            </button>
          </form>
        )}
        {hints && (
          <details className="mt-3 rounded-card border border-line p-4 text-[14px] text-bone/80" open>
            <summary className="cursor-pointer text-bone">Coach hints (fade after this round)</summary>
            <ul className="mt-3 space-y-2">
              {BEHAVIORS.map((b) => (
                <li key={b.id}>
                  <span className="text-bone">{b.name}.</span> {b.look}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
