"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import Button from "@/app/components/ui/Button";
import { Notice } from "@/app/components/ui/Notice";
import WaitlistButton from "@/app/components/Waitlist";
import ThemeSelector from "@/app/components/ThemeSelector";
import { getQuestionPartOptions, THEME_VALUES_FOR_PILLS } from "@/constants";

const Wrap = styled.div`
  width: 100%;
  max-width: 820px;
`;

const Field = styled.label`
  display: block;

  span.label {
    display: block;
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-label);
    margin-bottom: 0.35rem;
  }

  input,
  select {
    width: 100%;
    font-family: inherit;
    font-size: var(--text-base);
    color: var(--text-body);
    background: #fff;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--field-edge);
    border-radius: var(--radius-control);
  }
`;

const Presets = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const Preset = styled.button<{ $active: boolean }>`
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

  &:hover {
    border-color: ${(p) =>
      p.$active ? "var(--green-600)" : "var(--field-edge-hover)"};
  }
`;

/* flex-start rather than stretch: the themes card is twice the height of the
   parts card because it carries every pill, and stretching left a card that was
   two thirds empty space. */
const Choosers = styled.div`
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;

  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }
`;

const Chooser = styled.div`
  flex: 1;
  background: #fff;
  border: 1.5px solid var(--field-edge);
  border-radius: var(--radius-card);
  padding: 1.35rem;

  h2 {
    margin: 0 0 0.9rem;
    font-size: var(--text-lg);
    color: var(--text-heading);
  }
`;

const Choice = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  cursor: pointer;
  margin-bottom: 0.9rem;

  input {
    margin: 0.15rem 0 0;
    width: 18px;
    height: 18px;
    accent-color: var(--green-600);
  }

  span.name {
    display: block;
    font-size: var(--text-base);
    font-weight: 500;
    color: var(--text-heading);
  }

  span.hint {
    display: block;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
`;

const Indented = styled.div`
  margin-left: 1.8rem;
`;

const Row = styled.div`
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;

  & > *:first-child {
    flex: 1;
  }

  @media only screen and (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

/* Green when the practice can be filled, amber-free and plain when it cannot:
   an empty pool is not an error the teacher made, it is a bank that is not big
   enough yet, so it reads as an instruction rather than a failure. */
const Summary = styled.div<{ $ok: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 1.1rem 1.35rem;
  border-radius: var(--radius-card);
  margin-bottom: 1.5rem;
  background: ${(p) => (p.$ok ? "var(--green-tint)" : "var(--off-bg)")};
  border: 1px solid ${(p) => (p.$ok ? "var(--green-edge)" : "var(--off-edge)")};

  p {
    margin: 0;
    font-size: var(--text-sm);
    line-height: 1.55;
    color: var(--text-body);
  }

  strong {
    font-weight: 500;
  }

  a {
    color: var(--green-600);
    font-weight: 500;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const FormError = styled.p`
  margin: 0 0 1rem;
  font-size: var(--text-sm);
  color: var(--danger);
`;

const COUNT_CHOICES = [5, 10, 15, 20];

type Preset = "mix" | "theme" | "part";

/** The practice being edited, when the form is opened on an existing one. */
export type EditingPractice = {
  id: number;
  title: string;
  part: number | null;
  themes: string[];
  question_count: number;
};

export default function PracticeBuilder({
  level,
  levelLabel,
  practice
}: {
  level: string;
  levelLabel: string;
  practice?: EditingPractice;
}) {
  const router = useRouter();
  const isEdit = !!practice;

  /* The part is a string here because that is what the dropdown and the query
     string deal in; the row stores a number, so it is widened on the way in and
     narrowed again by the API's schema. */
  const [title, setTitle] = useState(practice?.title ?? "");
  const [part, setPart] = useState<string | null>(
    practice?.part != null ? String(practice.part) : null
  );
  const [themes, setThemes] = useState<string[]>(practice?.themes ?? []);
  const [count, setCount] = useState(practice?.question_count ?? 10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* Set by a 402. Practices earn no bonus for joining, so this only says where
     more is coming from, and the form stays as it was. */
  const [limitReached, setLimitReached] = useState<{
    limit: number;
    waitlist: boolean;
    joined: boolean;
  } | null>(null);

  /* Derived from the two controls rather than stored. A preset is a shortcut
     that sets them, so the chip that lights up is whichever one describes where
     they have ended up — including after they change a control by hand. The
     fourth combination, one part and a theme, lights nothing, which is honest:
     it is reachable here and is not one of the three named flows. */
  const activePreset: Preset | null = useMemo(() => {
    if (part === null && themes.length === 0) return "mix";
    if (part === null && themes.length > 0) return "theme";
    if (part !== null && themes.length === 0) return "part";
    return null;
  }, [part, themes]);

  const parts = getQuestionPartOptions(level);

  const [available, setAvailable] = useState<number | null>(null);
  const [counting, setCounting] = useState(true);

  /* The count follows the filter, and the filter changes as fast as a teacher
     can click, so each run cancels the one before it. Without the abort an
     earlier, slower response could land last and leave the form showing a
     number for a filter that is no longer on screen. */
  useEffect(() => {
    const controller = new AbortController();
    const query = new URLSearchParams({ level });
    if (part !== null) query.set("part", part);
    for (const theme of themes) query.append("theme", theme);

    setCounting(true);
    fetch(`/api/practices/available?${query.toString()}`, {
      signal: controller.signal
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (body && typeof body.available === "number") {
          setAvailable(body.available);
        }
        setCounting(false);
      })
      .catch(() => {
        // An abort is the normal path, not a failure worth showing.
      });

    return () => controller.abort();
  }, [level, part, themes]);

  /* Never offer to draw more than exists. The list shrinks rather than the
     chosen number being silently clamped on save, so what the form says and
     what it does are the same thing. */
  const countChoices = useMemo(() => {
    if (available === null) return COUNT_CHOICES;
    const fits = COUNT_CHOICES.filter((n) => n <= available);
    return fits.length > 0 ? fits : [];
  }, [available]);

  useEffect(() => {
    if (countChoices.length > 0 && !countChoices.includes(count)) {
      setCount(countChoices[countChoices.length - 1]);
    }
  }, [countChoices, count]);

  const enoughQuestions = available !== null && available >= 1;
  const named = title.trim().length > 0;
  const canSave = named && enoughQuestions && countChoices.length > 0;

  /* Why Create is off. The question count already has its own explanation
     beside the chooser, so it is worded shorter here; the name has none at all,
     and an empty title box is the reason nobody can see. */
  const blockers = [
    !named ? "Give the practice a name" : null,
    available !== null && !enoughQuestions
      ? "No questions match this yet — widen the level, part or themes"
      : null,
    enoughQuestions && countChoices.length === 0
      ? "Choose how many questions to draw"
      : null
  ].filter((reason): reason is string => !!reason);

  const applyPreset = (preset: Preset) => {
    if (preset === "mix") {
      setPart(null);
      setThemes([]);
    } else if (preset === "theme") {
      setPart(null);
      if (themes.length === 0) setThemes([]);
    } else {
      setPart(parts[0] ?? "1");
      setThemes([]);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);

    /* The level is only sent on create. On an edit it is read from the row —
       changing it would be a different practice, not an edit of this one. */
    try {
      const res = await fetch(
        isEdit ? `/api/practices/${practice.id}` : "/api/practices",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(isEdit ? {} : { level }),
            title: title.trim(),
            part,
            themes,
            question_count: count
          })
        }
      );

      if (res.status === 402) {
        const body = await res.json().catch(() => null);
        setLimitReached({
          limit: body?.limit ?? 3,
          waitlist: body?.waitlist?.mode ?? false,
          joined: body?.waitlist?.joined ?? false
        });
        setSaving(false);
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(
          body?.error ?? `Could not ${isEdit ? "save" : "create"} the practice`
        );
        setSaving(false);
        return;
      }

      const saved = await res.json();
      router.push(`/${level}/practices/${isEdit ? practice.id : saved.id}`);
      // The run page draws a new set on every render, so it has to be re-run
      // rather than served from the client cache this navigation would use.
      router.refresh();
    } catch {
      setError(`Could not ${isEdit ? "save" : "create"} the practice`);
      setSaving(false);
    }
  };

  const partName = part === null ? "any part" : `Part ${part}`;

  /* Named rather than counted while the list is short enough to read: "on
     Technology and The future" tells a teacher what they picked, where "on 2
     themes" makes them look back up at the chooser to find out. */
  const themeName = (() => {
    if (themes.length === 0) return "any theme";

    const labels = themes.map(
      (slug) =>
        THEME_VALUES_FOR_PILLS.find((t) => t.value === slug)?.label ?? slug
    );

    if (labels.length <= 2) return labels.join(" and ");
    return `${labels.length} themes`;
  })();

  return (
    <Wrap>
      <h2 style={{ marginTop: 0, marginBottom: "0.75rem" }}>
        How do you want to practise?
      </h2>

      <Presets>
        <Preset
          type="button"
          $active={activePreset === "mix"}
          aria-pressed={activePreset === "mix"}
          onClick={() => applyPreset("mix")}
        >
          Mixed
        </Preset>
        <Preset
          type="button"
          $active={activePreset === "theme"}
          aria-pressed={activePreset === "theme"}
          onClick={() => applyPreset("theme")}
        >
          Themed
        </Preset>
        <Preset
          type="button"
          $active={activePreset === "part"}
          aria-pressed={activePreset === "part"}
          onClick={() => applyPreset("part")}
        >
          Single part
        </Preset>
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--text-faint)",
            paddingLeft: "0.25rem"
          }}
        >
          — shortcuts. Or set the two yourself:
        </span>
      </Presets>

      <Choosers>
        <Chooser>
          <h2>Which parts?</h2>
          <Choice>
            <input
              type="radio"
              name="parts"
              checked={part === null}
              onChange={() => setPart(null)}
            />
            <span>
              <span className="name">All parts</span>
              <span className="hint">{`Draws across Parts ${parts[0]}–${parts[parts.length - 1]}.`}</span>
            </span>
          </Choice>
          <Choice>
            <input
              type="radio"
              name="parts"
              checked={part !== null}
              onChange={() => setPart(parts[0] ?? "1")}
            />
            <span>
              <span className="name">Just one part</span>
              <span className="hint">Drill the bit they struggle with.</span>
            </span>
          </Choice>
          <Indented>
            <Field>
              <select
                aria-label="Which part"
                value={part ?? ""}
                disabled={part === null}
                onChange={(e) => setPart(e.target.value)}
                style={{ maxWidth: "190px" }}
              >
                {parts.map((p) => (
                  <option key={p} value={p}>{`Part ${p}`}</option>
                ))}
              </select>
            </Field>
          </Indented>
        </Chooser>

        <Chooser>
          <h2>Which themes?</h2>
          <Choice>
            <input
              type="radio"
              name="themes"
              checked={themes.length === 0}
              onChange={() => setThemes([])}
            />
            <span>
              <span className="name">Any theme</span>
              <span className="hint">Whatever topics come up.</span>
            </span>
          </Choice>
          <Choice>
            <input
              type="radio"
              name="themes"
              checked={themes.length > 0}
              readOnly
            />
            <span>
              <span className="name">Choose one or two</span>
              <span className="hint">Everything on the same topic.</span>
            </span>
          </Choice>
          <Indented>
            <ThemeSelector themes={themes} setThemes={setThemes} />
          </Indented>
        </Chooser>
      </Choosers>

      <Row>
        <Field>
          <span className="label">Name</span>
          <input
            type="text"
            value={title}
            maxLength={120}
            placeholder="Monday warm-up"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field style={{ width: "210px" }}>
          <span className="label">How many questions</span>
          {/* An em dash rather than a number when nothing can be drawn. It
              showed the last valid count, which read as a promise the practice
              could not keep while the summary below said none were available. */}
          <select
            value={countChoices.length === 0 ? "" : count}
            disabled={countChoices.length === 0}
            onChange={(e) => setCount(Number(e.target.value))}
          >
            {countChoices.length === 0 ? (
              <option value="">—</option>
            ) : (
              countChoices.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))
            )}
          </select>
        </Field>
      </Row>

      <Summary $ok={enoughQuestions && countChoices.length > 0}>
        {enoughQuestions && countChoices.length > 0 ? (
          <p>
            <strong>{`${count} questions from ${partName}, on ${themeName}.`}</strong>{" "}
            <span style={{ color: "var(--text-muted)" }}>
              {`Redrawn every time you run it, from the ${available} ${levelLabel} question${
                available === 1 ? "" : "s"
              } available to you.`}
            </span>
          </p>
        ) : counting && available === null ? (
          <p style={{ color: "var(--text-muted)" }}>
            Counting what this can draw from…
          </p>
        ) : (
          <p>
            <strong>
              {available === 0
                ? `No ${levelLabel} questions match ${partName}, ${themeName}.`
                : `Only ${available} ${levelLabel} question${
                    available === 1 ? "" : "s"
                  } match ${partName}, ${themeName}.`}
            </strong>{" "}
            <span style={{ color: "var(--text-muted)" }}>
              Create more questions to activate this —{" "}
            </span>
            <Link href="/questions/new">write one now</Link>
            <span style={{ color: "var(--text-muted)" }}>
              , or widen the parts and themes above.
            </span>
          </p>
        )}
      </Summary>

      {!saving ? (
        <Notice title="Before you can create it:" reasons={blockers} />
      ) : null}

      {/* Red, and separate: this one is a save that actually failed. */}
      {error ? <FormError>{error}</FormError> : null}

      {limitReached ? (
        <Notice>
          <p>
            <strong>{`You have used your ${limitReached.limit} practices`}</strong>
          </p>
          <p>
            {limitReached.waitlist
              ? limitReached.joined
                ? "You are on the Pro waitlist, and we will tell you when unlimited practices open. Until then, delete a practice you no longer need to make room."
                : "Pro, with unlimited practices and exams, is coming soon. Join the waitlist to hear when it opens, or delete a practice you no longer need to make room."
              : "Upgrade for unlimited practices and exams, or delete a practice you no longer need to make room."}
          </p>
        </Notice>
      ) : null}
      {limitReached && !limitReached.joined ? (
        <div>
          {limitReached.waitlist ? (
            <WaitlistButton
              plan="pro"
              trigger="practice_limit"
              signedIn
              onJoined={() =>
                setLimitReached({ ...limitReached, joined: true })
              }
            />
          ) : (
            <Button text="See plans" onClick={() => router.push("/pricing")} />
          )}
        </div>
      ) : null}

      <Actions>
        <Button
          text="Cancel"
          secondary
          onClick={() =>
            router.push(
              isEdit
                ? `/${level}/practices/${practice.id}`
                : "/dashboard?tab=practices"
            )
          }
        />
        <Button
          text={
            saving
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save changes"
                : "Create practice"
          }
          disabled={!canSave || saving}
          onClick={save}
        />
      </Actions>
    </Wrap>
  );
}
