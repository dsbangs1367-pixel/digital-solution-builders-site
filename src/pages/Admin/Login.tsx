import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || `Login failed (${r.status})`);
      }
      setPassword('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin · DSB</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm border border-border/50 bg-foreground/[0.02] p-8 flex flex-col gap-5"
          noValidate
        >
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-muted/40 mb-2">Admin</p>
            <p className="font-serif text-2xl">Sign in</p>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs tracking-[0.2em] uppercase text-muted/50">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              disabled={submitting}
              className="w-full bg-transparent border-b border-border/40 focus:border-foreground/50 outline-none py-2 text-sm transition-colors"
            />
          </label>
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting || !password}
            className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background text-xs font-medium tracking-wide hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </>
  );
}
