export type CambridgeLevel = "b1" | "b2" | "c1" | "c2";
export type CambridgePart = "1" | "2" | "3" | "4";

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
   * What the button that opens this phase says.
   *
   * Separate from `label` because the two do different jobs and the same words
   * cannot do both. A label sits above the words as a heading, so it is a cue:
   * "Then ask the other candidate". A button is a thing you press, so it is an
   * instruction: "Ask the other candidate". Using the label for both gave
   * "Continue — Then, the decision task", which reads like a sentence that lost
   * its verb.
   */
  action?: string;
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

/**
 * Who is speaking, which is the first thing a teacher setting a part up needs
 * to know and the one thing the task did not say.
 *
 * It cannot be inferred from what a task carries or from whether it runs twice.
 * C2's Part 2 and Part 3 both have visual material, but one is the pair talking
 * to each other and the other is one candidate alone; B2's Part 1 and Part 4 are
 * both examiner-led but only one of them is a conversation between the
 * candidates.
 *
 * It replaced a `contentType` tag — "visual_long_turn", "collaborative_task" —
 * which named the task but answered no question anybody asked, and which
 * nothing outside this file ever read.
 */
export type CambridgeInteraction =
  /** The examiner asks each candidate in turn. */
  | "interview"
  /** One candidate speaks on their own. */
  | "individual"
  /** The two candidates talk to each other. */
  | "pair"
  /** Both candidates and the examiner, together. */
  | "discussion";

export type CambridgeSpeakingTask = {
  part: CambridgePart;
  title: string;
  suggestedSeconds: number;
  candidateGuidance: string;
  interaction: CambridgeInteraction;
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
  /**
   * How many photographs a question for this task carries, and how many written
   * prompts.
   *
   * These were `if (part === "2")` and `if (part === "3")` in questionRules,
   * with the counts written into the condition — true for B2, C1 and C2, and
   * wrong the moment B1 arrived, whose long turn is one photograph described
   * rather than two compared. The part number was never what decided it; the
   * task did.
   */
  images?: { min: number; max: number };
  prompts?: { min: number; max: number };
};

/** The phase of this task that a given column fills, if it has one. */
export function getTaskPhase(
  task: CambridgeSpeakingTask | undefined,
  source: CambridgePhaseSource
) {
  return task?.phases.find((phase) => phase.source === source);
}

/**
 * What a level's speaking test is made of.
 *
 * Only the tasks. It used to carry an id, a level, a qualification name, a
 * version and a length in minutes, and nothing outside this file ever read one
 * of them: the name and the length are columns on content.levels, which is what
 * every page already queries alongside `enabled` and the sort order, and the
 * level is the key this is stored under.
 *
 * There is no version because there is nothing to version against. The format
 * is Cambridge's, it is the same for every user, and when they change it the
 * previous one stops being worth practising — so a blueprint is only ever the
 * current shape of the test.
 */
export type CambridgeSpeakingBlueprint = {
  tasks: readonly CambridgeSpeakingTask[];
};

const sharedTasks = {
  part1: {
    part: "1" as const,
    title: "Interview",
    suggestedSeconds: 120,
    candidateGuidance:
      "Answer the interlocutor's questions about yourself and familiar topics.",
    interaction: "interview",
    phases: [{ source: "statement", seconds: 120 }]
  },
  part2: {
    part: "2" as const,
    title: "Individual long turn",
    suggestedSeconds: 120,
    perCandidate: true as const,
    candidateGuidance:
      "Speak individually using the visual prompts, then respond briefly to the other candidate.",
    interaction: "individual",
    /* A minute from this candidate, then thirty seconds from the other about
       the same photographs. The photographs stay up across both — it is the
       question being asked that changes, not what is being looked at. */
    phases: [
      { source: "statement", seconds: 60 },
      {
        source: "follow_up",
        label: "Then ask the other candidate",
        action: "Ask the other candidate",
        seconds: 30
      }
    ]
  },
  part3: {
    part: "3" as const,
    title: "Collaborative task",
    suggestedSeconds: 180,
    candidateGuidance:
      "Discuss the options together and reach a decision when the task asks you to do so.",
    interaction: "pair",
    prompts: { min: 3, max: 5 },
    /* Two minutes discussing the prompts, then a minute deciding. The decision
       is the whole point of the second phase, so showing it from the start told
       the pair where they were meant to end up before they had started. */
    phases: [
      { source: "statement", seconds: 120 },
      {
        source: "decision",
        label: "The decision task",
        action: "Start the decision task",
        seconds: 60
      }
    ]
  }
} satisfies Record<"part1" | "part2" | "part3", CambridgeSpeakingTask>;

/**
 * B1 Preliminary has four parts like B2 and C1, but its long turn is a
 * different task with the same name, and that is the part that matters here:
 *
 *   Part 2  is one photograph, described. Not two compared — each candidate is
 *           handed a single colour photograph and talks about it on their own
 *           for about a minute, and the other candidate is asked nothing about
 *           it afterwards. So it runs per candidate like B2's, carries one
 *           image rather than two to five, and has a single phase where B2 has
 *           two.
 *   Part 3  is the collaborative task. The real test prints a page of small
 *           drawings showing the options; here they are written prompts, as at
 *           B2 and C1, and the pair talk about them and then decide.
 *   Part 4  broadens the Part 3 topic into a general discussion, as at B2.
 *
 * About twelve minutes for a pair, the shortest of the four.
 */
const b1PreliminarySpeaking: CambridgeSpeakingBlueprint = {
  tasks: [
    {
      part: "1",
      title: "Interview",
      suggestedSeconds: 150,
      candidateGuidance:
        "Answer the examiner's questions about yourself, your routines and what you like.",
      interaction: "interview",
      phases: [{ source: "statement", seconds: 150 }]
    },
    {
      part: "2",
      title: "Individual long turn",
      suggestedSeconds: 60,
      perCandidate: true,
      candidateGuidance:
        "Talk on your own about your photograph for about a minute.",
      interaction: "individual",
      /* Exactly one. The form draws as many slots as the minimum, so this is
         also what stops a B1 question offering a second photograph there is
         nothing in the test to put in. */
      images: { min: 1, max: 1 },
      /* One phase, and no follow-up: the other candidate is not asked about
         this photograph, they are given their own. That is the B slot of the
         pair, not a second phase of the A one. */
      phases: [{ source: "statement", seconds: 60 }]
    },
    {
      part: "3",
      title: "Collaborative task",
      suggestedSeconds: 180,
      candidateGuidance:
        "Talk to each other about the options, then decide together.",
      interaction: "pair",
      prompts: { min: 3, max: 5 },
      phases: [
        { source: "statement", seconds: 120 },
        {
          source: "decision",
          label: "The decision task",
          action: "Start the decision task",
          seconds: 60
        }
      ]
    },
    {
      part: "4",
      title: "Discussion",
      suggestedSeconds: 180,
      candidateGuidance:
        "Talk about the Part 3 topic more generally — what you like, what you do, what you think.",
      interaction: "discussion",
      phases: [{ source: "statement", seconds: 180 }]
    }
  ]
};

const b2FirstSpeaking: CambridgeSpeakingBlueprint = {
  tasks: [
    sharedTasks.part1,
    /* Two photographs, compared. The count is the one thing B2's long turn and
       C1's do not share, so it is set here rather than on the shared task. */
    { ...sharedTasks.part2, images: { min: 2, max: 2 } },
    sharedTasks.part3,
    {
      part: "4",
      title: "Discussion",
      suggestedSeconds: 240,
      candidateGuidance:
        "Discuss the Part 3 topic and related questions in more detail.",
      interaction: "discussion",
      phases: [{ source: "statement", seconds: 240 }]
    }
  ]
};

const c1AdvancedSpeaking: CambridgeSpeakingBlueprint = {
  tasks: [
    sharedTasks.part1,
    // Three at C1: the candidate is given three and chooses two to compare.
    { ...sharedTasks.part2, images: { min: 3, max: 3 } },
    sharedTasks.part3,
    {
      part: "4",
      title: "Discussion",
      suggestedSeconds: 300,
      candidateGuidance:
        "Discuss the Part 3 topic and related questions in greater depth.",
      interaction: "discussion",
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
  tasks: [
    sharedTasks.part1,
    {
      part: "2",
      title: "Collaborative task",
      suggestedSeconds: 240,
      candidateGuidance:
        "Talk about two of the photographs together, then use all of them for the decision task.",
      interaction: "pair",
      /* Four. The real test may print more, but four is what the question form
         draws at this level and what every C2 question here carries, so it is
         what the instructions page should promise. */
      images: { min: 4, max: 4 },
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
      suggestedSeconds: 180,
      perCandidate: true,
      candidateGuidance:
        "Speak on your own for two minutes from the card, then respond to the other candidate's turn.",
      interaction: "individual",
      prompts: { min: 3, max: 5 },
      /* Three, the most of any task: two minutes from the card, a minute from
         the other candidate, then the examiner-led discussion that closes the
         part. That last one belongs to the part rather than to either card, so
         it rides on whichever card is on screen when you reach it. */
      phases: [
        { source: "statement", seconds: 120 },
        {
          source: "follow_up",
          label: "Then ask the other candidate",
          action: "Ask the other candidate",
          seconds: 60
        },
        {
          source: "decision",
          label: "The closing discussion",
          action: "Open the closing discussion",
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
  b1: b1PreliminarySpeaking,
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
