export type CambridgeLevel = "b2" | "c1";
export type CambridgePart = "1" | "2" | "3" | "4";

export type CambridgeContentType =
  | "interview_prompt"
  | "visual_long_turn"
  | "collaborative_task"
  | "discussion_prompt";

export type CambridgeSpeakingTask = {
  part: CambridgePart;
  title: string;
  contentType: CambridgeContentType;
  suggestedSeconds: number;
  candidateGuidance: string;
  contentRequirements: readonly string[];
};

export type CambridgeSpeakingBlueprint = {
  id: string;
  level: CambridgeLevel;
  qualification: "B2 First" | "C1 Advanced";
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
    candidateGuidance:
      "Speak individually using the visual prompts, then respond briefly to the other candidate.",
    contentRequirements: [
      "two visual prompts",
      "candidate instruction",
      "comparison focus"
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

export const CAMBRIDGE_SPEAKING_BLUEPRINTS: Record<
  CambridgeLevel,
  CambridgeSpeakingBlueprint
> = {
  b2: b2FirstSpeaking,
  c1: c1AdvancedSpeaking
};

export function getCambridgeSpeakingBlueprint(level: string) {
  return CAMBRIDGE_SPEAKING_BLUEPRINTS[level.toLowerCase() as CambridgeLevel];
}

export function getCambridgeSpeakingTask(level: string, part: string) {
  return getCambridgeSpeakingBlueprint(level)?.tasks.find(
    (task) => task.part === part
  );
}
