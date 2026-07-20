// Single source of truth for the legal pages' copy.
// Consumed by BOTH the React components (Terms/Privacy/Refunds via LegalPage)
// AND the prerender-legal-pages plugin in vite.config.ts, so the rendered page
// and the crawler-visible <noscript> fallback can never drift apart.
// Plain English, no em dashes, brand spelled out. Edit here, not in the JSX.

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  description: string;
  canonicalPath: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export const TERMS: LegalDoc = {
  title: 'Terms of Service',
  description:
    'The terms that govern dsbdigital.biz and purchases of The Global African Professional, a digital career playbook by Digital Solution Builders.',
  canonicalPath: '/terms',
  updated: '20 July 2026',
  intro:
    'These terms cover this website, dsbdigital.biz, and purchases of The Global African Professional, a digital career playbook sold by Digital Solution Builders. Using the site or buying the book means you accept them.',
  sections: [
    {
      heading: 'What you are buying',
      body: 'The Global African Professional is a digital product: a downloadable book with accompanying templates. Nothing physical ships. Once your payment clears, you get the files, and the sale is complete.',
    },
    {
      heading: 'Your license',
      body: 'Your purchase gives you a personal-use license. Read the book on any of your own devices, print it for yourself, and use the templates in your own job search and career. One purchase covers one person.',
    },
    {
      heading: 'What you may not do',
      body: 'Do not redistribute the book or the templates. That includes reselling them, posting them online, emailing the files to someone else, or sharing your download link. If a colleague wants the book, point them to this site instead.',
    },
    {
      heading: 'Payments',
      body: 'Once card sales go live, card purchases are processed by Paddle as merchant of record. That means your card transaction is with Paddle, which handles checkout, your card details, your receipt, and any sales tax or VAT that applies. In Sierra Leone, mobile money purchases go through Monime.',
    },
    {
      heading: 'Refunds',
      body: 'Every purchase has a 30-day refund window. Email me within 30 days of purchase and I will refund you. The full policy is on the refunds page of this site.',
    },
    {
      heading: 'Not professional advice',
      body: 'The book teaches from experience. Its contracts chapter shows you what to look for and when to hire a lawyer; it is not legal advice.',
    },
    {
      heading: 'Contact',
      body: 'Questions about these terms go to danielbangs@dsbdigital.biz.',
    },
    {
      heading: 'Governing law',
      body: 'These terms are governed by the laws of Sierra Leone.',
    },
  ],
};

export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  description:
    'What data dsbdigital.biz collects, where it goes, and how to have it deleted. First-party analytics, no cookies, no third-party ad tracking.',
  canonicalPath: '/privacy',
  updated: '20 July 2026',
  intro:
    'This policy explains what data this website, dsbdigital.biz, collects and what happens to it. The site is run by Digital Solution Builders.',
  sections: [
    {
      heading: 'What the forms collect',
      body: 'The contact form asks for your name, your email address, and a message, plus your company and project type if you choose to add them. The playbook form asks for your name and email address. That is everything the forms collect. There are no accounts and no passwords.',
    },
    {
      heading: 'Where your details go',
      body: "When you submit a form, a serverless function relays your details to my lead pipeline: an n8n webhook records the submission, a Slack notification tells me you wrote, and your name and email go on my lead list. The submission arrives with basic technical metadata: your browser's user-agent string and the time you sent it. I use your details to send you what you asked for, such as the free chapter or a note when the book is out. They are never sold or passed to advertisers.",
    },
    {
      heading: 'Analytics',
      body: "The site measures traffic with its own endpoint, /api/track. It is first-party and sets no cookies. It counts page views and a few anonymous interaction events, such as shares and contact form submissions. For each page view it records the page path, a rough device and browser category read from your browser's user agent, a two-letter country code, and the site that referred you. The analytics endpoint stores no IP addresses and no full user-agent strings, so nothing in it identifies you.",
    },
    {
      heading: 'Third parties',
      body: 'There is no third-party ad tracking on this site: no advertising pixels, no cross-site trackers, and no analytics scripts from ad networks.',
    },
    {
      heading: 'Deleting your data',
      body: 'Email danielbangs@dsbdigital.biz from the address you signed up with, or name it in your message, and I will delete your details from the lead list.',
    },
  ],
};

export const REFUNDS: LegalDoc = {
  title: 'Refund Policy',
  description:
    'A 30-day, no-conditions refund policy for The Global African Professional. Email within 30 days of purchase for a full refund.',
  canonicalPath: '/refunds',
  updated: '20 July 2026',
  intro:
    'The Global African Professional comes with one simple promise: if it is not for you, you get your money back.',
  sections: [
    {
      heading: 'The policy',
      body: 'Email me at danielbangs@dsbdigital.biz within 30 days of purchase and I will refund you. No conditions. I would rather refund than have you feel you wasted money.',
    },
    {
      heading: 'How to ask',
      body: 'Send the email from the address you used at checkout, or mention that address in your message, so I can find the purchase. You do not need to give a reason.',
    },
    {
      heading: 'How the money comes back',
      body: 'Refunds for card purchases are processed through Paddle, the merchant of record. The same 30-day window applies however you paid, whether by card through Paddle or by mobile money.',
    },
  ],
};

export const LEGAL_DOCS: LegalDoc[] = [TERMS, PRIVACY, REFUNDS];
