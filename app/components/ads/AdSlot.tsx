import { cookies } from "next/headers";
import {
  AD_CONSENT_COOKIE,
  adClientId,
  adsEnabled,
  isAdPlacement,
  type AdPlacement
} from "@/lib/ads";
import { entitlementsFor } from "@/lib/entitlements";
import { getProfile } from "@/lib/profile";
import { getAuthenticatedUserId } from "@/lib/session";
import AdUnit from "./AdUnit";

/**
 * The only way an ad reaches a page. Every gate is here, on the server.
 *
 * The plan is read from the database rather than anything the client could
 * change, and consent is read from the cookie rather than after hydration, so
 * nothing ever renders and then disappears.
 */
export default async function AdSlot({
  placement
}: {
  placement: AdPlacement;
}) {
  if (!adsEnabled()) return null;

  // Fails closed: a placement not on the allowlist renders nothing, however it
  // got here.
  if (!isAdPlacement(placement)) return null;

  const consent = (await cookies()).get(AD_CONSENT_COOKIE)?.value;
  if (consent !== "granted") return null;

  const userId = await getAuthenticatedUserId();
  const profile = userId ? await getProfile(userId) : null;

  // Whether a plan carries ads comes from the entitlements map, so this stays
  // in step with the pricing page and the limits rather than drifting.
  if (!entitlementsFor(profile?.plan ?? "free").ads) return null;

  return <AdUnit placement={placement} clientId={adClientId()} />;
}
