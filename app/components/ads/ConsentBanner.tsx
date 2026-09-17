import { cookies } from "next/headers";
import { AD_CONSENT_COOKIE, adsEnabled } from "@/lib/ads";
import ConsentBannerUI from "./ConsentBannerUI";

/**
 * Asks before any ad loads, and only while there is no answer on record.
 *
 * Refusing is one click, the same as accepting, and a refusal is remembered
 * rather than re-asked on the next page.
 *
 * NOTE: this is not a certified consent platform. Serving personalised ads to
 * EEA visitors through Google requires a Google-certified CMP, and this is not
 * one. It is enough to stop ads loading without a choice while the placements
 * are being judged; a certified CMP has to replace it before real ads are
 * served in the EEA.
 */
export default async function ConsentBanner() {
  if (!adsEnabled()) return null;

  const answered = (await cookies()).get(AD_CONSENT_COOKIE);
  if (answered) return null;

  return <ConsentBannerUI />;
}
