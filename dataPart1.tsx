import { Part1and4 } from "./types/types";

export const part1data: Part1and4 = {
  instructions:
    "The examiner will ask your name and then roughly 3-6 of these types of questions. They will be from a variety of topics.",
  time: 15,
  part: "part1/4",
  speakTo: "The examiner",
  questionsByTheme: [
    {
      theme: "Your country",
      questions: [
        "Is there anything you would like to learn about your country?",
        "Which area of your country would you like to get to know better?",
      ],
    },
    {
      theme: "Daily Life",
      questions: [
        "Tell us about a day you've really enjoyed recently.",
        "Are you planning to do anything special this weekend?",
      ],
    },
    {
      theme: "Sports",
      questions: [
        "Tell us about an unusal sport someone you know likes",
        "What is the most popular sport where you live?",
      ],
    },
    {
      theme: "Fashion",
      questions: [
        "What type of clothes do you like to wear?",
        "What are your favourite clothes shops?",
      ],
    },
    {
      theme: "Environment",
      questions: [
        "What do you do to help the environment?",
        "How important is saving the environment to you?",
      ],
    },
    {
      theme: "Family",
      questions: [
        "Describe a friend or family member who you look up to",
        "Do you prefer to spend time with your friends or family?",
      ],
    },
    {
      theme: "Food",
      questions: [
        "Tell us about a strange food you have tried",
        "What is your perfect meal?",
      ],
    },
    {
      theme: "Education",
      questions: [
        "Do you learn more from listening/reading or by doing?",
        "Tell us about your school/college/university",
      ],
    },
    {
      theme: "TV/Film",
      questions: [
        "What is your favourite genre of movie?",
        "How often do you watch TV/series?",
      ],
    },
  ],
};
