import type { Plan } from "@/lib/entitlements";

/**
 * The seam between the application and whichever billing provider is chosen.
 *
 * Stripe and a merchant of record such as Paddle differ in who is the seller of
 * record, how signatures are verified and what their events look like. None of
 * that reaches the rest of the application: everything below is expressed in
 * our own terms, and an adapter translates.
 */

export type BillingProviderName = "stripe" | "paddle" | "lemonsqueezy";

export type BillingInterval = "month" | "year";

export type SubscriptionStatus =
  "trialing" | "active" | "past_due" | "canceled" | "incomplete";

/** Who is paying. An organisation subscription covers its members. */
export type BillingSubject =
  | { kind: "user"; userId: string }
  | { kind: "organization"; organizationId: string };

/**
 * A subscription as this application understands it, translated out of
 * whatever the provider sent.
 */
export type SubscriptionState = {
  provider: BillingProviderName;
  providerCustomerId: string | null;
  providerSubscriptionId: string;
  subject: BillingSubject;
  plan: Exclude<Plan, "free">;
  status: SubscriptionStatus;
  interval: BillingInterval;
  seats: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/**
 * A webhook, after verification. `subscription` is absent for events we do not
 * model, which are still recorded so the delivery is not retried forever.
 */
export type BillingEvent = {
  id: string;
  type: string;
  subscription?: SubscriptionState;
  raw: unknown;
};

export type CheckoutRequest = {
  subject: BillingSubject;
  plan: Exclude<Plan, "free">;
  interval: BillingInterval;
  seats?: number;
  email?: string;
  successUrl: string;
  cancelUrl: string;
};

export interface BillingProvider {
  readonly name: BillingProviderName;

  /** A hosted checkout page. Returns the URL to send the customer to. */
  createCheckout(request: CheckoutRequest): Promise<{ url: string }>;

  /** The provider's own portal, where a customer cancels or changes card. */
  createPortalSession(input: {
    providerCustomerId: string;
    returnUrl: string;
  }): Promise<{ url: string }>;

  /**
   * Verifies the signature and translates the payload. Takes the raw body,
   * because every provider signs the bytes rather than the parsed object.
   */
  parseWebhook(input: {
    rawBody: string;
    headers: Headers;
  }): Promise<BillingEvent>;
}

export class BillingNotConfiguredError extends Error {
  constructor() {
    super("No billing provider is configured");
    this.name = "BillingNotConfiguredError";
  }
}
