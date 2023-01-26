export type QuestionStructure = {
  instructions: string;
  time: number;
  questionsByTheme:
    | Part1Questions
    | Part2Questions
    | Part3Questions
    | Part4Questions;
};

export type Part1Questions = {
  theme: string;
  questions: string[];
};

export type Part2Questions = {
  theme: string;
  questions: Part2QStructure[];
};
export type Part2QStructure = {
  statement: string;
  image1: string;
  image2: string;
  followUp: string;
};

export type Part3Questions = {
  theme: string;
  questions: Part3QStructure[];
};
export type Part3QStructure = {
  statement: string;
  points: string[];
};

export type Part4Questions = {
  theme: string;
  questions: string[];
};