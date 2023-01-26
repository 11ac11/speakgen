import { Part2 } from './types/types';

export const part2: Part2 = {
  instructions:
    'The examiner will ask you/your partner to compare two photographs relating to a question. They will then ask a short question related to the photographs to the other person. Then they will change photographs for the next person.',
  time: 120,
  speakTo: 'The examiner',
  questionsByTheme: [
    {
      theme: 'sports',
      questions: [
        {
          statement: 'Why might these people be spending time outside?',
          image1:
            'https://images.unsplash.com/photo-1474899351970-ee05f7dd1334?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
          image2:
            'https://images.unsplash.com/photo-1464198016405-33fd4527b89d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=803&q=80',
          followUp: 'What are your favourite outdoor activities?',
        },
        {
          statement: 'What could people enjoy about these sports?',
          image1:
            'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
          image2:
            'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=803&q=80',
          followUp: 'Which sport would you prefer to do and why?',
        },
      ],
    },
  ],
};
