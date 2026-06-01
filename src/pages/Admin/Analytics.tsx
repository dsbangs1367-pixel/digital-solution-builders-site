import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LogOut, RefreshCw } from 'lucide-react';
import type { Pair, StatsResponse } from './types';

interface Props {
  data: StatsResponse;
  onLogout: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

function sumLast(daily: StatsResponse['daily'], days: number): number {
  return daily.slice(-days).reduce((acc, d) => acc + d.pageviews, 0);
}

function todayPageviews(daily: StatsResponse['daily'], today: string | undefined): number {
  if (!today) return 0;
  const row = daily.find((d) => d.date === today);
  return row ? row.pageviews : 0;
}

function Tile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border/50 p-5 bg-foreground/[0.02]">
      <p className="text-[10px] tracking-[0.3em] uppercase text-muted/40 mb-2">{label}</p>
      <p className="font-serif text-3xl">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border/50 bg-foreground/[0.02] p-5">
      <p className="text-[10px] tracking-[0.3em] uppercase text-muted/40 mb-4">{title}</p>
      {children}
    </section>
  );
}

function Bars({ rows, total, emptyLabel }: { rows: Pair[]; total?: number; emptyLabel?: string }) {
  if (!rows.length) return <p className="text-xs text-muted/40 italic">{emptyLabel ?? 'No data yet.'}</p>;
  const denom = (total ?? rows.reduce((acc, r) => acc + r.count, 0)) || 1;
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => {
        const pct = Math.max(2, Math.round((r.count / denom) * 100));
        return (
          <li key={r.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-foreground/80 truncate mr-3" title={r.key}>{r.key}</span>
              <span className="text-muted/50 tabular-nums flex-shrink-0">{r.count.toLocaleString()}</span>
            </div>
            <div className="h-[3px] bg-foreground/5">
              <div className="h-full bg-foreground/40" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Analytics({ data, onLogout, onRefresh, refreshing }: Props) {
  const trendData = useMemo(
    () => data.daily.map((d) => ({ date: d.date.slice(5), pageviews: d.pageviews })),
    [data.daily],
  );

  const last30 = sumLast(data.daily, 30);
  const last7 = sumLast(data.daily, 7);
  const today = todayPageviews(data.daily, data.today);

  const shareTotal = data.totals.events['share'] ?? 0;
  const contactSubmit = data.totals.events['contact_submit'] ?? 0;
  const contactIntent =
    (data.totals.events['contact_email'] ?? 0) +
    (data.totals.events['contact_whatsapp'] ?? 0) +
    (data.totals.events['contact_linkedin'] ?? 0);

  return (
    <>
      <Helmet>
        <title>Analytics · DSB Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/50 pb-5">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted/40 mb-2">DSB · Owner view</p>
              <h1 className="font-serif text-3xl md:text-4xl">Site analytics</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted/50">
              <span title={data.generatedAt}>
                Updated {new Date(data.generatedAt).toLocaleTimeString()}
              </span>
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 border border-border/50 px-3 py-1.5 hover:border-foreground/40 hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 border border-border/50 px-3 py-1.5 hover:border-foreground/40 hover:text-foreground transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </header>

          {data.kvProvisioned === false && (
            <div className="border border-yellow-500/40 bg-yellow-500/[0.04] text-yellow-200/80 px-4 py-3 text-xs">
              KV store not provisioned yet — tracking is currently a no-op. Add an Upstash for Redis
              integration to the <code className="font-mono">dsb-digital</code> Vercel project, then redeploy.
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Tile label="Today" value={today.toLocaleString()} />
            <Tile label="Last 7 days" value={last7.toLocaleString()} />
            <Tile label="Last 30 days" value={last30.toLocaleString()} />
            <Tile label="Lifetime pageviews" value={data.totals.pageviews.toLocaleString()} />
          </div>

          <Section title="Pageviews · last 30 days">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 10 }} width={32} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,10,10,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 12,
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pageviews"
                    stroke="#f5f5f5"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3, fill: '#f5f5f5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <div className="grid md:grid-cols-2 gap-3">
            <Section title="Top pages">
              <Bars rows={data.topPaths} />
            </Section>
            <Section title="Top referrers">
              <Bars rows={data.topReferrers} emptyLabel="No external referrers yet." />
            </Section>
            <Section title="Top countries">
              <Bars rows={data.topCountries} />
            </Section>
            <Section title="Devices">
              <Bars rows={data.devices} />
            </Section>
            <Section title="Browsers">
              <Bars rows={data.browsers} />
            </Section>
            <Section title="Events">
              <Bars rows={data.topEvents} emptyLabel="No share or contact events yet." />
            </Section>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Tile label="Total shares" value={shareTotal.toLocaleString()} />
            <Tile label="Contact intents" value={contactIntent.toLocaleString()} />
            <Tile label="Form submits" value={contactSubmit.toLocaleString()} />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Section title="Shares by network">
              <Bars rows={data.shareByNetwork} total={shareTotal || undefined} />
            </Section>
            <Section title="Shares by case study">
              <Bars rows={data.shareBySlug} total={shareTotal || undefined} />
            </Section>
          </div>
        </div>
      </div>
    </>
  );
}
