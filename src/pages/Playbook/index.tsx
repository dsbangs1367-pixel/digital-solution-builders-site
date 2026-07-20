import { useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import Seo from '@/components/Seo';
import { trackEvent } from '@/lib/track';
import PlaybookLeadForm from './PlaybookLeadForm';
import {
  HERO,
  STORY,
  CHAPTERS,
  TEMPLATES,
  WHO,
  COVENANT,
  PRICE,
  FAQS,
  BIO,
  META_TITLE,
  OG_TITLE,
  CHECKOUT_URL,
  CTA_BUY,
} from './content';

/**
 * The hero secondary CTA and the price-block button. Pre-launch (CHECKOUT_URL
 * empty) both render the outline "notify me" button that opens the form. Once
 * CHECKOUT_URL is set they become a "buy" link that opens Paddle checkout in a
 * new tab: buyVariant="primary" gives the price block the prominent green fill,
 * "outline" keeps the hero secondary quiet under the free-guide primary CTA.
 */
function SecondaryCta({
  onNotify,
  buyVariant,
  className = '',
}: {
  onNotify: () => void;
  buyVariant: 'primary' | 'outline';
  className?: string;
}) {
  const base = `min-h-[44px] px-6 text-xs font-medium tracking-wide ${className}`.trim();
  const outline =
    'border border-border/60 text-foreground/80 hover:text-foreground hover:border-foreground/40 transition-colors duration-200';
  const primary =
    'fx-sweep fx-glow bg-[hsl(var(--accent-green))] text-background hover:opacity-90 transition-opacity duration-200';

  if (CHECKOUT_URL) {
    return (
      <a
        href={CHECKOUT_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('playbook_checkout_click')}
        className={`${base} ${buyVariant === 'primary' ? primary : outline} inline-flex items-center`}
      >
        {CTA_BUY}
      </a>
    );
  }
  return (
    <button type="button" onClick={onNotify} className={`${base} ${outline}`}>
      {HERO.ctaNotify}
    </button>
  );
}

const KICKER = 'text-xs tracking-[0.3em] uppercase mb-3 text-muted/70';
const SHELL = 'max-w-5xl mx-auto px-6 md:px-12';

/** Scroll reveal. Same idiom as Home's ProjectCard: useInView once + useReducedMotion,
 *  style-driven fade/rise, observation root expanded so the reveal fires before the
 *  block scrolls into view (keeps first paint and headless captures intact). */
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: '0px 0px 25% 0px' });
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion || inView;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: reveal ? 1 : 0,
        transform: reveal ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
    >
      {children}
    </div>
  );
}

export default function PlaybookPage() {
  const [mode, setMode] = useState<'guide' | 'notify'>('guide');
  const reduceMotion = useReducedMotion();
  const formSectionRef = useRef<HTMLElement>(null);

  function goToForm(m: 'guide' | 'notify') {
    setMode(m);
    document.getElementById('get-started')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    // Move keyboard/AT focus into the form region without disturbing the scroll.
    formSectionRef.current?.focus({ preventScroll: true });
  }

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: OG_TITLE,
    description: HERO.headline,
    brand: { '@type': 'Brand', name: 'Digital Solution Builders' },
    offers: {
      '@type': 'Offer',
      price: '29',
      priceCurrency: 'USD',
      availability: 'https://schema.org/PreOrder',
    },
  };

  return (
    <>
      {/* OG/Twitter tags are baked into dist/playbook/index.html by the
          prerender-playbook-og plugin in vite.config.ts (book card, 1200x630).
          Seo deliberately emits none, so the static head stays the single owner. */}
      <Seo
        title={META_TITLE}
        description={HERO.headline}
        canonicalPath="/playbook"
        jsonLd={productLd}
      />

      <main id="main-content" className="pb-24">
        {/* Hero: book-cover treatment */}
        <section className="min-h-[88vh] flex flex-col justify-center pt-28 md:pt-36">
          <Reveal className={`${SHELL} w-full`}>
            <p className="font-serif text-sm md:text-base tracking-[0.3em] text-foreground/80">
              {HERO.wordmark}
            </p>
            <p className="text-xs tracking-[0.3em] uppercase text-muted/70 mt-2">
              Freetown, Sierra Leone
            </p>
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight mt-10 text-balance">
              {HERO.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <div className="w-12 h-[3px] bg-[hsl(var(--accent-green))] mt-8" />
            <p className="text-base md:text-lg leading-relaxed mt-6 max-w-2xl">{HERO.headline}</p>
            <p className="text-sm text-muted/85 leading-relaxed mt-4 max-w-2xl">{HERO.subhead}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                type="button"
                onClick={() => goToForm('guide')}
                className="fx-sweep fx-glow min-h-[44px] px-6 bg-[hsl(var(--accent-green))] text-background text-xs font-medium tracking-wide hover:opacity-90 transition-opacity duration-200"
              >
                {HERO.ctaGuide}
              </button>
              <SecondaryCta onNotify={() => goToForm('notify')} buyVariant="outline" />
            </div>
          </Reveal>
        </section>

        {/* Story */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>{STORY.kicker}</h2>
            <div className="max-w-2xl space-y-4">
              {STORY.paragraphs.map((p) => (
                <p key={p} className="text-sm md:text-base text-muted/85 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Chapters: echoes the book's table of contents */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>What is inside</h2>
            <ol className="border-t border-border/40">
              {CHAPTERS.map((c) => (
                <li key={c.n} className="flex gap-6 py-5 border-b border-border/40">
                  <span className="font-serif text-lg md:text-xl text-[hsl(var(--accent-green))] w-8 shrink-0">
                    {c.n}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl tracking-tight text-balance">
                      {c.title}
                    </h3>
                    <p className="text-sm text-muted/85 leading-relaxed mt-1 max-w-2xl">{c.blurb}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* Templates */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>The five templates</h2>
            <ul className="grid gap-x-12 gap-y-8 md:grid-cols-2 mt-2">
              {TEMPLATES.map((t) => (
                <li key={t.name}>
                  <h3 className="font-serif text-lg md:text-xl tracking-tight">{t.name}</h3>
                  <p className="text-sm text-muted/85 leading-relaxed mt-1">{t.blurb}</p>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        {/* Who it is for */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>Who this is for</h2>
            <div className="grid gap-12 md:grid-cols-2 mt-2">
              <div>
                <h3 className="font-serif text-xl md:text-2xl tracking-tight mb-4">Who it is for</h3>
                <ul className="space-y-4">
                  {WHO.forYou.map((item) => (
                    <li key={item} className="text-sm text-muted/85 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-xl md:text-2xl tracking-tight mb-4">Who it is not for</h3>
                <ul className="space-y-4">
                  {WHO.notForYou.map((item) => (
                    <li key={item} className="text-sm text-muted/85 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Covenant: quiet emphasis via a larger serif lead line */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>{COVENANT.kicker}</h2>
            <p className="font-serif text-xl md:text-2xl leading-relaxed tracking-tight max-w-2xl text-balance">
              {COVENANT.paragraphs[0]}
            </p>
            <div className="max-w-2xl space-y-4 mt-4">
              {COVENANT.paragraphs.slice(1).map((p) => (
                <p key={p} className="text-sm md:text-base text-muted/85 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Price */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>Price</h2>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <p className="font-serif text-5xl md:text-6xl tracking-tight">{PRICE.amount}</p>
              <p className="text-sm text-muted/85">{PRICE.note}</p>
            </div>
            <ul className="space-y-2 mt-6 max-w-2xl">
              {PRICE.includes.map((line) => (
                <li key={line} className="text-sm text-muted/85 leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
            <SecondaryCta onNotify={() => goToForm('notify')} buyVariant="primary" className="mt-8" />
          </Reveal>
        </section>

        {/* FAQ: native disclosure, no JS accordion */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>Questions</h2>
            <div className="border-t border-border/50">
              {FAQS.map((f) => (
                <details key={f.q} className="group border-b border-border/50">
                  <summary className="flex min-h-[44px] items-center justify-between gap-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="font-serif text-lg md:text-xl tracking-tight pr-6 group-hover:text-foreground transition-colors">
                      {f.q}
                    </h3>
                    <span className="font-serif text-2xl text-muted/70 group-open:rotate-45 group-hover:text-[hsl(var(--accent-green))] transition-all duration-300 select-none">
                      +
                    </span>
                  </summary>
                  <p className="text-sm text-muted/85 leading-relaxed pb-6 max-w-3xl">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Bio */}
        <section className={`${SHELL} mt-24 md:mt-32`}>
          <Reveal>
            <h2 className={KICKER}>{BIO.kicker}</h2>
            <div className="max-w-2xl space-y-4">
              {BIO.paragraphs.map((p) => (
                <p key={p} className="text-sm md:text-base text-muted/85 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Lead form (renders the #get-started anchor itself). tabIndex -1 lets
            goToForm move programmatic focus here for keyboard/AT users. */}
        <section ref={formSectionRef} tabIndex={-1} className={`${SHELL} mt-24 md:mt-32 outline-none`}>
          <Reveal>
            <PlaybookLeadForm mode={mode} onModeChange={setMode} />
          </Reveal>
        </section>
      </main>
    </>
  );
}
