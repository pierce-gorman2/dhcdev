// Minimal signed-cookie session helper for the single-passphrase admin login.
// No user accounts: a correct passphrase just gets you a signed "admin" cookie.

const COOKIE_NAME = 'dhc_session';
const SESSION_DAYS = 30;

function toBase64Url(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const str = atob(padded);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toBase64Url(new Uint8Array(sig));
}

export async function createSessionToken(secret) {
  const payload = JSON.stringify({
    role: 'admin',
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
  const encodedPayload = toBase64Url(new TextEncoder().encode(payload));
  const signature = await hmac(secret, encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(secret, token) {
  if (!token || !token.includes('.')) return false;
  const [encodedPayload, signature] = token.split('.');
  const expected = await hmac(secret, encodedPayload);
  if (expected !== signature) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encodedPayload)));
    return payload.role === 'admin' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookieHeader(token, { clear = false, secure = true } = {}) {
  const maxAge = clear ? 0 : SESSION_DAYS * 24 * 60 * 60;
  const value = clear ? '' : token;
  const secureAttr = secure ? ' Secure;' : '';
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly;${secureAttr} SameSite=Strict; Max-Age=${maxAge}`;
}

export async function isAdminRequest(request, env) {
  const token = readCookie(request, COOKIE_NAME);
  return verifySessionToken(env.SESSION_SECRET, token);
}

export function requireAdmin(handler) {
  return async (context) => {
    const admin = await isAdminRequest(context.request, context.env);
    if (!admin) {
      return jsonResponse({ error: 'Admin login required.' }, 401);
    }
    return handler(context);
  };
}

export function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

export { COOKIE_NAME };
