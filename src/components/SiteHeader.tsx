import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { motion as _motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motion = _motion as any;

const links = ['Work', 'Services', 'About', 'Contact'];

/**
 * Global fixed header. On the home page the section links are in-page hash
 * anchors with scroll-spy active states; on sub-pages they become `/#section`
 * so they navigate home first. The scroll-spy observer is a no-op off home.
 */
export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const isHome = useLocation().pathname === '/';

  useEffect(() => {
    const sections = ['work', 'services', 'about', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-foreground rounded flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-background text-xs tracking-wider">DSB</span>
          </div>
          <span className="font-serif text-lg tracking-wide hidden sm:inline">Digital Solution Builders.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => {
            const isActive = isHome && activeSection === link.toLowerCase();
            return (
              <a
                key={link}
                href={hrefFor(link.toLowerCase())}
                className={`text-xs tracking-widest uppercase transition-colors duration-200 group inline-flex items-center min-h-[44px] ${
                  isActive ? 'text-foreground' : 'text-muted hover:text-foreground'
                }`}
              >
                <span className="relative">
                  {link}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-foreground transition-all duration-300 group-hover:[box-shadow:0_0_8px_hsl(var(--accent-green))] ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </span>
              </a>
            );
          })}
          <a
            href={`https://wa.me/23278687787`}
            target="_blank"
            rel="noopener noreferrer"
            className="fx-glow fx-sweep inline-flex items-center gap-2 px-4 py-2 border border-[#25D366]/40 text-[#25D366] text-xs tracking-widest uppercase hover:bg-[#25D366]/10"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">
              {links.map((link) => (
                <a
                  key={link}
                  href={hrefFor(link.toLowerCase())}
                  onClick={() => setOpen(false)}
                  className="text-sm tracking-widest uppercase text-muted hover:text-foreground transition-colors min-h-[44px] flex items-center"
                >
                  {link}
                </a>
              ))}
              <a
                href="https://wa.me/23278687787"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-[#25D366] min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
