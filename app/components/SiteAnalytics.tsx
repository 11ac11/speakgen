"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics: page views only, counted without cookies or personal
 * identifiers, so it needs no consent banner.
 *
 * Share links are left out entirely. Their URL carries the token that opens
 * the exam, which must not end up in anybody's analytics; and they are what
 * students see, which the data processing agreement promises is never
 * tracked. Dropping the event, rather than trimming the URL, keeps both.
 */
function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const path = new URL(event.url).pathname;
  if (path === "/share" || path.startsWith("/share/")) return null;
  return event;
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
