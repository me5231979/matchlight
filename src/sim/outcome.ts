import type { Line, ScoreResult } from '../course/useJordan';
import type { Tier } from './world';

export type Signals = { priya: boolean; dad: boolean; plan: boolean; managerTurns: number };

/** What surfaced in the room, read straight from the transcript. */
export function readSignals(lines: Line[]): Signals {
  const jordan = lines.filter((l) => l.role === 'jordan').map((l) => l.text.toLowerCase()).join(' ');
  const you = lines.filter((l) => l.role === 'manager').map((l) => l.text.toLowerCase()).join(' ');
  const all = `${jordan} ${you}`;
  return {
    priya: /priya|two jobs|her accounts|her work|covering/.test(jordan),
    dad: /\bdad\b|father|\bfall\b|fell|parent|hospital|care/.test(jordan),
    plan: /(monday|tuesday|wednesday|thursday|friday|tomorrow|next week|by \w+day)/.test(all) && /(check in|check-in|catch up|follow up|meet|i'll|i will|you'll|you will)/.test(all),
    managerTurns: lines.filter((l) => l.role === 'manager').length,
  };
}

/**
 * Two weeks later. The outcome follows from what happened in the room:
 * did Jordan open up, and did you leave with a real plan?
 */
export function decideTier(lines: Line[], result: ScoreResult | null): Tier {
  const sig = readSignals(lines);
  if (result) {
    const by = (id: string) => result.scores.find((s) => s.id === id)?.score ?? 0;
    const avg = result.scores.reduce((a, s) => a + s.score, 0) / Math.max(1, result.scores.length);
    if (result.jordan_opened_up >= 2 && by('next_step') >= 2) return 'lit';
    if (result.jordan_opened_up >= 1 || avg >= 1.5) return 'flicker';
    return 'out';
  }
  if (sig.priya && sig.dad && sig.plan) return 'lit';
  if (sig.priya || sig.dad || (sig.plan && sig.managerTurns >= 4)) return 'flicker';
  return 'out';
}

export const TIER_COPY: Record<Tier, { headline: string; line: string }> = {
  lit: {
    headline: 'Jordan stayed. And told you why.',
    line: 'You found the real problem in one conversation, and agreed a plan Jordan believed in. The client noticed before you said a word.',
  },
  flicker: {
    headline: 'The work got done. The problem did not.',
    line: 'Jordan delivered, at 1 AM, then went quiet again. Some of the story came out. Not enough of it to change anything.',
  },
  out: {
    headline: 'Jordan resigned.',
    line: 'One of your strongest people left without ever telling you what was wrong. Two weeks earlier, you had thirty minutes to find out.',
  },
};
