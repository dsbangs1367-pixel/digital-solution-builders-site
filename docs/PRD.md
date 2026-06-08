# 1. Document Control

| Field | Value |
|---|---|
| Product | Digital Solution Builders — portfolio & lead-generation site |
| Version | 1.0 |
| Status | Live — https://dsbdigital.biz (Vercel) |
| Owner | Daniel Solomon Bangura |
| Brand | Digital Solution Builders (DSB) — personal Digital Product Development brand |
| Classification | Confidential — Digital Solution Builders |
| Repository | `dsbangs1367-pixel/digital-solution-builders-site` (public) |

> The Digital Solution Builders site is the home of a personal Digital Product Development practice. This document records the live site, what it does, and where it goes next. Content stays focused on Digital Product Development.

---

# 2. Executive Summary

**What it is.** A fast, dark-themed single-page React site that presents the Digital Solution Builders brand, showcases case-study work, publishes insight articles, and captures inbound leads. It includes a lightweight admin area for managing projects and content, and an analytics/insights view.

**Why it exists.** It is the brand's shopfront and lead engine: a place for prospective B2C clients to understand the offer, see proof of work, and get in touch. It replaced a paid website-builder (Wegic), removing a recurring subscription while giving full control over performance, security and content.

**Current status.** Live on Vercel at dsbdigital.biz with full security headers, a contact-to-lead flow, and a weekly automated health-check. The codebase is a Vite + React 19 + TypeScript app with Framer Motion, Recharts, and a Supabase/Upstash backend for admin and analytics.

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

### 6.3 Lead capture — **Shipped**
- A contact form that feeds an inbound-lead pipeline (n8n-backed intake), turning visitors into enquiries.

### 6.4 Admin area — **Shipped**
- An authenticated admin section (multiple sub-routes) to manage projects and content without code changes.

### 6.5 Insights / analytics — **Shipped**
- An insights view rendering engagement data with Recharts.

### 6.6 Reliability automation — **Shipped**
- A weekly automated health-check (DNS, HTTPS, SSL, headers, body) reporting to a private channel.

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
- **Backend services.** Supabase (auth/DB for admin), Upstash Redis (caching); contact form wired to an n8n lead-intake workflow.
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
- **Now (shipped):** live site, case studies, articles, lead capture, admin, insights, weekly health-check; migrated off Wegic.
- **Next:** expand case-study library; launch an SEO content programme.
- **Later:** A/B-tested landing variants; richer analytics.

### 10.3 Appendix
- **Glossary.** CWV = Core Web Vitals; lead intake = the contact-form-to-pipeline flow.
- **Source docs.** Repository README; `vercel.json` (security headers); the weekly health-check routine.
