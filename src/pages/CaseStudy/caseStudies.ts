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
    accent: '#0d655e',
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
        body: 'Running locally with all six phases — data, AI, interop, real-time vitals, mobile, and security — built behind a code-review → QA → AI-governance gate at each phase, with 145+ backend tests in CI. As a T1 clinical product, the path to a hosted release is gated on a documented pre-live obligations checklist (executed DPIA, model-provider data-processing agreement, and a clinical-safety case sign-off). Those gates are open and being closed before the platform is deployed to a public host.',
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
      'Salone Gospel Hub — mobile-first directory and community hub for the Sierra Leonean gospel ecosystem, with profiles for artists, choirs, churches and producers, a song discovery feed, an events surface, a community updates feed from church and choir owners, and a Support this ministry tipping flow',
    liveUrl: 'https://salonegospelhub.com',
    liveLabel: 'salonegospelhub.com',
    metaTitle:
      'Salone Gospel Hub — A Directory & Community Hub for Sierra Leonean Gospel | Digital Solution Builders',
    metaDescription:
      'A mobile-first, SEO-driven directory and community hub for the Sierra Leonean gospel ecosystem — artist, choir, church, producer and gospel-media profiles, a songs feed, an events surface, church and choir community updates, and a Support this ministry tipping flow. Next.js 16 + Supabase, with Row-Level-Security-enforced moderation. A personal build by Digital Solution Builders.',
    intro:
      'A mobile-first directory and community hub for the Sierra Leonean gospel ecosystem — one place where artists, choirs, churches, producers and the people looking for them can finally find each other. Built from the founder’s own frustration as a gospel musician, watching spirit-filled songs and videos scattered across YouTube, Boomplay, Audiomack, Facebook and WhatsApp never reach the audience they could.',
    stats: [
      { label: 'Stage', value: 'Live' },
      { label: 'Audience', value: 'SL + Diaspora' },
      { label: 'Surfaces', value: 'Directory · Community · Support' },
    ],
    services: ['Full-stack Development', 'Database & RLS Design', 'Mobile-first UX'],
    sections: [
      {
        heading: 'The brief',
        body: 'Sierra Leonean gospel — its artists, instrumentalists, choirs, churches, producers, gospel DJs, songs and events — does not have a single home. The work is scattered across YouTube channels, Boomplay, Audiomack, SoundCloud, Facebook pages and WhatsApp groups, so even spirit-filled records do not reach the audience they could. The brief was a single mobile-first hub that brings the whole ecosystem onto one platform — discoverable from Sierra Leone and the diaspora, indexable by search engines, and safe enough to share.',
      },
      {
        heading: 'What we built',
        body: 'A directory and community hub spanning profiles for artists, choirs, churches and ministries, producers and gospel media, a songs feed and a national + diaspora events surface. Church and choir profile owners can post announcements to a Community Updates feed that any visitor to the profile can read, with admin moderation on anything that gets reported. A "Support this ministry" flow lets supporters send a voluntary, non-refundable tip to a profile, with a tips-received / tips-sent dashboard for owners and a background job that expires stale support intents. The trust layer runs inside the database — Postgres Row-Level Security policies, ownership triggers, a `moderate_content` RPC and a draft → pending → approved/rejected lifecycle so owners can manage their own drafts but never self-approve. Public pages are server-rendered for SEO; auth (login, signup, callback) and guarded `/dashboard` and `/admin` surfaces are wired in.',
      },
      {
        heading: 'The stack',
        body: 'Next.js 16 (App Router, TypeScript) with Tailwind v4 on the frontend — public pages server-rendered for search visibility. Supabase (Postgres, Auth, Storage) on the backend, with security enforced inside the database as Row-Level Security policies rather than in app-side query filters, so a future React Native app can safely share the same backend. CI on GitHub Actions runs a Vitest unit suite and a pgTAP RLS + RPC suite against a local Supabase stack on every push; the tips and community-updates RPCs each ship with pgTAP coverage for their SQLSTATE error codes.',
      },
      {
        heading: 'Where it is now',
        body: 'Live and open for artists, choirs, churches, producers and gospel media to claim profiles, with the Foundation — schema, Row-Level Security, moderation engine and auth — running behind a Vitest + pgTAP CI suite. The most recent releases added a church and choir community-updates feed with admin moderation, a "Support this ministry" tipping flow (mock-first, voluntary and non-refundable) with a tips-received / tips-sent dashboard for owners, a design-audit sweep that re-skinned tile gradients to the Sierra Leone flag palette and cleaned up the dashboard, profile and admin surfaces, and a step-by-step platform user guide. Next builds extend the songs and events surfaces and grow the contributor base across Sierra Leone and the diaspora.',
      },
    ],
  },

  'prime-care': {
    slug: 'prime-care',
    title: 'Prime Care Medical Services',
    category: 'Healthcare · Clinic Website + Booking',
    tagline: 'Three specialists. One shared record.',
    accent: '#087E8B',
    heroImage: '/projects/prime-care.png',
    heroImageAlt:
      'Prime Care Medical Services homepage — deep teal hero with the headline "Three specialists. One shared record.", a coral "Request a consult" CTA and a phone-call CTA, alongside the Freetown clinic address, opening hours and USSD booking short-code',
    liveUrl: 'https://primecaresl.com',
    liveLabel: 'primecaresl.com',
    metaTitle:
      'Prime Care Medical Services — Clinic Website + Online Booking | Digital Solution Builders',
    metaDescription:
      'A client build for a Freetown specialist clinic — a Next.js 16 public website and a self-hosted Express "bridge" that submits booking requests directly into the clinic\'s electronic medical record. Live at primecaresl.com with end-to-end online booking.',
    intro:
      'A public website and end-to-end patient-booking workflow for a Freetown specialist clinic — built as a single product spanning a Next.js public site, a self-hosted bridge service, and an integration into the clinic’s electronic medical record so every web request lands directly in reception’s booking queue.',
    stats: [
      { label: 'Stage', value: 'Live' },
      { label: 'Specialties', value: '3' },
      { label: 'Surfaces', value: 'Site + Bridge' },
    ],
    services: ['Full-stack Web + Backend', 'Booking Integration', 'Production Operations'],
    sections: [
      {
        heading: 'The brief',
        body: 'A new specialist clinic opening in central Freetown — cardiology, mental health and general physician care — needed a public home on the web. Patients needed to find the clinic, read about each specialty, see who the clinicians are, and request a consult without calling. Reception needed every web request to land directly in their booking queue, not in a separate inbox to copy out by hand. And the booking flow had to be honest: the clinic is request-based — reception triages every request and confirms by SMS — so the site should never pretend to "hold" or "lose" slots that do not exist.',
      },
      {
        heading: 'What we built',
        body: 'A complete public site (Services / Our Doctors / Locations / About / Request a consult / My record), an honest request-based booking flow that pulls real availability from the clinic’s configured calendar, a self-service "My record" lookup for returning patients, and a USSD short-code option for patients without smartphones. Behind the site, a self-hosted "bridge" service receives each booking request and writes it directly into the clinic’s electronic medical record queue — with offline-queue retries and a pending → synced → errored state machine, so a brief network blip never drops a request. Reception confirms by SMS and the patient gets a tracking reference. Full SEO baseline: JSON-LD MedicalClinic + Physician schema, sitemap, robots, Open Graph and per-page metadata.',
      },
      {
        heading: 'The stack',
        body: 'Next.js 16 (App Router) + React 19 with pure-CSS design tokens (no Tailwind) on the frontend, deployed on Vercel. The bridge is a Node + Express service running as a systemd unit on a managed Linux droplet, fronted by nginx with a Let’s Encrypt certificate, and authenticated to the EMR over a scoped service-account JWT. A clear public availability endpoint exposes the clinic’s open weekdays, hours and blackout dates without leaking any patient data. 231 tests in CI; each release passed code-review, QA and a compliance gate before going out.',
      },
      {
        heading: 'Where it is now',
        body: 'Live in production at primecaresl.com since 2026-06-13, with the booking bridge live at bridge.primecaresl.com (HTTPS, auto-renewing certificate, systemd-managed). Online booking works end to end — request → bridge → clinic queue → reception confirms by SMS. The site also degrades cleanly: if the bridge is ever unreachable, the booking and patient-lookup paths fall back to a clear "call the clinic" message with the phone number, so patients are never left at a dead end. The production SMS sender ID is the final remaining step (in submission with the operators).',
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

  // Entries below are written without em dashes, so they carry over unchanged
  // when the site-wide no-em-dash brand rule lands. Enforced by the em-dash
  // tripwire in tests/case-studies.smoke.mjs.

  'nexa-fleet': {
    slug: 'nexa-fleet',
    title: 'Nexa-Fleet Waka',
    category: 'Health Logistics · Fleet Telematics',
    tagline: 'Cold chain, tracked to the door.',
    accent: '#2f9fb0',
    heroImage: '/projects/nexa-fleet.png',
    heroImageAlt:
      'Nexa-Fleet Waka sign-in screen: the product name set in a serif over a deep navy field, above a white panel with username and password fields and a teal sign-in button, under the line "Fleet telematics for Sierra Leone health logistics". The console itself sits behind the login and is not public.',
    liveUrl: 'https://fleet.dsbdigital.biz',
    liveLabel: 'fleet.dsbdigital.biz',
    metaTitle:
      'Nexa-Fleet Waka: Fleet Telematics and Cold-chain Dispatch | Digital Solution Builders',
    metaDescription:
      'A fleet telematics, dispatch and cold-chain platform for health logistics in Sierra Leone. GPS ingestion straight off Teltonika devices, PostGIS geofencing, WHO-PQS excursion monitoring, driver-safety scoring and proof-of-delivery capture, with an offline-first driver PWA. A full-stack build by Digital Solution Builders.',
    intro:
      'A fleet telematics and dispatch platform for health logistics, built end to end from the device protocol upward: raw GPS in at one end, a signed proof of delivery out at the other.',
    stats: [
      { label: 'Stage', value: 'UAT' },
      { label: 'Tests', value: '1,363' },
      { label: 'Surfaces', value: 'Console + PWA' },
    ],
    services: ['Fleet Telematics Platform', 'Cold-chain Monitoring', 'Offline-first PWA'],
    sections: [
      {
        heading: 'The brief',
        body: 'Vaccines, medicines and patients move around Sierra Leone in cold-chain trucks, ambulances and delivery bikes, and the people responsible for them were working blind. Where is the vehicle. Did the fridge stay in range for the whole trip, or did it drift at the second stop. Did the delivery actually arrive, and who signed for it. The answers lived on paper waybills that reached the office days later, if at all. The brief was one system that could answer all three questions while the vehicle was still moving, on the phones drivers already carry and over the patchy rural coverage they already have.',
      },
      {
        heading: 'What we built',
        body: 'A telemetry spine that takes GPS straight off Teltonika devices over TCP, MQTT and HTTP, de-duplicates it and quarantines clock-skewed points before they reach the map. On top of that: a live vehicle map with clustering and follow, breadcrumb trip replay you can scrub at up to sixteen times speed, PostGIS geofences you draw by clicking, and a when-then rules engine that raises alarms and sends SMS in English and Krio. Then the logistics half: WHO-PQS cold-chain profiles with a consignment-level excursion engine, driver-safety scoring over harsh braking, speeding and idling, a dispatch board with a job state machine, and proof-of-delivery capture with an on-screen signature and photos. Drivers get their own mode with an offline outbox.',
      },
      {
        heading: 'The stack',
        body: 'FastAPI with async SQLAlchemy 2.0 over PostgreSQL 16, extended with TimescaleDB for the telemetry series and PostGIS for the geofence maths, across 20 Alembic migrations. The console and driver client are one React 18 and TypeScript PWA that adapts by role, mapping with MapLibre GL over Sierra Leone tiles we host ourselves, so nobody pays per map view, and queueing writes through Workbox so a dead spot never loses a delivery. Docker Compose behind nginx with an auto-renewing certificate. 969 backend and 394 frontend tests, and the review loop earned its keep: it caught a login failure that killed the idle-lock overlay, a permanently exposed device install token, and a cache purge that would have destroyed queued GPS points on logout.',
      },
      {
        heading: 'Where it is now',
        body: 'Deployed and running at fleet.dsbdigital.biz since 15 July 2026, in a deliberately UAT-safe posture, not full production. Outbound SMS is switched off at the key, so the alerting paths run end to end without a single real message reaching a driver, and the Synapse, DHIS2 and LMIS integrations are built but dormant until their endpoints are configured. That is not an oversight. A data-protection sign-off covering driver location, shared-phone handling and proof-of-delivery retention gates the move to real messages and real vehicle data, and it is still open. The code is deployed and waiting on that decision, not on more code.',
      },
    ],
  },

  'freetown-city-os': {
    slug: 'freetown-city-os',
    title: 'Freetown City OS',
    category: 'Smart City · Programme Dashboard (demo)',
    tagline: 'A ten-year plan you can actually open.',
    accent: '#1fb85c',
    heroImage: '/projects/freetown-city-os.png',
    heroImageAlt:
      'Freetown City OS programme overview: a total programme figure of USD 825M split across three phases, four investment pillar cards with committed and spent draw-down bars, and headline indicator tiles for piped water, fibre coverage and peak traffic speed, each carrying a "Verified" badge. A banner across the top notes that energy, climate, map geometry and committed values are Phase 0 due-diligence items.',
    liveUrl: 'https://cityos.dsbdigital.biz',
    liveLabel: 'cityos.dsbdigital.biz',
    metaTitle:
      'Freetown City OS: Smart-city Programme and Investor Dashboard | Digital Solution Builders',
    metaDescription:
      'A planning and investor dashboard for a ten-year, USD 825M smart-city programme: phased budget, project register, KPI monitoring, geospatial map and infrastructure systems view, with every figure badged verified or flagged for due diligence. A full-stack build by Digital Solution Builders.',
    intro:
      'A planning and investor dashboard that turns a ten-year smart-city plan from a PDF nobody opens into something a funder can actually interrogate, pillar by pillar and indicator by indicator.',
    stats: [
      { label: 'Stage', value: 'Demo' },
      { label: 'Programme', value: 'USD 825M' },
      { label: 'Horizon', value: '10 years' },
    ],
    services: ['Full-stack Dashboard', 'Geospatial UI', 'Data Modelling'],
    sections: [
      {
        heading: 'The brief',
        body: 'A ten-year plan for Freetown existed as a long document with a big number at the front. That is the format every infrastructure plan dies in: nobody reads to page forty, the phasing is invisible, and a funder who wants to know what USD 825M actually buys has to take it on trust. The other problem was sharper. Plans like this get their credibility destroyed by one unsourced figure, because a reader who catches a single invented number stops believing the verified ones too. So the product had to do two jobs at once: make the programme navigable, and make the difference between a confirmed figure and a working assumption impossible to miss.',
      },
      {
        heading: 'What we built',
        body: 'Six slices, each one a working view, not a mockup. A programme overview that reconciles USD 825M across three phases and four investment pillars, with committed and spent draw-down. A project register with full create, read, update and delete. KPI monitoring that tracks each indicator from its baseline to its target. A Leaflet map of the network. A read-only infrastructure section covering four systems and their thirty components, with a dependency-free schematic drawn in SVG. And roles throughout: viewer, officer and admin, and the denials hold in the API, not just in the interface. The honesty discipline runs through all of it as a badge on every figure, indicator and map layer.',
      },
      {
        heading: 'The stack',
        body: 'The backend is FastAPI with async SQLAlchemy 2.0 and Alembic, on SQLite in development and Postgres in production, with 77 tests across 6 migrations. React 19, TypeScript, Tailwind and React Query on the frontend, Leaflet for the map and Recharts for the trend views, plus a hand-drawn SVG schematic instead of another diagramming dependency. Authentication is JWT over bcrypt with three roles. The single-page app is on Vercel and the API sits behind nginx on a managed droplet, wired so the browser only ever talks to one origin. There is no AI anywhere in it, and no personal data beyond a username and a password hash.',
      },
      {
        heading: 'Where it is now',
        body: 'Running at cityos.dsbdigital.biz since 18 June 2026, front end and API both. This is a demonstration and planning tool, not an operational city system: nothing in it is wired to a live municipal feed, and it has no official standing. The baseline figures come from primary sources and are badged as verified. The energy and climate values, the map geometry, and the committed and spent draw-down are seeded illustrations, badged as Phase 0 due-diligence items, and the interface says so on every screen, not in a footnote. All thirty infrastructure components are illustrative.',
      },
    ],
  },

  'nexa-sabi': {
    slug: 'nexa-sabi',
    title: 'Nexa-Learn Sabi',
    category: 'Education · Adaptive Learning Platform',
    tagline: 'Learn offline. Prove it anywhere.',
    accent: '#e8952a',
    heroImage: '/projects/nexa-sabi.png',
    heroImageAlt:
      'Sabi sign-in screen: a white card centred on a deep navy field, the wordmark "Sabi." set in a serif with an orange full stop, the line "Learn, online or offline." beneath it, and username and password fields above an orange sign-in button. The learner app sits behind the login and is not public.',
    liveUrl: 'https://sabi.dsbdigital.biz',
    liveLabel: 'sabi.dsbdigital.biz',
    metaTitle:
      'Nexa-Learn Sabi: Adaptive Learning and Verifiable Credentials | Digital Solution Builders',
    metaDescription:
      'An offline-first adaptive learning platform built on an append-only event log, with item-response-theory placement, a mastery engine, and W3C Verifiable Credentials signed with did:web so a learner can prove what they finished. A full-stack build by Digital Solution Builders.',
    intro:
      'An adaptive learning platform for places where the connection drops and the certificate has to mean something: it scores on the server, records every attempt in an append-only log, and issues a credential a third party can verify without asking us.',
    stats: [
      { label: 'Stage', value: 'Staging' },
      { label: 'Coverage', value: '97.69%' },
      { label: 'Credentials', value: 'W3C VC 2.0' },
    ],
    services: ['Adaptive Learning Engine', 'Verifiable Credentials', 'Offline-first PWA'],
    sections: [
      {
        heading: 'The brief',
        body: 'Two problems that most learning platforms quietly ignore. The first is the connection: a learner on a rural phone loses signal mid-lesson, and if the platform scores in the browser and syncs later, their progress is a guess and their score is editable. The second is what the certificate is worth. A PDF with a logo proves nothing to an employer who has never heard of the issuer, and a database row proves nothing at all once the platform is gone. We wanted a learner to work through a lesson offline, have the record be authoritative instead of reconstructed, and walk away with something a third party could verify without contacting us.',
      },
      {
        heading: 'What we built',
        body: 'A learning core where published content is frozen, every interaction lands in an append-only event log, and attempts are scored on the server, never in the client. Progress is a materialised view over those events, so it can be rebuilt from scratch and reconciled by a command-line tool. On top of that, adaptive placement using item-response theory, which picks the question carrying the most information about a learner instead of working down a fixed list, and a mastery engine a facilitator can override. Item difficulty is re-fitted from real responses through a calibration pass, but nothing applies automatically: a human accepts or rejects each change, with drift flagged. Completion issues a W3C Verifiable Credential and an Open Badge, signed with did:web, revocable through a bitstring status list. The learner client is a PWA with an offline content cache and a write-ahead event queue. Continuing professional development is embedded straight into the clinical record system.',
      },
      {
        heading: 'The stack',
        body: 'Backend is FastAPI, SQLAlchemy and Alembic on PostgreSQL: 567 tests at 97.69% coverage across 12 migrations. Credentials use W3C VC 2.0 and Open Badge 3.0 over Ed25519, with did:web identifiers and a bitstring status list for revocation. The learner client is Vite and React with a Workbox precache, an IndexedDB content store and a write-ahead queue that survives a hard reload. Deployment runs on Docker Compose to a dedicated staging droplet through a pipeline that migrates, health-checks and rolls back on failure. Credential hashes anchor into a tamper-evident Merkle log on a fifteen-minute cron, so an issued credential can be checked against an independently published root.',
      },
      {
        heading: 'Where it is now',
        body: 'Sabi has sat on staging at sabi.dsbdigital.biz since 6 July 2026. Staging, not production, and the difference matters: it has never carried a real cohort. The Socratic tutor is the sharper caveat. It is built, it went through six hardening passes covering consent, output safety, transcript erasure and facilitator escalation, and it has never once been switched on. There is no API key configured in any environment and the endpoints return a 503. It stays off until a data-protection review clears cross-border processing. The safety screen is also still a rule-based first version, not a classifier, and we would sooner leave the tutor off than ship it as good enough. Erasure has the same shape of caveat: it works by supersession, so the record is redacted but the bytes survive, and calling that deletion would be a stretch.',
      },
    ],
  },

  'nexa-scribe': {
    slug: 'nexa-scribe',
    title: 'Nexa-Scribe',
    category: 'Healthcare · Clinical Knowledge API',
    tagline: 'The national formulary, as an endpoint.',
    accent: '#b5677f',
    heroImage: '/projects/nexa-scribe.png',
    heroImageAlt:
      'The public Nexa-Scribe API documentation: an OpenAPI 3.1 page headed "Nexa-Scribe 0.1.0" with the note "Reference data only, this service holds no PHI", listing endpoint groups for meta, terminology, coding, drugs and interactions, most of them marked with a padlock for API-key authentication.',
    liveUrl: 'https://scribe.dsbdigital.biz/docs',
    liveLabel: 'scribe.dsbdigital.biz/docs',
    metaTitle:
      'Nexa-Scribe: Clinical Knowledge API for Drugs, Interactions and Coding | Digital Solution Builders',
    metaDescription:
      'A clinical knowledge service built from Sierra Leone Ministry of Health source documents: drug and terminology lookup, interaction checking, dose recommendations and clinical coding, behind an API-key authenticated OpenAPI surface. A backend build by Digital Solution Builders.',
    intro:
      'A clinical knowledge service that answers the four questions an electronic medical record has to ask mid-consultation, built from the national formulary rather than from whichever drug dataset happened to be open.',
    stats: [
      { label: 'Stage', value: 'Production' },
      { label: 'Sources', value: 'SL MoHS' },
      { label: 'Dose statements', value: '1,014' },
    ],
    services: ['Clinical Data Engineering', 'API Design', 'Document Extraction'],
    sections: [
      {
        heading: 'The brief',
        body: 'An electronic medical record has to answer four questions in the middle of a consultation. What is this drug. What does it interact with. What dose for a patient this age and this weight. What code does this diagnosis file under. The commercial clinical databases that answer them well are priced for hospital systems in wealthy countries, and the open datasets that are free are built around formularies nobody in Freetown dispenses from. A drug interaction warning is worthless if the drug is not stocked, and a paediatric dose is worse than worthless if it came from a different national guideline. The answers had to come from the documents Sierra Leone clinicians actually work to.',
      },
      {
        heading: 'What we built',
        body: 'A knowledge database assembled from Ministry of Health source documents, starting with the Essential Medicines List and the Standard Treatment Guidelines. That meant real extraction work, not an import: 602 rows of medicines list resolved across a nested category structure with collision-safe keys, and 1,014 dose and frequency statements pulled out of 20,474 paragraphs and 157 tables of treatment guidelines. Doses go through a dual-review gate before anything is readable. A deterministic parser and a language-model pass each produce a structured reading, the two are adjudicated across seven fields, and only rows where they agree are served. Disagreements sit pending for a human. On top of the data: a code-system registry that tracks each source licence, and endpoints for terminology search, concept mapping, drug lookup, interaction checking and code suggestion.',
      },
      {
        heading: 'The stack',
        body: 'FastAPI on PostgreSQL 16 with Alembic, 647 tests across 3 migrations, behind API-key authentication. Containers run non-root and migrate on start, fronted by nginx with an auto-renewing certificate. The language-model extraction is a build-time step, not a request-time one, which matters: a clinician gets a deterministic lookup against reviewed rows, not a generated answer. Interactions are the deliberate exception to the read-time filter and always surface, because an unreviewed interaction warning is a nuisance while a suppressed one is a hazard. A parity checkpoint proved all 47 interaction pairs from the previous in-record checker return identical severities before anything was cut over.',
      },
      {
        heading: 'Where it is now',
        body: 'The service went into production on 18 July 2026 with its reference data loaded: 12 code systems, the full 602-row medicines list, and the curated diagnostic codes. Two caveats. Only the knowledge database exists: dictation, note generation and the record adapters were specified alongside it and never got built, so this is one component of a larger idea, not the finished thing. And it is deliberately non-commercial, because the source material is licensed for non-commercial use and the record system it serves is donated. We chose that constraint, and it is the only reason the service can exist at all.',
      },
    ],
  },

  'nexa-kopo': {
    slug: 'nexa-kopo',
    title: 'Nexa-Kopo',
    category: 'Fintech · Ledger and Payments Service',
    tagline: 'Five service surfaces. No screen.',
    accent: '#3f8f7a',
    heroImage: '/projects/nexa-kopo.png',
    heroImageAlt:
      'A designed illustration, not a screenshot, in the site\'s own dark palette: the Nexa-Kopo name above five numbered panels for Ledger, KYC, Payments, USSD and Webhooks, the single public response "GET /healthz to 200 status ok", counters for 457 tests, 93.77% coverage, 9 migrations and 8 database triggers, and a footnote stating that the service has no interface to capture and that settlement still runs on a simulator.',
    liveUrl: 'https://dsbdigital.biz/#contact',
    liveLabel: 'API and USSD service, no public web UI',
    metaTitle:
      'Nexa-Kopo: Double-entry Ledger, USSD and Payments API | Digital Solution Builders',
    metaDescription:
      'A finance service with no user interface: an append-only double-entry ledger, a KYC tier registry, payments orchestration over a Postgres outbox, a USSD gateway for feature phones, and signed webhooks that let sibling platforms move money. A backend build by Digital Solution Builders.',
    intro:
      'A finance service other products call rather than one anyone logs into: a double-entry ledger, KYC tiers, payments orchestration, a USSD gateway and signed webhooks, with no screen anywhere in it.',
    stats: [
      { label: 'Stage', value: 'Live API' },
      { label: 'Coverage', value: '93.77%' },
      { label: 'Surfaces', value: 'API + USSD' },
    ],
    services: ['Double-entry Ledger', 'Payments Orchestration', 'USSD Gateway'],
    sections: [
      {
        heading: 'The brief',
        body: 'Several products in the same family had reached the point of needing to move money: pay a driver, take a fee, hold a deposit. The obvious path is for each one to grow its own wallet table, and it is the wrong one. You end up with four half-ledgers, four interpretations of what a balance means, four sets of identity checks and no single place where the books balance. The brief was to build the money layer once, properly, as a service the others call. Which means it has no interface, and it has to be right in a way a screen would let you get away with not being.',
      },
      {
        heading: 'What we built',
        body: 'An append-only double-entry ledger where a repeated request cannot double-post and a correction is an explicit reversal, never an edit, with eight database triggers enforcing the invariants below the application so a future bug in Python cannot unbalance the books. Around it: an identity and tier registry where Tier 0 is automatic and higher tiers need a reviewer decision, and payments orchestration built on escrow holds, a payment-intent state machine and a Postgres outbox worker with an orphaned-job reaper. The USSD gateway covers register, set a PIN, check a balance, send money, cash in and out, and a mini-statement, all of it from a feature phone. Sibling products reach it through a consumer API with HMAC-signed webhooks, links owned by construction, and an append-only log of every sensitive read.',
      },
      {
        heading: 'The stack',
        body: 'FastAPI with async SQLAlchemy and Alembic on PostgreSQL across 9 migrations, Celery and Redis for the worker layer, Fernet for encryption at rest on the sensitive columns, and least-privilege database roles so the application cannot alter its own audit trail. 457 tests at 93.77% coverage against an 85% gate. Docker Compose behind nginx with a modern-cipher-only certificate, deployed automatically from the main branch. Guard rails that only matter when something goes wrong: outbound requests are checked against server-side request forgery, and a payout that cannot be resolved is parked for a human instead of voided, because a stuck payment is recoverable and a wrongly voided one is not.',
      },
      {
        heading: 'Where it is now',
        body: 'Live at kopo.dsbdigital.biz since 13 July 2026, with the first sibling product onboarded as a consumer three days later. There is no web interface, the interactive API documentation is switched off in production, and a health check is the only thing a browser can reach, which is why the image above is a diagram rather than a screenshot. No real money has moved through it. Settlement still runs on a deterministic simulator, and the mobile-money rail is deployed dormant, waiting on a processing agreement and a controlled live micro-payout before it is switched on. The ledger is real, the money is not yet.',
      },
    ],
  },
};
