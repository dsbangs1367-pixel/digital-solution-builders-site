# The Global African Professional: landing page design

Date: 2026-07-20
Status: approved design, pre-implementation
Branch: `feat/playbook-landing` (off `main`; the unmerged `feat/kabod-solutions-rebrand` branch is intentionally not involved)

## Purpose

Sell and distribute "The Global African Professional", Daniel's USD 29 career playbook (84-page PDF + 5 docx templates), from the live Digital Solution Builders site. The page must also satisfy Paddle's Live-account review, which requires a public product page plus terms, privacy, and refund pages. At launch the page captures leads (free guide + notify-me); paid checkout is wired in a later pass after Paddle approval.

## Locked decisions

1. **Brand/branch:** build off `main`, Digital Solution Builders brand, dsbdigital.biz. The Kabod rebrand, if it ever merges, carries this page with it.
2. **Launch CTA mode:** notify-me email capture for the paid book; the free CV guide is the primary conversion. No payment integration in this pass.
3. **Lead magnet delivery:** instant download after form submit. No email-sending dependency (n8n Gmail SMTP is dead).
4. **Hero treatment:** book-cover hero (visual option A): stacked serif title, green rule, subtitle, CTAs. Matches the PDF the buyer receives.
5. **Refund policy:** 30 days, by email (Daniel confirmed 2026-07-19). Stated identically in the FAQ and the refunds page.

## Routes

Four new lazy-loaded routes registered in `src/routes/index.tsx`, following its existing conventions (lazy() + `<Lazy>` wrapper, 404 stays last):

| Route | Page | Purpose |
|---|---|---|
| `/playbook` | `src/pages/Playbook/index.tsx` | Product landing page |
| `/terms` | `src/pages/Legal/Terms.tsx` | Terms of sale/use (Paddle requirement) |
| `/privacy` | `src/pages/Legal/Privacy.tsx` | Privacy policy (what the forms and first-party analytics collect) |
| `/refunds` | `src/pages/Legal/Refunds.tsx` | 30-day email refund policy |

Legal pages share one `LegalPage` layout component (title, updated-date line, prose column). All three are linked from `SiteFooter` site-wide. `public/sitemap.xml` and the `Seo` component get entries for all four routes.

## Landing page structure

Content comes VERBATIM from the audited launch copy at
`~/Desktop/Personal Projects/Career Playbook/launch/landing_copy.md` (voice-gated, redaction-audited, no em dashes). Sections in order:

1. **Hero (option A):** small "DIGITAL SOLUTION BUILDERS" wordmark line, stacked serif title THE GLOBAL AFRICAN PROFESSIONAL, green accent rule, subhead (includes "USD 29, Leone equivalent shown at checkout"), primary CTA "Get the free CV guide" (smooth-scrolls to the lead form), secondary CTA "Get notified when it launches".
2. **The audit story** (the "Daniel Bangura.pdf" certificate, 12 stranded credentials, the non-compete found by audit).
3. **What is inside:** intro + 8 chapter summaries.
4. **The five templates.**
5. **Who it is for / who it is not for.**
6. **The honesty covenant** (differentiator block).
7. **Price block:** USD 29, one payment, Leone equivalent at checkout; in this pass the buy button renders the notify-me form state.
8. **FAQ:** 6 questions including the 30-day refund.
9. **Author bio** (no Nexa-Flow mention; brand-separation rule).
10. **Lead form**: a SINGLE form section (anchor `#get-started`) rendered once, below the price block. It has a two-tab mode switch (Free guide | Notify me). The hero's primary CTA scrolls to it with `guide` preselected; the hero's secondary CTA and the price block's button scroll to it with `notify` preselected. There are never two form instances on the page.

Visual language: existing site tokens only (`--background` #0a0a0a, `--foreground` #f5f5f5, `--accent-green`, existing serif/sans stack). Framer Motion usage mirrors `src/pages/Home/index.tsx` (useInView reveals, reduced-motion respected). No new dependencies. No em dashes anywhere in page copy.

## Lead capture

**Component:** one `PlaybookLeadForm` with a `mode` prop: `"guide"` (free CV guide) or `"notify"` (launch list). Fields: name, email, plus a honeypot text input hidden from real users. Client-side validation mirrors `api/contact.ts` limits (name <= 200 chars, valid email).

**API:** new `api/playbook-lead.ts` Vercel function cloned from the `api/contact.ts` shape:
- `POST` only; validates name/email/mode; rejects filled honeypot with a 200 (silent drop).
- Relays JSON to the existing n8n webhook (`N8N_LEAD_WEBHOOK_URL`, already set in Vercel) with payload `{ name, email, interest: "guide"|"notify", source: "playbook", submittedAt, userAgent }`.
- Returns `{ ok: true }`; the client never sees the webhook URL.

**Success behavior:** `guide` mode reveals the download button for `/downloads/the-cv-that-gets-you-shortlisted.pdf` (copied into `public/downloads/`; the free guide is intentionally un-gated at the URL level). `notify` mode shows a plain confirmation line.

**n8n side (via n8n MCP, same workflow `JED2YaHFajte18eL` "DSB Lead Intake"):** add a branch keyed on `source === "playbook"` that (a) posts the existing Slack notification and (b) appends the lead to an n8n Data Table (`playbook_leads`: name, email, interest, submittedAt) so the notify-me list is durable and exportable when Paddle goes live. Site behavior does not depend on (b); if the Data Table step fails, Slack still receives the lead.

## Legal pages content

Short, plain-English, precise (light-dose voice; no em dashes):
- **Terms:** digital product, license for personal use, no redistribution of book or templates, seller of record note (Paddle acts as merchant of record for card sales once live), governing contact email.
- **Privacy:** what is collected (name + email on the two forms; first-party analytics via the site's existing `api/track.ts`: page views, user agent), where it goes (n8n/Slack/data table), no third-party ad tracking, contact for deletion requests.
- **Refunds:** 30 days from purchase, request by email, no conditions; matches FAQ wording and, later, the Paddle dashboard setting.

Drafts are written during implementation and pass the standing humanizer + sound-human (light dose) gate before commit.

## Assets

- `public/downloads/the-cv-that-gets-you-shortlisted.pdf` (copied from the Career Playbook workspace).
- `public/og/playbook-og.png` 1200x630: rendered one-off from page 1 of the flagship PDF (PyMuPDF pixmap -> PIL crop/resize), committed as a binary.
- Book-cover visual in the hero is pure CSS/JSX (like the approved mockup), not an image.

## Testing and verification

- New bun smoke test `tests/playbook.smoke.mjs` following existing tests/ conventions: routes registered, page module exports, landing copy landmarks present (title, USD 29 + Leone line, 30-day refund line, no em dash characters in page source), `api/playbook-lead.ts` validation logic (reject bad email/missing fields/filled honeypot).
- `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, and the existing smoke suite stay green.
- Design & Build loop: code-reviewer -> qa -> governance-reviewer -> gstack-design-review (against `pnpm run dev` via the browse daemon) -> superpowers:verification-before-completion.
- Ship: commits stay on `feat/playbook-landing`; push and merge to `main` (which auto-deploys production) ONLY after Daniel's explicit confirmation.

## Out of scope this pass

Paddle/Monime checkout wiring; email automation (SMTP dead); Kabod rebrand interplay; any change to the paid book or templates.

## Open items (not blockers)

- Paddle Live signup completes after this page deploys (Daniel's action, sandbox account already exists).
- When Paddle approves: swap notify-me for the hosted checkout link and mirror the 30-day refund in the Paddle dashboard (tracked in the Career Playbook `checkout_notes.md`).