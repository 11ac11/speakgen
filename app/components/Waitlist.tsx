"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Modal from "@/app/components/ui/Modal";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Checkbox from "@/app/components/ui/Checkbox";
import type { WaitlistPlan, WaitlistTrigger } from "@/lib/waitlist";

/**
 * The early-access waitlist that every upgrade prompt opens while paid plans
 * are not on sale (lib/waitlist.ts).
 *
 * The prompt that opens it passes its own trigger, so the list records which
 * limit made someone want more without asking them. Signed in, joining is one
 * click and adds a saved exam straight away; signed out, it takes an email.
 */

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h2 {
    margin: 0;
    padding-right: 1.5rem;
  }

  p {
    margin: 0;
    font-size: var(--text-base);
    color: var(--text-body);
  }
`;

const Bonus = styled.p`
  && {
    padding: 0.8rem 1rem;
    border-radius: var(--radius-control);
    background: var(--green-tint);
    border: 1px solid var(--green-edge);
    font-size: var(--text-sm);
  }
`;

const Small = styled.p`
  && {
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  a {
    text-decoration: underline;
    text-underline-offset: 2px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

/* Off-screen rather than display:none, which some bots know to skip. */
const Trap = styled.input`
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  opacity: 0;
`;

const LinkButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: var(--text-sm);
  color: var(--text-body);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover {
    color: var(--leafgreen);
  }
`;

const ChipButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.6rem;
  font: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-body);
  cursor: pointer;
`;

const PITCH: Record<WaitlistPlan, { title: string; text: string }> = {
  pro: {
    title: "Join the Pro waitlist",
    text: "Pro — unlimited saved exams and practices, PDF export and no ads — is not on sale yet. Join the list and we will tell you when it opens."
  },
  academy: {
    title: "Join the Academy waitlist",
    text: "Academy — everything in Pro for the teachers in your school, a shared question bank, and your school's name and colours on what you share — is not on sale yet. Join the list and we will tell you when it opens."
  }
};

export function WaitlistDialog({
  plan,
  trigger,
  signedIn,
  bonusAvailable = true,
  onClose,
  onJoined
}: {
  plan: WaitlistPlan;
  trigger: WaitlistTrigger;
  signedIn: boolean;
  /** False for a teacher who has already earned the extra exam elsewhere. */
  bonusAvailable?: boolean;
  onClose: () => void;
  /** After a successful join, when the dialog is dismissed. */
  onJoined?: (bonus: number) => void;
}) {
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [teachers, setTeachers] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);

  const academy = plan === "academy";
  const teacherCount = teachers.trim() ? Number(teachers) : null;
  const teachersInvalid =
    teacherCount !== null &&
    (!Number.isInteger(teacherCount) ||
      teacherCount < 1 ||
      teacherCount > 1000);
  const canSubmit =
    (signedIn || email.trim().length > 0) && !teachersInvalid && !busy;

  const close = () => {
    onClose();
    if (bonus !== null) onJoined?.(bonus);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          trigger,
          email: signedIn ? undefined : email.trim(),
          schoolName: academy ? schoolName.trim() : undefined,
          teacherCount: academy ? teacherCount : undefined,
          note: note.trim(),
          newsConsent: consent,
          website: trap
        })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "Could not join the waitlist");
        return;
      }
      setBonus(body?.bonus ?? 0);
    } catch {
      setError("Could not join the waitlist");
    } finally {
      setBusy(false);
    }
  };

  if (bonus !== null) {
    return (
      <Modal closeModal={close} label="You are on the waitlist">
        <Body>
          <h2>You are on the list</h2>
          <p>
            {`We will tell you as soon as ${academy ? "Academy" : "Pro"} opens.`}
          </p>
          {bonus > 0 ? (
            <Bonus>
              {bonus === 1
                ? "As a thank-you, your free account now keeps one more saved exam."
                : `As a thank-you, your free account now keeps ${bonus} more saved exams.`}
            </Bonus>
          ) : signedIn ? null : (
            <Small>
              <Link href="/signup">Create a free account</Link> and join from
              there to get an extra saved exam.
            </Small>
          )}
          <Row>
            <Button text="Done" onClick={close} />
          </Row>
        </Body>
      </Modal>
    );
  }

  return (
    <Modal closeModal={onClose} label={PITCH[plan].title}>
      <Body>
        <h2>{PITCH[plan].title}</h2>
        <p>{PITCH[plan].text}</p>

        {signedIn ? (
          bonusAvailable ? (
            <Bonus>
              Joining adds an extra saved exam to your free account, straight
              away.
            </Bonus>
          ) : null
        ) : (
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@school.example"
            maxLength={254}
            required
          />
        )}

        {academy ? (
          <>
            <Input
              type="text"
              label="School name (optional)"
              value={schoolName}
              onChange={setSchoolName}
              placeholder="St Mary's Language Academy"
              maxLength={80}
            />
            <Input
              type="number"
              label="How many teachers? (optional)"
              value={teachers}
              onChange={setTeachers}
              placeholder="5"
              error={teachersInvalid ? "A number from 1 to 1000" : undefined}
            />
          </>
        ) : null}

        <Input
          type="text"
          label="What would you use it for? (optional)"
          value={note}
          onChange={setNote}
          maxLength={500}
          isTextArea
        />

        <Trap
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />

        <Checkbox
          label="Also email me SpeakGen news and early-access offers (optional)"
          checked={consent}
          onChange={setConsent}
        />

        {error ? (
          <p role="alert" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        ) : null}

        <Row>
          <Button
            text={busy ? "Joining…" : "Join the waitlist"}
            disabled={!canSubmit}
            onClick={submit}
          />
          <Button text="Not now" secondary onClick={onClose} />
        </Row>

        <Small>
          {`We use your email to tell you when ${academy ? "Academy" : "Pro"} opens, and for news only if you tick the box. You can ask us to remove you at any time. See the `}
          <Link href="/privacy">privacy policy</Link>.
        </Small>
      </Body>
    </Modal>
  );
}

/**
 * A prompt that opens the waitlist. `joined` swaps it for a line saying so,
 * rather than asking someone to join a list they are already on.
 *
 * After a join the page is refreshed, because the server-rendered limits and
 * counts around the button have just changed.
 */
export default function WaitlistButton({
  plan,
  trigger,
  signedIn,
  joined = false,
  bonusAvailable = true,
  text,
  variant = "primary",
  onJoined
}: {
  plan: WaitlistPlan;
  trigger: WaitlistTrigger;
  signedIn: boolean;
  joined?: boolean;
  bonusAvailable?: boolean;
  text?: string;
  variant?: "primary" | "secondary" | "link" | "chip";
  onJoined?: (bonus: number) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  /* "the waitlist" rather than naming the plan: `joined` comes from any row,
     and a teacher on the Academy list is not on the Pro one. */
  if (joined) {
    return <Small as="span">You are on the waitlist</Small>;
  }

  const label = text ?? "Join the waitlist";
  const show = () => setOpen(true);

  return (
    <>
      {variant === "link" ? (
        <LinkButton type="button" onClick={show}>
          {label}
        </LinkButton>
      ) : variant === "chip" ? (
        <ChipButton type="button" className="glass" onClick={show}>
          {label}
        </ChipButton>
      ) : (
        <Button
          text={label}
          secondary={variant === "secondary"}
          onClick={show}
        />
      )}
      {open ? (
        <WaitlistDialog
          plan={plan}
          trigger={trigger}
          signedIn={signedIn}
          bonusAvailable={bonusAvailable}
          onClose={() => setOpen(false)}
          onJoined={(bonus) => {
            if (onJoined) onJoined(bonus);
            else router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
