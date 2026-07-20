// Pure validation / normalisation helpers extracted from api/track.ts so they
// can be unit-tested in isolation without pulling in Upstash or any I/O.

export const MAX_PATH = 200;
export const MAX_NAME = 64;
export const MAX_PROP_VAL = 64;
export const ALLOWED_EVENTS = new Set([
  'share',
  'contact_submit',
  'contact_email',
  'contact_whatsapp',
  'contact_linkedin',
  'playbook_guide_lead',
  'playbook_notify_lead',
  'playbook_guide_download',
]);
export const ALLOWED_NETWORKS = new Set(['linkedin', 'x', 'facebook', 'instagram', 'copy_link']);
export const SELF_HOSTS = new Set(['dsbdigital.biz', 'www.dsbdigital.biz', 'dsb-digital.vercel.app']);
// Bound the cardinality of analytics:z:share_by_slug to known case studies.
// Mirrors the slugs in src/pages/CaseStudy/caseStudies.ts — update both when
// adding a case study.
export const SHARE_SLUGS = new Set(['nexa-welbodi', 'nexa-logistix', 'rms-death-tracker', 'vocal-drift-inspire']);

/** Returns null when the path is invalid; otherwise returns a normalised path. */
export function normalizePath(raw: string): string | null {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return null;
  let p = raw.slice(0, MAX_PATH);
  const q = p.indexOf('?');
  if (q >= 0) p = p.slice(0, q);
  const h = p.indexOf('#');
  if (h >= 0) p = p.slice(0, h);
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p.toLowerCase();
}

/** Returns the external referrer hostname, or null for self-referrers / bad URLs. */
export function normalizeReferrerHost(raw: string | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const host = new URL(raw).hostname.toLowerCase();
    if (!host || SELF_HOSTS.has(host)) return null;
    return host.slice(0, 100);
  } catch {
    return null;
  }
}

/** Returns a validated, trimmed prop value, or null when disallowed. */
export function normalizeProp(raw: unknown, allow?: Set<string>): string | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase().slice(0, MAX_PROP_VAL);
  if (!v) return null;
  if (allow && !allow.has(v)) return null;
  return v;
}
