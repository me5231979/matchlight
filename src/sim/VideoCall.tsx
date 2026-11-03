import { useEffect, useRef, useState } from 'react';
import { Captions, Keyboard, Lock, Mic, MicOff, NotebookPen, PhoneOff, Send, Video, VideoOff } from 'lucide-react';
import type { CallStatus, Line, Mood } from '../course/useJordan';
import { MEDIA } from './Desk';

export const CLIPS = {
  idle: '/media/jordan-idle.mp4',
  neutral: '/media/jordan-talk.mp4',
  hurt: '/media/jordan-hurt.mp4',
  defensive: '/media/jordan-defensive.mp4',
  warm: '/media/jordan-warm.mp4',
} as const;
type Clip = keyof typeof CLIPS;

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Your camera, shown only to you. Nothing is recorded or sent. */
function useCamera(want: boolean, audioToo: boolean) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [denied, setDenied] = useState(false);
  useEffect(() => {
    if (!want) return;
    let live: MediaStream | null = null;
    let gone = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { width: 640, height: 360, facingMode: 'user' }, audio: audioToo })
      .then((s) => {
        if (gone) return s.getTracks().forEach((t) => t.stop());
        // We only keep video here; the call opens its own mic stream.
        s.getAudioTracks().forEach((t) => t.stop());
        live = s;
        setStream(s);
      })
      .catch(() => setDenied(true));
    return () => {
      gone = true;
      live?.getTracks().forEach((t) => t.stop());
      setStream(null);
    };
  }, [want, audioToo]);
  return { stream, denied };
}

function SelfView({ stream, on, className = '' }: { stream: MediaStream | null; on: boolean; className?: string }) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (v.current) v.current.srcObject = stream;
  }, [stream, on]);
  return (
    <div className={`relative overflow-hidden bg-[#2a2b2e] ${className}`}>
      {on && stream ? (
        <video ref={v} autoPlay muted playsInline className="h-full w-full -scale-x-100 object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[#5f6368] text-[18px] font-medium text-white">You</span>
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[12px] text-white">You</span>
    </div>
  );
}

/** Jordan's video. Each mood is a short loop; we cross-fade between them. */
function JordanVideo({ clip, speaking }: { clip: Clip; speaking: boolean }) {
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});
  useEffect(() => {
    const el = refs.current[clip];
    if (el) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    }
  }, [clip]);
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[#111]">
      <img src={MEDIA.portrait} alt="" className="absolute inset-0 h-full w-full object-cover" />
      {(Object.keys(CLIPS) as Clip[]).map((k) => (
        <video
          key={k}
          ref={(el) => (refs.current[k] = el)}
          src={CLIPS[k]}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: k === clip ? 1 : 0 }}
        />
      ))}
      {/* the speaking ring sits above the video */}
      <div className={`pointer-events-none absolute inset-0 rounded-2xl transition-shadow duration-200 ${speaking ? 'shadow-[inset_0_0_0_3px_#8ab4f8]' : ''}`} />
    </div>
  );
}

type CallProps = {
  status: CallStatus;
  lines: Line[];
  speaking: boolean;
  mood: Mood;
  elapsed: number;
  limit: number;
  typed: boolean;
  error: string;
  notes: string;
  onSend: (t: string) => void;
  onLeave: () => void;
  onMute: (on: boolean) => void;
  stream: MediaStream | null;
  camOn: boolean;
  setCamOn: (v: boolean) => void;
};

type LobbyProps = { typed: boolean; onJoin: (typed: boolean) => void; onBack: () => void; stream: MediaStream | null; denied: boolean; camOn: boolean; setCamOn: (v: boolean) => void };

export function Lobby({ typed, onJoin, onBack, stream, denied, camOn, setCamOn }: LobbyProps) {
  return (
    <div className="os fixed inset-0 flex flex-col bg-[#202124] text-white">
      <div className="flex h-14 items-center justify-between px-6 text-[14px] text-white/70">
        <button type="button" onClick={onBack} className="hover:text-white">
          ‹ Back to desk
        </button>
        <span className="flex items-center gap-2">
          <Lock size={13} aria-hidden /> Not recorded
        </span>
      </div>
      <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-6 pb-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <SelfView stream={stream} on={camOn && !denied} className="aspect-video w-full rounded-2xl" />
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setCamOn(!camOn)}
              aria-pressed={!camOn}
              aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
              className={`grid h-12 w-12 place-items-center rounded-full ${camOn && !denied ? 'bg-[#3c4043] hover:bg-[#4a4e51]' : 'bg-[#ea4335]'}`}
            >
              {camOn && !denied ? <Video size={20} aria-hidden /> : <VideoOff size={20} aria-hidden />}
            </button>
          </div>
          <p className="mt-3 text-center text-[13px] text-white/50">{denied ? 'Camera is off. That is fine; Jordan cannot see you either way.' : 'Your camera stays on this device. Jordan cannot see it and nothing is recorded.'}</p>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-[30px] font-normal tracking-tight">Ready to join?</h1>
          <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
            <img src={MEDIA.portrait} alt="" className="h-8 w-8 rounded-full object-cover" />
            <p className="text-[15px] text-white/75">Jordan Ellis is in this call</p>
          </div>
          <div className="mt-8 flex flex-col items-center gap-4 md:items-start">
            <button type="button" onClick={() => onJoin(false)} className="rounded-full bg-[#8ab4f8] px-8 py-3 text-[15px] font-medium text-[#202124] hover:bg-[#aecbfa]">
              Join now
            </button>
            <button type="button" onClick={() => onJoin(true)} className="inline-flex items-center gap-2 text-[14px] text-[#8ab4f8] hover:underline">
              <Keyboard size={15} aria-hidden /> {typed ? 'Join with chat (you chose typing)' : "Can't talk out loud? Join with chat"}
            </button>
          </div>
          <p className="mt-8 text-[13px] leading-relaxed text-white/45">You'll speak with an AI playing Jordan. Use headphones if you can. The call is capped at 10 minutes.</p>
        </div>
      </div>
    </div>
  );
}

export default function VideoCall({ status, lines, speaking, mood, elapsed, limit, typed, error, notes, onSend, onLeave, onMute, stream, camOn, setCamOn }: CallProps) {
  const [muted, setMuted] = useState(false);
  const [cc, setCc] = useState(true);
  const [panel, setPanel] = useState<'none' | 'chat' | 'notes'>(typed ? 'chat' : 'none');
  const [draft, setDraft] = useState('');
  const [typedTalk, setTypedTalk] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const live = status === 'live';
  const lastJordan = [...lines].reverse().find((l) => l.role === 'jordan');

  // In chat mode Jordan's line arrives as text; animate as if they said it.
  useEffect(() => {
    if (!typed || !lastJordan) return;
    setTypedTalk(true);
    const id = window.setTimeout(() => setTypedTalk(false), Math.min(9000, 900 + lastJordan.text.split(' ').length * 320));
    return () => window.clearTimeout(id);
  }, [lines.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const talking = speaking || typedTalk;
  const clip: Clip = talking ? mood : 'idle';
  const caption = talking ? lastJordan?.text : lines.at(-1)?.role === 'manager' && !typed ? lines.at(-1)?.text : undefined;
  const captionWho = talking ? 'Jordan Ellis' : 'You';

  const btn = 'grid h-12 w-12 place-items-center rounded-full bg-[#3c4043] text-white hover:bg-[#4a4e51]';
  return (
    <div className="os fixed inset-0 flex flex-col bg-[#202124] text-white">
      {/* top */}
      <div className="flex h-12 shrink-0 items-center justify-between px-5 text-[14px]">
        <span className="font-medium">1:1 Jordan Ellis</span>
        <span className="flex items-center gap-3 text-white/70">
          {status === 'connecting' ? 'Connecting…' : <span className="tabular-nums">{fmt(elapsed)}</span>}
          <span className="hidden items-center gap-1.5 sm:flex">
            <Lock size={13} aria-hidden /> Not recorded
          </span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 gap-3 px-3 pb-2">
        {/* stage */}
        <div className="relative min-w-0 flex-1">
          <div className="absolute inset-0">
            <JordanVideo clip={clip} speaking={talking} />
            <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-0.5 text-[13px]">Jordan Ellis</span>
            {status === 'connecting' && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-black/40 text-[15px] text-white/80">Connecting audio…</div>}
            {limit - elapsed <= 60 && live && <div className="toast-in absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-[13px]">Your next meeting starts in {Math.max(0, limit - elapsed)} seconds</div>}

            {/* captions */}
            {cc && caption && (
              <div className="absolute inset-x-0 bottom-14 flex justify-center px-4" aria-live="polite">
                <p className="max-w-3xl rounded-lg bg-black/70 px-4 py-2 text-center text-[18px] leading-snug md:text-[22px]">
                  <span className="mr-2 text-[13px] text-white/60">{captionWho}</span>
                  {caption}
                </p>
              </div>
            )}
            {error && <p className="absolute inset-x-0 top-4 mx-auto w-fit max-w-md rounded-lg bg-[#ea4335] px-4 py-2 text-center text-[14px]">{error}</p>}

            <div className="absolute bottom-3 right-3 aspect-video w-[34%] max-w-[260px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
              <SelfView stream={stream} on={camOn} className="h-full w-full" />
            </div>
          </div>
        </div>

        {/* side panel */}
        {panel !== 'none' && (
          <aside className="absolute inset-x-3 bottom-20 top-14 z-10 flex flex-col overflow-hidden rounded-2xl bg-white text-[#202124] md:static md:w-[340px]" aria-label={panel === 'chat' ? 'In-call messages' : 'Your notes'}>
            <p className="border-b border-black/10 px-5 py-4 text-[16px] font-medium">{panel === 'chat' ? 'In-call messages' : 'Your notes'}</p>
            {panel === 'notes' ? (
              <p className="flex-1 overflow-y-auto whitespace-pre-wrap p-5 text-[14px] leading-relaxed">{notes || 'You did not write any notes.'}</p>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-5 text-[14px]">
                  {lines.map((l, i) => (
                    <div key={i}>
                      <p className="text-[12px] font-medium text-[#5f6368]">{l.role === 'manager' ? 'You' : 'Jordan Ellis'}</p>
                      <p>{l.text}</p>
                    </div>
                  ))}
                  {!lines.length && <p className="text-[#5f6368]">{typed ? 'Jordan is about to say something.' : 'Captions will collect here.'}</p>}
                </div>
                {typed && (
                  <form
                    className="flex gap-2 border-t border-black/10 p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSend(draft);
                      setDraft('');
                    }}
                  >
                    <input
                      ref={input}
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      disabled={!live}
                      aria-label="Your reply to Jordan"
                      placeholder="Say it the way you would say it"
                      className="flex-1 rounded-full bg-[#f1f3f4] px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    />
                    <button type="submit" disabled={!live || !draft.trim()} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-full text-[#1a73e8] disabled:opacity-30">
                      <Send size={18} aria-hidden />
                    </button>
                  </form>
                )}
              </>
            )}
          </aside>
        )}
      </div>

      {/* controls */}
      <div className="flex h-20 shrink-0 items-center justify-center gap-3 px-4">
        {!typed && (
          <button
            type="button"
            onClick={() => {
              setMuted(!muted);
              onMute(!muted);
            }}
            aria-pressed={muted}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className={muted ? `${btn} !bg-[#ea4335]` : btn}
          >
            {muted ? <MicOff size={20} aria-hidden /> : <Mic size={20} aria-hidden />}
          </button>
        )}
        <button type="button" onClick={() => setCamOn(!camOn)} aria-pressed={!camOn} aria-label={camOn ? 'Turn camera off' : 'Turn camera on'} className={camOn ? btn : `${btn} !bg-[#ea4335]`}>
          {camOn ? <Video size={20} aria-hidden /> : <VideoOff size={20} aria-hidden />}
        </button>
        <button type="button" onClick={() => setCc(!cc)} aria-pressed={cc} aria-label="Captions" className={cc ? `${btn} !bg-[#8ab4f8] !text-[#202124]` : btn}>
          <Captions size={20} aria-hidden />
        </button>
        <button type="button" onClick={() => setPanel(panel === 'chat' ? 'none' : 'chat')} aria-pressed={panel === 'chat'} aria-label={typed ? 'Chat' : 'Transcript'} className={panel === 'chat' ? `${btn} !bg-[#8ab4f8] !text-[#202124]` : btn}>
          <Keyboard size={20} aria-hidden />
        </button>
        <button type="button" onClick={() => setPanel(panel === 'notes' ? 'none' : 'notes')} aria-pressed={panel === 'notes'} aria-label="Your notes" className={panel === 'notes' ? `${btn} !bg-[#8ab4f8] !text-[#202124]` : btn}>
          <NotebookPen size={20} aria-hidden />
        </button>
        <button type="button" onClick={onLeave} aria-label="Leave call" className="grid h-12 w-16 place-items-center rounded-full bg-[#ea4335] hover:bg-[#d93025]">
          <PhoneOff size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}

export { useCamera };
