import { notFound } from "next/navigation";
import { isBillingSimulated } from "@/lib/billing/provider";
import DummyPortal from "./DummyPortal";
import { getSubscriptionForViewer } from "@/lib/billing/reconcile";
import { getAuthenticatedUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DummyPortalPage({
  searchParams
}: {
  searchParams: Promise<{ return?: string }>;
}) {
  if (!isBillingSimulated()) notFound();

  const { return: returnUrl } = await searchParams;

  // Only same-origin paths, so the return cannot be turned into an open redirect.
  // Cancelling a school's plan affects every teacher in it, so the page says
  // so rather than talking about "you".
  const userId = await getAuthenticatedUserId();
  const subscription = userId ? await getSubscriptionForViewer(userId) : null;
  const schoolName = subscription?.school_name ?? null;

  const safeReturn =
    returnUrl && returnUrl.startsWith("/") ? returnUrl : "/settings";

  return (
    <div className="page page-narrow" style={{ paddingTop: "4rem" }}>
      <DummyPortal returnUrl={safeReturn} schoolName={schoolName} />
    </div>
  );
}
