/**
 * What each plan allows.
 *
 * A plain map rather than a permissions table: there are three plans and a
 * handful of capabilities, so a table would add a join and a way for the
 * database and the code to disagree. Move to a table only if plans ever become
 * something a non-developer configures.
 *
 * `null` means unlimited.
 */

export const PLANS = ["free", "pro", "academy"] as const;
export type Plan = (typeof PLANS)[number];

export type Entitlements = {
  /** How many exams the owner may keep. */
  exams: number | null;
  /** How many practices the owner may keep. */
  practices: number | null;
  /** Questions are deliberately unlimited on every plan: the bank is the
   *  switching cost, so capping it would fight retention. */
  questions: null;
  /** Ads are shown to this plan. */
  ads: boolean;
  pdfExport: boolean;
  /** School logo and colours on shared pages. */
  branding: boolean;
  /** Teachers covered, which is also the billing quantity on Academy. */
  seats: number;
};

export const ENTITLEMENTS: Record<Plan, Entitlements> = {
  free: {
    /* Two rather than one: enough to use it with a real class before the
       limit arrives. Joining the waitlist adds one more (lib/limits.ts). */
    exams: 2,
    practices: 3,
    questions: null,
    ads: true,
    pdfExport: false,
    branding: false,
    seats: 1
  },
  pro: {
    exams: null,
    practices: null,
    questions: null,
    ads: false,
    pdfExport: true,
    branding: false,
    seats: 1
  },
  academy: {
    exams: null,
    practices: null,
    questions: null,
    ads: false,
    pdfExport: true,
    branding: true,
    seats: 5
  }
};

/** Credits granted per billing period. Zero until the AI feature ships. */
export const AI_CREDITS_PER_PERIOD: Record<Plan, number> = {
  free: 0,
  pro: 0,
  academy: 0
};

export function isPlan(value: string): value is Plan {
  return (PLANS as readonly string[]).includes(value);
}

export function entitlementsFor(plan: string): Entitlements {
  return ENTITLEMENTS[isPlan(plan) ? plan : "free"];
}

/**
 * Whether a limit has room left. `null` is unlimited, so this is the only
 * place that has to remember what null means.
 */
export function withinLimit(limit: number | null, current: number) {
  return limit === null || current < limit;
}
