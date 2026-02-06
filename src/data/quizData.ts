export interface Question {
  q: string;
  options: string[];
  correct: string;
  audioFile?: string;
  imageFile?: string;
}

export interface QuizRound {
  roundId: number;
  title: string;
  description: string;
  questions: Question[];
}

export const quizData: QuizRound[] = [
  {
    roundId: 1,
    title: "Round 1: Alex & Jamie",
    description: "How well do you know the happy couple?",
    questions: [
      {
        q: "In what year did Alex and Jamie meet?",
        options: ["2015", "2016", "2017", "2018"],
        correct: "2017",
      },
      {
        q: "In the first few weeks of speaking, what blunder did Jamie make?",
        options: [
          "Sent msg about Alex to Alex",
          "Accidentally shared old FB post",
          "Sent Drunk text and turned up at her Mum's",
          "Liked 4 old Insta pics",
        ],
        correct: "Accidentally shared old FB post",
      },
      {
        q: "At the start, how did they sneakily meet up for kisses?",
        options: [
          "Alex snuck out in her car",
          "Jamie snuck Alex into his Dad's",
          "Jamie climbed through Alex's window",
          "Jamie booked a hotel room",
        ],
        correct: "Jamie climbed through Alex's window",
      },
      {
        q: "In what year did they buy their house?",
        options: ["2019", "2021", "2022", "2023"],
        correct: "2021",
      },
      {
        q: "What is their favourite film to watch together?",
        options: ["Bad Boys", "The Proposal", "Rush Hour 2", "Love Actually"],
        correct: "Bad Boys",
      },
      {
        q: "Favourite / most visited restaurant?",
        options: ["Titan", "Jacks", "Pizza Pasta", "Barbary Coast"],
        correct: "Pizza Pasta",
      },
      {
        q: "What was their first foreign holiday?",
        options: ["Benidorm", "Thailand", "Albufeira (Portugal)", "Paris"],
        correct: "Benidorm",
      },
      {
        q: "What sport does Alex surprisingly keep beating Jamie at?",
        options: [
          "Crown Green Bowls",
          "Crazy Golf / Putting",
          "Tennis",
          "Badminton",
        ],
        correct: "Crazy Golf / Putting",
      },
      {
        q: "What is Alex and Jamie's favourite song?",
        options: [
          "Alone with the TV - Mitchell Brothers",
          "Champagne Supernova - Oasis",
          "Touch Me - Rui Da Silva",
          "21 Questions - 50 Cent",
        ],
        correct: "Alone with the TV - Mitchell Brothers",
      },
      {
        q: "What is their favourite date?",
        options: [
          "Picnic Clypse Reservoir",
          "Trip to Comis Spa",
          "Peel for ice cream",
          "Cinema night",
        ],
        correct: "Trip to Comis Spa",
      },
    ],
  },
  {
    roundId: 2,
    title: "Round 2: True or False",
    description: "Sort the fact from the fiction!",
    questions: [
      {
        q: "Alex and Jamie started speaking after they met on a night out?",
        options: ["True", "False"],
        correct: "False",
      },
      {
        q: "Jamie & Alex actually knew each other years before getting together?",
        options: ["True", "False"],
        correct: "False",
      },
      {
        q: "Alex stalked Jamie by driving round Onchan Shoprite car park?",
        options: ["True", "False"],
        correct: "True",
      },
      {
        q: "In the beginning, neither A or J wanted a relationship?",
        options: ["True", "False"],
        correct: "True",
      },
      {
        q: "Jamie told Alex first that he loved her?",
        options: ["True", "False"],
        correct: "False",
      },
      {
        q: "Jamie was going to move into his own place without Alex at first?",
        options: ["True", "False"],
        correct: "False",
      },
      {
        q: "Alex first met Jamie's Dad on a night out in the Manx Arms?",
        options: ["True", "False"],
        correct: "False",
      },
      {
        q: "Alex and Jamie have both been engaged before?",
        options: ["True", "False"],
        correct: "False",
      },
      {
        q: "Alex and Jamie are both the same height?",
        options: ["True", "False"],
        correct: "False",
      },
      {
        q: "Alex and Jamie won £2000 at Bingo once?",
        options: ["True", "False"],
        correct: "True",
      },
    ],
  },
  {
    roundId: 3,
    title: "Round 3: Fill in the Blanks",
    description: "Complete the sentence...",
    questions: [
      {
        q: "Jamie's middle name is ...",
        options: ["Matthew", "Mark", "Michael", "Maddrell"],
        correct: "Mark",
      },
      {
        q: "Alex's middle name is ...",
        options: ["Rose", "Ruth", "Rachel", "Rebecca"],
        correct: "Rebecca",
      },
      {
        q: "Alex's favourite pizza is ...",
        options: [
          "Margarita",
          "Pineapple",
          "Chicken & Sweetcorn",
          "BBQ Pepperoni",
        ],
        correct: "BBQ Pepperoni",
      },
      {
        q: "Alex recently asked Jamie to go to the shop for ... and ...",
        options: [
          "Chewy & Vaseline",
          "Evian & Chocolate",
          "Strawberries & Cream",
          "Milk & Bread",
        ],
        correct: "Chewy & Vaseline",
      },
      {
        q: "On Saturdays before watching Jamie at football Alex ... to ...",
        options: [
          "Visits Starbucks, bring Jamie a Cool Lime Refresha",
          "Visits Maccies, and gets herself a Cheeseburger",
          "Goes Home, collect April for support",
          "Goes to the ATM, bring Jamie the ref money",
        ],
        correct: "Visits Starbucks, bring Jamie a Cool Lime Refresha",
      },
    ],
  },
  {
    roundId: 4,
    title: "Round 4: Who's That?",
    description: "Can you guess who's in the photo as it gradually reveals?",
    questions: [
      {
        q: "What is Alex holding in this photo?",
        options: ["A Prosecco", "A Photo", "A Jug", "A Cocktail"],
        correct: "A Cocktail",
        imageFile: "/images/quiz/Alex - Cocktail.webp",
      },
      {
        q: "Who do we have trying to be scary here?",
        options: [
          "Emma T & Lauren",
          "Alex and Emma F",
          "Sarah & Laura",
          "Nadine & Carlene",
        ],
        correct: "Alex and Emma F",
        imageFile: "/images/quiz/alex-emma.webp",
      },
      {
        q: "Who is wearing the xmas hat in this picture?",
        options: ["Sammie", "Emma", "Sarah", "Marcella"],
        correct: "Marcella",
        imageFile: "/images/quiz/three girls.webp",
      },
      {
        q: "Who is in this old school photo?",
        options: ["Emma C", "Alex", "Jazz", "Ellie"],
        correct: "Emma C",
        imageFile: "/images/quiz/emma callow.webp",
      },
      {
        q: "Who is Maid of Honour for this wedding?",
        options: ["Emma T", "Lauren", "Laura", "Sammie"],
        correct: "Emma T",
        imageFile: "/images/quiz/emma-lauren.webp",
      },
      {
        q: "What does the sign say that Emma T is holding",
        options: [
          "Girl Power",
          "Such A Hottie",
          "Free Hugs",
          "I'm Not With Her",
        ],
        correct: "Such A Hottie",
        imageFile: "/images/quiz/emma.webp",
      },
      {
        q: "Who bagged themselves a trophy in this photo?",
        options: ["Lauren", "Emma F", "Diane", "Sarah B"],
        correct: "Lauren",
        imageFile: "/images/quiz/lauren.webp",
      },
      {
        q: "What is that thing that Marcella has in her hands?",
        options: ["Koala", "Snake", "Crocodile", "Iguana"],
        correct: "Crocodile",
        imageFile: "/images/quiz/marcella.webp",
      },
      {
        q: "Where are the girls in this photo?",
        options: ["Birthday Meal", "Spa", "Hen Party", "Candle Making"],
        correct: "Spa",
        imageFile: "/images/quiz/three girls spa.webp",
      },
      {
        q: "What do Alex and Emma F have on their face here?",
        options: ["Paw prints", "Glitter", "Whiskers", "Face Paint"],
        correct: "Paw prints",
        imageFile: "/images/quiz/alex-emmaF-2.webp",
      },
    ],
  },
  {
    roundId: 5,
    title: "Round 5: Name That Tune",
    description: "Listen carefully and name the song!",
    questions: [
      {
        q: "Name this Franz Ferdinand song",
        options: ["Take Me Out", "Take Me Home", "Take me Down", "Take me Now"],
        correct: "Take Me Out",
        audioFile: "/songs/song1.mp3",
      },
      {
        q: "The classic dance tune Poppiholla belongs to",
        options: ["Sash", "Darude", "P Oakenfold", "Chicane"],
        correct: "Chicane",
        audioFile: "/songs/song2.mp3",
      },
      {
        q: "Who sang this Classic song",
        options: [
          "Bob Segar",
          "Tom Petty",
          "Bruce Springsteen",
          "Jackson Browne",
        ],
        correct: "Bruce Springsteen",
        audioFile: "/songs/song3.mp3",
      },
      {
        q: "Jay Z featured in this song named",
        options: [
          "I Want Some More",
          "Talk That Talk",
          "If You Want It",
          "Give It To Me",
        ],
        correct: "Talk That Talk",
        audioFile: "/songs/song4.mp3",
      },
      {
        q: "Name this Ibiza classic",
        options: ["Sky", "Airwave", "The Way", "Ayla"],
        correct: "Ayla",
        audioFile: "/songs/song5.mp3",
      },
      {
        q: "Name this Adele song",
        options: ["Hometown Glory", "Hello", "Skyfall", "Love In The Dark"],
        correct: "Hometown Glory",
        audioFile: "/songs/song6.mp3",
      },
      {
        q: "Name this early Oasis banger",
        options: ["Slide Away", "Supersonic", "Stand By Me", "Listen Up"],
        correct: "Stand By Me",
        audioFile: "/songs/song7.mp3",
      },
      {
        q: "Name the song",
        options: ["Down In The City", "The Weekend", "Hey Hey Hey", "A-Punk"],
        correct: "A-Punk",
        audioFile: "/songs/song8.mp3",
      },
      {
        q: "Name this Trance classic",
        options: [
          "Coming On Strong",
          "Sunrise",
          "Awakening",
          "As The Rush Comes",
        ],
        correct: "Coming On Strong",
        audioFile: "/songs/song9.mp3",
      },
      {
        q: "Name this Florence The Machine track",
        options: [
          "Dark Days Are Over",
          "Dog Days Are Over",
          "Dark Days Are Here",
          "Dog Days Are Here",
        ],
        correct: "Dog Days Are Over",
        audioFile: "/songs/song10.mp3",
      },
    ],
  },
];
