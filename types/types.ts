export type Part1and4 = {
  instructions: string;
  time: number;
  speakTo: string;
  questionsByTheme:
    {
      theme: string,
      questions: string[]
    }[]
};

export type Part2 = {
  instructions: string;
  time: number;
  speakTo: string;
  questionsByTheme:
    {
      theme: string,
      questions: Part2QStructure[]
    }[]
};

export type Part3 = {
  instructions: string;
  time: number;
  speakTo: string;
  questionsByTheme:
    {
      theme: string,
      questions: Part3QStructure[]
    }[]
};

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
