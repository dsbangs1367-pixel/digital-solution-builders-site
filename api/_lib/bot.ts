import { isbot } from 'isbot';

/** True for known bots, crawlers, headless browsers, and missing UAs. */
export function isBotRequest(userAgent: string | undefined): boolean {
  if (!userAgent || userAgent.length < 3) return true;
  return isbot(userAgent);
}
