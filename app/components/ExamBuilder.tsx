"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Modal from "@/app/components/ui/Modal";
import QuestionForm from "@/app/components/QuestionForm";
import type { QuestionRow } from "@/lib/questions";
import Button from "@/app/components/ui/Button";
import QuestionPreview, { ThemePills } from "@/app/components/QuestionPreview";
import type { ExamSlot } from "@/lib/cambridgeBlueprints";

const Wrap = styled.div`
  width: 100%;
  max-width: 820px;
`;

const Field = styled.label`
  display: block;
  margin-bottom: 1.25rem;

  span {
    display: block;
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-bottom: 0.35rem;
  }

  input {
    width: 100%;
    font-family: inherit;
    font-size: var(--text-base);
    color: var(--text-body);
    background: #fff;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--verylightgrey);
    border-radius: 0.6rem;
  }
`;

/* The same outline language as the empty theme box: transparent with a dashed
   edge, so it reads as a space waiting to be filled rather than a control. */
const BeforeNamed = styled.div`
  background: transparent;
  border: 1.5px dashed var(--field-edge);
  border-radius: var(--radius-card);
  padding: 2rem 1.5rem;
  text-align: center;

  strong {
    display: block;
    font-size: var(--text-lg);
    color: var(--text-heading);
    margin-bottom: 0.35rem;
  }

  span {
    display: block;
    max-width: 44ch;
    margin: 0 auto;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

/* Sits under the list rather than beside the picker: writing a question is
   the way out when nothing here fits, not the first thing to reach for. */
const WriteNew = styled.button`
  appearance: none;
  background: none;
  border: none;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  cursor: pointer;
  font-family: var(--font-body), sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--green-600);
  text-align: left;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  &:focus-visible {
    outline: 2px solid var(--green-600);
    outline-offset: 2px;
  }
`;

const ModalHeading = styled.h2`
  margin: 0 0 0.25rem;
  font-size: var(--text-xl);
`;

const ModalSub = styled.p`
  margin: 0 0 1.5rem;
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;

  p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

const Slot = styled.div`
  padding: 1rem 1.1rem;
  border-radius: 0.9rem;
  margin-bottom: 0.9rem;
`;

const SlotHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;

  strong {
    color: var(--text-body);
  }
`;

const Chosen = styled.div`
  font-size: var(--text-base);
  color: var(--text-body);
  line-height: 1.5;
  white-space: pre-line;
`;

const Search = styled.input`
  width: 100%;
  font-family: inherit;
  font-size: var(--text-sm);
  color: var(--text-body);
  background: #fff;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--verylightgrey);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
`;

// A scrolling list rather than a dropdown: a select truncates, hides the themes,
// and cannot be searched. Part 1 alone has sixty-odd questions.
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 260px;
  overflow-y: auto;
  border: 1px solid var(--verylightgrey);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.6);
`;

const Row = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem 0.7rem;
  border-bottom: 1px solid var(--verylightgrey);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(98, 204, 84, 0.08);
  }
`;

const RowText = styled.div`
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-body);
  line-height: 1.45;
  white-space: pre-line;
`;

const AddButton = styled.button`
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--verylightgrey);
  background: #fff;
  color: var(--text-body);
  font-size: var(--text-lg);
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: var(--limegreen);
  }
`;

const Notice = styled.div`
  padding: 1rem 1.25rem;
  border-radius: 0.9rem;
  margin-bottom: 1.25rem;
  color: var(--text-body);
  border: 1px solid #f0c98a;
  background: #fff8ec;

  strong {
    display: block;
    margin-bottom: 0.3rem;
  }
`;

export type PickerQuestion = {
  id: number;
  part: string;
  statement: string;
  statement_two?: string | null;
  follow_up?: string | null;
  decision?: string | null;
  themes: string[];
  image_ids: number[];
  prompts: string[];
};

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
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [search, setSearch] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [saving, setSaving] = useState(false);
  /* The server sent the pool for this page, so a question written without
     leaving has to be added to it here. */
  const [allQuestions, setAllQuestions] = useState<PickerQuestion[]>(questions);
  const [writingFor, setWritingFor] = useState<ExamSlot | null>(null);

  const byPart = useMemo(() => {
    const map: Record<string, PickerQuestion[]> = {};
    for (const question of allQuestions) {
      (map[question.part] ??= []).push(question);
    }
    return map;
  }, [allQuestions]);

  const byId = useMemo(
    () => new Map(allQuestions.map((q) => [q.id, q])),
    [allQuestions]
  );

  /* Written from inside a slot, so it goes into the pool and straight into the
     slot that asked for it — otherwise a teacher would have to go and find the
     question they had just written in the list they were trying to skip. */
  const handleCreated = (slot: ExamSlot, created: QuestionRow) => {
    const question: PickerQuestion = {
      id: created.id,
      part: created.part,
      statement: created.statement,
      statement_two: created.statement_two,
      follow_up: created.follow_up,
      decision: created.decision,
      themes: created.themes ?? [],
      image_ids: created.image_ids ?? [],
      prompts: created.prompts ?? []
    };

    setAllQuestions((current) => [question, ...current]);
    setPicked((p) => ({ ...p, [slotKey(slot)]: question.id }));
    setWritingFor(null);
  };

  const named = title.trim().length > 0;
  const complete = named && slots.every((s) => picked[slotKey(s)]);

  /**
   * One random question per slot. The two Part 2 slots are filled from
   * different questions where there are enough, because the real exam gives
   * each candidate their own photographs.
   */
  const randomise = () => {
    const next: Record<string, number> = {};
    const usedByPart: Record<string, Set<number>> = {};

    for (const slot of slots) {
      const pool = byPart[slot.part] ?? [];
      if (pool.length === 0) continue;

      const used = (usedByPart[slot.part] ??= new Set());
      const fresh = pool.filter((q) => !used.has(q.id));
      const from = fresh.length > 0 ? fresh : pool;
      const chosen = from[Math.floor(Math.random() * from.length)];

      used.add(chosen.id);
      next[slotKey(slot)] = chosen.id;
    }

    setPicked(next);
    setError(null);
  };

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
            question_id: picked[slotKey(s)]
          }))
        })
      });

      if (res.status === 402) {
        // Plan limit, not a bad request. Show the upgrade path, not an error.
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
          autoFocus
        />
      </Field>

      {/* The questions wait for a name. The title sat above a long list of
          pickers, so it was easy to scroll past, choose five questions and
          only then find out the exam could not be saved. */}
      {!named ? (
        <BeforeNamed>
          <strong>Name this exam to start</strong>
          <span>The questions for each part appear once it has a title.</span>
        </BeforeNamed>
      ) : (
        <>
          <TopBar>
            <p>Pick a question for each part, or start from a random set.</p>
            <Button text="Randomise all parts" secondary onClick={randomise} />
          </TopBar>

          {slots.map((slot) => {
            const key = slotKey(slot);
            const pool = byPart[slot.part] ?? [];
            const chosenId = picked[key];
            const chosen = chosenId ? byId.get(chosenId) : undefined;
            const term = (search[key] ?? "").trim().toLowerCase();
            const shown = term
              ? pool.filter(
                  (q) =>
                    q.statement.toLowerCase().includes(term) ||
                    q.themes.some((t) => t.includes(term.replace(/\s+/g, "_")))
                )
              : pool;

            return (
              <Slot key={key} className="glass">
                <SlotHead>
                  <strong>{slotLabel(slot)}</strong>
                  {chosen ? (
                    <Button
                      text="Change"
                      secondary
                      onClick={() =>
                        setPicked((p) => {
                          const next = { ...p };
                          delete next[key];
                          return next;
                        })
                      }
                    />
                  ) : (
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--text-xs)"
                      }}
                    >
                      {`${pool.length} available`}
                    </span>
                  )}
                </SlotHead>

                {chosen ? (
                  <>
                    <Chosen>{chosen.statement}</Chosen>
                    <ThemePills themes={chosen.themes} />
                    <QuestionPreview question={chosen} />
                  </>
                ) : pool.length === 0 ? (
                  <>
                    <span
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "var(--text-sm)"
                      }}
                    >
                      {`No ${levelLabel} Part ${slot.part} questions available yet.`}
                    </span>
                    <WriteNew type="button" onClick={() => setWritingFor(slot)}>
                      {`+ Write a ${levelLabel} Part ${slot.part} question`}
                    </WriteNew>
                  </>
                ) : (
                  <>
                    {pool.length > 8 ? (
                      <Search
                        value={search[key] ?? ""}
                        onChange={(e) =>
                          setSearch((s) => ({ ...s, [key]: e.target.value }))
                        }
                        placeholder="Search these questions…"
                      />
                    ) : null}
                    <List>
                      {shown.map((question) => (
                        <Row key={question.id}>
                          <RowText>
                            {question.statement}
                            <ThemePills themes={question.themes} />
                          </RowText>
                          <AddButton
                            type="button"
                            aria-label={`Use "${question.statement.slice(0, 40)}"`}
                            onClick={() =>
                              setPicked((p) => ({ ...p, [key]: question.id }))
                            }
                          >
                            +
                          </AddButton>
                        </Row>
                      ))}
                      {shown.length === 0 ? (
                        <Row>
                          <RowText style={{ color: "var(--text-muted)" }}>
                            Nothing matches that search.
                          </RowText>
                        </Row>
                      ) : null}
                    </List>
                    <WriteNew type="button" onClick={() => setWritingFor(slot)}>
                      {`+ Write a ${levelLabel} Part ${slot.part} question`}
                    </WriteNew>
                  </>
                )}
              </Slot>
            );
          })}
        </>
      )}

      {error ? (
        <p style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {error}
        </p>
      ) : null}

      {writingFor ? (
        <Modal
          closeModal={() => setWritingFor(null)}
          label={`Write a ${levelLabel} Part ${writingFor.part} question`}
        >
          <ModalHeading>{`New ${levelLabel} Part ${writingFor.part} question`}</ModalHeading>
          <ModalSub>
            It is saved to your question bank as well, and goes straight into
            this part of the exam.
          </ModalSub>
          {/* The level and part are the slot's, so they are not up for
              changing here. */}
          <QuestionForm
            levelParam={level.toUpperCase()}
            partParam={writingFor.part}
            lockLevelAndPart
            onCreated={(created) => handleCreated(writingFor, created)}
          />
        </Modal>
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
