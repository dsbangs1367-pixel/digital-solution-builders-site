import { useState, type ReactElement } from 'react';
import { Check, Link as LinkIcon } from 'lucide-react';
import { trackEvent } from '@/lib/track';

type ShareNetwork = 'linkedin' | 'x' | 'facebook' | 'instagram' | 'copy_link';

interface ShareButtonsProps {
  /** Absolute URL of the page being shared. */
  url: string;
  /** Short title used as the share text. */
  title: string;
  /** Optional longer text for the native share sheet. */
  summary?: string;
}

type IconProps = { className?: string };

// Brand glyphs as inline SVG — lucide-react dropped its brand/logo icons.
// Paths from Simple Icons (CC0). Single-path, 24×24, currentColor fill.
function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function XIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

const BTN =
  'inline-flex items-center justify-center w-11 h-11 border border-border/60 text-muted/60 ' +
  'hover:text-foreground hover:border-foreground/40 transition-colors duration-200';

export default function ShareButtons({ url, title, summary }: ShareButtonsProps) {
  const [notice, setNotice] = useState<string | null>(null);

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Derive a case-study slug from a /work/<slug> URL so the admin dashboard can
  // see which case study gets shared most. Returns undefined for the home URL.
  const slug = (() => {
    try {
      const segs = new URL(url).pathname.split('/').filter(Boolean);
      return segs[0] === 'work' && segs[1] ? segs[1] : undefined;
    } catch {
      return undefined;
    }
  })();

  const fireShare = (network: ShareNetwork) => {
    trackEvent('share', slug ? { network, slug } : { network });
  };

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  // Async Clipboard API with an execCommand fallback for older WebViews
  // (still common on low-end Android in our target markets).
  const writeToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      let el: HTMLTextAreaElement | null = null;
      try {
        el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.top = '-9999px';
        el.style.left = '-9999px';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        return document.execCommand('copy');
      } catch {
        return false;
      } finally {
        if (el && document.body.contains(el)) document.body.removeChild(el);
      }
    }
  };

  const copy = async (msg: string) => {
    if (await writeToClipboard(url)) flash(msg);
  };

  // Instagram has no web share-intent URL. On mobile, hand off to the native
  // share sheet (which lists Instagram); on desktop, copy the link to paste.
  const handleInstagram = async () => {
    fireShare('instagram');
    if (canNativeShare) {
      try {
        await navigator.share({ title, text: summary, url });
        return;
      } catch {
        // User dismissed the sheet, or it failed — fall through to copy.
      }
    }
    await copy('Link copied — paste it into Instagram');
  };

  const networks: Array<{
    name: string;
    track: ShareNetwork;
    href: string;
    Icon: (p: IconProps) => ReactElement;
  }> = [
    {
      name: 'LinkedIn',
      track: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      Icon: LinkedInIcon,
    },
    {
      name: 'X',
      track: 'x',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      Icon: XIcon,
    },
    {
      name: 'Facebook',
      track: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      Icon: FacebookIcon,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-xs tracking-widest uppercase text-muted/50 mr-1">Share</span>

      {networks.map(({ name, track, href, Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${name}`}
          title={`Share on ${name}`}
          className={BTN}
          onClick={() => fireShare(track)}
        >
          <Icon className="w-[18px] h-[18px]" />
        </a>
      ))}

      <button
        type="button"
        onClick={handleInstagram}
        aria-label="Share to Instagram"
        title="Share to Instagram"
        className={BTN}
      >
        <InstagramIcon className="w-[18px] h-[18px]" />
      </button>

      <button
        type="button"
        onClick={() => {
          fireShare('copy_link');
          copy('Link copied');
        }}
        aria-label="Copy link"
        title="Copy link"
        className={BTN}
      >
        {notice?.startsWith('Link copied') ? (
          <Check className="w-[18px] h-[18px]" />
        ) : (
          <LinkIcon className="w-[18px] h-[18px]" />
        )}
      </button>

      {notice && (
        <span role="status" className="text-xs text-muted/60 ml-1">
          {notice}
        </span>
      )}
    </div>
  );
}
