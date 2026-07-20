import { Fragment } from 'react';
import Seo from '@/components/Seo';
import type { LegalDoc } from './legalContent';

/**
 * Renders a legal document (terms/privacy/refunds) from its data in
 * legalContent.ts. The same data feeds the prerender-legal-pages plugin in
 * vite.config.ts, which bakes a matching <noscript> fallback so crawlers that
 * do not run JavaScript still read the policy. Sections are flat h2/p siblings
 * (via Fragment) so the space-y rhythm applies between every element.
 */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <Seo
        title={`${doc.title} | Digital Solution Builders`}
        description={doc.description}
        canonicalPath={doc.canonicalPath}
      />
      <main id="main-content" className="pt-28 md:pt-36 pb-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-2">{doc.title}</h1>
          <p className="text-xs text-muted/70 mb-10">Last updated {doc.updated}</p>
          <div className="space-y-6 text-sm md:text-base text-muted/85 leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-2">
            <p>{doc.intro}</p>
            {doc.sections.map((s) => (
              <Fragment key={s.heading}>
                <h2>{s.heading}</h2>
                <p>{s.body}</p>
              </Fragment>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
