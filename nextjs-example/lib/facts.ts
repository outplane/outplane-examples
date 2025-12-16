export type ScienceFact = {
  id: number;
  fact: string;
  category: "physics" | "biology" | "chemistry" | "astronomy" | "geology" | "mathematics";
  source?: string;
};

export const scienceFacts: ScienceFact[] = [
  {
    id: 1,
    fact: "A teaspoon of neutron star would weigh about 6 billion tons on Earth.",
    category: "astronomy",
  },
  {
    id: 2,
    fact: "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
    category: "chemistry",
  },
  {
    id: 3,
    fact: "Octopuses have three hearts and blue blood due to copper-based hemocyanin.",
    category: "biology",
  },
  {
    id: 4,
    fact: "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    category: "astronomy",
  },
  {
    id: 5,
    fact: "Water can boil and freeze at the same time under specific conditions called the 'triple point'.",
    category: "physics",
  },
  {
    id: 6,
    fact: "The human body contains enough carbon to make about 9,000 pencils.",
    category: "chemistry",
  },
  {
    id: 7,
    fact: "Bananas are naturally radioactive due to their potassium-40 content.",
    category: "physics",
  },
  {
    id: 8,
    fact: "A single bolt of lightning contains enough energy to toast 100,000 slices of bread.",
    category: "physics",
  },
  {
    id: 9,
    fact: "The shortest war in history lasted 38 to 45 minutes between Britain and Zanzibar.",
    category: "geology",
  },
  {
    id: 10,
    fact: "There are more possible iterations of a game of chess than atoms in the observable universe.",
    category: "mathematics",
  },
  {
    id: 11,
    fact: "Your DNA could stretch from the Sun to Pluto and back 17 times if uncoiled.",
    category: "biology",
  },
  {
    id: 12,
    fact: "Hot water freezes faster than cold water under certain conditions, known as the Mpemba effect.",
    category: "physics",
  },
  {
    id: 13,
    fact: "Venus is the only planet that spins clockwise (retrograde rotation).",
    category: "astronomy",
  },
  {
    id: 14,
    fact: "A day on Venus is longer than a year on Venus.",
    category: "astronomy",
  },
  {
    id: 15,
    fact: "The human brain uses about 20% of the body's total energy despite being only 2% of body weight.",
    category: "biology",
  },
  {
    id: 16,
    fact: "Gold is so malleable that one ounce can be stretched into a wire 50 miles long.",
    category: "chemistry",
  },
  {
    id: 17,
    fact: "The Milky Way galaxy is on a collision course with Andromeda, expected in about 4.5 billion years.",
    category: "astronomy",
  },
  {
    id: 18,
    fact: "Tardigrades can survive in the vacuum of space, extreme temperatures, and radiation.",
    category: "biology",
  },
  {
    id: 19,
    fact: "If you could fold a piece of paper 42 times, it would reach the Moon.",
    category: "mathematics",
  },
  {
    id: 20,
    fact: "Sound travels about 4.3 times faster in water than in air.",
    category: "physics",
  },
  {
    id: 21,
    fact: "The Great Wall of China is not visible from space with the naked eye, contrary to popular belief.",
    category: "geology",
  },
  {
    id: 22,
    fact: "Sharks existed before trees. Sharks have been around for about 400 million years.",
    category: "biology",
  },
  {
    id: 23,
    fact: "A cubic inch of human bone can bear a load of 19,000 pounds, roughly the weight of five pickup trucks.",
    category: "biology",
  },
  {
    id: 24,
    fact: "The Amazon rainforest produces about 20% of the world's oxygen.",
    category: "biology",
  },
  {
    id: 25,
    fact: "One million Earths could fit inside the Sun.",
    category: "astronomy",
  },
  {
    id: 26,
    fact: "The speed of light in a vacuum is exactly 299,792,458 meters per second.",
    category: "physics",
  },
  {
    id: 27,
    fact: "Helium is the only element that was discovered in space before it was found on Earth.",
    category: "chemistry",
  },
  {
    id: 28,
    fact: "The Earth's core is as hot as the surface of the Sun, around 5,500 degrees Celsius.",
    category: "geology",
  },
  {
    id: 29,
    fact: "Humans share about 60% of their DNA with bananas.",
    category: "biology",
  },
  {
    id: 30,
    fact: "There are more stars in the universe than grains of sand on all of Earth's beaches.",
    category: "astronomy",
  },
];

export function getRandomFact(): ScienceFact {
  const randomIndex = Math.floor(Math.random() * scienceFacts.length);
  return scienceFacts[randomIndex];
}

export function getFactsByCategory(category: ScienceFact["category"]): ScienceFact[] {
  return scienceFacts.filter((fact) => fact.category === category);
}
