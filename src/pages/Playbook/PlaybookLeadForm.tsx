import { useState } from 'react';
import { trackEvent } from '@/lib/track';
import { DOWNLOAD_PATH } from './content';

type Mode = 'guide' | 'notify';
type Status = 'idle' | 'sending' | 'done' | 'error';

/** Single lead-capture form for /playbook. Two modes, one instance on the
 *  page (anchor #get-started). Guide mode reveals an instant download on
 *  success; notify mode shows a confirmation line. */
export default function PlaybookLeadForm({ mode, onModeChange }: {
  mode: Mode;
  onModeChange: (m: Mode) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formTopic, setFormTopic] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  // The mode can change from outside this component too (hero and price CTAs
  // call goToForm), so reset transient submit state whenever it does, or a
  // guide-mode success would render as a notify-mode success that never
  // happened. Adjust-during-render pattern, deliberately not an effect.
  // Input values (name/email) survive the switch.
  const [prevMode, setPrevMode] = useState(mode);
  if (mode !== prevMode) {
    setPrevMode(mode);
    setStatus('idle');
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    // Same checks and wording as api/playbook-lead.ts, so an empty or malformed
    // submit gets a specific message without a network round-trip (offline included).
    if (!name.trim() || !email.trim()) {
      setStatus('error');
      setError('Name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus('error');
      setError('Invalid email address.');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      const r = await fetch('/api/playbook-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, interest: mode, form_topic: formTopic }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || 'Something went wrong. Please retry.');
      setStatus('done');
      trackEvent(mode === 'guide' ? 'playbook_guide_lead' : 'playbook_notify_lead');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please retry.');
    }
  }

  const tabs: { key: Mode; label: string }[] = [
    { key: 'guide', label: 'Free CV guide' },
    { key: 'notify', label: 'Notify me at launch' },
  ];

  return (
    <div id="get-started" className="relative border border-border/60 p-6 md:p-10 scroll-mt-28">
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={mode === t.key}
            onClick={() => onModeChange(t.key)}
            className={`min-h-[44px] px-4 text-xs tracking-widest uppercase border transition-colors duration-200 ${
              mode === t.key
                ? 'border-[hsl(var(--accent-green))] text-foreground'
                : 'border-border/50 text-muted/70 hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {status === 'done' ? (
        <div aria-live="polite">
          {mode === 'guide' ? (
            <div>
              <p className="font-serif text-2xl mb-3">The guide is yours.</p>
              <a
                href={DOWNLOAD_PATH}
                download
                onClick={() => trackEvent('playbook_guide_download')}
                className="fx-sweep fx-glow inline-flex min-h-[44px] items-center px-6 bg-[hsl(var(--accent-green))] text-background text-sm font-medium hover:opacity-90 transition-opacity duration-200"
              >
                Download The CV That Gets You Shortlisted (PDF)
              </a>
              <p className="text-xs text-muted/70 mt-3">Save it somewhere you will find it again. Chapter one of the playbook explains why that matters.</p>
            </div>
          ) : (
            <p className="font-serif text-2xl">You are on the list. You will hear from me once, when the playbook goes live.</p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <p className="text-sm text-muted/85 mb-5 max-w-xl">
            {mode === 'guide'
              ? 'Tell me where to send updates and the download unlocks right here. No spam, no drip sequence.'
              : 'Leave your name and email and I will send one message when the playbook launches. USD 29, Leone equivalent shown at checkout.'}
          </p>
          <div className="grid gap-4 md:grid-cols-2 max-w-xl">
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted/70">Name</span>
              <input
                type="text" required maxLength={200} value={name}
                onChange={(e) => setName(e.target.value)} autoComplete="name"
                className="fx-focus mt-1 w-full min-h-[44px] bg-transparent border border-border/60 px-3 text-sm focus:border-[hsl(var(--accent-green))] outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted/70">Email</span>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                className="fx-focus mt-1 w-full min-h-[44px] bg-transparent border border-border/60 px-3 text-sm focus:border-[hsl(var(--accent-green))] outline-none"
              />
            </label>
          </div>
          {/* honeypot: hidden from real users, bots fill it. Named form_topic
              because "website" is a common autofill target and an autofilled
              honeypot silently drops a real lead. */}
          <input
            type="text" name="form_topic" value={formTopic} tabIndex={-1} aria-hidden="true"
            onChange={(e) => setFormTopic(e.target.value)} autoComplete="off"
            className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
          />
          {error && <p role="alert" className="text-sm text-red-400 mt-4">{error}</p>}
          <button
            type="submit" disabled={status === 'sending'}
            className="fx-sweep fx-glow mt-6 min-h-[44px] px-8 bg-[hsl(var(--accent-green))] text-background text-sm font-medium hover:opacity-90 transition-opacity duration-200 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : mode === 'guide' ? 'Send me the guide' : 'Keep me posted'}
          </button>
        </form>
      )}
    </div>
  );
}
