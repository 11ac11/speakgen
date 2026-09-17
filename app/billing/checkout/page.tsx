import { notFound } from "next/navigation";
import { decodeIntent } from "@/lib/billing/dummy";
import { isBillingSimulated } from "@/lib/billing/provider";
import { formatPrice, getPrice } from "@/lib/billing/prices";
import DummyCheckout from "./DummyCheckout";

export const dynamic = "force-dynamic";

export default async function DummyCheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  // This page only exists while billing is simulated. With a real provider the
  // customer is sent to the provider's own hosted page instead.
  if (!isBillingSimulated()) notFound();

  const { intent } = await searchParams;
  const decoded = intent ? decodeIntent(intent) : null;
  if (!decoded) notFound();

  const price = getPrice(decoded.plan, decoded.interval);

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <DummyCheckout
        intent={intent as string}
        planLabel={decoded.plan === "pro" ? "Teacher Pro" : "Academy"}
        intervalLabel={decoded.interval === "year" ? "Yearly" : "Monthly"}
        amount={formatPrice(price)}
      />
    </div>
  );
}
