import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import Seo, { SITE } from '../../components/Seo';
import ShareButtons from '../../components/ShareButtons';
import { caseStudies } from './caseStudies';

export default function CaseStudyPage() {
  const { slug } = useParams();
  const cs = slug ? caseStudies[slug] : undefined;

  // Unknown slug → send back home rather than render an empty shell.
  if (!cs) return <Navigate to="/" replace />;

  const url = `${SITE}/work/${cs.slug}`;
  const creativeWorkLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: cs.title,
    headline: cs.title,
    description: cs.metaDescription,
    url,
    image: `${SITE}${cs.heroImage}`,
    about: cs.category,
    creator: {
      '@type': 'Organization',
      name: 'Digital Solution Builders',
      url: `${SITE}/`,
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Work', item: `${SITE}/#work` },
      { '@type': 'ListItem', position: 3, name: cs.title, item: url },
    ],
  };

  return (
    <>
      <Seo
        title={cs.metaTitle}
        description={cs.metaDescription}
        canonicalPath={`/work/${cs.slug}`}
        jsonLd={[creativeWorkLd, breadcrumbLd]}
      />

      <main id="main-content" className="pt-28 md:pt-36 pb-24">
        {/* Back link */}
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <a
            href="/#work"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted/50 hover:text-foreground transition-colors duration-200 min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to work
          </a>
        </div>

        {/* Hero */}
        <header className="max-w-5xl mx-auto px-6 md:px-12 pt-6">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: cs.accent }}>
            {cs.category}
          </p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight mb-3 text-balance">
            {cs.title}
          </h1>
          <p className="font-serif italic text-muted/60 text-lg md:text-xl mb-8">{cs.tagline}</p>
          <p className="text-sm md:text-base text-muted/70 leading-relaxed max-w-3xl">{cs.intro}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10 max-w-xl">
            {cs.stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-2xl md:text-3xl tracking-tight" style={{ color: cs.accent }}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted/50 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Live link + services */}
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <a
              href={cs.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="fx-sweep fx-glow inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90"
            >
              Visit live site — {cs.liveLabel}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            {cs.services.map((s) => (
              <span
                key={s}
                className="fx-glow text-xs tracking-wider uppercase px-3 py-1.5 border border-border/60 text-muted/60"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="mt-8">
            <ShareButtons url={url} title={cs.title} summary={cs.intro} />
          </div>
        </header>

        {/* Hero image */}
        <div className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
          <div className="fx-sweep overflow-hidden" style={{ borderLeft: `2px solid ${cs.accent}` }}>
            <img
              src={cs.heroImage}
              alt={cs.heroImageAlt}
              decoding="async"
              className="w-full block transition-transform duration-700 ease-out hover:scale-[1.03]"
            />
          </div>
        </div>

        {/* Narrative sections */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 mt-16 md:mt-24 flex flex-col gap-12">
          {cs.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-3">{section.heading}</h2>
              <p className="text-sm md:text-base text-muted/70 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 mt-20 pt-12 border-t border-border/50 flex flex-wrap items-center gap-6">
          <a
            href="/#contact"
            className="fx-sweep fx-glow inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90"
          >
            Build something like this
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <Link
            to="/"
            className="text-xs tracking-widest uppercase text-muted/50 hover:text-foreground transition-colors duration-200"
          >
            ← All work
          </Link>
        </div>
      </main>
    </>
  );
}
