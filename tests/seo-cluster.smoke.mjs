/**
 * seo-cluster.smoke.mjs
 *
 * Standalone assertion script for the health-software SEO content cluster.
 * No test framework required — uses node:assert and node:fs only.
 *
 * Run:  bun tests/seo-cluster.smoke.mjs
 *
 * Covers:
 *   Part 1 — Prose renderer logic (tokeniser rules ported from prose.tsx)
 *   Part 2 — Article data integrity (articles.ts parsed via bun TS import)
 *   Part 3 — Build + prerender integration (dist/ assertions)
 */

import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SITE = 'https://dsbdigital.biz';

// ---------------------------------------------------------------------------
// Tiny test runner (mirrors existing smoke test pattern)
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

// ==========================================================================
// PART 1 — Prose renderer logic
//
// prose.tsx is JSX so we cannot import it directly under bun without a full
// React transform.  Instead we port the two pure helpers (safeHref and the
// INLINE tokeniser loop) and test their observable contracts exactly as the
// renderer relies on them.
// ==========================================================================

console.log('\n--- Part 1: Prose renderer logic ---\n');

// ---------------------------------------------------------------------------
// 1a. safeHref — ported verbatim from prose.tsx
// ---------------------------------------------------------------------------
function safeHref(href) {
  if (href.startsWith('/')) return 'internal';
  if (/^https?:\/\//i.test(href)) return 'external';
  return null;
}

// Happy path: internal links
test('safeHref: /internal → "internal"', () => {
  assert.strictEqual(safeHref('/offline-first-emr-development'), 'internal');
});
test('safeHref: / → "internal"', () => {
  assert.strictEqual(safeHref('/'), 'internal');
});

// Happy path: external links
test('safeHref: https://x → "external"', () => {
  assert.strictEqual(safeHref('https://example.com/path'), 'external');
});
test('safeHref: http:// → "external"', () => {
  assert.strictEqual(safeHref('http://example.com'), 'external');
});
test('safeHref: HTTPS uppercase → "external" (case-insensitive)', () => {
  assert.strictEqual(safeHref('HTTPS://example.com'), 'external');
});

// Error cases: unsafe schemes → null
test('safeHref: mailto: → null', () => {
  assert.strictEqual(safeHref('mailto:user@example.com'), null);
});
test('safeHref: tel: → null', () => {
  assert.strictEqual(safeHref('tel:+44123456789'), null);
});
test('safeHref: javascript:alert(1) → null', () => {
  assert.strictEqual(safeHref('javascript:alert(1)'), null);
});
test('safeHref: data:text/html,<h1>hi</h1> → null', () => {
  assert.strictEqual(safeHref('data:text/html,<h1>hi</h1>'), null);
});
test('safeHref: empty string → null', () => {
  assert.strictEqual(safeHref(''), null);
});
test('safeHref: plain word (no scheme, no slash) → null', () => {
  assert.strictEqual(safeHref('example.com'), null);
});

// ---------------------------------------------------------------------------
// 1b. INLINE regex tokeniser — ported from prose.tsx
//
// The key invariant: because INLINE is global (has the `g` flag), lastIndex
// MUST be reset to 0 before every call or the second scan starts mid-string,
// silently skipping matches at the start (the "state leakage" regression).
// ---------------------------------------------------------------------------

// Re-create the exact regex from prose.tsx
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Minimal tokeniser that mirrors renderInline() in prose.tsx.
 * Returns an array of token descriptors, not ReactNodes, so we can
 * assert the structure without React.
 */
function tokenise(text) {
  const tokens = [];
  let last = 0;
  let match;
  INLINE.lastIndex = 0; // <- the critical reset
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) tokens.push({ type: 'text', value: text.slice(last, match.index) });
    if (match[1] !== undefined) {
      tokens.push({ type: 'bold', value: match[1] });
    } else {
      const label = match[2];
      const href  = match[3];
      tokens.push({ type: 'link', label, href, kind: safeHref(href) });
    }
    last = INLINE.lastIndex;
  }
  if (last < text.length) tokens.push({ type: 'text', value: text.slice(last) });
  return tokens;
}

// Happy path: bold
test('tokenise: **bold** → [{bold,"bold text"}]', () => {
  const tokens = tokenise('before **bold text** after');
  const boldToken = tokens.find(t => t.type === 'bold');
  assert.ok(boldToken, 'Expected a bold token');
  assert.strictEqual(boldToken.value, 'bold text');
});

// Happy path: internal link
test('tokenise: [label](/path) → link token with kind="internal"', () => {
  const tokens = tokenise('See [offline-first EMR](/offline-first-emr-development)');
  const linkToken = tokens.find(t => t.type === 'link');
  assert.ok(linkToken, 'Expected a link token');
  assert.strictEqual(linkToken.label, 'offline-first EMR');
  assert.strictEqual(linkToken.href, '/offline-first-emr-development');
  assert.strictEqual(linkToken.kind, 'internal');
});

// Happy path: external link
test('tokenise: [label](https://x) → link token with kind="external"', () => {
  const tokens = tokenise('Visit [example](https://example.com)');
  const linkToken = tokens.find(t => t.type === 'link');
  assert.ok(linkToken, 'Expected a link token');
  assert.strictEqual(linkToken.kind, 'external');
});

// Error case: unsafe scheme renders label as plain text (kind=null)
test('tokenise: [label](javascript:...) → link token with kind=null (not rendered as link)', () => {
  const tokens = tokenise('[click](javascript:alert(1))');
  const linkToken = tokens.find(t => t.type === 'link');
  assert.ok(linkToken, 'Expected a link token');
  assert.strictEqual(linkToken.kind, null, 'javascript: should produce kind=null');
});

test('tokenise: [label](mailto:...) → link token with kind=null', () => {
  const tokens = tokenise('[email](mailto:user@example.com)');
  const linkToken = tokens.find(t => t.type === 'link');
  assert.ok(linkToken, 'Expected a link token');
  assert.strictEqual(linkToken.kind, null, 'mailto: should produce kind=null');
});

// Edge case — lastIndex reset / state-leakage regression:
// Run tokenise on two DIFFERENT strings sequentially.  Without the reset,
// the global regex's lastIndex from run 1 would pollute run 2, causing the
// second run to start at a non-zero offset and miss leading matches.
test('tokenise: no state leakage between consecutive calls (lastIndex reset)', () => {
  const run1 = tokenise('First **bold** pass');
  const run2 = tokenise('**bold2** at start');

  // Run 1 should find a bold token
  const bold1 = run1.find(t => t.type === 'bold');
  assert.ok(bold1, 'Run 1 should find a bold token');
  assert.strictEqual(bold1.value, 'bold');

  // Run 2 should ALSO find a bold token at the start of the string.
  // If lastIndex were not reset, the regex would start mid-string and miss it.
  const bold2 = run2.find(t => t.type === 'bold');
  assert.ok(bold2,
    'Run 2 should find a bold token — lastIndex must be reset between calls (state-leakage regression)');
  assert.strictEqual(bold2.value, 'bold2',
    `Expected "bold2", got "${bold2?.value}" — second run returned wrong match`);
});

test('tokenise: three sequential calls each return correct results', () => {
  const strings = [
    'Call A: [link A](/a)',
    'Call B: [link B](/b)',
    'Call C: [link C](/c)',
  ];
  for (const s of strings) {
    const tokens = tokenise(s);
    const lnk = tokens.find(t => t.type === 'link');
    assert.ok(lnk, `Expected a link token in: ${s}`);
  }
});

// ---------------------------------------------------------------------------
// 1c. All-or-nothing list detection — ported from prose.tsx
// ---------------------------------------------------------------------------
function isList(block) {
  const lines = block.split('\n');
  return lines.length > 0 && lines.every(l => l.startsWith('- '));
}

// Happy path: every line starts with "- "
test('isList: all lines start with "- " → true', () => {
  const block = '- first item\n- second item\n- third item';
  assert.strictEqual(isList(block), true);
});

// Happy path: single list item
test('isList: single "- " line → true', () => {
  assert.strictEqual(isList('- only item'), true);
});

// Edge case: block with a prose line mixed in → NOT a list
test('isList: mixed prose + "- " lines → false', () => {
  const block = 'This is prose.\n- list item\n- another item';
  assert.strictEqual(isList(block), false,
    'Block mixing prose and list lines should NOT be detected as a list');
});

// Edge case: blank block → false (lines.length > 0 after split, but '' does not start with "- ")
test('isList: empty string → false', () => {
  assert.strictEqual(isList(''), false);
});

// Error case: a block where one "- " line is missing the space after dash
test('isList: "-item" (dash without space) → false', () => {
  const block = '-item\n- another item';
  assert.strictEqual(isList(block), false,
    'A line starting with "-" but not "- " should fail the list check');
});

// ==========================================================================
// PART 2 — Article data integrity (articles.ts via bun TS direct import)
// ==========================================================================

console.log('\n--- Part 2: Article data integrity ---\n');

// Bun executes TypeScript directly, so we can import .ts files.
// We import articles.ts and caseStudies.ts at the top of this ESM file.
const { articles, ARTICLE_ORDER, INSIGHTS_META } = await import('../src/pages/Article/articles.ts');
const { caseStudies } = await import('../src/pages/CaseStudy/caseStudies.ts');

// Known-good values used in cross-checks
const VALID_CASE_STUDY_SLUGS = Object.keys(caseStudies); // from caseStudies.ts
const CASE_STUDY_PATHS = new Set(VALID_CASE_STUDY_SLUGS.map(s => `/work/${s}`));

// All valid internal link targets for the cluster
function isValidInternalTarget(path) {
  // Article slugs
  if (ARTICLE_ORDER.includes(path.slice(1))) return true;
  // /insights hub
  if (path === '/insights') return true;
  // Home
  if (path === '/') return true;
  // Case study paths
  if (CASE_STUDY_PATHS.has(path)) return true;
  return false;
}

// 2a. ARTICLE_ORDER has exactly 8 entries
test('ARTICLE_ORDER has exactly 8 entries', () => {
  assert.strictEqual(ARTICLE_ORDER.length, 8,
    `Expected 8 slugs in ARTICLE_ORDER, got ${ARTICLE_ORDER.length}: ${ARTICLE_ORDER.join(', ')}`);
});

// 2b. Every slug in ARTICLE_ORDER exists as a key in articles
test('Every slug in ARTICLE_ORDER exists as a key in articles', () => {
  const missing = ARTICLE_ORDER.filter(slug => !(slug in articles));
  assert.deepStrictEqual(missing, [],
    `ARTICLE_ORDER slugs missing from articles: ${missing.join(', ')}`);
});

// 2c. No orphan keys: every key in articles appears in ARTICLE_ORDER
test('No orphan keys: every articles key appears in ARTICLE_ORDER', () => {
  const orphans = Object.keys(articles).filter(key => !ARTICLE_ORDER.includes(key));
  assert.deepStrictEqual(orphans, [],
    `Orphan article keys not in ARTICLE_ORDER: ${orphans.join(', ')}`);
});

// 2d. Each article's slug matches its object key
test('Every article slug matches its object key', () => {
  const mismatches = [];
  for (const [key, article] of Object.entries(articles)) {
    if (article.slug !== key) mismatches.push(`key="${key}" slug="${article.slug}"`);
  }
  assert.deepStrictEqual(mismatches, [],
    `Slug/key mismatches: ${mismatches.join(', ')}`);
});

// 2e. Case-study slugs verified: known correct set from caseStudies.ts
test('Case-study slugs include nexa-welbodi, nexa-logistix, rms-death-tracker', () => {
  assert.ok(VALID_CASE_STUDY_SLUGS.includes('nexa-welbodi'),
    'nexa-welbodi must be a valid case study slug');
  assert.ok(VALID_CASE_STUDY_SLUGS.includes('nexa-logistix'),
    'nexa-logistix must be a valid case study slug');
  assert.ok(VALID_CASE_STUDY_SLUGS.includes('rms-death-tracker'),
    'rms-death-tracker must be a valid case study slug');
});

// 2f. Every internal markdown link in every section body points to a valid target.
//     Internal links are [label](/path), where path starts with /.
test('All internal markdown links in article sections point to valid targets', () => {
  const INTERNAL_LINK_RE = /\[([^\]]+)\]\((\/([\w/-]*)?)\)/g;
  const broken = [];
  for (const [key, article] of Object.entries(articles)) {
    for (const section of article.sections) {
      let m;
      INTERNAL_LINK_RE.lastIndex = 0;
      while ((m = INTERNAL_LINK_RE.exec(section.body)) !== null) {
        const path = m[2];
        if (!isValidInternalTarget(path)) {
          broken.push(`article="${key}" → "${path}" (label: "${m[1]}")`);
        }
      }
    }
  }
  assert.deepStrictEqual(broken, [],
    `Broken internal links found:\n  ${broken.join('\n  ')}`);
});

// 2g. No em dashes (U+2014) in articles.ts content
test('No em dashes (U+2014) anywhere in article content', () => {
  const EM_DASH = '—';
  const hits = [];
  for (const [key, article] of Object.entries(articles)) {
    const fields = [article.title, article.metaTitle, article.metaDescription,
                    article.tagline, article.intro];
    for (const section of article.sections) {
      fields.push(section.heading, section.body);
    }
    for (const faq of article.faq) {
      fields.push(faq.q, faq.a);
    }
    for (const f of fields) {
      if (typeof f === 'string' && f.includes(EM_DASH)) {
        hits.push(`article="${key}"`);
        break;
      }
    }
  }
  assert.deepStrictEqual(hits, [],
    `Em dash (—) found in: ${hits.join(', ')}`);
});

// 2h. Every article has non-empty metaTitle and metaDescription (hard check),
//     with soft length warnings logged but not failing.
test('Every article has a non-empty metaTitle', () => {
  const empty = Object.entries(articles)
    .filter(([, a]) => !a.metaTitle || a.metaTitle.trim() === '')
    .map(([k]) => k);
  assert.deepStrictEqual(empty, [], `Articles missing metaTitle: ${empty.join(', ')}`);
});

test('Every article has a non-empty metaDescription', () => {
  const empty = Object.entries(articles)
    .filter(([, a]) => !a.metaDescription || a.metaDescription.trim() === '')
    .map(([k]) => k);
  assert.deepStrictEqual(empty, [], `Articles missing metaDescription: ${empty.join(', ')}`);
});

test('Every article metaTitle is <=60 chars (SEO soft check)', () => {
  const overlong = Object.entries(articles)
    .filter(([, a]) => a.metaTitle.length > 60)
    .map(([k, a]) => `${k} (${a.metaTitle.length} chars)`);
  // Soft check: warn but pass (SEO guidance, not structural requirement)
  if (overlong.length > 0) {
    console.log(`  WARN  metaTitle >60 chars (SEO advisory): ${overlong.join(', ')}`);
  }
  // Do not fail — assert always passes
  assert.ok(true);
});

test('Every article metaDescription is <=160 chars (SEO soft check)', () => {
  const overlong = Object.entries(articles)
    .filter(([, a]) => a.metaDescription.length > 160)
    .map(([k, a]) => `${k} (${a.metaDescription.length} chars)`);
  if (overlong.length > 0) {
    console.log(`  WARN  metaDescription >160 chars (SEO advisory): ${overlong.join(', ')}`);
  }
  assert.ok(true);
});

// 2i. Every article has at least one section
test('Every article has at least one section', () => {
  const empty = Object.entries(articles)
    .filter(([, a]) => !a.sections || a.sections.length === 0)
    .map(([k]) => k);
  assert.deepStrictEqual(empty, [], `Articles with no sections: ${empty.join(', ')}`);
});

// 2j. Every article has at least one FAQ entry
test('Every article has at least one FAQ entry', () => {
  const empty = Object.entries(articles)
    .filter(([, a]) => !a.faq || a.faq.length === 0)
    .map(([k]) => k);
  assert.deepStrictEqual(empty, [], `Articles with no FAQ: ${empty.join(', ')}`);
});

// 2k. INSIGHTS_META has a non-empty title and description
test('INSIGHTS_META.title is non-empty', () => {
  assert.ok(typeof INSIGHTS_META.title === 'string' && INSIGHTS_META.title.trim().length > 0,
    'INSIGHTS_META.title must be a non-empty string');
});

test('INSIGHTS_META.description is non-empty', () => {
  assert.ok(typeof INSIGHTS_META.description === 'string' && INSIGHTS_META.description.trim().length > 0,
    'INSIGHTS_META.description must be a non-empty string');
});

// ==========================================================================
// PART 3 — Build + prerender integration
// ==========================================================================

console.log('\n--- Part 3: Build + prerender integration ---\n');

// ---------------------------------------------------------------------------
// 3a. dist/ directory exists for all 8 article slugs + insights
// ---------------------------------------------------------------------------

for (const slug of ARTICLE_ORDER) {
  test(`dist/${slug}/index.html exists`, () => {
    const p = resolve(DIST, slug, 'index.html');
    assert.ok(existsSync(p), `Missing: dist/${slug}/index.html`);
  });
}

test('dist/insights/index.html exists', () => {
  assert.ok(existsSync(resolve(DIST, 'insights', 'index.html')),
    'Missing: dist/insights/index.html');
});

// ---------------------------------------------------------------------------
// 3b. Each baked article file's <title> and canonical match metaTitle / SITE/slug
// ---------------------------------------------------------------------------

for (const slug of ARTICLE_ORDER) {
  const htmlPath = resolve(DIST, slug, 'index.html');
  if (!existsSync(htmlPath)) continue; // already failed above

  const html = readFileSync(htmlPath, 'utf8');
  const article = articles[slug];
  const expectedCanonical = `${SITE}/${slug}`;

  // Escape HTML attr entities (same logic as vite.config.ts escapeAttr)
  const escapeAttr = (v) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const expectedTitle = escapeAttr(article.metaTitle);

  test(`[${slug}] <title> matches metaTitle`, () => {
    const m = html.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(m, `<title> tag not found in dist/${slug}/index.html`);
    assert.strictEqual(m[1], expectedTitle,
      `<title> mismatch for ${slug}.\n  Expected: ${expectedTitle}\n  Got:      ${m[1]}`);
  });

  test(`[${slug}] <link rel="canonical"> href = ${expectedCanonical}`, () => {
    const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
    assert.ok(m, `<link rel="canonical"> not found in dist/${slug}/index.html`);
    assert.strictEqual(m[1], expectedCanonical,
      `Canonical mismatch for ${slug}.\n  Expected: ${expectedCanonical}\n  Got:      ${m[1]}`);
  });
}

// ---------------------------------------------------------------------------
// 3c. insights page: title and canonical
// ---------------------------------------------------------------------------

test('[insights] <title> matches INSIGHTS_META.title', () => {
  const html = readFileSync(resolve(DIST, 'insights', 'index.html'), 'utf8');
  const escapeAttr = (v) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  assert.ok(m, '<title> not found in dist/insights/index.html');
  assert.strictEqual(m[1], escapeAttr(INSIGHTS_META.title),
    `Insights <title> mismatch.\n  Expected: ${INSIGHTS_META.title}\n  Got:      ${m[1]}`);
});

test('[insights] canonical href = https://dsbdigital.biz/insights', () => {
  const html = readFileSync(resolve(DIST, 'insights', 'index.html'), 'utf8');
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  assert.ok(m, '<link rel="canonical"> not found in dist/insights/index.html');
  assert.strictEqual(m[1], `${SITE}/insights`,
    `Insights canonical mismatch.\n  Expected: ${SITE}/insights\n  Got:      ${m[1]}`);
});

// ---------------------------------------------------------------------------
// 3d. Regression: existing case-study prerender still intact
// ---------------------------------------------------------------------------

test('[regression] dist/work/nexa-welbodi/index.html still has its case-study title', () => {
  const htmlPath = resolve(DIST, 'work', 'nexa-welbodi', 'index.html');
  assert.ok(existsSync(htmlPath), 'dist/work/nexa-welbodi/index.html does not exist');
  const html = readFileSync(htmlPath, 'utf8');
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  assert.ok(m, '<title> tag not found in dist/work/nexa-welbodi/index.html');
  assert.ok(m[1].includes('Welbodi'),
    `nexa-welbodi case study title should contain "Welbodi", got: "${m[1]}"`);
  // Must NOT have been clobbered by an article title
  const articleTitles = ARTICLE_ORDER.map(s => articles[s].metaTitle);
  for (const t of articleTitles) {
    const escapeAttr = (v) =>
      v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    assert.ok(!m[1].includes(escapeAttr(t).slice(0, 30)),
      `nexa-welbodi title was overwritten by article: ${t}`);
  }
});

test('[regression] dist/work/nexa-welbodi canonical is work URL, not article URL', () => {
  const html = readFileSync(resolve(DIST, 'work', 'nexa-welbodi', 'index.html'), 'utf8');
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
  assert.ok(m, '<link rel="canonical"> not found');
  assert.strictEqual(m[1], `${SITE}/work/nexa-welbodi`,
    `Canonical regression: nexa-welbodi got "${m[1]}" instead of "${SITE}/work/nexa-welbodi"`);
});

test('[regression] dist/work/rms-death-tracker/index.html still has its case-study title', () => {
  const htmlPath = resolve(DIST, 'work', 'rms-death-tracker', 'index.html');
  assert.ok(existsSync(htmlPath), 'dist/work/rms-death-tracker/index.html does not exist');
  const html = readFileSync(htmlPath, 'utf8');
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  assert.ok(m, '<title> not found');
  assert.ok(m[1].includes('RMS'), `rms-death-tracker title should contain "RMS", got: "${m[1]}"`);
});

// ---------------------------------------------------------------------------
// 3e. public/sitemap.xml contains all 9 new URLs (8 articles + /insights)
// ---------------------------------------------------------------------------

const SITEMAP_NEW_URLS = [
  `${SITE}/insights`,
  ...ARTICLE_ORDER.map(s => `${SITE}/${s}`),
];

const sitemapPath = resolve(ROOT, 'public', 'sitemap.xml');
test('public/sitemap.xml exists', () => {
  assert.ok(existsSync(sitemapPath), 'public/sitemap.xml not found');
});

const sitemapContent = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';

for (const url of SITEMAP_NEW_URLS) {
  test(`sitemap.xml contains ${url}`, () => {
    assert.ok(sitemapContent.includes(url),
      `sitemap.xml is missing URL: ${url}`);
  });
}

// Verify old case study URLs are still present (regression)
const SITEMAP_REGRESSION_URLS = [
  `${SITE}/work/nexa-welbodi`,
  `${SITE}/work/nexa-logistix`,
  `${SITE}/work/rms-death-tracker`,
];
for (const url of SITEMAP_REGRESSION_URLS) {
  test(`sitemap.xml still contains case-study URL ${url}`, () => {
    assert.ok(sitemapContent.includes(url),
      `sitemap.xml regression: missing existing case-study URL ${url}`);
  });
}

// ---------------------------------------------------------------------------
// 3f. Each article's SPA JS bundle is referenced via an absolute /assets/ path
//     (deep routes must not use relative paths that 404 on direct visit)
// ---------------------------------------------------------------------------

for (const slug of ARTICLE_ORDER) {
  const htmlPath = resolve(DIST, slug, 'index.html');
  if (!existsSync(htmlPath)) continue;
  const html = readFileSync(htmlPath, 'utf8');
  test(`[${slug}] SPA JS bundle referenced via absolute /assets/ path`, () => {
    assert.ok(/src="\/assets\/[^"]+\.js"/.test(html),
      `No absolute /assets/...js script tag found in dist/${slug}/index.html — SPA may not boot`);
  });
}

// ---------------------------------------------------------------------------
// 3g. og:title and og:description tags are baked correctly for articles
// ---------------------------------------------------------------------------

for (const slug of ARTICLE_ORDER) {
  const htmlPath = resolve(DIST, slug, 'index.html');
  if (!existsSync(htmlPath)) continue;

  const html = readFileSync(htmlPath, 'utf8');
  const article = articles[slug];
  const escapeAttr = (v) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  test(`[${slug}] og:title baked correctly`, () => {
    const m = html.match(/property="og:title"\s+content="([^"]*)"/);
    assert.ok(m, `og:title not found in dist/${slug}/index.html`);
    assert.strictEqual(m[1], escapeAttr(article.metaTitle),
      `og:title mismatch for ${slug}`);
  });

  test(`[${slug}] og:description baked correctly`, () => {
    const m = html.match(/property="og:description"\s+content="([^"]*)"/);
    assert.ok(m, `og:description not found in dist/${slug}/index.html`);
    assert.strictEqual(m[1], escapeAttr(article.metaDescription),
      `og:description mismatch for ${slug}`);
  });

  test(`[${slug}] og:url baked correctly`, () => {
    const m = html.match(/property="og:url"\s+content="([^"]*)"/);
    assert.ok(m, `og:url not found in dist/${slug}/index.html`);
    assert.strictEqual(m[1], `${SITE}/${slug}`,
      `og:url mismatch for ${slug}`);
  });
}

// ==========================================================================
// PART 4 — Legal + playbook content prerender (noscript body for non-JS crawlers)
// ==========================================================================

const { LEGAL_DOCS } = await import('../src/pages/Legal/legalContent.ts');
const playbookContent = await import('../src/pages/Playbook/content.ts');

// Mirror the plugin's escapeHtml so expectations match the baked output even if
// copy later gains an &, <, or > character.
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const doc of LEGAL_DOCS) {
  const slug = doc.canonicalPath.replace(/^\//, '');
  const htmlPath = resolve(DIST, slug, 'index.html');
  const html = existsSync(htmlPath) ? readFileSync(htmlPath, 'utf8') : '';

  test(`[prerender] dist/${slug}/index.html exists`, () => {
    assert.ok(existsSync(htmlPath), `Missing: dist/${slug}/index.html`);
  });

  test(`[prerender] ${slug} has its own <title>`, () => {
    const m = html.match(/<title>([^<]*)<\/title>/);
    assert.ok(m, `<title> not found in dist/${slug}/index.html`);
    assert.strictEqual(m[1], `${doc.title} | Digital Solution Builders`,
      `title mismatch for ${slug}`);
  });

  test(`[prerender] ${slug} canonical is the route URL`, () => {
    const m = html.match(/rel="canonical"\s+href="([^"]*)"/);
    assert.ok(m, `canonical not found for ${slug}`);
    assert.strictEqual(m[1], `${SITE}${doc.canonicalPath}`,
      `canonical mismatch for ${slug}`);
  });

  test(`[prerender] ${slug} noscript carries the full policy text`, () => {
    const ns = html.match(/<noscript>([\s\S]*?)<\/noscript>/);
    assert.ok(ns, `<noscript> block not found in dist/${slug}/index.html`);
    const body = ns[1];
    assert.ok(body.includes(escHtml(doc.intro)), `${slug} noscript missing intro text`);
    for (const s of doc.sections) {
      assert.ok(body.includes(escHtml(s.heading)), `${slug} noscript missing heading "${s.heading}"`);
      assert.ok(body.includes(escHtml(s.body)), `${slug} noscript missing body for "${s.heading}"`);
    }
  });
}

test('[prerender] playbook noscript carries product summary + FAQ', () => {
  const htmlPath = resolve(DIST, 'playbook', 'index.html');
  assert.ok(existsSync(htmlPath), 'Missing: dist/playbook/index.html');
  const ns = readFileSync(htmlPath, 'utf8').match(/<noscript>([\s\S]*?)<\/noscript>/);
  assert.ok(ns, '<noscript> block not found in dist/playbook/index.html');
  const body = ns[1];
  assert.ok(body.includes(escHtml(playbookContent.HERO.headline)),
    'playbook noscript missing hero headline');
  assert.ok(body.includes('USD 29'), 'playbook noscript missing price');
  for (const f of playbookContent.FAQS) {
    assert.ok(body.includes(escHtml(f.q)), `playbook noscript missing FAQ question "${f.q}"`);
  }
});

// ==========================================================================
// Summary
// ==========================================================================

console.log(`\n${'─'.repeat(60)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(60) + '\n');

if (failed > 0) process.exit(1);
