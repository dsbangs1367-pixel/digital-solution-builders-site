# Playbook Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/playbook` (product landing page for The Global African Professional) plus `/terms`, `/privacy`, `/refunds` on the DSB site, with a two-mode lead form (instant-download free guide | notify-me) relayed to the n8n lead pipeline.

**Architecture:** Four lazy routes added to the existing react-router config inside the shared `Layout`. Landing copy lives in a typed content module consumed by one page component. One new Vercel function (`api/playbook-lead.ts`) clones the `api/contact.ts` relay shape. Legal pages share a `LegalPage` layout. All styling uses existing tokens (`bg-background`, `--accent-green`, `font-serif`); no new dependencies.

**Tech Stack:** Vite 7, React 19, TypeScript, Tailwind 3, react-router-dom, react-helmet-async, framer-motion (existing only).

**House rules for every task:** No em dashes in ANY reader-facing string. No `Nexa` anywhere. TDD is NOT used in this repo: order is code, verify (`pnpm run typecheck && pnpm run lint`), commit. Never `git push` (Daniel confirms pushes). Branch: `feat/playbook-landing`.

**Canonical copy source:** `~/Desktop/Personal Projects/Career Playbook/launch/landing_copy.md` (voice-gated + redaction-audited). Where a task says "verbatim from source", copy the section text field-by-field from that file, changing nothing but markdown syntax. Strip the top DRAFT banner line; it does not ship.

---

### Task 1: Assets (lead-magnet PDF + OG image)

**Files:**
- Create: `public/downloads/the-cv-that-gets-you-shortlisted.pdf`
- Create: `public/og/playbook-og.png`

- [ ] **Step 1: Copy the lead magnet PDF**

```bash
mkdir -p public/downloads public/og
cp "$HOME/Desktop/Personal Projects/Career Playbook/lead-magnet/The_CV_That_Gets_You_Shortlisted.pdf" \
   "public/downloads/the-cv-that-gets-you-shortlisted.pdf"
```

- [ ] **Step 2: Generate the 1200x630 OG image from the book cover**

```bash
/opt/miniconda3/bin/python - <<'EOF'
import fitz
from PIL import Image
doc = fitz.open("/Users/macbookpro/Desktop/Personal Projects/Career Playbook/build/The_Global_African_Professional.pdf")
pix = doc[0].get_pixmap(dpi=200)
img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
# center-crop the A4 portrait cover to 1200x630 landscape, keeping the title zone
target_ratio = 1200 / 630
w, h = img.size
crop_h = int(w / target_ratio)
top = int(h * 0.18)                     # keep wordmark + title band
img = img.crop((0, top, w, top + crop_h)).resize((1200, 630), Image.LANCZOS)
img.save("public/og/playbook-og.png", optimize=True)
print("og image", img.size)
EOF
```

Expected: `og image (1200, 630)`. Open the PNG (Read tool) and confirm the title band is visible and legible.

- [ ] **Step 3: Commit**

```bash
git add public/downloads public/og
git commit -m "feat(playbook): add lead magnet download and OG image assets"
```

---

### Task 2: Content module

**Files:**
- Create: `src/pages/Playbook/content.ts`

- [ ] **Step 1: Create the typed content module.** Structure below is complete; every `/* verbatim */` field is copied word-for-word from the canonical copy source section named in the comment.

```ts
// src/pages/Playbook/content.ts
// All reader-facing copy for /playbook. Source of truth:
// Career Playbook/launch/landing_copy.md (voice-gated, redaction-audited).
// Brand rules: no em dashes, no Nexa mentions, USD 29 always carries the
// Leone-equivalent line nearby.

export interface Chapter { n: string; title: string; blurb: string }
export interface Faq { q: string; a: string }

export const HERO = {
  wordmark: 'DIGITAL SOLUTION BUILDERS',
  title: ['THE GLOBAL', 'AFRICAN', 'PROFESSIONAL'],
  headline: 'Your career is better than your paperwork says it is.',
  subhead: /* verbatim: Hero > Subhead (includes "USD 29, Leone equivalent shown at checkout.") */ '',
  ctaGuide: 'Get the free CV guide',
  ctaNotify: 'Get notified when it launches',
};

export const STORY = {
  kicker: 'The audit that started this book',
  paragraphs: [/* verbatim: "The story" section paragraphs, one string per paragraph */] as string[],
};

export const CHAPTERS: Chapter[] = [
  /* verbatim: "What is inside" section; n: '00'..'08'; title + one-line blurb per chapter */
];

export const TEMPLATES: { name: string; blurb: string }[] = [
  /* verbatim: "The templates" section, five entries */
];

export const WHO = {
  forYou: [/* verbatim bullets */] as string[],
  notForYou: [/* verbatim bullets */] as string[],
};

export const COVENANT = {
  kicker: 'The honesty covenant',
  paragraphs: [/* verbatim */] as string[],
};

export const PRICE = {
  amount: 'USD 29',
  note: 'One payment. The Leone equivalent is shown at checkout.',
  includes: [/* verbatim bullet list from Price block */] as string[],
};

export const FAQS: Faq[] = [
  /* verbatim: all six FAQ entries, including the 30-day refund answer */
];

export const BIO = {
  kicker: 'About the author',
  paragraphs: [/* verbatim: bio block (no company names beyond Digital Solution Builders) */] as string[],
};

export const DOWNLOAD_PATH = '/downloads/the-cv-that-gets-you-shortlisted.pdf';
```

- [ ] **Step 2: Guard test inline while authoring** (run in terminal; catches copy-paste damage immediately):

```bash
node -e "const s=require('fs').readFileSync('src/pages/Playbook/content.ts','utf8'); if(/[—–]/.test(s)) throw new Error('em/en dash found'); if(/Nexa/.test(s)) throw new Error('Nexa found'); console.log('copy guards OK')"
```

- [ ] **Step 3: Verify + commit**

```bash
pnpm run typecheck && git add src/pages/Playbook/content.ts && git commit -m "feat(playbook): landing copy content module"
```

---

### Task 3: Lead API function

**Files:**
- Create: `api/playbook-lead.ts`

- [ ] **Step 1: Write the function** (complete file):

```ts
// Vercel serverless function: relays playbook lead-form submissions (free
// guide + notify-me) to the existing n8n lead-intake webhook. Mirrors
// api/contact.ts. Env var: N8N_LEAD_WEBHOOK_URL (already set in Vercel).

interface LeadBody {
  name?: string;
  email?: string;
  interest?: string;
  website?: string; // honeypot: real users never fill this
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: LeadBody = req.body && typeof req.body === 'object' ? req.body : {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const interest = String(body.interest || '').trim();
  const honeypot = String(body.website || '').trim();

  // silent drop for bots: pretend success, relay nothing
  if (honeypot) return res.status(200).json({ ok: true });

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (name.length > 200) {
    return res.status(400).json({ error: 'Name too long (200 char max).' });
  }
  if (interest !== 'guide' && interest !== 'notify') {
    return res.status(400).json({ error: 'Invalid interest.' });
  }

  const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('N8N_LEAD_WEBHOOK_URL not set');
    return res.status(500).json({ error: 'Server misconfigured.' });
  }

  const payload = {
    name,
    email,
    interest,
    source: 'playbook',
    submittedAt: new Date().toISOString(),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 500),
  };

  try {
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error('n8n webhook responded', r.status);
      return res.status(502).json({ error: 'Could not record your details. Please retry.' });
    }
  } catch (err) {
    console.error('n8n webhook unreachable', err);
    return res.status(502).json({ error: 'Could not record your details. Please retry.' });
  }

  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: Verify + commit**

```bash
pnpm run typecheck && git add api/playbook-lead.ts && git commit -m "feat(playbook): lead relay function (guide + notify modes)"
```

---

### Task 4: Lead form component

**Files:**
- Create: `src/pages/Playbook/PlaybookLeadForm.tsx`

- [ ] **Step 1: Write the component** (complete file):

```tsx
import { useState } from 'react';
import { trackEvent } from '@/lib/track';
import { DOWNLOAD_PATH } from './content';

type Mode = 'guide' | 'notify';
type Status = 'idle' | 'sending' | 'done' | 'error';

/** Single lead-capture form for /playbook. Two modes, one instance on the
 *  page (anchor #get-started). Guide mode reveals an instant download on
 *  success; notify mode shows a confirmation line. */
export default function PlaybookLeadForm({ mode, onModeChange }: {
  mode: Mode;
  onModeChange: (m: Mode) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const r = await fetch('/api/playbook-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, interest: mode, website }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Something went wrong. Please retry.');
      setStatus('done');
      trackEvent(mode === 'guide' ? 'playbook_guide_lead' : 'playbook_notify_lead');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please retry.');
    }
  }

  const tabs: { key: Mode; label: string }[] = [
    { key: 'guide', label: 'Free CV guide' },
    { key: 'notify', label: 'Notify me at launch' },
  ];

  return (
    <div id="get-started" className="border border-border/60 p-6 md:p-10 scroll-mt-28">
      <div role="tablist" aria-label="What would you like?" className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={mode === t.key}
            onClick={() => { onModeChange(t.key); setStatus('idle'); }}
            className={`min-h-[44px] px-4 text-xs tracking-widest uppercase border transition-colors duration-200 ${
              mode === t.key
                ? 'border-[hsl(var(--accent-green))] text-foreground'
                : 'border-border/50 text-muted/60 hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {status === 'done' && mode === 'guide' ? (
        <div>
          <p className="font-serif text-2xl mb-3">The guide is yours.</p>
          <a
            href={DOWNLOAD_PATH}
            download
            onClick={() => trackEvent('playbook_guide_download')}
            className="inline-flex min-h-[44px] items-center px-6 bg-[hsl(var(--accent-green))] text-background text-sm font-medium"
          >
            Download The CV That Gets You Shortlisted (PDF)
          </a>
          <p className="text-xs text-muted/50 mt-3">Save it somewhere you will find it again. Chapter one of the playbook explains why that matters.</p>
        </div>
      ) : status === 'done' ? (
        <p className="font-serif text-2xl">You are on the list. You will hear from me once, when the playbook goes live.</p>
      ) : (
        <form onSubmit={submit} noValidate>
          <p className="text-sm text-muted/70 mb-5 max-w-xl">
            {mode === 'guide'
              ? 'Tell me where to send updates and the download unlocks right here. No spam, no drip sequence.'
              : 'Leave your name and email and I will send one message when the playbook launches. USD 29, Leone equivalent shown at checkout.'}
          </p>
          <div className="grid gap-4 md:grid-cols-2 max-w-xl">
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted/50">Name</span>
              <input
                type="text" required maxLength={200} value={name}
                onChange={(e) => setName(e.target.value)} autoComplete="name"
                className="mt-1 w-full min-h-[44px] bg-transparent border border-border/60 px-3 text-sm focus:border-[hsl(var(--accent-green))] outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted/50">Email</span>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                className="mt-1 w-full min-h-[44px] bg-transparent border border-border/60 px-3 text-sm focus:border-[hsl(var(--accent-green))] outline-none"
              />
            </label>
          </div>
          {/* honeypot: hidden from real users, bots fill it */}
          <input
            type="text" name="website" value={website} tabIndex={-1} aria-hidden="true"
            onChange={(e) => setWebsite(e.target.value)} autoComplete="off"
            className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
          />
          {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
          <button
            type="submit" disabled={status === 'sending'}
            className="mt-6 min-h-[44px] px-8 bg-[hsl(var(--accent-green))] text-background text-sm font-medium disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : mode === 'guide' ? 'Send me the guide' : 'Keep me posted'}
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

```bash
pnpm run typecheck && git add src/pages/Playbook/PlaybookLeadForm.tsx && git commit -m "feat(playbook): two-mode lead form with instant download"
```

---

### Task 5: Landing page component

**Files:**
- Create: `src/pages/Playbook/index.tsx`
- Modify: `src/components/Seo.tsx` (add optional OG props)

- [ ] **Step 1: Extend Seo with optional OG overrides** (backward-compatible; existing pages unchanged). Add to `SeoProps`: `ogImagePath?: string; ogTitle?: string;` and inside `<Helmet>`:

```tsx
{ogImagePath && <meta property="og:image" content={`${SITE}${ogImagePath}`} />}
{ogImagePath && <meta property="og:image:width" content="1200" />}
{ogImagePath && <meta property="og:image:height" content="630" />}
{ogTitle && <meta property="og:title" content={ogTitle} />}
{ogTitle && <meta property="og:type" content="product" />}
```

- [ ] **Step 2: Write the page.** Complete structural skeleton below; section bodies map 1:1 to the content module (each `<Section>` renders kicker + paragraphs/list from content.ts). Follow Insights page conventions: `max-w-5xl mx-auto px-6 md:px-12`, serif display headings, `useReducedMotion`-aware framer reveals copied from Home's pattern.

```tsx
import { useState } from 'react';
import { motion as _motion, useReducedMotion } from 'framer-motion';
import Seo from '@/components/Seo';
import PlaybookLeadForm from './PlaybookLeadForm';
import { HERO, STORY, CHAPTERS, TEMPLATES, WHO, COVENANT, PRICE, FAQS, BIO } from './content';

export default function PlaybookPage() {
  const [mode, setMode] = useState<'guide' | 'notify'>('guide');
  const reduce = useReducedMotion();

  function goToForm(m: 'guide' | 'notify') {
    setMode(m);
    document.getElementById('get-started')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'The Global African Professional',
    description: HERO.headline,
    brand: { '@type': 'Brand', name: 'Digital Solution Builders' },
    offers: { '@type': 'Offer', price: '29', priceCurrency: 'USD', availability: 'https://schema.org/PreOrder' },
  };

  return (
    <>
      <Seo
        title="The Global African Professional | Digital Solution Builders"
        description={HERO.headline}
        canonicalPath="/playbook"
        ogImagePath="/og/playbook-og.png"
        ogTitle="The Global African Professional"
        jsonLd={productLd}
      />
      <main id="main-content">
        {/* HERO: book-cover treatment (approved option A) */}
        <section className="min-h-[88vh] flex flex-col justify-center px-6 md:px-12 border-b border-border/40">
          <div className="max-w-5xl mx-auto w-full">
            <p className="font-serif text-sm tracking-[0.2em] text-foreground/90">{HERO.wordmark}</p>
            <p className="text-xs text-muted/40 mt-1">Freetown, Sierra Leone</p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mt-14">
              {HERO.title.map((line) => <span key={line} className="block">{line}</span>)}
            </h1>
            <div className="w-12 h-[3px] bg-[hsl(var(--accent-green))] mt-6" />
            <p className="text-base md:text-lg text-muted/80 mt-6 max-w-xl">{HERO.headline}</p>
            <p className="text-sm text-muted/60 mt-3 max-w-xl">{HERO.subhead}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={() => goToForm('guide')} className="min-h-[44px] px-6 bg-[hsl(var(--accent-green))] text-background text-sm font-medium">
                {HERO.ctaGuide}
              </button>
              <button onClick={() => goToForm('notify')} className="min-h-[44px] px-6 border border-border/70 text-sm text-foreground hover:border-border">
                {HERO.ctaNotify}
              </button>
            </div>
          </div>
        </section>

        {/* Sections in spec order; each uses the shared reveal + section shell */}
        {/* 2 story · 3 chapters (numbered list, green n) · 4 templates · 5 who ·
            6 covenant · 7 price block (button -> goToForm('notify')) · 8 FAQ
            (native <details>) · 9 bio · 10 <PlaybookLeadForm mode={mode} onModeChange={setMode} /> */}
      </main>
    </>
  );
}
```

The chapter list renders `n` in `text-[hsl(var(--accent-green))] font-serif`, mirroring the book's TOC. FAQ uses `<details><summary>` with `min-h-[44px]` summaries (no JS accordion). Price block repeats `PRICE.amount` + `PRICE.note` adjacently (dual-currency rule).

- [ ] **Step 3: Verify + commit**

```bash
pnpm run typecheck && pnpm run lint && git add src/pages/Playbook src/components/Seo.tsx && git commit -m "feat(playbook): landing page with book-cover hero"
```

---

### Task 6: Legal pages

**Files:**
- Create: `src/pages/Legal/LegalPage.tsx`, `src/pages/Legal/Terms.tsx`, `src/pages/Legal/Privacy.tsx`, `src/pages/Legal/Refunds.tsx`

- [ ] **Step 1: Shared layout** (complete file):

```tsx
import { ReactNode } from 'react';
import Seo from '@/components/Seo';

export default function LegalPage({ title, description, canonicalPath, updated, children }: {
  title: string; description: string; canonicalPath: string; updated: string; children: ReactNode;
}) {
  return (
    <>
      <Seo title={`${title} | Digital Solution Builders`} description={description} canonicalPath={canonicalPath} />
      <main id="main-content" className="pt-28 md:pt-36 pb-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-2">{title}</h1>
          <p className="text-xs text-muted/50 mb-10">Last updated {updated}</p>
          <div className="space-y-6 text-sm md:text-base text-muted/80 leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-2">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Write the three pages.** Draft copy at build time in plain English (light-dose voice pass before commit), covering exactly:
  - `Terms.tsx` (`/terms`): digital product; personal-use license; no redistribution of the book or templates; purchases processed by Paddle as merchant of record once card sales go live; contact `danielbangs@dsbdigital.biz`; governing law Sierra Leone.
  - `Privacy.tsx` (`/privacy`): forms collect name + email only; sent to the site owner's lead pipeline (n8n webhook, Slack notification, lead list); first-party cookie-free analytics via the site's own `/api/track` (page views + user agent); no third-party ad tracking; deletion requests by email.
  - `Refunds.tsx` (`/refunds`): 30 days from purchase, request by email, no conditions; refunds for card purchases are processed through Paddle; the same window applies regardless of payment rail. Wording must match the FAQ's refund answer.
  Each page is `LegalPage` + `<h2>`/`<p>` children only. Run the copy guard from Task 2 Step 2 against each file (dash + Nexa).

- [ ] **Step 3: Verify + commit**

```bash
pnpm run typecheck && pnpm run lint && git add src/pages/Legal && git commit -m "feat(playbook): terms, privacy, and 30-day refund pages"
```

---

### Task 7: Wire-up (router, footer, sitemap)

**Files:**
- Modify: `src/routes/index.tsx` (children array, before the ARTICLE_ORDER spread)
- Modify: `src/components/SiteFooter.tsx` (links row)
- Modify: `public/sitemap.xml`

- [ ] **Step 1: Routes** (inside the `Layout` children, after `/insights`):

```tsx
const PlaybookPage = lazy(() => import('@/pages/Playbook/index'));
const TermsPage = lazy(() => import('@/pages/Legal/Terms'));
const PrivacyPage = lazy(() => import('@/pages/Legal/Privacy'));
const RefundsPage = lazy(() => import('@/pages/Legal/Refunds'));
```

```tsx
{ path: '/playbook', element: <Lazy><PlaybookPage /></Lazy> },
{ path: '/terms', element: <Lazy><TermsPage /></Lazy> },
{ path: '/privacy', element: <Lazy><PrivacyPage /></Lazy> },
{ path: '/refunds', element: <Lazy><RefundsPage /></Lazy> },
```

Where `Lazy` is a small local wrapper mirroring `AdminFallback`'s Suspense usage (create it beside `AdminFallback` if the file does not already have one):

```tsx
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<AdminFallback />}>{children}</Suspense>;
}
```

- [ ] **Step 2: Footer links.** In `SiteFooter.tsx`, add to the links row after `Insights`:

```tsx
<Link to="/playbook" className="transition-all duration-200 hover:text-muted/70 hover:[text-shadow:0_0_10px_hsl(var(--accent-green)/0.45)]">
  Playbook
</Link>
```

and a second, quieter row under the copyright line:

```tsx
<p className="flex gap-4">
  <Link to="/terms" className="hover:text-muted/70">Terms</Link>
  <Link to="/privacy" className="hover:text-muted/70">Privacy</Link>
  <Link to="/refunds" className="hover:text-muted/70">Refunds</Link>
</p>
```

- [ ] **Step 3: Sitemap.** Append before `</urlset>` (match the existing entry shape):

```xml
<!-- Playbook product + legal -->
<url><loc>https://dsbdigital.biz/playbook</loc><lastmod>2026-07-20</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
<url><loc>https://dsbdigital.biz/terms</loc><lastmod>2026-07-20</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
<url><loc>https://dsbdigital.biz/privacy</loc><lastmod>2026-07-20</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
<url><loc>https://dsbdigital.biz/refunds</loc><lastmod>2026-07-20</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>
```

- [ ] **Step 4: Verify + commit**

```bash
pnpm run typecheck && pnpm run lint && pnpm run build
git add src/routes/index.tsx src/components/SiteFooter.tsx public/sitemap.xml
git commit -m "feat(playbook): register routes, footer links, sitemap entries"
```

---

### Task 8: Smoke test

**Files:**
- Create: `tests/playbook.smoke.mjs`
- Modify: `package.json` (append `&& bun tests/playbook.smoke.mjs` to the `test` script)

- [ ] **Step 1: Write the test** using the repo's tiny-runner pattern (node:assert + fs, no framework). Complete assertions:

```js
/** playbook.smoke.mjs — /playbook + legal pages + lead API contract. Run: bun tests/playbook.smoke.mjs */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0, failed = 0;
function test(name, fn) { try { fn(); console.log(`  PASS  ${name}`); passed++; } catch (e) { console.log(`  FAIL  ${name}\n        ${e.message}`); failed++; } }
const read = (p) => readFileSync(resolve(ROOT, p), 'utf8');

// Part 1: routing + wiring
const routes = read('src/routes/index.tsx');
for (const p of ['/playbook', '/terms', '/privacy', '/refunds'])
  test(`route registered: ${p}`, () => assert.match(routes, new RegExp(`path: '${p}'`)));
test('footer links playbook + legal', () => {
  const f = read('src/components/SiteFooter.tsx');
  for (const p of ['/playbook', '/terms', '/privacy', '/refunds']) assert.ok(f.includes(`"${p}"`) || f.includes(`'${p}'`));
});
test('sitemap has all four URLs', () => {
  const s = read('public/sitemap.xml');
  for (const p of ['playbook', 'terms', 'privacy', 'refunds']) assert.ok(s.includes(`https://dsbdigital.biz/${p}`));
});

// Part 2: copy landmarks + brand rules
const CONTENT_FILES = ['src/pages/Playbook/content.ts', 'src/pages/Playbook/index.tsx',
  'src/pages/Playbook/PlaybookLeadForm.tsx', 'src/pages/Legal/Terms.tsx',
  'src/pages/Legal/Privacy.tsx', 'src/pages/Legal/Refunds.tsx'];
test('no em/en dashes in reader-facing sources', () => {
  for (const f of CONTENT_FILES) assert.ok(!/[—–]/.test(read(f)), `${f} contains a dash`);
});
test('no Nexa mentions', () => {
  for (const f of CONTENT_FILES) assert.ok(!read(f).includes('Nexa'), `${f} mentions Nexa`);
});
test('dual-currency rule at price mentions', () => {
  const c = read('src/pages/Playbook/content.ts');
  assert.ok(c.includes('USD 29') && c.toLowerCase().includes('leone'));
});
test('30-day refund stated in FAQ and refunds page', () => {
  assert.ok(read('src/pages/Playbook/content.ts').includes('30 days'));
  assert.ok(read('src/pages/Legal/Refunds.tsx').includes('30 days'));
});
test('download asset exists and is a PDF', () => {
  const b = readFileSync(resolve(ROOT, 'public/downloads/the-cv-that-gets-you-shortlisted.pdf'));
  assert.equal(b.subarray(0, 4).toString(), '%PDF');
});

// Part 3: lead API contract (import the handler, drive it with a mock res)
const mod = await import(resolve(ROOT, 'api/playbook-lead.ts'));
function mockRes() {
  const r = { code: 0, body: null, headers: {} };
  return { r, setHeader: (k, v) => (r.headers[k] = v),
    status(c) { r.code = c; return this; }, json(b) { r.body = b; return this; } };
}
async function call(body, method = 'POST') {
  const res = mockRes();
  await mod.default({ method, body, headers: {} }, res);
  return res.r;
}
test('rejects GET', async () => assert.equal((await call({}, 'GET')).code, 405));
test('rejects missing fields', async () => assert.equal((await call({ name: 'D' })).code, 400));
test('rejects bad email', async () => assert.equal((await call({ name: 'D', email: 'x', interest: 'guide' })).code, 400));
test('rejects bad interest', async () => assert.equal((await call({ name: 'D', email: 'd@e.io', interest: 'buy' })).code, 400));
test('honeypot silently accepted', async () => {
  const r = await call({ name: 'B', email: 'b@t.io', interest: 'guide', website: 'spam' });
  assert.equal(r.code, 200); assert.deepEqual(r.body, { ok: true });
});
test('valid lead without env returns 500 (misconfig guard)', async () => {
  delete process.env.N8N_LEAD_WEBHOOK_URL;
  assert.equal((await call({ name: 'D', email: 'd@e.io', interest: 'notify' })).code, 500);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
```

Note: Part 3's `await` inside `test()` needs the async-aware variant; make `test` accept promises (`await fn()` inside a try/catch in an async main) exactly as `analytics.smoke.mjs` does; mirror that file's pattern.

- [ ] **Step 2: Run + register + commit**

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun tests/playbook.smoke.mjs        # expect: all PASS
# append to package.json "test": "... && bun tests/playbook.smoke.mjs"
pnpm run test
git add tests/playbook.smoke.mjs package.json
git commit -m "test(playbook): smoke coverage for routes, copy rules, lead API"
```

---

### Task 9: n8n data-table branch (non-blocking, via n8n MCP)

**Files:** none in this repo (n8n workflow `JED2YaHFajte18eL`, "DSB Lead Intake").

- [ ] Step 1: `n8n_get_workflow` to snapshot the current workflow before touching it.
- [ ] Step 2: Add an IF node on `{{$json.source === "playbook"}}`; true-branch: existing Slack notification PLUS a Data Table append (`n8n_manage_datatable` to create `playbook_leads` with columns name, email, interest, submittedAt; then an append node). False branch: unchanged contact-form path.
- [ ] Step 3: `n8n_test_workflow` with a synthetic playbook payload; confirm Slack message arrives and the row lands.
- [ ] Step 4: If the data-table step errors, keep the Slack-only path live (site behavior is unaffected by design) and note the gap.

---

### Task 10: Verification gauntlet (in order, per spec + CLAUDE.md)

- [ ] `pnpm run typecheck && pnpm run lint && pnpm run build && pnpm run test` all green.
- [ ] Voice gate on legal-page copy: humanizer + sound-human (light dose), then re-run the smoke test.
- [ ] `code-reviewer` subagent on the full branch diff. Fix + loop until PASS.
- [ ] `qa` subagent. Fix code (not tests) until PASS.
- [ ] `governance-reviewer` (expected out-of-scope/no-AI PASS, but it runs).
- [ ] `vercel-plugin:react-best-practices` checklist over the new TSX files.
- [ ] POST-GATE `gstack-design-review` against `pnpm run dev` (browse daemon, `~/.bun/bin` on PATH): hero at 375/768/1440, form states (idle, sending, guide-success with download, notify-success, error), FAQ details, legal pages, footer. Fix findings; re-verify.
- [ ] `superpowers:verification-before-completion`: fresh full command run + walkthrough of the running page before any completion claim.
- [ ] STOP: show Daniel the result. Push and merge to `main` (auto-deploys production) ONLY on his explicit confirmation.

---

## Out of scope (per spec)

Paddle/Monime checkout wiring, email automation, Kabod rebrand, book/template changes.
