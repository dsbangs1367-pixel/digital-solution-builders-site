// Auth-gated wrapper for the investor / funder analytics report. Mirrors the
// load + auth flow in index.tsx so a single dashboard login also unlocks
// /admin/report.

import { useCallback, useEffect, useState } from 'react';
import Login from './Login';
import Report from './Report';
import type { StatsResponse } from './types';

type State =
  | { status: 'loading' }
  | { status: 'unauth' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: StatsResponse };

export default function AdminReportPage() {
  const [state, setState] = useState<State>({ status: 'loading' });

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/stats', { credentials: 'same-origin' });
      if (r.status === 401) {
        setState({ status: 'unauth' });
        return;
      }
      if (!r.ok) {
        throw new Error(`Stats request failed (${r.status})`);
      }
      const data: StatsResponse = await r.json();
      setState({ status: 'ready', data });
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : 'Failed to load stats' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted/40 text-xs tracking-widest uppercase">
        Loading…
      </div>
    );
  }

  if (state.status === 'unauth') {
    return <Login onSuccess={() => load()} />;
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-4 px-6 text-center">
        <p className="font-serif text-2xl">Couldn&apos;t load the report</p>
        <p className="text-xs text-muted/60">{state.message}</p>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center justify-center px-6 py-3 border border-border/50 hover:border-foreground/40 transition-colors text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return <Report data={state.data} />;
}
