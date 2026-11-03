/**
 * The two worlds of the hero, drawn as one 1600x900 scene each so they line
 * up. The same people appear in both: seated in rows facing a slide in the
 * old world, out on the floor doing the work in the new one. Both layers are
 * decorative (aria-hidden); the real copy sits above them.
 */

const VB = '0 0 1600 900';
const VP = { x: 800, y: 190 }; // vanishing point / horizon in the new world

/* ------------------------------------------------------------------ */
/* Old world: the classroom. Flat, boxed, one slide broadcast to rows. */
/* ------------------------------------------------------------------ */

function Seat({ x, y, s = 1, doze }: { x: number; y: number; s?: number; doze?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-22} y={4} width={44} height={30} rx={6} fill="#1d1c1a" stroke="#2c2b28" />
      <g className={doze !== undefined ? 'old-doze' : undefined} style={doze !== undefined ? { animationDelay: `${doze}s` } : undefined}>
        <circle cx={0} cy={-10} r={10} fill="#3a3834" />
        <path d="M-14 6 Q0 -4 14 6 L14 12 L-14 12 Z" fill="#33312d" />
      </g>
    </g>
  );
}

export function OldWorld() {
  const rows = [
    { y: 420, s: 0.8, n: 15, gap: 92 },
    { y: 492, s: 0.88, n: 14, gap: 100 },
    { y: 572, s: 0.96, n: 13, gap: 110 },
    { y: 660, s: 1.04, n: 12, gap: 120 },
    { y: 756, s: 1.12, n: 11, gap: 132 },
    { y: 862, s: 1.2, n: 10, gap: 146 },
  ];
  const dozers = new Set(['1-3', '2-9', '3-5', '0-11', '4-8', '2-1']);
  return (
    <svg aria-hidden viewBox={VB} preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-0 h-[60%] w-full md:inset-0 md:h-full">
      <rect width="1600" height="900" fill="#121211" />
      {/* Ceiling grid: drop-tile rectangles. */}
      <g stroke="#1b1b19" strokeWidth="1">
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={70} />
        ))}
        <line x1={0} y1={35} x2={1600} y2={35} />
        <line x1={0} y1={70} x2={1600} y2={70} />
      </g>

      {/* The slide. */}
      <g transform="translate(500 70)">
        <rect width="600" height="290" fill="#1a1a18" stroke="#2c2b28" />
        <text x="32" y="44" fill="#8A857C" fontFamily="Geist Mono, monospace" fontSize="13" letterSpacing="1.5">
          MODULE 3 OF 12
        </text>
        <text x="32" y="90" fill="#a39e94" fontFamily="Geist, sans-serif" fontSize="30" fontWeight="500">
          Learning Objectives
        </text>
        {['Understand the importance of feedback', 'Identify the key stages of the process', 'Recognize best practices'].map((t, i) => (
          <g key={t} transform={`translate(32 ${136 + i * 36})`}>
            <rect width="7" height="7" y="-8" fill="#55524b" />
            <text x="20" y="0" fill="#77736b" fontFamily="Geist, sans-serif" fontSize="17">
              {t}
            </text>
          </g>
        ))}
        <rect x="32" y="250" width="420" height="4" fill="#2a2926" />
        <rect x="32" y="250" width="68" height="4" fill="#55524b" />
        <text x="468" y="256" fill="#8A857C" fontFamily="Geist Mono, monospace" fontSize="12">
          14 / 86
        </text>
        <rect x="516" y="236" width="60" height="28" fill="none" stroke="#3a3833" />
        <text x="530" y="255" fill="#8A857C" fontFamily="Geist Mono, monospace" fontSize="12">
          Next
        </text>
      </g>
      {/* Projector beam. */}
      <path d="M800 380 L520 360 L1080 360 Z" fill="#a39e94" opacity="0.025" />

      {/* LMS sidebar. */}
      <g transform="translate(60 100)" fontFamily="Geist Mono, monospace" fontSize="12">
        <rect width="250" height="250" fill="#161614" stroke="#24231f" />
        <text x="22" y="36" fill="#8A857C" letterSpacing="1.5">
          MY LEARNING
        </text>
        {[
          ['Assigned', '12'],
          ['Overdue', '3'],
          ['In progress', '4'],
          ['Transcript', ''],
          ['Certificates', '27'],
        ].map(([k, v], i) => (
          <g key={k} transform={`translate(22 ${76 + i * 36})`}>
            <rect width="10" height="10" y="-9" fill="none" stroke="#3a3833" />
            <text x="22" y="0" fill="#77736b">
              {k}
            </text>
            <text x="206" y="0" fill="#77736b" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
      </g>

      {/* Certificate on the wall. */}
      <g transform="translate(1290 90)">
        <rect width="250" height="190" fill="#161614" stroke="#2c2b28" />
        <rect x="10" y="10" width="230" height="170" fill="none" stroke="#24231f" />
        <text x="125" y="52" textAnchor="middle" fill="#8A857C" fontFamily="Geist Mono, monospace" fontSize="11" letterSpacing="1.5">
          CERTIFICATE OF COMPLETION
        </text>
        <text x="125" y="88" textAnchor="middle" fill="#a39e94" fontFamily="Geist, sans-serif" fontSize="17">
          Annual Compliance 2026
        </text>
        <circle cx="125" cy="130" r="18" fill="none" stroke="#3a3833" />
        <text x="125" y="170" textAnchor="middle" fill="#77736b" fontFamily="Geist Mono, monospace" fontSize="11">
          Seat time 00:45:00
        </text>
      </g>
      {/* Wall clock. */}
      <g transform="translate(1160 130)">
        <circle r="30" fill="#161614" stroke="#2c2b28" />
        <line x1="0" y1="0" x2="0" y2="-18" stroke="#55524b" strokeWidth="2" />
        <line className="old-tick" x1="0" y1="0" x2="13" y2="0" stroke="#77736b" strokeWidth="1.5" />
      </g>

      {/* Rows of seats, everyone facing the slide. */}
      {rows.map((r, ri) => {
        const w = (r.n - 1) * r.gap;
        return (
          <g key={ri}>
            {Array.from({ length: r.n }).map((_, i) => {
              const k = `${ri}-${i}`;
              return <Seat key={k} x={800 - w / 2 + i * r.gap} y={r.y} s={r.s} doze={dozers.has(k) ? (i % 4) * 1.3 : undefined} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* New world: the floor of the work. Depth, motion, people doing it.   */
/* ------------------------------------------------------------------ */

function Person({ x, y, s = 1, lit, className, delay }: { x: number; y: number; s?: number; lit?: boolean; className?: string; delay?: number }) {
  const fill = lit ? '#FFB547' : '#F5F2EC';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={className} style={delay !== undefined ? { animationDelay: `${delay}s` } : undefined}>
        <ellipse cx="0" cy="34" rx="18" ry="4" fill="#FF5A1F" opacity="0.35" />
        <circle cx="0" cy="-12" r="9" fill={fill} />
        <path d="M-15 32 L-13 6 Q0 -3 13 6 L15 32 Z" fill={fill} opacity="0.92" />
      </g>
    </g>
  );
}

/** A holographic panel, tilted into the scene. */
function Holo({ x, y, w, h, skew = -8, children }: { x: number; y: number; w: number; h: number; skew?: number; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) skewY(${skew})`} className="holo">
      <rect width={w} height={h} rx="10" fill="rgba(255,90,31,0.10)" stroke="rgba(255,181,71,0.55)" />
      <rect width={w} height={h} rx="10" fill="url(#holoSheen)" />
      {children}
    </g>
  );
}

const T = ({ x, y, size = 15, mono, fill = '#F5F2EC', weight = 500, children }: { x: number; y: number; size?: number; mono?: boolean; fill?: string; weight?: number; children: React.ReactNode }) => (
  <text
    x={x}
    y={y}
    fill={fill}
    fontSize={size}
    fontWeight={weight}
    fontFamily={mono ? 'Geist Mono, monospace' : 'Geist, sans-serif'}
    letterSpacing={mono ? 1.4 : 0}
  >
    {children}
  </text>
);

export function NewWorld() {
  // Perspective floor: lines converge on the horizon, rows bunch toward it.
  const rays = Array.from({ length: 29 }).map((_, i) => -2200 + i * 200);
  const rows = Array.from({ length: 13 }).map((_, i) => VP.y + Math.pow(i + 1, 2) * 3.6);
  const paths = [
    'M330 600 C 470 520, 640 520, 760 470',
    'M760 470 C 900 420, 1060 470, 1190 600',
    'M330 600 C 520 720, 950 760, 1190 600',
    'M1190 600 C 1300 520, 1380 470, 1430 440',
    'M760 470 C 700 400, 640 380, 560 360',
  ];
  return (
    <svg aria-hidden viewBox={VB} preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-0 h-[60%] w-full md:inset-0 md:h-full">
      <defs>
        <radialGradient id="horizon" cx="50%" cy="21%" r="65%">
          <stop offset="0" stopColor="#FFB547" stopOpacity="0.55" />
          <stop offset="0.18" stopColor="#FF5A1F" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#B8360A" stopOpacity="0.1" />
          <stop offset="1" stopColor="#0E0E0C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF5A1F" stopOpacity="0.05" />
          <stop offset="1" stopColor="#FF5A1F" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="holoSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFB547" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#FFB547" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="flow" x1="0" x2="1">
          <stop offset="0" stopColor="#FF5A1F" stopOpacity="0" />
          <stop offset="1" stopColor="#FFB547" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#horizon)" />
      {/* Horizon line and sun. */}
      <circle cx={VP.x} cy={VP.y} r="120" fill="#FFB547" opacity="0.08" className="new-sun" />
      <circle cx={VP.x} cy={VP.y} r="34" fill="#FFB547" opacity="0.35" />
      <line x1="0" y1={VP.y} x2="1600" y2={VP.y} stroke="#FFB547" strokeOpacity="0.45" />

      {/* Floor grid. */}
      <g stroke="url(#floorFade)" strokeWidth="1">
        {rays.map((x) => (
          <line key={x} x1={VP.x} y1={VP.y} x2={x} y2={900} />
        ))}
        {rows.map((y) => (
          <line key={y} x1="0" y1={y} x2="1600" y2={y} />
        ))}
      </g>
      {/* Pulses racing out of the horizon along the floor. */}
      <g stroke="#FFB547" strokeWidth="1.6" strokeLinecap="round">
        {[-600, 200, 1000, 1800, 2600].map((x, i) => (
          <line key={x} x1={VP.x} y1={VP.y} x2={x} y2={900} className="floor-pulse" style={{ animationDelay: `${i * 0.7}s` }} />
        ))}
      </g>

      <g transform="translate(0 -150)">
      {/* Light paths between people. */}
      {paths.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="#FF5A1F" strokeOpacity="0.25" strokeWidth="1.2" />
          <path d={d} fill="none" stroke="url(#flow)" strokeWidth="2.4" strokeLinecap="round" className="flow-dash" style={{ animationDelay: `${i * 0.5}s` }} />
        </g>
      ))}

      {/* A: live negotiation sim, two people face to face. */}
      <Person x={290} y={600} s={1.25} />
      <Person x={372} y={600} s={1.25} lit className="new-bob" />
      <Holo x={220} y={430} w={250} h={108}>
        <T x={18} y={30} size={11} mono fill="#FFB547">
          ● LIVE SIM · ROUND 3
        </T>
        <T x={18} y={60} size={17}>
          “Why the price change?”
        </T>
        <T x={18} y={88} size={13} fill="rgba(245,242,236,0.7)" weight={400}>
          Your move. Hold the number.
        </T>
      </Holo>

      {/* B: one person with an AI coach beside them. */}
      <Person x={760} y={470} s={1.05} lit />
      <g className="coach-orb">
        <circle cx={812} cy={432} r="12" fill="#FFB547" />
        <circle cx={812} cy={432} r="26" fill="#FFB547" opacity="0.18" />
      </g>
      <Holo x={836} y={360} w={240} h={84} skew={-6}>
        <T x={16} y={28} size={11} mono fill="#FFB547">
          COACH
        </T>
        <T x={16} y={54} size={14} weight={400}>
          Ask about their constraints
        </T>
        <T x={16} y={72} size={14} weight={400}>
          before you defend the number.
        </T>
      </Holo>

      {/* C: a small team shipping. */}
      <Person x={1150} y={610} s={1.2} />
      <Person x={1205} y={624} s={1.25} lit className="new-bob" delay={0.6} />
      <Person x={1262} y={606} s={1.18} />
      <Holo x={1110} y={470} w={220} h={92} skew={6}>
        <T x={16} y={30} size={11} mono fill="#FFB547">
          SHIPPED · DAY 9
        </T>
        <T x={16} y={60} size={17}>
          Field sales sim v1.2
        </T>
        <rect x={16} y={72} width={188} height={2} fill="url(#flow)" />
      </Holo>

      {/* D: capability, measured in practice. */}
      <Person x={1430} y={440} s={0.9} lit />
      <Holo x={1352} y={300} w={220} h={100} skew={8}>
        <T x={16} y={30} size={11} mono fill="#FFB547">
          ABLE TO
        </T>
        <T x={16} y={56} size={15}>
          Lead a hard conversation
        </T>
        <rect x={16} y={72} width={188} height={5} rx={2.5} fill="rgba(245,242,236,0.12)" />
        <rect x={16} y={72} width={150} height={5} rx={2.5} fill="url(#flow)" className="new-meter-svg" />
      </Holo>

      {/* People moving between the work. */}
      <g className="walker" style={{ animationDuration: '14s' }}>
        <Person x={520} y={700} s={1.3} />
      </g>
      <g className="walker walker-r" style={{ animationDuration: '18s', animationDelay: '-6s' }}>
        <Person x={980} y={760} s={1.45} />
      </g>
      <g className="walker" style={{ animationDuration: '22s', animationDelay: '-3s' }}>
        <Person x={600} y={420} s={0.72} />
      </g>
      </g>
    </svg>
  );
}
