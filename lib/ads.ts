/**
 * Where ads may appear, and when.
 *
 * An allowlist of named placements rather than a list of excluded routes. A
 * blocklist fails open: a page added later gets ads until somebody remembers to
 * exclude it. This fails closed, and the two surfaces that must never carry ads
 * cannot acquire them by accident:
 *
 *   The exam runner, because it is a timed speaking activity and an ad loading
 *   mid-turn is disruptive.
 *
 *   Anything a student sees through a shared link. That surface is both the
 *   distribution channel and the thing the Academy tier sells, so it cannot be
 *   sold twice — and those students are often minors.
 */

export const AD_PLACEMENTS = ["landing", "about", "faqs", "dashboard"] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export function isAdPlacement(value: string): value is AdPlacement {
  return (AD_PLACEMENTS as readonly string[]).includes(value);
}

/**
 * The kill switch. Off unless explicitly enabled, so ads cannot arrive in an
 * environment by surprise, and the whole thing can be withdrawn with one
 * variable if it turns out not to be worth it.
 */
export function adsEnabled() {
  return process.env.ADS_ENABLED === "true";
}

/**
 * The ad network's own id. Without it the slot renders a labelled placeholder,
 * so the layout can be judged before an account exists.
 */
export function adClientId() {
  return process.env.ADS_CLIENT_ID ?? null;
}

export function adsConfigured() {
  return adsEnabled() && adClientId() !== null;
}

/** Name of the cookie the consent banner writes. Read on the server too. */
export const AD_CONSENT_COOKIE = "speakgen_ad_consent";
