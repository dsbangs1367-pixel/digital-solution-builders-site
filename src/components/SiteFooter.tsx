import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/track';

/** Global footer + floating WhatsApp CTA, shared across every route. */
export default function SiteFooter() {
  return (
    <>
      <footer className="border-t border-border/50 px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted/40">
          <p className="font-serif">Digital Solution Builders. — Digital Product Development</p>
          <div className="flex items-center gap-6">
            <Link to="/insights" className="transition-all duration-200 hover:text-muted/70 hover:[text-shadow:0_0_10px_hsl(var(--accent-green)/0.45)]">
              Insights
            </Link>
            <Link to="/playbook" className="transition-all duration-200 hover:text-muted/70 hover:[text-shadow:0_0_10px_hsl(var(--accent-green)/0.45)]">
              Playbook
            </Link>
            <a
              href="mailto:danielbangs@dsbdigital.biz"
              onClick={() => trackEvent('contact_email')}
              className="transition-all duration-200 hover:text-muted/70 hover:[text-shadow:0_0_10px_hsl(var(--accent-green)/0.45)]"
            >
              Email
            </a>
            <a
              href="https://www.linkedin.com/in/daniel-bangura-9ba047bb/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('contact_linkedin')}
              className="transition-all duration-200 hover:text-muted/70 hover:[text-shadow:0_0_10px_hsl(var(--accent-green)/0.45)]"
            >
              LinkedIn
            </a>
            <a
              href="https://wa.me/23278687787"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('contact_whatsapp')}
              className="text-[#25D366]/60 hover:text-[#25D366] transition-colors duration-200"
            >
              WhatsApp
            </a>
          </div>
          <p className="text-muted/30">Anonymous, cookie-free visit analytics for the site owner.</p>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
          <p className="flex gap-4">
            <Link to="/terms" className="hover:text-muted/70">Terms</Link>
            <Link to="/privacy" className="hover:text-muted/70">Privacy</Link>
            <Link to="/refunds" className="hover:text-muted/70">Refunds</Link>
          </p>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/23278687787?text=Hi%20DSB%20Digital%2C%20I%27d%20like%20to%20start%20a%20project!"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={() => trackEvent('contact_whatsapp')}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] text-white pl-4 pr-5 py-3 shadow-lg hover:bg-[#20bd5a] hover:scale-105 hover:shadow-[0_0_30px_-2px_rgba(37,211,102,0.65)] active:scale-95 transition-all duration-200 group overflow-hidden"
        style={{ borderRadius: '999px' }}
      >
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 pointer-events-none" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-10 pointer-events-none" style={{ animationDelay: '0.4s' }} />
        <MessageCircle className="w-5 h-5 flex-shrink-0 relative z-10" />
        <span className="text-xs font-medium tracking-wide hidden sm:block relative z-10">Quick question? Chat now</span>
      </a>
    </>
  );
}
