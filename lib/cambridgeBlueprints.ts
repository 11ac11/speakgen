export type CambridgeLevel = "b2" | "c1" | "c2";
export type CambridgePart = "1" | "2" | "3" | "4";

export type CambridgeContentType =
  | "interview_prompt"
  | "visual_long_turn"
  | "collaborative_task"
  | "visual_collaborative_task"
  | "prompted_long_turn"
  | "discussion_prompt";

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
   * How the interlocutor introduces follow_up and decision, which are printed
   * parts of the task that the Question component does not render. The timings
   * differ by level — B2 and C1 give the other candidate 30 seconds after a
   * Part 2 long turn, C2 gives them a full minute after a Part 3 one — so the
   * wording belongs to the task rather than to the runner.
   */
  followUpLabel?: string;
  decisionLabel?: string;
};

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
    contentRequirements: ["prompt set", "theme"]
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
    followUpLabel: "Then ask the other candidate (about 30 seconds)"
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
    decisionLabel: "Then, after about two minutes (about one minute)"
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
      contentRequirements: ["follow-up prompt set", "theme"]
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
      ]
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
      followUpLabel: "Then ask the other candidate (about one minute)",
      decisionLabel: "Then, once both candidates have spoken (about 4 minutes)"
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
