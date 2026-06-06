import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import Seo, { SITE } from '../../components/Seo';
import ShareButtons from '../../components/ShareButtons';
import Prose from './prose';
import { articles } from './articles';

export default function ArticlePage({ slug: slugProp }: { slug?: string } = {}) {
  const params = useParams();
  const slug = slugProp ?? params.slug;
  const article = slug ? articles[slug] : undefined;

  // Unknown slug → send to the insights hub rather than render an empty shell.
  if (!article) return <Navigate to="/insights" replace />;

  const url = `${SITE}/${article.slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.metaDescription,
    url,
    mainEntityOfPage: url,
    datePublished: article.updated,
    dateModified: article.updated,
    author: {
      '@type': 'Organization',
      name: 'Digital Solution Builders',
      url: `${SITE}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Digital Solution Builders',
      url: `${SITE}/`,
    },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE}/insights` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  };

  return (
    <>
      <Seo
        title={article.metaTitle}
        description={article.metaDescription}
        canonicalPath={`/${article.slug}`}
        jsonLd={[articleLd, faqLd, breadcrumbLd]}
      />

      <main id="main-content" className="pt-28 md:pt-36 pb-24">
        {/* Back link */}
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <Link
            to="/insights"
            className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted/50 hover:text-foreground transition-colors duration-200 min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All insights
          </Link>
        </div>

        {/* Header */}
        <header className="max-w-3xl mx-auto px-6 md:px-12 pt-6">
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: article.accent }}>
            {article.category}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-tight mb-3 text-balance">
            {article.title}
          </h1>
          <p className="font-serif italic text-muted/60 text-lg md:text-xl mb-8">{article.tagline}</p>
          <p className="text-base md:text-lg text-muted/80 leading-relaxed">{article.intro}</p>

          <div className="mt-8">
            <ShareButtons url={url} title={article.title} summary={article.intro} />
          </div>
        </header>

        {/* Body sections */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 mt-14 md:mt-20 flex flex-col gap-12">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-4">{section.heading}</h2>
              <Prose body={section.body} />

              {section.table && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        {section.table.headers.map((h) => (
                          <th
                            key={h}
                            className="text-left font-medium text-muted/80 border-b border-border/60 py-2 pr-4 align-top"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className="text-muted/70 border-b border-border/30 py-2 pr-4 align-top leading-relaxed"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* FAQ */}
        {article.faq.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 md:px-12 mt-16 md:mt-20">
            <h2 className="font-serif text-2xl md:text-3xl tracking-tight mb-6">Frequently asked questions</h2>
            <div className="flex flex-col gap-6">
              {article.faq.map((f) => (
                <div key={f.q}>
                  <h3 className="text-base font-medium mb-2">{f.q}</h3>
                  <p className="text-sm md:text-base text-muted/70 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {article.related.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 md:px-12 mt-16">
            <p className="text-xs tracking-widest uppercase text-muted/50 mb-4">Related</p>
            <ul className="flex flex-col gap-2">
              {article.related.map((r) => (
                <li key={r.to}>
                  <Link
                    to={r.to}
                    className="inline-flex items-center gap-2 text-sm text-muted/80 hover:text-foreground transition-colors duration-200"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" style={{ color: article.accent }} />
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 mt-20 pt-12 border-t border-border/50 flex flex-wrap items-center gap-6">
          <a
            href="/#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90 transition-colors duration-200"
          >
            Start a build
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://wa.me/23278687787?text=Hi%20DSB%20Digital%2C%20I%27d%20like%20to%20talk%20about%20a%20health%20software%20build."
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest uppercase text-muted/50 hover:text-foreground transition-colors duration-200"
          >
            Or message on WhatsApp
          </a>
        </div>
      </main>
    </>
  );
}
