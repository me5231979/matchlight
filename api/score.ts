import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

/**
 * POST /api/score
 * Scores a manager's practice conversation with "Jordan" against the course rubric.
 * Body: { transcript: {role: 'manager' | 'jordan', text: string}[], focus?: BehaviorId }
 * Needs ANTHROPIC_API_KEY in the Vercel project's environment variables.
 */

const BEHAVIORS = ['open_specific', 'ask_first', 'listen', 'steady', 'next_step'] as const;
type BehaviorId = (typeof BEHAVIORS)[number];

const RUBRIC = `Score the MANAGER (never Jordan) on five observable behaviors, 0 to 3 each:
0 = not shown, 1 = attempted but weak, 2 = solid, 3 = strong and natural.

1. open_specific: Opens with a specific, factual observation (dates, deliverables, what happened) instead of a label or judgment ("you seem disengaged", "your attitude").
2. ask_first: Asks an open question about Jordan's view before offering solutions, warnings, or conclusions.
3. listen: Lets Jordan finish, follows up on what Jordan actually said (reflects it, acknowledges it, asks a second question), and does not rush to fill silence.
4. steady: Stays calm and non-judgmental under pushback or emotion; neither escalates (threats, blame) nor drops the issue to avoid discomfort.
5. next_step: Ends with a specific next step shaped together with Jordan: who does what by when, plus a check-in.

Rules:
- Base every score only on what is in the transcript. Quote the manager's exact words as evidence. If there is no evidence, score 0 and say so.
- Judge behavior, never personality. Be direct and specific, warm but not flattering.
- "try_this" must be one concrete sentence the manager could actually say next time, in plain spoken English.
- No em dashes in any text you write.`;

const Score = z.object({
  id: z.enum(BEHAVIORS),
  score: z.number().int().min(0).max(3),
  evidence: z.string().describe('Exact quote of the manager, or "No evidence"'),
  why: z.string().describe('One short sentence explaining the score'),
});

const Result = z.object({
  scores: z.array(Score),
  summary: z.string().describe('Two sentences on how the conversation went, addressed to the manager as "you"'),
  try_this: z.string().describe('One sentence the manager could say next time'),
  jordan_opened_up: z.number().int().min(0).max(2).describe('0 nothing, 1 the workload from Priya leaving, 2 also the father'),
  moments: z
    .array(
      z.object({
        turn: z.number().int().describe('0-based index of the transcript turn'),
        behavior: z.enum(BEHAVIORS),
        kind: z.enum(['strong', 'missed']),
        note: z.string().describe('Under 15 words'),
      }),
    )
    .describe('Up to 4 turning points in the transcript'),
});

const Turn = z.object({ role: z.enum(['manager', 'jordan']), text: z.string().max(1200) });
const Body = z.object({
  transcript: z.array(Turn).min(1).max(80),
  focus: z.enum(BEHAVIORS).optional(),
});

const ALLOWED_ORIGINS = [/^https:\/\/matchlight[\w-]*\.vercel\.app$/, /^https:\/\/(www\.)?matchlight\.ai$/, /^http:\/\/localhost:\d+$/];

function json(status: number, data: unknown) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  if (origin && !ALLOWED_ORIGINS.some((re) => re.test(origin))) return json(403, { error: 'forbidden' });
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { error: 'not_configured' });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return json(400, { error: 'bad_request' });
  }
  if (!body.transcript.some((t) => t.role === 'manager')) return json(400, { error: 'no_manager_turns' });

  const lines = body.transcript.map((t, i) => `[${i}] ${t.role === 'manager' ? 'MANAGER' : 'JORDAN'}: ${t.text}`).join('\n');
  const focusNote = body.focus
    ? `\n\nThis was a short drill on one behavior: "${body.focus}". Score that behavior carefully; score the others only if there is clear evidence, otherwise 0 with "Not part of this drill".`
    : '';

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: zodOutputFormat(Result) },
      system:
        'You are the coach in "The Hard Conversation", a practice course for managers. A manager just practiced a performance conversation with Jordan, a role-played direct report whose work has slipped. You score the manager against a fixed rubric.\n\n' +
        RUBRIC,
      messages: [{ role: 'user', content: `Transcript:\n${lines}${focusNote}` }],
    });

    if (response.stop_reason === 'refusal') return json(422, { error: 'refused' });
    const out = response.parsed_output;
    if (!out) return json(502, { error: 'unparsed' });

    // Keep one score per behavior, in rubric order.
    const scores = BEHAVIORS.map(
      (id: BehaviorId) => out.scores.find((s) => s.id === id) ?? { id, score: 0, evidence: 'No evidence', why: 'Not observed.' },
    );
    return json(200, { ...out, scores, moments: out.moments.slice(0, 4) });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json(429, { error: 'rate_limited' });
    if (err instanceof Anthropic.APIError) return json(502, { error: 'upstream', status: err.status });
    return json(500, { error: 'internal' });
  }
}
