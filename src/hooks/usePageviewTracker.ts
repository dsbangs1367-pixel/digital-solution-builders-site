import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '@/lib/track';

const SESSION_FLAG = 'dsb_analytics_session_started';

/**
 * Fires one pageview event on initial mount, then one per SPA route change.
 * The (external) referrer is only sent on the first hit of a session so we
 * don't double-attribute every in-app navigation to the same referrer.
 */
export default function usePageviewTracker() {
  const location = useLocation();
  // StrictMode double-invokes effects in dev — guard against the duplicate.
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    const path = location.pathname + location.search;
    if (lastSent.current === path) return;
    lastSent.current = path;

    let referrer: string | undefined;
    try {
      if (!sessionStorage.getItem(SESSION_FLAG)) {
        sessionStorage.setItem(SESSION_FLAG, '1');
        referrer = document.referrer || undefined;
      }
    } catch {
      // sessionStorage can throw in privacy modes; just skip the flag.
    }

    trackPageview(path, referrer);
  }, [location.pathname, location.search]);
}
