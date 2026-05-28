# SEO: Static Prerendering + Deep Case-Study Pages — Design

**Date:** 2026-05-28
**Site:** Digital Solution Builders portfolio (dsbdigital.biz) — Vite 7 + React 19 + react-router 7 + Tailwind 3, deployed on Vercel.

## Goal

Make the site fully crawlable and expand its ranking surface. Today it is a client-rendered SPA: `index.html` ships an empty `#root`, so non-JS crawlers (LinkedIn, Bing, AI crawlers) see a blank page, and the whole site is a single URL competing for many keywords.

This work delivers:
1. **P1 — Static generation** so every route ships full pre-rendered HTML with per-route `<head>` meta.
2. **P2 — Three flagship case-study pages** with unique meta and structured data, plus an expanded sitemap and richer JSON-LD.
3. **Cheap P3 win** — drop unused 3D dependencies bloating the JS bundle.

Out of scope (separate follow-up): font self-hosting, route-level code-splitting, blog/articles, additional case-study pages.

## Current state (verified)

- `src/main.tsx` mounts `RouterProvider` from `createBrowserRouter` in `src/routes/index.tsx` (Layout → Home child, `*` → NotFound).
- `react-helmet-async` is installed but **not wired** (no `HelmetProvider`, no `Helmet` usage). All meta lives statically in `index.html`.
- `vite.config.ts` sets `base: './'` (relative) — works for one page, breaks asset paths on deep routes.
- `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` are installed but **never imported/rendered** anywhere in `src/`.
- Only SSR-relevant DOM access is `document.getElementById` inside a click handler (safe). framer-motion renders initial state server-side.
- `sitemap.xml` / `robots.txt` already corrected to `dsbdigital.biz` (shipped separately, commit 4a6c4e2).

## Architecture

### 1. Static generation (vite-react-ssg)
- Add `vite-react-ssg`. Convert `src/routes/index.tsx` to export a `routes` array (RouteRecord[]) instead of a `createBrowserRouter` instance.
- Rewrite `src/main.tsx` to the `ViteReactSSG({ routes }, setupFn)` entry — one source drives client hydration and build-time prerender.
- `vite.config.ts`: `base: './'` → `base: '/'`.
- `package.json` build: `tsc && vite-react-ssg build`. Output: `dist/index.html` + `dist/work/<slug>/index.html`, each with real content. Vercel serves static files before the existing SPA rewrite, so `vercel.json` is unchanged.
- **Verify the exact vite-react-ssg API against current docs before wiring** (entry signature, helmet integration, dynamic/explicit route enumeration). Do not code from memory.

### 2. Per-route meta
- Wrap the tree in `HelmetProvider`. Add a reusable `<Seo>` component: `title`, `description`, `canonical`, OG (type/url/title/description/image), Twitter, and optional `jsonLd` slot.
- Home renders `<Seo>` mirroring today's static index.html values. `index.html` keeps the current tags as the shell fallback.

### 3. Case-study pages — `/work/nexa-welbodi`, `/work/nexa-logistix`, `/work/rms-death-tracker`
- One `CaseStudyPage` component + a `caseStudies` content module keyed by slug: `{ title, metaDescription, hero, problem, whatWasBuilt, stack[], outcome, liveLinks[], gallery[] }`.
- Three explicit routes (simplest for SSG enumeration), each rendering `CaseStudyPage` for its slug.
- **Targeted refactor:** extract the header/nav and footer currently inlined in `Home/index.tsx` into shared `SiteHeader` / `SiteFooter` components, consumed by Home and CaseStudyPage. Gives consistent chrome + Home↔case-study internal links and shrinks the 990-line Home file.
- Each page: `<Seo>` with unique title/description/canonical/OG + `CreativeWork` and `BreadcrumbList` JSON-LD.

### Content rules (non-negotiable)
- Factual only. **No invented metrics, no testimonials** (the site previously had fabricated claims removed — do not reintroduce the pattern).
- Framed as Digital Solution Builders digital-product-development portfolio work. **Do not surface Daniel's Nexa-Flow CEO role** (DSB is the separate personal B2C brand).
- Verifiable outcomes only — e.g. "in UAT at Connaught Hospital", "live in production", the live/demo URLs.

### 4. Sitemap + structured data
- Expand `sitemap.xml` to 4 URLs (home + 3 case studies) with `lastmod`.
- Home JSON-LD: keep `ProfessionalService`, add `Organization` (name, url, logo). Case studies add `CreativeWork` + `BreadcrumbList`.

### 5. Dependency cleanup
- Remove `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three` from `package.json` and refresh the lockfile. Confirm `pnpm build` still succeeds (they are unused).

## Testing & acceptance
- `pnpm typecheck` and `pnpm build` pass.
- `dist/index.html` and each `dist/work/<slug>/index.html` contain the page's visible text **and** a unique `<title>` + `<meta name="description">` in the static HTML (grep to confirm — not injected only at runtime).
- All four routes render correctly in a browser (Home + 3 case studies); nav/footer links work; assets load under `base:'/'`.
- `code-reviewer` → PASS, `qa` → PASS (per the Design & Build Workflow), then `verification-before-completion`.
- Lighthouse SEO + performance compared before vs after.

## Risks
- **vite-react-ssg entry migration** — SSR-unsafe code crashes the prerender. WebGL is unused and the one `document` call is event-scoped, so risk is low; guard `src/lib/supabase.ts` if module-load does anything network/`window`-bound.
- **`base:'/'` switch** — re-verify Home assets still resolve after the change.
- **Vercel build** — vite-react-ssg renders via Node at build time (no headless browser needed); confirm the build command runs cleanly in CI.

---

## REVISION 2026-05-28 — prerender approach changed; this section supersedes the prerender parts above

Two verified findings forced a change from the originally-approved vite-react-ssg plan:

1. **vite-react-ssg is incompatible with this stack.** v0.9.0 hard-caps its peer dependency at `react-router-dom ^6`; this site is on `react-router-dom ^7.9`. Its own README now points React Router 7 users to RR7's native SSG. Forcing it would put two router versions in the bundle.
2. **Headless Chrome can't run reliably in Vercel's build** (Amazon Linux 2023 ships no Chromium), and Vite stamps a fresh content-hash into asset filenames every build, so a snapshot is only valid for the exact build that produced it. True snapshot prerendering would therefore require moving prod deploys to a prebuilt flow (GitHub Actions or local `vercel --prebuilt`) — a deploy-pipeline change.

**Decision (user-approved): Approach C — ship the SEO content on the existing SPA now; defer prerendering.** Google executes JS and indexes client-rendered pages, so the deep pages will rank; the home-page social card is already served statically from `index.html`. A prerender layer (RR7 Framework Mode, or snapshot via GitHub Actions) is a separate later decision, gated on Search Console coverage.

### Final architecture (approach C)
- **No prerender, no pipeline change.** Keep the SPA, `createBrowserRouter`/`RouterProvider`, and Vercel git-push auto-deploy exactly as they are.
- **`vite.config.ts`: build-mode `base` `'./'` → `'/'`.** Still required — without it, a direct visit / refresh / crawl of a deep route (`/work/<slug>`) gets `index.html` via the SPA rewrite, whose relative `./assets/...` paths resolve against `/work/` and 404. Dev base stays `'./'`.
- **Per-route meta via `react-helmet-async`** (already installed): wrap the router in `HelmetProvider`; a reusable `<Seo>` component manages **only** `<title>`, `<meta name="description">`, `<link rel="canonical">`, and JSON-LD on every route.
- **`index.html` change:** remove the static `<meta name="description">` and `<link rel="canonical">` (now Helmet-managed on every route, so no duplicate/conflicting canonical on sub-pages). **Keep** the static `<title>`, OG, Twitter, and `ProfessionalService` JSON-LD as the no-JS fallback (these become the shared social card for all routes — acceptable and on-brand under approach C).
- **Case-study pages do NOT set their own OG** — they share the home OG card for social previews (consistent with the deferred-prerender tradeoff and avoids duplicate OG tags). They DO set unique `<title>`/description/canonical + `CreativeWork` + `BreadcrumbList` JSON-LD (read by Google, which renders JS).
- **Bonus:** add `FAQPage` JSON-LD on Home from the existing FAQ content; add `Organization` to the home structured data.
- **Shared chrome:** move the nav/header, footer, and floating-WhatsApp out of `Home/index.tsx` into `Layout.tsx` (rendered around every route via `<Outlet/>`), with the header detecting home-vs-subpage via `useLocation` (hash anchors + scroll-spy on home; `/#section` links on sub-pages).
- Sitemap → 4 URLs; remove unused `three`/`@react-three/*` deps. (Unchanged from above.)

### Acceptance (approach C)
- `pnpm typecheck` + `pnpm build` pass; `dist/` builds with `base:'/'`.
- All four routes work in a browser: Home unchanged; `/work/<slug>` render on direct visit (asset paths resolve), nav/footer links work, each case study has a unique `document.title` + canonical.
- Single `<link rel="canonical">` per route (no duplicate from index.html).
- `code-reviewer` → PASS, `qa` → PASS, then `verification-before-completion`.
