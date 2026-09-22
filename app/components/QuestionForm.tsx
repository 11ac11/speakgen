"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import {
  Input,
  Button,
  Dropdown,
  Checkbox,
  Notice
} from "@/app/components/ui/index";
import Prompts from "./Prompts";
import { createQuestion, updateQuestion } from "@/services/questionService";
import ThemeSelector from "@/app/components/ThemeSelector";
import ImageSelectors from "./ImageSelectors";
import { getQuestionPartOptions, SUPPORTED_LEVELS } from "@/constants";
import {
  getCambridgeSpeakingTask,
  getTaskPhase
} from "@/lib/cambridgeBlueprints";
import {
  checkPartShape,
  filledImageIds,
  filledPrompts
} from "@/lib/questionRules";
import type { QuestionRow } from "@/lib/questions";

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 60px;
`;

const Hint = styled.p`
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-muted);
`;

const FormError = styled.p`
  margin: 0;
  font-size: var(--text-sm);
  color: var(--danger);
`;

/* A level or part that has already been decided: the same label the dropdown
   wears, over the value, so a settled field lines up with a live one. */
const Settled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  span.label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-label);
  }

  span.value {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-heading);
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  max-width: 300px;
`;

const QuestionForm = ({
  question,
  partParam,
  levelParam,
  lockLevelAndPart,
  lockLevel,
  onCreated
}: {
  /* Exactly what the edit page hands over: the row getQuestionById returns.
     There is no separate form shape to keep in step with it. */
  question?: QuestionRow;
  partParam?: string | undefined;
  levelParam?: string | undefined;
  /** For a caller that opened the form to fill one particular slot. */
  lockLevelAndPart?: boolean;
  /**
   * The level came from the URL and is not up for discussion, but the part
   * still is — which is what /[level]/questions/new wants.
   *
   * Separate from lockLevelAndPart because the two used to be one flag, and a
   * single flag cannot say "this half is settled and that half is not".
   */
  lockLevel?: boolean;
  /** Hands the new question back instead of leaving for the dashboard, so the
      form can be used inside something that wants to keep the page. */
  onCreated?: (created: QuestionRow) => void;
}) => {
  const router = useRouter();
  const isEdit = !!question;
  /* Editing settles both: neither travels in the update payload. Filling an
     exam slot settles both too. Arriving from /[level]/questions/new settles
     only the level. */
  const levelFixed = isEdit || !!lockLevelAndPart || !!lockLevel;
  const partFixed = isEdit || !!lockLevelAndPart;

  const [level, setLevel] = useState(levelParam?.toLowerCase() || "");
  const [part, setPart] = useState(partParam || "");
  const [statement, setStatement] = useState(question?.statement || "");
  const [statementTwo, setStatementTwo] = useState(
    question?.statement_two ?? ""
  );
  /* Optional index, not question?.instructions[0]: a question created before
     instructions existed has an empty array, and the old form of this threw. */
  const [instructionOne, setInstructionOne] = useState(
    question?.instructions?.[0] ?? ""
  );
  /* Named, because the reset after "Create another" used to blank it while the
     initial state carried this text — so the second question of a sitting
     started with an empty box that had never looked empty before. */
  const SECOND_INSTRUCTION = "Now look at all the photographs.";
  const [instructionTwo, setInstructionTwo] = useState(
    question?.instructions?.[1] || SECOND_INSTRUCTION
  );
  /* The other half of a real task, and until now only reachable through SQL:
     every user-written Part 2 in the database has no follow-up question and
     every user-written Part 3 no decision, because the form never sent either.
     The house content has both, which left teachers unable to write the thing
     they were being shown. */
  const [followUp, setFollowUp] = useState(question?.follow_up ?? "");
  const [decision, setDecision] = useState(question?.decision ?? "");
  const [prompts, setPrompts] = useState<string[]>(question?.prompts ?? []);
  const [themes, setThemes] = useState<string[]>(question?.themes ?? []);
  const [imageIds, setImageIds] = useState<(number | null)[]>(
    question?.image_ids ?? []
  );
  const [isPublic, setIsPublic] = useState(question?.public ?? true);
  const [loading, setLoading] = useState(false);
  const [createAnother, setCreateAnother] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* Part 2 needs its photographs and Part 3 its prompts — the same rule the
     database enforces. Without this the form let you save a Part 3 with one
     prompt, the insert broke a CHECK constraint, and the question was lost. */
  const partShapeError = (() => {
    let message: string | null = null;
    checkPartShape(
      level,
      part,
      { image_ids: imageIds, prompts },
      (_path, text) => {
        message = message ?? text;
      }
    );
    return message as string | null;
  })();

  // Level is required too. The level chooser starts with none chosen, and
  // submitting without one used to build a request with an empty level.
  /* Named, not just counted. A disabled Save says no without saying why, and
     the commonest reason — no theme picked — is invisible, because an empty
     theme row looks the same as one you decided against. */
  const blockers = [
    !level ? "Choose a level" : null,
    !part ? "Choose a part" : null,
    !statement.trim() ? "Write the statement" : null,
    themes.length === 0 ? "Pick at least one theme" : null,
    partShapeError
  ].filter((reason): reason is string => !!reason);

  const allFieldsCompleted = blockers.length === 0;

  const generatePlaceholderByPart = (isSecondStatement?: boolean) => {
    switch (part) {
      case "1":
        return level === "b1"
          ? "What do you usually do at the weekend?"
          : "Tell me about where you live.";
      case "2":
        if (!isSecondStatement) {
          /* Three different tasks share this part number. C2's is the
             collaborative task, so it opens with a question the pair answer
             together about two of the photographs; B1's is one photograph
             described rather than two compared. */
          if (level === "c2")
            return "Why might people choose to spend time in places like these?";
          if (level === "b1")
            return "Tell me what you can see in your photograph.";
          return "Compare the two ways how people are enjoying listening to music";
        } else {
          return `I'd like you to imagine that a television documentary is being produced on
working in the food industry. These pictures show some of the issues that are
being considered. \n \n
Talk together about the different issues related to working in the food industry
that these pictures show. Then decide which issue might stimulate most
interest.`;
        }
      case "3":
        if (!isSecondStatement) {
          if (level === "b1")
            return "A family is planning a day out together. Talk about what they could do, then decide which is best.";
          return "What might people have to consider when making decisions?";
        } else {
          return "Decide in which situation it is important to make the right decision.";
        }
      case "4":
        return level === "b1"
          ? "Do you prefer spending time indoors or outdoors?"
          : "Would you prefer to live in a modern city or a city with lots of history?";
      default:
        return "";
    }
  };

  /* Which extra fields a task has is a property of the task, so the blueprint
     decides rather than another level-and-part switch here. A task that runs a
     phase from a column is exactly a task with that column to write, and the
     phase's label doubles as the hint under the box.

     needsStatementTwo was `level === "c2" && part === "2"` — true today and
     wrong the moment a level is added whose Part 2 is single-phase, or whose
     Part 3 is not. Asking the blueprint costs the same and cannot go stale. */
  const task = getCambridgeSpeakingTask(level, part);
  const followUpPhase = getTaskPhase(task, "follow_up");
  const decisionPhase = getTaskPhase(task, "decision");
  const statementTwoPhase = getTaskPhase(task, "statement_two");

  const needsFollowUp = !!followUpPhase;
  const needsDecision = !!decisionPhase;
  const needsStatementTwo = !!statementTwoPhase;

  const generatePromptPlaceholdersByLevel = () => {
    switch (level.toLowerCase()) {
      /* B1's collaborative task prints a page of small drawings; the options
         they show are what these stand in for, so they are everyday things
         rather than the abstractions C1 and C2 argue about. */
      case "b1":
        return [
          "go to the beach",
          "visit a museum",
          "have a picnic",
          "go to the cinema",
          "stay at home"
        ];
      case "b2":
        return [];
      case "c1":
        return [
          "choosing a university",
          "starting a family",
          "moving to another country",
          "finding a job",
          "getting married"
        ];
      /* The three ideas printed under the question on a C2 long-turn card.
         Three, not five: the two empty boxes are legitimate, as at B2. */
      case "c2":
        return [
          "how attitudes form",
          "the role of education",
          "cost to society"
        ];
      default:
        return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    if (!allFieldsCompleted) return;

    setLoading(true);
    setFormError(null);
    const requestData = {
      statement: statement,
      themes: themes,
      public: isPublic,
      /* Each of these travels only when the task actually has it. The update
         route assigns a column only when its key is present, so omitting one
         leaves it alone rather than blanking it — which is what lets a teacher
         edit a house question without stripping the parts of it the form is
         not showing them. statement_two used to be sent unconditionally, so
         editing any B2 question quietly cleared it. */
      ...(needsStatementTwo && { statement_two: statementTwo }),
      ...(needsFollowUp && { follow_up: followUp }),
      ...(needsDecision && { decision: decision }),
      ...(part === "2" && {
        image_ids: filledImageIds(imageIds),
        /* Instructions are a C2 idea: only that level shows the two boxes, and
           every B2 and C1 Part 2 in the database has none. Sending them
           regardless meant B2 and C1 posted an empty first instruction, which
           the schema rejects element by element — so no Part 2 question could
           be created through this form at either level. */
        ...(level === "c2" && {
          instructions: [instructionOne, instructionTwo]
            .map((text) => text.trim())
            .filter(Boolean)
        })
      }),
      ...(part === "3" && {
        prompts: filledPrompts(prompts)
      })
    };

    /* The redirect used to live in a finally block, so it ran whether the save
       succeeded or threw. A failed save looked exactly like a successful one,
       and the question was gone. Leaving is part of succeeding now. */
    try {
      if (isEdit) {
        await updateQuestion(question.id, requestData);
      } else {
        const created = await createQuestion(level, part, requestData);

        if (onCreated) {
          setLoading(false);
          onCreated(created);
          return;
        }
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save the question"
      );
      setLoading(false);
      return;
    }

    setLoading(false);

    if (createAnother) {
      setStatement("");
      setStatementTwo("");
      setInstructionOne("");
      setInstructionTwo(SECOND_INSTRUCTION);
      setFollowUp("");
      setDecision("");
      setPrompts([]);
      setThemes([]);
      setImageIds([]);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      {/* A settled level or part is printed, not offered in a control that
          cannot be operated. Neither travels in the update payload, so an
          editable-looking dropdown was a control that changed what the form
          drew and then saved nothing: switch a Part 1 question to Part 3, add
          prompts, and you got a Part 1 row carrying Part 3 prompts while
          believing you had moved it. */}
      <FormRow>
        {levelFixed ? (
          <Settled>
            <span className="label">Level</span>
            <span className="value">{level.toUpperCase()}</span>
          </Settled>
        ) : (
          <Dropdown
            label="Level"
            options={SUPPORTED_LEVELS}
            value={level.toUpperCase()}
            onChange={(val) => {
              const next = val.toLowerCase();
              setLevel(next);
              /* C2 has three parts where the others have four, so a Part 4 left
                 over from another level would be a combination that cannot be
                 saved. Clearing it costs nothing and removes the trap. */
              if (part && !getQuestionPartOptions(next).includes(part)) {
                setPart("");
              }
            }}
            placeholder="-"
            width="100px"
          />
        )}
        {partFixed ? (
          <Settled>
            <span className="label">Part</span>
            <span className="value">{part}</span>
          </Settled>
        ) : (
          <Dropdown
            label="Part"
            options={getQuestionPartOptions(level)}
            value={part}
            /* The shape rules are recomputed from the new part on the next
               render, but a failed save is state and would otherwise sit there
               describing a part you have left. */
            onChange={(next) => {
              setPart(next);
              setFormError(null);
            }}
            placeholder="-"
            width="100px"
          />
        )}
      </FormRow>
      {isEdit ? (
        <Hint>
          A question keeps the level and part it was written for. Write a new
          one to cover a different part.
        </Hint>
      ) : null}
      {!!level && !!part && (
        <>
          {level === "c2" && part === "2" && (
            <Input
              name="instructionOne"
              label="First Instruction"
              type="text"
              value={instructionOne}
              onChange={setInstructionOne}
              required
              minLength={1}
              maxLength={200}
              placeholder={"Look at photographs one and two."}
            />
          )}
          <Input
            name="statement"
            label="Statement"
            type="text"
            value={statement}
            onChange={setStatement}
            required
            minLength={1}
            maxLength={200}
            placeholder={generatePlaceholderByPart()}
          />
          {level === "c2" && part === "2" && (
            <Input
              name="instructionTwo"
              label="Second Instruction"
              type="text"
              value={instructionTwo}
              onChange={setInstructionTwo}
              required
              minLength={1}
              maxLength={200}
              placeholder={"Now look at all the photographs."}
              disabled={true}
            />
          )}
          {needsStatementTwo && (
            <Input
              name="statement-2"
              label="Statement 2"
              type="text"
              value={statementTwo}
              onChange={setStatementTwo}
              required
              minLength={1}
              maxLength={500}
              placeholder={generatePlaceholderByPart(true)}
              isTextArea={true}
            />
          )}
          {part === "2" && (
            <ImageSelectors
              imageIds={imageIds}
              setImageIds={setImageIds}
              level={level}
            />
          )}
          {part === "3" && (
            <Prompts
              prompts={prompts}
              setPrompts={setPrompts}
              placeholders={generatePromptPlaceholdersByLevel()}
            />
          )}
          {/* Below the photographs and prompts because that is the order the
              test runs them in: the task first, then what the interlocutor
              says once the candidate has finished. Optional, unlike the
              statement — a Part 2 without a follow-up is an incomplete task
              but still a usable one, and six of the seven house B2 Part 2s
              have one rather than all seven. */}
          {needsFollowUp && (
            <Input
              name="follow-up"
              label="Follow-up question"
              type="text"
              value={followUp}
              onChange={setFollowUp}
              maxLength={500}
              placeholder={
                level === "c2"
                  ? "Do you think people are too quick to trust a machine?"
                  : "Which of these jobs would you find most stressful?"
              }
              isTextArea={true}
            />
          )}
          {followUpPhase?.label ? (
            <Hint>{`Shown in the runner under the heading “${followUpPhase.label}”.`}</Hint>
          ) : null}
          {needsDecision && (
            <Input
              name="decision"
              label={level === "c2" ? "Closing discussion" : "Decision task"}
              type="text"
              value={decision}
              onChange={setDecision}
              maxLength={500}
              placeholder={
                level === "c2"
                  ? "Who should be held responsible when a decision turns out to be wrong?"
                  : "Now decide which two a growing city should prioritise."
              }
              isTextArea={true}
            />
          )}
          {decisionPhase?.label ? (
            <Hint>{`Shown in the runner under the heading “${decisionPhase.label}”.`}</Hint>
          ) : null}
          <ThemeSelector label="Themes" themes={themes} setThemes={setThemes} />
          <Checkbox
            checked={isPublic}
            onChange={setIsPublic}
            label="Public question"
          />
          {/* Meaningless when a caller is waiting for one question back: the
              form closes the moment it is saved. */}
          {!isEdit && !onCreated && (
            <>
              <Checkbox
                checked={createAnother}
                onChange={() => setCreateAnother(!createAnother)}
                label={"Create another"}
              />
            </>
          )}
        </>
      )}
      {/* A disabled Save with no explanation is worse than the error it is
          preventing, so everything holding it back is named. Amber, because
          nothing has gone wrong — the form is waiting. */}
      {!loading ? (
        <Notice title="Before you can save:" reasons={blockers} />
      ) : null}
      {/* Red, and separate: this one is a save that actually failed. */}
      {formError ? <FormError role="alert">{formError}</FormError> : null}
      {/* Submitting is the form's job, not the button's. This used to call
          handleSubmit from onClick while also being a submit button by
          default, so a click ran it twice — two POSTs and two questions. When
          a required field was empty the browser blocked the native submit and
          the onClick fired anyway, saving a row that skipped validation. The
          sign-in and sign-up forms already did it this way. */}
      <Button
        onClick={() => undefined}
        type="submit"
        text={loading ? "Saving..." : isEdit ? "Update" : "Save"}
        isAsync={false}
        disabled={!allFieldsCompleted || loading}
      />
    </StyledForm>
  );
};

export default QuestionForm;
