import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

/**
 * /api/quote-intake
 * Turns meeting notes, a transcript or an email into quote builder fields.
 *
 * GET  -> { gate: boolean }   whether the quote builder asks for an access code
 * POST { text?: string, fields?: object }  header x-quote-code: <QUOTE_ACCESS_CODE>
 *      -> { fields, evidence, open_questions, link }
 *
 * `link` opens the quote builder pre-filled, so any feed (Zapier, Make, a CRM,
 * Gemini notes in Google Meet) can hand a ready quote to the team.
 * Environment: ANTHROPIC_API_KEY (for text), QUOTE_ACCESS_CODE (recommended).
 */

const FEATURE_IDS = ['discovery', 'world', 'avatar', 'voice', 'coach', 'consequence', 'drills', 'brand', 'scorm', 'xapi', 'custom'] as const;

const Fields = z.object({
  client: z.string().nullable().describe('Client company name'),
  project: z.string().nullable().describe('Short project or program name'),
  delivery: z.enum(['scorm', 'scormai', 'hosted']).nullable().describe('scorm = package in their LMS with no AI; scormai = in their LMS but uses AI; hosted = we host it on the web'),
  ownership: z.enum(['managed', 'handover']).nullable().describe('managed = Matchlight runs it on our accounts; handover = client provides their own API keys and gets the source'),
  scenarios: z.number().int().min(0).max(20).nullable(),
  features: z
    .object(Object.fromEntries(FEATURE_IDS.map((id) => [id, z.boolean().nullable()])) as Record<(typeof FEATURE_IDS)[number], z.ZodNullable<z.ZodBoolean>>)
    .describe(
      'discovery: learning design; world: simulated workplace (email, chat, calendar); avatar: live video character; voice: talk out loud with the character; coach: AI scoring and feedback; consequence: outcomes and debrief; drills: practice drills and harder variants; brand: client branding; scorm: SCORM packaging; xapi: xAPI/LRS reporting; custom: custom character face or voice. null when not discussed.',
    ),
  learners: z.number().int().min(0).nullable(),
  rounds: z.number().min(0).nullable().describe('AI practice rounds per learner per month'),
  minutes: z.number().min(0).nullable().describe('Minutes per practice round'),
  months: z.number().int().min(1).max(12).nullable().describe('Active months per year'),
  maint: z.enum(['none', 'essentials', 'standard', 'premium']).nullable(),
  analytics: z.enum(['none', 'basic', 'lrs']).nullable(),
  billing: z.enum(['annual', 'monthly']).nullable(),
});

const Result = z.object({
  fields: Fields,
  evidence: z.array(z.object({ field: z.string(), quote: z.string().describe('Short exact quote from the notes') })).describe('Why each filled field was set'),
  open_questions: z.array(z.string()).describe('Things to ask the client that the notes do not answer, in plain language, at most 6'),
});

const SYSTEM = `You fill in a quote builder for Matchlight, a studio that builds AI-powered workplace simulations (a simulated desk, a live video or voice conversation with an AI character, AI coaching, consequences and a debrief).
Read the meeting notes, transcript or email and set only what the text supports. Use null for anything not discussed; never guess numbers.
Infer delivery: "LMS", "SCORM", "Cornerstone", "Workday Learning" means scorm or scormai (scormai if they want AI conversation or coaching inside it). "Link", "web", "we host" means hosted.
Infer ownership: "their own keys", "their accounts", "hand over the code", "own the source" means handover.
If the text only names a client and a topic, fill those and list the open questions.
Quotes in evidence must be copied exactly from the text. No em dashes.`;

const ALLOWED_ORIGINS = [/^https:\/\/matchlight[\w-]*\.vercel\.app$/, /^https:\/\/(www\.)?matchlight\.ai$/, /^http:\/\/localhost:\d+$/, /^https:\/\/meet\.google\.com$/];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function authorized(request: Request) {
  const code = process.env.QUOTE_ACCESS_CODE;
  if (!code) return true;
  return request.headers.get('x-quote-code') === code;
}

function link(request: Request, fields: unknown) {
  const base = new URL(request.url);
  const enc = Buffer.from(JSON.stringify(fields), 'utf8').toString('base64url');
  return `${base.origin}/quote#prefill=${enc}`;
}

export async function GET() {
  return json({ gate: !!process.env.QUOTE_ACCESS_CODE });
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  if (origin && !ALLOWED_ORIGINS.some((r) => r.test(origin))) return json({ error: 'forbidden' }, 403);
  if (!authorized(request)) return json({ error: 'unauthorized' }, 401);

  const body = (await request.json().catch(() => null)) as { text?: unknown; fields?: unknown; check?: unknown } | null;
  if (!body) return json({ error: 'bad_request' }, 400);
  if (body.check) return json({ ok: true });

  // Structured fields from a feed: validate and return a prefill link, no AI needed.
  if (body.fields && !body.text) {
    const parsed = Fields.partial().safeParse(body.fields);
    if (!parsed.success) return json({ error: 'invalid_fields', detail: parsed.error.issues.slice(0, 5) }, 400);
    return json({ fields: parsed.data, evidence: [], open_questions: [], link: link(request, parsed.data) });
  }

  const text = typeof body.text === 'string' ? body.text.slice(0, 60000).trim() : '';
  if (text.length < 20) return json({ error: 'text_too_short' }, 400);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503);

  try {
    const client = new Anthropic();
    const res = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 3000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: zodOutputFormat(Result) },
      system: SYSTEM,
      messages: [{ role: 'user', content: `Notes:\n\n${text}` }],
    });
    const out = res.parsed_output as z.infer<typeof Result> | null;
    if (!out) return json({ error: 'no_result' }, 502);
    return json({ ...out, link: link(request, out.fields) });
  } catch (e) {
    const status = (e as { status?: number }).status;
    console.error('quote-intake failed', status, e);
    return json({ error: status === 429 ? 'rate_limited' : 'failed' }, status === 429 ? 429 : 502);
  }
}
