/**
 * Standalone smoke tests for api/contact.ts
 * Run: npx tsx tests/contact-api.smoke.ts
 *
 * Exercises the handler with mocked req/res objects — no server, no jsdom.
 * Also performs a static field-contract check between ContactForm and the API.
 */

// ─── Inline handler import (ESM-compatible path) ──────────────────────────────
import handler from '../api/contact.js';

// ─── Minimal mock helpers ─────────────────────────────────────────────────────

interface MockRes {
  _status: number;
  _body: unknown;
  _headers: Record<string, string>;
  status(code: number): MockRes;
  json(body: unknown): MockRes;
  setHeader(key: string, val: string): void;
}

function makeRes(): MockRes {
  const res: MockRes = {
    _status: 0,
    _body: undefined,
    _headers: {},
    status(code) { res._status = code; return res; },
    json(body) { res._body = body; return res; },
    setHeader(key, val) { res._headers[key] = val; },
  };
  return res;
}

function makeReq(
  method: string,
  body: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  return { method, body, headers };
}

// ─── Test runner ──────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${(err as Error).message}`);
    failed++;
  }
}

function expect(val: unknown) {
  return {
    toBe(expected: unknown) {
      if (val !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
    },
    toMatch(re: RegExp) {
      if (!re.test(String(val))) throw new Error(`Expected ${JSON.stringify(val)} to match ${re}`);
    },
    toHaveProperty(key: string) {
      if (!(key in (val as Record<string, unknown>))) throw new Error(`Expected object to have property "${key}"`);
    },
  };
}

// ─── Static contract check ────────────────────────────────────────────────────
// Verify the five field names the form sends match what the API reads.
// We parse ContactForm.tsx as a text file — no JSX runtime needed.

import { readFileSync } from 'fs';
import { resolve } from 'path';

const FORM_PATH = resolve(import.meta.dirname, '../src/components/ContactForm.tsx');
const API_PATH  = resolve(import.meta.dirname, '../api/contact.ts');

const formSrc = readFileSync(FORM_PATH, 'utf-8');
const apiSrc  = readFileSync(API_PATH,  'utf-8');

const CONTRACT_FIELDS = ['name', 'email', 'company', 'projectType', 'message'] as const;

// ─── Tests ────────────────────────────────────────────────────────────────────

console.log('\napi/contact.ts — handler smoke tests\n');

// --- 1. Wrong method → 405
await test('405 wrong method (GET)', async () => {
  const req = makeReq('GET');
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(405);
  expect((res._body as Record<string,string>).error).toMatch(/method not allowed/i);
  expect(res._headers['Allow']).toBe('POST');
});

// --- 2. Missing required fields → 400
await test('400 missing name', async () => {
  const req = makeReq('POST', { email: 'a@b.com', message: 'Hello' });
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(400);
  expect((res._body as Record<string,string>).error).toMatch(/required/i);
});

await test('400 missing email', async () => {
  const req = makeReq('POST', { name: 'Dan', message: 'Hello' });
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(400);
  expect((res._body as Record<string,string>).error).toMatch(/required/i);
});

await test('400 missing message', async () => {
  const req = makeReq('POST', { name: 'Dan', email: 'dan@test.com' });
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(400);
  expect((res._body as Record<string,string>).error).toMatch(/required/i);
});

// --- 3. Invalid email → 400
await test('400 invalid email format', async () => {
  const req = makeReq('POST', { name: 'Dan', email: 'not-an-email', message: 'Hello' });
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(400);
  expect((res._body as Record<string,string>).error).toMatch(/invalid email/i);
});

// --- 4. Missing env var → 500
await test('500 missing N8N_LEAD_WEBHOOK_URL env var', async () => {
  const saved = process.env.N8N_LEAD_WEBHOOK_URL;
  delete process.env.N8N_LEAD_WEBHOOK_URL;
  const req = makeReq('POST', { name: 'Dan', email: 'dan@test.com', message: 'Hello there' });
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(500);
  expect((res._body as Record<string,string>).error).toMatch(/misconfigured/i);
  if (saved !== undefined) process.env.N8N_LEAD_WEBHOOK_URL = saved;
});

// --- 5. Webhook fetch failure → 502
await test('502 webhook fetch failure (unreachable URL)', async () => {
  process.env.N8N_LEAD_WEBHOOK_URL = 'http://127.0.0.1:0/does-not-exist';
  const req = makeReq('POST', {
    name: 'Dan',
    email: 'dan@test.com',
    message: 'Hello from smoke test',
  }, { 'user-agent': 'smoke-test' });
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(502);
  delete process.env.N8N_LEAD_WEBHOOK_URL;
});

// --- 6. Happy path 200 (mock webhook with local server)
await test('200 happy path (mock webhook accepts)', async () => {
  // Spin up a minimal HTTP server to act as the n8n webhook
  const http = await import('http');
  const srv = http.createServer((_req, srvRes) => {
    srvRes.writeHead(200, { 'Content-Type': 'application/json' });
    srvRes.end(JSON.stringify({ ok: true }));
  });
  await new Promise<void>((ok) => srv.listen(0, '127.0.0.1', ok));
  const port = (srv.address() as { port: number }).port;

  process.env.N8N_LEAD_WEBHOOK_URL = `http://127.0.0.1:${port}/webhook`;
  const req = makeReq('POST', {
    name: 'Dan',
    email: 'dan@test.com',
    company: 'DSB',
    projectType: 'Website',
    message: 'I would like to start a 72-hour build.',
  }, { 'user-agent': 'smoke-test' });
  const res = makeRes();
  await handler(req, res);
  srv.close();
  delete process.env.N8N_LEAD_WEBHOOK_URL;

  expect(res._status).toBe(200);
  expect((res._body as Record<string,boolean>).ok).toBe(true);
});

// --- 7. Webhook returns non-2xx → 502
await test('502 webhook returns 500', async () => {
  const http = await import('http');
  const srv = http.createServer((_req, srvRes) => {
    srvRes.writeHead(500);
    srvRes.end('Internal Error');
  });
  await new Promise<void>((ok) => srv.listen(0, '127.0.0.1', ok));
  const port = (srv.address() as { port: number }).port;

  process.env.N8N_LEAD_WEBHOOK_URL = `http://127.0.0.1:${port}/webhook`;
  const req = makeReq('POST', {
    name: 'Dan',
    email: 'dan@test.com',
    message: 'Test',
  });
  const res = makeRes();
  await handler(req, res);
  srv.close();
  delete process.env.N8N_LEAD_WEBHOOK_URL;

  expect(res._status).toBe(502);
  expect((res._body as Record<string,string>).error).toMatch(/deliver/i);
});

// --- 8. Message over 5000 chars → 400
await test('400 message too long', async () => {
  const req = makeReq('POST', {
    name: 'Dan',
    email: 'dan@test.com',
    message: 'x'.repeat(5001),
  });
  const res = makeRes();
  await handler(req, res);
  expect(res._status).toBe(400);
  expect((res._body as Record<string,string>).error).toMatch(/too long/i);
});

// ─── Static contract check ────────────────────────────────────────────────────

console.log('\nContactForm.tsx ↔ api/contact.ts — field contract check\n');

for (const field of CONTRACT_FIELDS) {
  await test(`field "${field}" present in both form and API`, async () => {
    if (!formSrc.includes(`'${field}'`) && !formSrc.includes(`"${field}"`)) {
      throw new Error(`ContactForm.tsx does not reference field "${field}"`);
    }
    if (!apiSrc.includes(`body.${field}`) && !apiSrc.includes(`'${field}'`) && !apiSrc.includes(`"${field}"`)) {
      throw new Error(`api/contact.ts does not reference field "${field}"`);
    }
  });
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
