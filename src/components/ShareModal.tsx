import { useState, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { motion as _motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, RefreshCw, Twitter, Facebook, Linkedin } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motion = _motion as any;

export interface ShareProject {
  title: string;
  tagline: string;
  category: string;
  url: string;
  accent: string;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ShareProject;
}

function generateCopies(p: ShareProject): string[] {
  const link = p.url === '#' ? 'https://dsbdigital.wegic.app' : p.url;
  return [
    `🚀 Just shipped: ${p.title} — "${p.tagline}"\n\nBuilt from concept to MVP in 72 hours. This is what fast looks like.\n\n${link}\n\n#DSBDigital #WebDesign #MVP #DigitalProduct`,
    `✨ New project live: ${p.title}\n\n${p.tagline}\n\nNo meetings. No months. Just results.\n\n${link}\n\n#ProductDesign #UIDesign #TechAfrica`,
    `💻 Case study drop: ${p.title}\n\nFrom a brief to a fully working product in under 72 hours.\n\n${link}\n\n#DSBDigital #WebDev #Startup #MVPBuild`,
    `🔥 ${p.title} is live.\n\n"${p.tagline}"\n\nDesign meets speed. Built with AI platforms & real craft.\n\n${link}\n\n#DigitalDesign #AIDesign #WebDesign`,
    `🌍 Proud to have built ${p.title} — solving real problems for real people.\n\n${p.tagline}\n\n${link}\n\n#DSBDigital #MadeInAfrica #TechForGood`,
    `⚡ Speed + craft = ${p.title}\n\nConcept to MVP. 72 hours. Zero compromises.\n\n${link}\n\n#BuildFast #WebDesign #Startup #DSBDigital`,
    `🎯 Client win: ${p.title}\n\n${p.tagline}\n\nDigital Solution Builders builds working products — not just mockups.\n\n${link}\n\n#ClientWork #UIDesign #MVP #DigitalAgency`,
    `👀 Have you seen ${p.title} yet?\n\n${p.tagline}\n\nFull case study at the link.\n\n${link}\n\n#PortfolioWork #WebDesign #DSBDigital`,
    `🏗️ Built this: ${p.title}\n\nFrom brief to live product in 72 hours. Real screens. Real users.\n\n${link}\n\n#MVPLaunch #ProductDesign #FreelanceDesigner`,
    `💡 The idea was simple. The execution? Premium.\n\n${p.title} — "${p.tagline}"\n\n${link}\n\n#DesignExecution #UIDesign #DSBDigital`,
    `📱 New digital product: ${p.title}\n\nBuilt end-to-end on AI platforms. Shipped in record time.\n\n${link}\n\n#AIDesign #WebApp #DigitalProduct #DSBDigital`,
    `🎨 Design that works. ${p.title}.\n\n${p.tagline}\n\nFunctional, fast, and ready for the real world.\n\n${link}\n\n#UXDesign #DSBDigital #ProductLaunch`,
    `🌟 Another one for the portfolio — ${p.title}\n\n${p.tagline}\n\nBuilt with Lovable, Wegic & Claude. Shipped in 72 hrs.\n\n${link}\n\n#AIPlatforms #WebDesign #BuildInPublic`,
    `🤝 Proof that speed and quality can co-exist.\n\n${p.title}: "${p.tagline}"\n\n72 hours from concept to MVP.\n\n${link}\n\n#FreelanceDesign #MVPBuilder #DSBDigital`,
    `🔑 Build with the right tools, move with intention.\n\n${p.title} — now live.\n\n${link}\n\n#DSBDigital #DigitalTransformation #AITools`,
    `📣 Digital Solution Builders portfolio update!\n\nAdding ${p.title} — "${p.tagline}"\n\n${link}\n\n#PortfolioUpdate #DSBDigital #NewProject`,
    `🧠 What does a 72-hour MVP actually look like?\n\nThis: ${p.title} — "${p.tagline}"\n\nLive, working, designed with intent.\n\n${link}\n\n#MVPDesign #RapidPrototype #DSBDigital`,
    `💼 Case study: ${p.title}\n\nCategory: ${p.category}\n"${p.tagline}"\nDelivery: Under 72 hours.\n\n${link}\n\n#DSBDigital #CaseStudy #UXDesign`,
    `🚀 From zero to live: ${p.title}.\n\nHave an idea and need it built fast? This is what Digital Solution Builders does.\n\n${link}\n\n#HireADesigner #MVPBuilder #DSBDigital`,
    `🌐 The internet just got better.\n\n${p.title} is live — "${p.tagline}"\n\nFast. Premium. Purposeful.\n\n${link}\n\n#DSBDigital #WebDesign #BuildSomethingGreat`,
  ];
}

export default function ShareModal({ isOpen, onClose, project }: ShareModalProps) {
  const copies = generateCopies(project);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState<'text' | 'link' | null>(null);
  const [shuffling, setShuffling] = useState(false);

  const currentCopy = copies[currentIndex];
  const shareUrl = project.url === '#' ? 'https://dsbdigital.wegic.app' : project.url;

  const shuffle = useCallback(() => {
    setShuffling(true);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        let next = prev;
        while (next === prev) next = Math.floor(Math.random() * copies.length);
        return next;
      });
      setShuffling(false);
    }, 200);
  }, [copies.length]);

  const copyToClipboard = useCallback(async (type: 'text' | 'link') => {
    const val = type === 'text' ? currentCopy : shareUrl;
    try {
      await navigator.clipboard.writeText(val);
      setCopied(type);
      setTimeout(() => setCopied(null), 2200);
    } catch {
      // Fallback for browsers without Clipboard API
      let el: HTMLTextAreaElement | null = null;
      try {
        el = document.createElement('textarea');
        el.value = val;
        el.style.position = 'fixed';
        el.style.top = '-9999px';
        el.style.left = '-9999px';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.focus();
        el.select();
        const ok = document.execCommand('copy');
        if (ok) {
          setCopied(type);
          setTimeout(() => setCopied(null), 2200);
        }
      } finally {
        if (el && document.body.contains(el)) {
          document.body.removeChild(el);
        }
      }
    }
  }, [currentCopy, shareUrl]);

  const enc = (s: string) => encodeURIComponent(s);
  const platforms = [
    {
      label: 'Twitter',
      icon: Twitter,
      color: '#1d9bf0',
      href: `https://twitter.com/intent/tweet?text=${enc(currentCopy.slice(0, 280))}`,
    },
    {
      label: 'Facebook',
      icon: Facebook,
      color: '#1877f2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      color: '#0a66c2',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm cursor-pointer"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 bottom-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg z-[70] bg-[#111111] border border-white/[0.08] shadow-2xl overflow-hidden"
          >
            {/* Project accent stripe */}
            <div className="h-[2px] w-full" style={{ backgroundColor: project.accent }} />

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/[0.06]">
              <div>
                <p className="text-[10px] tracking-[0.35em] uppercase text-white/25 mb-1">Share this project</p>
                <p className="font-serif text-lg tracking-tight text-white leading-snug">{project.title}</p>
                <p className="text-xs text-white/30 italic mt-0.5">{project.tagline}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/25 hover:text-white/70 transition-colors duration-200 p-1 -mr-1 mt-1 flex-shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Caption */}
            <div className="px-6 pt-5">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/25">Caption</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/15 font-mono">{currentIndex + 1} / {copies.length}</span>
                  <button
                    onClick={shuffle}
                    className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-white/30 hover:text-white/70 transition-colors duration-200"
                  >
                    <RefreshCw className={`w-3 h-3 ${shuffling ? 'animate-spin' : ''} transition-transform`} />
                    Shuffle
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className="relative bg-white/[0.03] border border-white/[0.07] p-4 group"
                >
                  <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line pr-7 select-all">
                    {currentCopy}
                  </p>
                  <button
                    onClick={() => copyToClipboard('text')}
                    className="absolute top-3 right-3 text-white/20 hover:text-white/60 transition-colors duration-200"
                    aria-label="Copy caption"
                  >
                    {copied === 'text'
                      ? <Check className="w-3.5 h-3.5 text-green-400" />
                      : <Copy className="w-3.5 h-3.5" />
                    }
                  </button>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {copied === 'text' && (
                  <motion.p
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] text-green-400/70 mt-2"
                  >
                    Caption copied to clipboard
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Link row */}
            <div className="px-6 pt-3.5">
              <div className="flex items-center border border-white/[0.07] bg-white/[0.02]">
                <p className="flex-1 px-4 py-2.5 text-[11px] text-white/25 truncate font-mono">{shareUrl}</p>
                <button
                  onClick={() => copyToClipboard('link')}
                  className="px-4 py-2.5 border-l border-white/[0.07] text-white/30 hover:text-white/70 transition-colors duration-200 flex items-center gap-1.5 text-[10px] tracking-widest uppercase flex-shrink-0"
                >
                  {copied === 'link'
                    ? <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400 text-[10px]">Copied</span></>
                    : <><Copy className="w-3 h-3" /><span className="text-[10px]">Copy</span></>
                  }
                </button>
              </div>
            </div>

            {/* Platform share */}
            <div className="px-6 pt-4 pb-2">
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/20 mb-3">Share on</p>
              <div className="grid grid-cols-3 gap-2">
                {platforms.map(({ label, icon: Icon, color, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 border border-white/[0.08] text-white/35 text-xs tracking-wide transition-all duration-200 hover:text-white"
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = color + '55';
                      el.style.color = color;
                      el.style.backgroundColor = color + '12';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = '';
                      el.style.color = '';
                      el.style.backgroundColor = '';
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Instagram note */}
            <div className="px-6 pb-5 pt-3">
              <p className="text-[10px] text-white/30 leading-relaxed">
                Instagram doesn't support direct share links — copy the caption above and paste it into your post.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
