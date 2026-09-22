export type CambridgeLevel = "b2" | "c1" | "c2";
export type CambridgePart = "1" | "2" | "3" | "4";

export type CambridgeContentType =
  | "interview_prompt"
  | "visual_long_turn"
  | "collaborative_task"
  | "visual_collaborative_task"
  | "prompted_long_turn"
  | "discussion_prompt";

/**
 * Which column of content.questions carries a phase's words.
 *
 * These are the four text fields a question can hold, and naming them here is
 * what lets a task say "I run in three phases, and this is the order they come
 * in" without any new storage. The columns already exist and already hold the
 * right words — what was missing was anything saying they are a sequence.
 */
export type CambridgePhaseSource =
  "statement" | "statement_two" | "follow_up" | "decision";

/**
 * One turn within a part: what the interlocutor says to open it, whose words
 * fill it, and roughly how long it runs.
 */
export type CambridgeSpeakingPhase = {
  source: CambridgePhaseSource;
  /**
   * The interlocutor's line into this phase. Omitted where the phase IS the
   * task and needs no introduction — the opening phase of most parts — and
   * omitted on C2's collaborative task, whose two lines are written per
   * question and stored in `instructions`, because they name which photographs
   * to look at and so differ question by question.
   */
  label?: string;
  /**
   * How long this phase runs, which is what the timer counts down.
   *
   * The labels used to carry it too — "(about 30 seconds)", "(about one
   * minute)" — from when nothing else knew a phase had a length. Two copies of
   * a number is one too many, and the timer is the one a teacher is actually
   * watching.
   */
  seconds: number;
};

export type CambridgeSpeakingTask = {
  part: CambridgePart;
  title: string;
  contentType: CambridgeContentType;
  suggestedSeconds: number;
  candidateGuidance: string;
  contentRequirements: readonly string[];
  /**
   * The test runs this part once per candidate, so an exam needs two questions
   * for it rather than one. B2 and C1 double Part 2 — each candidate gets their
   * own photographs. C2 doubles Part 3 instead: each candidate gets their own
   * card. Reading this off the task is what lets getRequiredSlots stop assuming
   * the doubled part is always Part 2.
   */
  perCandidate?: true;
  /**
   * How the part runs, in order.
   *
   * Every part has at least one phase, and several have more: a B2 long turn is
   * a minute from one candidate and then thirty seconds from the other, a
   * collaborative task is a discussion and then a decision. Those later phases
   * were being printed down the page from the start, so the question the other
   * candidate is about to be asked sat on screen throughout the first
   * candidate's turn — readable by exactly the person who should not see it.
   *
   * Declaring them here rather than in the runner is what stops this being a
   * level-and-part switch statement. A new level is a new blueprint entry and
   * nothing else: the runner already knows how to walk a list.
   */
  phases: readonly CambridgeSpeakingPhase[];
};

/** The phase of this task that a given column fills, if it has one. */
export function getTaskPhase(
  task: CambridgeSpeakingTask | undefined,
  source: CambridgePhaseSource
) {
  return task?.phases.find((phase) => phase.source === source);
}

export type CambridgeSpeakingBlueprint = {
  id: string;
  level: CambridgeLevel;
  qualification: "B2 First" | "C1 Advanced" | "C2 Proficiency";
  version: 1;
  speakingPairMinutes: number;
  tasks: readonly CambridgeSpeakingTask[];
};

const sharedTasks = {
  part1: {
    part: "1" as const,
    title: "Interview",
    contentType: "interview_prompt" as const,
    suggestedSeconds: 120,
    candidateGuidance:
      "Answer the interlocutor's questions about yourself and familiar topics.",
    contentRequirements: ["prompt set", "theme"],
    phases: [{ source: "statement", seconds: 120 }]
  },
  part2: {
    part: "2" as const,
    title: "Individual long turn",
    contentType: "visual_long_turn" as const,
    suggestedSeconds: 120,
    perCandidate: true as const,
    candidateGuidance:
      "Speak individually using the visual prompts, then respond briefly to the other candidate.",
    contentRequirements: [
      "two visual prompts",
      "candidate instruction",
      "comparison focus"
    ],
    /* A minute from this candidate, then thirty seconds from the other about
       the same photographs. The photographs stay up across both — it is the
       question being asked that changes, not what is being looked at. */
    phases: [
      { source: "statement", seconds: 60 },
      {
        source: "follow_up",
        label: "Then ask the other candidate",
        seconds: 30
      }
    ]
  },
  part3: {
    part: "3" as const,
    title: "Collaborative task",
    contentType: "collaborative_task" as const,
    suggestedSeconds: 180,
    candidateGuidance:
      "Discuss the options together and reach a decision when the task asks you to do so.",
    contentRequirements: [
      "task instruction",
      "options or prompts",
      "decision focus"
    ],
    /* Two minutes discussing the prompts, then a minute deciding. The decision
       is the whole point of the second phase, so showing it from the start told
       the pair where they were meant to end up before they had started. */
    phases: [
      { source: "statement", seconds: 120 },
      {
        source: "decision",
        label: "Then, the decision task",
        seconds: 60
      }
    ]
  }
} satisfies Record<"part1" | "part2" | "part3", CambridgeSpeakingTask>;

const b2FirstSpeaking: CambridgeSpeakingBlueprint = {
  id: "b2-first-speaking-v1",
  level: "b2",
  qualification: "B2 First",
  version: 1,
  speakingPairMinutes: 14,
  tasks: [
    sharedTasks.part1,
    sharedTasks.part2,
    sharedTasks.part3,
    {
      part: "4",
      title: "Discussion",
      contentType: "discussion_prompt",
      suggestedSeconds: 240,
      candidateGuidance:
        "Discuss the Part 3 topic and related questions in more detail.",
      contentRequirements: ["follow-up prompt set", "theme"],
      phases: [{ source: "statement", seconds: 240 }]
    }
  ]
};

const c1AdvancedSpeaking: CambridgeSpeakingBlueprint = {
  id: "c1-advanced-speaking-v1",
  level: "c1",
  qualification: "C1 Advanced",
  version: 1,
  speakingPairMinutes: 15,
  tasks: [
    sharedTasks.part1,
    sharedTasks.part2,
    sharedTasks.part3,
    {
      part: "4",
      title: "Discussion",
      contentType: "discussion_prompt",
      suggestedSeconds: 300,
      candidateGuidance:
        "Discuss the Part 3 topic and related questions in greater depth.",
      contentRequirements: [
        "follow-up prompt set",
        "theme",
        "depth of discussion"
      ],
      phases: [{ source: "statement", seconds: 300 }]
    }
  ]
};

/**
 * C2 Proficiency has three parts, not four, and the two that are not the
 * interview are shaped differently from their B2 and C1 namesakes:
 *
 *   Part 2  is the collaborative task, and it carries the photographs. The pair
 *           look at two of them for about a minute, then at all of them for a
 *           three-minute decision task. That second phase is statement_two,
 *           which the runner reveals behind a button.
 *   Part 3  is the long turn, and it is the part that runs twice: each
 *           candidate gets their own card carrying a question and three ideas,
 *           speaks for two minutes, and the other candidate then responds for
 *           about a minute. The discussion that closes the part is examiner-led
 *           and belongs to neither card, so it rides on `decision`, which the
 *           runner prints as an interlocutor note.
 */
const c2ProficiencySpeaking: CambridgeSpeakingBlueprint = {
  id: "c2-proficiency-speaking-v1",
  level: "c2",
  qualification: "C2 Proficiency",
  version: 1,
  speakingPairMinutes: 16,
  tasks: [
    sharedTasks.part1,
    {
      part: "2",
      title: "Collaborative task",
      contentType: "visual_collaborative_task",
      suggestedSeconds: 240,
      candidateGuidance:
        "Talk about two of the photographs together, then use all of them for the decision task.",
      contentRequirements: [
        "four visual prompts",
        "first-phase question",
        "second-phase task",
        "decision focus"
      ],
      /* The one task whose phase labels are written per question rather than
         here: "Look at photographs one and two" then "Now look at all the
         photographs" name the pictures, so they belong to the question and
         live in `instructions`, indexed to match these phases. */
      phases: [
        { source: "statement", seconds: 60 },
        { source: "statement_two", seconds: 180 }
      ]
    },
    {
      part: "3",
      title: "Long turn and discussion",
      contentType: "prompted_long_turn",
      suggestedSeconds: 180,
      perCandidate: true,
      candidateGuidance:
        "Speak on your own for two minutes from the card, then respond to the other candidate's turn.",
      contentRequirements: [
        "card question",
        "three ideas",
        "response question",
        "closing discussion"
      ],
      /* Three, the most of any task: two minutes from the card, a minute from
         the other candidate, then the examiner-led discussion that closes the
         part. That last one belongs to the part rather than to either card, so
         it rides on whichever card is on screen when you reach it. */
      phases: [
        { source: "statement", seconds: 120 },
        {
          source: "follow_up",
          label: "Then ask the other candidate",
          seconds: 60
        },
        {
          source: "decision",
          label: "Then, once both candidates have spoken",
          seconds: 240
        }
      ]
    }
  ]
};

export const CAMBRIDGE_SPEAKING_BLUEPRINTS: Record<
  CambridgeLevel,
  CambridgeSpeakingBlueprint
> = {
  b2: b2FirstSpeaking,
  c1: c1AdvancedSpeaking,
  c2: c2ProficiencySpeaking
};

export function getCambridgeSpeakingBlueprint(level: string) {
  return CAMBRIDGE_SPEAKING_BLUEPRINTS[level.toLowerCase() as CambridgeLevel];
}

export function getCambridgeSpeakingTask(level: string, part: string) {
  return getCambridgeSpeakingBlueprint(level)?.tasks.find(
    (task) => task.part === part
  );
}

export type ExamSlot = { part: CambridgePart; candidate: "A" | "B" | "-" };

/**
 * The slots an exam of this level must fill, in order.
 *
 * One part of every level runs twice, once per candidate, and which part that
 * is differs: B2 and C1 run Part 2 twice — candidate A compares their
 * photographs, then candidate B compares different ones — while C2 runs Part 3
 * twice, a different long-turn card each. The task's own `perCandidate` says
 * so, because reading it off the part number was only ever right for B2 and C1.
 * Every other part is shared, which is what the "-" candidate means in
 * content.exam_questions.
 *
 * The database enforces that a question matches its slot's level and part; this
 * is the other half, the set of slots that makes an exam complete.
 */
export function getRequiredSlots(level: string): ExamSlot[] {
  const blueprint = getCambridgeSpeakingBlueprint(level);
  if (!blueprint) return [];

  return blueprint.tasks.flatMap((task): ExamSlot[] =>
    task.perCandidate
      ? [
          { part: task.part, candidate: "A" },
          { part: task.part, candidate: "B" }
        ]
      : [{ part: task.part, candidate: "-" }]
  );
}
