# TODOS

Living list of design / engineering follow-ups carried over from
[/design-review reports](https://github.com/dsbangs1367-pixel/digital-solution-builders-site/tree/main/.gstack/design-reports).

## Open

### Performance — code-split below-fold sections (F-004, /design-review 2026-05-09)

**Symptom:** domReady on cold load is ~4.2s. TTFB is fine (~106ms). The full
~439KB initial JS bundle is the bottleneck — every byte loads upfront because
the Home route ships as one chunk.

**Investigation done:** Tree-shaking is working — confirmed `three`,
`@react-three/fiber`, `@supabase/supabase-js`, `react-helmet-async` are NOT
in the production bundle despite being listed in `package.json`. Bundle is
genuinely React + Framer Motion + Lucide + the page itself.

**Real fix:**
1. Wrap below-fold sections in `React.lazy()` — ProjectCard list,
   AboutSection, ServicesSection, PricingSection, TechStackSection,
   FAQSection, ContactSection — each becomes a separate chunk.
2. Wrap each in `<Suspense fallback={null}>`.
3. Verify `useInView` from framer-motion still triggers reveal animations
   correctly across Suspense boundaries.
4. Test scrolling reveals content as expected at all breakpoints.
5. Re-measure: target domReady < 2.0s, LCP < 1.5s.

**Why not done in /design-review 2026-05-09:** scope. The audit-only fix
loop applied 7 atomic commits for HIGH/MEDIUM design issues; lazy-loading
is a structural refactor that warrants its own focused session with proper
before/after benchmarking.

### Re-host case-study images off cdn.wegic.ai (carry-over from F-001)

The 6 case-study images and the og:image / twitter:image still point at
`cdn.wegic.ai`. CSP allows them via `img-src https:`, so they keep loading,
but they're hosted on a vendor we've migrated off. Wegic could expire or
re-route those URLs at any point.

**Fix:** download from cdn.wegic.ai → commit to `public/projects/` →
update the `image:` URLs in `src/pages/Home/index.tsx` and `og:image` /
`twitter:image` in `index.html`.

### Pricing values — confirm with Daniel before next iteration (F-003)

The pricing section ships with engagement bands and durations but no
NLE/USD numbers. The "Get a fixed quote" CTA is the conversion mechanism
in v1. If a "from $X" anchor would convert better, add it after Daniel
confirms the actual minimums.

## Closed (rolled into /design-review 2026-05-09 commit chain)

- F-001 Wegic content + stack list → stripped
- F-002 CSP allow-list → drop wegic.ai, drop blocked Amplitude script
- F-006 default Chrome focus outline → custom green focus-visible ring
- F-008 :visited links indistinguishable → 70% opacity rule added
- F-009 H3 service titles at weight 400 → bumped to weight 500
- F-003 no pricing or FAQ → PricingSection + FAQSection added
- F-004 (partial) — `decoding="async"` on case-study images
