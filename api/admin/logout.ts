// Admin logout. Clears the client-side cookie AND writes a revocation epoch
// into KV so any previously-issued cookie (e.g. on another device) is rejected
// by /api/admin/stats on its next request. Single-user model: one logout
// invalidates every prior session, anywhere.

import { clearAdminCookieHeader } from '../_lib/auth.js';
import { getKv } from '../_lib/kv.js';
import { K } from '../_lib/keys.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  // Best-effort: if KV isn't reachable, still clear the cookie. Logout must
  // never error from the client's perspective.
  const kv = getKv();
  if (kv) {
    try {
      await kv.set(K.authRevokeBeforeIat, Math.floor(Date.now() / 1000));
    } catch (err) {
      console.error('admin/logout: failed to write revoke epoch', err);
    }
  }
  res.setHeader('Set-Cookie', clearAdminCookieHeader());
  return res.status(200).json({ ok: true });
}
