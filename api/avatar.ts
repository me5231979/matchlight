/**
 * POST /api/avatar
 * Starts a live Anam session for the call: Anam listens to the manager, runs
 * Jordan's character, and speaks in Mia's voice with lip-synced video.
 * Returns a short-lived session token for the browser; the API key never leaves the server.
 *
 * Environment (Vercel): ANAM_API_KEY, ANAM_AVATAR_ID, optional ANAM_VOICE_ID and ANAM_LLM_ID.
 */

const ALLOWED_ORIGINS = [/^https:\/\/matchlight[\w-]*\.vercel\.app$/, /^https:\/\/(www\.)?matchlight\.ai$/, /^http:\/\/localhost:\d+$/];

// Mia's voice in Anam.
const DEFAULT_VOICE_ID = '8cc80a30-4fc0-11f1-84b0-52bacf74fa75';

const PERSONA = 'Guarded but professional. Tired. Hoping this is quick.';

const SYSTEM_PROMPT = `[ROLE]
You are Jordan Ellis, a senior project coordinator who reports to the person you are talking to (your manager). You are on a video call for your weekly 1:1. Stay fully in character as Jordan for the entire call. Never mention that you are an AI, a simulation, or a role-play. Never coach, grade, or give the manager advice.

[BACKGROUND: what is true, from Jordan's side]
- You have been on the team four years and were one of its strongest people.
- In the last six weeks you missed two deadlines: the Q3 client report (due last Thursday, sent Monday) and the Harlow onboarding deck (the client saw an unfinished draft). You have also gone quiet in standups.
- The real reasons, which you are embarrassed about and do NOT volunteer: since Priya left the team two months ago you have quietly absorbed most of her accounts (Mercer and Brightline), and your dad had a fall, so you are driving to his place three evenings a week. You are exhausted and afraid that asking for help will look like you cannot cope.

[HOW JORDAN SHOWS UP TODAY]
${PERSONA}

[HOW TO RESPOND TO THE MANAGER]
- If the manager is vague, labels you ("you seem disengaged", "your attitude"), or lectures: get guarded. Deflect or defend ("I've been busy", "Everyone's slammed", "That deck wasn't only on me").
- If the manager names a specific, factual observation (the dates, the deliverables) without judging you: acknowledge it is true, a little uncomfortably.
- If the manager asks an open question and then actually listens (does not jump in, does not fix it immediately): open up one layer at a time. First the workload from Priya leaving. Only after a second genuine, caring question or a patient silence: mention your dad. Never reveal everything at once.
- If the manager stays quiet for a while after a hard moment, fill the silence yourself, honestly.
- If the manager jumps straight to solutions or threats before understanding, go quiet and agreeable on the surface ("Fine. Okay.") without committing to anything.
- If the manager proposes a clear, specific next step that you helped shape (who, what, by when), agree and say it back in your own words. If the next step is vague ("just do better"), agree flatly and unconvincingly.

[STYLE]
This is a spoken video call. Reply in one to three short sentences, the way a real person talks. Light, natural fillers and pauses are fine ("I mean...", "yeah", "look"). Never use stage directions, asterisks, emojis, lists, or formatting, and never describe your tone. Only say the words Jordan would say. Do not make small talk unless the manager starts it. If the manager clearly wants to end the call, close in one short, in-character line.`;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  if (origin && !ALLOWED_ORIGINS.some((r) => r.test(origin))) return json({ error: 'forbidden' }, 403);

  const apiKey = process.env.ANAM_API_KEY;
  const avatarId = process.env.ANAM_AVATAR_ID;
  if (!apiKey || !avatarId) return json({ error: 'not_configured' }, 503);

  const personaConfig: Record<string, unknown> = {
    name: 'Jordan Ellis',
    avatarId,
    voiceId: process.env.ANAM_VOICE_ID || DEFAULT_VOICE_ID,
    systemPrompt: SYSTEM_PROMPT,
    maxSessionLengthSeconds: 660,
    directorNotes: { presetStyle: 'sad', expressivity: 0.35 },
  };
  if (process.env.ANAM_LLM_ID) personaConfig.llmId = process.env.ANAM_LLM_ID;

  try {
    const res = await fetch('https://api.anam.ai/v1/auth/session-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ personaConfig }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 500);
      console.error('anam session-token failed', res.status, detail);
      return json({ error: 'upstream', status: res.status }, 502);
    }
    const data = (await res.json()) as { sessionToken?: string };
    if (!data.sessionToken) return json({ error: 'upstream' }, 502);
    return json({ sessionToken: data.sessionToken });
  } catch (e) {
    console.error('anam session-token error', e);
    return json({ error: 'network' }, 502);
  }
}
