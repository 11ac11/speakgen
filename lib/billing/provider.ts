import { createDummyProvider } from "@/lib/billing/dummy";
import {
  BillingNotConfiguredError,
  type BillingProvider,
  type BillingProviderName
} from "@/lib/billing/types";

/**
 * Resolves the configured provider.
 *
 * Nothing is wired yet: the choice between Stripe and a merchant of record is
 * still open, and it is a real decision rather than a detail. Selling in euro
 * to EU customers means VAT at the customer's local rate, which with Stripe you
 * register and file for yourself, and with Paddle or Lemon Squeezy you do not
 * because they are the seller of record.
 *
 * Until BILLING_PROVIDER is set, every route answers honestly that billing is
 * not available rather than half-working.
 */

const adapters: Partial<Record<BillingProviderName, () => BillingProvider>> = {
  // stripe: () => createStripeProvider(),
  // paddle: () => createPaddleProvider(),
};

/**
 * The dummy provider is selected by BILLING_PROVIDER=dummy rather than living
 * in the table above, because it is not a real provider and must never be
 * reachable by a typo in a provider name.
 */
function isDummySelected() {
  return process.env.BILLING_PROVIDER === "dummy";
}

export function getConfiguredProviderName(): BillingProviderName | null {
  const name = process.env.BILLING_PROVIDER;
  if (!name) return null;

  // Stored against "stripe" so subscription rows stay valid when a real
  // provider replaces it.
  if (name === "dummy") return "stripe";

  if (name === "stripe" || name === "paddle" || name === "lemonsqueezy") {
    return name;
  }

  console.warn(`Unknown BILLING_PROVIDER: ${name}`);
  return null;
}

export function isBillingEnabled() {
  if (isDummySelected()) return true;

  const name = getConfiguredProviderName();
  return name !== null && adapters[name] !== undefined;
}

/** True when checkout is a simulation. The UI says so rather than pretending. */
export function isBillingSimulated() {
  return isDummySelected();
}

export function getBillingProvider(): BillingProvider {
  if (isDummySelected()) return createDummyProvider();

  const name = getConfiguredProviderName();
  const factory = name ? adapters[name] : undefined;

  if (!factory) throw new BillingNotConfiguredError();
  return factory();
}
