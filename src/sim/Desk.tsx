import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, FileText, Mail as MailIcon, MessageCircle, StickyNote, Video, X } from 'lucide-react';
import type { App, CalEvent, World } from './world';

export const MEDIA = {
  portrait: '/media/jordan-portrait.png',
  wallpaper: '/media/wallpaper.png',
};

const APPS: { id: App; name: string; Icon: typeof MailIcon; tint: string }[] = [
  { id: 'mail', name: 'Mail', Icon: MailIcon, tint: '#3B82F6' },
  { id: 'chat', name: 'Chat', Icon: MessageCircle, tint: '#7C5CFF' },
  { id: 'calendar', name: 'Calendar', Icon: CalendarDays, tint: '#EF4444' },
  { id: 'files', name: 'Files', Icon: FileText, tint: '#0EA5E9' },
  { id: 'notes', name: 'Notes', Icon: StickyNote, tint: '#F59E0B' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const hm = (h: number) => {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const ap = hh >= 12 ? 'PM' : 'AM';
  return `${((hh + 11) % 12) + 1}:${pad(mm)} ${ap}`;
};

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name === 'You' ? 'ME' : name.split(/[\s-]+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
      style={{ width: size, height: size, background: name === 'Jordan Ellis' ? `center/cover url(${MEDIA.portrait})` : `hsl(${hue} 45% 45%)` }}
    >
      {name === 'Jordan Ellis' ? '' : initials}
    </span>
  );
}

type Props = {
  world: World;
  /** Seconds since the desk opened, for the clock and live messages. */
  onOpen?: (clueId: string) => void;
  onJoin?: () => void;
  notes: string;
  setNotes: (s: string) => void;
  overlay?: React.ReactNode;
  initialApp?: App | null;
};

export default function Desk({ world, onOpen, onJoin, notes, setNotes, overlay, initialApp = null }: Props) {
  const [t, setT] = useState(0);
  const [app, setApp] = useState<App | null>(initialApp);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<World['toasts']>([]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const [showJordan, setShowJordan] = useState(true);
  const t0 = useRef(Date.now());

  useEffect(() => {
    if (app === 'calendar' && showJordan) onOpen?.('calendar');
  }, [app, showJordan]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = window.setInterval(() => setT((Date.now() - t0.current) / 1000), 250);
    return () => window.clearInterval(id);
  }, []);

  // Notifications arrive on their own schedule, like a real morning.
  const fired = useRef(new Set<number>());
  useEffect(() => {
    world.toasts.forEach((n, i) => {
      if (t >= n.at && !fired.current.has(i)) {
        fired.current.add(i);
        setToasts((ts) => [...ts, n]);
        window.setTimeout(() => setToasts((ts) => ts.filter((x) => x !== n)), 9000);
      }
    });
  }, [t, world.toasts]);

  const mins = world.clock[0] * 60 + world.clock[1] + Math.floor(t / 60);
  const clock = `${((Math.floor(mins / 60) + 11) % 12) + 1}:${pad(mins % 60)} ${Math.floor(mins / 60) >= 12 ? 'PM' : 'AM'}`;

  const liveCount = (live?: { when: string }[]) => (live ? Math.min(live.length, Math.max(0, Math.floor((t - 6.5) / 1.4) + 1)) : 0);
  const threads = useMemo(
    () => world.chat.map((th) => ({ ...th, all: [...th.msgs, ...(th.live?.slice(0, liveCount(th.live)) ?? [])] })),
    [world.chat, Math.floor(t)], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const open = (a: App, item?: string) => {
    setApp(a);
    if (item) select(a, item);
  };
  const select = (a: App, item: string) => {
    setSel((s) => ({ ...s, [a]: item }));
    setRead((r) => new Set(r).add(item));
    const clue =
      world.mail.find((m) => m.id === item)?.clue ?? world.chat.find((c) => c.id === item)?.clue ?? world.files.find((f) => f.id === item)?.clue;
    if (clue) onOpen?.(clue);
  };

  const unread = {
    mail: world.mail.filter((m) => m.unread && !read.has(m.id)).length,
    chat: threads.filter((th) => !read.has(th.id) && (th.unread || (th.live && liveCount(th.live) > 0))).length,
    calendar: 0,
    files: 0,
    notes: 0,
  } as Record<App, number>;

  return (
    <div className="os fixed inset-0 overflow-hidden bg-[#1b1d22] text-[#1d1d1f]">
      {/* wallpaper */}
      <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${MEDIA.wallpaper}), radial-gradient(120% 80% at 50% 100%, #b5532a 0%, #3a2a2e 40%, #14161c 80%)` }} />
      <div aria-hidden className="absolute inset-0 bg-black/10" />

      {/* menu bar */}
      <div className="relative z-20 flex h-8 items-center justify-between bg-black/30 px-4 text-[13px] text-white/90 backdrop-blur-xl">
        <span className="font-semibold">{app ? APPS.find((a) => a.id === app)!.name : 'Desktop'}</span>
        <span className="tabular-nums">
          {world.dateLine.replace(/^(\w{3})\w*,/, '$1,')} &nbsp;{clock}
        </span>
      </div>

      {/* up next, small screens */}
      {onJoin && (
        <button type="button" onClick={onJoin} className="absolute inset-x-3 top-10 z-10 flex items-center justify-between rounded-xl bg-white/85 px-4 py-2.5 text-left shadow-xl backdrop-blur-xl lg:hidden">
          <span>
            <span className="block text-[14px] font-semibold">1:1 Jordan Ellis</span>
            <span className="block text-[12px] text-[#6e6e73]">9:30 AM · Video call</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#0a7cff] px-3 py-1.5 text-[13px] font-medium text-white">
            <Video size={14} aria-hidden /> Join
          </span>
        </button>
      )}

      {/* today widget */}
      <aside className="absolute right-4 top-12 z-10 hidden w-[260px] space-y-3 lg:block" aria-label="Today">
        <div className="rounded-2xl bg-white/75 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#86868b]">Up next</p>
          {world.cal.filter((e) => e.day === 0 && e.who === 'me' && e.join).map((e) => (
            <div key={e.title} className="mt-2">
              <p className="text-[15px] font-semibold">{e.title}</p>
              <p className="text-[13px] text-[#6e6e73]">
                {hm(e.start)} to {hm(e.end)} · Video call
              </p>
              {onJoin && (
                <button type="button" onClick={onJoin} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0a7cff] px-3 py-2 text-[14px] font-medium text-white hover:bg-[#0068d6]">
                  <Video size={15} aria-hidden /> Join
                </button>
              )}
            </div>
          ))}
          {!world.cal.some((e) => e.join) && <p className="mt-2 text-[14px] text-[#6e6e73]">Nothing scheduled with Jordan.</p>}
        </div>
        <div className="rounded-2xl bg-[#fff6c9]/90 p-4 shadow-xl backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a6d00]">Notes</p>
          <textarea
            aria-label="Your notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What do you want to say to Jordan?"
            rows={5}
            className="mt-1 w-full resize-none bg-transparent text-[14px] leading-snug text-[#3d3200] placeholder:text-[#a38a2e] focus:outline-none"
          />
        </div>
      </aside>

      {/* window */}
      {app && (
        <div className="absolute inset-x-2 bottom-24 top-11 z-10 flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:inset-x-auto md:left-[6%] md:right-[300px] md:top-14 lg:left-[8%]" role="dialog" aria-label={app}>
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-black/10 bg-[#f6f6f6] px-3">
            <button type="button" onClick={() => setApp(null)} aria-label="Close window" className="group grid h-3 w-3 place-items-center rounded-full bg-[#ff5f57]">
              <X size={8} className="opacity-0 group-hover:opacity-70" />
            </button>
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-[13px] font-medium text-[#6e6e73]">{APPS.find((a) => a.id === app)!.name}</span>
          </div>
          <div className="min-h-0 flex-1">
            {app === 'mail' && <MailApp world={world} sel={sel.mail} read={read} select={(id) => select('mail', id)} />}
            {app === 'chat' && <ChatApp threads={threads} sel={sel.chat} read={read} select={(id) => select('chat', id)} />}
            {app === 'calendar' && <CalApp world={world} showJordan={showJordan} setShowJordan={setShowJordan} onJoin={onJoin} />}
            {app === 'files' && <FilesApp world={world} sel={sel.files} select={(id) => select('files', id)} />}
            {app === 'notes' && (
              <textarea
                aria-label="Your notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What do you want to say to Jordan? What do you want to find out?"
                className="h-full w-full resize-none bg-[#fffbe6] p-6 text-[16px] leading-relaxed focus:outline-none"
              />
            )}
          </div>
        </div>
      )}

      {/* toasts */}
      <div className="absolute right-3 top-10 z-30 w-[340px] lg:right-[292px] max-w-[calc(100vw-24px)] space-y-2" aria-live="polite">
        {toasts.map((n, i) => (
          <button
            key={`${n.title}-${i}`}
            type="button"
            onClick={() => {
              setToasts((ts) => ts.filter((x) => x !== n));
              if (n.open === 'join') onJoin?.();
              else if (n.open) open(n.app, n.open);
            }}
            className="toast-in flex w-full gap-3 rounded-2xl bg-white/85 p-3 text-left shadow-2xl backdrop-blur-xl"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white" style={{ background: APPS.find((a) => a.id === n.app)!.tint }}>
              {(() => {
                const I = APPS.find((a) => a.id === n.app)!.Icon;
                return <I size={18} aria-hidden />;
              })()}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{n.title}</span>
              <span className="block text-[13px] leading-snug text-[#3a3a3c]">{n.text}</span>
            </span>
          </button>
        ))}
      </div>

      {/* dock */}
      <nav aria-label="Apps" className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-end gap-2 rounded-2xl border border-white/20 bg-white/20 p-2 backdrop-blur-2xl">
        {APPS.map(({ id, name, Icon, tint }) => (
          <button key={id} type="button" onClick={() => setApp(app === id ? null : id)} aria-label={name} title={name} className="group relative flex flex-col items-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl text-white shadow-lg transition-transform group-hover:-translate-y-1 md:h-14 md:w-14" style={{ background: `linear-gradient(180deg, ${tint}, ${tint}cc)` }}>
              <Icon size={24} strokeWidth={1.75} aria-hidden />
            </span>
            {unread[id] > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff3b30] px-1 text-[11px] font-semibold text-white">{unread[id]}</span>}
            <span className={`mt-1 h-1 w-1 rounded-full ${app === id ? 'bg-white' : 'bg-transparent'}`} />
          </button>
        ))}
      </nav>

      {overlay}
    </div>
  );
}

/* ---------------------------------------------------------------- apps */

function MailApp({ world, sel, read, select }: { world: World; sel?: string; read: Set<string>; select: (id: string) => void }) {
  const m = world.mail.find((x) => x.id === sel);
  return (
    <div className="grid h-full md:grid-cols-[320px_1fr]">
      <ul className={`overflow-y-auto border-r border-black/10 ${m ? 'hidden md:block' : ''}`}>
        {world.mail.map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => select(x.id)} className={`flex w-full gap-3 border-b border-black/5 px-4 py-3 text-left ${sel === x.id ? 'bg-[#0a7cff] text-white' : 'hover:bg-black/[0.03]'}`}>
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${x.unread && !read.has(x.id) ? 'bg-[#0a7cff]' : 'bg-transparent'} ${sel === x.id ? '!bg-white' : ''}`} />
              <span className="min-w-0 flex-1">
                <span className="flex justify-between gap-2 text-[14px] font-semibold">
                  <span className="truncate">{x.from}</span>
                  <span className={`shrink-0 text-[12px] font-normal ${sel === x.id ? 'text-white/80' : 'text-[#86868b]'}`}>{x.when.replace(/, .*/, '')}</span>
                </span>
                <span className="block truncate text-[13px]">{x.subject}</span>
                <span className={`block truncate text-[13px] ${sel === x.id ? 'text-white/80' : 'text-[#86868b]'}`}>{x.body[0]}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {m ? (
        <article className="overflow-y-auto p-6 md:p-10">
          <button type="button" onClick={() => select('')} className="mb-4 text-[14px] text-[#0a7cff] md:hidden">
            ‹ Inbox
          </button>
          <h2 className="text-[22px] font-semibold tracking-tight">{m.subject}</h2>
          <div className="mt-4 flex items-center gap-3 border-b border-black/10 pb-4">
            <Avatar name={m.from} size={40} />
            <div className="text-[14px]">
              <p className="font-semibold">
                {m.from} {m.org && <span className="font-normal text-[#86868b]">· {m.org}</span>}
              </p>
              <p className="text-[#86868b]">To: you · {m.when}</p>
            </div>
          </div>
          <div className="mt-6 max-w-2xl space-y-4 whitespace-pre-line text-[15px] leading-relaxed text-[#1d1d1f]">
            {m.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      ) : (
        <div className="hidden place-items-center text-[14px] text-[#86868b] md:grid">No message selected</div>
      )}
    </div>
  );
}

type T = World['chat'][number] & { all: World['chat'][number]['msgs'] };
function ChatApp({ threads, sel, read, select }: { threads: T[]; sel?: string; read: Set<string>; select: (id: string) => void }) {
  const th = threads.find((x) => x.id === sel);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [th?.all.length, sel]);
  return (
    <div className="grid h-full md:grid-cols-[260px_1fr]">
      <ul className={`overflow-y-auto border-r border-black/10 bg-[#f5f5f7] py-2 ${th ? 'hidden md:block' : ''}`}>
        {threads.map((x) => {
          const fresh = !read.has(x.id) && (x.unread || (x.live && x.all.length > x.msgs.length));
          return (
            <li key={x.id}>
              <button type="button" onClick={() => select(x.id)} className={`mx-2 flex w-[calc(100%-16px)] items-center gap-3 rounded-lg px-3 py-2 text-left ${sel === x.id ? 'bg-[#7C5CFF] text-white' : 'hover:bg-black/5'}`}>
                {x.kind === 'channel' ? <span className="grid h-8 w-8 place-items-center rounded-lg bg-black/10 text-[15px]">#</span> : <Avatar name={x.name} />}
                <span className={`min-w-0 flex-1 truncate text-[14px] ${fresh ? 'font-semibold' : ''}`}>{x.name}</span>
                {fresh && <span className="h-2 w-2 rounded-full bg-[#ff3b30]" />}
              </button>
            </li>
          );
        })}
      </ul>
      {th ? (
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-3 border-b border-black/10 px-5 py-3">
            <button type="button" onClick={() => select('')} className="text-[14px] text-[#7C5CFF] md:hidden">
              ‹
            </button>
            <p className="text-[15px] font-semibold">{th.kind === 'channel' ? `# ${th.name}` : th.name}</p>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {th.all.map((m, i) => (
              <div key={i} className="toast-in flex gap-3">
                <Avatar name={m.who} size={36} />
                <div>
                  <p className="text-[14px]">
                    <span className="font-semibold">{m.who}</span> <span className="text-[12px] text-[#86868b]">{m.when}</span>
                  </p>
                  <p className="text-[15px] leading-snug">{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={end} />
          </div>
        </div>
      ) : (
        <div className="hidden place-items-center text-[14px] text-[#86868b] md:grid">Pick a conversation</div>
      )}
    </div>
  );
}

function CalApp({ world, showJordan, setShowJordan, onJoin }: { world: World; showJordan: boolean; setShowJordan: (v: boolean) => void; onJoin?: () => void }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const H0 = 8;
  const H1 = 22;
  const row = 34;
  const evs = world.cal.filter((e) => e.who === 'me' || showJordan);
  const block = (e: CalEvent) => ({ top: (e.start - H0) * row, height: Math.max(18, (e.end - e.start) * row - 2) });
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-3">
        <p className="text-[17px] font-semibold">{world.calWeek}</p>
        <label className="flex cursor-pointer items-center gap-2 text-[13px]">
          <input type="checkbox" checked={showJordan} onChange={(e) => setShowJordan(e.target.checked)} className="accent-[#7C5CFF]" />
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#7C5CFF]" /> Jordan Ellis (shared)
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid min-w-[640px] grid-cols-[52px_repeat(5,1fr)]">
          <div />
          {days.map((d, i) => (
            <div key={d} className={`sticky top-0 z-10 border-b border-black/10 bg-white py-2 text-center text-[13px] ${i === 0 ? 'font-semibold text-[#ef4444]' : 'text-[#6e6e73]'}`}>
              {d}
            </div>
          ))}
          <div className="relative" style={{ height: (H1 - H0) * row }}>
            {Array.from({ length: H1 - H0 }, (_, i) => (
              <span key={i} className="absolute right-2 -translate-y-1/2 text-[11px] text-[#86868b]" style={{ top: i * row }}>
                {i === 0 ? '' : hm(H0 + i).replace(':00', '')}
              </span>
            ))}
          </div>
          {days.map((d, di) => (
            <div key={d} className="relative border-l border-black/5" style={{ height: (H1 - H0) * row, backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.06) 0 1px, transparent 1px ${row}px)` }}>
              {evs
                .filter((e) => e.day === di)
                .map((e) => (
                  <div
                    key={e.title + e.start}
                    className={`absolute overflow-hidden rounded-md px-2 py-1 text-[12px] leading-tight ${
                      e.who === 'jordan' ? 'left-[46%] right-1 border-l-[3px] border-[#7C5CFF] bg-[#7C5CFF]/15 text-[#3b2a99]' : `left-1 right-[8%] border-l-[3px] border-[#ef4444] ${e.muted ? 'bg-[#ef4444]/8 text-[#9b2c2c]/70' : 'bg-[#ef4444]/15 text-[#9b2c2c]'}`
                    }`}
                    style={block(e)}
                  >
                    <p className="font-medium">{e.title}</p>
                    {e.join && onJoin && (
                      <button type="button" onClick={onJoin} className="mt-1 rounded bg-[#0a7cff] px-2 py-0.5 text-[11px] font-medium text-white">
                        Join
                      </button>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilesApp({ world, sel, select }: { world: World; sel?: string; select: (id: string) => void }) {
  const f = world.files.find((x) => x.id === sel);
  if (!world.files.length) return <div className="grid h-full place-items-center text-[14px] text-[#86868b]">No recent files</div>;
  return (
    <div className="grid h-full md:grid-cols-[300px_1fr]">
      <ul className={`overflow-y-auto border-r border-black/10 p-2 ${f ? 'hidden md:block' : ''}`}>
        {world.files.map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => select(x.id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${sel === x.id ? 'bg-[#0EA5E9] text-white' : 'hover:bg-black/5'}`}>
              <FileText size={28} strokeWidth={1.25} aria-hidden />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium">{x.name}</span>
                <span className={`block truncate text-[12px] ${sel === x.id ? 'text-white/80' : 'text-[#86868b]'}`}>{x.edited}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {f ? (
        <div className="overflow-y-auto p-6 md:p-10">
          <button type="button" onClick={() => select('')} className="mb-4 text-[14px] text-[#0EA5E9] md:hidden">
            ‹ Files
          </button>
          <h2 className="text-[22px] font-semibold tracking-tight">{f.name}</h2>
          <p className="mt-1 text-[14px] text-[#86868b]">{f.note}</p>
          <ol className="mt-6 max-w-lg">
            {f.versions.map((v, i) => (
              <li key={i} className="flex items-center gap-4 border-b border-black/5 py-3">
                <span className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-[#0EA5E9]' : 'bg-black/20'}`} />
                <span className="flex-1">
                  <span className="block text-[14px] font-medium">{v.v}</span>
                  <span className="block text-[13px] text-[#6e6e73]">{v.who}</span>
                </span>
                <span className="text-[13px] tabular-nums text-[#1d1d1f]">{v.when}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="hidden place-items-center text-[14px] text-[#86868b] md:grid">Select a file to see its history</div>
      )}
    </div>
  );
}
