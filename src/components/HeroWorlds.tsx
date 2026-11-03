import { Check, Clock, Radio, Sparkles, Star } from 'lucide-react';

/**
 * The two worlds of the hero. Each card in the old world sits exactly over its
 * counterpart in the new one, so the cursor lens visibly transforms it.
 * Both layers are decorative (aria-hidden); the real copy lives above them.
 */

type Slot = { id: string; className: string };

// Shared positions (percent of the hero card). Cards stay out of the
// headline zone at the bottom left.
const SLOTS: Slot[] = [
  { id: 'sim', className: 'left-[4%] top-[12%] w-[55%] sm:left-[5%] sm:top-[11%] sm:w-[300px]' },
  { id: 'ship', className: 'left-[37%] top-[8%] w-[250px] hidden md:block' },
  { id: 'people', className: 'right-[4%] top-[12%] w-[37%] sm:right-[5%] sm:top-[11%] sm:w-[230px]' },
  { id: 'coach', className: 'left-[31%] top-[30%] w-[280px] hidden lg:block' },
  { id: 'able', className: 'right-[8%] top-[33%] w-[290px] hidden md:block' },
];

const pos = (id: string) => SLOTS.find((s) => s.id === id)!.className;

/* ---------------- Old world: regimented, gray, on a loop ---------------- */

const OLD_TILES = ['Compliance 101', 'Module 1 of 12', 'Click Next', 'Mandatory', 'Seat time 45:00', 'Completion 100%', 'Annual refresher', 'Acknowledge'];

function OldCard({ children, className }: { children: React.ReactNode; className: string }) {
  return <div className={`absolute rounded-[4px] border border-[#2c2b28] bg-[#1a1a18] p-4 font-mono text-ash ${className}`}>{children}</div>;
}

export function OldWorld() {
  const rows = Array.from({ length: 7 });
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#121211]">
      {/* The same tiles, row after row, moving at the same fixed pace. */}
      <div className="absolute inset-0 flex flex-col justify-around opacity-[0.55]">
        {rows.map((_, r) => (
          <div key={r} className="old-row flex w-max gap-3" style={{ animationDuration: '60s', animationDirection: r % 2 ? 'reverse' : 'normal' }}>
            {[...OLD_TILES, ...OLD_TILES, ...OLD_TILES].map((t, i) => (
              <span
                key={i}
                className="flex h-[54px] w-[180px] shrink-0 items-center gap-2 rounded-[3px] border border-[#24231f] bg-[#161614] px-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#4d4a45]"
              >
                <span className="h-2.5 w-2.5 rounded-[2px] border border-[#3a3833]" />
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_40%,transparent,rgba(18,18,17,0.85))]" />

      <OldCard className={pos('sim')}>
        <p className="text-[10px] uppercase tracking-[0.1em]">Module 4 of 12</p>
        <p className="mt-2 font-sans text-[17px] font-medium text-[#a39e94]">Negotiation Fundamentals</p>
        <p className="mt-2 font-sans text-[13px] leading-snug">Read the following slides. Click Next to continue.</p>
        <div className="mt-4 hidden h-1 w-full bg-[#2a2926] sm:block">
          <div className="h-1 w-1/3 bg-[#55524b]" />
        </div>
        <div className="mt-3 hidden justify-end sm:flex">
          <span className="rounded-[3px] border border-[#3a3833] px-3 py-1 text-[11px]">Next ›</span>
        </div>
      </OldCard>

      <OldCard className={pos('ship')}>
        <p className="text-[10px] uppercase tracking-[0.1em]">Course in development</p>
        <p className="mt-2 font-sans text-[15px] text-[#a39e94]">Storyboard v14</p>
        <p className="mt-1 text-[11px]">Awaiting SME sign-off · Est. Q3</p>
      </OldCard>

      <OldCard className={pos('people')}>
        <p className="text-[10px] uppercase tracking-[0.1em]">Enrolled</p>
        <p className="mt-2 font-sans text-[24px] font-medium leading-none text-[#a39e94] sm:text-[34px]">1,284</p>
        <p className="mt-3 flex items-center gap-2 text-[10px] sm:text-[11px]">
          <Check size={13} strokeWidth={1.5} className="shrink-0" /> 100% complete
        </p>
      </OldCard>

      <OldCard className={pos('coach')}>
        <p className="text-[10px] uppercase tracking-[0.1em]">Quiz · Q7 of 10</p>
        <p className="mt-2 font-sans text-[14px] leading-snug text-[#a39e94]">Which of the following best describes active listening?</p>
        <div className="mt-3 space-y-1.5 text-[11px]">
          {['A. Listening actively', 'B. All of the above', 'C. None of the above'].map((o) => (
            <p key={o} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full border border-[#3a3833]" />
              {o}
            </p>
          ))}
        </div>
      </OldCard>

      <OldCard className={pos('able')}>
        <p className="text-[10px] uppercase tracking-[0.1em]">Smile sheet</p>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} strokeWidth={1.5} className={i < 4 ? 'fill-[#55524b] text-[#55524b]' : ''} />
          ))}
        </div>
        <p className="mt-2 font-sans text-[15px] text-[#a39e94]">4.6 / 5 · Would recommend</p>
        <p className="mt-2 flex items-center gap-2 text-[11px]">
          <Clock size={12} strokeWidth={1.5} /> Seat time logged: 00:45:00
        </p>
      </OldCard>
    </div>
  );
}

/* ---------------- New world: live, warm, in motion ---------------- */

function NewCard({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <div
      className={`absolute rounded-2xl border border-[rgba(255,181,71,0.22)] bg-[rgba(20,17,14,0.62)] p-4 text-bone shadow-[0_20px_60px_-20px_rgba(255,90,31,0.45)] backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

const Live = ({ label }: { label: string }) => (
  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-flare">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flare opacity-70" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-flare" />
    </span>
    {label}
  </p>
);

export function NewWorld() {
  return (
    <div aria-hidden className="absolute inset-0">
      {/* Skill graph: nodes that connect and light up. */}
      <svg className="new-graph absolute inset-0 h-full w-full" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="edge" x1="0" x2="1">
            <stop offset="0" stopColor="#FF5A1F" stopOpacity="0" />
            <stop offset="0.7" stopColor="#FF5A1F" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFB547" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {[
          'M80 420 C 240 300, 330 360, 470 250',
          'M470 250 C 600 160, 700 220, 860 120',
          'M470 250 C 560 330, 690 340, 900 420',
          'M200 140 C 300 200, 380 180, 470 250',
          'M860 120 C 900 220, 880 300, 900 420',
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="url(#edge)" strokeWidth="1.2" className="graph-edge" style={{ animationDelay: `${i * 0.6}s` }} />
        ))}
        {[
          [80, 420],
          [200, 140],
          [470, 250],
          [860, 120],
          [900, 420],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#FFB547" className="graph-node" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
      </svg>

      <NewCard className={pos('sim')}>
        <Live label="Live simulation" />
        <p className="mt-2 text-[17px] font-medium">Negotiation · Round 3</p>
        <p className="mt-1 text-[13px] leading-snug text-bone/75">The client pushes back on price. Your move.</p>
        <div className="mt-3 hidden space-y-1.5 text-[12px] sm:block">
          <p className="rounded-lg border border-ember/70 bg-ember/10 px-3 py-1.5">Hold the number. Ask what changed.</p>
          <p className="rounded-lg border border-bone/10 px-3 py-1.5 text-bone/60">Offer a smaller scope.</p>
        </div>
      </NewCard>

      <NewCard className={pos('ship')}>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-flare">Shipped in 6 days</p>
        <p className="mt-2 text-[15px] font-medium">Field sales sim · v1.2 live</p>
        <div className="mt-3 h-px w-full" style={{ background: 'var(--strike)' }} />
        <p className="mt-2 text-[11px] text-bone/60">Hosted · SCORM · Repo handed over</p>
      </NewCard>

      <NewCard className={pos('people')}>
        <Live label="Practicing now" />
        <p className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.02em] sm:text-[34px]">1,284</p>
        <div className="mt-3 flex h-6 items-end gap-[3px]">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="new-bar w-[5px] rounded-full bg-gradient-to-t from-ember to-flare" style={{ animationDelay: `${(i * 0.13) % 1.4}s` }} />
          ))}
        </div>
      </NewCard>

      <NewCard className={pos('coach')}>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-flare">
          <Sparkles size={12} strokeWidth={1.5} /> Coach
        </p>
        <p className="mt-2 text-[14px] leading-snug">Ask about their constraints before you defend the number.</p>
        <p className="mt-3 flex items-center gap-2 text-[11px] text-bone/60">
          <Radio size={12} strokeWidth={1.5} /> Try it again with the new approach
        </p>
      </NewCard>

      <NewCard className={pos('able')}>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-flare">Able to</p>
        <p className="mt-2 text-[15px] font-medium">Lead a hard conversation</p>
        <div className="mt-3 h-1.5 w-full rounded-full bg-bone/10">
          <div className="new-meter h-1.5 rounded-full" style={{ background: 'var(--strike)' }} />
        </div>
        <p className="mt-2 flex justify-between text-[11px] text-bone/60">
          <span>Measured in practice</span>
          <span className="text-bone">+38% in 3 weeks</span>
        </p>
      </NewCard>
    </div>
  );
}
