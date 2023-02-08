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
          followUp:
            'What types of activites do you enjoy doing with your family?',
        },
      ],
    },
    {
      theme: 'Environment',
      questions: [
        {
          statement: 'How are these people helping the environment?',
          image1:
            'https://images.unsplash.com/photo-1474625417279-a1308b1bb4a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1174&q=80',
          image2:
            'https://images.unsplash.com/photo-1565803974275-dccd2f933cbb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
          followUp: 'What do you do to help save the environment?',
        },
        {
          statement:
            'What effects do these energy sources have on the environment?',
          image1:
            'https://images.unsplash.com/photo-1624397640148-949b1732bb0a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
          image2:
            'https://images.unsplash.com/photo-1547505906-49fd5d7824bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1176&q=80',
          followUp:
            'Do you think using greener energy is one of the most important things our governments should focus on?',
        },
      ],
    },
    {
      theme: 'People & Life',
      questions: [
        {
          statement: 'How important is it to help in these situations?',
          image1:
            'https://images.unsplash.com/photo-1609558931141-606ae4284153?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          image2:
            'https://www.football4football.com/storage/img/articleimages/originals/I4wFD9e3NTkze9DSIuc33gS6HyHXP4OHgkl.jpg',
          followUp: 'Can you think of a time when you helped someone?',
        },
        {
          statement:
            'What are the people enjoying about spending time in these gardens?',
          image1:
            'https://images.unsplash.com/photo-1601001815894-4bb6c81416d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          image2:
            'https://images.unsplash.com/photo-1570543593818-addd35a926a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=435&q=80',
          followUp: 'Have you ever tried to grow any food from a plant?',
        },
      ],
    },
    {
      theme: 'Technology',
      questions: [
        {
          statement:
            'Which of these inventions have affected our lives most and why?',
          image1:
            'https://images.unsplash.com/photo-1606768666853-403c90a981ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80',
          image2:
            'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          followUp: 'Do you use a phone or a computer more frequently?',
        },
        {
          statement: 'How has technology helped improve these industries?',
          image1:
            'https://images.unsplash.com/photo-1481555716071-8830d3e254ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          image2:
            'https://plus.unsplash.com/premium_photo-1663039952394-00e73f235728?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          followUp:
            'Can you think of another industry that uses lots of new technology?',
        },
      ],
    },
    {
      theme: 'Entertainment',
      questions: [
        {
          statement: 'Why might people enjoy listening to music in these ways?',
          image1:
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          image2:
            'https://images.unsplash.com/photo-1519121664077-7a7c5beef683?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=786&q=80',
          followUp: 'How do you like to listen to music?',
        },
        {
          statement:
            'Why might people prefer to watch something in one of these ways more than the other?',
          image1:
            'https://images.unsplash.com/photo-1608170825938-a8ea0305d46c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=725&q=80',
          image2:
            'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          followUp: 'Do you enjoy going to the theatre?',
        },
      ],
    },
    {
      theme: 'Nature',
      questions: [
        {
          statement: 'Which of these disasters is the easiest to prepare for?',
          image1:
            'https://images.unsplash.com/photo-1527482937786-6608f6e14c15?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          image2:
            'https://images.unsplash.com/photo-1580250642511-1660fe42ad58?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=725&q=80',
          followUp:
            'What are the most common natural disasters in your country?',
        },
        {
          statement: 'Why do people like doing these activities with animals?',
          image1:
            'https://images.unsplash.com/photo-1494947665470-20322015e3a8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          image2:
            'https://images.unsplash.com/photo-1617938544737-cf7b41829226?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
          followUp: 'Do you spend much time with animals?',
        },
      ],
    },
  ],
};
