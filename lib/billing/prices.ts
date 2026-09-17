import type { BillingInterval } from "@/lib/billing/types";
import type { Plan } from "@/lib/entitlements";

/**
 * What each plan costs, and the provider's id for that price.
 *
 * The amounts live here so the pricing page and the checkout cannot disagree.
 * The provider ids come from the environment, because they differ between test
 * and live and between providers.
 */

export type PriceKey = `${Exclude<Plan, "free">}_${BillingInterval}`;

export type Price = {
  plan: Exclude<Plan, "free">;
  interval: BillingInterval;
  /** Minor units, so 500 is €5.00. Avoids floating point on money. */
  amount: number;
  currency: "EUR";
  providerPriceId: string | null;
};

const ENV_KEYS: Record<PriceKey, string> = {
  pro_month: "BILLING_PRICE_PRO_MONTH",
  pro_year: "BILLING_PRICE_PRO_YEAR",
  academy_month: "BILLING_PRICE_ACADEMY_MONTH",
  academy_year: "BILLING_PRICE_ACADEMY_YEAR"
};

const AMOUNTS: Record<PriceKey, number> = {
  pro_month: 500,
  pro_year: 4900,
  academy_month: 2900,
  academy_year: 29000
};

export function getPrice(
  plan: Exclude<Plan, "free">,
  interval: BillingInterval
): Price {
  const key: PriceKey = `${plan}_${interval}`;

  return {
    plan,
    interval,
    amount: AMOUNTS[key],
    currency: "EUR",
    providerPriceId: process.env[ENV_KEYS[key]] ?? null
  };
}

export function formatPrice(price: Price) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: price.amount % 100 === 0 ? 0 : 2
  }).format(price.amount / 100);
}

/** Extra teachers beyond what the Academy plan includes. */
export const ACADEMY_EXTRA_SEAT_MONTH = 500;
