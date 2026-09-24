import { adsEnabled } from "@/lib/ads";
import { entitlementsFor } from "@/lib/entitlements";
import { getEffectivePlan } from "@/lib/profile";
import { getAuthenticatedUserId } from "@/lib/session";

/**
 * Whether ads apply to whoever is asking, before consent comes into it.
 *
 * The one place both the ad slots and the consent banner ask, so the two
 * cannot disagree: nobody is asked about ads they will never be shown. Off
 * entirely while ADS_ENABLED is not "true"; otherwise it follows the plan, and
 * the *effective* plan — a teacher covered by their school's Academy has
 * "free" on their own profile, and reading that showed them ads.
 *
 * Server only: it reads the session and the database. lib/ads.ts stays free
 * of both because the banner's client component imports it.
 */
export async function viewerSeesAds(): Promise<boolean> {
  if (!adsEnabled()) return false;

  const userId = await getAuthenticatedUserId();
  if (!userId) return entitlementsFor("free").ads;

  return entitlementsFor(await getEffectivePlan(userId)).ads;
}
