import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import clientErrorLogger from 'vite-plugin-client-error-logger';
import { reactFiberSource } from 'vite-plugin-react-fiber-source';
import { caseStudies } from './src/pages/CaseStudy/caseStudies';
import { articles, ARTICLE_ORDER, INSIGHTS_META } from './src/pages/Article/articles';
import {
  HERO as PLAYBOOK_HERO,
  CHAPTERS as PLAYBOOK_CHAPTERS,
  PRICE as PLAYBOOK_PRICE,
  FAQS as PLAYBOOK_FAQS,
  META_TITLE as PLAYBOOK_META_TITLE,
  OG_TITLE as PLAYBOOK_OG_TITLE,
} from './src/pages/Playbook/content';
import { LEGAL_DOCS, type LegalDoc } from './src/pages/Legal/legalContent';

const SITE = 'https://dsbdigital.biz';

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// For text nodes inside the <noscript> fallback. Quotes are fine unescaped in
// text content; only the three structural characters must be neutralized.
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Insert a crawler-only content block before </body>. Non-JS crawlers (and any
// automated site review that does not execute JavaScript, e.g. a payment
// processor's domain check) read this; browsers ignore it once the SPA mounts.
// Throws if the anchor is missing so a changed template fails the build loudly.
function injectNoscriptBody(html: string, bodyHtml: string): string {
  const marker = '</body>';
  if (!html.includes(marker)) {
    throw new Error('prerender: </body> not found in built index.html');
  }
  return html.replace(marker, `<noscript>${bodyHtml}</noscript>${marker}`);
}

function legalNoscriptBody(doc: LegalDoc): string {
  const parts = [
    `<h1>${escapeHtml(doc.title)}</h1>`,
    `<p>Last updated ${escapeHtml(doc.updated)}</p>`,
    `<p>${escapeHtml(doc.intro)}</p>`,
  ];
  for (const s of doc.sections) {
    parts.push(`<h2>${escapeHtml(s.heading)}</h2>`, `<p>${escapeHtml(s.body)}</p>`);
  }
  return parts.join('');
}

function playbookNoscriptBody(): string {
  const parts = [
    `<h1>${escapeHtml(PLAYBOOK_OG_TITLE)}</h1>`,
    `<p>${escapeHtml(PLAYBOOK_HERO.headline)}</p>`,
    `<p>${escapeHtml(PLAYBOOK_HERO.subhead)}</p>`,
    '<h2>What is inside</h2>',
  ];
  for (const c of PLAYBOOK_CHAPTERS) {
    parts.push(`<h3>${escapeHtml(c.title)}</h3>`, `<p>${escapeHtml(c.blurb)}</p>`);
  }
  parts.push('<h2>Price</h2>', `<p>${escapeHtml(`${PLAYBOOK_PRICE.amount}. ${PLAYBOOK_PRICE.note}`)}</p>`);
  for (const inc of PLAYBOOK_PRICE.includes) {
    parts.push(`<p>${escapeHtml(inc)}</p>`);
  }
  parts.push('<h2>Questions</h2>');
  for (const f of PLAYBOOK_FAQS) {
    parts.push(`<h3>${escapeHtml(f.q)}</h3>`, `<p>${escapeHtml(f.a)}</p>`);
  }
  return parts.join('');
}

// `attr` is only ever the literals 'property' | 'name' (no regex metachars),
// so it is interpolated directly; `key` is escaped defensively. Both setMeta
// and setTitle THROW on a non-match so a changed OG template fails the build
// loudly instead of silently shipping a home-page card on every case study.
function setMeta(html: string, attr: 'property' | 'name', key: string, value: string): string {
  const re = new RegExp(`(<meta\\s+${attr}="${escapeRe(key)}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) {
    throw new Error(
      `prerender-case-study-og: <meta ${attr}="${key}"> not found in built index.html — the OG template may have changed`,
    );
  }
  return html.replace(re, `$1${escapeAttr(value)}$2`);
}

function removeMeta(html: string, attr: 'property' | 'name', key: string): string {
  const re = new RegExp(`\\s*<meta\\s+${attr}="${escapeRe(key)}"[^>]*>`, 'g');
  return html.replace(re, '');
}

function setTitle(html: string, value: string): string {
  const re = /<title>[\s\S]*?<\/title>/;
  if (!re.test(html)) {
    throw new Error('prerender-case-study-og: <title> not found in built index.html');
  }
  return html.replace(re, `<title>${escapeAttr(value)}</title>`);
}

// Assumes attribute order `rel="canonical" href="..."` in index.html. If
// reordered, the build throws (above) rather than silently shipping the home
// canonical on every case study — keep the source order to match.
function setCanonical(html: string, url: string): string {
  const re = /(<link\s+rel="canonical"\s+href=")[^"]*(")/;
  if (!re.test(html)) {
    throw new Error('prerender-case-study-og: <link rel="canonical"> not found in built index.html');
  }
  return html.replace(re, `$1${escapeAttr(url)}$2`);
}

/**
 * Social crawlers (LinkedIn, Facebook, X) do not execute JS, so per-route OG
 * tags set by react-helmet-async never reach them. After the SPA build, clone
 * dist/index.html into dist/work/<slug>/index.html with that case study's
 * title/description/image baked into the static <head>, so a shared link
 * renders the right preview card. Vercel serves these files before the SPA
 * fallback rewrite; the client still hydrates and renders the route as usual.
 */
function prerenderCaseStudyOg(): Plugin {
  let outDir = 'dist';
  return {
    name: 'prerender-case-study-og',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const indexPath = path.resolve(outDir, 'index.html');
      let template: string;
      try {
        template = readFileSync(indexPath, 'utf8');
      } catch {
        this.warn(`prerender-case-study-og: ${indexPath} not found; skipping`);
        return;
      }

      for (const cs of Object.values(caseStudies)) {
        const url = `${SITE}/work/${cs.slug}`;
        const image = `${SITE}${cs.heroImage}`;
        let html = template;
        html = setTitle(html, cs.metaTitle);
        html = setMeta(html, 'name', 'description', cs.metaDescription);
        html = setCanonical(html, url);
        html = setMeta(html, 'property', 'og:url', url);
        html = setMeta(html, 'property', 'og:title', cs.metaTitle);
        html = setMeta(html, 'property', 'og:description', cs.metaDescription);
        html = setMeta(html, 'property', 'og:image', image);
        // Screenshots are not 1200×630; drop the false dimension hints so
        // platforms read the image's real size.
        html = removeMeta(html, 'property', 'og:image:width');
        html = removeMeta(html, 'property', 'og:image:height');
        html = setMeta(html, 'name', 'twitter:url', url);
        html = setMeta(html, 'name', 'twitter:title', cs.metaTitle);
        html = setMeta(html, 'name', 'twitter:description', cs.metaDescription);
        html = setMeta(html, 'name', 'twitter:image', image);

        const dir = path.resolve(outDir, 'work', cs.slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(path.resolve(dir, 'index.html'), html);
      }
    },
  };
}

/**
 * Same idea as prerenderCaseStudyOg, for the SEO content cluster. Bakes each
 * article's title/description/canonical/OG into a static dist/<slug>/index.html
 * (and dist/insights/index.html) so crawlers get correct per-page meta. The
 * default home og-cover image is kept, so its dimension hints stay valid and we
 * do not touch og:image here.
 */
function prerenderArticleOg(): Plugin {
  let outDir = 'dist';
  return {
    name: 'prerender-article-og',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const indexPath = path.resolve(outDir, 'index.html');
      let template: string;
      try {
        template = readFileSync(indexPath, 'utf8');
      } catch {
        this.warn(`prerender-article-og: ${indexPath} not found; skipping`);
        return;
      }

      const pages = [
        ...ARTICLE_ORDER.map((slug) => {
          const a = articles[slug];
          return { slug: a.slug, title: a.metaTitle, description: a.metaDescription };
        }),
        { slug: 'insights', title: INSIGHTS_META.title, description: INSIGHTS_META.description },
      ];

      for (const page of pages) {
        const url = `${SITE}/${page.slug}`;
        let html = template;
        html = setTitle(html, page.title);
        html = setMeta(html, 'name', 'description', page.description);
        html = setCanonical(html, url);
        html = setMeta(html, 'property', 'og:url', url);
        html = setMeta(html, 'property', 'og:title', page.title);
        html = setMeta(html, 'property', 'og:description', page.description);
        html = setMeta(html, 'name', 'twitter:url', url);
        html = setMeta(html, 'name', 'twitter:title', page.title);
        html = setMeta(html, 'name', 'twitter:description', page.description);

        const dir = path.resolve(outDir, page.slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(path.resolve(dir, 'index.html'), html);
      }
    },
  };
}

/**
 * Same mechanism as prerenderCaseStudyOg, for the /playbook landing page.
 * Bakes the book's social card (og/playbook-og.png, authored at 1200x630, so
 * the template's dimension hints stay valid) plus title/description/canonical
 * into dist/playbook/index.html. og:type becomes "product" to match the
 * page's Product JSON-LD. The static head is the single OG owner per route;
 * Seo.tsx deliberately emits no OG tags (scrapers do not execute JS).
 */
function prerenderPlaybookOg(): Plugin {
  let outDir = 'dist';
  return {
    name: 'prerender-playbook-og',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const indexPath = path.resolve(outDir, 'index.html');
      let template: string;
      try {
        template = readFileSync(indexPath, 'utf8');
      } catch {
        this.warn(`prerender-playbook-og: ${indexPath} not found; skipping`);
        return;
      }

      const url = `${SITE}/playbook`;
      const image = `${SITE}/og/playbook-og.png`;
      const pageTitle = PLAYBOOK_META_TITLE;
      const ogTitle = PLAYBOOK_OG_TITLE;
      const description = PLAYBOOK_HERO.headline;

      let html = template;
      html = setTitle(html, pageTitle);
      html = setMeta(html, 'name', 'description', description);
      html = setCanonical(html, url);
      html = setMeta(html, 'property', 'og:type', 'product');
      html = setMeta(html, 'property', 'og:url', url);
      html = setMeta(html, 'property', 'og:title', ogTitle);
      html = setMeta(html, 'property', 'og:description', description);
      html = setMeta(html, 'property', 'og:image', image);
      html = setMeta(html, 'name', 'twitter:url', url);
      html = setMeta(html, 'name', 'twitter:title', ogTitle);
      html = setMeta(html, 'name', 'twitter:description', description);
      html = setMeta(html, 'name', 'twitter:image', image);
      html = injectNoscriptBody(html, playbookNoscriptBody());

      const dir = path.resolve(outDir, 'playbook');
      mkdirSync(dir, { recursive: true });
      writeFileSync(path.resolve(dir, 'index.html'), html);
    },
  };
}

/**
 * Same mechanism for the terms/privacy/refunds pages. These have no OG image of
 * their own, so the home og-cover is kept (its dimension hints stay valid) and
 * only title/description/canonical/og:url/twitter are rewritten. A <noscript>
 * fallback carries the full policy text so a crawler that does not run JS (a
 * payment processor's domain review, for one) still sees complete pages instead
 * of an empty SPA shell. Text comes from legalContent.ts, the same source the
 * React components render, so the two can never drift.
 */
function prerenderLegalPages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'prerender-legal-pages',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      const indexPath = path.resolve(outDir, 'index.html');
      let template: string;
      try {
        template = readFileSync(indexPath, 'utf8');
      } catch {
        this.warn(`prerender-legal-pages: ${indexPath} not found; skipping`);
        return;
      }

      for (const doc of LEGAL_DOCS) {
        const slug = doc.canonicalPath.replace(/^\//, '');
        const url = `${SITE}${doc.canonicalPath}`;
        const title = `${doc.title} | Digital Solution Builders`;
        let html = template;
        html = setTitle(html, title);
        html = setMeta(html, 'name', 'description', doc.description);
        html = setCanonical(html, url);
        html = setMeta(html, 'property', 'og:url', url);
        html = setMeta(html, 'property', 'og:title', title);
        html = setMeta(html, 'property', 'og:description', doc.description);
        html = setMeta(html, 'name', 'twitter:url', url);
        html = setMeta(html, 'name', 'twitter:title', title);
        html = setMeta(html, 'name', 'twitter:description', doc.description);
        html = injectNoscriptBody(html, legalNoscriptBody(doc));

        const dir = path.resolve(outDir, slug);
        mkdirSync(dir, { recursive: true });
        writeFileSync(path.resolve(dir, 'index.html'), html);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const baseCdnUrl = env.BASE_CDN_URL?.trim();
  const normalizedBaseCdnUrl = baseCdnUrl && !baseCdnUrl.endsWith('/') ? `${baseCdnUrl}/` : baseCdnUrl;

  return {
    // Absolute base so deep routes (/work/:slug) resolve /assets/... correctly
    // on direct visit/refresh. './' resolves relative to the route path and 404s.
    base: command === 'build' ? (normalizedBaseCdnUrl ?? '/') : './',
    plugins: [
      reactFiberSource(), // Must be used before react() to inject source into _debugInfo.
      react(),
      clientErrorLogger(),
      prerenderCaseStudyOg(),
      prerenderArticleOg(),
      prerenderPlaybookOg(),
      prerenderLegalPages(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      strictPort: true,
      allowedHosts: true,
    },
  };
});
