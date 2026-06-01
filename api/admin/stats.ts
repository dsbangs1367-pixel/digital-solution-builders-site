// Returns the full analytics payload for the admin dashboard. Cookie-gated.
//
// Response shape:
//   {
//     totals: { pageviews, events: { name: count } },
//     daily:  [{ date, pageviews, events: { name: count } }],   // last 30 days, oldest first
//     topPaths, topReferrers, topCountries: [{ key, count }],
//     devices, browsers: [{ key, count }],
//     topEvents, shareByNetwork, shareBySlug: [{ key, count }],
//     generatedAt: ISO string
//   }

import { getKv } from '../_lib/kv';
import { parseCookies, verifyCookie, COOKIE_NAME } from '../_lib/auth';
import { K, FIELD, dateKey, lastNDates } from '../_lib/keys';

async function loadRevokeBeforeIat(kv: ReturnType<typeof getKv>): Promise<number> {
  if (!kv) return 0;
  try {
    const raw = await kv.get(K.authRevokeBeforeIat);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

const TOP_N = 10;
const TREND_DAYS = 30;

type Pair = { key: string; count: number };

function pairsFromZset(rows: (string | number)[]): Pair[] {
  // Upstash returns flat array: [member1, score1, member2, score2, ...]
  const out: Pair[] = [];
  for (let i = 0; i + 1 < rows.length; i += 2) {
    out.push({ key: String(rows[i]), count: Number(rows[i + 1]) || 0 });
  }
  return out;
}

function eventsFromHash(hash: Record<string, string | number | null> | null | undefined): {
  pageviews: number;
  events: Record<string, number>;
} {
  const events: Record<string, number> = {};
  let pageviews = 0;
  if (!hash) return { pageviews, events };
  for (const [k, v] of Object.entries(hash)) {
    const n = Number(v) || 0;
    if (k === FIELD.pageviews) pageviews = n;
    else if (k.startsWith('event:')) events[k.slice('event:'.length)] = n;
  }
  return { pageviews, events };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    console.error('admin/stats: AUTH_SECRET not set');
    return res.status(503).json({ error: 'Admin auth not configured' });
  }

  const kv = getKv();
  const minIat = await loadRevokeBeforeIat(kv);

  const cookies = parseCookies(String(req.headers.cookie || ''));
  if (!verifyCookie(cookies[COOKIE_NAME], authSecret, new Date(), minIat)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!kv) {
    return res.status(200).json({
      totals: { pageviews: 0, events: {} },
      daily: [],
      topPaths: [],
      topReferrers: [],
      topCountries: [],
      devices: [],
      browsers: [],
      topEvents: [],
      shareByNetwork: [],
      shareBySlug: [],
      generatedAt: new Date().toISOString(),
      kvProvisioned: false,
    });
  }

  const dates = lastNDates(TREND_DAYS);

  const pipe = kv.pipeline();
  pipe.hgetall(K.totals);
  for (const d of dates) pipe.hgetall(K.daily(d));
  pipe.zrange(K.zsetPaths, 0, TOP_N - 1, { rev: true, withScores: true });
  pipe.zrange(K.zsetReferrers, 0, TOP_N - 1, { rev: true, withScores: true });
  pipe.zrange(K.zsetCountries, 0, TOP_N - 1, { rev: true, withScores: true });
  pipe.zrange(K.zsetDevices, 0, -1, { rev: true, withScores: true });
  pipe.zrange(K.zsetBrowsers, 0, TOP_N - 1, { rev: true, withScores: true });
  pipe.zrange(K.zsetEvents, 0, -1, { rev: true, withScores: true });
  pipe.zrange(K.zsetShareByNetwork, 0, -1, { rev: true, withScores: true });
  pipe.zrange(K.zsetShareBySlug, 0, -1, { rev: true, withScores: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = (await pipe.exec()) as any[];
  let i = 0;
  const totalsHash = results[i++] as Record<string, string | number | null> | null;
  const dailyHashes = dates.map(() => results[i++] as Record<string, string | number | null> | null);
  const topPaths = pairsFromZset(results[i++] as (string | number)[]);
  const topReferrers = pairsFromZset(results[i++] as (string | number)[]);
  const topCountries = pairsFromZset(results[i++] as (string | number)[]);
  const devices = pairsFromZset(results[i++] as (string | number)[]);
  const browsers = pairsFromZset(results[i++] as (string | number)[]);
  const topEvents = pairsFromZset(results[i++] as (string | number)[]);
  const shareByNetwork = pairsFromZset(results[i++] as (string | number)[]);
  const shareBySlug = pairsFromZset(results[i++] as (string | number)[]);

  const totals = eventsFromHash(totalsHash);
  const daily = dates.map((date, idx) => ({ date, ...eventsFromHash(dailyHashes[idx]) }));

  return res.status(200).json({
    totals,
    daily,
    topPaths,
    topReferrers,
    topCountries,
    devices,
    browsers,
    topEvents,
    shareByNetwork,
    shareBySlug,
    generatedAt: new Date().toISOString(),
    today: dateKey(),
    kvProvisioned: true,
  });
}
