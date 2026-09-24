import type { Metadata } from "next";

/**
 * The site's own name, address and description, in one place, for the root
 * metadata, the sitemap, robots.txt and anything else that needs an absolute
 * URL.
 */

export const SITE_NAME = "SpeakGen";

export const SITE_DESCRIPTION =
  "Cambridge speaking exam practice for teachers. Run a full B1, B2, C1 or C2 speaking test with a timer for every part, build your own exams, and share them with a class.";

/**
 * The site's canonical origin, with no trailing slash.
 *
 * TODO(domain): set NEXT_PUBLIC_SITE_URL in Vercel (e.g. https://speakgen.app)
 * once the domain is confirmed. Until then this falls back to the production
 * address Vercel assigns, and to localhost in development. Canonical links,
 * Open Graph URLs and the sitemap all follow it, so a wrong value here puts
 * the wrong address in search results — set it before the site is indexed.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * Metadata for a page that is one person's, not the public's: the dashboard,
 * settings, billing, editors, an invitation. It gets a title for the browser
 * tab and is kept out of search, so a crawler that follows a link to it does
 * not index a login redirect.
 */
export function privatePage(title: string): Metadata {
  return { title, robots: { index: false, follow: false } };
}
