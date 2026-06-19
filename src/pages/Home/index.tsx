import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { motion as _motion, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Mail, ArrowDown, MessageCircle, Share2 } from 'lucide-react';
import ShareModal from '../../components/ShareModal';
import ContactForm from '../../components/ContactForm';
import Seo from '../../components/Seo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motion = _motion as any;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  services: string[];
  url: string;
  image: string;
  imageAlt: string;
  accent: string;
  stats: { label: string; value: string }[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const projects: Project[] = [
  {
    id: 1,
    slug: 'nexa-welbodi',
    title: 'Nexa-Health Welbodi EMR',
    category: 'Healthcare · Electronic Medical Records',
    tagline: 'Lifelong health records. Starting today.',
    description:
      'An offline-first electronic medical records platform for Sierra Leonean hospitals, clinics, and peripheral health units. FHIR R4–aligned, OpenMRS-inspired, with role-based clinical workflows across OPD queues, pharmacy, MCH/ANC, HIV, TB, and laboratory. FastAPI + async SQLAlchemy on the backend; React 18 + Vite + Workbox PWA on the frontend; deployed via Docker on a managed droplet.',
    services: ['Full-stack EMR', 'Offline-first PWA', 'Clinical UX'],
    url: 'https://welbodi.dsbdigital.biz',
    image: '/projects/nexa-welbodi.png',
    imageAlt: 'Nexa-Health Welbodi EMR dashboard — clinical workspace with patients-today, OPD queue, bed-occupancy and critical-alert tiles, quick actions, live priority-breakdown queue, and recent-activity feed',
    accent: '#3a8fb5',
    stats: [
      { label: 'Stage', value: 'UAT' },
      { label: 'Pilot', value: 'Connaught Hospital' },
      { label: 'Standard', value: 'FHIR R4' },
    ],
  },
  {
    id: 2,
    slug: 'nexa-logistix',
    title: 'Nexa-Logistix LMIS',
    category: 'Health Logistics · Web Application',
    tagline: 'A pharmaceutical supply-chain operating system.',
    description:
      'A full-stack logistics management information system for pharmaceutical supply chains — built end-to-end across inventory, stock counts, cold-chain monitoring, requisitions, purchase orders, distribution, dispensing, point-of-sale, AI demand forecasting, and serialised track-and-trace. FastAPI + PostgreSQL on the backend, React + TypeScript on the frontend, multilingual (English / Krio / French), with an open public demo.',
    services: ['Full-stack Development', 'Database & API Design', 'Multilingual UX'],
    url: 'https://lmis.dsbdigital.biz',
    image: '/projects/nexa-lmis.png',
    imageAlt: 'Nexa-Logistix LMIS dashboard — supply-chain overview with stock-at-risk table, alert severity counters, and full sidebar navigation across inventory, supply chain, patients & pharmacy, alerts, and administration modules',
    accent: '#0e7a8a',
    stats: [
      { label: 'Stage', value: 'Production' },
      { label: 'Languages', value: 'EN · KRI · FR' },
      { label: 'Demo', value: 'Open' },
    ],
  },
  {
    id: 3,
    slug: 'rms-death-tracker',
    title: 'RMS Death Tracker',
    category: 'Public Health · Surveillance Platform',
    tagline: 'One death, counted once. Excess mortality, in real time.',
    description:
      'A Rapid Mortality Surveillance platform for Sierra Leone — a single-source death register that de-duplicates records so a death captured in two systems is counted only once, then feeds a code-exact reimplementation of the Vital Strategies Excess Mortality Calculator (historical-average and negative-binomial GLM models). Carries the full national facility registry, role-based access, and offline-first PWA dashboards with observed-versus-95%-CI bands and chart export. FastAPI + async SQLAlchemy + PostgreSQL on the backend; React 18 + Vite + React Query PWA on the frontend.',
    services: ['Full-stack Development', 'Epidemiological Modelling', 'Offline-first PWA'],
    url: 'https://rms.dsbdigital.biz',
    image: '/projects/nexa-rms.png',
    imageAlt: 'RMS Death Tracker — excess-mortality dashboard showing total excess over baseline and over threshold, with observed-versus-95% confidence-interval charts broken down by sex and age group',
    accent: '#c0443a',
    stats: [
      { label: 'Stage', value: 'Production' },
      { label: 'Method', value: 'Excess Mortality' },
      { label: 'Surfaces', value: 'Offline PWA' },
    ],
  },
  {
    id: 4,
    slug: 'nexa-synapse',
    title: 'Nexa-Analytics Synapse',
    category: 'Analytics · Intelligence Layer',
    tagline: 'The intelligence layer connecting every product.',
    description:
      'The cross-product analytics and AI layer that ingests data from the LMIS, Welbodi EMR, and other verticals, then surfaces forecasts, anomalies, and operational insights through dashboards and API endpoints. Admin-provisioned access via the backend CLI; in active development.',
    services: ['Data Pipeline Design', 'Dashboard UI', 'AI / Forecasting'],
    url: 'https://synapse.dsbdigital.biz',
    image: '/projects/nexa-synapse.png',
    imageAlt: 'Nexa-Analytics Synapse login screen — clean branded sign-in panel with email and password fields',
    accent: '#5b6cdf',
    stats: [
      { label: 'Stage', value: 'In Development' },
      { label: 'Role', value: 'Analytics Layer' },
      { label: 'Access', value: 'Admin-provisioned' },
    ],
  },
  {
    id: 12,
    slug: 'nexa-continuum',
    title: 'Nexa-Health Continuum',
    category: 'Healthcare · Longitudinal Patient Journey',
    tagline: 'One timeline. Every provider.',
    description:
      "A longitudinal patient-journey and clinical-decision-support platform that unifies a patient's records from many providers into one timeline. Trends labs on a single axis across providers, flags abnormal results, ingests scanned reports via a clinician-verified vision model, drafts an AI clinical assessment (clinician-signed-off), streams live vitals, and exchanges data via FHIR R4 and DHIS2. T1 clinical, six phases built behind a code-review → QA → AI-governance gate at each phase. FastAPI + async SQLAlchemy + PostgreSQL on the backend; React 18 + Vite + Tailwind + React Query PWA on the web; React Native + Expo for the clinician mobile client.",
    services: ['Full-stack Clinical Build', 'Vision + LLM Integration', 'FHIR / DHIS2 Interop'],
    url: 'https://dsbdigital.biz/#contact',
    image: '/projects/nexa-continuum.png',
    imageAlt:
      'Nexa-Health Continuum — longitudinal patient-journey dashboard with a unified timeline across providers, multi-provider lab trend chart with abnormal-result flagging, scanned-document viewer, and a clinician-signed AI clinical assessment panel',
    accent: '#0d655e',
    stats: [
      { label: 'Stage', value: 'In Development' },
      { label: 'Risk Tier', value: 'T1 Clinical' },
      { label: 'Surfaces', value: 'Web + Mobile' },
    ],
  },
  {
    id: 5,
    slug: 'vocal-drift-inspire',
    title: 'Vocal Drift Inspire Platform',
    category: 'Reality TV · Entertainment Platform',
    tagline: 'One stage. Every voice.',
    description:
      'A single platform for one of Sierra Leone’s longest-running reality-TV singing competitions — a bilingual public site (English and Krio), authenticated contestant and voter accounts, paid contestant registration and paid voting flows wired through Monime mobile money (Africell Afrimoney and Orange Money), and an admin CMS that lets producers update seasons, contestants and news without a developer. Payments currently run on a mock provider while live Monime onboarding completes — flipping that switch is the next conscious build. Vite + React + TypeScript on the frontend, Supabase (Postgres, Auth, Storage, Edge Functions) on the backend, deployed on Vercel.',
    services: ['Full-stack Development', 'Payments Integration', 'Admin CMS'],
    url: 'https://vdinspire.com',
    image: '/projects/vocal-drift-inspire.png',
    imageAlt:
      'Vocal Drift Inspire homepage hero — dark theme with the headline "The biggest stage for Sierra Leone’s vocalists", Season 6 registration banner, and primary calls to action to enter the competition or vote',
    accent: '#e0a82f',
    stats: [
      { label: 'Stage', value: 'Live' },
      { label: 'Season', value: 'S6 · 2026' },
      { label: 'Surfaces', value: 'Site + CMS' },
    ],
  },
  {
    id: 13,
    slug: 'salone-gospel-hub',
    title: 'Salone Gospel Hub',
    category: 'Faith & Music · Community Platform',
    tagline: 'The home of Sierra Leonean Gospel.',
    description:
      "A mobile-first, SEO-driven directory and community hub for the Sierra Leonean gospel ecosystem — artists, instrumentalists, choirs, churches and ministries, producers, gospel DJs and media, songs, and events — for Sierra Leone and the diaspora. Built from the founder's own frustration as a gospel musician watching spirit-filled songs and videos scattered across YouTube, Boomplay, Audiomack, Facebook and WhatsApp never reach the audience they could. Live, with a Postgres schema, Row-Level Security policies, ownership triggers, a content-moderation engine and auth wiring running in production behind a Vitest + pgTAP CI suite. Next.js 16 + Tailwind v4 on the frontend, Supabase (Postgres, Auth, Storage) on the backend, with security enforced in the database (RLS), not in app-side query filters.",
    services: ['Full-stack Development', 'Database & RLS Design', 'Mobile-first UX'],
    url: 'https://salonegospelhub.com',
    image: '/projects/salone-gospel-hub.png',
    imageAlt:
      'Salone Gospel Hub — mobile-first directory and community hub for the Sierra Leonean gospel ecosystem, with profiles for artists, choirs, churches and producers, plus a song discovery feed and events surface',
    accent: '#12A150',
    stats: [
      { label: 'Stage', value: 'Live' },
      { label: 'Audience', value: 'SL + Diaspora' },
      { label: 'Surfaces', value: 'Mobile-first PWA' },
    ],
  },
  {
    id: 14,
    slug: 'prime-care',
    title: 'Prime Care Medical Services',
    category: 'Healthcare · Clinic Website + Booking',
    tagline: 'Three specialists. One shared record.',
    description:
      "A public website and end-to-end patient-booking platform for a Freetown specialist clinic — cardiology, mental health and general physician care. Honest, request-based booking: reception triages every request and confirms by SMS. A Next.js 16 (App Router) + React 19 site on Vercel paired with a Node + Express bridge running as a systemd unit on a managed droplet (nginx + Let's Encrypt), which submits each request directly into the clinic's electronic medical record queue with offline-queue retries. JSON-LD MedicalClinic + Physician schema, sitemap, robots, OG. 231 tests in CI; code-review, QA and a compliance gate before each release.",
    services: ['Full-stack Web + Backend', 'Booking Integration', 'Production Operations'],
    url: 'https://primecaresl.com',
    image: '/projects/prime-care.png',
    imageAlt:
      'Prime Care Medical Services homepage — deep teal hero with the headline "Three specialists. One shared record.", a coral "Request a consult" CTA and a phone-call CTA, alongside the Freetown clinic address, opening hours and USSD booking short-code',
    accent: '#087E8B',
    stats: [
      { label: 'Stage', value: 'Live' },
      { label: 'Specialties', value: '3' },
      { label: 'Surfaces', value: 'Site + Bridge' },
    ],
  },
  {
    id: 6,
    slug: 'dsb-digital-portfolio',
    title: 'Digital Solution Builders Portfolio',
    category: 'Portfolio · Website Design',
    tagline: 'From Concept to MVP. In 72 Hours.',
    description:
      'The portfolio you\'re looking at — built with the same stack we ship to clients. A dark-mode, typographically-driven React site spanning a one-page showcase and deep case-study pages, with scroll-spy navigation, Framer Motion animations, per-route SEO meta and structured data, WhatsApp CTAs, a social share modal, and a hardened security-header layer at the edge.',
    services: ['Website Design', 'UX Strategy', 'SEO Optimisation'],
    url: 'https://dsbdigital.biz',
    image: 'https://cdn.wegic.ai/assets/onepage/uploads/2027378739789144065/image/2026/03/18/01KKYBPAJ6QWX1SCGB9YZ7HYPN.png?imageMogr2/format/webp',
    imageAlt: 'Digital Solution Builders Portfolio website — dark mode typographic single-page portfolio with Framer Motion animations and social share modal',
    accent: '#a78bfa',
    stats: [
      // home + 8 case-study pages; keep in sync with caseStudies.ts / sitemap.xml
      { label: 'Pages', value: '9' },
      // keep 'Projects' in sync with the total number of entries in the `projects` array above
      { label: 'Projects', value: '14' },
      { label: 'Delivery', value: '72hrs' },
    ],
  },
  {
    id: 7,
    slug: 'bangura-brothers',
    title: 'The Bangura Brothers',
    category: 'Youth Brand · Website Design',
    tagline: 'Create. Develop. Explore.',
    description:
      'A vibrant digital home for three real brothers on a mission to combine sports, creativity, and adventure for kids ages 7–15. The site introduces the brand, the brothers, the upcoming training app, and a path to register interest in adventure events.',
    services: ['Brand Identity', 'Website Design', 'Content Strategy'],
    url: 'https://bangura-brothers-site.lovable.app',
    image: 'https://cdn.wegic.ai/assets/onepage/uploads/2027378739789144065/image/2026/03/16/01KKVNXVNTZCHWANSXBKEY1XW2.png?imageMogr2/format/webp',
    imageAlt: 'The Bangura Brothers website design — youth brand homepage with sports, music and adventure sections for kids ages 7–15',
    accent: '#e8622a',
    stats: [
      { label: 'Audience', value: 'Ages 7–15' },
      { label: 'Site', value: 'Live' },
      { label: 'Surfaces', value: 'Web' },
    ],
  },
  {
    id: 8,
    slug: 'bangura-training-app',
    title: 'Bangura Brothers Training App',
    category: 'Youth Sports · App Design',
    tagline: "Let's Train!",
    description:
      'A gamified football training-app concept for young players. Daily drill prompts, progress streaks, and badge rewards designed to make practice habit-forming. Currently a design + interactive prototype.',
    services: ['App Design', 'Gamification UX', 'Mobile UI'],
    url: 'https://bangura-brothers-site.lovable.app',
    image: 'https://cdn.wegic.ai/assets/onepage/uploads/2027378739789144065/image/2026/03/16/01KKVNXVNTFKK6813CAKRZG7QZ.png?imageMogr2/format/webp',
    imageAlt: 'Bangura Brothers Training App UI — gamified football drill tracker for young players',
    accent: '#3ecf6e',
    stats: [
      { label: 'Stage', value: 'Prototype' },
      { label: 'Audience', value: 'Youth Football' },
      { label: 'Surfaces', value: 'Mobile' },
    ],
  },
  {
    id: 9,
    slug: 'kellas-kitchen',
    title: "Kella's Kitchen & Events",
    category: 'Food & Beverage · Website Design',
    tagline: 'Fresh, Healthy Meals Delivered to You.',
    description:
      "A warm, story-led brand site for a Freetown-based kitchen serving natural drinks, traditional African dishes, and event catering. Translates Michaella's personal wellness journey into a clear menu, ordering flow, and contact path.",
    services: ['Website Design', 'UX Strategy', 'Brand Storytelling'],
    url: 'https://kellas-kitchen.lovable.app',
    image: 'https://cdn.wegic.ai/assets/onepage/uploads/2027378739789144065/image/2026/03/16/01KKVNYGTHP9DPQ8CK2AVMN8TT.png?imageMogr2/format/webp',
    imageAlt: "Kella's Kitchen & Events website design — food brand homepage featuring traditional African meals, natural drinks and event catering in Freetown Sierra Leone",
    accent: '#c9960c',
    stats: [
      { label: 'Region', value: 'Freetown, SL' },
      { label: 'Site', value: 'Live' },
      { label: 'Type', value: 'Brand + Menu' },
    ],
  },
  {
    id: 10,
    slug: 'sprout',
    title: 'Sprout',
    category: 'Family · Native Mobile App',
    tagline: 'Education · Faith · Wealth · Health.',
    description:
      'A native iOS and Android growth app for children ages 0–18, built with React Native and Expo. Four pillars — Education, Faith, Wealth, Health — delivered through daily challenges, age-staged content, gamified streaks, offline-first storage, and a Socratic study tutor. Ships with a public marketing site and Apple Made-for-Kids–ready privacy policy at sprout.dsbdigital.biz.',
    services: ['Native App Development', 'Product Strategy', 'Brand & Marketing Site'],
    url: 'https://sprout.dsbdigital.biz',
    image: 'https://cdn.wegic.ai/assets/onepage/uploads/2027378739789144065/image/2026/03/16/01KKVNYGTHNGJCR3G2VMYEWNR7.png?imageMogr2/format/webp',
    imageAlt: 'Sprout family growth app — native iOS and Android app for children ages 0–18 covering Education, Faith, Wealth and Health',
    accent: '#3a8f5e',
    stats: [
      { label: 'Pillars', value: '4' },
      { label: 'Platforms', value: 'iOS + Android' },
      { label: 'Age Range', value: '0–18' },
    ],
  },
  {
    id: 11,
    slug: 'nexa-ideation',
    title: 'Nexa-Ideation',
    category: 'SaaS · Application Design',
    tagline: 'AI Business Idea Analyzer.',
    description:
      'An AI-powered business idea evaluation tool delivering instant A–F grades across six dimensions. Users share their age, location, industry, and startup capital — then receive personalised insights to assess and compare startup ideas.',
    services: ['App Design', 'Dashboard UI', 'UX Research'],
    url: 'https://nexa-ideation.lovable.app',
    image: 'https://cdn.wegic.ai/assets/onepage/uploads/2027378739789144065/image/2026/03/16/01KKVNYGTH5W7ZBY8H17TNXTEG.png?imageMogr2/format/webp',
    imageAlt: 'Nexa-Ideation SaaS app design — AI business idea analyzer dashboard grading startup concepts across 6 dimensions with A–F scoring',
    accent: '#3ab26e',
    stats: [
      { label: 'Dimensions', value: '6' },
      { label: 'Grade Scale', value: 'A–F' },
      { label: 'Stage', value: 'Live MVP' },
    ],
  },
];

// Projects with a dedicated /work/<slug> case-study page (keep in sync with caseStudies.ts)
const CASE_STUDY_SLUGS = new Set([
  'nexa-welbodi',
  'nexa-logistix',
  'nexa-synapse',
  'nexa-continuum',
  'rms-death-tracker',
  'vocal-drift-inspire',
  'salone-gospel-hub',
  'prime-care',
]);

const services = [
  {
    number: '01',
    title: 'Websites & Landing Pages',
    desc: 'High-converting, pixel-perfect brand presences built in hours, not weeks. Fully responsive and SEO-optimised for maximum visibility on every device.',
  },
  {
    number: '02',
    title: 'Web Applications',
    desc: 'Full-stack web apps with auth, payments and real database integrations — interactive tools, workflows, and portals that ship as a working MVP.',
  },
  {
    number: '03',
    title: 'Native Mobile Apps',
    desc: 'iOS and Android apps built with React Native and Expo — gamification, offline storage, push notifications, and store-ready submission packages included.',
  },
  {
    number: '04',
    title: 'Dashboards & Admin Panels',
    desc: 'Data-rich interfaces that make complex information intuitive. Analytics views, user management, and real-time reporting — beautifully designed.',
  },
  {
    number: '05',
    title: 'Product Strategy & MVP Scoping',
    desc: 'From a one-line idea to a shipping MVP: discovery, feature scoping, user-flow mapping, and a tight 72-hour build plan. We choose what to cut so launch happens.',
  },
  {
    number: '06',
    title: 'Brand & Portfolio Sites',
    desc: 'Premium portfolio and brand experiences — typographic, animated, conversion-focused. Designed to turn visitors into clients from the very first scroll.',
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

const lineVariant = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: 'easeOut' as const } },
};

// ─── Components ───────────────────────────────────────────────────────────────

function RevealText({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '-10% 0px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref as React.RefObject<HTMLElement>, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 pb-16 pt-32 overflow-hidden"
      style={{ position: 'relative' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(hsl(0 0% 15% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 15% / 0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs tracking-[0.4em] uppercase text-muted mb-8"
        >
          Digital Product Development — Digital Solution Builders
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          className="font-serif text-[clamp(3rem,10vw,9rem)] leading-[0.9] tracking-tighter mb-8 text-balance"
        >
          From Concept
          <br />
          <span className="italic text-muted/70">to MVP.</span>
          <br />
          In 72 Hours.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          style={{ originX: 0 }}
          className="h-px bg-border/60 mb-8 w-full"
        />

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col gap-4 max-w-md"
          >
            <p className="text-sm text-muted/70 leading-relaxed">
              Digital Solution Builders develops websites, web apps, native iOS and Android apps, dashboards and portfolios using diverse AI platforms. We handle the strategy, integrations, authentication and logic — so you get a working, store-ready MVP, fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90 transition-colors duration-200"
              >
                Start Your 72-Hour Build
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#work"
                className="inline-flex items-center gap-2 px-5 min-h-[44px] border border-border/60 text-xs font-medium tracking-wide text-foreground/80 hover:text-foreground hover:border-foreground/40 transition-colors duration-200"
              >
                View Recent Projects
              </a>
            </div>
            <p className="text-xs text-muted/40 tracking-wide">No meetings. No months. Just MVPs.</p>
            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted/50">8 products shipped</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted/50">Web · Mobile · Enterprise</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-muted/50">From 72-hour MVPs to multi-month platforms</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted"
          >
            <span>Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
              <ArrowDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [shareOpen, setShareOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Expand the observation root so the reveal triggers before the card scrolls
  // into view; the previous `-5%` shrunk it and delayed the fade, which left
  // the section blank on first paint and broke headless/OG-image captures.
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '0px 0px 25% 0px' });
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion || inView;

  const isEven = index % 2 === 0;

  return (
    <article
      ref={ref}
      className="border-b border-border/50 group"
      itemScope
      itemType="https://schema.org/CreativeWork"
      style={{ opacity: reveal ? 1 : 0, transform: reveal ? 'translateY(0)' : 'translateY(60px)', transition: 'opacity 0.8s ease, transform 0.8s ease' }}
    >
      <div
        className={`max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-20 items-center ${
          !isEven ? 'md:grid-flow-col-dense' : ''
        }`}
      >
        {/* Image */}
        <div
          className={`relative overflow-hidden aspect-[4/3] ${!isEven ? 'md:col-start-2' : ''}`}
          style={{ borderLeft: `2px solid ${project.accent}` }}
        >
          <motion.img
            src={project.image}
            alt={project.imageAlt}
            loading="lazy"
            decoding="async"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full object-cover"
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 0.5 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: project.accent }}
          />
        </div>

        {/* Content */}
        <div className={`flex flex-col gap-6 ${!isEven ? 'md:col-start-1 md:row-start-1' : ''}`}>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: project.accent }}>
              {project.category}
            </p>
            <h2 className="font-serif text-3xl md:text-5xl tracking-tight leading-tight mb-1" itemProp="name">
              {project.title}
            </h2>
            <p className="font-serif italic text-muted/60 text-lg" itemProp="description">{project.tagline}</p>
          </div>

          <motion.div
            variants={lineVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            style={{ originX: 0, backgroundColor: project.accent, height: '1px' }}
            className="w-full opacity-40"
          />

          <p className="text-sm text-muted/70 leading-relaxed">{project.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {project.stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl md:text-3xl tracking-tight" style={{ color: project.accent }}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-2">
            {project.services.map((s) => (
              <span
                key={s}
                className="text-xs tracking-wider uppercase px-3 py-1 border border-border/60 text-muted/60"
              >
                {s}
              </span>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex items-center gap-6">
            {CASE_STUDY_SLUGS.has(project.slug) && (
              <Link
                to={`/work/${project.slug}`}
                className="text-xs tracking-wider uppercase border-b pb-px min-h-[44px] inline-flex items-center transition-colors duration-200 hover:opacity-80"
                style={{ color: project.accent, borderColor: `${project.accent}66` }}
              >
                View case study
              </Link>
            )}
            <a
              href="#contact"
              className="text-xs tracking-wider uppercase text-muted/40 hover:text-muted/80 transition-colors duration-200 border-b border-muted/20 hover:border-muted/50 pb-px min-h-[44px] inline-flex items-center"
            >
              Build something like this
            </a>
            <button
              onClick={() => setShareOpen(true)}
              aria-label={`Share ${project.title}`}
              className="ml-auto flex items-center gap-1.5 text-xs tracking-wider uppercase text-muted/30 hover:text-muted/70 transition-colors duration-200 min-h-[44px] min-w-[44px] justify-center"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>

          <ShareModal
            isOpen={shareOpen}
            onClose={() => setShareOpen(false)}
            project={{
              title: project.title,
              tagline: project.tagline,
              category: project.category,
              url: project.url,
              accent: project.accent,
            }}
          />
        </div>
      </div>
    </article>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="px-6 md:px-12 py-24 md:py-36 max-w-7xl mx-auto w-full">
      <RevealText className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">What We Build</p>
        <h2 className="font-serif text-4xl md:text-6xl tracking-tight">
          Services &amp; <span className="italic text-muted/80">Capabilities</span>
        </h2>
      </RevealText>

      <div className="grid md:grid-cols-2 gap-0 border-t border-border/50">
        {services.map((service, idx) => (
          <div
            key={service.number}
            className={`group border-b border-border/50 p-8 md:p-10 hover:bg-foreground/[0.03] transition-colors duration-500 flex flex-col justify-between gap-6${idx % 2 === 0 ? ' md:border-r' : ''}`}
          >
            <div>
              <p className="font-serif text-xs text-muted/40 mb-6">{service.number}</p>
              <h3 className="font-serif font-medium text-2xl md:text-3xl tracking-tight mb-4">{service.title}</h3>
              <p className="text-sm text-muted/70 leading-relaxed">{service.desc}</p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted/60 hover:text-foreground group-hover:text-muted/80 transition-colors duration-300 w-fit"
            >
              Start this service
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

const pricingBands = [
  {
    number: '01',
    title: 'Quick MVP',
    duration: '72 hours',
    body: 'A live, working web product with auth, database, payments where needed, and a real domain. Best for landing pages, internal tools, idea-validation MVPs, and side projects that need to ship before the weekend.',
    fit: 'Best for: a single workflow you can describe in two sentences.',
  },
  {
    number: '02',
    title: 'Standard Build',
    duration: '1–2 weeks',
    body: 'Multi-screen apps with role-based access, third-party integrations, payments, and a small custom backend. Includes design, copy, deployment, and a handover doc your team can actually follow.',
    fit: 'Best for: most product launches — SaaS MVPs, marketplaces, internal portals.',
  },
  {
    number: '03',
    title: 'Platform Build',
    duration: '3+ weeks',
    body: 'Multi-tenant systems, EMRs, supply-chain platforms, analytics layers, and anything that has to run reliably for real users on real money. Architecture review, staging environment, observability wired in.',
    fit: 'Best for: production systems with regulatory or scale constraints.',
  },
];

function PricingSection() {
  return (
    <section
      id="pricing"
      className="border-t border-border/50 px-6 md:px-12 py-24 md:py-36 max-w-7xl mx-auto w-full"
    >
      <RevealText className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">How We Price</p>
        <h2 className="font-serif text-4xl md:text-6xl tracking-tight">
          Three bands, <span className="italic text-muted/80">one fixed quote.</span>
        </h2>
        <p className="text-sm text-muted/70 leading-relaxed mt-6 max-w-2xl">
          Pricing scales with scope, not hours. Tell us what you're building. We'll send a fixed
          quote within 24 hours — no calls required to get a number.
        </p>
      </RevealText>

      <div className="grid md:grid-cols-3 gap-0 border-t border-border/50">
        {pricingBands.map((band, idx) => (
          <div
            key={band.number}
            className={`group border-b border-border/50 p-8 md:p-10 hover:bg-foreground/[0.03] transition-colors duration-500 flex flex-col justify-between gap-6${idx < 2 ? ' md:border-r' : ''}`}
          >
            <div>
              <p className="font-serif text-xs text-muted/40 mb-6">{band.number}</p>
              <h3 className="font-serif font-medium text-2xl md:text-3xl tracking-tight mb-1">
                {band.title}
              </h3>
              <p className="text-xs tracking-widest uppercase text-muted/60 mb-4">
                {band.duration}
              </p>
              <p className="text-sm text-muted/70 leading-relaxed mb-4">{band.body}</p>
              <p className="text-xs text-muted/50 italic">{band.fit}</p>
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted/60 hover:text-foreground group-hover:text-muted/80 transition-colors duration-300 w-fit"
            >
              Get a fixed quote
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

const faqItems = [
  {
    q: "What does a 72-hour MVP actually mean?",
    a: "A live, working web product on your domain. Auth if you need it, database if you need it, payments if you need it. Real screens, real data, real deploy. It is not a Figma file, not a redesign of an existing site, and not a clickable prototype. The 72 hours is from kickoff to a URL you can hand to a real user.",
  },
  {
    q: "What if my project needs more than 72 hours?",
    a: "Then it's a Standard or Platform build. Tell us what you're building. We'll send a fixed quote and a delivery date within 24 hours. No padding, no hourly creep.",
  },
  {
    q: "Do you handle post-launch support?",
    a: "Yes — on a separate engagement. Once a build is live, you can keep us on a monthly retainer for changes, fixes, and small new features, or move to your own team. Either way, we hand over clean code, deploy access, and a runbook.",
  },
  {
    q: "How does payment work?",
    a: "Deposit upfront, balance on delivery. Wire transfer or mobile money for clients in West Africa; bank transfer or card for international clients. We send invoices in NLE, USD, GBP, or EUR — whatever your accounting needs.",
  },
  {
    q: "What if I don't have a fully-formed idea yet?",
    a: "That's what the Product Strategy & MVP Scoping service is for. Tell us the problem, the user, and the constraint. We'll come back with a one-page brief and three build options at three price points. You pick one, or you don't — the scoping deliverable is yours either way.",
  },
  {
    q: "Can you work with my existing brand or team?",
    a: "Yes. If you have a brand system, designers, or a CTO already in place, we slot in. We can ship to your GitHub org, your Vercel account, your Supabase project. We also do white-label work — the case studies on this page are clients who chose to be public, but most of our work is invisible.",
  },
];

const faqPageLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Digital Solution Builders',
  url: 'https://dsbdigital.biz/',
  logo: 'https://dsbdigital.biz/og-cover.png',
  founder: {
    '@type': 'Person',
    name: 'Daniel Bangura',
    sameAs: 'https://www.linkedin.com/in/daniel-bangura-9ba047bb/',
  },
};

function FAQSection() {
  return (
    <section
      id="faq"
      className="border-t border-border/50 px-6 md:px-12 py-24 md:py-36 max-w-7xl mx-auto w-full"
    >
      <RevealText className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Things People Ask</p>
        <h2 className="font-serif text-4xl md:text-6xl tracking-tight">
          Questions, <span className="italic text-muted/80">answered.</span>
        </h2>
      </RevealText>

      <div className="border-t border-border/50">
        {faqItems.map((item, idx) => (
          <details
            key={idx}
            className="group border-b border-border/50 py-6 md:py-8 cursor-pointer"
          >
            <summary className="flex items-start justify-between gap-6 list-none [&::-webkit-details-marker]:hidden">
              <h3 className="font-serif font-medium text-xl md:text-2xl tracking-tight pr-6 group-hover:text-foreground transition-colors">
                {item.q}
              </h3>
              <span className="font-serif text-2xl text-muted/40 group-open:rotate-45 transition-transform duration-300 select-none">
                +
              </span>
            </summary>
            <p className="text-sm text-muted/70 leading-relaxed mt-4 max-w-3xl">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section
      id="about"
      className="border-t border-border/50 px-6 md:px-12 py-24 md:py-36 max-w-7xl mx-auto w-full"
    >
      <div className="grid md:grid-cols-2 gap-16 items-start">
        <RevealText>
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">About Digital Solution Builders</p>
          <h2 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight">
            Design with <span className="italic text-muted/70">Intent.</span>
          </h2>
        </RevealText>

        <RevealText delay={0.2} className="flex flex-col gap-6">
          <p className="text-sm text-muted/70 leading-relaxed">
            Digital Solution Builders is a one-studio digital product development practice — websites, web applications, native iOS and Android apps, electronic medical records, pharmaceutical supply-chain platforms, and analytics layers — built using a curated stack of AI platforms (Lovable, Cursor, Figma, Claude) wired into real authentication, payments, databases, telephony and forecasting models. Every project ships as a working product, not a Figma file.
          </p>
          <p className="text-sm text-muted/70 leading-relaxed">
            From youth brands and family-growth mobile apps to AI-powered SaaS, hospital EMR systems, and pharmaceutical supply-chain platforms — we scope the MVP, design the experience, write the code, integrate the services, and ship to production. Small builds in 72 hours. Enterprise platforms in weeks.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border/40">
            {[
              { value: '14', label: 'Products in Portfolio' },
              { value: '3', label: 'Surfaces — Web · Mobile · Enterprise' },
              { value: '72hrs', label: 'For Small Builds' },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-serif text-3xl tracking-tight">{item.value}</p>
                <p className="text-xs text-muted/50 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </RevealText>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section
      id="contact"
      className="border-t border-border/50 px-6 md:px-12 py-24 md:py-36 max-w-7xl mx-auto w-full"
    >
      {/* Heading */}
      <RevealText className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Start a Project</p>
        <h2 className="font-serif text-5xl md:text-7xl tracking-tighter leading-none">
          Ready to launch
          <br />
          <span className="italic text-muted/70">in 72 hours?</span>
        </h2>
        <div className="flex items-center gap-2 mt-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <p className="text-xs text-muted/50 tracking-wide">Currently accepting new projects — slots fill fast.</p>
        </div>
      </RevealText>

      {/* Two-column layout: contact info + primary CTA card */}
      <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

        {/* Left — contact details */}
        <RevealText delay={0.1} className="flex flex-col gap-8">
          <p className="text-sm text-muted/60 leading-relaxed">
            Drop a message and we&apos;ll get back to you within hours — not days. Tell us what you&apos;re building and we&apos;ll take it from there.
          </p>
          <a
            href="mailto:danielbangs@dsbdigital.biz"
            className="group inline-flex items-center gap-3 font-serif text-xl md:text-2xl hover:text-muted/70 transition-colors duration-300"
          >
            <Mail className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            danielbangs@dsbdigital.biz
          </a>
          <a
            href="https://www.linkedin.com/in/daniel-bangura-9ba047bb/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm text-muted hover:text-foreground transition-colors duration-300"
          >
            <ArrowUpRight className="w-4 h-4" />
            LinkedIn — Daniel Bangura
          </a>
          <a
            href="https://wa.me/23278687787?text=Hi%20DSB%20Digital%2C%20I%27d%20like%20to%20start%20a%20project!"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-sm text-[#25D366] hover:text-[#20bd5a] transition-colors duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp — +232 78 687 787
          </a>
        </RevealText>

        {/* Right — interactive contact form (relays via /api/contact → n8n) */}
        <RevealText delay={0.2}>
          <ContactForm />
        </RevealText>

      </div>
    </section>
  );
}

function TechStackSection() {
  const techGroups = [
    {
      label: 'AI & Design Platforms',
      items: ['Lovable', 'Cursor', 'Figma', 'Claude', 'Canva'],
    },
    {
      label: 'Web & Mobile Stacks',
      items: ['React', 'Vite', 'Next.js', 'React Native', 'Expo', 'Tailwind'],
    },
    {
      label: 'Backend & Hosting',
      items: ['DigitalOcean', 'Railway', 'Vercel', 'Docker', 'GitHub Actions'],
    },
    {
      label: 'Databases & Auth',
      items: ['PostgreSQL', 'Supabase', 'Firebase', 'Clerk', 'Auth.js'],
    },
    {
      label: 'USSD · Shortcodes · SMS',
      items: ["Africa's Talking", 'USSD Menus', 'SMS Gateway', 'Shortcodes', 'Voice / IVR'],
    },
    {
      label: 'AI Agents & Chatbots',
      items: ['Claude Agent SDK', 'Anthropic API', 'MCP Servers', 'AI Chatbots', 'Voice Agents'],
    },
  ];

  return (
    <section className="border-t border-border/50 px-6 md:px-12 py-24 md:py-32 max-w-7xl mx-auto w-full">
      <RevealText className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Built With</p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
          The Stack That <span className="italic text-muted/70">Builds MVPs</span>
        </h2>
      </RevealText>
      <div className="grid md:grid-cols-3 gap-0 border border-border/40">
        {techGroups.map((group, i) => {
          const isLastOverall = i === techGroups.length - 1;
          const isLastCol = i % 3 === 2;
          const isLastRow = i >= techGroups.length - 3;
          const cls = [
            'p-8 md:p-10 border-border/40',
            !isLastOverall ? 'border-b' : '',
            'md:border-b-0',
            !isLastRow ? 'md:border-b' : '',
            !isLastCol ? 'md:border-r' : '',
          ].filter(Boolean).join(' ');
          return (
            <div key={group.label} className={cls}>
              <p className="text-xs tracking-[0.3em] uppercase text-muted/50 mb-6">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 border border-border/50 text-xs text-muted/70 hover:text-foreground hover:border-foreground/30 transition-colors duration-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Seo
        title="Digital Solution Builders | Digital Product Development — Web, Mobile & Enterprise in 72 Hours"
        description="Digital Solution Builders is a digital product development studio shipping websites, web apps, native iOS & Android apps, hospital EMR systems, pharmaceutical supply-chain platforms, mortality-surveillance tools and analytics layers. From concept to MVP in 72 hours."
        canonicalPath="/"
        jsonLd={[organizationLd, faqPageLd]}
      />

      <main id="main-content">

      <HeroSection />

      {/* Work Section */}
      <section id="work" className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-16 pb-0">
        <RevealText className="mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-muted mb-4">Selected Work</p>
          <h2 className="font-serif text-4xl md:text-6xl tracking-tight">
            Recent <span className="italic text-muted/80">Projects</span>
          </h2>
        </RevealText>
      </section>

      <section className="border-t border-border/50">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </section>

      <AboutSection />

      <ServicesSection />

      <PricingSection />

      <TechStackSection />

      <FAQSection />

      <ContactSection />

      </main>
    </>
  );
}
