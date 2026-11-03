import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Headphones, Keyboard, Lock, Minus, RotateCcw } from 'lucide-react';
import { Wordmark } from '../components/Nav';
import { CoachNote, ScoreBars, TaggedTranscript, scoringMessage } from '../course/Feedback';
import { DEFAULT_PERSONA } from '../course/data';
import { scoreTranscript, useJordan, type Line, type ScoreResult } from '../course/useJordan';
import Desk, { MEDIA } from './Desk';
import VideoCall, { Lobby, useCamera } from './VideoCall';
import { FIRST_LINE, useMia } from './useMia';
import { BEFORE, CLUES, LATER, type Tier } from './world';
import { TIER_COPY, decideTier, readSignals } from './outcome';

type Stage = 'arrive' | 'desk' | 'lobby' | 'call' | 'passing' | 'later' | 'debrief';
type Run = { lines: Line[]; result: ScoreResult | null; error?: string; tier: Tier; clues: string[]; at: number };
type Saved = { notes: string; typed: boolean; run?: Run };

const KEY = 'ml-sim-v1';
const LIMIT = 600;

function load(): Saved {
  try {
    return { notes: '', typed: false, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { notes: '', typed: false };
  }
}

export default function SimApp() {
  const [saved, setSaved] = useState<Saved>(load);
  const [stage, setStage] = useState<Stage>('arrive');
  const [clues, setClues] = useState<string[]>([]);
  const [camOn, setCamOn] = useState(false);
  const cam = useCamera(camOn, false);
  const j = useJordan();
  const mia = useMia();
  const [engine, setEngine] = useState<'mia' | 'voice'>('mia');
  const joining = useRef(0);
  // Whichever is running the call: Mia (Anam) or the ElevenLabs fallback.
  const call = engine === 'mia' ? mia : j;
  const scored = useRef<Promise<Run> | null>(null);

  useEffect(() => {
    document.title = 'Monday, 9:12 AM · Matchlight demo';
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(saved));
    } catch {
      /* private mode: fine */
    }
  }, [saved]);

  const sawClue = useCallback((id: string) => setClues((c) => (c.includes(id) ? c : [...c, id])), []);

  const join = (typed: boolean) => {
    setSaved((s) => ({ ...s, typed }));
    setStage('call');
    joining.current += 1;
  };

  // Once the call screen (and its video element) is up, connect. Voice calls go to
  // Mia (Anam: her face, her voice, lip-synced). Chat calls, or a voice call Mia
  // cannot take, use the ElevenLabs agent with Mia's still frame.
  const joinTick = joining.current;
  useEffect(() => {
    if (stage !== 'call' || !joinTick) return;
    let gone = false;
    void (async () => {
      const typed = saved.typed;
      if (!typed) {
        setEngine('mia');
        if (await mia.start(LIMIT)) return;
        if (gone) return;
      }
      setEngine('voice');
      void j.start({ firstLine: FIRST_LINE, persona: DEFAULT_PERSONA, typed, limit: LIMIT });
    })();
    return () => {
      gone = true;
    };
  }, [stage, joinTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // When the call ends, time moves on. Scoring runs while two weeks pass.
  useEffect(() => {
    if (stage !== 'call' || (call.status !== 'ended' && call.status !== 'error')) return;
    if (!call.lines.some((l) => l.role === 'manager')) return;
    const lines = call.lines;
    const seen = clues;
    setCamOn(false);
    scored.current = scoreTranscript(lines).then((r) => {
      const result = 'error' in r ? null : r;
      return { lines, result, error: 'error' in r ? r.error : undefined, tier: decideTier(lines, result), clues: seen, at: Date.now() };
    });
    setStage('passing');
  }, [call.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stage !== 'passing') return;
    let done = false;
    const min = new Promise((r) => setTimeout(r, 4200));
    void Promise.all([scored.current, min]).then(([run]) => {
      if (done || !run) return;
      setSaved((s) => ({ ...s, run: run as Run }));
      setStage('later');
    });
    return () => {
      done = true;
    };
  }, [stage]);

  const restart = () => {
    setClues([]);
    setSaved((s) => ({ ...s, run: undefined }));
    setStage('desk');
  };

  if (stage === 'arrive') return <Arrive saved={saved} setTyped={(typed) => setSaved((s) => ({ ...s, typed }))} onStart={() => setStage('desk')} onLast={() => setStage('debrief')} />;

  if (stage === 'desk')
    return (
      <Desk
        world={BEFORE}
        notes={saved.notes}
        setNotes={(notes) => setSaved((s) => ({ ...s, notes }))}
        onOpen={sawClue}
        onJoin={() => (setCamOn(true), setStage('lobby'))}
        overlay={<Brief />}
      />
    );

  if (stage === 'lobby')
    return <Lobby typed={saved.typed} onJoin={join} onBack={() => (setCamOn(false), setStage('desk'))} stream={cam.stream} denied={cam.denied} camOn={camOn && !cam.denied} setCamOn={setCamOn} />;

  if (stage === 'call')
    return (
      <>
        <VideoCall
          status={call.status}
          lines={call.lines}
          speaking={call.speaking}
          elapsed={call.elapsed}
          limit={LIMIT}
          typed={saved.typed}
          error={call.error}
          notes={saved.notes}
          onSend={j.send}
          onLeave={() => void call.stop()}
          avatar={engine === 'mia' ? (mia.video ? 'live' : 'starting') : 'off'}
          onMute={call.mute}
          stream={cam.stream}
          camOn={camOn && !cam.denied}
          setCamOn={setCamOn}
        />
        {engine === 'voice' && mia.why && !saved.typed && (
          <p className="os fixed left-1/2 top-14 z-50 max-w-xl -translate-x-1/2 rounded-lg bg-black/75 px-3 py-1.5 text-center text-[12px] text-white/80">
            Live video unavailable ({mia.why.slice(0, 160)}). Using voice only.
          </p>
        )}
        {(call.status === 'ended' || call.status === 'error') && !call.lines.some((l) => l.role === 'manager') && (
          <div className="os fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-2xl bg-white px-5 py-4 text-[14px] text-[#202124] shadow-2xl">
            {saved.typed ? 'The call ended before you said anything.' : 'Jordan did not hear anything from you.'}{' '}
            <button type="button" className="ml-2 font-medium text-[#1a73e8]" onClick={() => join(saved.typed)}>
              Rejoin
            </button>
            <button type="button" className="ml-4 font-medium text-[#1a73e8]" onClick={() => join(true)}>
              Join with chat
            </button>
            <button type="button" className="ml-4 text-[#5f6368]" onClick={() => setStage('desk')}>
              Back to desk
            </button>
          </div>
        )}
      </>
    );

  if (stage === 'passing') return <Passing />;

  const run = saved.run;
  if (stage === 'later' && run)
    return (
      <Desk
        key="later"
        world={LATER(run.tier)}
        notes={saved.notes}
        setNotes={(notes) => setSaved((s) => ({ ...s, notes }))}
        overlay={<LaterCard onNext={() => setStage('debrief')} />}
      />
    );

  if (run) return <Debrief run={run} typed={saved.typed} onReplay={restart} />;
  return <Arrive saved={saved} setTyped={(typed) => setSaved((s) => ({ ...s, typed }))} onStart={() => setStage('desk')} onLast={() => setStage('debrief')} />;
}

/* ---------------------------------------------------------------- stages */

function Arrive({ saved, setTyped, onStart, onLast }: { saved: Saved; setTyped: (t: boolean) => void; onStart: () => void; onLast: () => void }) {
  const lines = ['Monday, 9:12 AM.', 'You lead a team of six at a client services firm.', 'Your 1:1 with Jordan Ellis is at 9:30.', 'Something is wrong. Nobody has said what.'];
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= lines.length) return;
    const id = window.setTimeout(() => setN(n + 1), n === 0 ? 500 : 1300);
    return () => window.clearTimeout(id);
  }, [n]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-ink px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `center/cover url(${MEDIA.wallpaper})`, filter: 'blur(28px) brightness(0.45)' }} />
      <a href="/" className="absolute left-6 top-6 text-[18px] text-bone" aria-label="Matchlight home">
        <Wordmark />
      </a>
      <div className="relative w-full max-w-3xl">
        <p className="label text-ember">Matchlight demo · a workplace simulation</p>
        <div className="mt-8 space-y-3" aria-live="polite">
          {lines.slice(0, n).map((l, i) => (
            <p key={l} className={`toast-in ${i === 0 ? 'text-[48px] font-semibold leading-[1] tracking-[-0.04em] text-bone md:text-[88px]' : 'text-[20px] text-bone/75 md:text-[26px]'}`}>
              {i === 3 ? <span className="accent text-bone">{l}</span> : l}
            </p>
          ))}
        </div>
        <div className={`mt-12 transition-opacity duration-700 ${n >= lines.length ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className="flex flex-wrap items-center gap-5">
            <button type="button" className="btn-primary text-[18px]" onClick={onStart}>
              Open your laptop
              <span className="chip">
                <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
              </span>
            </button>
            <button type="button" onClick={() => setTyped(!saved.typed)} aria-pressed={saved.typed} className="inline-flex items-center gap-2 text-[15px] text-bone/70 hover:text-bone">
              {saved.typed ? <Keyboard size={16} aria-hidden /> : <Headphones size={16} aria-hidden />}
              {saved.typed ? 'Typing instead of talking' : 'Talking out loud (headphones help)'}
              <span className="text-ash underline underline-offset-4">change</span>
            </button>
          </div>
          <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ash">
            <span>About 15 minutes</span>
            <span>Real conversation, real consequences</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock size={12} strokeWidth={1.5} aria-hidden /> Nothing recorded
            </span>
          </p>
          {saved.run && (
            <button type="button" onClick={onLast} className="mt-6 text-[14px] text-bone/60 underline underline-offset-4 hover:text-bone">
              See how your last Monday turned out
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/** A quiet first-time hint on the desk. Dismissable, never a checklist. */
function Brief() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="absolute left-4 top-28 z-20 w-[300px] max-w-[calc(100vw-32px)] rounded-2xl bg-[#0E0E0C]/85 p-5 text-bone shadow-2xl backdrop-blur-xl lg:top-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ember">Before 9:30</p>
      <p className="mt-2 text-[15px] leading-snug">This is your laptop. Look around if you want to, or join the call now. It's up to you, like it would be.</p>
      <p className="mt-2 text-[13px] text-bone/60">When you're ready, the 1:1 is in your calendar, with a Join button.</p>
      <button type="button" onClick={() => setOpen(false)} className="mt-4 text-[14px] text-bone underline underline-offset-4">
        Got it
      </button>
    </div>
  );
}

function Passing() {
  const [d, setD] = useState(3);
  useEffect(() => {
    if (d >= 17) return;
    const id = window.setTimeout(() => setD(d + 1), 170);
    return () => window.clearTimeout(id);
  }, [d]);
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-black px-6 text-center" role="status" aria-live="polite">
      <div>
        <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-ash">November</p>
        <p className="mt-2 text-[120px] font-semibold leading-none tracking-[-0.05em] text-bone tabular-nums md:text-[180px]">{d}</p>
        <p className="accent mt-6 text-[28px] text-bone/80 md:text-[36px]">Two weeks later.</p>
      </div>
    </main>
  );
}

function LaterCard({ onNext }: { onNext: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShow(true), 6500);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div className={`absolute left-4 top-12 z-20 w-[300px] max-w-[calc(100vw-32px)] rounded-2xl bg-[#0E0E0C]/85 p-5 text-bone shadow-2xl backdrop-blur-xl transition-all duration-700 ${show ? 'opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ember">Two weeks later</p>
      <p className="mt-2 text-[15px] leading-snug">Read what came in. Then see which moments in the conversation led here.</p>
      <button type="button" onClick={onNext} className="btn-primary mt-4 text-[15px]">
        Why did this happen?
        <span className="chip">
          <ArrowRight size={16} strokeWidth={1.5} aria-hidden />
        </span>
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------- debrief */

function Debrief({ run, typed, onReplay }: { run: Run; typed: boolean; onReplay: () => void }) {
  const copy = TIER_COPY[run.tier];
  const sig = readSignals(run.lines);
  const r = run.result;
  const opened = r ? r.jordan_opened_up : (sig.priya ? 1 : 0) + (sig.dad ? 1 : 0);
  const nextStep = r ? (r.scores.find((s) => s.id === 'next_step')?.score ?? 0) >= 2 : sig.plan;
  const room = [
    { ok: opened >= 1 || sig.priya, text: 'Jordan told you they have been covering Priya\'s accounts since September.' },
    { ok: opened >= 2 || sig.dad, text: 'Jordan told you about their dad, and the evenings spent driving to help.' },
    { ok: nextStep, text: 'You left with a specific next step: who does what, by when, and a check-in.' },
  ];
  const known = Object.keys(CLUES);
  const tone = run.tier === 'lit' ? 'text-ember' : run.tier === 'flicker' ? 'text-bone' : 'text-bone/80';

  const practice = () => {
    try {
      const course = JSON.parse(localStorage.getItem('ml-course-v1') || '{}');
      localStorage.setItem(
        'ml-course-v1',
        JSON.stringify({ quiz: {}, drills: {}, variants: {}, reps: [], ...course, typed, step: 'see', visited: ['intro', 'cold', 'mirror', 'see'], baseline: { lines: run.lines, result: run.result, error: run.error, at: run.at } }),
      );
    } catch {
      /* storage blocked: practice still opens */
    }
    window.location.href = '/demo?practice=1';
  };

  return (
    <div className="min-h-[100dvh] bg-ink">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-5 md:px-6">
        <a href="/" className="text-[18px] text-bone" aria-label="Matchlight home">
          <Wordmark />
        </a>
        <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-ash">Debrief</span>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 pb-32 pt-10 md:px-6 md:pt-16">
        <p className="label text-ash">Monday, November 17</p>
        <h1 className={`mt-4 max-w-4xl text-[44px] font-semibold leading-[1] tracking-[-0.04em] md:text-[84px] ${tone}`}>{copy.headline}</h1>
        <p className="mt-6 max-w-2xl text-body-l text-bone/75">{copy.line}</p>

        {/* the chain */}
        <section className="mt-16 grid gap-px overflow-hidden rounded-[24px] border border-line bg-line lg:grid-cols-3" aria-label="What led here">
          <div className="bg-ink p-6 md:p-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ember">Before · 9:12 AM</p>
            <p className="mt-3 text-[20px] font-medium text-bone">
              You found {run.clues.length} of {known.length} signals on your laptop.
            </p>
            <ul className="mt-5 space-y-3 text-[14px]">
              {known.map((k) => {
                const has = run.clues.includes(k);
                return (
                  <li key={k} className="flex gap-3">
                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${has ? 'bg-ember text-ink' : 'border border-bone/25 text-ash'}`}>
                      {has ? <Check size={12} strokeWidth={2.5} aria-hidden /> : <Minus size={12} aria-hidden />}
                    </span>
                    <span>
                      <span className={has ? 'text-bone' : 'text-bone/50'}>{CLUES[k].label}</span>
                      <span className="block text-ash">{CLUES[k].insight}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="bg-ink p-6 md:p-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ember">In the room · 9:30 AM</p>
            <p className="mt-3 text-[20px] font-medium text-bone">What came out, and what didn't.</p>
            <ul className="mt-5 space-y-4 text-[15px]">
              {room.map((x) => (
                <li key={x.text} className="flex gap-3">
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${x.ok ? 'bg-ember text-ink' : 'border border-bone/25 text-ash'}`}>
                    {x.ok ? <Check size={12} strokeWidth={2.5} aria-hidden /> : <Minus size={12} aria-hidden />}
                  </span>
                  <span className={x.ok ? 'text-bone' : 'text-bone/55'}>{x.text}</span>
                </li>
              ))}
            </ul>
            {r?.moments?.length ? (
              <div className="mt-6 space-y-3">
                <p className="label text-ash">Where it turned</p>
                {r.moments.slice(0, 3).map((m, i) => (
                  <div key={i} className="rounded-xl border border-line bg-char/60 p-4 text-[14px]">
                    <p className={m.kind === 'strong' ? 'text-ember' : 'text-bone/80'}>{m.kind === 'strong' ? 'This helped' : 'This cost you'}</p>
                    {run.lines[m.turn] && <p className="mt-1 text-bone">“{run.lines[m.turn].text}”</p>}
                    <p className="mt-1 text-bone/65">{m.note}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="bg-ink p-6 md:p-8">
            <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-ember">After · two weeks</p>
            <p className="mt-3 text-[20px] font-medium text-bone">{run.tier === 'lit' ? 'Trust, delivery, and a client who noticed.' : run.tier === 'flicker' ? 'Deadlines met. The cause still hidden.' : 'A resignation and an account at risk.'}</p>
            <ul className="mt-5 space-y-3 text-[15px] text-bone/75">
              {LATER(run.tier).toasts.map((t) => (
                <li key={t.text} className="rounded-xl border border-line bg-char/60 p-4">
                  <span className="block text-[13px] text-ash">{t.title}</span>
                  {t.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* the coach */}
        <section className="mt-20">
          <p className="label text-ash">The coach</p>
          <h2 className="mt-3 text-[32px] font-semibold tracking-[-0.03em] text-bone md:text-[44px]">Five moves decided this.</h2>
          <div className="mt-8 space-y-6">
            {r ? (
              <>
                <ScoreBars result={r} />
                <CoachNote result={r} />
              </>
            ) : (
              <p className="max-w-2xl text-bone/70">{run.error ? scoringMessage(run.error) : ''} The outcome above was read from your transcript directly.</p>
            )}
            <details className="rounded-2xl border border-line p-5">
              <summary className="cursor-pointer text-bone/85">Read the whole conversation</summary>
              <div className="mt-6">
                <TaggedTranscript lines={run.lines} result={r} />
              </div>
            </details>
          </div>
        </section>

        {/* next */}
        <section className="mt-20 grid gap-4 md:grid-cols-2">
          <button type="button" onClick={onReplay} className="group rounded-[24px] border border-line bg-char/60 p-7 text-left hover:border-bone/30">
            <RotateCcw size={22} strokeWidth={1.5} className="text-ember" aria-hidden />
            <p className="mt-4 text-[24px] font-semibold tracking-[-0.02em] text-bone">Live Monday again</p>
            <p className="mt-2 text-bone/65">Same morning, same Jordan. Jordan reacts to what you do, so a different approach gets a different two weeks.</p>
          </button>
          <button type="button" onClick={practice} className="group rounded-[24px] border border-ember/40 bg-ember/[0.06] p-7 text-left hover:border-ember">
            <ArrowRight size={22} strokeWidth={1.5} className="text-ember" aria-hidden />
            <p className="mt-4 text-[24px] font-semibold tracking-[-0.02em] text-bone">Practice the five moves</p>
            <p className="mt-2 text-bone/65">Contrasting examples, one-move drills, three harder Jordans, and a plan for your real conversation.</p>
          </button>
        </section>

        <details className="mt-10 rounded-card border border-line p-5 text-[14px]">
          <summary className="cursor-pointer text-bone/85">Why a simulation with consequences</summary>
          <ul className="mt-4 space-y-3">
            {[
              ['People learn more from realistic, goal-based scenarios where choices lead to visible results than from being told the rules.', 'Schank, Berman & Macpherson (1999), Learning by doing; Clark (2013), Scenario-based e-Learning.'],
              ['Seeing the consequences of your own actions, then reflecting on them, is what turns experience into learning.', 'Kolb (1984), Experiential Learning.'],
              ['Practice transfers when the setting looks and feels like the real one.', 'Thorndike & Woodworth (1901); Grossman & Salas (2011), training transfer review.'],
              ['Simulation works best with feedback, repetition, and a range of difficulty.', 'Issenberg et al. (2005), Medical Teacher; Cook et al. (2011), JAMA.'],
            ].map(([c, s]) => (
              <li key={s}>
                <p className="text-bone/85">{c}</p>
                <p className="mt-0.5 font-mono text-[12px] text-ash">{s}</p>
              </li>
            ))}
          </ul>
        </details>
      </main>
    </div>
  );
}
