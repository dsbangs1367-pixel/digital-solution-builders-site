import { ReactNode } from 'react';
import Seo from '@/components/Seo';

export default function LegalPage({ title, description, canonicalPath, updated, children }: {
  title: string; description: string; canonicalPath: string; updated: string; children: ReactNode;
}) {
  return (
    <>
      <Seo title={`${title} | Digital Solution Builders`} description={description} canonicalPath={canonicalPath} />
      <main id="main-content" className="pt-28 md:pt-36 pb-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-2">{title}</h1>
          <p className="text-xs text-muted/70 mb-10">Last updated {updated}</p>
          <div className="space-y-6 text-sm md:text-base text-muted/85 leading-relaxed [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-2">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
