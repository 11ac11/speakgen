import { cookies } from "next/headers";
import {
  AD_CONSENT_COOKIE,
  adClientId,
  isAdPlacement,
  type AdPlacement
} from "@/lib/ads";
import { viewerSeesAds } from "@/lib/adAudience";
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
  // Fails closed: a placement not on the allowlist renders nothing, however it
  // got here.
  if (!isAdPlacement(placement)) return null;

  const consent = (await cookies()).get(AD_CONSENT_COOKIE)?.value;
  if (consent !== "granted") return null;

  // The kill switch and the plan, asked the same way the consent banner asks.
  if (!(await viewerSeesAds())) return null;

  return <AdUnit placement={placement} clientId={adClientId()} />;
}
