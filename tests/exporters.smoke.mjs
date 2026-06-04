/**
 * exporters.smoke.mjs
 *
 * Standalone Bun assertion script for the CSV exporters in
 * src/pages/Admin/exporters.ts.
 *
 * Run:  bun tests/exporters.smoke.mjs
 *
 * Covers:
 *   Part 1 — sumLast
 *   Part 2 — priorWindow
 *   Part 3 — buildAnalyticsCsv round-trip correctness
 *   Part 4 — defaultCsvFilename
 */

import assert from 'node:assert/strict';

// ---------------------------------------------------------------------------
// Tiny test runner (same pattern as analytics.smoke.mjs)
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      throw new Error('Use asyncTest() for async tests');
    }
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Import the module under test (Bun transpiles .ts natively)
// ---------------------------------------------------------------------------
const { sumLast, priorWindow, buildAnalyticsCsv, defaultCsvFilename } =
  await import('../src/pages/Admin/exporters.ts');

// ---------------------------------------------------------------------------
// Helpers to build test fixtures
// ---------------------------------------------------------------------------

/** Make a DailyRow with a sequential pageview count starting from 1. */
function makeDaily(count) {
  return Array.from({ length: count }, (_, i) => ({
    date: `2026-05-${String(i + 1).padStart(2, '0')}`,
    pageviews: i + 1,   // row 0 → 1pv, row N-1 → N pv
    events: {},
  }));
}

/** Minimal valid StatsResponse. Caller can override any field. */
function makeStats(overrides = {}) {
  return {
    totals: { pageviews: 100, events: {} },
    daily: [],
    topPaths: [],
    topReferrers: [],
    topCountries: [],
    devices: [],
    browsers: [],
    topEvents: [],
    shareByNetwork: [],
    shareBySlug: [],
    generatedAt: '2026-06-04T09:00:00.000Z',
    today: '2026-06-04',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// PART 1 — sumLast
// ---------------------------------------------------------------------------

console.log('\n--- Part 1: sumLast ---\n');

// 1a. Empty daily → 0
test('sumLast: empty daily → 0', () => {
  assert.strictEqual(sumLast([], 7), 0);
});

// 1b. 3 rows, days=7 → sums all 3 (slice doesn't underflow; -7 from a 3-element array = start)
test('sumLast: 3 rows, days=7 → sums all 3 rows', () => {
  const daily = makeDaily(3);  // pageviews: 1, 2, 3
  assert.strictEqual(sumLast(daily, 7), 6);
});

// 1c. 30 rows, days=7 → sums last 7 only
test('sumLast: 30 rows, days=7 → sums only last 7 rows', () => {
  const daily = makeDaily(30);
  // Last 7 rows are rows 24..30, pageviews 24+25+26+27+28+29+30 = 189
  const expected = 24 + 25 + 26 + 27 + 28 + 29 + 30;
  assert.strictEqual(sumLast(daily, 7), expected);
});

// 1d. days=0 edge — slice(-0) === slice(0) returns entire array.
//     The function therefore sums ALL rows, not 0.  This is the documented
//     JavaScript gotcha; assert the actual behavior so any future code change
//     that accidentally changes this is caught.
test('sumLast: days=0, 2 rows → sums all rows (slice(-0) = slice(0) = entire array)', () => {
  const daily = [
    { date: '2026-06-01', pageviews: 5, events: {} },
    { date: '2026-06-02', pageviews: 3, events: {} },
  ];
  // -0 is coerced to 0 inside slice; slice(0) returns the full array.
  assert.strictEqual(sumLast(daily, 0), 8);
});

// 1e. days=0, empty daily → 0 (no crash; not NaN)
test('sumLast: days=0, empty daily → 0 (no NaN, no crash)', () => {
  const result = sumLast([], 0);
  assert.strictEqual(typeof result, 'number');
  assert.ok(!Number.isNaN(result), 'Result must not be NaN');
  assert.strictEqual(result, 0);
});

// ---------------------------------------------------------------------------
// PART 2 — priorWindow
// ---------------------------------------------------------------------------

console.log('\n--- Part 2: priorWindow ---\n');

// 2a. Empty daily → 0
test('priorWindow: empty daily → 0', () => {
  assert.strictEqual(priorWindow([], 7), 0);
});

// 2b. 10 rows, days=7 → slice(-14, -7) from a 10-element array
//     slice(-14, -7) on a 10-element array: -14 clamps to index 0, -7 clamps to index 3
//     → rows[0..2] i.e. first 3 rows, pageviews 1+2+3 = 6
test('priorWindow: 10 rows, days=7 → returns slice(-14,-7) = first 3 rows summed (known short-data behavior)', () => {
  const daily = makeDaily(10);
  const result = priorWindow(daily, 7);
  assert.strictEqual(typeof result, 'number', 'Must be a number, not NaN');
  assert.ok(!Number.isNaN(result), 'Result must not be NaN');
  // pageviews: 1,2,3 (rows 0,1,2)
  assert.strictEqual(result, 1 + 2 + 3);
});

// 2c. 30 rows, days=7 → slice(-14, -7) = rows[16..22] = 7 rows
//     makeDaily(30): row i has pageviews = i+1
//     slice(-14,-7) on 30 elements → indices 16..22 (inclusive) = pageviews 17..23
test('priorWindow: 30 rows, days=7 → slice(-14,-7) = rows 16 to 22 (7 rows)', () => {
  const daily = makeDaily(30);
  // rows at indices 16,17,18,19,20,21,22 → pageviews 17,18,19,20,21,22,23
  const expected = 17 + 18 + 19 + 20 + 21 + 22 + 23;
  assert.strictEqual(priorWindow(daily, 7), expected);
});

// 2d. days=0 → slice(-0*2, -0) = slice(0, 0) = [] → 0 (empty; correct behavior)
test('priorWindow: days=0 → slice(0, 0) = empty → 0 (no crash, no NaN)', () => {
  const daily = makeDaily(5);
  const result = priorWindow(daily, 0);
  assert.strictEqual(typeof result, 'number');
  assert.ok(!Number.isNaN(result), 'Result must not be NaN');
  assert.strictEqual(result, 0);
});

// 2e. days=0, empty daily → 0
test('priorWindow: days=0, empty daily → 0', () => {
  const result = priorWindow([], 0);
  assert.strictEqual(result, 0);
});

// ---------------------------------------------------------------------------
// PART 3 — buildAnalyticsCsv round-trip correctness
// ---------------------------------------------------------------------------

console.log('\n--- Part 3: buildAnalyticsCsv ---\n');

// Build a reusable minimal StatsResponse with known values.
const SAMPLE_DATA = makeStats({
  totals: {
    pageviews: 500,
    events: {
      share: 42,
      contact_submit: 7,
      contact_email: 3,
      contact_whatsapp: 2,
      contact_linkedin: 1,
    },
  },
  daily: makeDaily(30),
  topPaths: [
    { key: '/work/nexa-welbodi', count: 120 },
    { key: '/', count: 95 },
  ],
  topReferrers: [
    { key: 'linkedin.com', count: 55 },
  ],
  topCountries: [
    { key: 'SL', count: 200 },
    { key: 'GB', count: 60 },
  ],
  devices: [
    { key: 'desktop', count: 310 },
    { key: 'mobile', count: 190 },
  ],
  browsers: [
    { key: 'Chrome', count: 250 },
  ],
  topEvents: [
    { key: 'share', count: 42 },
  ],
  shareByNetwork: [
    { key: 'linkedin', count: 30 },
  ],
  shareBySlug: [
    { key: 'nexa-welbodi', count: 25 },
  ],
  generatedAt: '2026-06-04T09:15:00.000Z',
  today: '2026-06-04',
});

const CSV = buildAnalyticsCsv(SAMPLE_DATA);

// 3a. Header text
test('buildAnalyticsCsv: contains header "Digital Solution Builders — Site Analytics Export"', () => {
  assert.ok(
    CSV.includes('Digital Solution Builders — Site Analytics Export'),
    `Header line missing. CSV starts with:\n${CSV.slice(0, 120)}`
  );
});

// 3b. "Headline metrics" section present
test('buildAnalyticsCsv: contains "Headline metrics" section heading', () => {
  assert.ok(CSV.includes('Headline metrics'), 'Missing "Headline metrics" section');
});

// 3c. All 9 expected section headings are present
const EXPECTED_SECTIONS = [
  'Headline metrics',
  'Daily traffic (last 30 days)',
  'Top pages',
  'Top referrers',
  'Top countries',
  'Devices',
  'Browsers',
  'Events (lifetime totals)',
  'Shares by network',
  'Shares by case study',
];

for (const heading of EXPECTED_SECTIONS) {
  test(`buildAnalyticsCsv: section "${heading}" is present`, () => {
    assert.ok(CSV.includes(heading), `Missing section: "${heading}"`);
  });
}

// 3d. Generated-at timestamp from input appears in the CSV
test('buildAnalyticsCsv: generatedAt from input appears in output', () => {
  assert.ok(
    CSV.includes(SAMPLE_DATA.generatedAt),
    `generatedAt "${SAMPLE_DATA.generatedAt}" not found in CSV`
  );
});

// 3e. CSV escaping: path with commas is quoted
test('buildAnalyticsCsv: Pair key with commas is wrapped in double-quotes', () => {
  const data = makeStats({
    topPaths: [{ key: 'path,with,commas', count: 10 }],
  });
  const csv = buildAnalyticsCsv(data);
  assert.ok(
    csv.includes('"path,with,commas"'),
    `Expected "path,with,commas" (quoted) in CSV output.\nRelevant section: ${
      csv.split('\n').find(l => l.includes('path,with,commas')) ?? '(not found)'
    }`
  );
});

// 3f. CSV escaping: key with double-quotes is escaped as ""
test('buildAnalyticsCsv: Pair key with double-quotes is escaped as ""', () => {
  const data = makeStats({
    topPaths: [{ key: 'has "quotes"', count: 5 }],
  });
  const csv = buildAnalyticsCsv(data);
  // The cell must be wrapped in quotes and inner quotes doubled: "has ""quotes"""
  assert.ok(
    csv.includes('"has ""quotes"""'),
    `Expected "has ""quotes""" in CSV output.\nRelevant section: ${
      csv.split('\n').find(l => l.includes('quotes')) ?? '(not found)'
    }`
  );
});

// 3g. CSV escaping: key with newline is wrapped in quotes
test('buildAnalyticsCsv: Pair key with \\n newline is wrapped in double-quotes', () => {
  const data = makeStats({
    topPaths: [{ key: 'with\nnewline', count: 3 }],
  });
  const csv = buildAnalyticsCsv(data);
  // The cell containing a newline must be quoted; check raw escaped representation
  assert.ok(
    csv.includes('"with\nnewline"'),
    'Expected key containing \\n to be wrapped in double-quotes'
  );
});

// 3h. CSV escaping: key with carriage return is wrapped in quotes (recent fix)
test('buildAnalyticsCsv: Pair key with \\r carriage-return is wrapped in double-quotes', () => {
  const data = makeStats({
    topPaths: [{ key: 'with\rcarriage', count: 2 }],
  });
  const csv = buildAnalyticsCsv(data);
  assert.ok(
    csv.includes('"with\rcarriage"'),
    'Expected key containing \\r to be wrapped in double-quotes (carriage-return fix)'
  );
});

// 3i. Empty section renders "(no data)" instead of a blank or crash
test('buildAnalyticsCsv: empty topReferrers section renders "(no data)" line', () => {
  const data = makeStats({
    topReferrers: [],
  });
  const csv = buildAnalyticsCsv(data);
  // Find the "Top referrers" section and confirm "(no data)" appears right after its header
  const lines = csv.split('\n');
  const refIdx = lines.findIndex(l => l === 'Top referrers');
  assert.ok(refIdx !== -1, '"Top referrers" section heading not found');
  // The line after the column header row should be "(no data)"
  // lines[refIdx]   = 'Top referrers'
  // lines[refIdx+1] = 'Referrer host,Visits'
  // lines[refIdx+2] = '(no data)'
  assert.strictEqual(
    lines[refIdx + 2],
    '(no data)',
    `Expected "(no data)" at line ${refIdx + 2} but got: "${lines[refIdx + 2]}"`
  );
});

// 3j. Empty daily section renders "(no data)"
test('buildAnalyticsCsv: empty daily array renders "(no data)" in the daily traffic section', () => {
  const data = makeStats({ daily: [] });
  const csv = buildAnalyticsCsv(data);
  const lines = csv.split('\n');
  const idx = lines.findIndex(l => l.startsWith('Daily traffic'));
  assert.ok(idx !== -1, '"Daily traffic" section not found');
  // lines[idx+1] = column header row; lines[idx+2] = (no data)
  assert.strictEqual(lines[idx + 2], '(no data)', `Expected "(no data)" but got "${lines[idx + 2]}"`);
});

// ---------------------------------------------------------------------------
// PART 4 — defaultCsvFilename
// ---------------------------------------------------------------------------

console.log('\n--- Part 4: defaultCsvFilename ---\n');

// 4a. Uses data.today when present
test('defaultCsvFilename: uses data.today when present', () => {
  const data = makeStats({ today: '2026-06-04', generatedAt: '2026-06-04T09:00:00.000Z' });
  assert.strictEqual(defaultCsvFilename(data), 'dsb-analytics-2026-06-04.csv');
});

// 4b. Falls back to first 10 chars of generatedAt when today is undefined
test('defaultCsvFilename: falls back to generatedAt.slice(0,10) when today is undefined', () => {
  const data = makeStats({ generatedAt: '2026-05-31T14:22:00.000Z' });
  delete data.today;
  assert.strictEqual(defaultCsvFilename(data), 'dsb-analytics-2026-05-31.csv');
});

// 4c. Filename matches the expected pattern  dsb-analytics-<YYYY-MM-DD>.csv
test('defaultCsvFilename: output matches dsb-analytics-<date>.csv pattern', () => {
  const data = makeStats({ today: '2026-06-04' });
  const filename = defaultCsvFilename(data);
  assert.match(filename, /^dsb-analytics-\d{4}-\d{2}-\d{2}\.csv$/,
    `Filename "${filename}" does not match expected pattern`);
});

// 4d. Different date produces a different filename (regression guard)
test('defaultCsvFilename: different today values produce different filenames', () => {
  const a = defaultCsvFilename(makeStats({ today: '2026-06-01' }));
  const b = defaultCsvFilename(makeStats({ today: '2026-06-04' }));
  assert.notStrictEqual(a, b, 'Different dates must produce different filenames');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(60)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(60) + '\n');

if (failed > 0) process.exit(1);
