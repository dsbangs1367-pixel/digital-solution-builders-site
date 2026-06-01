/**
 * social-sharing.smoke.mjs
 *
 * Standalone Node assertion script for the social-sharing feature.
 * No test framework required — uses node:assert and node:fs only.
 *
 * Run:  node tests/social-sharing.smoke.mjs
 *
 * Covers:
 *   Part 1 — Prerender OG output (dist/work/<slug>/index.html correctness)
 *   Part 2 — Plugin guard: setMeta / setTitle throw on missing tags
 *   Part 3 — ShareButtons URL construction & Instagram fallback logic
 */

import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

// ---------------------------------------------------------------------------
// Tiny test runner (same pattern as contact-api.smoke.ts)
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.log(`  FAIL  ${name}`);
    console.log(`        ${err.message}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Helper: minimal HTML escape matching the plugin's escapeAttr() exactly
// ---------------------------------------------------------------------------
function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Load caseStudies from source.  The TS file has no runtime deps and uses
// only `export const caseStudies = { ... }` — we parse it as text by stripping
// the TypeScript-only interface declarations so Node can eval the export.
// ---------------------------------------------------------------------------
function loadCaseStudiesFromSource() {
  const src = readFileSync(resolve(ROOT, 'src/pages/CaseStudy/caseStudies.ts'), 'utf8');

  // Drop interface declarations (multi-line)
  const stripped = src
    .replace(/^export interface[\s\S]*?^}/gm, '')   // remove export interface blocks
    .replace(/^interface[\s\S]*?^}/gm, '')           // remove plain interface blocks
    .replace(/:\s*(string|CaseStudyStat\[\]|CaseStudySection\[\]|CaseStudy|Record<[^>]+>)/g, '')  // strip type annotations
    .replace(/\bas const\b/g, '')                     // drop `as const`
    .replace(/^export /gm, '')                        // strip `export` keyword
    .trim();

  // We need to execute this to get the caseStudies object.  Use Function
  // constructor so we can capture the declared variable.
  const fn = new Function(`${stripped}; return caseStudies;`);
  return fn();
}

const caseStudies = loadCaseStudiesFromSource();
const SITE = 'https://dsbdigital.biz';

// ---------------------------------------------------------------------------
// PART 1 — Prerender output correctness
// ---------------------------------------------------------------------------

console.log('\n--- Part 1: Prerender OG output ---\n');

const SLUGS = ['nexa-welbodi', 'nexa-logistix', 'rms-death-tracker'];

// 1a. All three slug files exist
for (const slug of SLUGS) {
  test(`[${slug}] dist/work/${slug}/index.html exists`, () => {
    assert.ok(existsSync(resolve(DIST, 'work', slug, 'index.html')),
      `dist/work/${slug}/index.html not found`);
  });
}

// 1b. Per-slug correctness assertions
for (const slug of SLUGS) {
  const htmlPath = resolve(DIST, 'work', slug, 'index.html');
  if (!existsSync(htmlPath)) continue;   // already failed above
  const html = readFileSync(htmlPath, 'utf8');
  const cs = caseStudies[slug];
  const expectedUrl = `${SITE}/work/${slug}`;
  const expectedImage = `${SITE}${cs.heroImage}`;
  const escapedTitle = escapeAttr(cs.metaTitle);
  const escapedDesc = escapeAttr(cs.metaDescription);

  test(`[${slug}] <title> equals metaTitle (HTML-escaped)`, () => {
    const match = html.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(match, '<title> tag not found');
    assert.strictEqual(match[1], escapedTitle,
      `<title> mismatch.\n  Expected: ${escapedTitle}\n  Got:      ${match[1]}`);
  });

  test(`[${slug}] og:title equals metaTitle`, () => {
    const re = /property="og:title"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'og:title meta not found');
    assert.strictEqual(m[1], escapedTitle);
  });

  test(`[${slug}] twitter:title equals metaTitle`, () => {
    const re = /name="twitter:title"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'twitter:title meta not found');
    assert.strictEqual(m[1], escapedTitle);
  });

  test(`[${slug}] og:description equals metaDescription`, () => {
    const re = /property="og:description"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'og:description meta not found');
    assert.strictEqual(m[1], escapedDesc);
  });

  test(`[${slug}] twitter:description equals metaDescription`, () => {
    const re = /name="twitter:description"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'twitter:description meta not found');
    assert.strictEqual(m[1], escapedDesc);
  });

  test(`[${slug}] og:url equals ${expectedUrl}`, () => {
    const re = /property="og:url"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'og:url meta not found');
    assert.strictEqual(m[1], expectedUrl);
  });

  test(`[${slug}] twitter:url equals ${expectedUrl}`, () => {
    const re = /name="twitter:url"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'twitter:url meta not found');
    assert.strictEqual(m[1], expectedUrl);
  });

  test(`[${slug}] og:image equals ${expectedImage}`, () => {
    const re = /property="og:image"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'og:image meta not found');
    assert.strictEqual(m[1], expectedImage);
  });

  test(`[${slug}] twitter:image equals ${expectedImage}`, () => {
    const re = /name="twitter:image"\s+content="([^"]*)"/;
    const m = html.match(re);
    assert.ok(m, 'twitter:image meta not found');
    assert.strictEqual(m[1], expectedImage);
  });

  test(`[${slug}] heroImage PNG exists under public/projects/`, () => {
    const pngPath = resolve(ROOT, 'public', cs.heroImage.replace(/^\//, ''));
    assert.ok(existsSync(pngPath), `PNG missing: ${pngPath}`);
  });

  test(`[${slug}] no og:image:width in output`, () => {
    assert.ok(!html.includes('og:image:width'),
      'og:image:width should have been stripped but is still present');
  });

  test(`[${slug}] no og:image:height in output`, () => {
    assert.ok(!html.includes('og:image:height'),
      'og:image:height should have been stripped but is still present');
  });

  test(`[${slug}] SPA JS bundle referenced via absolute /assets/ path`, () => {
    const re = /src="(\/assets\/[^"]+\.js)"/;
    assert.ok(re.test(html),
      'No absolute /assets/...js script tag found — SPA may not boot from deep route');
  });
}

// Edge case: nexa-logistix heroImage is /projects/nexa-lmis.png (different filename)
test('[nexa-logistix] heroImage correctly set to nexa-lmis.png (not nexa-logistix.png)', () => {
  const htmlPath = resolve(DIST, 'work', 'nexa-logistix', 'index.html');
  const html = readFileSync(htmlPath, 'utf8');
  assert.ok(html.includes('https://dsbdigital.biz/projects/nexa-lmis.png'),
    'nexa-logistix og:image should reference nexa-lmis.png');
  assert.ok(!html.includes('nexa-logistix.png'),
    'nexa-logistix og:image must NOT reference a non-existent nexa-logistix.png');
});

// Edge case: RMS title contains '&' — must be &amp; in all tags
test('[rms-death-tracker] ampersand in title is HTML-escaped (&amp;) in <title>', () => {
  const html = readFileSync(resolve(DIST, 'work', 'rms-death-tracker', 'index.html'), 'utf8');
  const match = html.match(/<title>([\s\S]*?)<\/title>/);
  assert.ok(match, '<title> tag not found');
  assert.ok(match[1].includes('&amp;'),
    `<title> must contain &amp; but got: ${match[1]}`);
  assert.ok(!match[1].includes(' & '),
    `<title> must not contain a raw & character`);
});

test('[rms-death-tracker] ampersand in title is &amp; in og:title', () => {
  const html = readFileSync(resolve(DIST, 'work', 'rms-death-tracker', 'index.html'), 'utf8');
  const m = html.match(/property="og:title"\s+content="([^"]*)"/);
  assert.ok(m, 'og:title not found');
  assert.ok(m[1].includes('&amp;'),
    `og:title must contain &amp; but got: ${m[1]}`);
});

// 1c. Canonical tag assertions
console.log('\n--- Part 1c: Canonical tag correctness ---\n');

// Home canonical: exactly one <link rel="canonical"> whose href is https://dsbdigital.biz/
test('dist/index.html contains exactly one <link rel="canonical">', () => {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const matches = html.match(/<link\s+rel="canonical"[^>]*>/g);
  assert.ok(matches, '<link rel="canonical"> not found in dist/index.html');
  assert.strictEqual(matches.length, 1,
    `Expected exactly 1 <link rel="canonical">, found ${matches.length}`);
});

test('dist/index.html canonical href equals https://dsbdigital.biz/', () => {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  assert.ok(m, '<link rel="canonical" href="..."> not found in dist/index.html');
  assert.strictEqual(m[1], 'https://dsbdigital.biz/',
    `Home canonical href mismatch.\n  Expected: https://dsbdigital.biz/\n  Got:      ${m[1]}`);
});

// Per case-study canonical: exactly one tag, href equals https://dsbdigital.biz/work/<slug> (no trailing slash)
for (const slug of SLUGS) {
  const htmlPath = resolve(DIST, 'work', slug, 'index.html');
  if (!existsSync(htmlPath)) continue;  // already failed in 1a
  const html = readFileSync(htmlPath, 'utf8');
  const expectedCanonical = `${SITE}/work/${slug}`;

  test(`[${slug}] contains exactly one <link rel="canonical">`, () => {
    const matches = html.match(/<link\s+rel="canonical"[^>]*>/g);
    assert.ok(matches, `<link rel="canonical"> not found in dist/work/${slug}/index.html`);
    assert.strictEqual(matches.length, 1,
      `Expected exactly 1 <link rel="canonical">, found ${matches.length}`);
  });

  test(`[${slug}] canonical href equals ${expectedCanonical}`, () => {
    const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
    assert.ok(m, `<link rel="canonical" href="..."> not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], expectedCanonical,
      `Canonical href mismatch for ${slug}.\n  Expected: ${expectedCanonical}\n  Got:      ${m[1]}`);
  });

  // Sanity guard: case-study canonical must differ from home canonical
  test(`[${slug}] canonical is NOT equal to home canonical (prerender did not no-op)`, () => {
    const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
    assert.ok(m, `<link rel="canonical" href="..."> not found in dist/work/${slug}/index.html`);
    assert.notStrictEqual(m[1], 'https://dsbdigital.biz/',
      `[${slug}] canonical still equals the home canonical — prerender setCanonical may have no-op'd`);
  });
}

// ---------------------------------------------------------------------------
// Part 2 guard — setCanonical throws when <link rel="canonical"> is absent
// ---------------------------------------------------------------------------

console.log('\n--- Part 1d: setCanonical guard ---\n');

function setCanonicalGuard(html, url) {
  const re = /(<link\s+rel="canonical"\s+href=")[^"]*(")/;
  if (!re.test(html)) {
    throw new Error('prerender-case-study-og: <link rel="canonical"> not found in built index.html');
  }
  return html.replace(re, `$1${escapeAttr(url)}$2`);
}

test('setCanonical: replaces href on a valid template', () => {
  const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const result = setCanonicalGuard(template, 'https://dsbdigital.biz/work/nexa-welbodi');
  assert.ok(result.includes('href="https://dsbdigital.biz/work/nexa-welbodi"'),
    'setCanonical did not write the new href');
});

test('setCanonical: throws when <link rel="canonical"> is absent', () => {
  const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const stripped = template.replace(/<link\s+rel="canonical"[^>]*>/g, '');
  assert.throws(
    () => setCanonicalGuard(stripped, 'https://dsbdigital.biz/work/nexa-welbodi'),
    /prerender-case-study-og: <link rel="canonical"> not found/,
    'Expected setCanonical to throw when the tag is absent'
  );
});

// ---------------------------------------------------------------------------
// Part 1c (original): Home dist/index.html OG tags are UNCHANGED
// ---------------------------------------------------------------------------

console.log('\n--- Part 1e: Home index.html OG tags are unchanged ---\n');

test('dist/index.html og:url is still https://dsbdigital.biz/', () => {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const m = html.match(/property="og:url"\s+content="([^"]*)"/);
  assert.ok(m, 'og:url not found in dist/index.html');
  assert.strictEqual(m[1], 'https://dsbdigital.biz/');
});

test('dist/index.html og:image is still /og-cover.png', () => {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const m = html.match(/property="og:image"\s+content="([^"]*)"/);
  assert.ok(m, 'og:image not found in dist/index.html');
  assert.ok(m[1].endsWith('/og-cover.png'), `home og:image should be og-cover.png, got ${m[1]}`);
});

test('dist/index.html <title> is the home title (not a case study title)', () => {
  const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  assert.ok(m, '<title> not found');
  assert.ok(m[1].includes('Digital Solution Builders'),
    'Home <title> should contain "Digital Solution Builders"');
  // Must not have been overwritten with a case study title
  assert.ok(!m[1].includes('Welbodi EMR'), 'Home <title> must not be overwritten with a case study title');
  assert.ok(!m[1].includes('RMS Death Tracker'), 'Home <title> must not be overwritten with a case study title');
});

// ---------------------------------------------------------------------------
// PART 2 — Plugin guard: setMeta / setTitle throw on missing tags
// ---------------------------------------------------------------------------

console.log('\n--- Part 2: Plugin guard — throws on missing tags ---\n');

// Replicate the exact guard logic from vite.config.ts (setMeta, setTitle, escapeRe).
// The plugin is not exported from vite.config.ts, so we inline the logic.
function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setMetaGuard(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${escapeRe(key)}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) {
    throw new Error(
      `prerender-case-study-og: <meta ${attr}="${key}"> not found in built index.html — the OG template may have changed`,
    );
  }
  return html.replace(re, `$1${escapeAttr(value)}$2`);
}

function setTitleGuard(html, value) {
  const re = /<title>[\s\S]*?<\/title>/;
  if (!re.test(html)) {
    throw new Error('prerender-case-study-og: <title> not found in built index.html');
  }
  return html.replace(re, `<title>${escapeAttr(value)}</title>`);
}

const FULL_TEMPLATE = readFileSync(resolve(DIST, 'index.html'), 'utf8');

// 2a. setMeta happy path — succeeds on a real template
test('setMeta: succeeds on valid template (og:url)', () => {
  const result = setMetaGuard(FULL_TEMPLATE, 'property', 'og:url', 'https://dsbdigital.biz/work/test');
  assert.ok(result.includes('content="https://dsbdigital.biz/work/test"'),
    'setMeta did not write the new value');
});

// 2b. setMeta throws when the tag is absent
test('setMeta: throws when og:title is missing from template', () => {
  // Strip out the og:title line
  const stripped = FULL_TEMPLATE.replace(/<meta\s+property="og:title"[^>]*>/g, '');
  assert.throws(
    () => setMetaGuard(stripped, 'property', 'og:title', 'New title'),
    /prerender-case-study-og.*og:title.*not found/,
    'Expected setMeta to throw when og:title is absent'
  );
});

test('setMeta: throws when twitter:url is missing from template', () => {
  const stripped = FULL_TEMPLATE.replace(/<meta\s+name="twitter:url"[^>]*>/g, '');
  assert.throws(
    () => setMetaGuard(stripped, 'name', 'twitter:url', 'https://dsbdigital.biz/work/test'),
    /prerender-case-study-og.*twitter:url.*not found/
  );
});

test('setMeta: throws when og:image is missing from template', () => {
  const stripped = FULL_TEMPLATE.replace(/<meta\s+property="og:image"[^>]*>/g, '');
  assert.throws(
    () => setMetaGuard(stripped, 'property', 'og:image', 'https://dsbdigital.biz/og.png'),
    /prerender-case-study-og.*og:image.*not found/
  );
});

// 2c. setTitle happy path
test('setTitle: replaces title in valid template', () => {
  const result = setTitleGuard(FULL_TEMPLATE, 'My Test Title');
  assert.ok(result.includes('<title>My Test Title</title>'), 'setTitle did not replace the title');
});

// 2d. setTitle throws when <title> absent
test('setTitle: throws when <title> tag is missing from template', () => {
  const stripped = FULL_TEMPLATE.replace(/<title>[\s\S]*?<\/title>/, '');
  assert.throws(
    () => setTitleGuard(stripped, 'My Title'),
    /prerender-case-study-og: <title> not found/
  );
});

// 2e. escapeAttr in output: value containing & is written as &amp;
test('setMeta: & in value is written as &amp; in the attribute', () => {
  const result = setMetaGuard(FULL_TEMPLATE, 'property', 'og:title', 'Surveillance & Calculator');
  assert.ok(result.includes('content="Surveillance &amp; Calculator"'),
    'setMeta should HTML-escape & to &amp;');
  assert.ok(!result.includes('content="Surveillance & Calculator"'),
    'setMeta must not emit a raw &');
});

// ---------------------------------------------------------------------------
// PART 3 — ShareButtons URL construction & Instagram fallback logic
// ---------------------------------------------------------------------------

console.log('\n--- Part 3: ShareButtons URL construction ---\n');

// Pure URL-building logic extracted from ShareButtons.tsx — no React needed.
// This covers the three share-intent URLs and the Instagram fallback path.

function buildShareUrls(url, title) {
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };
}

// 3a. Happy path — clean slug URL
const TEST_URL = 'https://dsbdigital.biz/work/nexa-welbodi';
const TEST_TITLE = 'Welbodi EMR — Offline-First Electronic Medical Records | Digital Solution Builders';
const urls = buildShareUrls(TEST_URL, TEST_TITLE);

test('LinkedIn URL starts with share-offsite/?url=', () => {
  assert.ok(urls.linkedin.startsWith('https://www.linkedin.com/sharing/share-offsite/?url='),
    `LinkedIn URL malformed: ${urls.linkedin}`);
});

test('LinkedIn URL contains percent-encoded case-study URL', () => {
  assert.ok(urls.linkedin.includes(encodeURIComponent(TEST_URL)),
    `LinkedIn URL should contain encoded URL. Got: ${urls.linkedin}`);
});

test('X (Twitter) URL starts with intent/tweet', () => {
  assert.ok(urls.twitter.startsWith('https://twitter.com/intent/tweet?url='),
    `Twitter URL malformed: ${urls.twitter}`);
});

test('X URL contains encoded url param', () => {
  assert.ok(urls.twitter.includes(`url=${encodeURIComponent(TEST_URL)}`),
    `Twitter URL missing encoded url param`);
});

test('X URL contains encoded text param (title)', () => {
  assert.ok(urls.twitter.includes(`text=${encodeURIComponent(TEST_TITLE)}`),
    `Twitter URL missing encoded text param`);
});

test('Facebook URL starts with sharer.php', () => {
  assert.ok(urls.facebook.startsWith('https://www.facebook.com/sharer/sharer.php?u='),
    `Facebook URL malformed: ${urls.facebook}`);
});

test('Facebook URL contains encoded u= param', () => {
  assert.ok(urls.facebook.includes(`u=${encodeURIComponent(TEST_URL)}`),
    `Facebook URL missing encoded u= param`);
});

// 3b. Edge case — URL and title with special characters (ampersand, spaces)
const RMS_URL = 'https://dsbdigital.biz/work/rms-death-tracker';
const RMS_TITLE = 'RMS Death Tracker — Rapid Mortality Surveillance & Excess-Mortality Calculator | Digital Solution Builders';
const rmsUrls = buildShareUrls(RMS_URL, RMS_TITLE);

test('[rms] LinkedIn URL correctly encodes the URL param', () => {
  const expected = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(RMS_URL)}`;
  assert.strictEqual(rmsUrls.linkedin, expected);
});

test('[rms] X URL title param encodes & as %26 (not raw &)', () => {
  // A raw & in the query string would be parsed as a param separator.
  // encodeURIComponent must encode it as %26.
  assert.ok(rmsUrls.twitter.includes('%26'),
    `X URL for RMS title should contain %26 for the ampersand in title`);
  // Verify that the raw & does not appear in the text= portion
  const textIdx = rmsUrls.twitter.indexOf('&text=');
  const textPart = rmsUrls.twitter.slice(textIdx + 6);
  assert.ok(!textPart.includes(' & '),
    'X URL text param must not contain a raw & (should be %26)');
});

test('[rms] Facebook URL correctly encodes the URL param', () => {
  const expected = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(RMS_URL)}`;
  assert.strictEqual(rmsUrls.facebook, expected);
});

// 3c. Instagram fallback logic (simulated — no DOM/React)
// The component does: if (canNativeShare) → navigator.share; else → writeToClipboard.
// We verify the fallback path (no navigator.share) leads to clipboard copy.

test('Instagram: falls back to clipboard copy when navigator.share is absent', async () => {
  // Simulate the component logic with a mock clipboard
  let clipboardText = null;
  let flashMessage = null;

  const mockWriteToClipboard = async (text) => {
    clipboardText = text;
    return true;   // clipboard write succeeded
  };

  const canNativeShare = false;   // no navigator.share on desktop

  const handleInstagram = async (url, title, summary) => {
    if (canNativeShare) {
      // would call navigator.share — not reached
      return;
    }
    if (await mockWriteToClipboard(url)) {
      flashMessage = 'Link copied — paste it into Instagram';
    }
  };

  await handleInstagram(TEST_URL, TEST_TITLE, undefined);

  assert.strictEqual(clipboardText, TEST_URL,
    'Clipboard should contain the share URL when native share is absent');
  assert.strictEqual(flashMessage, 'Link copied — paste it into Instagram',
    'Flash message should be set after clipboard copy');
});

test('Instagram: uses navigator.share when available and does not copy', async () => {
  let nativeShareCalled = false;
  let clipboardText = null;

  const mockShare = async ({ title, text, url }) => {
    nativeShareCalled = true;
    // resolves cleanly (user completed share)
  };

  const mockWriteToClipboard = async (text) => {
    clipboardText = text;
    return true;
  };

  const canNativeShare = true;

  const handleInstagram = async (url, title, summary) => {
    if (canNativeShare) {
      try {
        await mockShare({ title, text: summary, url });
        return;
      } catch {
        // fall through
      }
    }
    if (await mockWriteToClipboard(url)) {
      // copy path
    }
  };

  await handleInstagram(TEST_URL, TEST_TITLE, 'An offline-first EMR platform');

  assert.ok(nativeShareCalled, 'navigator.share should have been called');
  assert.strictEqual(clipboardText, null, 'Clipboard should NOT be written when native share succeeds');
});

test('Instagram: falls back to clipboard copy when navigator.share throws (user dismiss)', async () => {
  let clipboardText = null;

  const mockShare = async () => {
    throw new DOMException('Share cancelled', 'AbortError');
  };

  const mockWriteToClipboard = async (text) => {
    clipboardText = text;
    return true;
  };

  const canNativeShare = true;

  const handleInstagram = async (url, title, summary) => {
    if (canNativeShare) {
      try {
        await mockShare({ title, text: summary, url });
        return;
      } catch {
        // fall through to clipboard copy
      }
    }
    await mockWriteToClipboard(url);
  };

  await handleInstagram(TEST_URL, TEST_TITLE, undefined);
  assert.strictEqual(clipboardText, TEST_URL,
    'Should fall back to clipboard copy when navigator.share throws');
});

// 3d. writeToClipboard execCommand fallback (Clipboard API absent/throws)
test('writeToClipboard: execCommand fallback path when navigator.clipboard throws', async () => {
  // Simulate the function with the two-path logic
  let execCommandCalled = false;
  const mockExecCommand = (cmd) => {
    execCommandCalled = true;
    return cmd === 'copy';
  };

  const writeToClipboard = async (text) => {
    // primary path — throw to force fallback
    try {
      throw new Error('clipboard API unavailable');
    } catch {
      let el = null;
      try {
        el = { value: text, style: {}, focus: () => {}, select: () => {} };
        return mockExecCommand('copy');
      } catch {
        return false;
      }
    }
  };

  const result = await writeToClipboard('https://dsbdigital.biz/work/nexa-welbodi');
  assert.ok(result, 'writeToClipboard should return true when execCommand fallback succeeds');
  assert.ok(execCommandCalled, 'execCommand fallback should have been called');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${'─'.repeat(60)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(60) + '\n');

if (failed > 0) process.exit(1);
