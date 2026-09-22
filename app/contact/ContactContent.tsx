"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Prose, Lead } from "@/app/components/Prose";
import { FEEDBACK_TOPICS, feedbackTopicLabel } from "@/lib/feedback";

/* The form is full width inside the prose measure, because 66ch is a column of
   text and a field narrower than its own label is silly. */
const Form = styled.form`
  width: 100%;
  margin-top: 0.5rem;
`;

const Field = styled.div`
  margin-bottom: 1.25rem;

  label {
    display: block;
    margin-bottom: 0.35rem;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-label);
  }

  /* The hint under a label, not beside it: "only if you want a reply" is the
     answer to "do I have to", and that question is asked while looking at the
     box, not at the label. */
  small {
    display: block;
    margin-top: 0.35rem;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  input,
  textarea {
    width: 100%;
    box-sizing: border-box;
    font-family: var(--font-body), sans-serif;
    font-size: var(--text-base);
    color: var(--text-body);
    background: #fff;
    border: 1.5px solid var(--field-edge);
    border-radius: var(--radius-control);
    padding: 0.75rem 0.9rem;
    outline: none;
    transition:
      border-color 0.12s ease,
      box-shadow 0.12s ease;
  }

  input {
    min-height: 48px;
  }

  textarea {
    min-height: 160px;
    resize: vertical;
    line-height: 1.55;
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--text-faint);
  }

  input:hover,
  textarea:hover {
    border-color: var(--field-edge-hover);
  }

  input:focus,
  textarea:focus {
    border-color: var(--green-600);
    box-shadow: 0 0 0 4px rgba(98, 204, 84, 0.28);
  }
`;

/* The honeypot. Not display: none — a bot reading the stylesheet skips a hidden
   field as readily as a person does. This is off-screen and out of the tab
   order, so it is invisible and unreachable to anyone using the page, and just
   another text input to anything filling in every text input it finds. */
const Honeypot = styled.div`
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
`;

/* A fieldset, because the five pills are one question with one answer, and a
   screen reader should hear "What is it about?" once before them rather than
   meeting five unexplained buttons. The browser's default border and padding
   are cleared; the legend is styled to match the labels on the fields below. */
const TopicGroup = styled.fieldset`
  margin: 0 0 1.25rem;
  padding: 0;
  border: 0;

  legend {
    padding: 0;
    margin-bottom: 0.35rem;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-label);
  }
`;

const Topics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`;

/* The same pill the practice builder uses for its presets. Five short choices
   shown at once beat a dropdown that hides four of them: picking the topic is
   the step that makes the rest of the form easy to fill in, so it should not
   start with a click that reveals nothing. */
const Topic = styled.button<{ $active: boolean }>`
  appearance: none;
  cursor: pointer;
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  padding: 0.55rem 1.1rem;
  border-radius: var(--radius-pill);
  border: 1.5px solid
    ${(p) => (p.$active ? "var(--green-600)" : "var(--field-edge)")};
  background: ${(p) => (p.$active ? "var(--green-tint)" : "#fff")};
  color: ${(p) => (p.$active ? "var(--green-600)" : "var(--text-body)")};
  transition:
    border-color 0.12s ease,
    background-color 0.12s ease,
    color 0.12s ease;

  &:hover {
    border-color: ${(p) =>
      p.$active ? "var(--green-600)" : "var(--field-edge-hover)"};
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
  }
`;

const Submit = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.75rem;
`;

/* An anchor, not a button, and that is the whole point of it: while this sends
   by mailto the control genuinely IS a link to a mail client, so it should say
   so. You can hover it and read where it goes, right-click and copy it, and
   follow it from the keyboard the way every other link on the page works —
   none of which a button that assigns to window.location can offer.
   It wears Button's clothes so the page does not look assembled from parts.

   When mail sending moves server-side this becomes an ordinary submit button:
   at that point there is no destination to show, and pretending otherwise
   would be the lie. */
const SendLink = styled.a`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
  padding: 0.9rem 1.9rem;
  border-radius: var(--radius-control);
  border: 1.5px solid transparent;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  background: var(--green-600);
  color: #fff;
  box-shadow: 0 3px 0 0 var(--green-800);
  transition:
    transform 0.12s var(--lift),
    box-shadow 0.12s ease,
    background-color 0.12s ease;

  /* globals.css turns a link white on hover, a leftover from somewhere dark.
     This is already white, so it needs saying only because the background
     underneath it moves. */
  &:hover {
    color: #fff;
    background: var(--green-500);
    transform: translateY(-2px);
    box-shadow: 0 5px 0 0 var(--green-800);
  }

  &:active {
    color: #fff;
    transform: translateY(1px);
    box-shadow: 0 1px 0 0 var(--green-800);
  }

  &:focus-visible {
    outline: 3px solid var(--leafgreen);
    outline-offset: 2px;
  }
`;

/* The same control with nowhere to go. A real disabled button rather than a
   greyed-out link, because a link with no href is not focusable and announces
   nothing — someone on a screen reader would simply not find the control and
   would have no way to learn why. */
const SendDisabled = styled.button`
  min-height: 48px;
  padding: 0.9rem 1.9rem;
  border-radius: var(--radius-control);
  border: 1.5px solid var(--off-edge);
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-base);
  background: var(--off-bg);
  color: var(--off-text);
  box-shadow: var(--off-inset);
  cursor: not-allowed;
`;

const Note = styled.p`
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

const Problem = styled.p`
  margin: 0.75rem 0 0;
  font-size: var(--text-sm);
  color: var(--danger);
`;

/* The "no address configured" state. A panel rather than a sentence, because it
   is the answer to the question the page exists to answer and it should not
   read as a footnote under a form that cannot be sent. */
const NotReady = styled.div`
  width: 100%;
  margin: 0 0 2rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--green-edge);
  border-radius: var(--radius-card);
  background: var(--green-tint);

  p {
    margin: 0;
    color: var(--text-body);
  }
`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * TODO: replace the mailto with a POST once mail sending is configured.
 *
 * What is here composes the message and hands it to the sender's own mail
 * client. It delivers for real with no provider, no key and nothing stored, and
 * it is honest about what happened: the message sits in their Sent folder, so
 * they can see it went and can chase it.
 *
 * What it costs is worth writing down, because these are the reasons to replace
 * it rather than leave it:
 *
 *   A machine with no mail client configured — a school Chromebook, a browser
 *   with no handler registered for mailto — does nothing at all when the button
 *   is pressed, and there is no event fired that this page could notice.
 *
 *   A long message can exceed what a browser will put in a URL. The cap below
 *   keeps this well inside every limit, but it is a cap the sender can feel.
 *
 *   Nothing arrives if they close the composer, and nothing here knows that.
 *
 * When a provider exists: keep every field, keep the honeypot, and swap
 * `open the composer` for a fetch to a route that sends to SUPPORT_EMAIL. The
 * field names below are already the ones such a route would want.
 */
const MAX_MESSAGE = 4000;

export default function ContactContent({
  supportEmail
}: {
  supportEmail: string | null;
}) {
  const [topic, setTopic] = useState<string>(FEEDBACK_TOPICS[0].value);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [problem, setProblem] = useState<string | null>(null);

  /* Built on every keystroke rather than on submit so the button is a real
     link's worth of predictable: what it will open is what is on screen. */
  const mailto = useMemo(() => {
    if (!supportEmail) return null;

    const subject = `[${feedbackTopicLabel(topic)}] Speakgen`;
    const body = [
      message,
      "",
      "—",
      name ? `From: ${name}` : null,
      email ? `Reply to: ${email}` : null
    ]
      .filter((line) => line !== null)
      .join("\n");

    return `mailto:${supportEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [supportEmail, topic, name, email, message]);

  /* What would stop this being sent, or null. Returned rather than set, so the
     same answer serves the click handler and nothing has to run twice. */
  const problemWith = () => {
    // A person cannot reach this field, so anything in it came from a bot.
    if (website) return "";

    if (!message.trim()) return "Write a message first — the rest is optional.";

    /* No length check: maxLength on the textarea caps it at MAX_MESSAGE, and a
       paste cannot exceed that either, so a message too long for a mail link
       cannot be typed in the first place. A check here would be a message
       nobody can ever see. */

    if (email && !EMAIL_PATTERN.test(email))
      return "That email address does not look right.";

    return null;
  };

  /* The link is followed by the browser, not by this handler — all it does is
     get in the way when the message is not ready, and say why. An empty string
     is the honeypot: stopped, with nothing shown, because telling a bot which
     field caught it is telling whoever wrote it what to leave alone next time. */
  const check = (event: React.MouseEvent) => {
    const found = problemWith();
    if (found === null) {
      setProblem(null);
      return;
    }

    event.preventDefault();
    setProblem(found || null);
  };

  return (
    <Prose className={"container"}>
      <h1>Contact</h1>
      <Lead>
        {`Found a bug, want a feature, or stuck on something? Write to me — it is one person reading, and I answer.`}
      </Lead>

      {!supportEmail && (
        /* TODO: remove this branch once SUPPORT_EMAIL is set. */
        <NotReady>
          <p>
            {`The contact address is not set up yet, so the form below cannot send. In the meantime the `}
            <Link href="/faqs">{`FAQs`}</Link>
            {` answer most of what people ask.`}
          </p>
        </NotReady>
      )}

      {/* A form element for the grouping and the autofill, but nothing submits
          it: the send control is a link, and the main field is a textarea where
          Enter is a newline rather than a send. preventDefault so a stray Enter
          in one of the single-line fields does not reload the page and lose
          what has been written. */}
      <Form onSubmit={(event) => event.preventDefault()} noValidate>
        <TopicGroup>
          <legend>{`What is it about?`}</legend>
          <Topics>
            {FEEDBACK_TOPICS.map((option) => (
              <Topic
                key={option.value}
                type="button"
                $active={topic === option.value}
                aria-pressed={topic === option.value}
                onClick={() => setTopic(option.value)}
              >
                {option.label}
              </Topic>
            ))}
          </Topics>
        </TopicGroup>

        <Field>
          <label htmlFor="contact-message">{`Your message`}</label>
          <textarea
            id="contact-message"
            name="message"
            value={message}
            maxLength={MAX_MESSAGE}
            placeholder={
              topic === "bug"
                ? "What were you doing, what happened, and what did you expect instead?"
                : "Tell me as much or as little as you like."
            }
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </Field>

        <Field>
          <label htmlFor="contact-name">{`Your name`}</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={name}
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />
          <small>{`Optional.`}</small>
        </Field>

        <Field>
          <label htmlFor="contact-email">{`Your email`}</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            value={email}
            maxLength={254}
            onChange={(e) => setEmail(e.target.value)}
          />
          <small>{`Optional, and only used to reply to you.`}</small>
        </Field>

        <Honeypot aria-hidden="true">
          <label htmlFor="contact-website">{`Leave this empty`}</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </Honeypot>

        <Submit>
          {mailto ? (
            <SendLink href={mailto} onClick={check}>
              {`Send message`}
            </SendLink>
          ) : (
            <SendDisabled type="button" disabled>
              {`Send message`}
            </SendDisabled>
          )}
          <Note>
            {supportEmail
              ? `Opens your email app with the message ready to send.`
              : `Not connected yet.`}
          </Note>
        </Submit>

        {problem && <Problem role="alert">{problem}</Problem>}
      </Form>
    </Prose>
  );
}
