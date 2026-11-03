/**
 * POST /api/avatar
 * Exchanges the Anam API key for a short-lived session token so the browser can
 * stream Jordan's lip-synced face. The voice and conversation stay on ElevenLabs;
 * Anam only animates the face from that audio (audio passthrough).
 * Needs ANAM_API_KEY and ANAM_AVATAR_ID in the Vercel project's environment variables.
 */

const ALLOWED_ORIGINS = [/^https:\/\/matchlight[\w-]*\.vercel\.app$/, /^https:\/\/(www\.)?matchlight\.ai$/, /^http:\/\/localhost:\d+$/];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export async function POST(request: Request) {
  const origin = request.headers.get('origin') ?? '';
  if (origin && !ALLOWED_ORIGINS.some((r) => r.test(origin))) return json({ error: 'forbidden' }, 403);

  const apiKey = process.env.ANAM_API_KEY;
  const avatarId = process.env.ANAM_AVATAR_ID;
  if (!apiKey || !avatarId) return json({ error: 'not_configured' }, 503);

  try {
    const res = await fetch('https://api.anam.ai/v1/auth/session-token', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        personaConfig: {
          name: 'Jordan Ellis',
          avatarId,
          // Audio comes from the ElevenLabs agent; Anam only renders the face.
          enableAudioPassthrough: true,
          maxSessionLengthSeconds: 660,
        },
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
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
