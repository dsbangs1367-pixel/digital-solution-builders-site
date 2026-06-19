// Factual case-study content for the three flagship builds.
// Framed as Digital Solution Builders portfolio work — no institutional
// framing, no invented metrics or testimonials. Keep slugs in sync with
// CASE_STUDY_SLUGS in Home and the routes in routes/index.tsx.

export interface CaseStudyStat {
  label: string;
  value: string;
}

export interface CaseStudySection {
  heading: string;
  body: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  accent: string;
  heroImage: string;
  heroImageAlt: string;
  liveUrl: string;
  liveLabel: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  stats: CaseStudyStat[];
  services: string[];
  sections: CaseStudySection[];
}

export const caseStudies: Record<string, CaseStudy> = {
  'nexa-welbodi': {
    slug: 'nexa-welbodi',
    title: 'Nexa-Health Welbodi EMR',
    category: 'Healthcare · Electronic Medical Records',
    tagline: 'Lifelong health records. Starting today.',
    accent: '#3a8fb5',
    heroImage: '/projects/nexa-welbodi.png',
    heroImageAlt:
      'Nexa-Health Welbodi EMR dashboard — clinical workspace with patients-today, OPD queue, bed-occupancy and critical-alert tiles, quick actions, live priority-breakdown queue, and recent-activity feed',
    liveUrl: 'https://welbodi.dsbdigital.biz',
    liveLabel: 'welbodi.dsbdigital.biz',
    metaTitle:
      'Welbodi EMR — Offline-First Electronic Medical Records | Digital Solution Builders',
    metaDescription:
      'A FHIR R4–aligned, offline-first electronic medical records platform for hospitals and clinics — OPD, pharmacy, MCH/ANC, HIV, TB and laboratory workflows with role-based access. A full-stack build by Digital Solution Builders.',
    intro:
      'An offline-first electronic medical records platform for hospitals, clinics, and peripheral health units in low-connectivity settings — built end-to-end, from the data model to the clinical interface.',
    stats: [
      { label: 'Stage', value: 'UAT' },
      { label: 'Pilot', value: 'Connaught Hospital' },
      { label: 'Standard', value: 'FHIR R4' },
    ],
    services: ['Full-stack EMR', 'Offline-first PWA', 'Clinical UX'],
    sections: [
      {
        heading: 'The brief',
        body: 'Hospitals and clinics in low-connectivity settings need a records system that keeps working when the internet does not, and that mirrors how clinicians actually work rather than imposing a foreign template. The goal was a general-purpose EMR — usable from a large hospital down to a peripheral health unit — that captures a patient’s record once and keeps it for life.',
      },
      {
        heading: 'What we built',
        body: 'A role-based EMR spanning patient registration, OPD queues, pharmacy and dispensing, maternal and child health (MCH/ANC), HIV and TB programmes, and laboratory ordering and results. The data model is FHIR R4–aligned and OpenMRS-inspired, so records stay interoperable. Clinical and administrative staff each see workflows scoped to their role.',
      },
      {
        heading: 'The stack',
        body: 'FastAPI with async SQLAlchemy and PostgreSQL on the backend, Celery and Redis for background processing, packaged with Docker. The frontend is React 18 + Vite + TypeScript + Tailwind, wrapped in a Workbox service worker so the app stays usable offline and syncs when a connection returns.',
      },
      {
        heading: 'Where it is now',
        body: 'The platform is in user-acceptance testing with clinical testers at Connaught Hospital, deployed via Docker on a managed server with an automated CI/CD pipeline. (“Welbodi” is Krio for “good health” — a project codename, not a reference to any specific facility.)',
      },
    ],
  },

  'nexa-logistix': {
    slug: 'nexa-logistix',
    title: 'Nexa-Logistix LMIS',
    category: 'Health Logistics · Web Application',
    tagline: 'A pharmaceutical supply-chain operating system.',
    accent: '#0e7a8a',
    heroImage: '/projects/nexa-lmis.png',
    heroImageAlt:
      'Nexa-Logistix LMIS dashboard — supply-chain overview with stock-at-risk table, alert severity counters, and full sidebar navigation across inventory, supply chain, patients & pharmacy, alerts, and administration modules',
    liveUrl: 'https://lmis.dsbdigital.biz',
    liveLabel: 'lmis.dsbdigital.biz',
    metaTitle:
      'Nexa-Logistix LMIS — Pharmaceutical Supply-Chain Platform | Digital Solution Builders',
    metaDescription:
      'A full-stack logistics management information system for pharmaceutical supply chains — inventory, cold-chain, requisitions, distribution, dispensing, POS, demand forecasting and serialised track-and-trace. Multilingual, with an open public demo.',
    intro:
      'A full-stack logistics management information system that runs a pharmaceutical supply chain end to end — from central store to the point of dispensing — with an open public demo anyone can explore.',
    stats: [
      { label: 'Stage', value: 'Production' },
      { label: 'Languages', value: 'EN · KRI · FR' },
      { label: 'Demo', value: 'Open' },
    ],
    services: ['Full-stack Development', 'Database & API Design', 'Multilingual UX'],
    sections: [
      {
        heading: 'The brief',
        body: 'Pharmaceutical supply chains lose value to stockouts, expiry, and poor visibility. Managers needed a single system covering the whole chain — not a spreadsheet per facility — with access scoped so national, regional, and facility users each see the right slice of the data.',
      },
      {
        heading: 'What we built',
        body: 'Modules for inventory and stock counts, cold-chain monitoring, requisitions and purchase orders, distribution, dispensing, point-of-sale, AI demand forecasting, and serialised track-and-trace. The interface is multilingual — English, Krio, and French — so it works for the people who actually run the stores.',
      },
      {
        heading: 'The stack',
        body: 'A FastAPI + PostgreSQL backend with a React + TypeScript + Vite frontend, designed to tolerate intermittent connectivity. Role-based access control runs throughout, so data scope follows the user.',
      },
      {
        heading: 'Where it is now',
        body: 'Live in production, with an open public demo (no login required) so anyone can walk the full workflow — from receiving stock to dispensing — without an account.',
      },
    ],
  },

  'rms-death-tracker': {
    slug: 'rms-death-tracker',
    title: 'RMS Death Tracker',
    category: 'Public Health · Surveillance Platform',
    tagline: 'One death, counted once. Excess mortality, in real time.',
    accent: '#c0443a',
    heroImage: '/projects/nexa-rms.png',
    heroImageAlt:
      'RMS Death Tracker — excess-mortality dashboard showing total excess over baseline and over threshold, with observed-versus-95% confidence-interval charts broken down by sex and age group',
    liveUrl: 'https://rms.dsbdigital.biz',
    liveLabel: 'rms.dsbdigital.biz',
    metaTitle:
      'RMS Death Tracker — Rapid Mortality Surveillance & Excess-Mortality Calculator | Digital Solution Builders',
    metaDescription:
      'A rapid mortality surveillance platform: a single-source, de-duplicated death register feeding a code-exact reimplementation of the Vital Strategies Excess Mortality Calculator, with offline-first PWA dashboards. Built by Digital Solution Builders.',
    intro:
      'A rapid mortality surveillance platform built around one idea: count each death once. A single-source, de-duplicated death register feeds a code-exact excess-mortality engine and offline-first dashboards.',
    stats: [
      { label: 'Stage', value: 'Production' },
      { label: 'Method', value: 'Excess Mortality' },
      { label: 'Surfaces', value: 'Offline PWA' },
    ],
    services: ['Full-stack Development', 'Epidemiological Modelling', 'Offline-first PWA'],
    sections: [
      {
        heading: 'The brief',
        body: 'When deaths are recorded across several registers, the same death gets counted more than once — and surveillance teams still need to know whether mortality is running above its historical baseline. The brief was a single intake that de-duplicates first, then computes excess mortality reliably.',
      },
      {
        heading: 'What we built',
        body: 'A single-source death register that de-duplicates records so a death captured in two systems counts only once, feeding a code-exact reimplementation of the Vital Strategies Excess Mortality Calculator (historical-average and negative-binomial GLM models). It carries the national facility registry, role-based access (data entry, analyst, admin), and offline-first dashboards with observed-versus-95%-confidence-interval bands, sex-by-age breakdowns, and chart export. The methodology follows the Vital Strategies / Resolve to Save Lives Excess Mortality Calculator.',
      },
      {
        heading: 'The stack',
        body: 'FastAPI with async SQLAlchemy and PostgreSQL on the backend; a React 18 + Vite + React Query progressive web app on the frontend, built offline-first for field use.',
      },
      {
        heading: 'Where it is now',
        body: 'Live in production on a dedicated server, hardened with self-service password rotation, idle screen-lock, and multi-user administration.',
      },
    ],
  },

  'nexa-synapse': {
    slug: 'nexa-synapse',
    title: 'Nexa-Analytics Synapse',
    category: 'Analytics · Intelligence Layer',
    tagline: 'The intelligence layer connecting every product.',
    accent: '#5b6cdf',
    heroImage: '/projects/nexa-synapse.png',
    heroImageAlt:
      'Nexa-Analytics Synapse login screen — clean branded sign-in panel with email and password fields',
    liveUrl: 'https://synapse.dsbdigital.biz',
    liveLabel: 'synapse.dsbdigital.biz',
    metaTitle:
      'Nexa-Analytics Synapse — Cross-Product Analytics & Tamper-Evident Audit Log | Digital Solution Builders',
    metaDescription:
      'A cross-product analytics and intelligence layer that ingests from the Welbodi EMR, the LMIS, and surveillance tools — surfacing forecasts, anomalies, and operational insights through dashboards and an API, with an RFC 6962 Merkle log and a weekly OpenTimestamps anchor for tamper-evident audit. Built by Digital Solution Builders.',
    intro:
      'A cross-product analytics and intelligence layer that pulls from each operational product in the portfolio and turns the joint signal into forecasts, anomalies, and dashboards — with a tamper-evident audit log you can verify from first principles.',
    stats: [
      { label: 'Stage', value: 'In Development' },
      { label: 'Role', value: 'Analytics Layer' },
      { label: 'Access', value: 'Admin-provisioned' },
    ],
    services: ['Data Pipeline Design', 'Dashboard UI', 'AI / Forecasting'],
    sections: [
      {
        heading: 'The brief',
        body: 'Each operational product in the portfolio generates its own data — patient encounters in the EMR, dispensing and stock movements in the LMIS, mortality records in the surveillance tool. Looked at one at a time, the joint signal hides: a spike in dispensing in one district, a stock shortfall in another, a rise in encounters somewhere else. The brief was a shared analytics layer that ingests from all of them and produces forecasts, anomalies, and operational dashboards — with an audit trail that does not require trusting the platform itself.',
      },
      {
        heading: 'What we built',
        body: 'A cross-product analytics and intelligence layer that ingests from the LMIS, the Welbodi EMR, and other connected systems, then surfaces forecasts, anomalies, and operational insights through dashboards and a JSON API. Access is admin-provisioned via the backend CLI, so no anonymous account can write into the layer. Every analytics record is appended to an RFC 6962–style Merkle log; a weekly OpenTimestamps anchor pins the log root to a public Bitcoin proof, so any historical record can be verified back to a specific point in time without trusting the operator.',
      },
      {
        heading: 'The stack',
        body: 'A Python service handling ingest and the Merkle log, PostgreSQL for the aggregated store, and a React + TypeScript dashboard on top. Deployed via Docker on a managed droplet, with the public surface at synapse.dsbdigital.biz.',
      },
      {
        heading: 'Where it is now',
        body: 'In active development with the tamper-evident log live and pulling from the first connected products. Next builds are richer cross-product forecasts and an expanded set of operational anomaly detectors.',
      },
    ],
  },

  'nexa-continuum': {
    slug: 'nexa-continuum',
    title: 'Nexa-Health Continuum',
    category: 'Healthcare · Longitudinal Patient Journey',
    tagline: 'One timeline. Every provider.',
    accent: '#2c6e8f',
    heroImage: '/projects/nexa-continuum.png',
    heroImageAlt:
      'Nexa-Health Continuum — longitudinal patient-journey dashboard with a unified timeline across providers, multi-provider lab trend chart with abnormal-result flagging, scanned-document viewer, and a clinician-signed AI clinical assessment panel',
    liveUrl: 'https://dsbdigital.biz/#contact',
    liveLabel: 'In development — get in touch',
    metaTitle:
      'Nexa-Health Continuum — Longitudinal Patient Journey & Clinical Decision Support | Digital Solution Builders',
    metaDescription:
      'A longitudinal patient-journey and clinical-decision-support platform: one timeline across providers, multi-provider lab trends with abnormal-result flagging, vision ingestion of scanned reports (clinician-verified), AI clinical assessment (clinician-signed), real-time vitals, FHIR R4 and DHIS2 exchange, and an Expo clinician mobile app. A T1 clinical build by Digital Solution Builders.',
    intro:
      'A longitudinal patient-journey and clinical-decision-support platform that unifies a patient’s records from many providers into one timeline, trends labs on a single axis, flags abnormal results, ingests scanned reports with a vision model, drafts a clinical assessment, and streams live vitals — all human-in-the-loop, so nothing affecting care auto-finalizes.',
    stats: [
      { label: 'Stage', value: 'In Development' },
      { label: 'Risk Tier', value: 'T1 Clinical' },
      { label: 'Surfaces', value: 'Web + Mobile' },
    ],
    services: ['Full-stack Clinical Build', 'Vision + LLM Integration', 'FHIR / DHIS2 Interop'],
    sections: [
      {
        heading: 'The brief',
        body: 'A patient’s health story does not live in one place. Records sit across hospitals, clinics, labs and pharmacies, each in its own portal — so clinicians make decisions with a slice of the picture, and abnormal trends across providers go unseen. The brief was a single platform that unifies a patient’s longitudinal record from many providers, lets clinicians work from one timeline, and uses AI to assist — never to replace — the clinical decision.',
      },
      {
        heading: 'What we built',
        body: 'A six-phase platform: multi-tenant data with org and facility scoping on every patient-data row, role-based access, analyte canonicalisation and lab trends, abnormal-result flagging, a unified timeline, scanned-document ingest via a vision model with clinician verification, an AI clinical assessment that drafts then waits for clinician sign-off, narrative episodes, FHIR R4 import and export, DHIS2 push with idempotent sync, real-time vitals over WebSocket with alert rules and acknowledgement, an Expo clinician mobile client over the same REST API, and a hardened security baseline — headers, CORS, login rate limiting, and an append-only audit log.',
      },
      {
        heading: 'The stack',
        body: 'FastAPI with async SQLAlchemy 2.0 and PostgreSQL on the backend, Alembic for migrations (SQLite in dev and tests for fast iteration). The web client is a React 18 + Vite + TypeScript + Tailwind PWA with TanStack Query v5 and Recharts; the mobile client is React Native + Expo against the same REST API. Claude (claude-opus-4-8) handles vision extraction and clinical reasoning — both human-in-the-loop: extractions land unverified, assessments are drafts until a clinician signs them off, and nothing affecting care auto-finalises.',
      },
      {
        heading: 'Where it is now',
        body: 'All six phases — data model, AI, interop, real-time vitals, mobile, and security — are built behind a code-review → QA → AI-governance gate at each phase, with 145+ backend tests in CI. As a T1 clinical product, live deployment is gated on a documented pre-live obligations checklist (production secrets rotated, executed DPIA, model-provider data-processing agreement, and a clinical-safety case sign-off). Those gates are open and being closed before any real PHI is loaded.',
      },
    ],
  },

  'salone-gospel-hub': {
    slug: 'salone-gospel-hub',
    title: 'Salone Gospel Hub',
    category: 'Faith & Music · Community Platform',
    tagline: 'The home of Sierra Leonean Gospel.',
    accent: '#12A150',
    heroImage: '/projects/salone-gospel-hub.png',
    heroImageAlt:
      'Salone Gospel Hub — mobile-first directory and community hub for the Sierra Leonean gospel ecosystem, with profiles for artists, choirs, churches and producers, plus a song discovery feed and events surface',
    liveUrl: 'https://dsbdigital.biz/#contact',
    liveLabel: 'In development — get in touch',
    metaTitle:
      'Salone Gospel Hub — A Directory & Community Hub for Sierra Leonean Gospel | Digital Solution Builders',
    metaDescription:
      'A mobile-first, SEO-driven directory and community hub for the Sierra Leonean gospel ecosystem — artists, instrumentalists, choirs, churches, producers, gospel DJs and media, songs, and events. Next.js 16 + Supabase, with Row-Level-Security-enforced moderation. A personal build by Digital Solution Builders.',
    intro:
      'A mobile-first directory and community hub for the Sierra Leonean gospel ecosystem — one place where artists, choirs, churches, producers and the people looking for them can finally find each other. Built from the founder’s own frustration as a gospel musician, watching spirit-filled songs and videos scattered across YouTube, Boomplay, Audiomack, Facebook and WhatsApp never reach the audience they could.',
    stats: [
      { label: 'Stage', value: 'In Development' },
      { label: 'Phase', value: 'Foundation' },
      { label: 'Audience', value: 'SL + Diaspora' },
    ],
    services: ['Full-stack Development', 'Database & RLS Design', 'Mobile-first UX'],
    sections: [
      {
        heading: 'The brief',
        body: 'Sierra Leonean gospel — its artists, instrumentalists, choirs, churches, producers, gospel DJs, songs and events — does not have a single home. The work is scattered across YouTube channels, Boomplay, Audiomack, SoundCloud, Facebook pages and WhatsApp groups, so even spirit-filled records do not reach the audience they could. The brief was a single mobile-first hub that brings the whole ecosystem onto one platform — discoverable from Sierra Leone and the diaspora, indexable by search engines, and safe enough to share.',
      },
      {
        heading: 'What we built',
        body: 'A directory and community hub spanning profiles for artists, choirs, churches and ministries, producers and gospel media, a songs feed, and a national and diaspora events surface. The trust layer is the core of the build: a Postgres schema with Row-Level Security policies, ownership triggers, a content-moderation engine (a `moderate_content` RPC, draft → pending → approved/rejected lifecycle) and a roles model that lets owners manage their own drafts but never self-approve. Public pages are server-rendered for SEO; auth (login, signup, callback) and guarded `/dashboard` and `/admin` surfaces are wired in.',
      },
      {
        heading: 'The stack',
        body: 'Next.js 16 (App Router, TypeScript) with Tailwind v4 on the frontend — public pages server-rendered for search visibility. Supabase (Postgres, Auth, Storage) on the backend, with security enforced inside the database as Row-Level Security policies rather than in app-side query filters, so a future React Native app can safely share the same backend. CI on GitHub Actions runs a Vitest unit suite and a pgTAP RLS suite against a local Supabase stack on every push.',
      },
      {
        heading: 'Where it is now',
        body: 'Phase 1 — the Foundation — is built and code-reviewed: schema, RLS, moderation engine and auth wiring with passing Vitest and pgTAP suites in CI. The platform has not yet been attached to a live cloud Supabase project; that is the next conscious build, alongside content seeding and the public mobile-first surfaces.',
      },
    ],
  },

  'vocal-drift-inspire': {
    slug: 'vocal-drift-inspire',
    title: 'Vocal Drift Inspire Platform',
    category: 'Reality TV · Entertainment Platform',
    tagline: 'One stage. Every voice.',
    accent: '#e0a82f',
    heroImage: '/projects/vocal-drift-inspire.png',
    heroImageAlt:
      'Vocal Drift Inspire homepage hero — dark theme with the headline "The biggest stage for Sierra Leone’s vocalists", Season 6 registration banner, and primary calls to action to enter the competition or vote',
    liveUrl: 'https://vdinspire.com',
    liveLabel: 'vdinspire.com',
    metaTitle:
      'Vocal Drift Inspire — Reality-TV Singing Competition Platform | Digital Solution Builders',
    metaDescription:
      'A single-platform website for Sierra Leone’s longest-running reality-TV singing competition — public site, contestant accounts, registration and voting flows wired for mobile money, and an admin CMS. Built as a personal contribution by Digital Solution Builders.',
    intro:
      'A single platform for one of Sierra Leone’s longest-running reality-TV singing competitions — bringing fans, contestants, sponsors and well-wishers into one source of truth. Built as a personal contribution to a show that had outgrown its scattered tools.',
    stats: [
      { label: 'Stage', value: 'Live' },
      { label: 'Season', value: 'S6 · 2026' },
      { label: 'Surfaces', value: 'Site + CMS' },
    ],
    services: ['Full-stack Development', 'Payments Integration', 'Admin CMS'],
    sections: [
      {
        heading: 'The brief',
        body: 'Six seasons in, the show was running on a patchwork — Facebook for fans, WhatsApp for voting, paper for registration, scattered posts for news — with no single home for any of it. The brief was one platform where fans, contestants, well-wishers and sponsors could meet, register, vote, and follow the season.',
      },
      {
        heading: 'What we built',
        body: 'A full website and back-office: a bilingual public site (English and Krio) covering seasons, contestants, news and sponsors; authenticated accounts for contestants and voters; paid contestant registration and paid voting flows wired through Monime mobile money; and an admin CMS so producers can update content, seasons, contestants and news without a developer.',
      },
      {
        heading: 'The stack',
        body: 'Vite + React + TypeScript + Tailwind on the frontend, Supabase (Postgres, Auth, Storage, Edge Functions) on the backend, Monime wired in for mobile-money voting and registration, deployed on Vercel. Payments currently run on a mock provider while Monime live onboarding completes, so the full flows can be walked end to end.',
      },
      {
        heading: 'Where it is now',
        body: 'Live at vdinspire.com for Season 6 (2026) — a personal build to give the show a single platform for its growing national audience. The next conscious build is flipping payments from the mock provider to live Monime, so contestants can pay to register and fans can pay to vote with real mobile money.',
      },
    ],
  },
};
