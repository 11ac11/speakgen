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

export function getConfiguredProviderName(): BillingProviderName | null {
  const name = process.env.BILLING_PROVIDER;
  if (!name) return null;

  if (name === "stripe" || name === "paddle" || name === "lemonsqueezy") {
    return name;
  }

  console.warn(`Unknown BILLING_PROVIDER: ${name}`);
  return null;
}

export function isBillingEnabled() {
  const name = getConfiguredProviderName();
  return name !== null && adapters[name] !== undefined;
}

export function getBillingProvider(): BillingProvider {
  const name = getConfiguredProviderName();
  const factory = name ? adapters[name] : undefined;

  if (!factory) throw new BillingNotConfiguredError();
  return factory();
}
