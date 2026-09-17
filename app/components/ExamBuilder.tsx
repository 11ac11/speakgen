"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import type { ExamSlot } from "@/lib/cambridgeBlueprints";

const Wrap = styled.div`
  width: 100%;
  max-width: 820px;
`;

const Field = styled.label`
  display: block;
  margin-bottom: 1.5rem;

  span {
    display: block;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--lightgrey);
    margin-bottom: 0.35rem;
  }

  input,
  select {
    width: 100%;
    font-family: inherit;
    font-size: 1rem;
    color: var(--slategrey);
    background: #fff;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--verylightgrey);
    border-radius: 0.6rem;
  }
`;

const SlotRow = styled.div`
  padding: 0.9rem 1.1rem;
  border-radius: 0.9rem;
  margin-bottom: 0.75rem;

  strong {
    display: block;
    margin-bottom: 0.4rem;
    color: var(--slategrey);
  }
`;

const Notice = styled.div`
  padding: 1rem 1.25rem;
  border-radius: 0.9rem;
  margin-bottom: 1.25rem;
  color: var(--slategrey);
  border: 1px solid #f0c98a;
  background: #fff8ec;

  strong {
    display: block;
    margin-bottom: 0.3rem;
  }
`;

export type PickerQuestion = { id: number; part: string; statement: string };

function slotKey(slot: ExamSlot) {
  return `${slot.part}${slot.candidate}`;
}

function slotLabel(slot: ExamSlot) {
  return slot.candidate === "-"
    ? `Part ${slot.part}`
    : `Part ${slot.part} — candidate ${slot.candidate}`;
}

export default function ExamBuilder({
  level,
  levelLabel,
  slots,
  questions
}: {
  level: string;
  levelLabel: string;
  slots: ExamSlot[];
  questions: PickerQuestion[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [saving, setSaving] = useState(false);

  const complete =
    title.trim().length > 0 && slots.every((s) => picked[slotKey(s)]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          title: title.trim(),
          slots: slots.map((s) => ({
            part: s.part,
            candidate: s.candidate,
            question_id: Number(picked[slotKey(s)])
          }))
        })
      });

      if (res.status === 402) {
        // Plan limit, not a bad request. Show the upgrade path instead of an error.
        setLimitReached(true);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not save the exam");
        return;
      }

      const exam = await res.json();
      router.push(`/${level}/exams/${exam.id}`);
    } catch {
      setError("Could not save the exam");
    } finally {
      setSaving(false);
    }
  };

  if (limitReached) {
    return (
      <Wrap>
        <Notice>
          <strong>You have used your free exam</strong>
          The free plan includes one saved exam. Upgrade for unlimited exams and
          practices, PDF export and no ads — or delete an existing exam to make
          room.
        </Notice>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button text="See plans" onClick={() => router.push("/pricing")} />
          <Button
            text="Back to exams"
            secondary
            onClick={() => router.push(`/${level}/exams`)}
          />
        </div>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <Field>
        <span>Exam title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`${levelLabel} — mock exam`}
          maxLength={120}
        />
      </Field>

      {slots.map((slot) => {
        const key = slotKey(slot);
        const forPart = questions.filter((q) => q.part === slot.part);

        return (
          <SlotRow key={key} className="glass">
            <strong>{slotLabel(slot)}</strong>
            {forPart.length === 0 ? (
              <span style={{ color: "var(--lightgrey)", fontSize: "0.9rem" }}>
                {`No ${levelLabel} Part ${slot.part} questions available yet.`}
              </span>
            ) : (
              <select
                value={picked[key] ?? ""}
                onChange={(e) =>
                  setPicked((p) => ({ ...p, [key]: e.target.value }))
                }
                style={{
                  width: "100%",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  color: "var(--slategrey)",
                  background: "#fff",
                  padding: "0.5rem 0.6rem",
                  border: "1px solid var(--verylightgrey)",
                  borderRadius: "0.5rem"
                }}
              >
                <option value="">Choose a question…</option>
                {forPart.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.statement.replace(/\s+/g, " ").slice(0, 90)}
                  </option>
                ))}
              </select>
            )}
          </SlotRow>
        );
      })}

      {error ? (
        <p style={{ color: "#b3261e", fontSize: "0.9rem" }}>{error}</p>
      ) : null}

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
        <Button
          text={saving ? "Saving…" : "Save exam"}
          disabled={!complete || saving}
          onClick={save}
        />
        <Button
          text="Cancel"
          secondary
          onClick={() => router.push(`/${level}/exams`)}
        />
      </div>
    </Wrap>
  );
}
