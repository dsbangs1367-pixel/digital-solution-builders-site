// Public tracking endpoint. Aggregates anonymous pageview + custom-event
// counters into Upstash Redis. Filters bots, anonymizes everything, never
// stores IPs or full UA strings.
//
// Body:
//   { type: 'pageview', path: '/work/nexa-welbodi', referrer?: 'https://...' }
//   { type: 'event', name: 'share' | 'contact_submit' | ..., props?: { network?, slug?, method? } }

// NOTE on .js extensions for .ts files: Vercel's API build uses TypeScript with
// `moduleResolution: nodenext`, which requires explicit extensions on relative
// imports. TS resolves `./foo.js` to `./foo.ts` at compile time; the emitted
// JS gets the extension Node ESM needs at runtime. Don't drop them.
import { getKv } from './_lib/kv.js';
import { isBotRequest } from './_lib/bot.js';
import { parseUserAgent } from './_lib/ua.js';
import { K, FIELD, dateKey } from './_lib/keys.js';
import {
  MAX_NAME,
  ALLOWED_EVENTS,
  ALLOWED_NETWORKS,
  SHARE_SLUGS,
  normalizePath,
  normalizeReferrerHost,
  normalizeProp,
} from './_lib/validators.js';

interface TrackBody {
  type?: string;
  path?: string;
  referrer?: string;
  name?: string;
  props?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ua = String(req.headers['user-agent'] || '');
  if (isBotRequest(ua)) {
    // Silently accept so bots don't get hints that they're filtered.
    return res.status(204).end();
  }

  const kv = getKv();
  if (!kv) {
    // KV not provisioned — accept and drop so the client never breaks.
    return res.status(204).end();
  }

  const body: TrackBody = (req.body && typeof req.body === 'object') ? req.body : {};
  const type = String(body.type || '');
  const date = dateKey();

  if (type === 'pageview') {
    // Explicit string check (avoid `body.path || ''` — falsy values like 0/false
    // would coerce to '' silently instead of producing a clear validation error).
    const path = normalizePath(typeof body.path === 'string' ? body.path : '');
    if (!path) return res.status(400).json({ error: 'Invalid path' });

    const country = String(req.headers['x-vercel-ip-country'] || 'XX').toUpperCase().slice(0, 2);
    const { device, browser } = parseUserAgent(ua);
    const refHost = normalizeReferrerHost(body.referrer);

    const pipe = kv.pipeline();
    pipe.hincrby(K.totals, FIELD.pageviews, 1);
    pipe.hincrby(K.daily(date), FIELD.pageviews, 1);
    pipe.zincrby(K.zsetPaths, 1, path);
    pipe.zincrby(K.zsetCountries, 1, country);
    pipe.zincrby(K.zsetDevices, 1, device);
    pipe.zincrby(K.zsetBrowsers, 1, browser);
    if (refHost) pipe.zincrby(K.zsetReferrers, 1, refHost);
    await pipe.exec();
    return res.status(204).end();
  }

  if (type === 'event') {
    const name = String(body.name || '').trim().toLowerCase().slice(0, MAX_NAME);
    if (!ALLOWED_EVENTS.has(name)) return res.status(400).json({ error: 'Invalid event' });

    const pipe = kv.pipeline();
    pipe.hincrby(K.totals, FIELD.event(name), 1);
    pipe.hincrby(K.daily(date), FIELD.event(name), 1);
    pipe.zincrby(K.zsetEvents, 1, name);

    if (name === 'share') {
      const props = (body.props && typeof body.props === 'object') ? body.props as Record<string, unknown> : {};
      const network = normalizeProp(props.network, ALLOWED_NETWORKS);
      const slug = normalizeProp(props.slug, SHARE_SLUGS);
      if (network) pipe.zincrby(K.zsetShareByNetwork, 1, network);
      if (slug) pipe.zincrby(K.zsetShareBySlug, 1, slug);
    }

    await pipe.exec();
    return res.status(204).end();
  }

  return res.status(400).json({ error: 'Invalid type' });
}
