// Words pulled from the Jaime Jangles book universe —
// animals, instruments, and objects the kids already know from the books.

export type Word = {
  word: string;
  emoji: string;
  caseyIntro: string;
  caseyPass: string[];    // randomly chosen on pass
  caseyHint: string;      // shown after a failed attempt
  hint: string;           // claude gets this as context too
};

export const WORDS: Word[] = [
  {
    word: 'elephant',
    emoji: '🐘',
    caseyIntro: 'Draw Elefanté! She goes on every adventure and has the biggest, wobbliest trunk!',
    caseyPass: [
      'THAT IS ELEFANTÉ! Oh my goodness, you drew her so well!',
      'YES! I can see her trunk! Elefanté loves you!',
      'Perfect! Elefanté is going to go on SO many adventures with your drawing!',
    ],
    caseyHint: 'Try a big round circle for the body, then a long squiggly trunk hanging down!',
    hint: 'Elefanté — the pink elephant from the Jaime Jangles books. Big round body, long trunk, huge ears.',
  },
  {
    word: 'penguin',
    emoji: '🐧',
    caseyIntro: 'Penguins! We followed them all the way to Antarctica — brrrr! So cold! Draw one!',
    caseyPass: [
      'A penguin!! They are SO cute and SO chilly! Just like yours!',
      'You drew a penguin! Jaime would love this — she loves penguins!',
      'WADDLE WADDLE! Your penguin is perfect!',
    ],
    caseyHint: 'A round tummy, little flippers on the sides, and tiny orange feet!',
    hint: 'A penguin — black and white, round belly, small flippers, orange feet.',
  },
  {
    word: 'fish',
    emoji: '🐟',
    caseyIntro: 'A flying fish from Barbados! They actually JUMP right out of the ocean! So cool!',
    caseyPass: [
      'SPLASH! Your fish is flying! Barbados would be SO proud!',
      'A flying fish! Catch it before it splashes back in!',
      'YES! That fish is ready to fly over the whole ocean!',
    ],
    caseyHint: 'An oval body, a triangle tail at the back, and a tiny round eye!',
    hint: 'A fish — oval body, triangle tail, fins. Maybe even flying like the Barbados flying fish.',
  },
  {
    word: 'fox',
    emoji: '🦊',
    caseyIntro: "FOXY! Our sneaky little friend who hides on every single page of the Jangles books! Draw Foxy!",
    caseyPass: [
      'FOXY! You found Foxy by drawing them! That is amazing!',
      'There Foxy is! Hiding in your drawing! So sneaky!',
      'You drew Foxy so well — I can see the pointy ears and everything!',
    ],
    caseyHint: 'Pointy ears on top, a big fluffy tail, and a little pointy nose!',
    hint: 'Foxy the fox — pointed ears, fluffy tail, pointy snout, big eyes.',
  },
  {
    word: 'kangaroo',
    emoji: '🦘',
    caseyIntro: 'A kangaroo! We played tennis in Melbourne and saw these giant hoppy guys! Draw one!',
    caseyPass: [
      'HOP HOP HOP! Your kangaroo is amazing!',
      'That kangaroo is ready to bounce all the way to Australia!',
      'YES! Big back legs, little front arms — you got it!',
    ],
    caseyHint: 'Really big back legs, tiny little front arms, and huge tall ears!',
    hint: 'A kangaroo — large muscular back legs, small front arms, long tail, big ears.',
  },
  {
    word: 'octopus',
    emoji: '🐙',
    caseyIntro: 'An octopus! Draw one with eight wiggly, squiggly arms — count them if you can!',
    caseyPass: [
      'EIGHT ARMS! You drew all of them! Amazing!',
      'Your octopus is SO wiggly and so wonderful!',
      'That octopus is ready to swim the whole ocean!',
    ],
    caseyHint: 'A big round head on top and EIGHT bendy arms waving below!',
    hint: 'An octopus — round head/mantle, eight tentacle arms spreading out below.',
  },
  {
    word: 'sombrero',
    emoji: '🎩',
    caseyIntro: 'A sombrero! The big beautiful hat from Mexico where Jaime and Jeff danced at a fiesta!',
    caseyPass: [
      '¡Olé! The most beautiful sombrero ever drawn!',
      'That hat is SO big! You could hide under it!',
      'Your sombrero is perfect — Jeff would wear that!',
    ],
    caseyHint: 'A super wide brim going way out on both sides, and a tall rounded top!',
    hint: 'A sombrero — very wide brim, tall rounded crown. The big Mexican hat.',
  },
  {
    word: 'trombone',
    emoji: '🎺',
    caseyIntro: 'A trombone! We heard the most amazing jazz music in New Orleans — BOOM BWAH BWAH!',
    caseyPass: [
      'BWAH BWAH! Your trombone is making music already!',
      'Jazz legend! That trombone is incredible!',
      "New Orleans would be SO proud of your trombone!",
    ],
    caseyHint: 'A long slide in the middle that moves in and out, and a big flared bell at the end!',
    hint: 'A trombone — long slide tube, U-bend, bell at the end. A brass instrument.',
  },
  {
    word: 'ukulele',
    emoji: '🎸',
    caseyIntro: 'A ukulele! It is like a tiny little guitar — so cute, so musical, so Jangles!',
    caseyPass: [
      'STRUM! Your ukulele is so cute I want to play it!',
      'Tiny but mighty! That ukulele is perfect!',
      'Four little strings and so much music! You drew it!',
    ],
    caseyHint: 'A small round body at the bottom, a long thin neck going up, and four little strings!',
    hint: 'A ukulele — small guitar-like body, long neck, four strings, tuning pegs at the top.',
  },
  {
    word: 'sandcastle',
    emoji: '🏰',
    caseyIntro: 'A sandcastle! We built the most AMAZING one at the beach — with towers and a moat and everything!',
    caseyPass: [
      'The most royal sandcastle ever! All hail the Jangles castle!',
      'I want to live in THAT sandcastle! So beautiful!',
      'Your sandcastle is so tall! The waves cannot knock it down!',
    ],
    caseyHint: 'Square walls, round towers on the corners, and a little flag flying from the very top!',
    hint: 'A sandcastle — turrets, walls, battlements, flag on top. Beach castle made of sand.',
  },
  {
    word: 'star',
    emoji: '⭐',
    caseyIntro: 'Draw a star! Jaime and Jeff connected the dots in the night sky and found the constellation Virgo!',
    caseyPass: [
      'A star! It is shining so bright — I can see it from space!',
      'TWINKLE TWINKLE! Your star is the prettiest one!',
      'That star belongs in the Jangles constellation!',
    ],
    caseyHint: 'Five pointy points going all the way out from the middle!',
    hint: 'A star — classic five-pointed star shape.',
  },
  {
    word: 'boat',
    emoji: '⛵',
    caseyIntro: 'Our boat — the CleoJangles! We sailed it on EVERY ocean around the whole wide world!',
    caseyPass: [
      'All aboard the CleoJangles! Your boat is setting sail!',
      'CAPTAIN! Your boat is ready for any ocean!',
      'Smooth sailing! That boat could cross all seven seas!',
    ],
    caseyHint: 'A wide curved bottom like a bowl, then a tall triangle sail going way up high!',
    hint: 'A sailboat — wide hull, tall mast, triangular sail.',
  },
  {
    word: 'drum',
    emoji: '🥁',
    caseyIntro: 'A drum! The music from Ghana has the most amazing drums — BOOM BOOM BOOM!',
    caseyPass: [
      'BOOM BOOM BOOM! Your drum is making music!',
      'Ghana would be so proud! That drum is perfect!',
      'Hit it! Your drum sounds amazing even in a drawing!',
    ],
    caseyHint: 'A round cylinder shape with lines on the side, and two sticks crossed on top!',
    hint: 'A drum — cylindrical body, drum heads on top and bottom, drumsticks.',
  },
  {
    word: 'sun',
    emoji: '☀️',
    caseyIntro: 'The sun! It shone on ALL of our adventures — from Jamaica to Japan and everywhere in between!',
    caseyPass: [
      'So warm! So bright! Your sun is lighting up the whole world!',
      'The most beautiful sun! Jaime and Jeff are getting tanned under it!',
      'That sun is rising over ALL the countries! Gorgeous!',
    ],
    caseyHint: 'A big circle in the middle, then rays shooting out all around like spikes!',
    hint: 'A sun — circle with rays emanating outward all around.',
  },
  {
    word: 'rainbow',
    emoji: '🌈',
    caseyIntro: 'A rainbow! All the colours of the whole world together — just like the Jaime Jangles universe!',
    caseyPass: [
      'ALL THE COLOURS! Your rainbow is the most beautiful thing!',
      'Every colour of every country all in one rainbow! Perfect!',
      'Jaime and Jeff are sliding down your rainbow right now!',
    ],
    caseyHint: 'Big curved colourful stripes — red, orange, yellow, green, blue, purple — like a smile in the sky!',
    hint: 'A rainbow — arched bands of colour, classic seven-colour arc.',
  },
];

// ── Ghost tutorial paths ──────────────────────────────────────────────────
// Coordinates are normalized [0..1] relative to canvas width/height.
// Each word has an array of strokes. Each stroke is either:
//   - An array of [x,y] points (a path to draw)
//   - ['circle', cx, cy, r] to draw a circle

export type PathPoint = [number, number];
export type PathStroke = PathPoint[] | ['circle', number, number, number];
export type GhostPaths = Record<string, PathStroke[]>;

export const GHOST_PATHS: GhostPaths = {
  star: [
    [[.50,.20],[.57,.40],[.78,.40],[.61,.53],[.68,.73],[.50,.62],[.32,.73],[.39,.53],[.22,.40],[.43,.40],[.50,.20]],
  ],
  sun: [
    ['circle', .50,.50,.18],
    [[.50,.15],[.50,.28]], [[.50,.85],[.50,.72]],
    [[.15,.50],[.28,.50]], [[.85,.50],[.72,.50]],
    [[.26,.26],[.35,.35]], [[.74,.26],[.65,.35]],
    [[.26,.74],[.35,.65]], [[.74,.74],[.65,.65]],
  ],
  fish: [
    [[.62,.50],[.52,.38],[.30,.38],[.18,.50],[.30,.62],[.52,.62],[.62,.50]],
    [[.62,.50],[.82,.32],[.84,.68],[.62,.50]],
  ],
  boat: [
    [[.22,.68],[.78,.68],[.72,.78],[.28,.78],[.22,.68]],
    [[.50,.68],[.50,.26]],
    [[.50,.28],[.74,.52],[.50,.68]],
  ],
  rainbow: [
    // 7 points per arc → smooth curve rendering produces proper semicircles
    [[.12,.76],[.22,.46],[.34,.28],[.50,.22],[.66,.28],[.78,.46],[.88,.76]],
    [[.16,.78],[.25,.50],[.37,.34],[.50,.28],[.63,.34],[.75,.50],[.84,.78]],
    [[.20,.80],[.29,.55],[.40,.40],[.50,.34],[.60,.40],[.71,.55],[.80,.80]],
    [[.24,.82],[.32,.60],[.43,.46],[.50,.40],[.57,.46],[.68,.60],[.76,.82]],
    [[.28,.84],[.36,.65],[.45,.52],[.50,.46],[.55,.52],[.64,.65],[.72,.84]],
  ],
  octopus: [
    // Mantle (head) — 12-point closed oval for a smooth, rounded shape
    [[.50,.12],[.64,.14],[.74,.22],[.76,.36],[.72,.48],[.62,.54],[.50,.56],[.38,.54],[.28,.48],[.24,.36],[.26,.22],[.36,.14],[.50,.12]],
    // Eyes
    ['circle',.41,.30,.05],
    ['circle',.59,.30,.05],
    // 8 tentacles — fan symmetrically, outermost ones sweep wide, all with
    // 4-5 points so the smooth renderer produces gentle S-shaped arms
    [[.34,.54],[.22,.64],[.14,.76],[.16,.88],[.20,.94]],  // 1 far-left
    [[.40,.56],[.34,.68],[.30,.80],[.32,.90]],             // 2
    [[.45,.58],[.42,.70],[.40,.82],[.40,.92]],             // 3
    [[.49,.58],[.48,.72],[.47,.84],[.46,.93]],             // 4
    [[.51,.58],[.52,.72],[.53,.84],[.54,.93]],             // 5
    [[.55,.58],[.58,.70],[.60,.82],[.60,.92]],             // 6
    [[.60,.56],[.66,.68],[.70,.80],[.68,.90]],             // 7
    [[.66,.54],[.78,.64],[.86,.76],[.84,.88],[.80,.94]],  // 8 far-right
  ],
  penguin: [
    [[.50,.26],[.62,.32],[.64,.56],[.56,.70],[.50,.72],[.44,.70],[.36,.56],[.38,.32],[.50,.26]],
    [[.41,.34],[.30,.50],[.37,.58]],   // left flipper
    [[.59,.34],[.70,.50],[.63,.58]],   // right flipper
    [[.44,.72],[.40,.82]], [[.56,.72],[.60,.82]],           // feet
    ['circle',.44,.34,.03],            // left eye
    ['circle',.56,.34,.03],            // right eye
    // Tummy patch — inner oval so kids can see the white belly to colour
    [[.50,.36],[.56,.44],[.56,.58],[.50,.62],[.44,.58],[.44,.44],[.50,.36]],
  ],
  fox: [
    [[.50,.22],[.62,.28],[.66,.40],[.60,.52],[.50,.56],[.40,.52],[.34,.40],[.38,.28],[.50,.22]],
    [[.38,.28],[.30,.16],[.42,.26]],   // left ear
    [[.62,.28],[.70,.16],[.58,.26]],   // right ear
    [[.50,.56],[.50,.68]],             // neck/body
    // Bushy tail — sweeps left and arcs back, more points = fuller curve
    [[.50,.68],[.40,.74],[.28,.80],[.18,.82],[.14,.76],[.18,.68],[.28,.66]],
    ['circle',.44,.36,.03], ['circle',.56,.36,.03],  // eyes
  ],
  elephant: [
    [[.50,.26],[.66,.26],[.74,.36],[.72,.54],[.60,.62],[.40,.62],[.28,.54],[.26,.36],[.34,.26],[.50,.26]],
    [[.34,.28],[.30,.18],[.26,.14]],
    [[.66,.28],[.70,.18],[.74,.14]],
    [[.40,.62],[.38,.70],[.36,.78]], [[.54,.62],[.56,.70],[.58,.78]],
    // Trunk — more points for a sweeping smooth curve
    [[.36,.38],[.28,.44],[.24,.52],[.26,.60],[.32,.66],[.38,.63]],
    ['circle',.44,.34,.04],
  ],
  drum: [
    [[.32,.36],[.68,.36],[.68,.66],[.32,.66],[.32,.36]],
    [[.32,.36],[.50,.30],[.68,.36]],
    [[.42,.30],[.44,.16]], [[.58,.30],[.56,.16]],
  ],
  sombrero: [
    [[.50,.22],[.60,.32],[.56,.40],[.50,.42],[.44,.40],[.40,.32],[.50,.22]],
    [[.16,.42],[.84,.42],[.78,.50],[.50,.54],[.22,.50],[.16,.42]],
  ],
  ukulele: [
    [[.50,.16],[.50,.52]],
    [[.50,.52],[.60,.56],[.64,.64],[.62,.74],[.50,.78],[.38,.74],[.36,.64],[.40,.56],[.50,.52]],
    [[.50,.52],[.50,.60]], [[.50,.63],[.50,.71]],
  ],
  sandcastle: [
    [[.30,.72],[.30,.48],[.44,.48],[.44,.72]],
    [[.56,.72],[.56,.48],[.70,.48],[.70,.72]],
    [[.30,.72],[.70,.72],[.70,.60],[.30,.60],[.30,.72]],
    [[.50,.48],[.50,.30]],
    [[.50,.30],[.60,.36],[.50,.42]],
  ],
  trombone: [
    // BELL — large flared opening on the LEFT (was completely missing before).
    // 8-point polygon approximating the circular rim + cone taper.
    [[.24,.22],[.14,.10],[.06,.14],[.04,.24],[.06,.36],[.14,.42],[.24,.42],[.24,.22]],
    // UPPER TUBE — top edge of the two-tube slide assembly, runs diagonally right
    [[.24,.22],[.80,.40]],
    // LOWER TUBE — bottom edge of the slide assembly, parallel and below
    [[.24,.42],[.80,.58]],
    // MIDDLE SEPARATOR — the visible gap between the two stacked parallel tubes
    [[.36,.35],[.80,.49]],
    // SLIDE BOW — U-bend at the far lower-right connecting the two tubes
    [[.80,.40],[.84,.42],[.86,.46],[.86,.52],[.84,.56],[.80,.58]],
    // MOUTHPIECE — small tube + cup at the upper-right end
    [[.80,.40],[.88,.36],[.94,.34]],
    [[.94,.34],[.96,.40]],
  ],
  kangaroo: [
    // HEAD — small separate oval with elongated snout (horse-like, not rat-like)
    // Facing right. Small relative to body = key kangaroo proportion.
    [
      [.66,.22],[.70,.17],[.76,.17],[.82,.22],[.84,.30],
      [.80,.38],[.72,.42],[.64,.40],[.60,.32],[.62,.24],[.66,.22],
    ],
    // EARS — very tall pointed ears rising well above the head
    // (rat ears are small & round; kangaroo ears are huge & tall)
    [[.64,.22],[.60,.11],[.64,.06],[.72,.10],[.68,.22]],
    // EYE
    ['circle',.74,.28,.03],
    // NECK — short stroke bridging head to body
    [[.68,.42],[.62,.50]],
    // BODY — large upright oval, clearly separate from and bigger than the head
    [
      [.44,.40],[.56,.36],[.64,.40],[.68,.52],
      [.62,.66],[.50,.72],[.36,.72],[.26,.64],
      [.22,.52],[.28,.42],[.40,.36],[.44,.40],
    ],
    // TINY FRONT ARMS — deliberately puny (T-Rex arms); not rat-sized
    [[.64,.54],[.68,.60],[.66,.66]],
    // MASSIVE BACK LEG — takes up the whole lower-right of the canvas
    // Starts at rump, sweeps down through a large thigh arc to the knee
    [[.50,.72],[.56,.78],[.64,.84],[.72,.90]],
    // LONG FOOT — kangaroos have very long horizontal feet; extends far forward
    [[.72,.90],[.76,.94],[.88,.94],[.94,.90]],
    // TAIL — starts thick at the rump, tapers as it curves down-left
    [[.36,.72],[.26,.76],[.16,.82],[.12,.90]],
  ],
};
