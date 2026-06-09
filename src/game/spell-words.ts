import { asset } from "@/lib/asset";

export type SpellWord = {
  word: string;
  image: string;
  label: string;
  hintEmoji?: string;
  quip?: string;
};

// All images come from public/book-objects/ (real book illustrations)
export const SPELL_WORDS: SpellWord[] = [
  { word: 'fox',      image: asset('/characters/FOX 1.png'),                  label: 'Fox',      hintEmoji: '🦊', quip: "Foxy is Jaime & Jeff's clever guide on every adventure!" },
  { word: 'fish',     image: asset('/book-objects/flying-fish.png'),          label: 'Fish',     quip: "Jaime spotted a glowing one near the Great Barrier Reef!" },
  { word: 'drum',     image: asset('/book-objects/jamaica-steel-drum.png'),   label: 'Drum',     quip: "Jeff played a steel drum in Jamaica and the whole beach started dancing!" },
  { word: 'tuba',     image: asset('/book-objects/tuba.png'),                 label: 'Tuba',     quip: "Casey made Jeff lug a tuba all the way through Europe — for one song!" },
  { word: 'mask',     image: asset('/book-objects/KOREA-MASK.png'),           label: 'Mask',     quip: "Jaime wore a traditional mask at a Seoul festival and scared Fante!" },
  { word: 'skis',     image: asset('/book-objects/swiss-skiis.png'),          label: 'Skis',     quip: "Jaime zoomed down the Swiss Alps on these — Jeff stayed in the lodge and ate fondue!" },
  { word: 'pizza',    image: asset('/book-objects/pizza.png'),                label: 'Pizza',    quip: "Jaime and Jeff ate a whole pizza after their big Rome concert!" },
  { word: 'plane',    image: asset('/book-objects/plane.png'),                label: 'Plane',    quip: "Air Fante flies Jaime, Jeff & Casey to every new country on the tour!" },
  { word: 'compass',  image: asset('/book-objects/compass.png'),              label: 'Compass',  quip: "Casey never travels without one — she says Jaime's sense of direction is terrible!" },
  { word: 'penguin',  image: asset('/book-objects/SOUTH-AFRICA-PENGUIN.png'), label: 'Penguin',  quip: "Fante waddled right into a penguin colony in South Africa and made instant friends!" },
  { word: 'elephant', image: asset('/book-objects/ELEPHANT.png'),             label: 'Elephant', quip: "Fante is the world's most well-travelled elephant — and the best co-pilot!" },
  { word: 'sombrero', image: asset('/book-objects/mexico-hat.png'),           label: 'Sombrero', quip: "Jaime jammed with a mariachi band in Mexico City wearing one just like this!" },
];
