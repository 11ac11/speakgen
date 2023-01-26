import { QuestionStructure } from './types/types';

export const part1: QuestionStructure = {
  instructions:
    'The examiner will ask your name and then roughly 3-6 of these types of questions. They will be from a variety of topics.',
  time: 60,
  speakTo: 'The examiner',
  questionsByTheme: [
    {
      theme: 'Your country',
      questions: [
        'Is there anything you would like to learn about your country?',
        'Which area of your country would you like to get to know better?',
      ],
    },
    {
      theme: 'Daily Life',
      questions: [
        "Tell us about a day you've really enjoyed recently.",
        'Are you planning to do anything special this weekend?',
      ],
    },
  ],
};
