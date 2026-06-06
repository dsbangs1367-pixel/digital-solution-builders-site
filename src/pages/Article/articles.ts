// SEO content cluster: "offline-first health software development".
// Framed as Digital Solution Builders portfolio/expertise work, consistent with
// caseStudies.ts: no institutional framing, no invented metrics or testimonials.
// Body fields use a minimal markdown subset rendered by Article/prose.tsx:
//   paragraphs separated by blank lines, "- " unordered lists,
//   [label](/internal or https://external) links, and **bold**.
// Keep slugs in sync with the routes in routes/index.tsx and sitemap.xml.

export interface ArticleTable {
  headers: string[];
  rows: string[][];
}

export interface ArticleSection {
  heading: string;
  body: string;
  table?: ArticleTable;
}

export interface ArticleFaq {
  q: string;
  a: string;
}

export interface ArticleLink {
  label: string;
  to: string;
}

export type ArticleGroup = 'Pillar' | 'Service' | 'Comparison' | 'Guide';

export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tagline: string;
  accent: string;
  intro: string;
  sections: ArticleSection[];
  faq: ArticleFaq[];
  related: ArticleLink[];
  group: ArticleGroup;
  updated: string;
}

const ACCENT = '#3a8fb5';
const UPDATED = '2026-06-06';

// Insights hub meta, shared by the page (Insights/index.tsx) and the build-time
// prerender (vite.config.ts) so they never drift.
export const INSIGHTS_META = {
  title: 'Insights | Digital Solution Builders',
  description:
    'Practical guides on building offline-first health software: EMRs, LMIS, DHIS2 integration and digitising clinics in low-connectivity settings.',
};

// Display order for the /insights hub and prerender iteration.
export const ARTICLE_ORDER: string[] = [
  'offline-first-health-software-development',
  'offline-first-emr-development',
  'openmrs-alternative',
  'best-emr-small-rural-clinics',
  'lmis-software-development-services',
  'dhis2-integration-guide',
  'building-software-low-connectivity-environments',
  'digitise-paper-health-records-rural-clinics',
];

export const articles: Record<string, Article> = {
  'offline-first-health-software-development': {
    slug: 'offline-first-health-software-development',
    title: 'Offline-First Health Software Development',
    metaTitle: 'Offline-First Health Software Development | DSB',
    metaDescription:
      'How to build health software that works without reliable internet. EMRs, LMIS and surveillance systems engineered offline-first for low-connectivity settings.',
    category: 'Guide · Health Software',
    tagline: 'Build for the clinic where the power cuts out, not the demo.',
    accent: ACCENT,
    group: 'Pillar',
    updated: UPDATED,
    intro:
      'Most health software assumes reliable internet. Then it ships to a clinic where the power cuts out by mid-afternoon and the nearest signal is a tower three villages away. Offline-first development treats the network as optional, so the tool gets used every day instead of gathering dust.',
    sections: [
      {
        heading: 'What "offline-first" actually means',
        body: 'Offline-first is an architecture choice, not a feature you bolt on later.\n\n- **The device is the source of truth between syncs.** Records are created, read and edited locally with no round trip to a server.\n- **Sync is a background process, not a blocker.** When connectivity returns, the app reconciles local changes and resolves conflicts predictably.\n- **The interface never freezes waiting for a network.** Every action gives an instant local response.\n- **Data integrity survives interruption.** A dropped connection mid-save must never corrupt or lose a record.\n\nRetrofitting this onto an online-only system is expensive and usually incomplete. It is far cheaper to design for it from the first commit, which is why the choice of partner matters early.',
      },
      {
        heading: 'Why it matters in low-connectivity settings',
        body: 'In many health systems, mobile internet penetration sits far below what online-only software assumes. A platform that needs a live connection for every action excludes the exact facilities that need digital tools most: rural clinics, peripheral health units and mobile outreach teams.\n\nOffline-first changes the economics. Staff capture data at the point of care, on whatever device they have, and the system catches up later. You get complete records instead of gaps, and adoption instead of abandonment.',
      },
      {
        heading: 'The systems we build offline-first',
        body: 'An [offline-first EMR](/offline-first-emr-development) lets clinicians register patients and record encounters with no connection, then syncs to a central record. We built this end to end with [Welbodi](/work/nexa-welbodi).\n\nA [logistics management information system](/lmis-software-development-services) tracks stock, cold chain and dispensing across a distribution network where last-mile connectivity is rarely reliable. We built [Nexa-Logistix](/work/nexa-logistix) on this model.\n\nSurveillance systems depend on data captured in the field, often far from any network. We built [RMS](/work/rms-death-tracker), a rapid mortality surveillance platform, with offline capture and clean national-system integration.\n\nIf you are running OpenMRS and hitting its limits, see [when to build a custom EMR instead](/openmrs-alternative). If you are choosing your first system, start with [the best EMR for small and rural clinics](/best-emr-small-rural-clinics).',
      },
      {
        heading: 'How offline-first connects to national systems',
        body: 'Building offline-first does not mean building a silo. The data still needs to reach DHIS2, a national EMR or a civil registration system. The pattern is: capture offline at the edge, sync to your own server, then push to the national platform through its API. See our [practical guide to DHIS2 integration](/dhis2-integration-guide) for how we wire this up without double-counting or data loss.',
      },
      {
        heading: 'What goes into a build',
        body: 'A serious offline-first health build covers a local-first data layer with a conflict-resolution strategy chosen for the workflow, a progressive web app that installs on low-end devices, a sync engine that is resilient to partial failure, role-based access and audit trails for health data, and integration adapters for DHIS2 and FHIR-based registries. We cover the deeper trade-offs in [building software for low-connectivity environments](/building-software-low-connectivity-environments).',
      },
    ],
    faq: [
      {
        q: 'What is offline-first health software development?',
        a: 'It is building health applications that run fully on the device and store data locally, syncing to a server only when a connection is available. The network is optional rather than required, which suits clinics and field teams in low-connectivity settings.',
      },
      {
        q: 'Is offline-first more expensive to build?',
        a: 'Built from the start the premium is modest and adoption improves significantly. Retrofitting it onto an online-only system is expensive, so the decision should be made early in the project.',
      },
      {
        q: 'Can offline-first health software integrate with DHIS2?',
        a: 'Yes. Data is captured offline at the edge, synced to your server, then pushed to DHIS2 or a national registry through its API, with safeguards against duplication and data loss.',
      },
    ],
    related: [
      { label: 'Offline-first EMR development', to: '/offline-first-emr-development' },
      { label: 'LMIS software development services', to: '/lmis-software-development-services' },
      { label: 'DHIS2 integration guide', to: '/dhis2-integration-guide' },
    ],
  },

  'offline-first-emr-development': {
    slug: 'offline-first-emr-development',
    title: 'Offline-First EMR Development',
    metaTitle: 'Offline-First EMR Development | DSB',
    metaDescription:
      'Custom offline-first EMR development for clinics and hospitals in low-connectivity settings. Capture records with no signal, sync when online.',
    category: 'Service · EMR',
    tagline: 'An EMR that keeps working when the internet does not.',
    accent: ACCENT,
    group: 'Service',
    updated: UPDATED,
    intro:
      'If your clinic loses connectivity for hours at a time, an online-only electronic medical record is worse than paper. An offline-first EMR removes the wait: it runs on the device, stores every record locally, and syncs the moment a connection returns. We build offline-first EMRs end to end.',
    sections: [
      {
        heading: 'What you get',
        body: '- **Full function with no signal.** Register patients, record encounters, order and view labs, prescribe, all offline.\n- **Background sync.** Local changes reconcile with the central record automatically, with predictable conflict resolution.\n- **Runs on low-end devices.** A progressive web app that installs on the phones and tablets staff already have.\n- **Health-grade access control.** Role-based permissions and full audit trails over every record.\n- **National-system ready.** Built to integrate with DHIS2 and FHIR-based registries. See our [DHIS2 integration guide](/dhis2-integration-guide).',
      },
      {
        heading: 'Proof: Welbodi',
        body: 'We built [Welbodi](/work/nexa-welbodi), an offline-first EMR for hospitals, clinics and peripheral health units in low-connectivity settings, end to end. It is the reference for how we approach EMR work: offline-first from the first commit, not bolted on later.',
      },
      {
        heading: 'How we build it',
        body: '- **Workflow mapping** before code, because the conflict-resolution rules depend on how records actually get created.\n- **A local-first data layer** where the device is the source of truth between syncs.\n- **A resilient sync engine** so partial failures and dropped connections never corrupt or lose a record.\n- **Integration adapters** for DHIS2 and FHIR registries, plus Excel or KoBo backfill where needed.\n- **Field-ready deployment** tested against intermittent power, shared devices and low bandwidth.',
      },
      {
        heading: 'Is a custom EMR the right call?',
        body: 'Not always. If an off-the-shelf system fits your workflow, use it. Already on OpenMRS and hitting walls? See [OpenMRS alternative: when to build a custom EMR](/openmrs-alternative). Choosing your first system? See [the best EMR for small and rural clinics](/best-emr-small-rural-clinics). Custom is worth it when your workflow is unusual, when offline-first is non-negotiable, or when you need clean integration that off-the-shelf tools cannot give you.',
      },
    ],
    faq: [
      {
        q: 'What is an offline-first EMR?',
        a: 'An electronic medical record that runs fully on the device and stores patient data locally, syncing to a central record when a connection is available. Staff can register patients and record encounters with no internet.',
      },
      {
        q: 'Can an offline-first EMR integrate with DHIS2?',
        a: 'Yes. Records are captured offline, synced to your server, then pushed to DHIS2 through its API with safeguards against duplication.',
      },
    ],
    related: [
      { label: 'Offline-first health software (pillar)', to: '/offline-first-health-software-development' },
      { label: 'OpenMRS alternative', to: '/openmrs-alternative' },
      { label: 'Best EMR for small and rural clinics', to: '/best-emr-small-rural-clinics' },
    ],
  },

  'openmrs-alternative': {
    slug: 'openmrs-alternative',
    title: 'OpenMRS Alternative: When to Build a Custom EMR Instead',
    metaTitle: 'OpenMRS Alternative: When to Build Custom | DSB',
    metaDescription:
      'Outgrowing OpenMRS? When a custom offline-first EMR beats extending OpenMRS, when it does not, and how to decide without wasting a year.',
    category: 'Comparison · EMR',
    tagline: 'Sometimes the answer is to stay on OpenMRS. Sometimes it is not.',
    accent: ACCENT,
    group: 'Comparison',
    updated: UPDATED,
    intro:
      'OpenMRS is a capable open-source EMR, and for many programmes it is the right starting point. But teams reach a moment where every new requirement means another module and another workaround. This is an honest framework for deciding whether to keep extending it or build something custom.',
    sections: [
      {
        heading: 'When OpenMRS is still the right call',
        body: 'Stay with OpenMRS if your workflows are close to what the standard modules already support, you have or can hire people who know its data model, your customisation needs are configuration and reporting rather than deep changes to how records flow, and you value the shared roadmap over full control. If that is you, extending OpenMRS is cheaper and lower risk than a custom build.',
      },
      {
        heading: 'When a custom EMR wins',
        body: 'Consider a custom [offline-first EMR](/offline-first-emr-development) when:\n\n- **Offline-first is non-negotiable** and you need more than the standard offline support gives you.\n- **Your workflow is genuinely unusual** and you spend more time bending OpenMRS than using it.\n- **Integration is the hard part.** You need clean, controlled sync into DHIS2 or a national registry. See our [DHIS2 integration guide](/dhis2-integration-guide).\n- **Performance on low-end devices matters** and the stack is heavier than your hardware can carry.\n- **You want to own the product**, its data model and its roadmap outright.',
      },
      {
        heading: 'The honest comparison',
        body: 'There is no universally right answer. There is the right fit for your constraints.',
        table: {
          headers: ['Factor', 'Extend OpenMRS', 'Custom offline-first EMR'],
          rows: [
            ['Upfront cost', 'Lower', 'Higher'],
            ['Time to first use', 'Faster if needs are standard', 'Longer, fitted to your workflow'],
            ['Offline behaviour', 'Standard support', 'Designed for your setting'],
            ['Workflow fit', 'Good if close to defaults', 'Exact'],
            ['Control over roadmap', 'Shared', 'Full'],
            ['Best when', 'Needs are mainstream', 'Needs are unusual or offline-critical'],
          ],
        },
      },
      {
        heading: 'How to decide without wasting a year',
        body: '- **List your top five workflow requirements.** Score each as "OpenMRS does this well", "needs a module", or "fights the platform".\n- **Count the fights.** One or two, extend OpenMRS. Several, custom is on the table.\n- **Pressure-test offline.** Write down exactly what must work with no signal, then check honestly whether your setup delivers it.\n- **Cost the integration.** If pushing data to DHIS2 is where the pain is, a custom sync layer may pay for itself.\n\nWe built [Welbodi](/work/nexa-welbodi), an offline-first EMR, for exactly the low-connectivity settings where online-only systems stall. If you are choosing your first system rather than replacing one, start with [the best EMR for small and rural clinics](/best-emr-small-rural-clinics).',
      },
    ],
    faq: [
      {
        q: 'Is OpenMRS good enough, or should I build a custom EMR?',
        a: 'Stay with OpenMRS if your workflows are close to its defaults and your needs are configuration and reporting. Consider custom when offline-first is critical, your workflow is unusual, or integration into national systems keeps fighting the platform.',
      },
      {
        q: 'What is the main advantage of a custom EMR over OpenMRS?',
        a: 'Exact fit to your workflow, offline behaviour designed for your setting, controlled integration, and full ownership of the product and roadmap. The trade-off is higher upfront cost.',
      },
    ],
    related: [
      { label: 'Offline-first EMR development', to: '/offline-first-emr-development' },
      { label: 'Best EMR for small and rural clinics', to: '/best-emr-small-rural-clinics' },
      { label: 'Offline-first health software (pillar)', to: '/offline-first-health-software-development' },
    ],
  },

  'best-emr-small-rural-clinics': {
    slug: 'best-emr-small-rural-clinics',
    title: 'Best EMR for Small and Rural Clinics',
    metaTitle: 'Best EMR for Small and Rural Clinics | DSB',
    metaDescription:
      'How to choose an EMR for a small or rural clinic: the criteria that actually matter in low-connectivity settings, and when custom beats off-the-shelf.',
    category: 'Comparison · EMR',
    tagline: 'The longest feature list rarely wins. The one staff still use in six months does.',
    accent: ACCENT,
    group: 'Comparison',
    updated: UPDATED,
    intro:
      'Most "best EMR" lists are written for large hospitals in well-connected cities. This guide is about the harder case: a clinic with intermittent power, unreliable internet, shared low-end devices, and staff who cannot fight software during a consultation.',
    sections: [
      {
        heading: 'The criteria that actually matter',
        body: 'Score any EMR you are considering against these, in roughly this order:\n\n- **Works offline.** Can staff register patients and record encounters with no signal, and sync cleanly afterwards? In a low-connectivity setting, nothing else matters if this fails. This is why we build [offline-first](/offline-first-health-software-development).\n- **Runs on the devices you have.** A system that needs modern tablets is the wrong system if your clinic runs on older phones.\n- **Fast at the point of care.** Latency kills adoption faster than missing features.\n- **Fits the clinic workflow.** A flow built for a teaching hospital frustrates a two-room health unit.\n- **Survives power and device sharing.** Auto-save, quick re-login, no lost work when the battery dies.\n- **Integrates where it must**, for example into DHIS2 or a national registry.\n- **Total cost over three years**, including training, devices, support and the cost of staff working around a poor fit.',
      },
      {
        heading: 'Off-the-shelf vs custom',
        body: 'There is no single best EMR. There is the best fit for your constraints. Off-the-shelf or open-source such as OpenMRS is best when your workflow is close to standard and offline support is good enough; if you are weighing this, read [OpenMRS alternative: when to build custom](/openmrs-alternative). A custom [offline-first EMR](/offline-first-emr-development) is best when offline is non-negotiable, your workflow is unusual, your devices are constrained, or integration is the hard part.',
      },
      {
        heading: 'A simple scoring method',
        body: 'Put your shortlist in a table and score each one to five on the seven criteria above, weighting "works offline" and "runs on your devices" double. The honest winner is rarely the one with the longest feature list. It is the one your staff will still be using in six months.',
      },
      {
        heading: 'If you are coming off paper',
        body: 'Choosing an EMR is only half the job. Moving years of paper records across is the other half, and the migration path can change which EMR is right for you. See [how to digitise paper health records in rural clinics](/digitise-paper-health-records-rural-clinics) before you commit. We built [Welbodi](/work/nexa-welbodi) for exactly this setting, and if an off-the-shelf system fits you better, we will say so.',
      },
    ],
    faq: [
      {
        q: 'What is the most important feature in an EMR for a rural clinic?',
        a: 'Offline capability. In low-connectivity settings the EMR must let staff register patients and record encounters with no signal and sync cleanly later. Without that, adoption fails regardless of other features.',
      },
      {
        q: 'Should a small clinic use off-the-shelf or custom EMR software?',
        a: 'Off-the-shelf or open-source works when your workflow is close to standard and offline support is good enough. Custom is better when offline is critical, your workflow is unusual, your devices are constrained, or integration is the hard part.',
      },
    ],
    related: [
      { label: 'Offline-first EMR development', to: '/offline-first-emr-development' },
      { label: 'OpenMRS alternative', to: '/openmrs-alternative' },
      { label: 'Digitise paper health records', to: '/digitise-paper-health-records-rural-clinics' },
    ],
  },

  'lmis-software-development-services': {
    slug: 'lmis-software-development-services',
    title: 'LMIS Software Development Services',
    metaTitle: 'LMIS Software Development Services | DSB',
    metaDescription:
      'Custom LMIS development for pharmaceutical supply chains: stock, cold chain, requisitions and dispensing, built offline-first for the last mile.',
    category: 'Service · Supply Chain',
    tagline: 'Field data you can actually forecast against.',
    accent: ACCENT,
    group: 'Service',
    updated: UPDATED,
    intro:
      'A logistics management information system is only as good as the data from the last-mile store, and that is exactly where connectivity is worst. We build LMIS software offline-first, so stock movements are captured where they happen and synced when a connection appears.',
    sections: [
      {
        heading: 'What an LMIS we build covers',
        body: '- **Stock and inventory** across every tier, from central store to facility.\n- **Cold chain** monitoring and alerts where the product demands it.\n- **Requisitions and resupply**, with minimum, maximum and emergency stock logic.\n- **Distribution and dispensing**, down to point of sale where needed.\n- **Offline capture at the edge**, syncing into the central system when online.\n- **DHIS2 and national-system integration.** See our [DHIS2 integration guide](/dhis2-integration-guide).',
      },
      {
        heading: 'Proof: Nexa-Logistix',
        body: 'We built [Nexa-Logistix](/work/nexa-logistix), a full pharmaceutical supply-chain platform covering inventory, cold chain, requisitions, distribution and dispensing. It is built on the same principle as the rest of our [offline-first health software](/offline-first-health-software-development): assume the network is unreliable and design so the work never stops.',
      },
      {
        heading: 'Why offline-first matters for an LMIS',
        body: 'Supply-chain data drives forecasting, resupply and accountability. When facility-level data is missing or back-filled at month end, stockouts and overstocks both get worse and the numbers stop being trustworthy. Offline-first capture means the person who moved the stock records it at the moment they moved it, producing data you can actually plan against. We go deeper in [building software for low-connectivity environments](/building-software-low-connectivity-environments).',
      },
      {
        heading: 'How we build it',
        body: '- **Map the supply chain and workflow** at each tier before designing the data model.\n- **Offline-first capture** for every field action, with resilient background sync.\n- **Reporting and forecasting** that reflects real consumption, not month-end guesses.\n- **Integration adapters** for DHIS2 and other national systems.\n- **Deployment for the field:** low-end devices, intermittent power, low bandwidth.',
      },
    ],
    faq: [
      {
        q: 'Why should an LMIS be offline-first?',
        a: 'Because the last-mile store, where connectivity is worst, is exactly where stock data is created. Offline-first capture lets staff record movements when they happen and sync later, producing complete data you can forecast against.',
      },
      {
        q: 'Can a custom LMIS integrate with DHIS2?',
        a: 'Yes. Data is captured offline, synced to your server, then pushed to DHIS2 through its API with safeguards against duplication and loss.',
      },
    ],
    related: [
      { label: 'DHIS2 integration guide', to: '/dhis2-integration-guide' },
      { label: 'Building software for low-connectivity', to: '/building-software-low-connectivity-environments' },
      { label: 'Offline-first health software (pillar)', to: '/offline-first-health-software-development' },
    ],
  },

  'dhis2-integration-guide': {
    slug: 'dhis2-integration-guide',
    title: 'DHIS2 Integration: A Practical Implementation Guide',
    metaTitle: 'DHIS2 Integration: A Practical Guide | DSB',
    metaDescription:
      'How to integrate your health system with DHIS2 without double-counting or data loss: the API, org units, data elements and the offline-first pattern that works.',
    category: 'Guide · Integration',
    tagline: 'The hard part is not the API. It is not double-counting.',
    accent: ACCENT,
    group: 'Guide',
    updated: UPDATED,
    intro:
      'DHIS2 is the national reporting backbone in many health systems, so sooner or later your EMR, LMIS or surveillance tool has to send data to it. The hard part is doing it without double-counting, without losing records when the connection drops, and without your field tool stalling on a national server.',
    sections: [
      {
        heading: 'The three things you must get right',
        body: '- **Map to DHIS2’s model correctly.** Your data must land on the right org unit, data element and period. Get the mapping wrong and the reports are confidently incorrect.\n- **Never block the field tool on the national server.** Capture offline, sync to your own server, then push to DHIS2 as a background job.\n- **Make the push idempotent.** If a sync retries, the same record must not be counted twice. This is the single most common DHIS2 integration failure.',
      },
      {
        heading: 'Understand the DHIS2 model first',
        body: 'Before any code, get clear on four concepts:\n\n- **Org units:** the facility and administrative hierarchy. Records must resolve to the correct org unit ID, not a name.\n- **Data elements and data sets:** what is reported and in which grouping.\n- **Periods:** daily, weekly or monthly, and aggregation has to match.\n- **Aggregate vs tracker:** summary values or individual records. They use different APIs and the choice shapes everything.',
      },
      {
        heading: 'The integration pattern that works',
        body: 'Capture offline on the device, sync to your own server as the source of truth, then push to DHIS2 via the API on a schedule.\n\n- **Offline capture** keeps the field tool usable with no signal. See [offline-first EMR development](/offline-first-emr-development) and [LMIS development](/lmis-software-development-services).\n- **Your own server in the middle** means you own the source of truth and can replay or correct a push without re-collecting data.\n- **A scheduled, idempotent push** survives flaky connections and never double-counts.',
      },
      {
        heading: 'Avoiding the double-count trap',
        body: 'Double-counting usually comes from one of three places:\n\n- **A retry posting the same payload twice.** Fix with idempotency: a stable key per record so DHIS2 updates instead of inserts.\n- **Two systems reporting the same event.** Deduplicate before the push. We solved exactly this in [RMS](/work/rms-death-tracker), where a death recorded in two registers must count once.\n- **Re-pushing a corrected period without removing the old values.** Decide upfront whether you overwrite or delta, and stick to it.',
      },
    ],
    faq: [
      {
        q: 'How do you integrate a health system with DHIS2 without double-counting?',
        a: 'Capture offline, sync to your own server as the source of truth, then push to DHIS2 with an idempotent job keyed on a stable record ID so retries update rather than duplicate. Deduplicate before the push when more than one system reports the same event.',
      },
      {
        q: 'Should I send aggregate or tracker data to DHIS2?',
        a: 'Aggregate is for summary values per org unit and period. Tracker is for individual records. They use different APIs, so decide early because the choice shapes the whole integration.',
      },
    ],
    related: [
      { label: 'Offline-first EMR development', to: '/offline-first-emr-development' },
      { label: 'LMIS software development services', to: '/lmis-software-development-services' },
      { label: 'Offline-first health software (pillar)', to: '/offline-first-health-software-development' },
    ],
  },

  'building-software-low-connectivity-environments': {
    slug: 'building-software-low-connectivity-environments',
    title: 'Building Software for Low-Connectivity Environments',
    metaTitle: 'Software for Low-Connectivity Environments | DSB',
    metaDescription:
      'The architecture, sync and device decisions behind software that works without reliable internet. A field guide from offline-first health builds.',
    category: 'Guide · Architecture',
    tagline: 'Stop treating the network as a given.',
    accent: ACCENT,
    group: 'Guide',
    updated: UPDATED,
    intro:
      'Software built in a well-connected office assumes the network is there, fast, and reliable, that the device is modern, and that the power stays on. In low-connectivity environments every one of those assumptions breaks. Building for these settings is a set of architecture decisions made early, not an "offline mode" added late.',
    sections: [
      {
        heading: 'Design the network as optional',
        body: 'The central shift is to stop treating the server as the source of truth during use. The device is the source of truth between syncs.\n\n- **Local-first storage.** Read and write to an on-device store so the UI never waits on a round trip.\n- **Queue, do not block.** User actions complete locally and queue for sync, so a dropped connection is invisible.\n- **Sync as a background process** that runs when a connection appears, with retries, never freezing the interface.',
      },
      {
        heading: 'Plan conflict resolution before you build',
        body: 'Two people editing the same record while both offline is not an edge case in the field. Decide the rule up front, per data type: last-write-wins for low-stakes fields, field-level merge where edits can safely coexist, and explicit review for clinical or financial data where a silent overwrite is dangerous. The right rule depends on the workflow, which is why we map it before writing sync code, the same way we do for an [offline-first EMR](/offline-first-emr-development) or an [LMIS](/lmis-software-development-services).',
      },
      {
        heading: 'Build for the device that actually exists',
        body: '- **Progressive web apps** install on low-end phones without an app store and update without a download cycle. For most field tools this beats native.\n- **Keep the bundle small.** Every megabyte is a slow first load on a 2G connection.\n- **Test on old hardware.** A system that is smooth on a new laptop can be unusable on the three-year-old phone your staff actually hold.',
      },
      {
        heading: 'Make sync cheap and resilient',
        body: '- **Sync deltas, not everything.** Send only what changed.\n- **Make every sync idempotent** so retries never duplicate data. This matters doubly when you then push to a national system. See the [DHIS2 integration guide](/dhis2-integration-guide).\n- **Show sync state honestly.** Staff trust a tool that tells them what has and has not synced.',
      },
    ],
    faq: [
      {
        q: 'What is the key decision when building software for low-connectivity environments?',
        a: 'Treating the network as optional. The device becomes the source of truth between syncs, actions complete locally and queue, and reconciliation runs in the background when a connection appears, so the interface never blocks on the network.',
      },
      {
        q: 'Is a progressive web app or a native app better for low-connectivity settings?',
        a: 'A progressive web app is usually better for field tools. It installs on low-end devices without an app store, updates without a download cycle, and can be kept small for slow first loads, while still working fully offline.',
      },
    ],
    related: [
      { label: 'Offline-first EMR development', to: '/offline-first-emr-development' },
      { label: 'LMIS software development services', to: '/lmis-software-development-services' },
      { label: 'DHIS2 integration guide', to: '/dhis2-integration-guide' },
    ],
  },

  'digitise-paper-health-records-rural-clinics': {
    slug: 'digitise-paper-health-records-rural-clinics',
    title: 'How to Digitise Paper Health Records in Rural Clinics',
    metaTitle: 'Digitise Paper Health Records in Clinics | DSB',
    metaDescription:
      'A practical plan for moving paper health records to a digital system in low-connectivity clinics, without stalling the clinic or losing data.',
    category: 'Guide · Migration',
    tagline: 'Going digital is rarely the hard part. The migration is.',
    accent: ACCENT,
    group: 'Guide',
    updated: UPDATED,
    intro:
      'Moving years of paper records across, while the clinic keeps running and the power keeps cutting, is the part that derails projects. Done well, it is gradual, low-risk, and barely interrupts care. Here is a practical plan.',
    sections: [
      {
        heading: 'Decide what to digitise, and what not to',
        body: 'You almost never need to back-capture every historical record on day one.\n\n- **Active patients first.** Digitise records for patients currently under care or likely to return soon.\n- **Going forward, everything is digital.** From go-live, new encounters are captured directly in the system.\n- **Archive the rest.** Older inactive paper can be digitised later, scanned, or kept as paper with a clear index.\n\nTrying to back-capture everything before go-live is the most common way these projects stall.',
      },
      {
        heading: 'Capture offline or you will fail',
        body: 'A rural clinic cannot pause care to wait for a connection. The system has to let staff capture records with no signal and sync later. This is non-negotiable, and it is why we build [offline-first](/offline-first-health-software-development). If the EMR you are considering cannot do this, it is the wrong EMR for this setting. See [the best EMR for small and rural clinics](/best-emr-small-rural-clinics) for how to choose.',
      },
      {
        heading: 'A phased migration that does not stall the clinic',
        body: '- **Map the paper.** What records exist, in what format, and which fields actually matter.\n- **Set up the system offline-first** on the devices staff will use. See [offline-first EMR development](/offline-first-emr-development).\n- **Go live for new encounters first**, so the paper pile stops growing.\n- **Back-capture active patients in the background** during quiet periods, offline.\n- **Run a short parallel period** so staff build trust, then retire paper on a fixed date.\n- **Index and archive the remainder**, deciding per record class.',
      },
      {
        heading: 'Protect data quality during the move',
        body: '- **Validate at entry.** Required fields, sensible ranges and duplicate detection beat cleaning a mess later.\n- **Deduplicate deliberately.** The same patient on three paper cards must become one digital record. Decide the matching rule before you start.\n- **Keep an audit trail** so a questionable record can be traced.\n- **Train on the workflow, not just the buttons.**\n\nWe built [Welbodi](/work/nexa-welbodi), an offline-first EMR, for exactly these clinics, so this plan is shaped by how the system behaves in the field.',
      },
    ],
    faq: [
      {
        q: 'Do I need to digitise all paper records before going live with an EMR?',
        a: 'No. Go live for new encounters first so the paper pile stops growing, back-capture active patients in the background, and decide later whether to digitise, scan or index older inactive records. Back-capturing everything first is the main reason these projects stall.',
      },
      {
        q: 'Why must record capture work offline when digitising a rural clinic?',
        a: 'Because a rural clinic cannot pause care to wait for a connection. Staff must be able to capture records with no signal and sync later, otherwise the system will not be used and the clinic reverts to paper.',
      },
    ],
    related: [
      { label: 'Best EMR for small and rural clinics', to: '/best-emr-small-rural-clinics' },
      { label: 'Offline-first EMR development', to: '/offline-first-emr-development' },
      { label: 'Offline-first health software (pillar)', to: '/offline-first-health-software-development' },
    ],
  },
};
