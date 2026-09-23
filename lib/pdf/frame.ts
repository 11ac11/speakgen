import {
  getCambridgeSpeakingTask,
  type CambridgeSpeakingTask
} from "@/lib/cambridgeBlueprints";
import type { QuestionRow } from "@/lib/questions";
import { THEME_VALUES_FOR_PILLS } from "@/constants";

/**
 * The interlocutor frame: what the examiner says, in order, with the
 * candidates' turns marked between, laid out the way Cambridge's own speaking
 * papers lay theirs out — speaker and timing in a narrow column on the left,
 * the words on the right, a dotted line where a candidate speaks.
 *
 * Nothing here is stored. The fixed lines ("In this part of the test…") are
 * written once per kind of task, in this file's own words; the parts that
 * change — the question, the follow-up, the decision — come from the question
 * rows, and are set in bold, as the paper sets the words the examiner must
 * read exactly. Stage directions are italic.
 *
 * Pure, and separate from the renderer, so the wording can be read and
 * changed without touching a line of layout.
 */

export type Run = { text: string; bold?: boolean; italic?: boolean };
export type Para = { runs: Run[]; bullet?: boolean };

export type FrameRow = {
  /** "Interlocutor", "Candidate A", "Candidates", or nothing. */
  speaker: string | null;
  /** "1 minute", "approximately 30 seconds". Drawn with a clock. */
  timing: string | null;
  paras: Para[];
  /** A candidate's turn: a dotted line where the paper leaves space. */
  response?: boolean;
  /** Part 4's box of prompts, beside the questions. */
  aside?: { title: string; items: string[] };
};

export type FrameSection = {
  part: string;
  /** Total time for the part, for the tab. */
  timing: string;
  /** The themes of the tasks, for the topic tab: "1 Nature  2 Education". */
  topics: string[];
  rows: FrameRow[];
  /** Part 4 follows Part 3 on the same page, as it does on the paper. */
  continuesPage: boolean;
};

export type BookletPage =
  | { kind: "photos"; task: number; question: string[]; photoIds: number[] }
  | { kind: "mindmap"; task: number; centre: string; prompts: string[] }
  | { kind: "card"; task: number; question: string; prompts: string[] };

export type ScriptGroup = { frames: FrameSection[]; booklet: BookletPage[] };

// Text helpers --------------------------------------------------------------

const t = (text: string): Run => ({ text });
const b = (text: string): Run => ({ text, bold: true });
const i = (text: string): Run => ({ text, italic: true });
const p = (...runs: Run[]): Para => ({ runs });
const bullet = (...runs: Run[]): Para => ({ runs, bullet: true });

/** A question's text as the lines it was written in. */
/**
 * Lower-cases the first letter of a question that follows a name: "(Candidate
 * B), do you enjoy…". Not when the first word is "I", which stays capital.
 */
function afterName(text: string) {
  return /^I\b/.test(text)
    ? text
    : text.charAt(0).toLowerCase() + text.slice(1);
}

function lines(text: string | null | undefined) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Splits "Who is responsible? Is there any area…?" into its questions.
 *
 * A short tail — "Why?", "Why not?", "What?" — is not a question of its own
 * but a prompt to go further, and the paper prints it after the question it
 * belongs to, as "…… (Why?)".
 */
function questions(text: string | null | undefined) {
  return lines(text).flatMap((line) =>
    line
      .split(/(?<=\?)\s+(?=[A-Z])/)
      .map((q) => q.trim())
      .reduce<string[]>((out, q) => {
        if (out.length && q.split(/\s+/).length <= 3) {
          out[out.length - 1] += ` …… (${q})`;
        } else {
          out.push(q);
        }
        return out;
      }, [])
  );
}

/** 30 → "approximately 30 seconds", 60 → "1 minute", 150 → "2½ minutes". */
export function duration(seconds: number) {
  if (seconds < 60) return `approximately ${seconds} seconds`;
  const minutes = seconds / 60;
  const whole = Math.floor(minutes);
  const half = minutes - whole >= 0.5 ? "½" : "";
  const n = `${whole}${half}`;
  return `${n} minute${n === "1" ? "" : "s"}`;
}

/**
 * A duration as the examiner says it, for the words rather than the timing
 * column: 60 → "a minute", 120 → "two minutes", 150 → "two and a half
 * minutes".
 */
export function spokenDuration(seconds: number) {
  if (seconds < 60) return `${seconds} seconds`;
  const words = ["", "a", "two", "three", "four", "five", "six"];
  const whole = Math.floor(seconds / 60);
  const half = seconds % 60 >= 30;
  const n = words[whole] ?? String(whole);
  if (whole === 1) return half ? "a minute and a half" : "a minute";
  return `${n}${half ? " and a half" : ""} minutes`;
}

/** "a photograph", "two photographs". */
function photoWord(count: number) {
  const words = ["no", "a", "two", "three", "four", "five"];
  return count === 1 ? "a photograph" : `${words[count] ?? count} photographs`;
}

function themeLabel(slug: string) {
  return THEME_VALUES_FOR_PILLS.find((theme) => theme.value === slug)?.label;
}

function topicOf(question: QuestionRow) {
  return question.themes.map(themeLabel).find(Boolean) ?? null;
}

const thankYou = () => p(t("Thank you."));

const interlocutor = (...paras: Para[]): FrameRow => ({
  speaker: "Interlocutor",
  timing: null,
  paras
});

const turn = (speaker: string, seconds: number): FrameRow => ({
  speaker,
  timing: duration(seconds),
  paras: [],
  response: true
});

/**
 * The C2 collaborative task's spoken lines are written per question, in
 * `instructions`; nothing else's are. The blueprint's own phase labels ("The
 * decision task") are cues for the screen, not words anybody says aloud.
 */
function spoken(question: QuestionRow, index: number) {
  const line = question.instructions?.[index]?.trim();
  return line ? [t(`${line} `)] : [];
}

// Sections -------------------------------------------------------------------

type Counter = { next: number };

function interview(
  task: CambridgeSpeakingTask,
  items: QuestionRow[]
): FrameSection {
  return {
    part: task.part,
    timing: duration(task.suggestedSeconds),
    topics: [],
    continuesPage: false,
    rows: [
      interlocutor(
        p(
          t(
            "Good morning/afternoon/evening. My name is …… and this is my colleague ……."
          )
        ),
        p(t("And your names are?")),
        p(t("Thank you.")),
        p(t("First, we'd like to know something about you.")),
        p(
          i(
            "Ask each candidate one or more of the following questions, as appropriate."
          )
        ),
        ...items.flatMap((q) =>
          lines(q.statement).map((line) => bullet(t(line)))
        )
      ),
      turn("Candidates", task.suggestedSeconds)
    ]
  };
}

function discussion(
  task: CambridgeSpeakingTask,
  items: QuestionRow[],
  continuesPage: boolean
): FrameSection {
  return {
    part: task.part,
    timing: duration(task.suggestedSeconds),
    topics: [],
    continuesPage,
    rows: [
      {
        ...interlocutor(
          p(i("Use the following questions, in order, as appropriate:")),
          ...items.flatMap((q) =>
            questions(q.statement).map((line) => bullet(b(line)))
          )
        ),
        aside: {
          title: "Select any of the following prompts, as appropriate:",
          items: ["What do you think?", "Do you agree?", "And you?"]
        }
      }
    ]
  };
}

/**
 * The long turn, for one candidate or a pair of them: each gets their own task
 * and, where the level has one, answers a short question about the other's.
 *
 * Photographs at B1, B2 and C1; a card with a question and ideas at C2, where
 * the part then closes with a discussion addressed to both.
 */
function longTurn(
  task: CambridgeSpeakingTask,
  pair: QuestionRow[],
  counter: Counter
): { section: FrameSection; booklet: BookletPage[] } {
  const card = Boolean(task.prompts);
  const [first, second] = task.phases;
  const booklet: BookletPage[] = [];
  const rows: FrameRow[] = [];
  const candidates = ["A", "B"];

  const count = pair[0].image_ids?.length ?? 0;
  const theirs = count === 1 ? "it" : "them";

  if (card) {
    rows.push(
      interlocutor(
        p(
          t(
            `Now, in this part of the test you're each going to talk on your own for about ${spokenDuration(first.seconds)}. You need to listen while your partner is speaking, because you'll be asked to comment afterwards.`
          )
        )
      )
    );
  } else {
    rows.push(
      interlocutor(
        p(
          t(
            `In this part of the test, I'm going to give each of you ${photoWord(count)}. I'd like you to talk about ${theirs} on your own for about ${spokenDuration(first.seconds)}${
              second && pair.some((q) => q.follow_up)
                ? ", and also to answer a question about your partner's photographs."
                : "."
            }`
          )
        )
      )
    );
  }

  pair.forEach((question, index) => {
    const self = candidates[index];
    const other = candidates[(index + 1) % 2];
    const taskNumber = counter.next++;
    const here = card
      ? "Here is your card."
      : count === 1
        ? "Here is your photograph."
        : "Here are your photographs.";
    const opening =
      index === 0
        ? `(Candidate ${self}), it's your turn first. ${here}`
        : `Now, (Candidate ${self}), ${here.charAt(0).toLowerCase()}${here.slice(1)}`;

    const statement = lines(question.statement);

    rows.push(
      interlocutor(
        p(t(opening)),
        p(i(`Place Task ${taskNumber} in front of Candidate ${self}.`)),
        ...(card
          ? [
              p(i("The card asks: "), b(question.statement)),
              p(
                t(
                  `Please let (Candidate ${other}) see your card. Remember, (Candidate ${self}), you have about ${spokenDuration(first.seconds)} to talk before I interrupt you.`
                )
              )
            ]
          : taskLines(statement, count)),
        p(t("All right?"))
      ),
      turn(`Candidate ${self}`, first.seconds)
    );

    const followUp = second?.source === "follow_up" ? question.follow_up : null;
    if (followUp && pair.length > 1) {
      rows.push(
        interlocutor(
          thankYou(),
          p(t(`(Candidate ${other}), `), b(afterName(followUp)))
        ),
        turn(`Candidate ${other}`, second.seconds)
      );
    } else if (followUp) {
      rows.push(
        interlocutor(
          thankYou(),
          p(t("(Candidate B), "), b(afterName(followUp)))
        ),
        turn("Candidate B", second.seconds)
      );
    }

    rows.push(
      interlocutor(p(t("Thank you. "), i(`Retrieve Task ${taskNumber}.`)))
    );

    booklet.push(
      card
        ? {
            kind: "card",
            task: taskNumber,
            question: question.statement,
            prompts: question.prompts ?? []
          }
        : {
            kind: "photos",
            task: taskNumber,
            // The question goes on the page only where the candidate compares:
            // at B1 the page is a single photograph and the examiner asks.
            // The instruction line stays with the examiner; the questions are
            // what the candidate needs in front of them.
            question:
              count >= 2
                ? statement.filter((line) => !INSTRUCTION.test(line))
                : [],
            photoIds: question.image_ids ?? []
          }
    );
  });

  // C2's long turn closes with a discussion addressed to both candidates.
  const closing = task.phases.find((phase) => phase.source === "decision");
  if (closing) {
    const asks = [...new Set(pair.flatMap((q) => questions(q.decision)))];
    if (asks.length) {
      rows.push(
        interlocutor(
          p(
            i(
              "Address one or more of the following questions to both candidates:"
            )
          ),
          ...asks.map((ask) => bullet(b(ask)))
        ),
        turn("Candidates", closing.seconds)
      );
    }
  }

  return {
    section: {
      part: task.part,
      timing: duration(task.suggestedSeconds * pair.length),
      topics: pair.map(topicOf).filter((x): x is string => Boolean(x)),
      continuesPage: false,
      rows
    },
    booklet
  };
}

/**
 * The collaborative task. Written prompts around a question at B1, B2 and C1,
 * which the booklet draws as the paper does, as a mind map; photographs at C2,
 * where the pair look at two and then at all of them.
 */
function collaborative(
  task: CambridgeSpeakingTask,
  question: QuestionRow,
  counter: Counter
): { section: FrameSection; booklet: BookletPage[] } {
  const taskNumber = counter.next++;
  const photos = (question.image_ids?.length ?? 0) > 0;
  const rows: FrameRow[] = [];

  task.phases.forEach((phase, index) => {
    const text = (question[phase.source] ?? "").trim();
    if (!text) return;

    if (index === 0) {
      rows.push(
        interlocutor(
          p(
            t(
              photos
                ? `Now, in this part of the test you're going to do something together. Here are some photographs.`
                : `Now, I'd like you to talk about something together for about ${spokenDuration(phase.seconds)}.`
            )
          ),
          p(
            i(
              photos
                ? `Place Task ${taskNumber} in front of the candidates.`
                : `Place Task ${taskNumber} in front of the candidates. Allow 15 seconds.`
            )
          ),
          p(...spoken(question, index), b(text))
        ),
        turn("Candidates", phase.seconds)
      );
    } else {
      rows.push(
        interlocutor(
          p(t("Thank you. "), ...spoken(question, index), b(text)),
          ...(phase.source === "decision"
            ? [
                p(
                  t(`You have about ${spokenDuration(phase.seconds)} for this.`)
                )
              ]
            : [])
        ),
        turn("Candidates", phase.seconds)
      );
    }
  });

  rows.push(
    interlocutor(p(t("Thank you. "), i(`Retrieve Task ${taskNumber}.`)))
  );

  return {
    section: {
      part: task.part,
      timing: duration(task.suggestedSeconds),
      topics: [topicOf(question)].filter((x): x is string => Boolean(x)),
      continuesPage: false,
      rows
    },
    booklet: [
      photos
        ? {
            kind: "photos",
            task: taskNumber,
            question: [],
            photoIds: question.image_ids
          }
        : {
            kind: "mindmap",
            task: taskNumber,
            centre: mindMapCentre(question.statement),
            prompts: question.prompts ?? []
          }
    ]
  };
}

const INSTRUCTION = /^(compare|talk|say|tell|describe|look)\b/i;

/**
 * How the examiner hands over the long-turn task. Questions are written two
 * ways and each needs its own lead-in: an instruction ("Compare two of these
 * pictures.") reads after "I'd like you to"; a bare question ("How might
 * people enjoy…?") does not, so it is introduced instead. A single photograph
 * — B1 — needs neither: its statement already says what to do.
 */
function taskLines(statement: string[], photoCount: number): Para[] {
  const [head, ...rest] = statement;
  if (!head) return [];

  if (INSTRUCTION.test(head)) {
    return [
      p(t("I'd like you to "), b(head.charAt(0).toLowerCase() + head.slice(1))),
      ...rest.map((line) => p(b(line)))
    ];
  }

  if (photoCount >= 2) {
    return [
      p(
        t("I'd like you to compare the photographs, and answer this question:")
      ),
      ...statement.map((line) => p(b(line)))
    ];
  }

  return statement.map((line) => p(b(line)));
}

/**
 * What goes in the middle of the mind map: the task, without the examiner's
 * lead-in. A statement is written to be read aloud — "Here are some things
 * that… Talk to each other about…" — and the first sentence of that is
 * addressed to the room, not printed for the candidates.
 */
function mindMapCentre(statement: string) {
  const sentences = statement.split(/(?<=[.?!])\s+/).filter(Boolean);
  const rest = sentences.filter(
    (s) => !/^(here (are|is)|these are)\b/i.test(s)
  );
  return (rest.length ? rest : sentences).join(" ");
}

// Assembly -------------------------------------------------------------------

/**
 * One label per turn at speaking. The sections are written a line at a time,
 * so "Thank you. Retrieve Task 1." and "Now, (Candidate B)…" arrive as two
 * Interlocutor rows; the paper labels the examiner once until somebody else
 * speaks.
 */
function merged(rows: FrameRow[]): FrameRow[] {
  return rows.reduce<FrameRow[]>((out, row) => {
    const previous = out[out.length - 1];
    const joinable = (r: FrameRow) => !r.response && !r.aside && !r.timing;
    if (
      previous &&
      previous.speaker === row.speaker &&
      joinable(previous) &&
      joinable(row)
    ) {
      out[out.length - 1] = {
        ...previous,
        paras: [...previous.paras, ...row.paras]
      };
    } else {
      out.push(row);
    }
    return out;
  }, []);
}

/**
 * Turns an exam's slots, or a practice's draw, into the paper: groups of
 * frame pages, each followed by the booklet pages its tasks hand out.
 *
 * Questions are taken in part order. Consecutive questions of an interview or
 * a discussion share one list, as the paper lists several and the examiner
 * picks; long turns pair up, A then B; each collaborative task stands alone.
 * An exam's slots already come in that shape. A practice's draw is shuffled,
 * so it is sorted by part first — on paper, a script that jumps from Part 3
 * back to Part 1 is harder to run than one that goes in order.
 */
export function buildScript(
  level: string,
  rows: QuestionRow[],
  closing: string
): ScriptGroup[] {
  const counter: Counter = { next: 1 };
  const sorted = [...rows].sort((a, z) => Number(a.part) - Number(z.part));

  // Runs of the same part.
  const runs: QuestionRow[][] = [];
  for (const row of sorted) {
    const last = runs[runs.length - 1];
    if (last && last[0].part === row.part) last.push(row);
    else runs.push([row]);
  }

  const groups: ScriptGroup[] = [];

  for (const run of runs) {
    const task = getCambridgeSpeakingTask(level, run[0].part);
    if (!task) continue;

    if (task.interaction === "interview") {
      groups.push({ frames: [interview(task, run)], booklet: [] });
    } else if (task.interaction === "discussion") {
      // Part 4 follows Part 3 on its page, as the paper prints them.
      const previous = groups[groups.length - 1];
      const section = discussion(task, run, Boolean(previous));
      if (previous) previous.frames.push(section);
      else groups.push({ frames: [section], booklet: [] });
    } else if (task.interaction === "individual") {
      for (let n = 0; n < run.length; n += 2) {
        const { section, booklet } = longTurn(
          task,
          run.slice(n, n + 2),
          counter
        );
        groups.push({ frames: [section], booklet });
      }
    } else {
      for (const question of run) {
        const { section, booklet } = collaborative(task, question, counter);
        groups.push({ frames: [section], booklet });
      }
    }
  }

  // The last thing the examiner says, at the foot of the last frame.
  const last = groups[groups.length - 1]?.frames.at(-1);
  last?.rows.push(interlocutor(p(t(closing))));

  for (const group of groups) {
    for (const frame of group.frames) frame.rows = merged(frame.rows);
  }

  return groups;
}
