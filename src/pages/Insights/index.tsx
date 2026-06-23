import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import Seo, { SITE } from '../../components/Seo';
import { articles, ARTICLE_ORDER, INSIGHTS_META } from '../Article/articles';

const TITLE = INSIGHTS_META.title;
const DESCRIPTION = INSIGHTS_META.description;

export default function InsightsPage() {
  const ordered = ARTICLE_ORDER.map((slug) => articles[slug]).filter(Boolean);
  const [pillar, ...rest] = ordered;

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: ordered.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/${a.slug}`,
      name: a.title,
    })),
  };

  return (
    <>
      <Seo title={TITLE} description={DESCRIPTION} canonicalPath="/insights" jsonLd={itemListLd} />

      <main id="main-content" className="pt-28 md:pt-36 pb-24">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted/50 hover:text-foreground transition-colors duration-200 min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>

        <header className="max-w-5xl mx-auto px-6 md:px-12 pt-6">
          <p className="text-xs tracking-[0.3em] uppercase mb-3 text-muted/50">Insights</p>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight leading-tight mb-4 text-balance">
            Building offline-first health software
          </h1>
          <p className="text-sm md:text-base text-muted/70 leading-relaxed max-w-2xl">
            Field-tested guidance on EMRs, logistics systems, DHIS2 integration and clinic
            digitisation for low-connectivity settings, drawn from real builds.
          </p>
        </header>

        {/* Pillar feature */}
        {pillar && (
          <div className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
            <Link
              to={`/${pillar.slug}`}
              className="fx-beam fx-lift group block border border-border/60 p-6 md:p-8 hover:border-border"
              style={{ borderLeft: `2px solid ${pillar.accent}` }}
            >
              <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: pillar.accent }}>
                Start here · {pillar.category}
              </p>
              <h2 className="font-serif text-2xl md:text-4xl tracking-tight mb-3 text-balance">
                {pillar.title}
              </h2>
              <p className="text-sm md:text-base text-muted/70 leading-relaxed max-w-3xl">{pillar.intro}</p>
              <span className="inline-flex items-center gap-2 mt-5 text-xs tracking-widest uppercase text-muted/60 group-hover:text-foreground transition-colors duration-200">
                Read the guide
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        )}

        {/* The rest */}
        <div className="max-w-5xl mx-auto px-6 md:px-12 mt-8 grid gap-4 md:grid-cols-2">
          {rest.map((a) => (
            <Link
              key={a.slug}
              to={`/${a.slug}`}
              className="fx-beam fx-lift group block border border-border/50 p-6 hover:border-border"
            >
              <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: a.accent }}>
                {a.category}
              </p>
              <h3 className="fx-text font-serif text-xl md:text-2xl tracking-tight mb-2 text-balance">{a.title}</h3>
              <p className="text-sm text-muted/60 leading-relaxed line-clamp-3">{a.tagline}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
