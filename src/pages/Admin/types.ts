// Mirrors the JSON shape returned by /api/admin/stats. Keep in sync with
// api/admin/stats.ts.

export interface Pair {
  key: string;
  count: number;
}

export interface DailyRow {
  date: string;
  pageviews: number;
  events: Record<string, number>;
}

export interface StatsResponse {
  totals: { pageviews: number; events: Record<string, number> };
  daily: DailyRow[];
  topPaths: Pair[];
  topReferrers: Pair[];
  topCountries: Pair[];
  devices: Pair[];
  browsers: Pair[];
  topEvents: Pair[];
  shareByNetwork: Pair[];
  shareBySlug: Pair[];
  generatedAt: string;
  today?: string;
  kvProvisioned?: boolean;
}
