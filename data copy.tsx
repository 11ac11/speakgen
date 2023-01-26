import { Topics } from './types/topics';

export const topics: Topics = [
  {
    topic: 'What are the benefits of a vegetarian diet?',
    points: ['Nutrition', 'Environment', 'Ethics', 'Variety', 'Health'],
  },
  {
    topic: 'What impact is pollution having on the environment?',
    points: ['Air', 'Water', 'Land', 'Wildlife', 'Climate'],
  },
  {
    topic: 'What is the most importance part of education?',
    points: ['Knowledge', 'Skills', 'Opportunities', 'Confidence', 'Success'],
  },
  {
    topic: 'Which is the most devasting effect of climate change?',
    points: ['Weather', 'Sea level', 'Ecosystems', 'Agriculture', 'Health'],
  },
  {
    topic: 'What are the advantages of learning a foreign language?',
    points: ['Communication', 'Culture', 'Employment', 'Travel', 'Thinking'],
  },
  {
    topic: 'Why would these ideas attract more tourists to the town?',
    points: [
      'building a large nightclub',
      'putting up security cameras',
      'building holiday flats',
      'providing parks',
      'having more shops',
    ],
  },
  {
    topic: 'Why might people choose to wear these different clothes?',
    points: [
      'suit and tie',
      'shorts and t-shirt',
      'tracksuit and trainers',
      'jeans and a jumper',
      'dress and high heels',
    ],
  },
  {
    topic: 'How could each item be useful on a camping trip?',
    points: [
      'a mobile phone',
      'a torch',
      'a rope',
      'a first aid kit',
      'a camping gas stove',
    ],
  },
  {
    topic: 'Why do people like to go on these types of holidays?',
    points: [
      'a beach holiday',
      'skiing',
      'a city break',
      'camping',
      'adventure holidays',
    ],
  },
  {
    topic: 'Why do people enjoy doing these activities?',
    points: [
      'drawing/painting',
      'playing a team sport',
      'jogging',
      'listening to music',
      'gardening',
    ],
  },
];

export type Part1Questions = {
  theme: string;
  question: string;
};

export const part1Questions: Part1Questions[] = [
  {
    theme: 'Your country',
    question: 'Is there anything you would like to learn about your country?',
  },
  {
    theme: 'Your country',
    question:
      'Which area of your country would you like to get to know better?',
  },
  {
    theme: 'Daily Life',
    question: "Tell us about a day you've really enjoyed recently.",
  },
  {
    theme: 'Daily Life',
    question: 'Are you planning to do anything special this weekend?',
  },
];

export type Part2Questions = {
  question: string;
  image1: string;
  image2: string;
  followUp: string;
};

export const part2Questions: Part2Questions[] = [
  {
    question: 'Why might these people be spending time outside?',
    image1:
      'https://images.unsplash.com/photo-1474899351970-ee05f7dd1334?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    image2:
      'https://images.unsplash.com/photo-1464198016405-33fd4527b89d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=803&q=80',
    followUp: 'What are your favourite outdoor activities?',
  },
  {
    question: 'What could people enjoy about these sports?',
    image1:
      'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
    image2:
      'https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=803&q=80',
    followUp: 'Which sport would you prefer to do and why?',
  },
];

export type Part4Questions = {
  theme: string;
  questions: string[];
};

export const part4Questions: Part4Questions[] = [
  {
    theme: 'Travel',
    questions: [
      'Do you think you have to spend a lot of money to have a good holiday?',
      "Some people say we travel too much these days and shouldn't go on so many holidays. What do you think?",
      'Why do you think people like to go away on holiday?',
      'What do you think is the biggest advantage of living in a place where there are a lot of tourists?',
    ],
  },
  {
    theme: 'Where you live',
    questions: [
      'What can people do to have a good holiday in your country?',
      "What's good about living in cities in your country?",
      'Which is the best city for people to visit in your country?',
      "If you could choose to visit a city you've never been to, which one would you choose?",
      'Would you prefer to live in a modern city or a city with lots of history?',
      'Are there advantages to living in a small town rather than in a big city?',
      'Do you think it is better for children to grow up in the city or in the countryside?',
    ],
  },
  {
    theme: 'History',
    questions: [
      'What do you think makes a good museum?',
      'How do you think the teaching of history in schools could be improved?',
      'Do you agree that learning about our past is important for our future?',
      'What has been the most important moment in your life so far?',
      'What items from our lives today will be in the history museums of the future?',
    ],
  },
  {
    theme: 'Life & Leisure',
    questions: [
      'If you could change one thing about your life, what would you change?',
      "Many people say life's too busy these days. Why do you think they say this?",
      'Many people want to become famous nowadays. Why do you think this is?',
      "Is it important to enjoy a job or do you think it's enough to be paid well?",
      'How important is it to go on holiday every year?',
    ],
  },
];
