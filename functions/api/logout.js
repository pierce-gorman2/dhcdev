import { sessionCookieHeader, jsonResponse } from '../_lib/auth.js';

export async function onRequestPost({ request }) {
  const secure = new URL(request.url).protocol === 'https:';
  return jsonResponse({ isAdmin: false }, 200, {
    'Set-Cookie': sessionCookieHeader('', { clear: true, secure }),
  });
}
