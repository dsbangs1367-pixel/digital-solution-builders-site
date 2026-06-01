// Centralized Upstash Redis key naming for the visit-analytics tracker.
// Aggregate-only design — no per-visit log, no PII. Each pageview/event
// is just a counter increment on a handful of keys.
//
// - HASH `analytics:totals`        — lifetime counters keyed by field
// - HASH `analytics:daily:<date>`  — per-day counters keyed by field
// - ZSET `analytics:z:*`           — ranked dimensions (paths, refs, etc.)

export const K = {
  totals: 'analytics:totals',
  daily: (date: string) => `analytics:daily:${date}`,
  zsetPaths: 'analytics:z:paths',
  zsetReferrers: 'analytics:z:referrers',
  zsetCountries: 'analytics:z:countries',
  zsetDevices: 'analytics:z:devices',
  zsetBrowsers: 'analytics:z:browsers',
  zsetEvents: 'analytics:z:events',
  zsetShareByNetwork: 'analytics:z:share_by_network',
  zsetShareBySlug: 'analytics:z:share_by_slug',
  // Revocation epoch — any admin cookie issued at or before this iat is rejected
  // by verifyCookie (server-side logout-all kill switch).
  authRevokeBeforeIat: 'auth:revoke_before_iat',
} as const;

export const FIELD = {
  pageviews: 'pageviews',
  event: (name: string) => `event:${name}`,
} as const;

/** ISO date in UTC (YYYY-MM-DD) used as the bucket for daily counters. */
export function dateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** Inclusive list of the last `days` UTC dates, oldest first. */
export function lastNDates(days: number, now: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    out.push(dateKey(d));
  }
  return out;
}
