// Lazy Upstash Redis singleton. Vercel KV / Upstash injects KV_REST_API_URL
// + KV_REST_API_TOKEN automatically when the project is linked to a KV store
// in the Vercel dashboard (Storage tab → Marketplace → Upstash for Redis).
//
// If the env vars are missing (e.g. dev, or KV not provisioned yet), `getKv`
// returns null so endpoints can degrade gracefully — tracking becomes a no-op
// and stats returns an empty payload — instead of 500ing.

import { Redis } from '@upstash/redis';

let cached: Redis | null | undefined;

export function getKv(): Redis | null {
  if (cached !== undefined) return cached;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    cached = null;
    return null;
  }
  cached = new Redis({ url, token });
  return cached;
}
