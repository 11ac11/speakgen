import { notFound } from "next/navigation";
import { isBillingSimulated } from "@/lib/billing/provider";
import DummyPortal from "./DummyPortal";

export const dynamic = "force-dynamic";

export default async function DummyPortalPage({
  searchParams
}: {
  searchParams: Promise<{ return?: string }>;
}) {
  if (!isBillingSimulated()) notFound();

  const { return: returnUrl } = await searchParams;

  // Only same-origin paths, so the return cannot be turned into an open redirect.
  const safeReturn =
    returnUrl && returnUrl.startsWith("/") ? returnUrl : "/settings";

  return (
    <div className="page page-narrow" style={{ paddingTop: "4rem" }}>
      <DummyPortal returnUrl={safeReturn} />
    </div>
  );
}
