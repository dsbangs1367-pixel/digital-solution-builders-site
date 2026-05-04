import { useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { motion as _motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const motion = _motion as any;

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormState {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
}

const PROJECT_TYPES = ['Website', 'Mobile App', 'Brand & Identity', 'Other'] as const;

export default function ContactForm() {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    company: '',
    projectType: '',
    message: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    setStatus('submitting');
    setErrorMsg('');

    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${r.status})`);
      }
      setStatus('success');
      setForm({ name: '', email: '', company: '', projectType: '', message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-border/50 bg-foreground/[0.02] p-8 md:p-10 flex flex-col gap-6 items-start"
      >
        <CheckCircle2 className="w-8 h-8 text-green-500" />
        <div>
          <p className="font-serif text-2xl mb-2">Message received.</p>
          <p className="text-sm text-muted/70 leading-relaxed">
            Thanks — we&apos;ll get back to you within hours, not days. Watch your inbox.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-xs tracking-[0.2em] uppercase text-muted/60 hover:text-foreground transition-colors duration-200"
        >
          ← Send another
        </button>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border/50 bg-foreground/[0.02] p-8 md:p-10 flex flex-col gap-5"
      noValidate
    >
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-muted/40 mb-3">Quick brief</p>
        <p className="text-sm text-muted/70 leading-relaxed">
          One message and we&apos;ll be in touch within hours.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Name"
          required
          input={<input
            type="text"
            value={form.name}
            onChange={update('name')}
            required
            autoComplete="name"
            disabled={status === 'submitting'}
            className="w-full bg-transparent border-b border-border/40 focus:border-foreground/50 outline-none py-2 text-sm transition-colors"
          />}
        />
        <Field
          label="Email"
          required
          input={<input
            type="email"
            value={form.email}
            onChange={update('email')}
            required
            autoComplete="email"
            disabled={status === 'submitting'}
            className="w-full bg-transparent border-b border-border/40 focus:border-foreground/50 outline-none py-2 text-sm transition-colors"
          />}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Company"
          input={<input
            type="text"
            value={form.company}
            onChange={update('company')}
            autoComplete="organization"
            disabled={status === 'submitting'}
            className="w-full bg-transparent border-b border-border/40 focus:border-foreground/50 outline-none py-2 text-sm transition-colors"
          />}
        />
        <Field
          label="Project type"
          input={<select
            value={form.projectType}
            onChange={update('projectType')}
            disabled={status === 'submitting'}
            className="w-full bg-transparent border-b border-border/40 focus:border-foreground/50 outline-none py-2 text-sm transition-colors text-muted/80 [&>option]:bg-background"
          >
            <option value="">Select…</option>
            {PROJECT_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>}
        />
      </div>

      <Field
        label="What are you building?"
        required
        input={<textarea
          value={form.message}
          onChange={update('message')}
          required
          rows={4}
          disabled={status === 'submitting'}
          placeholder="One paragraph is enough — we'll follow up with the right questions."
          className="w-full bg-transparent border border-border/40 focus:border-foreground/50 outline-none p-3 text-sm transition-colors resize-y"
        />}
      />

      {status === 'error' && (
        <motion.div
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 text-xs text-red-400"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg || 'Could not send message. Please email directly: danielbangs@dsbdigital.biz'}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            Send message
          </>
        )}
      </button>
    </form>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  input: React.ReactNode;
}

function Field({ label, required, input }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs tracking-[0.2em] uppercase text-muted/50">
        {label}
        {required && <span className="text-red-400/60 ml-0.5">*</span>}
      </span>
      {input}
    </label>
  );
}
