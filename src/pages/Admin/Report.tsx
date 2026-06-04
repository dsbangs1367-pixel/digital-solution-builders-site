// Investor / funder-ready one-pager built from the same /api/admin/stats payload
// that powers the dashboard. Rendered light-themed so it reads cleanly both
// on-screen and when saved as PDF via the browser's print dialog.
//
// The on-screen "Save as PDF" button calls window.print(); print stylesheet
// strips the chrome and switches to A4 page setup.
//
// The traffic chart uses a manually-measured width (ResizeObserver) instead of
// Recharts' ResponsiveContainer. ResponsiveContainer can race the print-layout
// switch and render a zero-width SVG into the saved PDF; an explicit width
// guarantees the chart appears at full size.

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import type { Pair, StatsResponse } from './types';
import {
  buildAnalyticsCsv,
  defaultCsvFilename,
  priorWindow,
  sumLast,
  triggerCsvDownload,
} from './exporters';

interface Props {
  data: StatsResponse;
}

type Change =
  | { kind: 'pct'; label: string; tone: 'up' | 'down' | 'flat' }
  | { kind: 'baseline'; label: string }
  | { kind: 'none' };

function formatChange(current: number, prior: number): Change {
  if (!current && !prior) return { kind: 'none' };
  if (!prior) {
    // Honest framing — we have current-period traffic but no baseline to grow against.
    return { kind: 'baseline', label: `+${current.toLocaleString()} (no prior baseline)` };
  }
  const pct = ((current - prior) / prior) * 100;
  const rounded = Math.round(Math.abs(pct) * 10) / 10;
  if (Math.abs(pct) < 0.1) {
    return { kind: 'pct', label: 'Flat vs prior period', tone: 'flat' };
  }
  const sign = pct >= 0 ? '+' : '−';
  return {
    kind: 'pct',
    label: `${sign}${rounded.toLocaleString()}% vs prior ${prior.toLocaleString()}`,
    tone: pct >= 0 ? 'up' : 'down',
  };
}

function changeToneClass(change: Change): string {
  if (change.kind === 'pct') {
    if (change.tone === 'up') return 'text-emerald-600';
    if (change.tone === 'down') return 'text-rose-600';
    return 'text-slate-500';
  }
  if (change.kind === 'baseline') return 'text-slate-700';
  return 'text-slate-500';
}

function reportingPeriod(daily: StatsResponse['daily']): string {
  if (!daily.length) return '—';
  const first = daily[0]?.date ?? '';
  const last = daily[daily.length - 1]?.date ?? '';
  return `${first} → ${last}`;
}

function Kpi({ label, value, change }: { label: string; value: string; change?: Change }) {
  return (
    <div className="border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-2">{label}</p>
      <p className="font-serif text-3xl text-slate-900 leading-none">{value}</p>
      {change && change.kind !== 'none' ? (
        <p className={`mt-2 text-[11px] tabular-nums ${changeToneClass(change)}`}>{change.label}</p>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  children,
  footnote,
}: {
  title: string;
  children: React.ReactNode;
  footnote?: string;
}) {
  return (
    <section className="border border-slate-200 bg-white p-5 print:break-inside-avoid">
      <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-3">{title}</p>
      {children}
      {footnote ? <p className="mt-3 text-[10px] text-slate-500 italic">{footnote}</p> : null}
    </section>
  );
}

function Bars({ rows, total, emptyLabel }: { rows: Pair[]; total?: number; emptyLabel?: string }) {
  if (!rows.length) return <p className="text-xs text-slate-500 italic">{emptyLabel ?? 'No data yet.'}</p>;
  const denom = (total ?? rows.reduce((acc, r) => acc + r.count, 0)) || 1;
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => {
        const pct = Math.max(2, Math.round((r.count / denom) * 100));
        return (
          <li key={r.key} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-slate-800 truncate mr-3" title={r.key}>{r.key}</span>
              <span className="text-slate-500 tabular-nums flex-shrink-0">{r.count.toLocaleString()}</span>
            </div>
            <div className="h-[3px] bg-slate-100">
              <div className="h-full bg-slate-700" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Reliable width measurement — print-safe alternative to Recharts ResponsiveContainer.
function useMeasuredWidth(initial = 720): readonly [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(initial);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = (width: number) => {
      if (width > 0) setW(Math.round(width));
    };
    apply(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (cr) apply(cr.width);
    });
    ro.observe(el);
    // Print preview swaps the viewport — re-measure on both transitions so the
    // saved PDF gets a chart sized to the page, then snaps back for screen.
    const remeasure = () => apply(el.getBoundingClientRect().width);
    window.addEventListener('beforeprint', remeasure);
    window.addEventListener('afterprint', remeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener('beforeprint', remeasure);
      window.removeEventListener('afterprint', remeasure);
    };
  }, []);
  return [ref, w] as const;
}

export default function Report({ data }: Props) {
  const trendData = useMemo(
    () => data.daily.map((d) => ({ date: d.date.slice(5), pageviews: d.pageviews })),
    [data.daily],
  );

  const last7 = sumLast(data.daily, 7);
  const prior7 = priorWindow(data.daily, 7);
  const last14 = sumLast(data.daily, 14);
  const prior14 = priorWindow(data.daily, 14);
  const last30 = sumLast(data.daily, 30);

  const shareTotal = data.totals.events['share'] ?? 0;
  const contactSubmit = data.totals.events['contact_submit'] ?? 0;
  const contactIntent =
    (data.totals.events['contact_email'] ?? 0) +
    (data.totals.events['contact_whatsapp'] ?? 0) +
    (data.totals.events['contact_linkedin'] ?? 0);

  const generatedDate = new Date(data.generatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => window.print();
  const handleCsv = () => triggerCsvDownload(defaultCsvFilename(data), buildAnalyticsCsv(data));

  const [chartRef, chartWidth] = useMeasuredWidth();
  const chartHeight = 240;

  return (
    <>
      <Helmet>
        <title>Site Analytics Report · Digital Solution Builders</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Print stylesheet — strips chrome, switches to A4, keeps panels intact across page breaks. */}
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          html, body { background: #ffffff !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; max-width: none !important; }
          .print-card { border-color: #cbd5e1 !important; box-shadow: none !important; }
        }
        @media screen {
          .report-shell { background: #f1f5f9; min-height: 100vh; }
        }
      `}</style>

      <div className="report-shell text-slate-900">
        <div className="print-container max-w-5xl mx-auto px-6 md:px-10 py-10">

          {/* Toolbar — hidden in print */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6 text-xs">
            <Link
              to="/admin/analytics"
              className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:border-slate-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to dashboard
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCsv}
                className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:border-slate-500 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 border border-slate-900 bg-slate-900 text-white px-3 py-1.5 hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Save as PDF
              </button>
            </div>
          </div>

          {/* Cover header */}
          <header className="print-card border border-slate-200 bg-white p-8 mb-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-slate-500 mb-2">Digital Solution Builders</p>
                <h1 className="font-serif text-3xl md:text-4xl text-slate-900 leading-tight">
                  Site analytics — investor &amp; funder report
                </h1>
                <p className="mt-3 text-sm text-slate-600 max-w-2xl">
                  A summary of audience, engagement and growth on
                  {' '}<span className="text-slate-900 font-medium">dsbdigital.biz</span> — the portfolio
                  site of Daniel Solomon Bangura&apos;s independent digital product practice.
                </p>
              </div>
              <div className="text-right text-xs text-slate-500 leading-relaxed">
                <p>Reporting period</p>
                <p className="text-slate-900 tabular-nums">{reportingPeriod(data.daily)}</p>
                <p className="mt-2">Generated</p>
                <p className="text-slate-900 tabular-nums">{generatedDate}</p>
              </div>
            </div>
          </header>

          {/* KPI tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Kpi
              label="Last 7 days"
              value={last7.toLocaleString()}
              change={formatChange(last7, prior7)}
            />
            <Kpi
              label="Last 14 days"
              value={last14.toLocaleString()}
              change={formatChange(last14, prior14)}
            />
            <Kpi label="Last 30 days" value={last30.toLocaleString()} />
            <Kpi label="Lifetime pageviews" value={data.totals.pageviews.toLocaleString()} />
          </div>

          {/* Trend */}
          <div className="mb-4">
            <Panel title="Traffic trend · last 30 days">
              <div ref={chartRef} className="w-full" style={{ minHeight: chartHeight }}>
                {trendData.length ? (
                  <AreaChart
                    width={chartWidth}
                    height={chartHeight}
                    data={trendData}
                    margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient id="dsbFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0f172a" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(15,23,42,0.06)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(15,23,42,0.45)" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} stroke="rgba(15,23,42,0.45)" tick={{ fontSize: 10 }} width={32} />
                    <Tooltip
                      contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', fontSize: 12 }}
                      labelStyle={{ color: '#475569' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pageviews"
                      stroke="#0f172a"
                      strokeWidth={1.6}
                      fill="url(#dsbFill)"
                    />
                  </AreaChart>
                ) : (
                  <p className="text-xs text-slate-500 italic">No daily data yet.</p>
                )}
              </div>
            </Panel>
          </div>

          {/* Engagement KPIs */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Kpi label="Total shares" value={shareTotal.toLocaleString()} />
            <Kpi label="Contact intents" value={contactIntent.toLocaleString()} />
            <Kpi label="Form submissions" value={contactSubmit.toLocaleString()} />
          </div>

          {/* Audience + Top content */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <Panel title="Top countries">
              <Bars rows={data.topCountries} emptyLabel="Geographic data is still aggregating." />
            </Panel>
            <Panel title="Devices">
              <Bars rows={data.devices} />
            </Panel>
            <Panel title="Top pages">
              <Bars rows={data.topPaths} />
            </Panel>
            <Panel title="Top referrers" footnote="External referrers only — self-traffic excluded.">
              <Bars rows={data.topReferrers} emptyLabel="No external referrers in this window." />
            </Panel>
          </div>

          {/* Engagement breakdown */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <Panel title="Shares by network">
              <Bars rows={data.shareByNetwork} total={shareTotal || undefined} emptyLabel="No share events yet." />
            </Panel>
            <Panel title="Shares by case study">
              <Bars rows={data.shareBySlug} total={shareTotal || undefined} emptyLabel="No share events yet." />
            </Panel>
          </div>

          {/* Footer */}
          <footer className="print-card border-t border-slate-200 pt-5 mt-6 flex flex-wrap justify-between gap-3 text-[10px] text-slate-500">
            <p>
              Data source: first-party site analytics, no third-party trackers.
              Bots filtered server-side. Country resolution from edge geo headers.
            </p>
            <p className="tabular-nums">dsbdigital.biz · Generated {generatedDate}</p>
          </footer>
        </div>
      </div>
    </>
  );
}
