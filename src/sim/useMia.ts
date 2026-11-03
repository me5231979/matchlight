import { useCallback, useEffect, useRef, useState } from 'react';
import type { CallStatus, Line } from '../course/useJordan';

type AnamClient = import('@anam-ai/js-sdk').AnamClient;

export const AVATAR_VIDEO_ID = 'jordan-live';
type StartOpts = { firstLine?: string; persona?: string; mode?: 'full' | 'drill'; context?: string; endAfterReply?: boolean };

export const FIRST_LINE = 'Hey. Sorry, I was just finishing something. You wanted to talk?';

/**
 * The live call with Jordan, played by Mia (Anam). Anam hears the manager through
 * the mic, runs Jordan's character, and speaks in Mia's voice with lip-synced video
 * in the element with id AVATAR_VIDEO_ID. Same shape as useJordan, so the call
 * screen and the debrief work with either.
 */
export function useMia() {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [lines, setLines] = useState<Line[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [video, setVideo] = useState(false);
  /** Why the live video could not start (shown in the call so it can be fixed). */
  const [why, setWhy] = useState('');
  const client = useRef<AnamClient | null>(null);
  const opts = useRef<StartOpts>({});
  const timer = useRef<number>();
  const quiet = useRef<number>();

  const stop = useCallback(async () => {
    window.clearInterval(timer.current);
    const c = client.current;
    client.current = null;
    setSpeaking(false);
    setVideo(false);
    setStatus((s) => (s === 'error' ? s : 'ended'));
    try {
      await c?.stopStreaming();
    } catch {
      /* already closed */
    }
  }, []);

  /** Resolves true once Mia is live; false means use the fallback. */
  const start = useCallback(
    async (limit: number, o: StartOpts = {}): Promise<boolean> => {
      const firstLine = o.firstLine || FIRST_LINE;
      opts.current = o;
      setStatus('connecting');
      setLines([]);
      setError('');
      setElapsed(0);
      try {
        setWhy('');
        const res = await fetch('/api/avatar', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ persona: o.persona, mode: o.mode, context: o.context }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string; status?: number; detail?: string };
          throw new Error(`token: ${body.error ?? res.status}${body.status ? ` ${body.status}` : ''}${body.detail ? ` ${body.detail}` : ''}`);
        }
        const { sessionToken } = (await res.json()) as { sessionToken: string };
        const { createClient, AnamEvent } = await import('@anam-ai/js-sdk');
        const c = createClient(sessionToken);
        client.current = c;

        c.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (msgs) => {
          const mapped: Line[] = msgs
            .filter((m) => m.content.trim())
            .map((m) => ({ role: m.role === 'user' ? 'manager' : 'jordan', text: m.content.trim() }));
          // Make sure Jordan's opening line is in the transcript for scoring.
          if (!mapped.length || mapped[0].text !== firstLine) mapped.unshift({ role: 'jordan', text: firstLine });
          setLines(mapped);
        });
        c.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (e) => {
          if (e.role === 'user') return;
          window.clearTimeout(quiet.current);
          if (e.endOfSpeech || e.interrupted) quiet.current = window.setTimeout(() => setSpeaking(false), 700);
          else setSpeaking(true);
        });
        c.addListener(AnamEvent.VIDEO_PLAY_STARTED, () => setVideo(true));
        c.addListener(AnamEvent.MIC_PERMISSION_DENIED, () => setError('Microphone access was blocked. Allow the microphone, or rejoin with chat.'));
        c.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          window.clearInterval(timer.current);
          client.current = null;
          setSpeaking(false);
          setVideo(false);
          setStatus((s) => (s === 'connecting' ? 'error' : s === 'error' ? s : 'ended'));
        });

        // Live as soon as the session is ready or Mia's video is playing.
        const ready = new Promise<boolean>((resolve) => {
          const t = window.setTimeout(() => resolve(false), 20000);
          const ok = () => (window.clearTimeout(t), resolve(true));
          c.addListener(AnamEvent.SESSION_READY, ok);
          c.addListener(AnamEvent.VIDEO_PLAY_STARTED, ok);
        });
        c.addListener(AnamEvent.SERVER_WARNING, (m) => console.warn('Anam:', m));
        await c.streamToVideoElement(AVATAR_VIDEO_ID);
        if (!(await ready)) throw new Error('timeout: no session ready or video within 20s');

        setLines([{ role: 'jordan', text: firstLine }]);
        setStatus('live');
        void c.talk(firstLine).catch(() => {});
        const t0 = Date.now();
        timer.current = window.setInterval(() => {
          const secs = Math.floor((Date.now() - t0) / 1000);
          setElapsed(secs);
          if (secs >= limit) void stop();
        }, 250);
        return true;
      } catch (e) {
        console.warn('Mia unavailable, falling back to the ElevenLabs voice.', e);
        const cause = (e as { details?: { cause?: unknown } })?.details?.cause;
        setWhy(`${e instanceof Error ? e.message : String(e)}${cause ? `: ${typeof cause === 'string' ? cause : JSON.stringify(cause)}` : ''}`);
        const c = client.current;
        client.current = null;
        void c?.stopStreaming().catch(() => {});
        setStatus('idle');
        setVideo(false);
        return false;
      }
    },
    [stop],
  );

  // Drills: once Jordan has answered the manager and finished speaking, close the round.
  useEffect(() => {
    if (!opts.current.endAfterReply || status !== 'live' || speaking) return;
    const last = lines[lines.length - 1];
    if (last?.role !== 'jordan' || !lines.some((l) => l.role === 'manager')) return;
    const id = window.setTimeout(() => void stop(), 1200);
    return () => window.clearTimeout(id);
  }, [lines, speaking, status, stop]);

  const mute = useCallback((on: boolean) => {
    try {
      if (on) client.current?.muteInputAudio();
      else client.current?.unmuteInputAudio();
    } catch {
      /* not connected */
    }
  }, []);

  useEffect(
    () => () => {
      void stop();
    },
    [stop],
  );

  return { status, lines, speaking, error, elapsed, video, why, start, stop, mute };
}
