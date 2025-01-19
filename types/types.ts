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

export type QuestionTypes = Part1and4 | Part2 | Part3;

export type QuestionStructures = Part2QStructure | Part3QStructure | string;

export type Part2QStructure = {
  statement: string;
  image1: string;
  image2: string;
  followUp: string;
};

export type Part3QStructure = {
  statement: string;
  points: string[];
};
