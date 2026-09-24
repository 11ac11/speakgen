import { notFound } from "next/navigation";
import { isBillingSimulated } from "@/lib/billing/provider";
import DummyPortal from "./DummyPortal";
import { getSubscriptionInScope, parseScope } from "@/lib/billing/reconcile";
import { getAuthenticatedUserId } from "@/lib/session";
import type { Metadata } from "next";
import { privatePage } from "@/lib/site";

export const metadata: Metadata = privatePage("Manage your plan");

export const dynamic = "force-dynamic";

export default async function DummyPortalPage({
  searchParams
}: {
  searchParams: Promise<{ return?: string; scope?: string }>;
}) {
  if (!isBillingSimulated()) notFound();

  const { return: returnUrl, scope: rawScope } = await searchParams;
  const scope = parseScope(rawScope);

  // Only same-origin paths, so the return cannot be turned into an open redirect.
  // Cancelling a school's plan affects every teacher in it, so the page says
  // so rather than talking about "you".
  const userId = await getAuthenticatedUserId();
  const subscription = userId
    ? await getSubscriptionInScope(userId, scope)
    : null;
  const schoolName = subscription?.school_name ?? null;

  // Cancelling one's own Pro while a school's Academy covers them does not
  // send them to the free plan, so the page should not say it does.
  const coveredBy =
    scope === "personal" && userId
      ? ((await getSubscriptionInScope(userId, "effective"))?.school_name ??
        null)
      : null;

  const safeReturn =
    returnUrl && returnUrl.startsWith("/") ? returnUrl : "/settings";

  return (
    <div className="page page-narrow" style={{ paddingTop: "4rem" }}>
      <DummyPortal
        returnUrl={safeReturn}
        schoolName={schoolName}
        coveredBy={coveredBy}
        scope={scope}
      />
    </div>
  );
}
