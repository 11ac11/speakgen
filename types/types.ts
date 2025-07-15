export type Part1and4 = {
  part: "part1/4";
  instructions: string;
  time: number;
  speakTo: string;
  questionsByTheme: {
    theme: string;
    questions: string[];
  }[];
};

export type Part2 = {
  part: "part2";
  instructions: string;
  time: number;
  speakTo: string;
  questionsByTheme: {
    theme: string;
    questions: Part2QStructure[];
  }[];
};

export type Part3 = {
  part: "part3";
  instructions: string;
  time: number;
  speakTo: string;
  questionsByTheme: {
    theme: string;
    questions: Part3QStructure[];
  }[];
};

export type QuestionTypes = Part1and4 | Part2 | Part3 | NewPart1QStructure;

export type User = {
  id: string;
  email: string;
  password: string;
};

export type QuestionStructures =
  | NewPart1QStructure
  | Part2QStructure
  | Part3QStructure;

export type Part2QStructure = {
  id: number;
  statement: string;
  statement_two?: string;
  public: boolean;
  themes: string[];
  image_ids: number[];
};

export type Part3QStructure = {
  id: number;
  statement: string;
  public: boolean;
  themes: string[];
  prompts: string[];
};

export type NewPart1QStructure = {
  id: number;
  statement: string;
  public: boolean;
  themes: string[];
};
