import { useCallback, useRef, useState } from 'react';
import type { Mood } from '../course/useJordan';

type AnamClient = import('@anam-ai/js-sdk').AnamClient;
type AudioIn = ReturnType<AnamClient['createAgentAudioInputStream']>;

export const AVATAR_VIDEO_ID = 'jordan-live';

/** How each of Jordan's moods maps to the avatar's performance cues. */
const CUE: Record<Mood, 'concerned' | 'sad' | 'distressed' | 'warm'> = {
  neutral: 'concerned',
  hurt: 'sad',
  defensive: 'distressed',
  warm: 'warm',
};

/**
 * Jordan's live, lip-synced face (Anam). ElevenLabs stays the voice and brain:
 * its audio is forwarded here and Anam renders the mouth from it in real time,
 * playing the same audio in sync through the video element.
 * If anything fails, `status` becomes 'off' and the call falls back to the loops.
 */
export function useAvatar() {
  const [status, setStatus] = useState<'off' | 'starting' | 'live'>('off');
  const client = useRef<AnamClient | null>(null);
  const input = useRef<AudioIn | null>(null);
  const rate = useRef(16000);
  const queue = useRef<string[]>([]);
  const ready = useRef(false);
  const cues = useRef(false);

  const flush = () => {
    if (!ready.current) return;
    if (!input.current && client.current) {
      input.current = client.current.createAgentAudioInputStream({ encoding: 'pcm_s16le', sampleRate: rate.current, channels: 1 });
    }
    const s = input.current;
    if (!s) return;
    for (const c of queue.current.splice(0)) s.sendAudioChunk(c);
  };

  /** Resolves true when the face is live, false if it should fall back. */
  const start = useCallback(async (): Promise<boolean> => {
    setStatus('starting');
    ready.current = false;
    input.current = null;
    queue.current = [];
    try {
      const res = await fetch('/api/avatar', { method: 'POST' });
      if (!res.ok) throw new Error(`avatar ${res.status}`);
      const { sessionToken } = (await res.json()) as { sessionToken: string };
      const { createClient, AnamEvent } = await import('@anam-ai/js-sdk');
      const c = createClient(sessionToken, { disableInputAudio: true });
      client.current = c;
      const live = new Promise<boolean>((resolve) => {
        const t = window.setTimeout(() => resolve(false), 12000);
        c.addListener(AnamEvent.SESSION_READY, () => {
          window.clearTimeout(t);
          ready.current = true;
          flush();
          resolve(true);
        });
        c.addListener(AnamEvent.DATA_CHANNEL_OPEN, () => (cues.current = true));
        c.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          cues.current = false;
          ready.current = false;
          setStatus('off');
        });
      });
      await c.streamToVideoElement(AVATAR_VIDEO_ID);
      const ok = await live;
      if (!ok) throw new Error('avatar timeout');
      setStatus('live');
      return true;
    } catch (e) {
      console.warn('Live avatar unavailable, using video loops.', e);
      void client.current?.stopStreaming().catch(() => {});
      client.current = null;
      setStatus('off');
      return false;
    }
  }, []);

  /** A chunk of Jordan's voice from ElevenLabs (base64 PCM16). */
  const feed = useCallback((b64: string, sampleRate?: number) => {
    if (sampleRate) rate.current = sampleRate;
    queue.current.push(b64);
    flush();
  }, []);

  /** Jordan finished a turn. */
  const end = useCallback(() => {
    try {
      input.current?.endSequence();
    } catch {
      /* stream closed */
    }
  }, []);

  /** The manager cut in: stop Jordan's mouth mid-sentence. */
  const interrupt = useCallback(() => {
    queue.current = [];
    try {
      client.current?.interruptPersona();
      input.current?.endSequence();
    } catch {
      /* stream closed */
    }
  }, []);

  const mood = useCallback((m: Mood) => {
    if (!cues.current) return;
    try {
      client.current?.sendDirectorNoteCue(CUE[m]);
    } catch {
      /* cues need a Cara 4 avatar; harmless otherwise */
    }
  }, []);

  const stop = useCallback(async () => {
    ready.current = false;
    input.current = null;
    const c = client.current;
    client.current = null;
    setStatus('off');
    try {
      await c?.stopStreaming();
    } catch {
      /* already closed */
    }
  }, []);

  return { status, start, feed, end, interrupt, mood, stop };
}
