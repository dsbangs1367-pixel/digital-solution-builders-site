// Admin auth: HMAC-signed cookie. No JWT lib — payload is just an issued-at
// epoch (seconds), signed with AUTH_SECRET. Verifies signature with constant
// time comparison and rejects cookies older than COOKIE_MAX_AGE_S or older
// than an optional revocation epoch (logout-all).

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'dsb_admin';
export const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

// Tolerance for clock skew between cookie issuer and verifier. Vercel functions
// can run on different hosts with slightly drifted clocks; 5s avoids spurious
// rejects without meaningfully extending forgery windows.
const FUTURE_SKEW_S = 5;

// Per-process random key for safeEqual's HMAC compare (see below).
const SAFE_EQUAL_KEY = randomBytes(32);

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/** Builds the signed cookie value: `<issuedAtSeconds>.<hexSig>`. */
export function issueCookie(secret: string, now: Date = new Date()): string {
  const iat = Math.floor(now.getTime() / 1000);
  const payload = String(iat);
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * True when the cookie is valid, not expired, and not revoked.
 * `minIat` (optional) — reject any cookie issued at or before this epoch.
 * Use it to implement a server-side revocation/logout-all kill switch.
 */
export function verifyCookie(
  value: string | undefined,
  secret: string,
  now: Date = new Date(),
  minIat: number = 0,
): boolean {
  if (!value || typeof value !== 'string') return false;
  const idx = value.indexOf('.');
  if (idx <= 0 || idx >= value.length - 1) return false;
  const payload = value.slice(0, idx);
  const sig = value.slice(idx + 1);
  if (!/^\d+$/.test(payload) || !/^[0-9a-f]+$/.test(sig)) return false;

  const expected = sign(payload, secret);
  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(sig, 'hex');
    b = Buffer.from(expected, 'hex');
  } catch {
    return false;
  }
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  const iat = Number(payload);
  const nowS = Math.floor(now.getTime() / 1000);
  if (iat > nowS + FUTURE_SKEW_S) return false;
  if (nowS - iat > COOKIE_MAX_AGE_S) return false;
  if (minIat > 0 && iat <= minIat) return false;
  return true;
}

/**
 * Constant-time compare with NO length leak. We HMAC both inputs with a
 * process-lifetime random key so the timingSafeEqual call sees fixed-length
 * (32-byte) buffers regardless of input length. A naive direct compare would
 * early-return on length mismatch, letting a timing attacker enumerate the
 * length of ADMIN_PASSWORD.
 */
export function safeEqual(a: string, b: string): boolean {
  const ah = createHmac('sha256', SAFE_EQUAL_KEY).update(a, 'utf8').digest();
  const bh = createHmac('sha256', SAFE_EQUAL_KEY).update(b, 'utf8').digest();
  return timingSafeEqual(ah, bh);
}

/** Parse a request's Cookie header into a key/value map. */
export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

// SameSite=Strict — admin is a private surface, no legitimate need for the
// cookie to ride along on cross-site navigations or POSTs (defeats CSRF
// forced-logout / login-CSRF without any UX cost).
const COOKIE_BASE = `Path=/; HttpOnly; Secure; SameSite=Strict`;

/** Set-Cookie header value for a fresh admin session. */
export function adminCookieHeader(value: string, maxAgeS: number = COOKIE_MAX_AGE_S): string {
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${maxAgeS}; ${COOKIE_BASE}`;
}

/** Set-Cookie header value that clears the admin session. */
export function clearAdminCookieHeader(): string {
  return `${COOKIE_NAME}=; Max-Age=0; ${COOKIE_BASE}`;
}
