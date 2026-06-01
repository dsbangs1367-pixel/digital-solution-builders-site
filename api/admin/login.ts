// Admin login. Constant-time password compare against ADMIN_PASSWORD env var;
// on success, sets a 30-day HMAC-signed cookie signed with AUTH_SECRET.

import { adminCookieHeader, issueCookie, safeEqual } from '../_lib/auth.js';

// Fixed delay on failures to take rate per-IP brute-forcing off the table.
// (Combined with a long random ADMIN_PASSWORD, this is enough for a personal
// portfolio. KV-backed lockouts are noted in the README as a follow-up.)
const FAIL_DELAY_MS = 600;

interface LoginBody {
  password?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;
  if (!adminPassword || !authSecret) {
    console.error('admin/login: ADMIN_PASSWORD or AUTH_SECRET not set');
    return res.status(503).json({ error: 'Admin auth not configured' });
  }

  const body: LoginBody = (req.body && typeof req.body === 'object') ? req.body : {};
  const supplied = String(body.password || '');

  if (!safeEqual(supplied, adminPassword)) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS));
    return res.status(401).json({ error: 'Invalid password' });
  }

  const cookie = issueCookie(authSecret);
  res.setHeader('Set-Cookie', adminCookieHeader(cookie));
  return res.status(200).json({ ok: true });
}
