// CSV builders + browser download trigger for the admin analytics payload.
// Pure data → string; the download helper is the only side-effect.

import type { Pair, StatsResponse } from './types';

function csvCell(v: string | number): string {
  const s = String(v ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function sumLast(daily: StatsResponse['daily'], days: number): number {
  return daily.slice(-days).reduce((acc, d) => acc + d.pageviews, 0);
}

export function priorWindow(daily: StatsResponse['daily'], days: number): number {
  return daily.slice(-days * 2, -days).reduce((acc, d) => acc + d.pageviews, 0);
}

function csvRow(cells: Array<string | number>): string {
  return cells.map(csvCell).join(',');
}

function section(title: string, header: Array<string | number>, rows: Array<Array<string | number>>): string {
  const lines = [title, csvRow(header)];
  if (!rows.length) lines.push('(no data)');
  else for (const r of rows) lines.push(csvRow(r));
  return lines.join('\n');
}

function pairRows(pairs: Pair[]): Array<Array<string | number>> {
  return pairs.map((p) => [p.key, p.count]);
}

export function buildAnalyticsCsv(data: StatsResponse): string {
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

  const headline = section(
    'Headline metrics',
    ['Metric', 'Value'],
    [
      ['Generated at (UTC)', data.generatedAt],
      ['Reporting day (UTC)', data.today ?? ''],
      ['Lifetime pageviews', data.totals.pageviews],
      ['Last 30 days', last30],
      ['Last 14 days', last14],
      ['Prior 14 days', prior14],
      ['Last 7 days', last7],
      ['Prior 7 days', prior7],
      ['Total shares', shareTotal],
      ['Contact intents (email + WhatsApp + LinkedIn)', contactIntent],
      ['Contact-form submissions', contactSubmit],
    ],
  );

  const dailyRows: Array<Array<string | number>> = data.daily.map((d) => [
    d.date,
    d.pageviews,
    d.events['share'] ?? 0,
    d.events['contact_submit'] ?? 0,
    (d.events['contact_email'] ?? 0) +
      (d.events['contact_whatsapp'] ?? 0) +
      (d.events['contact_linkedin'] ?? 0),
  ]);

  return [
    `Digital Solution Builders — Site Analytics Export`,
    `Source: dsbdigital.biz · Generated ${data.generatedAt}`,
    '',
    headline,
    '',
    section('Daily traffic (last 30 days)', ['Date', 'Pageviews', 'Shares', 'Form submits', 'Contact intents'], dailyRows),
    '',
    section('Top pages', ['Path', 'Pageviews'], pairRows(data.topPaths)),
    '',
    section('Top referrers', ['Referrer host', 'Visits'], pairRows(data.topReferrers)),
    '',
    section('Top countries', ['Country', 'Pageviews'], pairRows(data.topCountries)),
    '',
    section('Devices', ['Device class', 'Pageviews'], pairRows(data.devices)),
    '',
    section('Browsers', ['Browser', 'Pageviews'], pairRows(data.browsers)),
    '',
    section('Events (lifetime totals)', ['Event', 'Count'], pairRows(data.topEvents)),
    '',
    section('Shares by network', ['Network', 'Shares'], pairRows(data.shareByNetwork)),
    '',
    section('Shares by case study', ['Case study slug', 'Shares'], pairRows(data.shareBySlug)),
    '',
  ].join('\n');
}

export function triggerCsvDownload(filename: string, csv: string): void {
  // Excel-friendly BOM (U+FEFF) so UTF-8 case-study slugs / country names render correctly.
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function defaultCsvFilename(data: StatsResponse): string {
  const day = data.today ?? data.generatedAt.slice(0, 10);
  return `dsb-analytics-${day}.csv`;
}
