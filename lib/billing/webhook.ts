import {
  getBillingProvider,
  getConfiguredProviderName,
  isBillingEnabled
} from "@/lib/billing/provider";
import {
  applySubscriptionState,
  claimEvent,
  releaseEvent
} from "@/lib/billing/reconcile";

export type WebhookResult = {
  status: number;
  body: Record<string, unknown>;
};

/**
 * Verifies and applies a billing webhook.
 *
 * A function rather than only a route handler, so the simulated provider can
 * exercise the real path by calling it directly. It used to POST to its own
 * webhook URL, which is a request the server makes to itself while already
 * handling one — enough to stall a dev worker, and a needless network hop in
 * any environment.
 */
export async function processWebhook(input: {
  rawBody: string;
  headers: Headers;
}): Promise<WebhookResult> {
  const provider = getConfiguredProviderName();

  if (!provider || !isBillingEnabled()) {
    return { status: 503, body: { error: "Billing is not available yet" } };
  }

  let event;
  try {
    event = await getBillingProvider().parseWebhook(input);
  } catch (error) {
    // A bad signature is not ours to retry. 400 tells the provider the
    // delivery was rejected rather than lost.
    console.error("Webhook verification failed:", error);
    return { status: 400, body: { error: "Invalid signature" } };
  }

  try {
    // Claimed before acting, so a retry is a no-op rather than a second
    // subscription change.
    const isNew = await claimEvent(provider, event);
    if (!isNew)
      return { status: 200, body: { received: true, duplicate: true } };

    if (event.subscription) {
      await applySubscriptionState(event.subscription);
    }

    return { status: 200, body: { received: true } };
  } catch (error) {
    // Hand the claim back before asking for a retry. Keeping it would turn a
    // transient failure into a permanent one: the retry would look like a
    // duplicate and the subscription would never be applied.
    await releaseEvent(provider, event.id).catch(() => {});

    console.error("Webhook processing failed:", error);
    return { status: 500, body: { error: "Internal Server Error" } };
  }
}
