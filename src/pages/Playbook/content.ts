// All reader-facing copy for the /playbook landing page.
// Transcribed verbatim from the canonical source:
// Career Playbook/launch/landing_copy.md (voice-gated, redaction-audited).
// Do not reword here; edit the source and re-transcribe.

export interface Chapter {
  n: string;
  title: string;
  blurb: string;
}

export interface Faq {
  q: string;
  a: string;
}

export const HERO = {
  wordmark: 'DIGITAL SOLUTION BUILDERS',
  title: ['THE GLOBAL', 'AFRICAN', 'PROFESSIONAL'],
  headline: 'Your career is better than your paperwork says it is.',
  subhead:
    'An eight-chapter playbook built from my real career documents: six CVs written between 2021 and 2026, a cover letter that won the role, six contract types including the non-compete I found by audit, and the sweep that surfaced twelve certificates I could not produce. Five working templates included. USD 29, Leone equivalent shown at checkout.',
  ctaGuide: 'Get the free CV guide',
  ctaNotify: 'Get notified when it launches',
};

export const STORY = {
  kicker: 'The audit that started this book',
  paragraphs: [
    'Early in 2026 I commissioned a full audit of my own career papers. Every folder across two laptops, two USB drives, my cloud storage, and an inbox going back years, all of it swept for anything that proves what I have studied, done, signed, or earned.',
    'I did it because I was writing this book, and I refused to write a book about career documents from memory.',
    'The audit found three problems, and they became the book.',
    'The most valuable recent credential I hold, my Postgraduate Diploma in Digital Health earned with UNITAR, was saved in a file named "Daniel Bangura.pdf". No credential name, no institution, no year. Invisible to any search, including my own.',
    'Twelve (12) courses I had completed or enrolled in, spread across five (5) platforms, had no certificate file on any device I own. Completed work, stranded on the platforms that issued it. One certificate existed only as an email attachment, one inbox cleanup away from gone.',
    'And a routine two-page extension to one of my own consultancy contracts turned out to contain a one-year non-compete that applies globally. I had signed it as continuity paperwork and never gone back to read what it restricted. I found it by audit, not by diligence.',
    'My career is documented more carefully than most, and my files were still in that state. So I will not assume yours are in better shape. I will assume they are normal, and hand you the same action list the audit handed me: recover, redeem, renew, register, file.',
  ],
};

export const CHAPTERS: Chapter[] = [
  {
    n: '00',
    title: 'Every Document in This Book Is Real',
    blurb:
      'The audit story, the honesty covenant, and the first DO THIS NOW list, which starts your own audit before chapter one.',
  },
  {
    n: '01',
    title: 'The Career Capital Audit',
    blurb:
      'Sweep your files the way I swept mine, and build the one folder that becomes your single source of truth.',
  },
  {
    n: '02',
    title: 'CV Engineering',
    blurb:
      'Six versions of my CV, 2021 to 2026, same career told two very different ways, and the XYZ rebuild that separates them.',
  },
  {
    n: '03',
    title: 'LinkedIn Is Distribution',
    blurb:
      'A section-by-section teardown of my own profile, because a CV in a folder persuades nobody until somebody sees it.',
  },
  {
    n: '04',
    title: 'Applications That Get Answered',
    blurb:
      'The one-page cover letter that won my current role, grammatical stumbles included, and why it worked anyway.',
  },
  {
    n: '05',
    title: 'Interviews and Negotiation',
    blurb:
      'Built from the paper on both sides of the interview room, the documents that got me in and the contracts I signed on the way out. No reconstructed dialogue dressed up as fact.',
  },
  {
    n: '06',
    title: 'Read Your Contract Like It Will Be Enforced',
    blurb:
      'Six contract types, change orders, and a line-by-line walk through the non-compete I signed without reading properly.',
  },
  {
    n: '07',
    title: 'Credentials That Compound',
    blurb:
      'Which credentials actually move a career, which ones only decorate it, and the recovery plan for the twelve certificates I stranded.',
  },
  {
    n: '08',
    title: 'The Three-Lane Arc',
    blurb:
      'Employed, consultant, founder. The paperwork of holding more than one lane, and of moving between them, because most modern African careers braid all three.',
  },
];

export const TEMPLATES: { name: string; blurb: string }[] = [
  {
    name: 'XYZ CV Template',
    blurb:
      'Rebuild every CV bullet outcome-first, slot by slot, with the causal-verb list and an evidence check built in.',
  },
  {
    name: 'LinkedIn Section-by-Section Worksheet',
    blurb: 'Rewrite your profile top to bottom alongside chapter three.',
  },
  {
    name: 'Cover Letter Template',
    blurb: 'The structure of the letter that won my current role.',
  },
  {
    name: 'Contract Review Checklist',
    blurb: 'What to search for before you sign, including the word ADDED.',
  },
  {
    name: 'Career Capital Tracker',
    blurb:
      'One file listing every credential, role, project, and document you hold, and where each one lives.',
  },
];

export const WHO = {
  forYou: [
    'I wrote this for African professionals, at home on the continent and abroad in the diaspora, who are capable and serious and tired of being under-packaged.',
    'You may be a nurse in Nairobi eyeing a global health role, an engineer in Accra taking a first consultancy alongside employment, an analyst in London whose home-country experience keeps getting read as smaller than it was.',
    'You navigate things the standard career guides never mention: credentials earned in one system and evaluated in another, referees across time zones, contracts governed by laws in countries you have never visited. I have navigated all of that from Freetown, and I wrote this as one professional to another, not as a guru to a follower.',
  ],
  notForYou: [
    'It is not a job board, a placement service, or a source of referrals, and it promises no offers and no salary figures.',
    'The contracts chapter is not legal advice; it teaches you what to look for and when to hire a lawyer.',
    'And if you want motivation rather than instruction, this book will disappoint you. It is short on inspiration and long on instruction by design.',
  ],
};

export const COVENANT = {
  kicker: 'The honesty covenant',
  paragraphs: [
    'Most career books teach from a highlight reel. This one teaches from an audit, and an audit shows everything.',
    'You will see the filename that hid my newest degree, the certificates I let strand, the certification I let expire, the clause I signed without reading properly. Where my own documents break the rules this book teaches, the book says so.',
    'I find that freeing rather than embarrassing. The professionals I most respect are not the ones with perfect files, they are the ones who checked.',
  ],
};

export const PRICE = {
  amount: 'USD 29',
  note: 'One payment. The Leone equivalent is shown at checkout.',
  includes: [
    'Includes the full book and all five templates, delivered to your email.',
    'Pay by international card (handled by Paddle) or, if you are in Sierra Leone, by mobile money (handled by Monime).',
  ],
};

export const FAQS: Faq[] = [
  {
    q: 'What exactly do I get?',
    a: 'The full book, an introduction plus eight chapters, as a digital download you can read on any device, and the five templates as Microsoft Word files. Everything arrives by email link after payment.',
  },
  {
    q: 'How do I pay?',
    a: 'International cards go through Paddle. In Sierra Leone, mobile money goes through Monime. The price is USD 29 either way, with the Leone equivalent shown at checkout.',
  },
  {
    q: 'What if it is not for me?',
    a: 'Email me within 30 days of purchase and I will refund you. I would rather refund than have you feel you wasted money.',
  },
  {
    q: 'Who is this NOT for?',
    a: 'It is not a job board, a placement service, or a source of referrals, and it promises no offers and no salary figures. The contracts chapter is not legal advice; it teaches you what to look for and when to hire a lawyer. And if you want motivation rather than instruction, this book will disappoint you. It is short on inspiration and long on instruction by design.',
  },
  {
    q: 'Are the documents really yours?',
    a: 'Yes. Blocks marked FROM MY FILES show my real material. Names of counterparties, personal contact details, and my personal compensation figures are removed, and everything else is as it was. When you read a CV line, it is a line from a CV I actually submitted.',
  },
  {
    q: 'I am not in health or tech. Does it still apply?',
    a: 'The method chapters, the audit, the CV rebuild, LinkedIn, applications, contracts, credentials, apply across professions. The worked examples come from my own career in health and technology, because those are the documents I can show you honestly.',
  },
];

export const BIO = {
  kicker: 'About the author',
  paragraphs: [
    "Daniel Solomon Bangura is a Sierra Leonean health professional turned founder, and his career runs all three lanes this book teaches. Appointed an Inspecting Pharmacist in Sierra Leone's civil service in 2014. A consultant from 2018, first alongside employment and later through development-sector contracts. A founder through Digital Solution Builders, the company behind this book.",
    'He holds an MSc from the University of Global Health Equity in Rwanda and a Postgraduate Diploma in Digital Health earned with UNITAR, the certificate the audit found hiding in a file named after him.',
    'He writes from Freetown at dsbdigital.biz.',
  ],
};

export const DOWNLOAD_PATH = '/downloads/the-cv-that-gets-you-shortlisted.pdf';

// Single source for the page/social titles, consumed by BOTH the Seo call in
// index.tsx and the prerender-playbook-og plugin in vite.config.ts so the
// rendered <title> and the baked og:title can never drift apart.
export const META_TITLE = 'The Global African Professional | Digital Solution Builders';
export const OG_TITLE = 'The Global African Professional';
