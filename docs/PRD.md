# 1. Document Control

| Field | Value |
|---|---|
| Product | Digital Solution Builders — portfolio & lead-generation site |
| Version | 1.1 |
| Last updated | 2026-08-02 — implementation-status refresh |
| Status | Live — https://dsbdigital.biz (Vercel project `dsb-digital`) |
| Owner | Daniel Solomon Bangura |
| Brand | Digital Solution Builders (DSB) — personal Digital Product Development brand |
| Classification | Confidential — Digital Solution Builders |
| Repository | `dsbangs1367-pixel/digital-solution-builders-site` (public) |

> The Digital Solution Builders site is the home of a personal Digital Product Development practice. This document records the live site, what it does, and where it goes next. Content stays focused on Digital Product Development.

---

# 2. Executive Summary

**What it is.** A fast, dark-themed single-page React site that presents the Digital Solution Builders brand, showcases case-study work, publishes insight articles, and captures inbound leads. It includes a lightweight owner-only admin area for engagement analytics; portfolio and article content is managed in code (data registries guarded by parity tests), not through the admin UI.

**Why it exists.** It is the brand's shopfront and lead engine: a place for prospective B2C clients to understand the offer, see proof of work, and get in touch. It replaced a paid website-builder (Wegic), removing a recurring subscription while giving full control over performance, security and content.

**Current status (2026-08-02).** Live on Vercel at dsbdigital.biz with full security headers, a contact-to-lead flow, and a weekly automated health-check. The portfolio carries 19 project entries (12 live) and 13 case-study pages, plus 9 insight articles, and a career-playbook landing page shipped 2026-07-20 at `/playbook`. The codebase is a Vite + React 19 + TypeScript app with Framer Motion and Recharts; serverless functions on Vercel plus Upstash Redis (KV) back the admin analytics and lead relay (a Supabase client scaffold exists but is unused).

**The single ask.** Keep the site as the canonical brand surface and approve incremental content/SEO investment (more case studies, articles) on the current zero-recurring-cost hosting.

---

# 3. Problem & Context

**The problem.** A solo Digital Product Development practice needs a credible, fast, controllable web presence that turns visitors into enquiries — without paying a monthly website-builder fee or being locked out of its own performance and security settings.

**Why now.** Migrating off the Wegic builder (completed 2026-05-01) removed a $69.99/month cost and unlocked full ownership of the stack: edge hosting on Vercel, hardened HTTP headers, and a custom lead pipeline.

**The approach.** A hand-built single-page app on modern, free-tier-friendly infrastructure, with a small admin surface so content can evolve without redeploys, and an automated weekly health-check guarding uptime, TLS and headers.

---

# 4. Users & Personas

**Prospective client (primary).** A B2C visitor evaluating whether to hire DSB for digital product work. Wants to quickly grasp the offer, see relevant case studies, and reach out.

**Reader.** Arrives via an article or insight piece; a top-of-funnel visitor to be nurtured toward enquiry.

**Owner / admin (Daniel).** Manages projects, publishes articles, and reviews engagement through the admin and insights areas.

---

# 5. Scope

| In scope (v1.0, shipped) | Out of scope (v1.0) | Later |
|---|---|---|
| Marketing single-page site (hero, value prop, CTA) | E-commerce / checkout | Expanded case-study library |
| Case studies + insight articles | Client login portal | SEO content programme |
| Contact-to-lead capture | Multi-author CMS | A/B-tested landing variants |
| Admin area (projects, content) | Paid memberships | Richer analytics dashboards |
| Insights/analytics view | — | — |

---

# 6. Functional Requirements & Feature Set

### 6.1 Marketing site — **Shipped**
- Home page with hero, value proposition and clear call-to-action; brand presentation in the DSB dark/green identity.

### 6.2 Case studies & articles — **Shipped**
- Case-study pages showcasing delivered work; an article/blog surface for insight content.
- As of 2026-08-02: 13 case-study pages (`/work/<slug>`, each with a prerendered OG card for social crawlers) and 9 insight articles. The latest portfolio expansion (five new case studies; counters derived from the data) merged 2026-07-30 via PR #11.

### 6.3 Lead capture — **Shipped**
- A contact form that feeds an inbound-lead pipeline (n8n-backed intake), turning visitors into enquiries.
- Implemented as a serverless relay (`/api/contact`) so the webhook URL stays server-side; the playbook page adds a second lead endpoint (`/api/playbook-lead`) into the same n8n intake.

### 6.4 Admin area — **Shipped (analytics scope)**
- An authenticated admin section (multiple sub-routes) to manage projects and content without code changes.
- Status note (2026-08-02): what shipped is an owner-only, password-gated admin covering analytics, reporting and login/logout. Project and article content is still managed in code (data registries cross-checked by tests) — the content-management portion of this requirement remains open.

### 6.5 Insights / analytics — **Shipped**
- An insights view rendering engagement data with Recharts.
- Live since 2026-06-01: `/admin/analytics`, a KV-backed visit tracker (pageviews, share clicks, contact intents, form submits, device/browser/country breakdowns; no IPs stored; bot traffic filtered), covered by its own smoke-test suite. The public "Insights" route is the article listing.

### 6.6 Reliability automation — **Shipped**
- A weekly automated health-check (DNS, HTTPS, SSL, headers, body) reporting to a private channel.

### 6.7 Implementation status (as of 2026-08-02)

| Item | Status | Date |
|---|---|---|
| Migration off Wegic to Vercel (`dsb-digital`) | Shipped | 2026-05-01 |
| Security headers via `vercel.json` | Shipped | with migration |
| Admin analytics (`/admin/analytics`, KV-backed) | Shipped | 2026-06-01 |
| Portfolio: 19 entries / 12 live / 13 case studies | Shipped | 2026-07-30 (PR #11) |
| Insight articles (9) with prerendered deep pages | Shipped | rolling, since 2026-05 |
| Career playbook landing page (`/playbook`: free CV-guide download + notify-me, terms/privacy/refunds pages) | Shipped | 2026-07-20 (PR #7) |
| Playbook paid checkout | Not live — buy CTA deployed dormant behind a `CHECKOUT_URL` launch switch (PR #10) | pending |
| Admin content management (projects/articles editable without code) | Not built — content lives in code registries | open |
| Weekly health-check to private channel | Running | weekly |

---

# 7. Non-Functional Requirements

- **Performance.** Vite production build served from Vercel's edge; motion via Framer Motion kept lightweight; targets strong Core Web Vitals.
- **Security.** Full HTTP security headers via `vercel.json`; Let's Encrypt TLS; weekly automated header/TLS verification.
- **Type safety.** `tsc` strict must pass; ESLint runs clean (no warnings).
- **Cost.** Zero recurring hosting cost (replaced the $69.99/month builder); free-tier Supabase/Upstash.
- **Brand integrity.** Content stays on Digital Product Development; the DSB green-on-black identity (Inter + Cormorant Garamond) is consistent throughout.

---

# 8. Technical Architecture

- **Frontend.** Vite 7 + React 19 + TypeScript 5.6 + Tailwind CSS 3.4 + Framer Motion; React Router v7; Recharts.
- **Backend services.** Vercel serverless functions (`api/`) with Upstash Redis (KV) for analytics storage and admin-session revocation; admin auth is password-gated with an HMAC-signed HttpOnly cookie (no Supabase in the live path — a Wegic-era Supabase client scaffold remains in the repo, unused). Contact and playbook lead forms relay server-side to an n8n lead-intake workflow.
- **Hosting & domain.** Vercel (project `dsb-digital`), auto-deploy on push to `main`; apex `dsbdigital.biz` + `www`; Let's Encrypt SSL.
- **Tooling.** pnpm only (`pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`). Node toolchain is not on the default PATH on the build machine and must be exported.
- **Brand tokens.** Accent green `#32DC70` on near-black `#0a0a0a`; body Inter, display Cormorant Garamond; dark mode by default.

---

# 9. Success Metrics & KPIs

| Metric | Target |
|---|---|
| Recurring hosting cost | $0 (down from $69.99/mo) — **met** |
| Uptime / health-check pass rate | 100% weekly checks green |
| Security header grade | All headers present and correct — **met** |
| Inbound enquiries via contact form | Establish baseline, grow quarter-on-quarter |
| Core Web Vitals | All "good" thresholds |

---

# 10. Risks, Roadmap & Appendix

### 10.1 Risks & mitigations

| Risk | Mitigation |
|---|---|
| Silent downtime or TLS/header regression | Weekly automated health-check with channel alerting |
| Lead-pipeline breakage (email/auto-reply) | n8n intake monitored; SMTP credential refresh path documented |
| Brand drift | Content guardrail: Digital Product Development focus; consistent DSB tokens |
| Vendor lock-in recurrence | Owns the stack on free-tier, portable infrastructure |

### 10.2 Roadmap & milestones
- **Now (shipped, as of 2026-08-02):** live site, 13 case studies, 9 articles, lead capture, admin analytics, weekly health-check; migrated off Wegic (2026-05-01); playbook landing page (2026-07-20); portfolio expansion to 19 entries (2026-07-30).
- **Next:** activate the playbook paid checkout (flip the dormant `CHECKOUT_URL` switch once the payment provider approval completes); continue the case-study and SEO article cadence.
- **Later:** A/B-tested landing variants; richer analytics; admin-managed content (currently code-managed).

### 10.3 Appendix
- **Glossary.** CWV = Core Web Vitals; lead intake = the contact-form-to-pipeline flow.
- **Source docs.** Repository README; `vercel.json` (security headers); the weekly health-check routine.
