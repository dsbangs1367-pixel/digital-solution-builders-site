/**
 * playbook.smoke.mjs
 *
 * Standalone assertion script for the /playbook cluster: landing page,
 * legal pages, routing/footer/sitemap wiring, and the lead API contract.
 * No test framework required. Uses node:assert only.
 *
 * Run:  bun tests/playbook.smoke.mjs
 *
 * Covers:
 *   Part 1 - routing + wiring (routes, footer links, sitemap)
 *   Part 2 - copy landmarks + brand rules (dash ban, no Nexa, currency, refunds, PDF asset)
 *   Part 3 - api/playbook-lead.ts handler contract (via mock req/res + fetch stub)
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8');

// ---------------------------------------------------------------------------
// Tiny test runner (mirrors analytics.smoke.mjs pattern)
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

async function asyncTest(name, fn) {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// PART 1 - routing + wiring
// ---------------------------------------------------------------------------

console.log('\n--- Part 1: routing + wiring ---\n');

const routes = read('src/routes/index.tsx');
for (const p of ['/playbook', '/terms', '/privacy', '/refunds']) {
  test(`route registered: ${p}`, () =>
    assert.match(routes, new RegExp(`path: '${p}'`),
      `src/routes/index.tsx has no "path: '${p}'" entry`));
}

test('footer links playbook + legal pages', () => {
  const f = read('src/components/SiteFooter.tsx');
  for (const p of ['/playbook', '/terms', '/privacy', '/refunds']) {
    assert.ok(f.includes(`"${p}"`) || f.includes(`'${p}'`),
      `SiteFooter.tsx has no link to ${p}`);
  }
});

test('sitemap has all four URLs', () => {
  const s = read('public/sitemap.xml');
  for (const p of ['playbook', 'terms', 'privacy', 'refunds']) {
    assert.ok(s.includes(`https://dsbdigital.biz/${p}`),
      `sitemap.xml missing https://dsbdigital.biz/${p}`);
  }
});

// ---------------------------------------------------------------------------
// PART 2 - copy landmarks + brand rules
// ---------------------------------------------------------------------------

console.log('\n--- Part 2: copy landmarks + brand rules ---\n');

const CONTENT_FILES = [
  'src/pages/Playbook/content.ts',
  'src/pages/Playbook/index.tsx',
  'src/pages/Playbook/PlaybookLeadForm.tsx',
  'src/pages/Legal/LegalPage.tsx',
  'src/pages/Legal/legalContent.ts',
  'src/pages/Legal/Terms.tsx',
  'src/pages/Legal/Privacy.tsx',
  'src/pages/Legal/Refunds.tsx',
];

test('no em/en dashes in reader-facing sources', () => {
  // — = em dash, – = en dash (brand rule: neither appears in copy)
  const DASH_RE = /[—–]/;
  for (const f of CONTENT_FILES) {
    assert.ok(!DASH_RE.test(read(f)), `${f} contains an em or en dash`);
  }
});

test('no Nexa mentions (DSB brand separation)', () => {
  for (const f of CONTENT_FILES) {
    assert.ok(!read(f).includes('Nexa'), `${f} mentions Nexa`);
  }
});

test('dual-currency rule at price mentions', () => {
  const c = read('src/pages/Playbook/content.ts');
  assert.ok(c.includes('USD 29'), 'content.ts missing "USD 29"');
  assert.ok(c.toLowerCase().includes('leone'),
    'content.ts price copy missing the Leone equivalent mention');
});

test('30-day refund stated in FAQ and refunds page', () => {
  assert.ok(read('src/pages/Playbook/content.ts').includes('30 days'),
    'content.ts FAQ missing the 30 days refund promise');
  // Legal copy lives in legalContent.ts (Refunds.tsx is a thin data wrapper).
  assert.ok(read('src/pages/Legal/legalContent.ts').includes('30 days'),
    'legalContent.ts REFUNDS missing the 30 days refund promise');
});

test('download asset exists and is a PDF', () => {
  const b = readFileSync(resolve(ROOT, 'public/downloads/the-cv-that-gets-you-shortlisted.pdf'));
  assert.equal(b.subarray(0, 4).toString(), '%PDF',
    'download asset does not start with the %PDF magic bytes');
});

// ---------------------------------------------------------------------------
// PART 2b - checkout CTA launch switch (CHECKOUT_URL / CTA_BUY)
// ---------------------------------------------------------------------------

console.log('\n--- Part 2b: checkout CTA launch switch ---\n');

const { CHECKOUT_URL, CTA_BUY } = await import('../src/pages/Playbook/content.ts');

test('content exports CHECKOUT_URL (string) and CTA_BUY (non-empty)', () => {
  assert.equal(typeof CHECKOUT_URL, 'string', 'CHECKOUT_URL must be a string');
  assert.ok(typeof CTA_BUY === 'string' && CTA_BUY.length > 0,
    'CTA_BUY must be a non-empty string');
});

test('CHECKOUT_URL, when set, is an https link (guards a launch-day typo)', () => {
  if (CHECKOUT_URL !== '') {
    assert.match(CHECKOUT_URL, /^https:\/\/\S+$/,
      'CHECKOUT_URL must be an https:// link when non-empty');
  }
});

test('landing page wires checkout: reads CHECKOUT_URL and tracks the click', () => {
  const src = read('src/pages/Playbook/index.tsx');
  assert.ok(src.includes('CHECKOUT_URL'), 'index.tsx does not reference CHECKOUT_URL');
  assert.ok(src.includes("trackEvent('playbook_checkout_click')"),
    'index.tsx does not track playbook_checkout_click on the buy CTA');
});

test('playbook_checkout_click is declared in both track.ts and validators.ts', () => {
  assert.ok(read('src/lib/track.ts').includes('playbook_checkout_click'),
    'track.ts TrackEvent union missing playbook_checkout_click');
  assert.ok(read('api/_lib/validators.ts').includes('playbook_checkout_click'),
    'validators.ts ALLOWED_EVENTS missing playbook_checkout_click');
});

// ---------------------------------------------------------------------------
// PART 3 - lead API contract (api/playbook-lead.ts via mock req/res)
// ---------------------------------------------------------------------------

console.log('\n--- Part 3: lead API contract ---\n');

const { default: leadHandler } = await import('../api/playbook-lead.ts');

function mockRes() {
  const r = { code: 0, body: null, headers: {} };
  return {
    r,
    setHeader(k, v) { r.headers[k] = v; },
    status(c) { r.code = c; return this; },
    json(b) { r.body = b; return this; },
  };
}

async function call(body, method = 'POST') {
  const res = mockRes();
  await leadHandler({ method, body, headers: {} }, res);
  return res.r;
}

const REAL_FETCH = globalThis.fetch;
const ENV_KEY = 'N8N_LEAD_WEBHOOK_URL';

await asyncTest('rejects GET with 405 + Allow header', async () => {
  const r = await call({}, 'GET');
  assert.equal(r.code, 405, `Expected 405, got ${r.code}`);
  assert.equal(r.headers['Allow'], 'POST', 'Allow header should be POST');
});

await asyncTest('rejects missing fields with 400', async () => {
  assert.equal((await call({ name: 'D' })).code, 400);
});

await asyncTest('rejects bad email with 400', async () => {
  assert.equal((await call({ name: 'D', email: 'x', interest: 'guide' })).code, 400);
});

await asyncTest('rejects name over 200 chars with 400', async () => {
  const r = await call({ name: 'D'.repeat(201), email: 'd@e.io', interest: 'guide' });
  assert.equal(r.code, 400);
});

await asyncTest('rejects email over 254 chars with 400 (RFC 5321 bound)', async () => {
  // 295 + '@e.io' = 300 chars, regex-valid shape but over the length cap
  const r = await call({ name: 'D', email: `${'a'.repeat(295)}@e.io`, interest: 'guide' });
  assert.equal(r.code, 400, `Expected 400, got ${r.code}`);
});

await asyncTest('rejects bad interest with 400', async () => {
  assert.equal((await call({ name: 'D', email: 'd@e.io', interest: 'buy' })).code, 400);
});

await asyncTest('honeypot silently accepted, nothing relayed', async () => {
  const calls = [];
  process.env[ENV_KEY] = 'https://example.test/webhook';
  globalThis.fetch = async (...args) => { calls.push(args); return { ok: true }; };
  try {
    const r = await call({ name: 'B', email: 'b@t.io', interest: 'guide', form_topic: 'spam' });
    assert.equal(r.code, 200, `Expected 200, got ${r.code}`);
    assert.deepEqual(r.body, { ok: true });
    assert.equal(calls.length, 0, 'honeypot submission must never hit the webhook');
  } finally {
    globalThis.fetch = REAL_FETCH;
    delete process.env[ENV_KEY];
  }
});

await asyncTest('valid lead without env returns 500 (misconfig guard)', async () => {
  delete process.env[ENV_KEY];
  const r = await call({ name: 'D', email: 'd@e.io', interest: 'notify' });
  assert.equal(r.code, 500, `Expected 500, got ${r.code}`);
});

await asyncTest('valid guide lead relays payload and returns 200', async () => {
  const calls = [];
  process.env[ENV_KEY] = 'https://example.test/webhook';
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true }; };
  try {
    const r = await call({ name: 'D', email: 'd@e.io', interest: 'guide' });
    assert.equal(r.code, 200, `Expected 200, got ${r.code}`);
    assert.deepEqual(r.body, { ok: true });
    assert.equal(calls.length, 1, 'webhook should be called exactly once');
    assert.equal(calls[0].url, 'https://example.test/webhook');
    const payload = JSON.parse(calls[0].init.body);
    assert.equal(payload.name, 'D');
    assert.equal(payload.email, 'd@e.io');
    assert.equal(payload.interest, 'guide');
    assert.equal(payload.source, 'playbook');
  } finally {
    globalThis.fetch = REAL_FETCH;
    delete process.env[ENV_KEY];
  }
});

await asyncTest('webhook non-OK response returns 502', async () => {
  process.env[ENV_KEY] = 'https://example.test/webhook';
  globalThis.fetch = async () => ({ ok: false, status: 500 });
  try {
    const r = await call({ name: 'D', email: 'd@e.io', interest: 'notify' });
    assert.equal(r.code, 502, `Expected 502, got ${r.code}`);
  } finally {
    globalThis.fetch = REAL_FETCH;
    delete process.env[ENV_KEY];
  }
});

await asyncTest('webhook unreachable (fetch throws) returns 502', async () => {
  process.env[ENV_KEY] = 'https://example.test/webhook';
  globalThis.fetch = async () => { throw new Error('connect ECONNREFUSED'); };
  // The handler logs the thrown error; stub console.error so passing runs
  // do not print a deliberate stack trace.
  const realConsoleError = console.error;
  console.error = () => {};
  try {
    const r = await call({ name: 'D', email: 'd@e.io', interest: 'guide' });
    assert.equal(r.code, 502, `Expected 502, got ${r.code}`);
  } finally {
    console.error = realConsoleError;
    globalThis.fetch = REAL_FETCH;
    delete process.env[ENV_KEY];
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'-'.repeat(60)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log('-'.repeat(60) + '\n');

if (failed > 0) process.exit(1);
