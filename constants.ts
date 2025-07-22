export const THEME_VALUES_FOR_PILLS: {
  value: string;
  label: string;
  colors: { bg: string; text: string };
}[] = [
  {
    value: "work_education",
    label: "Work/education",
    colors: { bg: "#D6D6D6", text: "#2B2B2B" },
  },
  {
    value: "where_you_live",
    label: "Where you live",
    colors: { bg: "#c29dbb", text: "#3a293d" },
  },
  {
    value: "learning_english",
    label: "Learning English",
    colors: { bg: "#ff9bc6", text: "#722856" },
  },
  {
    value: "your_culture",
    label: "Your culture",
    colors: { bg: "#cbb5a6", text: "#533607" },
  },
  {
    value: "daily_life",
    label: "Daily life",
    colors: { bg: "#EAEAEA", text: "#333333" },
  },
  {
    value: "travel_holidays",
    label: "Travel/holidays",
    colors: { bg: "#CAB8E8", text: "#3D2170" },
  },
  {
    value: "entertainment",
    label: "Entertainment",
    colors: { bg: "#ffd1dd", text: "#7b3653" },
  },
  {
    value: "technology",
    label: "Technology",
    colors: { bg: "#95c6fc", text: "#1E3A5F" },
  },
  {
    value: "sports",
    label: "Sports",
    colors: { bg: "#d0edff", text: "#1B4A73" },
  },
  {
    value: "family_friends",
    label: "Family/friends",
    colors: { bg: "#F9E79B", text: "#5C4600" },
  },
  {
    value: "hobbies",
    label: "Hobbies",
    colors: { bg: "#EFA3A3", text: "#6B1F1F" },
  },
  {
    value: "the_future",
    label: "The future",
    colors: { bg: "#F5C183", text: "#603800" },
  },
  {
    value: "health",
    label: "Health",
    colors: { bg: "#ff8080", text: "#5E1A1A" },
  },
  {
    value: "environment",
    label: "Environment",
    colors: { bg: "#B7E3A8", text: "#2B5A20" },
  },
  {
    value: "nature",
    label: "Nature",
    colors: { bg: "#b1f1b4", text: "#476228" },
  },
  {
    value: "food_cooking",
    label: "Food/cooking",
    colors: { bg: "#F5B583", text: "#653200" },
  },
  {
    value: "shopping_fashion",
    label: "Shopping/fashion",
    colors: { bg: "#E8A5C1", text: "#57233F" },
  },
  {
    value: "dreams_ambitions",
    label: "Dreams/ambitions",
    colors: { bg: "#BCA3E8", text: "#3A2170" },
  },
];

export const PART_VALUES_FOR_PILLS: {
  value: string;
  label: string;
  colors: { bg: string; text: string };
}[] = [
  {
    value: "part1",
    label: "Part 1",
    colors: { bg: "#b3efb2", text: "#1e2b20" },
  },
  {
    value: "part2",
    label: "Part 2",
    colors: { bg: "#7a9e7e", text: "#f5fffa" },
  },
  {
    value: "part3",
    label: "Part 3",
    colors: { bg: "#cae68d", text: "#1e2b20" },
  },
  {
    value: "part4",
    label: "Part 4",
    colors: { bg: "#31493c", text: "#f5fffa" },
  },
];

export const getQuestionPartOptions = (level: string) => {
  const defaultOptions = ["1", "2", "3", "4"];

  if (level === "c2") {
    defaultOptions.splice(-1, 1);
  }

  return defaultOptions;
};
