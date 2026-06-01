// Lazy Upstash Redis singleton. The Upstash for Redis Vercel integration
// injects env vars automatically — by default with a `STORAGE_` prefix (the
// integration requires a non-empty prefix), but un-prefixed names are also
// accepted so local dev / .env files can use the shorter form.
//
// If neither pair is present, `getKv` returns null so endpoints degrade
// gracefully (track becomes a no-op, stats returns an empty payload).

import { Redis } from '@upstash/redis';

let cached: Redis | null | undefined;

function envCreds(): { url?: string; token?: string } {
  return {
    url: process.env.STORAGE_KV_REST_API_URL ?? process.env.KV_REST_API_URL,
    token: process.env.STORAGE_KV_REST_API_TOKEN ?? process.env.KV_REST_API_TOKEN,
  };
}

export function getKv(): Redis | null {
  if (cached !== undefined) return cached;
  const { url, token } = envCreds();
  if (!url || !token) {
    cached = null;
    return null;
  }
  cached = new Redis({ url, token });
  return cached;
}
