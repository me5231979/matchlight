import { useCallback, useEffect, useRef, useState } from 'react';
import { Conversation, stripAudioTags } from '@elevenlabs/client';
import { AGENT_ID } from './data';

export type Line = { role: 'manager' | 'jordan'; text: string };
export type CallStatus = 'idle' | 'connecting' | 'live' | 'ended' | 'error';
export type Mood = 'neutral' | 'hurt' | 'defensive' | 'warm';

/** Jordan's voice cues ([sad], [sigh], [frustrated]...) tell us how they feel. */
export function moodOf(raw: string, fallback: Mood): Mood {
  const tags = (raw.match(/\[([^\]]+)\]/g) || []).join(' ').toLowerCase();
  if (!tags) return fallback;
  if (/sad|sigh|tear|cry|quiet|hesitant|tired|exhal|voice breaks|soft/.test(tags)) return 'hurt';
  if (/frustrat|annoy|defens|angry|sharp|irritat|curt|scoff/.test(tags)) return 'defensive';
  if (/happy|relie|laugh|warm|smil|grateful|chuckl|light/.test(tags)) return 'warm';
  return fallback;
}
type Session = Awaited<ReturnType<typeof Conversation.startSession>>;

export type StartOptions = {
  firstLine: string;
  persona: string;
  mode?: 'full' | 'drill';
  context?: string;
  typed?: boolean;
  /** Seconds before the session is closed for the learner. */
  limit?: number;
  /** In a drill, end automatically after Jordan answers the manager once. */
  endAfterReply?: boolean;
  /**
   * Route Jordan's voice to a live avatar instead of the speakers. The avatar
   * plays the audio itself, lip-synced. Call `speakers(true)` to fall back.
   */
  avatar?: { onAudio: (b64: string, sampleRate: number) => void; onTurnEnd: () => void; onInterrupt: () => void };
};

/**
 * One practice conversation with Jordan (ElevenLabs agent, Claude as the brain).
 * Voice by default; typed mode uses the same agent in text-only mode.
 */
function rateOf(s: unknown): number {
  // ElevenLabs agents default to 16 kHz PCM; read the negotiated rate when exposed.
  const r = (s as { connection?: { outputFormat?: { sampleRate?: number } } } | null)?.connection?.outputFormat?.sampleRate;
  return typeof r === 'number' && r > 0 ? r : 16000;
}

export function useJordan() {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [lines, setLines] = useState<Line[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [mood, setMood] = useState<Mood>('neutral');
  const session = useRef<Session | null>(null);
  const opts = useRef<StartOptions | null>(null);
  const timer = useRef<number>();
  const linesRef = useRef<Line[]>([]);

  const stop = useCallback(async () => {
    window.clearInterval(timer.current);
    const s = session.current;
    session.current = null;
    if (s) {
      try {
        await s.endSession();
      } catch {
        /* already closed */
      }
    }
    setSpeaking(false);
    setStatus((st) => (st === 'error' ? st : 'ended'));
  }, []);

  const push = useCallback(
    (line: Line) => {
      linesRef.current = [...linesRef.current, line];
      setLines(linesRef.current);
      const o = opts.current;
      if (o?.endAfterReply && line.role === 'jordan' && linesRef.current.some((l) => l.role === 'manager')) {
        // Let Jordan's reply finish playing before closing the drill.
        window.setTimeout(() => void stop(), o.typed ? 600 : 2600);
      }
    },
    [stop],
  );

  const start = useCallback(
    async (o: StartOptions) => {
      await stop();
      opts.current = o;
      linesRef.current = [];
      setLines([]);
      setError('');
      setElapsed(0);
      setMood('neutral');
      setStatus('connecting');
      if (import.meta.env.DEV && new URLSearchParams(location.search).has('mock')) {
        // Local UI testing only: a scripted Jordan, no network.
        const replies = ['[sigh] Yeah. Since Priya left I have kind of been doing two jobs.', '[sad] And my dad had a fall. I have been driving out there three nights a week.', '[relieved] Okay. Wednesday works. Thanks for asking.'];
        let n = 0;
        session.current = {
          sendUserMessage: () =>
            window.setTimeout(() => {
              const r = replies[n++ % replies.length];
              setMood((m) => moodOf(r, m));
              setSpeaking(true);
              window.setTimeout(() => setSpeaking(false), 2200);
              push({ role: 'jordan', text: stripAudioTags(r).trim() });
            }, 400),
          setMicMuted: () => {},
          endSession: async () => {},
          getOutputVolume: () => 0,
          getInputVolume: () => 0,
        } as unknown as Session;
        setStatus('live');
        push({ role: 'jordan', text: o.firstLine });
        return;
      }
      try {
        if (!o.typed) await navigator.mediaDevices.getUserMedia({ audio: true });
        const s = await Conversation.startSession({
          agentId: AGENT_ID,
          // The avatar needs raw audio chunks, which the websocket transport provides.
          connectionType: o.typed || o.avatar ? 'websocket' : 'webrtc',
          textOnly: !!o.typed,
          overrides: o.typed ? { conversation: { textOnly: true } } : undefined,
          dynamicVariables: {
            first_line: o.firstLine,
            persona: o.persona,
            mode: o.mode ?? 'full',
            context: o.context || 'None.',
          },
          onConnect: () => setStatus('live'),
          onMessage: ({ message, role }) => {
            // Voice cues like [sad] shape Jordan's delivery; keep them out of captions.
            const text = stripAudioTags(message).replace(/\s{2,}/g, ' ').trim();
            // Typed mode: we already added the manager's own message on send.
            if (o.typed && role !== 'agent') return;
            if (role === 'agent') setMood((m) => moodOf(message, m));
            if (text) push({ role: role === 'agent' ? 'jordan' : 'manager', text });
          },
          onModeChange: ({ mode }) => {
            setSpeaking(mode === 'speaking');
            if (mode === 'listening') o.avatar?.onTurnEnd();
          },
          onAudio: o.avatar && !o.typed ? (b64: string) => o.avatar!.onAudio(b64, rateOf(session.current)) : undefined,
          onInterruption: o.avatar && !o.typed ? () => o.avatar!.onInterrupt() : undefined,
          onError: (message) => setError(message || 'Something went wrong with the connection.'),
          onDisconnect: () => {
            window.clearInterval(timer.current);
            session.current = null;
            setSpeaking(false);
            setStatus((st) => (st === 'error' ? st : 'ended'));
          },
        });
        session.current = s;
        if (o.avatar && !o.typed) s.setVolume({ volume: 0 });
        const t0 = Date.now();
        timer.current = window.setInterval(() => {
          const secs = Math.floor((Date.now() - t0) / 1000);
          setElapsed(secs);
          if (o.limit && secs >= o.limit) void stop();
        }, 250);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(
          /permission|denied|NotAllowed/i.test(msg)
            ? 'Microphone access was blocked. Allow the microphone, or switch to typing.'
            : 'Could not reach Jordan. Check your connection and try again.',
        );
        setStatus('error');
      }
    },
    [push, stop],
  );

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || !session.current) return;
      session.current.sendUserMessage(t);
      // In text-only mode the SDK does not echo user messages back; add it ourselves.
      if (opts.current?.typed) push({ role: 'manager', text: t });
    },
    [push],
  );

  /** Play Jordan's voice through the speakers (on) or leave it to the avatar (off). */
  const speakers = useCallback((on: boolean) => {
    try {
      session.current?.setVolume({ volume: on ? 1 : 0 });
    } catch {
      /* text mode */
    }
  }, []);

  const mute = useCallback((on: boolean) => {
    try {
      session.current?.setMicMuted(on);
    } catch {
      /* not supported in this mode */
    }
  }, []);

  const volume = useCallback(() => {
    const s = session.current;
    if (!s) return 0;
    try {
      return Math.max(s.getOutputVolume(), s.getInputVolume() * 0.6);
    } catch {
      return 0;
    }
  }, []);

  useEffect(
    () => () => {
      void stop();
    },
    [stop],
  );

  return { status, lines, speaking, error, elapsed, mood, start, stop, send, volume, mute, speakers };
}

export type ScoreResult = {
  scores: { id: string; score: number; evidence: string; why: string }[];
  summary: string;
  try_this: string;
  jordan_opened_up: number;
  moments: { turn: number; behavior: string; kind: 'strong' | 'missed'; note: string }[];
};

export async function scoreTranscript(transcript: Line[], focus?: string): Promise<ScoreResult | { error: string }> {
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('mock')) {
    await new Promise((r) => setTimeout(r, 500));
    const ids = ['open_specific', 'ask_first', 'listen', 'steady', 'next_step'];
    return {
      scores: ids.map((id, i) => ({ id, score: (i + transcript.length) % 4, evidence: transcript.find((l) => l.role === 'manager')?.text.slice(0, 60) ?? 'No evidence', why: 'Mock score for UI testing.' })),
      summary: 'You opened with the facts and asked a real question. You moved to a fix before Jordan finished.',
      try_this: 'So you have been carrying Priya\'s work too. What else has been making it hard?',
      jordan_opened_up: 1,
      moments: [{ turn: 1, behavior: 'open_specific', kind: 'strong', note: 'Named dates and deliverables.' }, { turn: 3, behavior: 'listen', kind: 'missed', note: 'Jumped to a fix.' }],
    };
  }
  try {
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ transcript: transcript.map((l) => ({ role: l.role, text: l.text.slice(0, 1200) })).slice(-80), focus }),
    });
    const data = await res.json().catch(() => ({ error: 'bad_response' }));
    if (!res.ok) return { error: data.error || `http_${res.status}` };
    return data as ScoreResult;
  } catch {
    return { error: 'network' };
  }
}
