import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  BillingEvent,
  BillingProvider,
  CheckoutRequest,
  SubscriptionState
} from "@/lib/billing/types";

/**
 * A stand-in provider, so the billing UI can be built and exercised before the
 * Stripe versus merchant-of-record decision is made.
 *
 * It is a real adapter rather than a bypass: checkout returns a URL, that page
 * posts a signed event to the same webhook route, and the same reconciliation
 * runs. Whatever works here works when a real provider is dropped in, and the
 * seam gets tested rather than assumed.
 *
 * Nobody is charged and no card is collected.
 */

const SECRET =
  process.env.BILLING_DUMMY_SECRET ??
  process.env.NEON_AUTH_COOKIE_SECRET ??
  "dummy-development-secret";

type DummyIntent = {
  subject: CheckoutRequest["subject"];
  plan: SubscriptionState["plan"];
  interval: SubscriptionState["interval"];
  seats: number;
  successUrl: string;
  cancelUrl: string;
};

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

/** Constant-time compare, mirroring how a real provider signature is checked. */
function signatureMatches(expected: string, given: string) {
  const a = new Uint8Array(Buffer.from(expected));
  const b = new Uint8Array(Buffer.from(given));
  return a.length === b.length && timingSafeEqual(a, b);
}

export function encodeIntent(intent: DummyIntent) {
  const payload = Buffer.from(JSON.stringify(intent)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeIntent(token: string): DummyIntent | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  if (!signatureMatches(sign(payload), signature)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

/**
 * Refuses to run in production unless explicitly forced, because a fake
 * checkout that grants real plans is exactly the thing that must not be
 * switched on by accident.
 */
export function assertDummyAllowed() {
  if (process.env.NODE_ENV !== "production") return;

  if (process.env.BILLING_DUMMY_ALLOW_UNSAFE === "true") {
    console.warn(
      "Dummy billing provider is enabled in production. Plans can be granted without payment."
    );
    return;
  }

  throw new Error(
    "The dummy billing provider cannot run in production. Set BILLING_DUMMY_ALLOW_UNSAFE=true only for a demo."
  );
}

export function createDummyProvider(): BillingProvider {
  assertDummyAllowed();

  return {
    name: "stripe", // stored as a provider value; nothing real is contacted

    async createCheckout(request: CheckoutRequest) {
      const token = encodeIntent({
        subject: request.subject,
        plan: request.plan,
        interval: request.interval,
        seats: request.seats ?? 1,
        successUrl: request.successUrl,
        cancelUrl: request.cancelUrl
      });

      return { url: `/billing/checkout?intent=${token}` };
    },

    async createPortalSession({ returnUrl }) {
      return { url: `/billing/portal?return=${encodeURIComponent(returnUrl)}` };
    },

    async parseWebhook({ rawBody, headers }) {
      const signature = headers.get("x-dummy-signature") ?? "";
      if (!signatureMatches(sign(rawBody), signature)) {
        throw new Error("Bad dummy signature");
      }

      const body = JSON.parse(rawBody) as {
        id: string;
        type: string;
        subscription: SubscriptionState;
      };

      const event: BillingEvent = {
        id: body.id,
        type: body.type,
        subscription: body.subscription,
        raw: body
      };

      return event;
    }
  };
}

/** Signs a body the way the dummy webhook expects. Used by the fake pages. */
export function signDummyBody(rawBody: string) {
  return sign(rawBody);
}
