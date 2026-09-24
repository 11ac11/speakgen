import { notFound } from "next/navigation";
import { decodeIntent } from "@/lib/billing/dummy";
import { isBillingSimulated } from "@/lib/billing/provider";
import { formatPrice, getPrice } from "@/lib/billing/prices";
import DummyCheckout from "./DummyCheckout";
import { sql } from "@/lib/db";
import type { Metadata } from "next";
import { privatePage } from "@/lib/site";

export const metadata: Metadata = privatePage("Checkout");

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

  // A school's purchase says which school, since that is who is being billed.
  const schoolName =
    decoded.subject.kind === "organization"
      ? ((
          (await sql(`SELECT name FROM neon_auth.organization WHERE id = $1`, [
            decoded.subject.organizationId
          ])) as unknown as { name: string }[]
        )[0]?.name ?? null)
      : null;

  return (
    <div className="page page-narrow" style={{ paddingTop: "4rem" }}>
      <DummyCheckout
        intent={intent as string}
        planLabel={decoded.plan === "pro" ? "Teacher Pro" : "Academy"}
        intervalLabel={decoded.interval === "year" ? "Yearly" : "Monthly"}
        amount={formatPrice(price)}
        schoolName={schoolName}
        seats={decoded.subject.kind === "organization" ? decoded.seats : null}
      />
    </div>
  );
}
