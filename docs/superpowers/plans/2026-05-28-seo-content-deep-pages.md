# SEO Content + Deep Case-Study Pages — Implementation Plan

> Approach C (per the spec revision 2026-05-28): ship SEO content on the existing SPA; no prerender, no deploy-pipeline change. Verified by typecheck + build + browser, not unit tests (presentational frontend; TDD not adopted per repo convention).

**Goal:** Add three indexable `/work/<slug>` case-study pages with unique per-route meta + structured data, expand the sitemap, enrich JSON-LD, and remove dead deps — without changing how the site deploys.

**Architecture:** Keep `createBrowserRouter`/`RouterProvider`. Move shared chrome (header/footer/WhatsApp) into `Layout`. Manage `<title>`/description/canonical/JSON-LD per route via `react-helmet-async` (`HelmetProvider`). Fix Vite `base` to `'/'` so deep routes load assets.

**Tech stack:** Vite 7, React 19, react-router-dom 7, react-helmet-async 2, Tailwind 3, framer-motion 10.

---

## File structure

- Create `src/components/Seo.tsx` — Helmet wrapper: title, description, canonical, JSON-LD.
- Create `src/components/SiteHeader.tsx` — extracted NavBar; home vs subpage link mode via `useLocation`.
- Create `src/components/SiteFooter.tsx` — extracted footer + floating WhatsApp.
- Create `src/pages/CaseStudy/caseStudies.ts` — slug-keyed factual content for the 3 flagships.
- Create `src/pages/CaseStudy/index.tsx` — `CaseStudyPage` reading `useParams().slug`.
- Modify `src/main.tsx` — wrap in `HelmetProvider`.
- Modify `src/components/Layout.tsx` — render `SiteHeader` + `<Outlet/>` + `SiteFooter`.
- Modify `src/routes/index.tsx` — add 3 case-study routes.
- Modify `src/pages/Home/index.tsx` — remove inlined NavBar/footer/WhatsApp; add `<Seo>`; add "View case study" link on the 3 flagship cards; add FAQPage/Organization JSON-LD.
- Modify `vite.config.ts` — build `base` `'./'`→`'/'`.
- Modify `index.html` — remove static description + canonical (now Helmet-managed).
- Modify `public/sitemap.xml` — 4 URLs.
- Modify `package.json` — drop `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.

## Tasks (ordered; commit after each logical group)

### Task 1 — Vite base + HelmetProvider
- `vite.config.ts`: `base: command === 'build' ? (normalizedBaseCdnUrl ?? '/') : './'`.
- `src/main.tsx`: import `HelmetProvider`, wrap `<RouterProvider/>`.
- Verify: `pnpm typecheck`.

### Task 2 — Seo component
- `src/components/Seo.tsx`: props `{ title, description, canonicalPath, jsonLd? }`; renders `<Helmet>` with `<title>`, `<meta name="description">`, `<link rel="canonical" href={SITE+canonicalPath}>`, and one `<script type="application/ld+json">` per JSON-LD block. `SITE='https://dsbdigital.biz'`.

### Task 3 — Extract shared chrome to Layout
- `SiteHeader.tsx`: move `NavBar` out of Home. `const isHome = useLocation().pathname === '/'`. Logo → `<Link to="/">`. Nav items `href={isHome ? '#'+id : '/#'+id}`. Keep scroll-spy effect (no-op off home). Keep WhatsApp button + mobile menu.
- `SiteFooter.tsx`: move the `<footer>` + floating WhatsApp `<a>` out of Home.
- `Layout.tsx`: `<><ScrollToTop/><SiteHeader/><Outlet/><SiteFooter/></>`.
- `Home/index.tsx`: delete the `NavBar` function, the `<footer>`, and the floating WhatsApp; the page returns its `<main>` content only (and `<Seo>` + work-section). Keep the outer wrapper div's classes.
- Verify: `pnpm typecheck && pnpm build`; browser-check Home unchanged.

### Task 4 — Case-study content + page + routes
- `caseStudies.ts`: export `Record<string, CaseStudy>` for `nexa-welbodi`, `nexa-logistix`, `rms-death-tracker`. Fields: `title, category, tagline, accent, heroImage, heroImageAlt, liveUrl, stats[], services[], metaTitle, metaDescription, sections[{heading, body}]` (Brief / What we built / The stack / Outcome). Factual only — no invented metrics/testimonials; no Nexa-Flow institutional framing or CEO role.
- `CaseStudy/index.tsx`: `const { slug } = useParams(); const cs = caseStudies[slug]`; if missing → `<Navigate to="/" replace/>`. Render `<Seo>` (title/description/canonical=`/work/${slug}` + CreativeWork + BreadcrumbList JSON-LD), then on-brand layout reusing Home's utility classes (eyebrow accent, serif title, tagline, hero image with accent left-border, stats grid, sections, services tags, live-site button, "Build something like this" → `/#contact`, "← Back to work" → `/#work`).
- `routes/index.tsx`: add 3 children before `*`: `{ path: '/work/:slug', element: <CaseStudyPage/> }` (single param route covers all three; `includedRoutes` not needed since no prerender).
- Verify: `pnpm typecheck && pnpm build`; browser-check all 3 routes on direct visit.

### Task 5 — Home Seo + internal links + structured data
- `Home/index.tsx`: render `<Seo title="…" description="…" canonicalPath="/" jsonLd={[organizationLd, faqPageLd]} />`. Build `faqPageLd` from the existing `faqItems`; `organizationLd` = Organization (name, url, logo `/og-cover.png`, founder).
- Add to the 3 flagship `ProjectCard`s a `<Link to={'/work/'+slug}>View case study →</Link>` in the CTA row (guard by a `CASE_STUDY_SLUGS` set).
- Verify: typecheck + build.

### Task 6 — index.html, sitemap, deps
- `index.html`: remove `<meta name="description">` and `<link rel="canonical">` (keep title/OG/twitter/JSON-LD).
- `sitemap.xml`: 4 `<url>` entries (`/`, `/work/nexa-welbodi`, `/work/nexa-logistix`, `/work/rms-death-tracker`), lastmod 2026-05-28.
- `package.json`: remove the 4 three.js deps; `pnpm install` to refresh lockfile; confirm `pnpm build` still passes.

### Task 7 — Review & verify
- `pnpm typecheck && pnpm lint && pnpm build`.
- Browser: Home (unchanged look, nav/footer work), each `/work/<slug>` on direct load (assets resolve, unique title/canonical), card → case-study links, case-study → `/#work` and `/#contact` links.
- `code-reviewer` → PASS; `qa` → PASS; `verification-before-completion`.
- Confirm with Daniel before `git push`.
