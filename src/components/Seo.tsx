import { Helmet } from 'react-helmet-async';

export const SITE = 'https://dsbdigital.biz';

type JsonLd = Record<string, unknown>;

interface SeoProps {
  /** Document title (also becomes the browser tab title). */
  title: string;
  /** Meta description for search snippets. */
  description: string;
  /** Path the canonical URL should point to, e.g. '/' or '/work/nexa-welbodi'. */
  canonicalPath: string;
  /** One or more JSON-LD structured-data blocks. */
  jsonLd?: JsonLd | JsonLd[];
}

/**
 * Per-route head management. Owns only the tags that must differ per page —
 * title, description, canonical, and JSON-LD. OG/Twitter are NEVER emitted
 * here: social scrapers do not execute JS, so the static head is the single
 * owner of OG tags. index.html carries the site-default card, and the
 * prerender plugins in vite.config.ts rewrite it per route at build time
 * (case studies, articles, /playbook). Emitting OG from Helmet would only
 * create duplicate tags in the hydrated DOM (see the SEO spec, approach C).
 */
export default function Seo({ title, description, canonicalPath, jsonLd }: SeoProps) {
  const canonical = `${SITE}${canonicalPath}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
