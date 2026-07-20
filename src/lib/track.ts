// Client-side analytics tracker. Posts to our own /api/track endpoint;
// no third-party trackers, no cookies, no IP storage server-side.
//
// All calls swallow errors — analytics must NEVER break user flows.

type PageviewPayload = {
  type: 'pageview';
  path: string;
  referrer?: string;
};

type EventPayload = {
  type: 'event';
  name:
    | 'share'
    | 'contact_submit'
    | 'contact_email'
    | 'contact_whatsapp'
    | 'contact_linkedin'
    | 'playbook_guide_lead'
    | 'playbook_notify_lead'
    | 'playbook_guide_download';
  props?: Record<string, string>;
};

type Payload = PageviewPayload | EventPayload;

const ENDPOINT = '/api/track';

function send(payload: Payload): void {
  if (typeof window === 'undefined') return;
  const body = JSON.stringify(payload);
  // sendBeacon survives page unloads (matters when track() fires from a
  // share-button click that immediately navigates away).
  if (navigator.sendBeacon) {
    try {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (ok) return;
    } catch {
      // fall through to fetch
    }
  }
  // keepalive lets the request outlive the document if needed.
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics drops are acceptable; never surface to the user.
  });
}

/** Fire a page-view event. Pass the new path; referrer is optional. */
export function trackPageview(path: string, referrer?: string): void {
  send({ type: 'pageview', path, referrer });
}

/** Fire a custom event. Names are validated server-side. */
export function trackEvent(name: EventPayload['name'], props?: Record<string, string>): void {
  send({ type: 'event', name, props });
}
