import { useEffect, useRef, useState } from 'react';
import { Lightbulb, MessageSquareText, Mic, PhoneOff, Send, X } from 'lucide-react';
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
  name?: string;
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * The live call as a stage: Jordan is a glowing presence that breathes with
 * the voices, captions run like film subtitles, the time drains across the top.
 */
export default function CallPanel({ status, lines, speaking, elapsed, limit, typed, error, hints, volume, onSend, onEnd, name = 'Jordan Ellis' }: Props) {
  const core = useRef<HTMLDivElement>(null);
  const ring1 = useRef<HTMLDivElement>(null);
  const ring2 = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const [drawer, setDrawer] = useState<'none' | 'transcript' | 'hints'>(hints ? 'hints' : 'none');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let raf = 0;
    let smooth = 0;
    const loop = (t: number) => {
      const v = Math.min(1, volume() * 2.4);
      smooth += (v - smooth) * 0.25;
      const idle = 0.04 * Math.sin(t / 900);
      if (core.current) core.current.style.transform = `scale(${1 + smooth * 0.16 + idle})`;
      if (ring1.current) ring1.current.style.transform = `scale(${1.15 + smooth * 0.35})`;
      if (ring2.current) ring2.current.style.transform = `scale(${1.35 + smooth * 0.6})`;
      if (ring1.current) ring1.current.style.opacity = String(0.25 + smooth * 0.5);
      if (ring2.current) ring2.current.style.opacity = String(0.1 + smooth * 0.35);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [volume]);

  useEffect(() => {
    if (typed && status === 'live') input.current?.focus();
  }, [typed, status]);

  const live = status === 'live';
  const lastJordan = [...lines].reverse().find((l) => l.role === 'jordan');
  const lastYou = [...lines].reverse().find((l) => l.role === 'manager');
  const state =
    status === 'connecting'
      ? 'Connecting…'
      : status === 'error'
        ? 'Connection problem'
        : !live
          ? 'Conversation ended'
          : typed
            ? 'Your turn. Type your reply.'
            : speaking
              ? 'Jordan is speaking'
              : 'Listening. Speak naturally.';
  const pct = limit ? Math.max(0, 1 - elapsed / limit) : 1;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-[#0b0b0a]">
      {/* ambient */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 55% at 50% 38%, rgba(255,90,31,0.16), transparent 70%)' }} />
      <div aria-hidden className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.05]" />

      {/* time drains across the top */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-bone/10" aria-hidden>
        <div className="strike-line h-[2px] transition-[width] duration-300" style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="relative flex min-h-[620px] flex-col md:min-h-[680px]">
        {/* top row */}
        <div className="flex items-center justify-between px-6 pt-6 md:px-8">
          <span className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.1em] text-ash">
            <span className={`h-2 w-2 rounded-full ${live ? 'bg-ember' : 'bg-ash/50'}`} />
            {live ? 'Live' : status === 'connecting' ? 'Connecting' : 'Ended'}
          </span>
          <span className="font-mono text-[13px] text-bone/80" aria-label="Time">
            {fmt(elapsed)}
            {limit ? <span className="text-ash"> / {fmt(limit)}</span> : null}
          </span>
        </div>

        {/* Jordan */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4 pt-6">
          <div className="relative grid h-56 w-56 place-items-center md:h-64 md:w-64" aria-hidden>
            <div ref={ring2} className="absolute inset-0 rounded-full border border-ember/30" />
            <div ref={ring1} className="absolute inset-0 rounded-full border border-flare/40" />
            <div
              ref={core}
              className="absolute inset-6 rounded-full"
              style={{
                background: 'radial-gradient(circle at 38% 32%, #FFE1B0 0%, #FFB547 18%, #FF5A1F 48%, #8a2a08 78%, #2a0f05 100%)',
                boxShadow: speaking ? '0 0 120px 20px rgba(255,90,31,0.35)' : '0 0 70px 6px rgba(255,90,31,0.18)',
                filter: live ? 'none' : 'grayscale(0.7) brightness(0.6)',
                transition: 'box-shadow 300ms ease, filter 400ms ease',
              }}
            />
          </div>
          <p className="mt-8 text-[22px] font-semibold tracking-[-0.01em] text-bone">{name}</p>
          <p className="mt-1 flex items-center gap-2 text-ash" role="status" aria-live="polite">
            {!typed && live && !speaking && <Mic size={15} strokeWidth={1.5} className="text-ember" aria-hidden />}
            {state}
          </p>
          {error && <p className="mt-3 max-w-md text-center text-[14px] text-flare">{error}</p>}
        </div>

        {/* subtitles */}
        <div className="mx-auto w-full max-w-3xl px-6 pb-6 text-center" aria-live="polite">
          {lastJordan && <p className="text-[20px] leading-snug text-bone md:text-[26px]">“{lastJordan.text}”</p>}
          {lastYou && <p className="mt-3 text-[15px] text-ash">You: {lastYou.text}</p>}
          {!lines.length && live && <p className="text-ash">{typed ? 'Jordan is about to say something…' : 'Wait for Jordan, then respond out loud.'}</p>}
        </div>

        {/* composer (typed mode) */}
        {typed && (
          <form
            className="mx-auto mb-6 flex w-full max-w-3xl gap-2 px-6"
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
              ref={input}
              id="say"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!live}
              placeholder={live ? 'Say it the way you would say it…' : 'Conversation ended'}
              className="flex-1 rounded-full border border-bone/15 bg-ink/80 px-6 py-4 text-bone placeholder:text-ash focus:border-ember focus:outline-none"
              autoComplete="off"
            />
            <button type="submit" disabled={!live || !draft.trim()} className="grid h-14 w-14 place-items-center rounded-full bg-ember text-ink disabled:opacity-40" aria-label="Send">
              <Send size={20} strokeWidth={1.5} />
            </button>
          </form>
        )}

        {/* controls */}
        <div className="flex items-center justify-center gap-3 border-t border-line px-6 py-5">
          <button
            type="button"
            onClick={() => setDrawer((d) => (d === 'transcript' ? 'none' : 'transcript'))}
            aria-pressed={drawer === 'transcript'}
            className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2.5 text-[14px] text-bone/80 hover:border-bone/40 hover:text-bone"
          >
            <MessageSquareText size={16} strokeWidth={1.5} aria-hidden /> Transcript
          </button>
          {hints !== undefined && (
            <button
              type="button"
              onClick={() => setDrawer((d) => (d === 'hints' ? 'none' : 'hints'))}
              aria-pressed={drawer === 'hints'}
              className="inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2.5 text-[14px] text-bone/80 hover:border-bone/40 hover:text-bone"
            >
              <Lightbulb size={16} strokeWidth={1.5} aria-hidden /> Hints
            </button>
          )}
          <button
            type="button"
            onClick={onEnd}
            disabled={!live && status !== 'connecting'}
            className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-[14px] font-medium text-ink hover:bg-white disabled:opacity-40"
          >
            <PhoneOff size={16} strokeWidth={1.5} aria-hidden /> End conversation
          </button>
        </div>

        {/* drawer */}
        {drawer !== 'none' && (
          <aside className="absolute inset-y-0 right-0 z-10 flex w-full max-w-sm flex-col border-l border-line bg-ink/95 backdrop-blur-xl" aria-label={drawer === 'hints' ? 'Hints' : 'Transcript'}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="label text-ash">{drawer === 'hints' ? 'Coach hints' : 'Transcript'}</p>
              <button type="button" onClick={() => setDrawer('none')} aria-label="Close" className="text-ash hover:text-bone">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5 text-[14px]">
              {drawer === 'hints'
                ? BEHAVIORS.map((b, i) => (
                    <div key={b.id}>
                      <p className="text-bone">
                        <span className="mr-2 font-mono text-[11px] text-ash">0{i + 1}</span>
                        {b.name}
                      </p>
                      <p className="mt-1 text-bone/65">{b.look}</p>
                    </div>
                  ))
                : lines.map((l, i) => (
                    <div key={i}>
                      <p className="label text-[10px] text-ash">{l.role === 'manager' ? 'You' : 'Jordan'}</p>
                      <p className={l.role === 'manager' ? 'text-bone' : 'text-bone/70'}>{l.text}</p>
                    </div>
                  ))}
              {drawer === 'transcript' && !lines.length && <p className="text-ash">Nothing yet.</p>}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
