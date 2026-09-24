"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui";
import { Notice } from "@/app/components/ui/Notice";
import { authClient } from "@/lib/auth-client";
import type { DeletionPlan } from "@/lib/account";

/**
 * Deleting your own account, from Settings.
 *
 * It shows what will happen before asking for anything — what is deleted,
 * what stays with each school and who takes it over — because that is the
 * part a teacher cannot guess, and the part they cannot undo. Confirming means
 * typing the account's email address, which works whether they sign in with a
 * password or with Google.
 */

const Panel = styled.div`
  width: 100%;
  padding: 1.75rem;
  border-radius: 1rem;
  color: var(--text-body);

  h2 {
    margin-bottom: 0.3rem;
  }

  > p {
    color: var(--text-muted);
    font-size: var(--text-sm);
    margin-top: 0;
  }
`;

/* A cross against each thing that goes, rather than a bullet: the list is
   what is lost, and it should read that way at a glance. The size is set on
   the li itself, because globals.css gives every li the base size. */
const Plan = styled.ul`
  list-style: none;
  margin: 0.75rem 0 1.25rem;
  padding: 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    margin-bottom: 0.5rem;
    font-size: var(--text-sm);
    line-height: 1.5;
    color: var(--text-body);
  }

  svg {
    flex: none;
    width: 16px;
    height: 16px;
    margin-top: 0.15rem;
    color: var(--danger);
  }
`;

function Cross() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  max-width: 28rem;
`;

const ErrorText = styled.p`
  && {
    color: var(--danger);
    font-size: var(--text-sm);
    margin: 0.5rem 0 0;
  }
`;

function count(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

export default function DeleteAccountPanel({ email }: { email: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<DeletionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account");
      if (!res.ok) throw new Error();
      setPlan(await res.json());
    } catch {
      setError("Could not check what deleting your account would do.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: typed })
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "Your account could not be deleted.");
        if (body?.blockers)
          setPlan((p) => (p ? { ...p, blockers: body.blockers } : p));
        return;
      }
      // The session died with the account; this clears its cookies too.
      await authClient.signOut().catch(() => undefined);
      router.replace("/?account=deleted");
      router.refresh();
    } catch {
      setError("Your account could not be deleted. Nothing was changed.");
    } finally {
      setBusy(false);
    }
  };

  const matches = typed.trim().toLowerCase() === email.trim().toLowerCase();

  if (!plan) {
    return (
      <Panel className="glass">
        <h2>Delete your account</h2>
        <p>
          Permanently deletes your account and your own questions, exams and
          practices. You will see exactly what goes before anything is deleted.
        </p>
        <Button
          text={loading ? "Checking…" : "Delete my account…"}
          danger
          disabled={loading}
          onClick={open}
        />
        {error ? <ErrorText role="alert">{error}</ErrorText> : null}
      </Panel>
    );
  }

  const { personal, schools, blockers } = plan;

  return (
    <Panel className="glass">
      <h2>Delete your account</h2>
      <p>This cannot be undone. Deleting your account:</p>
      <Plan>
        <li>
          <Cross />
          {`Deletes your ${count(personal.questions, "question", "questions")}, ${count(personal.exams, "exam", "exams")} and ${count(personal.practices, "practice", "practices")}, and any share links to them.`}
        </li>
        {schools.map((school) =>
          school.outcome === "keep" ? (
            <li key={school.id}>
              <Cross />
              {`${school.items ? `Leaves your ${count(school.items, "item", "items")} in ${school.name} with the school, owned by ${school.successor?.name}` : `Removes you from ${school.name}`}${school.promotes ? `, and makes ${school.successor?.name} its owner` : ""}.`}
            </li>
          ) : (
            <li key={school.id}>
              <Cross />
              {`Deletes ${school.name}, as you are its last teacher, with its shared questions and branding.`}
            </li>
          )
        )}
        <li>
          <Cross />
          Signs you out everywhere.
        </li>
      </Plan>

      {blockers.length ? (
        <Notice
          title="Before you can delete your account:"
          reasons={blockers.map((b) => b.message)}
        />
      ) : (
        <Row>
          <Input
            type="text"
            label={`Type ${email} to confirm`}
            value={typed}
            onChange={setTyped}
            placeholder={email}
          />
          <Button
            text={busy ? "Deleting…" : "Delete my account"}
            danger
            disabled={busy || !matches}
            onClick={remove}
          />
        </Row>
      )}
      <div style={{ marginTop: "0.75rem" }}>
        <Button
          text="Keep my account"
          secondary
          disabled={busy}
          onClick={() => {
            setPlan(null);
            setTyped("");
            setError(null);
          }}
        />
      </div>
      {error ? <ErrorText role="alert">{error}</ErrorText> : null}
    </Panel>
  );
}
