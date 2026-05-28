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
 * title, description, canonical, and JSON-LD. OG/Twitter stay static in
 * index.html as the shared social card (see the SEO spec, approach C).
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
