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
