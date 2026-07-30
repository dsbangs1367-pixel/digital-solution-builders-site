/**
 * case-studies.smoke.mjs
 *
 * Standalone assertion script for the case studies added since the original
 * portfolio launch: nexa-continuum, salone-gospel-hub, and prime-care.
 *
 * Run:  bun tests/case-studies.smoke.mjs
 *
 * Covers:
 *   Part 1 — caseStudies.ts data integrity for the slugs in NEW_SLUGS
 *   Part 2 — CASE_STUDY_SLUGS in Home/index.tsx includes the new slugs
 *   Part 3 — Hero image PNGs exist under public/projects/
 *   Part 4 — dist/work/<slug>/index.html exists and has correct baked meta
 *   Part 5 — public/sitemap.xml contains each /work/<slug> URL
 *   Part 6 — Edge cases: accent hex, slug/heroImage alignment, no stale omissions
 *   Part 7 — Prime Care-specific assertions (liveUrl, accent, og:image, services, stat shape)
 *   Part 8 — salone-gospel-hub content-refresh assertions
 *   Part 9 — SHARE_SLUGS parity with caseStudies.ts (analytics allowlist)
 */

import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const PUBLIC = resolve(ROOT, 'public');
const SITE = 'https://dsbdigital.biz';

// ---------------------------------------------------------------------------
// Tiny test runner (same pattern as existing smoke suites)
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

// Helper: HTML-attribute escaping (mirrors vite.config.ts escapeAttr)
function escapeAttr(v) {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Import source data via bun's native TS support
// ---------------------------------------------------------------------------
const { caseStudies } = await import('../src/pages/CaseStudy/caseStudies.ts');

// The slugs added to the portfolio since the original launch
const NEW_SLUGS = ['nexa-continuum', 'salone-gospel-hub', 'prime-care', 'nexa-fleet'];

// ==========================================================================
// PART 1 — caseStudies.ts data integrity for the new entries
// ==========================================================================

console.log('\n--- Part 1: caseStudies.ts data integrity ---\n');

// Happy path: both slugs are present as keys in caseStudies
test('caseStudies contains nexa-continuum key', () => {
  assert.ok('nexa-continuum' in caseStudies,
    'nexa-continuum is missing from caseStudies record');
});

test('caseStudies contains salone-gospel-hub key', () => {
  assert.ok('salone-gospel-hub' in caseStudies,
    'salone-gospel-hub is missing from caseStudies record');
});

test('caseStudies contains prime-care key', () => {
  assert.ok('prime-care' in caseStudies,
    'prime-care is missing from caseStudies record');
});

// Each new entry: slug field matches its key
for (const slug of NEW_SLUGS) {
  test(`[${slug}] slug field matches its object key`, () => {
    assert.strictEqual(caseStudies[slug].slug, slug,
      `caseStudies["${slug}"].slug !== "${slug}"`);
  });
}

// Each new entry: required string fields are non-empty
const REQUIRED_FIELDS = ['title', 'category', 'tagline', 'accent', 'heroImage',
                         'heroImageAlt', 'liveUrl', 'liveLabel',
                         'metaTitle', 'metaDescription', 'intro'];

for (const slug of NEW_SLUGS) {
  for (const field of REQUIRED_FIELDS) {
    test(`[${slug}] ${field} is a non-empty string`, () => {
      const val = caseStudies[slug][field];
      assert.ok(typeof val === 'string' && val.trim().length > 0,
        `caseStudies["${slug}"].${field} is empty or missing`);
    });
  }
}

// Each new entry: has at least one stat and one section
for (const slug of NEW_SLUGS) {
  test(`[${slug}] has at least one stat`, () => {
    const { stats } = caseStudies[slug];
    assert.ok(Array.isArray(stats) && stats.length > 0,
      `caseStudies["${slug}"].stats is empty`);
  });

  test(`[${slug}] has at least one section with non-empty heading and body`, () => {
    const { sections } = caseStudies[slug];
    assert.ok(Array.isArray(sections) && sections.length > 0,
      `caseStudies["${slug}"].sections is empty`);
    for (const s of sections) {
      assert.ok(s.heading && s.heading.trim().length > 0,
        `[${slug}] a section has an empty heading`);
      assert.ok(s.body && s.body.trim().length > 0,
        `[${slug}] a section has an empty body`);
    }
  });
}

// Note: em dashes (U+2014) are intentional and accepted in caseStudies.ts prose
// (all existing case studies use them). The no-em-dash rule applies only to
// articles.ts content (enforced in seo-cluster.smoke.mjs Part 2g).

// ==========================================================================
// PART 2 — CASE_STUDY_SLUGS in Home/index.tsx includes both new slugs
// ==========================================================================

console.log('\n--- Part 2: CASE_STUDY_SLUGS in Home/index.tsx ---\n');

// Parse the source file with a regex rather than importing TSX (which requires
// JSX transform). The CASE_STUDY_SLUGS Set literal is stable and unambiguous.
const homeSource = readFileSync(resolve(ROOT, 'src', 'pages', 'Home', 'index.tsx'), 'utf8');

// Extract the CASE_STUDY_SLUGS block: everything between `new Set([` and `]);`
const setMatch = homeSource.match(/const CASE_STUDY_SLUGS\s*=\s*new Set\(\[([\s\S]*?)\]\)/);

test('CASE_STUDY_SLUGS Set is present in Home/index.tsx', () => {
  assert.ok(setMatch, 'Could not find CASE_STUDY_SLUGS = new Set([...]) in Home/index.tsx');
});

// Happy path: both new slugs appear inside the CASE_STUDY_SLUGS Set literal
test('CASE_STUDY_SLUGS includes nexa-continuum', () => {
  assert.ok(setMatch && setMatch[1].includes("'nexa-continuum'"),
    "nexa-continuum is missing from CASE_STUDY_SLUGS in Home/index.tsx");
});

test('CASE_STUDY_SLUGS includes salone-gospel-hub', () => {
  assert.ok(setMatch && setMatch[1].includes("'salone-gospel-hub'"),
    "salone-gospel-hub is missing from CASE_STUDY_SLUGS in Home/index.tsx");
});

test('CASE_STUDY_SLUGS includes prime-care', () => {
  assert.ok(setMatch && setMatch[1].includes("'prime-care'"),
    "prime-care is missing from CASE_STUDY_SLUGS in Home/index.tsx");
});

// Edge case: every slug in caseStudies.ts should have a corresponding entry in
// CASE_STUDY_SLUGS — a slug that has a case study page but is missing from the
// set means the "View case study" link never renders on the homepage card.
test('Every slug in caseStudies.ts appears in CASE_STUDY_SLUGS', () => {
  if (!setMatch) return; // already failed above
  const missingFromSet = Object.keys(caseStudies).filter(
    slug => !setMatch[1].includes(`'${slug}'`)
  );
  assert.deepStrictEqual(missingFromSet, [],
    `Slugs in caseStudies.ts but missing from CASE_STUDY_SLUGS: ${missingFromSet.join(', ')}`);
});

// Edge case: both new slugs also appear in the projects array inside Home/index.tsx
test('projects array in Home/index.tsx contains nexa-continuum entry', () => {
  assert.ok(homeSource.includes("slug: 'nexa-continuum'"),
    "No project entry with slug 'nexa-continuum' found in Home/index.tsx projects array");
});

test('projects array in Home/index.tsx contains salone-gospel-hub entry', () => {
  assert.ok(homeSource.includes("slug: 'salone-gospel-hub'"),
    "No project entry with slug 'salone-gospel-hub' found in Home/index.tsx projects array");
});

test('projects array in Home/index.tsx contains prime-care entry', () => {
  assert.ok(homeSource.includes("slug: 'prime-care'"),
    "No project entry with slug 'prime-care' found in Home/index.tsx projects array");
});

// ==========================================================================
// PART 3 — Hero image PNGs exist under public/projects/
// ==========================================================================

console.log('\n--- Part 3: Hero image PNGs in public/projects/ ---\n');

// Happy path: both expected PNG files exist
for (const slug of NEW_SLUGS) {
  const cs = caseStudies[slug];
  // heroImage is like "/projects/nexa-continuum.png"
  const expectedPath = resolve(PUBLIC, ...cs.heroImage.split('/').filter(Boolean));

  test(`[${slug}] hero image file exists at public${cs.heroImage}`, () => {
    assert.ok(existsSync(expectedPath),
      `Hero image missing: public${cs.heroImage}`);
  });

  // The heroImage field must reference a .png file
  test(`[${slug}] heroImage field ends with .png`, () => {
    assert.ok(cs.heroImage.toLowerCase().endsWith('.png'),
      `caseStudies["${slug}"].heroImage should end with .png, got: ${cs.heroImage}`);
  });
}

// Edge case: heroImage path in caseStudies.ts must start with /projects/
for (const slug of NEW_SLUGS) {
  test(`[${slug}] heroImage path starts with /projects/`, () => {
    assert.ok(caseStudies[slug].heroImage.startsWith('/projects/'),
      `caseStudies["${slug}"].heroImage should start with /projects/, got: ${caseStudies[slug].heroImage}`);
  });
}

// Edge case: accent is a valid CSS hex color (#rrggbb or #rgb, case-insensitive)
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
for (const slug of NEW_SLUGS) {
  test(`[${slug}] accent is a valid CSS hex color`, () => {
    const { accent } = caseStudies[slug];
    assert.ok(HEX_COLOR_RE.test(accent),
      `caseStudies["${slug}"].accent is not a valid 3- or 6-digit hex color: "${accent}"`);
  });
}

// ==========================================================================
// PART 4 — dist/work/<slug>/index.html: existence + baked meta correctness
// ==========================================================================

console.log('\n--- Part 4: Prerendered HTML correctness ---\n');

for (const slug of NEW_SLUGS) {
  const cs = caseStudies[slug];
  const htmlPath = resolve(DIST, 'work', slug, 'index.html');
  const expectedUrl = `${SITE}/work/${slug}`;
  const expectedImage = `${SITE}${cs.heroImage}`;
  const escapedTitle = escapeAttr(cs.metaTitle);
  const escapedDesc = escapeAttr(cs.metaDescription);

  // Happy path: the prerendered file exists
  test(`[${slug}] dist/work/${slug}/index.html exists`, () => {
    assert.ok(existsSync(htmlPath),
      `dist/work/${slug}/index.html is missing — prerender may have failed`);
  });

  if (!existsSync(htmlPath)) continue; // avoid cascading failures on missing file

  const html = readFileSync(htmlPath, 'utf8');

  // <title>
  test(`[${slug}] <title> equals metaTitle (HTML-escaped)`, () => {
    const m = html.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(m, `<title> tag not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], escapedTitle,
      `<title> mismatch for ${slug}.\n  Expected: ${escapedTitle}\n  Got:      ${m[1]}`);
  });

  // <meta name="description">
  test(`[${slug}] <meta name="description"> equals metaDescription`, () => {
    const m = html.match(/name="description"\s+content="([^"]*)"/);
    assert.ok(m, `<meta name="description"> not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], escapedDesc,
      `description mismatch for ${slug}`);
  });

  // <link rel="canonical">
  test(`[${slug}] <link rel="canonical"> href = ${expectedUrl}`, () => {
    const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
    assert.ok(m, `<link rel="canonical"> not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], expectedUrl,
      `Canonical mismatch for ${slug}.\n  Expected: ${expectedUrl}\n  Got:      ${m[1]}`);
  });

  // Exactly one canonical (no duplicate injection)
  test(`[${slug}] contains exactly one <link rel="canonical">`, () => {
    const matches = html.match(/<link\s+rel="canonical"/g) ?? [];
    assert.strictEqual(matches.length, 1,
      `Expected exactly 1 canonical link in ${slug}, found ${matches.length}`);
  });

  // og:url
  test(`[${slug}] og:url baked correctly`, () => {
    const m = html.match(/property="og:url"\s+content="([^"]*)"/);
    assert.ok(m, `og:url not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], expectedUrl, `og:url mismatch for ${slug}`);
  });

  // og:title
  test(`[${slug}] og:title baked correctly`, () => {
    const m = html.match(/property="og:title"\s+content="([^"]*)"/);
    assert.ok(m, `og:title not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], escapedTitle, `og:title mismatch for ${slug}`);
  });

  // og:description
  test(`[${slug}] og:description baked correctly`, () => {
    const m = html.match(/property="og:description"\s+content="([^"]*)"/);
    assert.ok(m, `og:description not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], escapedDesc, `og:description mismatch for ${slug}`);
  });

  // og:image
  test(`[${slug}] og:image equals ${expectedImage}`, () => {
    const m = html.match(/property="og:image"\s+content="([^"]*)"/);
    assert.ok(m, `og:image not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], expectedImage, `og:image mismatch for ${slug}`);
  });

  // og:image:width and og:image:height must be stripped (screenshots, not 1200x630)
  test(`[${slug}] no og:image:width in output`, () => {
    assert.ok(!html.includes('og:image:width'),
      `og:image:width should be stripped from dist/work/${slug}/index.html`);
  });

  test(`[${slug}] no og:image:height in output`, () => {
    assert.ok(!html.includes('og:image:height'),
      `og:image:height should be stripped from dist/work/${slug}/index.html`);
  });

  // twitter:title
  test(`[${slug}] twitter:title baked correctly`, () => {
    const m = html.match(/name="twitter:title"\s+content="([^"]*)"/);
    assert.ok(m, `twitter:title not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], escapedTitle, `twitter:title mismatch for ${slug}`);
  });

  // twitter:url
  test(`[${slug}] twitter:url baked correctly`, () => {
    const m = html.match(/name="twitter:url"\s+content="([^"]*)"/);
    assert.ok(m, `twitter:url not found in dist/work/${slug}/index.html`);
    assert.strictEqual(m[1], expectedUrl, `twitter:url mismatch for ${slug}`);
  });

  // SPA JS bundle must use absolute /assets/ path so deep routes don't 404
  test(`[${slug}] SPA JS bundle referenced via absolute /assets/ path`, () => {
    assert.ok(/src="\/assets\/[^"]+\.js"/.test(html),
      `No absolute /assets/...js script tag found in dist/work/${slug}/index.html — SPA may not boot`);
  });

  // Canonical must NOT be the home canonical
  test(`[${slug}] canonical is NOT the home URL (prerender did not no-op)`, () => {
    const m = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/);
    if (m) {
      assert.notStrictEqual(m[1], `${SITE}/`,
        `${slug} canonical is still the home URL — prerender may not have run`);
    }
  });
}

// Title identity + cross-contamination guard.
//
// prerenderCaseStudyOg clones one dist/index.html per slug and rewrites the
// head in place, so a bug in the loop shows up as the right file carrying
// another entry's title. Each slug gets a token that appears in its own title
// and in nobody else's, then we assert presence for its own and absence for
// every other. Tokens must be distinctive: "Nexa-" is shared by four slugs and
// would make every assertion pass vacuously.
const TITLE_TOKENS = {
  'nexa-continuum': 'Continuum',
  'salone-gospel-hub': 'Gospel',
  'prime-care': 'Prime Care',
  'nexa-fleet': 'Waka',
  'freetown-city-os': 'City OS',
  'nexa-sabi': 'Sabi',
  'nexa-scribe': 'Scribe',
  'nexa-kopo': 'Kopo',
};

// Guard the guard: a token that is a substring of another entry's title would
// make the cross-contamination assertions fire on correct output.
test('TITLE_TOKENS are mutually exclusive across every case-study title', () => {
  for (const [slug, token] of Object.entries(TITLE_TOKENS)) {
    const bleed = Object.keys(caseStudies).filter(
      other => other !== slug && caseStudies[other].metaTitle.includes(token)
    );
    assert.deepStrictEqual(bleed, [],
      `Token "${token}" (for ${slug}) also appears in the title of: ${bleed.join(', ')}`);
  }
});

for (const slug of Object.keys(TITLE_TOKENS)) {
  if (!(slug in caseStudies)) continue; // token declared ahead of the entry

  test(`[${slug}] <title> contains "${TITLE_TOKENS[slug]}"`, () => {
    const htmlPath = resolve(DIST, 'work', slug, 'index.html');
    if (!existsSync(htmlPath)) {
      assert.fail(`dist/work/${slug}/index.html not found`);
    }
    const html = readFileSync(htmlPath, 'utf8');
    const m = html.match(/<title>([\s\S]*?)<\/title>/);
    assert.ok(m && m[1].includes(TITLE_TOKENS[slug]),
      `${slug} <title> does not contain "${TITLE_TOKENS[slug]}": got "${m?.[1]}"`);
  });

  test(`[${slug}] <title> carries no other entry's token (no title swap)`, () => {
    const htmlPath = resolve(DIST, 'work', slug, 'index.html');
    if (!existsSync(htmlPath)) return; // already caught above
    const html = readFileSync(htmlPath, 'utf8');
    const m = html.match(/<title>([\s\S]*?)<\/title>/);
    if (!m) return;
    const foreign = Object.entries(TITLE_TOKENS)
      .filter(([other, token]) => other !== slug && m[1].includes(token))
      .map(([other]) => other);
    assert.deepStrictEqual(foreign, [],
      `${slug} <title> carries tokens belonging to ${foreign.join(', ')}: got "${m[1]}"`);
  });
}

// ==========================================================================
// PART 5 — public/sitemap.xml contains both new /work/<slug> URLs
// ==========================================================================

console.log('\n--- Part 5: sitemap.xml coverage ---\n');

const sitemapPath = resolve(PUBLIC, 'sitemap.xml');

test('public/sitemap.xml exists', () => {
  assert.ok(existsSync(sitemapPath), 'public/sitemap.xml not found');
});

const sitemapContent = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';

// Happy path: both new case study URLs are present
for (const slug of NEW_SLUGS) {
  const expectedUrl = `${SITE}/work/${slug}`;
  test(`sitemap.xml contains ${expectedUrl}`, () => {
    assert.ok(sitemapContent.includes(expectedUrl),
      `sitemap.xml is missing URL: ${expectedUrl}`);
  });
}

// Regression: existing case study URLs are still present
const REGRESSION_URLS = [
  `${SITE}/work/nexa-welbodi`,
  `${SITE}/work/nexa-logistix`,
  `${SITE}/work/rms-death-tracker`,
  `${SITE}/work/vocal-drift-inspire`,
  `${SITE}/work/nexa-synapse`,
];
for (const url of REGRESSION_URLS) {
  test(`sitemap.xml still contains existing case-study URL ${url}`, () => {
    assert.ok(sitemapContent.includes(url),
      `sitemap.xml regression: missing existing case-study URL ${url}`);
  });
}

// Edge case: every slug in caseStudies.ts has a /work/<slug> entry in sitemap.xml
test('Every caseStudies.ts slug appears in sitemap.xml', () => {
  const missing = Object.keys(caseStudies).filter(
    slug => !sitemapContent.includes(`${SITE}/work/${slug}`)
  );
  assert.deepStrictEqual(missing, [],
    `Slugs in caseStudies.ts missing from sitemap.xml: ${missing.join(', ')}`);
});

// Edge case: sitemap entries use the correct base URL (not localhost or other)
test('All new sitemap entries use https://dsbdigital.biz as base', () => {
  for (const slug of NEW_SLUGS) {
    const wrongBase = `http://dsbdigital.biz/work/${slug}`;
    assert.ok(!sitemapContent.includes(wrongBase),
      `sitemap.xml has http:// (not https://) for ${slug}`);
  }
});

// ==========================================================================
// PART 6 — Additional edge cases
// ==========================================================================

console.log('\n--- Part 6: Additional edge cases ---\n');

// Tripwire on the entry count. Bump it deliberately when adding a case study,
// so an accidental deletion or a bad merge cannot pass unnoticed.
const EXPECTED_CASE_STUDIES = 9;
test(`caseStudies.ts has exactly ${EXPECTED_CASE_STUDIES} entries`, () => {
  const count = Object.keys(caseStudies).length;
  assert.strictEqual(count, EXPECTED_CASE_STUDIES,
    `Expected ${EXPECTED_CASE_STUDIES} entries in caseStudies, got ${count}. Update this test if adding more.`);
});

// All slugs in caseStudies must follow the kebab-case slug pattern
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
test('All caseStudies slugs are valid kebab-case', () => {
  const invalid = Object.keys(caseStudies).filter(slug => !SLUG_RE.test(slug));
  assert.deepStrictEqual(invalid, [],
    `Invalid slug format (must be kebab-case): ${invalid.join(', ')}`);
});

// heroImage for each new case study must reference a different file
// (not accidentally pointing to a shared placeholder)
test('All NEW_SLUGS heroImages are distinct', () => {
  const seen = new Map();
  for (const slug of NEW_SLUGS) {
    const img = caseStudies[slug].heroImage;
    if (seen.has(img)) {
      assert.fail(
        `Duplicate heroImage path (${img}) shared between "${seen.get(img)}" and "${slug}" — likely a copy-paste error`,
      );
    }
    seen.set(img, slug);
  }
});

// heroImage filename must contain the slug, so the image file is trivially
// traceable to its case study. Scoped to NEW_SLUGS on purpose: two of the
// original entries predate the convention (nexa-logistix uses nexa-lmis.png,
// rms-death-tracker uses nexa-rms.png) and renaming them would break the
// already-cached social OG images.
for (const slug of NEW_SLUGS) {
  test(`[${slug}] heroImage filename contains "${slug}"`, () => {
    const { heroImage } = caseStudies[slug];
    assert.ok(heroImage.includes(slug),
      `${slug} heroImage ("${heroImage}") should contain "${slug}" in its filename`);
  });
}

// Card and case study are two hand-maintained copies of the same entry. A card
// pointing at a different image than its case study renders a homepage
// thumbnail that does not match the page it links to, and nothing else catches
// it: both files typecheck, both build, and the mismatch is only visible by
// clicking through.
for (const slug of Object.keys(caseStudies)) {
  test(`[${slug}] homepage card image matches the case-study heroImage`, () => {
    const entry = homeSource.match(
      new RegExp(`slug: '${slug}',[\\s\\S]{0,3000}?image: '([^']+)'`)
    );
    assert.ok(entry, `No projects[] entry with an image found for slug '${slug}' in Home/index.tsx`);
    assert.strictEqual(entry[1], caseStudies[slug].heroImage,
      `Card image for ${slug} ("${entry[1]}") differs from its heroImage ("${caseStudies[slug].heroImage}")`);
  });
}

// Forward-compatibility tripwire.
//
// Entries authored from 2026-07-30 on are written em-dash free so they survive
// the pending brand rebrand, which enforces a site-wide no-em-dash rule across
// all of src/. The eight older entries are exempt and get converted as part of
// that cutover, not here, so this list is deliberately narrower than NEW_SLUGS.
const EM_DASH = '—';
const EM_DASH_FREE_SLUGS = [
  'nexa-fleet',
  'freetown-city-os',
  'nexa-sabi',
  'nexa-scribe',
  'nexa-kopo',
];
const PROSE_FIELDS = ['title', 'tagline', 'intro', 'metaTitle', 'metaDescription', 'heroImageAlt'];

for (const slug of EM_DASH_FREE_SLUGS) {
  if (!(slug in caseStudies)) continue; // listed ahead of the entry landing

  test(`[${slug}] prose is free of em dashes`, () => {
    const cs = caseStudies[slug];
    const offenders = PROSE_FIELDS.filter(f => cs[f].includes(EM_DASH));
    cs.sections.forEach((s, i) => {
      if (s.heading.includes(EM_DASH)) offenders.push(`sections[${i}].heading`);
      if (s.body.includes(EM_DASH)) offenders.push(`sections[${i}].body`);
    });
    assert.deepStrictEqual(offenders, [],
      `${slug} uses em dashes in: ${offenders.join(', ')}. Use a colon, comma or parentheses instead.`);
  });
}

// ==========================================================================
// PART 7 — prime-care-specific edge cases (new additions)
// ==========================================================================

console.log('\n--- Part 7: prime-care-specific edge cases ---\n');

// Happy path: prime-care liveUrl resolves to the real primecaresl.com domain,
// NOT the contact-form fallback (#contact) that nexa-continuum still uses.
test('[prime-care] liveUrl points to primecaresl.com (not contact-form fallback)', () => {
  const { liveUrl } = caseStudies['prime-care'];
  assert.ok(
    liveUrl.includes('primecaresl.com'),
    `prime-care liveUrl should contain "primecaresl.com", got: "${liveUrl}"`
  );
  assert.ok(
    !liveUrl.includes('#contact'),
    `prime-care liveUrl should not be the contact-form fallback (#contact), got: "${liveUrl}"`
  );
});

// Edge case: prime-care accent must be exactly the brand teal #087E8B.
// Continuum uses #0d655e; a copy-paste error would produce the wrong teal shade.
test('[prime-care] accent is exactly the Prime Care brand teal #087E8B', () => {
  const { accent } = caseStudies['prime-care'];
  assert.strictEqual(
    accent.toUpperCase(),
    '#087E8B',
    `prime-care accent should be #087E8B (brand teal), got: "${accent}"`
  );
});

// Edge case: the prerendered og:image for prime-care must point at
// https://dsbdigital.biz/projects/prime-care.png — not a different case study's image.
// (This is a standalone assertion separate from the loop in Part 4, to make the
// prime-care-specific requirement explicit and independently catchable.)
test('[prime-care] prerendered og:image path ends with /projects/prime-care.png', () => {
  const htmlPath = resolve(DIST, 'work', 'prime-care', 'index.html');
  if (!existsSync(htmlPath)) {
    assert.fail('dist/work/prime-care/index.html not found');
  }
  const html = readFileSync(htmlPath, 'utf8');
  const m = html.match(/property="og:image"\s+content="([^"]*)"/);
  assert.ok(m, 'og:image meta tag not found in dist/work/prime-care/index.html');
  assert.ok(
    m[1].endsWith('/projects/prime-care.png'),
    `prime-care og:image should end with /projects/prime-care.png, got: "${m[1]}"`
  );
});

// Edge case: prime-care services array must include 'Booking Integration'
// (differentiates it from the plain website builds and reflects the bridge integration).
test('[prime-care] services array includes "Booking Integration"', () => {
  const { services } = caseStudies['prime-care'];
  assert.ok(
    Array.isArray(services) && services.includes('Booking Integration'),
    `prime-care services should include "Booking Integration", got: ${JSON.stringify(services)}`
  );
});

// Edge case: prime-care has exactly 3 stats (matching the "3 Specialties" tagline).
test('[prime-care] has exactly 3 stats entries', () => {
  const { stats } = caseStudies['prime-care'];
  assert.strictEqual(
    stats.length,
    3,
    `prime-care should have exactly 3 stats, got ${stats.length}: ${JSON.stringify(stats)}`
  );
});

// Edge case: liveLabel must match the domain in liveUrl (no stale placeholder text).
// Regression guard against a label like "In development — get in touch" being left over.
test('[prime-care] liveLabel reflects the live primecaresl.com domain', () => {
  const { liveLabel } = caseStudies['prime-care'];
  assert.ok(
    liveLabel.toLowerCase().includes('primecaresl'),
    `prime-care liveLabel should reference primecaresl.com, got: "${liveLabel}"`
  );
});

// ==========================================================================
// PART 8 — salone-gospel-hub content-refresh assertions (2026-07-01)
//
// These four tests confirm the three changed surfaces in caseStudies.ts
// (stats[2].value, metaDescription, heroImageAlt) and the sitemap lastmod bump
// were actually applied.  They key on stable feature-noun tokens ("Community",
// "Support", "tipping") and a specific date, not on word-for-word prose, so
// they will not flake on routine copy tweaks.
// ==========================================================================

console.log('\n--- Part 8: salone-gospel-hub content-refresh (2026-07-01) ---\n');

// Happy path: the third stat value reflects all three surfaces introduced in the
// refresh — Directory (pre-existing), Community (new feed), Support (new tipping
// flow).  Both tokens must be present; absence of either means a stale value.
test('[salone-gospel-hub] stats[2].value contains "Community" and "Support"', () => {
  const { stats } = caseStudies['salone-gospel-hub'];
  assert.ok(Array.isArray(stats) && stats.length >= 3,
    'salone-gospel-hub must have at least 3 stat entries');
  const val = stats[2].value;
  assert.ok(val.includes('Community'),
    `stats[2].value should contain "Community" (new community-updates surface), got: "${val}"`);
  assert.ok(val.includes('Support'),
    `stats[2].value should contain "Support" (new tipping-flow surface), got: "${val}"`);
});

// Happy path: the metaDescription mentions the community-updates feature noun and
// at least one of the tipping-flow nouns.  Using two independent token checks so
// a future synonym swap ("tip" → "donate") only fails the relevant one.
test('[salone-gospel-hub] metaDescription mentions "community" and "tipping" feature nouns', () => {
  const { metaDescription } = caseStudies['salone-gospel-hub'];
  const lower = metaDescription.toLowerCase();
  assert.ok(lower.includes('community'),
    `salone-gospel-hub metaDescription should mention "community" (community-updates feature), got: "${metaDescription}"`);
  assert.ok(lower.includes('tipping') || lower.includes('support this ministry'),
    `salone-gospel-hub metaDescription should mention "tipping" or "support this ministry" (tipping-flow feature), got: "${metaDescription}"`);
});

// Edge case: heroImageAlt must describe both new UI surfaces so screen readers
// and crawlers see an accurate description of the screenshot.
test('[salone-gospel-hub] heroImageAlt mentions "community" and "support" surfaces', () => {
  const { heroImageAlt } = caseStudies['salone-gospel-hub'];
  const lower = heroImageAlt.toLowerCase();
  assert.ok(lower.includes('community'),
    `salone-gospel-hub heroImageAlt should mention "community" surface, got: "${heroImageAlt}"`);
  assert.ok(lower.includes('support'),
    `salone-gospel-hub heroImageAlt should mention "support" surface (tipping flow), got: "${heroImageAlt}"`);
});

// Edge case: the sitemap <lastmod> for salone-gospel-hub must be 2026-07-01.
// A stale date (e.g. 2026-06-19) would mean the sitemap was not bumped with
// the content refresh and crawlers may deprioritise re-indexing the page.
test('sitemap.xml salone-gospel-hub <lastmod> is 2026-07-01', () => {
  // Parse the salone-gospel-hub <url> block from the sitemap
  const urlBlockMatch = sitemapContent.match(
    /<url>\s*<loc>https:\/\/dsbdigital\.biz\/work\/salone-gospel-hub<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/
  );
  assert.ok(urlBlockMatch,
    'Could not find salone-gospel-hub <url> block with <lastmod> in sitemap.xml');
  assert.strictEqual(
    urlBlockMatch[1].trim(),
    '2026-07-01',
    `salone-gospel-hub <lastmod> should be 2026-07-01, got: "${urlBlockMatch[1].trim()}"`
  );
});

// ==========================================================================
// PART 9 — SHARE_SLUGS parity with caseStudies.ts
// ==========================================================================
//
// api/track.ts passes props.slug through normalizeProp(raw, SHARE_SLUGS), which
// returns null for any slug outside the set. A case study missing from
// SHARE_SLUGS therefore has its share events silently dropped from
// analytics:z:share_by_slug: no error, no log line, just absent data. This
// drifted once already (the set held 4 of 8 slugs), so assert set equality in
// both directions. Adding a case study without updating SHARE_SLUGS now fails
// here, and so does leaving a stale slug behind after removing one.

console.log('\n--- Part 9: SHARE_SLUGS parity with caseStudies.ts ---\n');

const { SHARE_SLUGS } = await import('../api/_lib/validators.ts');

test('SHARE_SLUGS covers every slug in caseStudies.ts', () => {
  const missing = Object.keys(caseStudies).filter(slug => !SHARE_SLUGS.has(slug));
  assert.deepStrictEqual(missing, [],
    `Case studies missing from SHARE_SLUGS (their share events are dropped): ${missing.join(', ')}`);
});

test('SHARE_SLUGS contains no slug without a case study', () => {
  const stale = [...SHARE_SLUGS].filter(slug => !(slug in caseStudies));
  assert.deepStrictEqual(stale, [],
    `SHARE_SLUGS entries with no matching case study: ${stale.join(', ')}`);
});

// ==========================================================================
// Summary
// ==========================================================================

console.log(`\n${'─'.repeat(60)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(60) + '\n');

if (failed > 0) process.exit(1);
