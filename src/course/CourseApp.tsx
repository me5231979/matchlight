import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CalendarPlus, Keyboard, Lock, Mic, RotateCcw } from 'lucide-react';
import { Wordmark } from '../components/Nav';
import CallPanel from './CallPanel';
import { useMia } from '../sim/useMia';
import { CoachNote, ScoreBars, TaggedTranscript, scoringMessage } from './Feedback';
import { useJordan, scoreTranscript, type Line, type ScoreResult, type StartOptions } from './useJordan';
import {
  BEHAVIORS,
  DEFAULT_PERSONA,
  DRILLS,
  EXAMPLES,
  RESEARCH,
  SCENARIO,
  STEPS,
  VARIANTS,
  type BehaviorId,
  type StepId,
} from './data';

/* ------------------------------------------------------------------ */
/* State: private by default, kept only in this browser.               */
/* ------------------------------------------------------------------ */

type Run = { lines: Line[]; result: ScoreResult | null; error?: string; at: number };
type Plan = { name: string; situation: string; when: string; opener: string };
type Store = {
  step: StepId;
  visited: StepId[];
  typed: boolean;
  baseline?: Run;
  self?: Partial<Record<BehaviorId, number>>;
  quiz: Record<number, 'a' | 'b'>;
  drills: Partial<Record<BehaviorId, Run>>;
  variants: Record<string, Run>;
  plan?: Plan;
  planRun?: Run;
  reps: Run[];
};

const KEY = 'ml-course-v1';
const fresh = (): Store => ({ step: 'intro', visited: ['intro'], typed: false, quiz: {}, drills: {}, variants: {}, reps: [] });

function load(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    return s && s.step ? { ...fresh(), ...s } : fresh();
  } catch {
    return fresh();
  }
}

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                  */
/* ------------------------------------------------------------------ */

function Why({ step }: { step: string }) {
  const items = RESEARCH[step];
  if (!items) return null;
  return (
    <details className="mt-10 rounded-card border border-line p-5 text-[14px]">
      <summary className="flex cursor-pointer items-center gap-2 text-bone/85">
        <BookOpen size={16} strokeWidth={1.5} aria-hidden /> Why this step works
      </summary>
      <ul className="mt-4 space-y-3">
        {items.map((r) => (
          <li key={r.source}>
            <p className="text-bone/85">{r.claim}</p>
            <p className="mt-0.5 font-mono text-[12px] text-ash">{r.source}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}

function Header({ title, kicker, children }: { title: string; kicker: string; children?: React.ReactNode }) {
  return (
    <div className="mb-12 md:mb-16">
      <p className="label text-ember">{kicker}</p>
      <h1 className="mt-4 max-w-4xl text-[40px] font-semibold leading-[1.02] tracking-[-0.035em] text-bone md:text-[72px]">{title}</h1>
      {children && <div className="mt-6 max-w-2xl text-body-l text-bone/70">{children}</div>}
    </div>
  );
}

function Next({ onClick, label = 'Continue', disabled }: { onClick: () => void; label?: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="btn-primary disabled:opacity-40">
      {label}
      <span className="chip">
        <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
      </span>
    </button>
  );
}

function ScenarioCard() {
  return (
    <div className="card p-6">
      <p className="label text-ash">The situation</p>
      <p className="mt-3 text-[20px] font-medium text-bone">{SCENARIO.who}</p>
      <p className="text-ash">{SCENARIO.role}</p>
      <ul className="mt-4 space-y-2 text-bone/85">
        {SCENARIO.facts.map((f) => (
          <li key={f} className="flex gap-3">
            <span className="mt-2.5 h-1 w-3 shrink-0" style={{ background: 'var(--strike)' }} />
            {f}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-bone/85">{SCENARIO.goal}</p>
    </div>
  );
}

function ics(plan: Plan | undefined) {
  const base = window.location.origin;
  const now = new Date();
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ev = (days: number, title: string, desc: string, i: number) => {
    const s = new Date(now);
    s.setDate(s.getDate() + days);
    s.setHours(9, 30, 0, 0);
    const e = new Date(s.getTime() + 10 * 60000);
    return [
      'BEGIN:VEVENT',
      `UID:ml-${now.getTime()}-${i}@matchlight`,
      `DTSTAMP:${stamp(now)}`,
      `DTSTART:${stamp(s)}`,
      `DTEND:${stamp(e)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc.replace(/\n/g, '\\n')}`,
      `URL:${base}/demo?rep=1`,
      'END:VEVENT',
    ].join('\r\n');
  };
  const events = [
    ev(2, 'The Hard Conversation: 5-minute rep', `A short practice round with a new Jordan.\n${base}/demo?rep=1`, 1),
    ev(7, 'The Hard Conversation: 5-minute rep', `Second spaced rep.\n${base}/demo?rep=1`, 2),
    ev(21, 'The Hard Conversation: 5-minute rep', `Final spaced rep.\n${base}/demo?rep=1`, 3),
  ];
  if (plan?.when) events.push(ev(1, `Conversation with ${plan.name || 'your report'}`, `Planned: ${plan.when}\nOpening line: ${plan.opener}`, 4));
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Matchlight//The Hard Conversation//EN', ...events, 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }));
  a.download = 'hard-conversation-practice.ics';
  a.click();
}

/* ------------------------------------------------------------------ */
/* A practice round: call, then the coach's score.                      */
/* ------------------------------------------------------------------ */

function useRound(typed: boolean) {
  const eleven = useJordan();
  const mia = useMia();
  const [engine, setEngine] = useState<'mia' | 'voice'>('voice');
  const [scoring, setScoring] = useState(false);
  // Voice rounds use Mia (live face and voice). Chat rounds, or Mia unavailable, use ElevenLabs.
  const j = engine === 'mia' ? { ...mia, volume: eleven.volume, send: eleven.send } : eleven;

  const begin = useCallback(
    (o: Omit<StartOptions, 'typed'>) => {
      void (async () => {
        if (!typed) {
          setEngine('mia');
          if (await mia.start(o.limit ?? 180, { firstLine: o.firstLine, persona: o.persona, mode: o.mode, context: o.context, endAfterReply: o.endAfterReply })) return;
        }
        setEngine('voice');
        void eleven.start({ ...o, typed });
      })();
    },
    [eleven, mia, typed],
  );

  const score = useCallback(async (lines: Line[], focus?: string): Promise<Run> => {
    setScoring(true);
    const r = await scoreTranscript(lines, focus);
    setScoring(false);
    return 'error' in r ? { lines, result: null, error: r.error, at: Date.now() } : { lines, result: r, at: Date.now() };
  }, []);

  return { j, begin, score, scoring, engine, mia };
}

function Round({
  typed,
  start,
  limit,
  hints,
  focus,
  run,
  onDone,
  startLabel = 'Walk into the room',
  brief,
}: {
  typed: boolean;
  start: Omit<StartOptions, 'typed'>;
  limit: number;
  hints?: boolean;
  focus?: string;
  run?: Run;
  onDone: (r: Run) => void;
  startLabel?: string;
  brief?: React.ReactNode;
}) {
  const { j, begin, score, scoring, engine, mia } = useRound(typed);
  const [phase, setPhase] = useState<'ready' | 'call' | 'done'>(run ? 'done' : 'ready');
  const managerSpoke = j.lines.some((l) => l.role === 'manager');

  useEffect(() => {
    if (phase === 'call' && (j.status === 'ended' || j.status === 'error') && j.lines.length) {
      if (!managerSpoke) return;
      setPhase('done');
      void score(j.lines, focus).then(onDone);
    }
  }, [j.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'ready')
    return (
      <div className="space-y-6">
        {brief}
        <div className="relative overflow-hidden rounded-[28px] border border-line bg-[#0b0b0a] px-6 py-12 text-center md:py-16">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(50% 60% at 50% 30%, rgba(255,90,31,0.14), transparent 70%)' }} />
          <div
            aria-hidden
            className="relative mx-auto h-24 w-24 animate-pulse rounded-full"
            style={{ background: 'radial-gradient(circle at 38% 32%, #FFE1B0 0%, #FFB547 18%, #FF5A1F 48%, #8a2a08 78%, #2a0f05 100%)', boxShadow: '0 0 80px 10px rgba(255,90,31,0.25)' }}
          />
          <p className="relative mt-6 text-ash">{typed ? 'Jordan will open. Type your replies.' : 'Jordan will open. Answer out loud. Headphones help.'}</p>
          <button type="button" className="btn-primary relative mt-6 text-[17px]" onClick={() => (setPhase('call'), begin({ ...start, limit }))}>
            {typed ? 'Start typing with Jordan' : startLabel}
            <span className="chip">{typed ? <Keyboard size={18} strokeWidth={1.5} /> : <Mic size={18} strokeWidth={1.5} />}</span>
          </button>
        </div>
      </div>
    );

  if (phase === 'call')
    return (
      <div className="scroll-mt-24 space-y-4" ref={(el) => el && j.status === 'connecting' && el.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
        <CallPanel
          status={j.status}
          lines={j.lines}
          speaking={j.speaking}
          elapsed={j.elapsed}
          limit={limit}
          typed={typed}
          error={j.error}
          hints={hints}
          volume={j.volume}
          onSend={j.send}
          onEnd={() => void j.stop()}
          video={engine === 'mia' ? (mia.video ? 'live' : 'starting') : undefined}
        />
        {(j.status === 'ended' || j.status === 'error') && !managerSpoke && (
          <div className="flex items-center gap-4">
            <p className="text-ash">Jordan didn't hear anything from you that time.</p>
            <button type="button" className="btn-secondary" onClick={() => begin({ ...start, limit })}>
              Try again
            </button>
          </div>
        )}
      </div>
    );

  return (
    <div className="space-y-6">
      {scoring && (
        <p className="label animate-pulse text-ash" role="status">
          The coach is reading your conversation…
        </p>
      )}
      {run?.result && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <ScoreBars result={run.result} focus={focus} />
          </div>
          <div className="lg:col-span-12">
            <CoachNote result={run.result} />
          </div>
        </div>
      )}
      {run && !run.result && run.error && !scoring && <p className="text-flare">{scoringMessage(run.error)}</p>}
      {!scoring && (
        <button type="button" className="btn-secondary gap-2" onClick={() => (setPhase('call'), begin({ ...start, limit }))}>
          <RotateCcw size={16} strokeWidth={1.5} className="mr-2" aria-hidden /> Run it again
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The course                                                           */
/* ------------------------------------------------------------------ */

export default function CourseApp() {
  const [s, setS] = useState<Store>(load);
  const rep = useMemo(() => new URLSearchParams(window.location.search).get('rep') === '1', []);

  useEffect(() => {
    document.title = 'The Hard Conversation · Matchlight demo';
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage blocked: progress just won't persist */
    }
  }, [s]);

  const set = (patch: Partial<Store>) => setS((p) => ({ ...p, ...patch }));
  const go = (step: StepId) => {
    setS((p) => ({ ...p, step, visited: p.visited.includes(step) ? p.visited : [...p.visited, step] }));
    window.scrollTo({ top: 0 });
  };
  const idx = STEPS.findIndex((x) => x.id === s.step);

  return (
    <>
      <a href="#course" className="sr-only-focusable fixed left-4 top-4 z-[300] rounded-full bg-bone px-4 py-2 text-ink">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <a href="/" className="text-[18px] text-bone" aria-label="Matchlight home">
            <Wordmark />
          </a>
          {!rep && (
            <nav aria-label="Course steps" className="flex items-center gap-4">
              <span className="hidden font-mono text-[12px] uppercase tracking-[0.1em] text-ash sm:inline">
                {String(idx).padStart(2, '0')} / {String(STEPS.length - 1).padStart(2, '0')} · <span className="text-bone">{STEPS[idx].label}</span>
              </span>
              <ol className="flex items-center gap-1.5">
                {STEPS.map((st, i) => {
                  const can = s.visited.includes(st.id);
                  const on = st.id === s.step;
                  return (
                    <li key={st.id}>
                      <button
                        type="button"
                        disabled={!can}
                        onClick={() => go(st.id)}
                        aria-current={on ? 'step' : undefined}
                        aria-label={`${i}. ${st.label}`}
                        title={st.label}
                        className={`block h-2 rounded-full transition-all ${on ? 'w-6 bg-ember' : can ? 'w-2 bg-bone/50 hover:bg-bone' : 'w-2 bg-bone/15'}`}
                      />
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
          <a href="/" className="inline-flex items-center gap-2 text-[14px] text-bone/70 hover:text-bone">
            <ArrowLeft size={15} strokeWidth={1.5} aria-hidden /> Exit
          </a>
        </div>
        <div className="h-px w-full bg-bone/10">
          <div className="strike-line h-px transition-[width] duration-700" style={{ width: `${rep ? 100 : (idx / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </header>

      <main id="course" className="relative mx-auto max-w-[1200px] px-4 pb-32 pt-12 md:px-6 md:pt-20">
        {rep ? <RepStep s={s} set={set} /> : <StepView s={s} set={set} go={go} />}
      </main>
    </>
  );
}

type StepProps = { s: Store; set: (p: Partial<Store>) => void; go: (st: StepId) => void };

function StepView(p: StepProps) {
  switch (p.s.step) {
    case 'intro':
      return <Intro {...p} />;
    case 'cold':
      return <Cold {...p} />;
    case 'mirror':
      return <Mirror {...p} />;
    case 'see':
      return <See {...p} />;
    case 'drills':
      return <Drills {...p} />;
    case 'harder':
      return <Harder {...p} />;
    case 'plan':
      return <PlanStep {...p} />;
    default:
      return <Results {...p} />;
  }
}

/* 00 Intro */
function Intro({ set, go }: StepProps) {
  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[640px] w-[900px] -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,90,31,0.18), transparent)' }} />
      <div className="relative grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label text-ember">Matchlight demo · voice simulation</p>
          <h1 className="mt-5 text-[52px] font-semibold leading-[0.98] tracking-[-0.045em] text-bone md:text-[96px]">
            The <span className="accent">hard</span>
            <br />
            conversation.
          </h1>
          <p className="mt-8 max-w-xl text-body-l text-bone/75">
            Jordan, one of your best people, has slipped. You have to talk about it. Practice it out loud with an AI who reacts to how
            you handle it, then see exactly what landed.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button type="button" className="btn-primary text-[18px]" onClick={() => (set({ typed: false }), go('cold'))}>
              Walk into the room
              <span className="chip">
                <Mic size={18} strokeWidth={1.5} aria-hidden />
              </span>
            </button>
            <button type="button" className="inline-flex items-center gap-2 text-bone/70 underline-offset-4 hover:text-bone hover:underline" onClick={() => (set({ typed: true }), go('cold'))}>
              <Keyboard size={16} strokeWidth={1.5} aria-hidden /> I'd rather type
            </button>
          </div>
          <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] uppercase tracking-[0.08em] text-ash">
            <span>About 30 min</span>
            <span>7 steps</span>
            <span className="inline-flex items-center gap-1.5">
              <Lock size={12} strokeWidth={1.5} aria-hidden /> Private by default
            </span>
          </p>
        </div>

        {/* Jordan's file */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[28px] border border-line bg-[#0b0b0a] p-7">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(70% 50% at 50% 0%, rgba(255,90,31,0.14), transparent 70%)' }} />
            <div className="relative flex items-center gap-5">
              <div
                aria-hidden
                className="h-20 w-20 shrink-0 rounded-full"
                style={{ background: 'radial-gradient(circle at 38% 32%, #FFE1B0 0%, #FFB547 18%, #FF5A1F 48%, #8a2a08 78%, #2a0f05 100%)', boxShadow: '0 0 50px 4px rgba(255,90,31,0.25)' }}
              />
              <div>
                <p className="text-[22px] font-semibold tracking-[-0.01em] text-bone">{SCENARIO.who}</p>
                <p className="text-[14px] text-ash">Senior project coordinator · 4 years</p>
              </div>
            </div>
            <ul className="relative mt-7 space-y-3">
              {SCENARIO.facts.map((f, i) => (
                <li key={f} className="flex gap-4 rounded-xl border border-line bg-ink/60 px-4 py-3 text-[15px] text-bone/85">
                  <span className="font-mono text-[11px] text-ash">0{i + 1}</span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="relative mt-6 text-[14px] text-ash">Your goal: find out what is going on, and leave with a next step you both believe in.</p>
          </div>
        </div>
      </div>

      <ol className="relative mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4 lg:grid-cols-7">
        {[
          ['Cold open', '3 min, no help'],
          ['Mirror', 'What landed'],
          ['See it done', 'Spot the difference'],
          ['Drills', 'One move each'],
          ['Harder', 'Three Jordans'],
          ['Plan it', 'Your real one'],
          ['Results', 'Before and after'],
        ].map(([t, d], i) => (
          <li key={t} className="bg-ink p-4">
            <span className="font-mono text-[11px] text-ember">0{i + 1}</span>
            <p className="mt-2 text-[15px] font-medium text-bone">{t}</p>
            <p className="text-[13px] text-ash">{d}</p>
          </li>
        ))}
      </ol>
      <p className="relative mt-6 text-[13px] text-ash">
        Progress stays in this browser. To score a round, its transcript goes to the coach (Claude) and is not stored. Voice runs through
        ElevenLabs.
      </p>
    </section>
  );
}

/* 01 Cold open */
function Cold({ s, set, go }: StepProps) {
  return (
    <section>
      <Header kicker="01 · Cold open" title="Talk to Jordan.">
        <p>No instructions on purpose. Handle it the way you would today. You have three minutes. End whenever you're ready.</p>
      </Header>
      <div className="mb-8 max-w-2xl">
        <ScenarioCard />
      </div>
      <Round
        typed={s.typed}
        limit={180}
        start={{ firstLine: 'Hey. You wanted to see me?', persona: DEFAULT_PERSONA }}
        run={s.baseline}
        onDone={(r) => set({ baseline: r })}
      />
      {s.baseline && (
        <div className="mt-10">
          <Next onClick={() => go('mirror')} label="See how it went" />
        </div>
      )}
      <Why step="cold" />
    </section>
  );
}

/* 02 Mirror */
function Mirror({ s, set, go }: StepProps) {
  const [revealed, setRevealed] = useState(!!s.self && Object.keys(s.self).length === 5);
  const run = s.baseline;
  if (!run)
    return (
      <section>
        <Header kicker="02 · Mirror" title="Start with the cold open first." />
        <Next onClick={() => go('cold')} label="Go to the cold open" />
      </section>
    );
  const self = s.self ?? {};
  const done = BEHAVIORS.every((b) => self[b.id] !== undefined);
  const gaps = run.result
    ? BEHAVIORS.map((b) => ({ b, d: (self[b.id] ?? 0) - (run.result!.scores.find((x) => x.id === b.id)?.score ?? 0) })).filter((g) => Math.abs(g.d) >= 2)
    : [];

  return (
    <section>
      <Header kicker="02 · Mirror" title="How do you think it went?">
        <p>Rate yourself first. Then see what the coach saw, line by line. Rating first trains your own judgment.</p>
      </Header>

      <div className="card p-6">
        <ul className="space-y-6">
          {BEHAVIORS.map((b) => (
            <li key={b.id} className="grid gap-3 md:grid-cols-12 md:items-center">
              <div className="md:col-span-6">
                <p className="font-medium text-bone">{b.name}</p>
                <p className="text-[14px] text-ash">{b.look}</p>
              </div>
              <div className="flex gap-2 md:col-span-6 md:justify-end" role="radiogroup" aria-label={b.name}>
                {['Not yet', 'Started', 'Solid', 'Strong'].map((t, n) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={self[b.id] === n}
                    disabled={revealed}
                    onClick={() => set({ self: { ...self, [b.id]: n } })}
                    className={`rounded-full border px-3 py-1.5 text-[13px] ${
                      self[b.id] === n ? 'border-ember text-bone' : 'border-line text-bone/60 hover:text-bone'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        {!revealed && (
          <div className="mt-8">
            <Next onClick={() => setRevealed(true)} label="Show me what the coach saw" disabled={!done} />
          </div>
        )}
      </div>

      {revealed && (
        <div className="mt-10 space-y-8">
          {run.result ? (
            <>
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-12">
                  <ScoreBars result={run.result} />
                </div>
                <div className="grid gap-6 lg:col-span-12 lg:grid-cols-2">
                  <CoachNote result={run.result} />
                  {gaps.length > 0 && (
                    <div className="card p-6">
                      <p className="label text-ash">Calibration</p>
                      <ul className="mt-3 space-y-2 text-[14px] text-bone/85">
                        {gaps.map(({ b, d }) => (
                          <li key={b.id}>
                            {b.name}: you rated yourself {d > 0 ? 'higher' : 'lower'} than the coach did. Look at the transcript below.
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="card p-6">
                <p className="label mb-5 text-ash">Your conversation, with the turning points</p>
                <TaggedTranscript lines={run.lines} result={run.result} />
              </div>
            </>
          ) : (
            <>
              <p className="text-flare">{scoringMessage(run.error || '')}</p>
              <div className="card p-6">
                <TaggedTranscript lines={run.lines} result={null} />
              </div>
            </>
          )}
          <Next onClick={() => go('see')} />
        </div>
      )}
      <Why step="mirror" />
    </section>
  );
}

/* 03 See it done */
function See({ s, set, go }: StepProps) {
  const answered = EXAMPLES.every((_, i) => s.quiz[i]);
  return (
    <section>
      <Header kicker="03 · See it done" title="Spot the difference.">
        <p>Three moments, two versions each. Pick the one you think works better, then see why.</p>
      </Header>
      <div className="space-y-8">
        {EXAMPLES.map((ex, i) => {
          // Alternate which side holds the stronger version.
          const flip = i % 2 === 1;
          const opts = flip ? (['b', 'a'] as const) : (['a', 'b'] as const);
          const pick = s.quiz[i];
          return (
            <div key={ex.moment} className="card p-6">
              <p className="label text-ash">
                0{i + 1} · {ex.moment}
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {opts.map((k, n) => {
                  const isBetter = k === ex.better;
                  const chosen = pick === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      disabled={!!pick}
                      onClick={() => set({ quiz: { ...s.quiz, [i]: k } })}
                      className={`rounded-xl border p-5 text-left text-[15px] leading-relaxed transition-colors ${
                        pick ? (isBetter ? 'border-ember/70 text-bone' : 'border-line text-bone/55') : 'border-line text-bone/85 hover:border-bone/40'
                      }`}
                    >
                      <span className="label mb-2 block text-[11px] text-ash">
                        Version {n + 1}
                        {pick && (isBetter ? ' · stronger' : '')}
                        {chosen && ' · your pick'}
                      </span>
                      “{ex[k]}”
                    </button>
                  );
                })}
              </div>
              {pick && (
                <p className="mt-4 text-bone/85">
                  <span className="text-bone">{pick === ex.better ? 'Yes. ' : 'Look again. '}</span>
                  {ex.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-10">
        <Next onClick={() => go('drills')} disabled={!answered} label="On to the drills" />
      </div>
      <Why step="see" />
    </section>
  );
}

/* 04 Drills */
function Drills({ s, set, go }: StepProps) {
  const firstOpen = DRILLS.findIndex((d) => !s.drills[d.id]);
  const [active, setActive] = useState(firstOpen === -1 ? 0 : firstOpen);
  const d = DRILLS[active];
  const b = BEHAVIORS.find((x) => x.id === d.id)!;
  return (
    <section>
      <Header kicker="04 · Drills" title="One move at a time.">
        <p>Jordan says one line. You respond once. The coach scores just that move. Repeat until it feels natural.</p>
      </Header>
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Drills">
        {DRILLS.map((x, i) => {
          const r = s.drills[x.id];
          const sc = r?.result?.scores.find((y) => y.id === x.id)?.score;
          return (
            <button
              key={x.id}
              role="tab"
              aria-selected={i === active}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full border px-4 py-2 text-[14px] ${i === active ? 'border-ember text-bone' : 'border-line text-bone/70 hover:text-bone'}`}
            >
              {BEHAVIORS.find((y) => y.id === x.id)!.short}
              {sc !== undefined && <span className="ml-2 font-mono text-[12px] text-ash">{sc}/3</span>}
            </button>
          );
        })}
      </div>

      <Round
        key={d.id}
        typed={s.typed}
        limit={75}
        focus={d.id}
        start={{ firstLine: d.line, persona: DEFAULT_PERSONA, mode: 'drill', endAfterReply: true }}
        run={s.drills[d.id]}
        onDone={(r) => set({ drills: { ...s.drills, [d.id]: r } })}
        startLabel="Start the drill"
        brief={
          <div className="card max-w-3xl p-6">
            <p className="label text-ash">{b.name}</p>
            <p className="mt-3 text-ash">{d.setup}</p>
            <p className="mt-3 text-[20px] text-bone">Jordan: “{d.line}”</p>
            <p className="mt-4 text-bone/85">
              <span className="text-bone">Your move:</span> {d.task}
            </p>
          </div>
        }
      />
      <div className="mt-10 flex flex-wrap gap-4">
        {active < DRILLS.length - 1 ? (
          <Next onClick={() => setActive(active + 1)} label="Next drill" />
        ) : (
          <Next onClick={() => go('harder')} label="Make it harder" />
        )}
        {active < DRILLS.length - 1 && (
          <button type="button" className="btn-secondary" onClick={() => go('harder')}>
            Skip to harder conversations
          </button>
        )}
      </div>
      <Why step="drills" />
    </section>
  );
}

/* 05 Harder */
function Harder({ s, set, go }: StepProps) {
  const firstOpen = VARIANTS.findIndex((v) => !s.variants[v.id]);
  const [active, setActive] = useState(firstOpen === -1 ? 0 : firstOpen);
  const v = VARIANTS[active];
  return (
    <section>
      <Header kicker="05 · Harder" title="Now the whole conversation, three ways.">
        <p>The same situation, a different Jordan each time. Coach hints are on for the first one, then they fade.</p>
      </Header>
      <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Variants">
        {VARIANTS.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={i === active}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full border px-4 py-2 text-[14px] ${i === active ? 'border-ember text-bone' : 'border-line text-bone/70 hover:text-bone'}`}
          >
            {x.name}
            {s.variants[x.id] && <span className="ml-2 text-ash">✓</span>}
          </button>
        ))}
      </div>
      <Round
        key={v.id}
        typed={s.typed}
        limit={240}
        hints={v.hints}
        start={{ firstLine: v.first, persona: v.persona }}
        run={s.variants[v.id]}
        onDone={(r) => set({ variants: { ...s.variants, [v.id]: r } })}
        brief={<p className="max-w-2xl text-bone/80">{v.hints ? 'Hints are visible during this round.' : 'No hints this time.'} Up to four minutes.</p>}
      />
      <div className="mt-10">
        {active < VARIANTS.length - 1 ? <Next onClick={() => setActive(active + 1)} label="Next Jordan" /> : <Next onClick={() => go('plan')} label="Plan a real one" />}
      </div>
      <Why step="harder" />
    </section>
  );
}

/* 06 Plan it */
function PlanStep({ s, set, go }: StepProps) {
  const plan = s.plan ?? { name: '', situation: '', when: '', opener: '' };
  const ready = plan.name.trim() && plan.situation.trim() && plan.opener.trim();
  const field = (k: keyof Plan, label: string, hint: string, area?: boolean) => (
    <label className="block">
      <span className="text-bone">{label}</span>
      <span className="block text-[14px] text-ash">{hint}</span>
      {area ? (
        <textarea
          rows={3}
          value={plan[k]}
          onChange={(e) => set({ plan: { ...plan, [k]: e.target.value } })}
          className="mt-2 w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-bone focus:border-ember focus:outline-none"
        />
      ) : (
        <input
          value={plan[k]}
          onChange={(e) => set({ plan: { ...plan, [k]: e.target.value } })}
          className="mt-2 w-full rounded-xl border border-line bg-ink/60 px-4 py-3 text-bone focus:border-ember focus:outline-none"
        />
      )}
    </label>
  );
  return (
    <section>
      <Header kicker="06 · Plan it" title="Plan a real conversation.">
        <p>Pick a real person and a real situation. Write when and where, and your first line. Then rehearse it.</p>
      </Header>
      <div className="grid gap-8 lg:grid-cols-12">
        <form className="card space-y-6 p-6 lg:col-span-6" onSubmit={(e) => e.preventDefault()}>
          {field('name', 'First name', 'Only you see this. It stays in your browser.')}
          {field('situation', 'What has slipped, specifically?', 'Dates, deliverables, what you saw. No labels.', true)}
          {field('when', 'When and where will you talk?', 'For example: Thursday after standup, in the small room.')}
          {field('opener', 'Your first line', 'Open with the specifics and a question.', true)}
        </form>
        <div className="lg:col-span-6">
          {ready ? (
            <Round
              typed={s.typed}
              limit={240}
              start={{
                firstLine: 'Hey. You wanted to talk?',
                persona: `Play ${plan.name}, the person described in the extra context, instead of Jordan's usual background. Guarded at first, realistic, opens up only if handled well.`,
                context: `The manager's real report is ${plan.name}. What has happened: ${plan.situation}. Invent plausible private reasons behind it that ${plan.name} reveals slowly. Use the name ${plan.name}.`,
              }}
              run={s.planRun}
              onDone={(r) => set({ planRun: r })}
              startLabel={`Rehearse with ${plan.name}`}
            />
          ) : (
            <p className="text-ash">Fill in the name, what slipped, and your first line to rehearse.</p>
          )}
        </div>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Next onClick={() => go('results')} label="See your results" />
      </div>
      <Why step="plan" />
    </section>
  );
}

/* 07 Results */
function Results({ s, set, go }: StepProps) {
  const full = [...Object.values(s.variants), ...(s.planRun ? [s.planRun] : []), ...s.reps].filter((r) => r.result).sort((a, b) => b.at - a.at);
  const latest = full[0];
  const base = s.baseline?.result ?? null;
  const total = (r: ScoreResult | null | undefined) => (r ? r.scores.reduce((a, x) => a + x.score, 0) : 0);
  return (
    <section>
      <Header kicker="07 · Results" title="Before and after.">
        <p>Your cold open against your most recent full conversation. Same rubric, a different Jordan.</p>
      </Header>
      {base && latest?.result ? (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <div className="mb-6 flex items-baseline gap-4">
              <span className="font-mono text-[48px] leading-none text-bone">{total(latest.result)}</span>
              <span className="text-ash">of 15, up from {total(base)} in the cold open</span>
            </div>
            <ScoreBars result={latest.result} compare={base} />
          </div>
          <div className="grid gap-6 lg:col-span-12 lg:grid-cols-2">
            <CoachNote result={latest.result} />
            <div className="card p-6">
              <p className="label text-ash">Did Jordan open up?</p>
              <p className="mt-3 text-bone/85">
                Cold open: {['no', 'partly (the workload)', 'fully'][base.jordan_opened_up] ?? 'no'}. Latest:{' '}
                {['no', 'partly', 'fully'][latest.result.jordan_opened_up] ?? 'no'}.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-ash">Complete the cold open and at least one full conversation to see your before and after.</p>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <p className="label text-ash">Make it stick</p>
          <p className="mt-3 text-bone/85">
            Three 5-minute reps, spaced out: day 2, day 7, day 21. Each one is a new Jordan with no hints.
            {s.plan?.when ? ' Your real conversation is on the calendar too.' : ''}
          </p>
          <button type="button" className="btn-secondary mt-5 gap-2" onClick={() => ics(s.plan)}>
            <CalendarPlus size={16} strokeWidth={1.5} className="mr-2" aria-hidden /> Add to my calendar
          </button>
        </div>
        <div className="card p-6">
          <p className="label text-ash">What we measure, and what we don't</p>
          <p className="mt-3 text-bone/85">
            No smile sheet. No completion badge. We measure what you did in practice (the five behaviors) and whether you held the real
            conversation. That is the Matchlight standard.
          </p>
          <a href="mailto:hello@matchlight.ai?subject=Build%20this%20for%20my%20team" className="btn-primary mt-5">
            Build this for my team
            <span className="chip">
              <ArrowRight size={18} strokeWidth={1.5} aria-hidden />
            </span>
          </a>
        </div>
      </div>

      <button
        type="button"
        className="mt-10 text-[14px] text-ash underline decoration-ash/50 underline-offset-4 hover:text-bone"
        onClick={() => {
          if (window.confirm('Clear all your practice data from this browser and start over?')) {
            set(fresh());
            go('intro');
          }
        }}
      >
        Clear my data and start over
      </button>
      <Why step="results" />
    </section>
  );
}

/* Spaced rep (opened from the calendar link) */
function RepStep({ s, set }: { s: Store; set: (p: Partial<Store>) => void }) {
  const v = useMemo(() => VARIANTS[Math.floor(Math.random() * VARIANTS.length)], []);
  const [run, setRun] = useState<Run | undefined>();
  return (
    <section>
      <Header kicker="Spaced rep · 5 minutes" title="A quick round with Jordan.">
        <p>No hints. Pull the moves from memory: specifics, ask first, listen, stay steady, agree a next step.</p>
      </Header>
      <Round
        typed={s.typed}
        limit={300}
        start={{ firstLine: v.first, persona: v.persona }}
        run={run}
        onDone={(r) => {
          setRun(r);
          set({ reps: [...s.reps, r] });
        }}
      />
      <a href="/demo" className="mt-10 inline-block text-bone/80 underline underline-offset-4 hover:text-bone">
        Back to the course
      </a>
    </section>
  );
}
