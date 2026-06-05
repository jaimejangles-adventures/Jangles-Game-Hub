import { asset } from "@/lib/asset";

export type SpellWord = {
  word: string;
  image: string;
  label: string;
};

// Ordered by difficulty (word length ascending)
export const SPELL_WORDS: SpellWord[] = [
  { word: 'fox',      image: asset('/objects/fox.svg'),                      label: 'Fox'      },
  { word: 'fish',     image: asset('/objects/fish.svg'),                     label: 'Fish'     },
  { word: 'drum',     image: asset('/count-objects/jamaica-steel-drum.png'), label: 'Drum'     },
  { word: 'tuba',     image: asset('/count-objects/tuba.png'),               label: 'Tuba'     },
  { word: 'mask',     image: asset('/count-objects/korea-mask.png'),         label: 'Mask'     },
  { word: 'skis',     image: asset('/count-objects/swiss-skiis.png'),        label: 'Skis'     },
  { word: 'pizza',    image: asset('/count-objects/pizza.png'),              label: 'Pizza'    },
  { word: 'plane',    image: asset('/count-objects/plane.png'),              label: 'Plane'    },
  { word: 'compass',  image: asset('/count-objects/compass.png'),            label: 'Compass'  },
  { word: 'penguin',  image: asset('/objects/penguin.svg'),                  label: 'Penguin'  },
  { word: 'elephant', image: asset('/objects/elephant.svg'),                 label: 'Elephant' },
  { word: 'sombrero', image: asset('/objects/sombrero.svg'),                 label: 'Sombrero' },
];
