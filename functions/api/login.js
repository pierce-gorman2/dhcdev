import { createSessionToken, sessionCookieHeader, jsonResponse } from '../_lib/auth.js';

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const passphrase = (body.passphrase || '').trim();

  if (!env.ADMIN_PASSPHRASE) {
    return jsonResponse({ error: 'Server is not configured with an admin passphrase.' }, 500);
  }

  if (!passphrase || passphrase !== env.ADMIN_PASSPHRASE) {
    return jsonResponse({ error: 'Incorrect passphrase.' }, 401);
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  const secure = new URL(request.url).protocol === 'https:';
  return jsonResponse({ isAdmin: true }, 200, {
    'Set-Cookie': sessionCookieHeader(token, { secure }),
  });
}
