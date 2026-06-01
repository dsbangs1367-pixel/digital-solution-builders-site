import { useCallback, useEffect, useState } from 'react';
import Login from './Login';
import Analytics from './Analytics';
import type { StatsResponse } from './types';

type State =
  | { status: 'loading' }
  | { status: 'unauth' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: StatsResponse };

export default function AdminAnalyticsPage() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
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
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      setState({ status: 'unauth' });
    }
  }, []);

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
        <p className="font-serif text-2xl">Couldn&apos;t load analytics</p>
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

  return (
    <Analytics
      data={state.data}
      onLogout={handleLogout}
      onRefresh={() => load(true)}
      refreshing={refreshing}
    />
  );
}
