/**
 * The facts the legal pages are built from: who runs SpeakGen, which outside
 * services touch personal data, and which cookies are set.
 *
 * One place, read by the privacy policy, the cookie policy and the data
 * processing agreement, so the three cannot list different sub-processors or
 * different cookies. When a service is added or chosen — the payment provider,
 * the email provider, logo storage — it is added here once.
 */

/*
 * TODO(legal): fill these in, have the documents reviewed by a lawyer, then
 * set `reviewed` to true to take the "draft" notice off the pages. Until the
 * operator is set, the pages say "the operator of SpeakGen" and send people to
 * the contact page, which is honest but not enough for GDPR, which requires the
 * controller's identity and contact details to be stated.
 */
export const OPERATOR = {
  /** The legal name of the business or person running SpeakGen. */
  name: null as string | null,
  /** Registered address. */
  address: null as string | null,
  /** Tax / company number (e.g. NIF/CIF in Spain). */
  registration: null as string | null,
  /** Where privacy requests go. Falls back to the contact page. */
  privacyEmail: null as string | null,
  /** "the laws of Spain", "the laws of England and Wales", … */
  governingLaw: null as string | null,
  /** The data protection authority a person can complain to, if not their own. */
  supervisoryAuthority: null as string | null,
  lastUpdated: "24 September 2026",
  reviewed: false
};

export function operatorName() {
  return OPERATOR.name ?? "the operator of SpeakGen";
}

export type Subprocessor = {
  name: string;
  purpose: string;
  data: string;
  location: string;
  /** Not in use yet: listed so the documents do not need rewriting when it is. */
  pending?: boolean;
};

/*
 * TODO(region): the database and sign-in run in London (AWS eu-west-2), but no
 * Vercel function region is configured, so server code runs in Vercel's
 * default region, which is in the United States. Setting it to London (lhr1)
 * in the Vercel project would keep processing in the UK/EU and put the
 * functions next to the database, which is also faster. Update Vercel's
 * location below if it changes.
 */
export const SUBPROCESSORS: Subprocessor[] = [
  {
    name: "Neon",
    purpose: "Database and sign-in",
    data: "Account details, sessions, and everything teachers create",
    location: "London, UK (AWS eu-west-2)"
  },
  {
    name: "Vercel",
    purpose: "Hosting the website and running its server code",
    data: "Requests to the site, including IP address and browser, in server logs",
    location: "Global network; server code currently runs in the United States"
  },
  {
    name: "Google",
    purpose: "Sign-in with Google, for teachers who choose it",
    data: "Name, email address and profile picture from the Google account",
    location: "United States and elsewhere"
  },
  {
    name: "Pexels",
    purpose: "The photograph library questions use",
    data: "None: photographs are fetched by our server, not by the visitor's browser",
    location: "Germany (Pexels GmbH)"
  },
  {
    name: "Payment provider",
    purpose: "Taking payment for paid plans",
    data: "Billing name, email, payment details and address",
    location: "To be confirmed",
    pending: true
  },
  {
    name: "Email provider",
    purpose: "Sending school invitations and replies",
    data: "Recipient's email address and the message",
    location: "To be confirmed",
    pending: true
  },
  {
    name: "Google AdSense",
    purpose: "Advertising on the free plan, only after consent",
    data: "Cookies and device information, for visitors who agree",
    location: "United States and elsewhere",
    pending: true
  }
];

export type CookieRow = {
  name: string;
  purpose: string;
  duration: string;
  kind: "Essential" | "Preference" | "Advertising";
};

export const COOKIES: CookieRow[] = [
  {
    name: "__Secure-neon-auth.session_token",
    purpose: "Keeps a teacher signed in.",
    duration: "7 days",
    kind: "Essential"
  },
  {
    name: "__Secure-neon-auth.local.session_data",
    purpose:
      "A short-lived copy of the sign-in session, so each page does not have to check it again.",
    duration: "5 minutes",
    kind: "Essential"
  },
  {
    name: "speakgen_ad_consent",
    purpose:
      "Remembers whether you allowed ads, so you are not asked on every page.",
    duration: "1 year",
    kind: "Preference"
  },
  {
    name: "Advertising cookies (Google)",
    purpose:
      "Set only if ads are switched on and you choose to allow them. Never set for Pro or Academy, or on links shared with students.",
    duration: "Set by Google",
    kind: "Advertising"
  }
];
