import { UAParser } from 'ua-parser-js';

export interface UaInfo {
  device: 'mobile' | 'tablet' | 'desktop';
  browser: string;
}

const BROWSER_FALLBACK = 'Unknown';

export function parseUserAgent(userAgent: string | undefined): UaInfo {
  if (!userAgent) return { device: 'desktop', browser: BROWSER_FALLBACK };
  const p = new UAParser(userAgent);
  const deviceType = p.getDevice().type;
  const device: UaInfo['device'] =
    deviceType === 'mobile' ? 'mobile' : deviceType === 'tablet' ? 'tablet' : 'desktop';
  const browser = (p.getBrowser().name || BROWSER_FALLBACK).slice(0, 32);
  return { device, browser };
}
