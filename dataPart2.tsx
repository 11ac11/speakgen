import { Part2 } from './types/types';

export const part2: Part2 = {
  instructions:
    'The examiner will ask you/your partner to compare two photographs relating to a question. They will then ask a short question related to the photographs to the other person. Then they will change photographs for the next person.',
  time: 120,
  speakTo: 'The examiner',
  questionsByTheme: [
    {
      theme: 'Sports',
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
    {
      theme: 'Family',
      questions: [
        {
          statement:
            'What are the benefits of these ways of communicating with friends and family?',
          image1:
            'https://images.unsplash.com/photo-1648737966266-3941c7397bce?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1188&q=80',
          image2:
            'https://plus.unsplash.com/premium_photo-1664910448640-aa6add78b461?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          followUp: 'Does your family often use technology to communicate?',
        },
        {
          statement: 'Why could these families be enjoying this moment?',
          image1:
            'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=754&q=80',
          image2:
            'https://images.unsplash.com/photo-1628191013085-990d39ec25b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          followUp: 'Which sport would you prefer to do and why?',
        },
      ],
    },
  ],
};
