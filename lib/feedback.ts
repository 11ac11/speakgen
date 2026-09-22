/**
 * The contact page's one piece of configuration, and the shape of what it asks.
 *
 * Nothing here touches the database, and that is deliberate rather than
 * unfinished. A contact form has exactly two honest implementations: hand the
 * message to something that delivers it, or do not take the message. Writing it
 * to a table nobody is notified about is the third option, and it looks like it
 * works right up until the week somebody needed an answer.
 *
 * So until a provider is configured, the form composes the message and hands it
 * to the sender's own mail client. That delivers for real, today, with no key,
 * no domain verification and no table — and the form fields are already the
 * ones a real endpoint would want, so swapping the submit is a small change.
 * See the TODO in app/contact/ContactContent.tsx.
 */

/**
 * Where a message goes. Unset until an address exists.
 *
 * TODO: set SUPPORT_EMAIL in the environment. Until it is, the contact page
 * says so plainly rather than offering a form that goes nowhere — a disabled
 * button with a reason is recoverable, a submitted message that evaporates is
 * not.
 *
 * In the environment rather than in this file for the usual two reasons:
 * changing where your own post goes should not need a deploy, and an address
 * written into the page is an address in every scraper's list. The mail link is
 * assembled in the browser from this value, so it is not much of a shield —
 * but it does mean staging and production can differ, which a constant cannot.
 */
export function supportEmail() {
  return process.env.SUPPORT_EMAIL?.trim() || null;
}

/**
 * What somebody is writing about.
 *
 * Five, because a picker people scan rather than read is a picker people answer
 * honestly. The labels are what a teacher would say, not what a support desk
 * would file it under. The value is what ends up in the subject line, so a full
 * inbox can still be sorted at a glance.
 */
export const FEEDBACK_TOPICS = [
  { value: "feedback", label: "Feedback or an idea" },
  { value: "bug", label: "Something is broken" },
  { value: "question", label: "A question about using it" },
  { value: "billing", label: "Plans and billing" },
  { value: "other", label: "Something else" }
] as const;

export type FeedbackTopic = (typeof FEEDBACK_TOPICS)[number]["value"];

export function feedbackTopicLabel(value: string) {
  return FEEDBACK_TOPICS.find((topic) => topic.value === value)?.label ?? value;
}
