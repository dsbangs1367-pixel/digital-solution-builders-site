import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Minimal, dependency-free renderer for the article body subset used in
 * articles.ts. It recognises only:
 *   - paragraphs (blocks separated by a blank line)
 *   - unordered lists (every line in a block starts with "- ")
 *   - inline links [label](href): internal hrefs ("/...") render as a
 *     React Router <Link>, external (http) as a new-tab <a>
 *   - inline **bold**
 * Everything else is treated as plain text. No raw HTML is ever injected,
 * so the content stays safe under the site CSP.
 */

// Module-level for one allocation. Because it is global (`g`) and reused, every
// call MUST reset `lastIndex` before iterating (see below) — this renderer is
// synchronous and single-threaded, so that reset is sufficient and safe.
const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

// Only these link schemes become anchors; anything else (e.g. javascript:,
// data:, mailto:, tel:) renders as plain text. Content is author-controlled,
// so this is defence-in-depth for future edits, not a live XSS fix.
function safeHref(href: string): 'internal' | 'external' | null {
  if (href.startsWith('/')) return 'internal';
  if (/^https?:\/\//i.test(href)) return 'external';
  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let match: RegExpExecArray | null;

  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));

    if (match[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{match[1]}</strong>);
    } else {
      const label = match[2];
      const href = match[3];
      const kind = safeHref(href);
      const linkClass =
        'underline decoration-border/60 underline-offset-4 hover:text-foreground transition-colors duration-200';
      if (kind === 'internal') {
        nodes.push(
          <Link key={`${keyPrefix}-l${i}`} to={href} className={linkClass}>
            {label}
          </Link>,
        );
      } else if (kind === 'external') {
        nodes.push(
          <a
            key={`${keyPrefix}-a${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {label}
          </a>,
        );
      } else {
        // Unsupported/unsafe scheme: render the label as plain text, no link.
        nodes.push(label);
      }
    }
    last = INLINE.lastIndex;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Prose({ body }: { body: string }) {
  const blocks = body.trim().split(/\n\n+/);

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, b) => {
        // List detection is all-or-nothing: a block is a list only if EVERY line
        // starts with "- ". A block mixing prose and list lines renders as a
        // paragraph, so keep prose and lists in separate blank-line-separated blocks.
        const lines = block.split('\n');
        const isList = lines.length > 0 && lines.every((l) => l.startsWith('- '));

        if (isList) {
          return (
            <ul key={`ul-${b}`} className="flex flex-col gap-2 pl-5 list-disc marker:text-muted/40">
              {lines.map((line, li) => (
                <li key={`li-${b}-${li}`} className="text-sm md:text-base text-muted/70 leading-relaxed">
                  {renderInline(line.slice(2), `ul-${b}-${li}`)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${b}`} className="text-sm md:text-base text-muted/70 leading-relaxed">
            {renderInline(block.replace(/\n/g, ' '), `p-${b}`)}
          </p>
        );
      })}
    </div>
  );
}
