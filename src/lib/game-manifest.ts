export type GameCategory = "geography-quest" | "music-arts" | "arcade-adventures" | "math-games" | "puzzles" | "learning";
import { asset } from "@/lib/asset";

export type CategoryEntry = {
  slug: GameCategory;
  title: string;
  emoji: string;
  eyebrow: string;
  accent: string;
  headerLogo?: string;
  headerCharacter?: string;
};

export const CATEGORY_MANIFEST: CategoryEntry[] = [
  {
    slug: "arcade-adventures",
    title: "Arcade Adventures",
    emoji: "🕹️",
    eyebrow: "Fast-paced flying & collecting",
    accent: "#22C55E",
  },
  {
    slug: "geography-quest",
    title: "Geography Quest",
    emoji: "🗺️",
    eyebrow: "Map exploration & country discovery",
    accent: "#3B82F6",
  },
  {
    slug: "math-games",
    title: "Math Games",
    emoji: "🔢",
    eyebrow: "Numbers, counting & problem solving",
    accent: "#F97316",
    headerLogo: asset("/characters/casey-can-logo.png"),
    headerCharacter: asset("/characters/map-casey.png"),
  },
  {
    slug: "music-arts",
    title: "Music & Arts",
    emoji: "🎨",
    eyebrow: "Sound, rhythm & creative expression",
    accent: "#FF4EAB",
  },
  {
    slug: "puzzles",
    title: "Puzzles",
    emoji: "🧩",
    eyebrow: "Brain teasers & logic challenges",
    accent: "#8B5CF6",
  },
  {
    slug: "learning",
    title: "Learning",
    emoji: "📚",
    eyebrow: "Skills, typing & real-world learning",
    accent: "#48DBFB",
  },
];

export type GameManifestEntry = {
  slug: "music-match" | "find-foxy" | "world-adventure" | "elefante" | "fly-the-flag" | "name-that-country" | "air-fante-collect" | "draw-with-casey" | "sliding-puzzle" | "casey-can-count" | "foxer" | "jangles-ball" | "count-with-jaime" | "spot-the-difference" | "pacman" | "mastermind" | "casey-can-subtract" | "casey-can-multiply" | "casey-can-divide" | "jangles-kong" | "casey-can-spell" | "foxy-word-scramble" | "match-game" | "type-with-casey" | "color-mix" | "jangles-pong" | "casey-can-roman-numeral" | "casey-can-pay" | "chess" | "racer";
  href: "/games/music-match" | "/games/find-foxy" | "/games/world-adventure" | "/games/elefante" | "/games/fly-the-flag" | "/games/name-that-country" | "/games/air-fante-collect" | "/games/draw-with-casey" | "/games/sliding-puzzle" | "/games/casey-can-count" | "/games/foxer" | "/games/jangles-ball" | "/games/count-with-jaime" | "/games/spot-the-difference" | "/games/pacman" | "/games/mastermind" | "/games/casey-can-subtract" | "/games/casey-can-multiply" | "/games/casey-can-divide" | "/games/jangles-kong" | "/games/casey-can-spell" | "/games/foxy-word-scramble" | "/games/match-game" | "/games/type-with-casey" | "/games/color-mix" | "/games/jangles-pong" | "/games/casey-can-roman-numeral" | "/games/casey-can-pay" | "/games/chess" | "/games/racer";
  title: string;
  eyebrow: string;
  description: string;
  accent: string;
  emoji: string;
  image: string;
  status: "live" | "coming-soon";
  category: GameCategory;
};

export const GAME_MANIFEST: GameManifestEntry[] = [
  {
    slug: "music-match",
    href: "/games/music-match",
    title: "Music Match",
    eyebrow: "Listen and guess",
    description:
      "Travel the world through music. Hear a clip, follow the rhythm, and match it to the right country on the map.",
    accent: "#FF4EAB",
    emoji: "🎵",
    image: asset("/characters/horns-jaime-jeff.png"),
    status: "live",
    category: "music-arts",
  },
  {
    slug: "find-foxy",
    href: "/games/find-foxy",
    title: "Find Foxy",
    eyebrow: "Clues and passport stamps",
    description:
      "Follow the clues, guess the country, and collect passport stamps on a world chase.",
    accent: "#3B82F6",
    emoji: "🦊",
    image: asset("/characters/FOX 3.png"),
    status: "coming-soon",
    category: "geography-quest",
  },
  {
    slug: "world-adventure",
    href: "/games/world-adventure",
    title: "Find Jaime & Jeff",
    eyebrow: "Follow their trail",
    description:
      "Jaime and Jeff are zigzagging the globe! Pick the next city on the map and track them down before they get too far ahead.",
    accent: "#FBBF24",
    emoji: "🧭",
    image: asset("/characters/spaceship-jaime-jeff.png"),
    status: "live",
    category: "geography-quest",
  },
  {
    slug: "elefante",
    href: "/games/elefante",
    title: "Air Fante Dodge",
    eyebrow: "Dodge and fly",
    description:
      "Hop aboard Air Fante and zoom around the globe! Dodge obstacles and discover a new country with every flight.",
    accent: "#22C55E",
    emoji: "🐘",
    image: asset("/characters/air-fante-plane.png"),
    status: "live",
    category: "arcade-adventures",
  },
  {
    slug: "fly-the-flag",
    href: "/games/fly-the-flag",
    title: "Fly the Flag!",
    eyebrow: "Flags and world map",
    description:
      "Jaime is flying flags across the globe! Spot the highlighted country on the map, name the flag, then celebrate with music and fun facts.",
    accent: "#FF4EAB",
    emoji: "🏁",
    image: asset("/book-pages/book3/page-36.jpg"),
    status: "live",
    category: "geography-quest",
  },
  {
    slug: "name-that-country",
    href: "/games/name-that-country",
    title: "Name That Country!",
    eyebrow: "Find the pin on the map",
    description:
      "A pin drops somewhere on the world map — can you name the country? Look carefully and pick the right answer!",
    accent: "#3B82F6",
    emoji: "📍",
    image: asset("/characters/name-that-country-button.png"),
    status: "live",
    category: "geography-quest",
  },
  {
    slug: "air-fante-collect",
    href: "/games/air-fante-collect",
    title: "Air Fante Collect!",
    eyebrow: "Collect stars, tour the world",
    description:
      "Fly Air Fante through the skies and collect glowing stars! Grab enough stars to fly to the next country on your world tour.",
    accent: "#ffca3a",
    emoji: "⭐",
    image: asset("/characters/air-fante-plane.png"),
    status: "live",
    category: "arcade-adventures",
  },
  {
    slug: "draw-with-casey",
    href: "/games/draw-with-casey",
    title: "Draw with Casey!",
    eyebrow: "Chalk drawing for ages 2–5",
    description:
      "Casey Bea gives you a word and you draw it on the chalkboard! Claude checks your drawing and hands out collectible sticker stamps.",
    accent: "#4ecdc4",
    emoji: "🖍️",
    image: asset("/characters/FOX 3.png"),
    status: "live",
    category: "music-arts",
  },
  {
    slug: "casey-can-count",
    href: "/games/casey-can-count",
    title: "Casey Can Count!",
    eyebrow: "Tap & count for ages 2–6",
    description:
      "Casey shows you a bunch of objects — tap each one to count it, then pick the right number! Learn one-to-one counting the fun way.",
    accent: "#f97316",
    emoji: "🔢",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "math-games",
  },
  {
    slug: "sliding-puzzle",
    href: "/games/sliding-puzzle",
    title: "Fix the Pic!",
    eyebrow: "Rearrange the picture",
    description:
      "Swap the pieces around the board to put the Jaime Jangles picture back together. Choose easy 3×3 or hard 4×4!",
    accent: "#8B5CF6",
    emoji: "🧩",
    image: asset("/puzzle-pages/page-3.png"),
    status: "live",
    category: "puzzles",
  },
  {
    slug: "foxer",
    href: "/games/foxer",
    title: "FOXER",
    eyebrow: "Cross the world with Foxy",
    description:
      "Help Foxy the fox dodge traffic across 5 countries! Dodge hockey pucks in Canada, soccer balls in Brazil, bullet trains in Japan, camels in Egypt, and taxis in New York.",
    accent: "#ef6c00",
    emoji: "🦊",
    image: asset("/characters/FOX 3.png"),
    status: "live",
    category: "arcade-adventures",
  },
  {
    slug: "count-with-jaime",
    href: "/games/count-with-jaime",
    title: "Casey Can Add!",
    eyebrow: "Addition for ages 4–7",
    description:
      "Casey shows you two groups of objects — count them up and pick the right total! Simple addition made fun with colourful pictures.",
    accent: "#f97316",
    emoji: "➕",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "math-games",
  },
  {
    slug: "jangles-ball",
    href: "/games/jangles-ball",
    title: "Jangles Ball",
    eyebrow: "Break bricks, level up",
    description:
      "A bold retro Breakout-style arcade game! Smash 5 levels of bricks with a bouncing ball across neon palettes — normal, tough, and indestructible blocks stand in your way.",
    accent: "#00d4ff",
    emoji: "🎮",
    image: asset("/characters/jangles-ball-thumb.png"),
    status: "live",
    category: "arcade-adventures",
  },
  {
    slug: "spot-the-difference",
    href: "/games/spot-the-difference",
    title: "Spot the Difference!",
    eyebrow: "Find what's missing",
    description:
      "Two pictures side by side — but one is missing something! Click on every difference you can find.",
    accent: "#8B5CF6",
    emoji: "🔍",
    image: asset("/puzzle-pages/page-3.png"),
    status: "live",
    category: "puzzles",
  },
  {
    slug: "pacman",
    href: "/games/pacman",
    title: "Jangles Pac",
    eyebrow: "Pac-Man world adventure",
    description:
      "Choose Casey, Jaime, Jeff or Fante and chomp through 20 countries! Eat the country's flag for 8 seconds of ghost-eating power.",
    accent: "#3b82f6",
    emoji: "👾",
    image: asset("/characters/jangles-pac-thumb.png"),
    status: "live",
    category: "arcade-adventures",
  },
  {
    slug: "mastermind",
    href: "/games/mastermind",
    title: "Crack the Code!",
    eyebrow: "Secret code puzzle",
    description:
      "Jaime has hidden 4 world objects in a secret order — can you crack the code in 8 guesses? Use the colour pegs to narrow it down!",
    accent: "#7c3aed",
    emoji: "🔐",
    image: asset("/objects/fox.svg"),
    status: "live",
    category: "puzzles",
  },
  {
    slug: "casey-can-subtract",
    href: "/games/casey-can-subtract",
    title: "Casey Can Subtract!",
    eyebrow: "Subtraction for ages 4–7",
    description:
      "Casey shows you two groups of objects — take one away from the other and pick the right answer! Simple subtraction made fun with colourful pictures.",
    accent: "#f97316",
    emoji: "➖",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "math-games",
  },
  {
    slug: "casey-can-multiply",
    href: "/games/casey-can-multiply",
    title: "Casey Can Multiply!",
    eyebrow: "Multiplication for ages 5–8",
    description:
      "Casey shows you two groups of objects — count them together and pick the right product! Times tables made fun with colourful pictures.",
    accent: "#f97316",
    emoji: "✖️",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "math-games",
  },
  {
    slug: "jangles-kong",
    href: "/games/jangles-kong",
    title: "Jangles Kong",
    eyebrow: "Climb, jump & dodge",
    description:
      "Casey must reach Jeff at the top! Dodge Pac-Ghosts rolling down the platforms, climb ladders, and collect hats in this retro Donkey Kong-style arcade game.",
    accent: "#cc0000",
    emoji: "🦍",
    image: asset("/characters/jeff-8bit.png"),
    status: "live",
    category: "arcade-adventures",
  },
  {
    slug: "casey-can-divide",
    href: "/games/casey-can-divide",
    title: "Casey Can Divide!",
    eyebrow: "Division for ages 5–8",
    description:
      "Casey shows you a group of objects — split them equally and pick the right answer! Division made fun with colourful pictures.",
    accent: "#f97316",
    emoji: "➗",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "math-games",
  },
  {
    slug: "casey-can-spell",
    href: "/games/casey-can-spell",
    title: "Casey Can Spell!",
    eyebrow: "Spelling for ages 4–7",
    description:
      "Casey shows you a picture — tap the right letters in order to spell the word! Letter tiles plus sneaky decoys keep you on your toes.",
    accent: "#f97316",
    emoji: "🔤",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "learning",
  },
  {
    slug: "match-game",
    href: "/games/match-game",
    title: "Match Mania!",
    eyebrow: "Flip & find pairs",
    description:
      "Flip cards to find matching pairs of Jangles objects! Pick Rookie for a quick 5×4 challenge or Master for a monster 10×10 grid.",
    accent: "#8B5CF6",
    emoji: "🃏",
    image: asset("/objects/fox.svg"),
    status: "live",
    category: "puzzles",
  },
  {
    slug: "foxy-word-scramble",
    href: "/games/foxy-word-scramble",
    title: "Foxy's Word Scramble!",
    eyebrow: "Unscramble for ages 5–8",
    description:
      "Foxy has jumbled all the letters! Tap them into the right order to unscramble the word before the next one arrives.",
    accent: "#ef6c00",
    emoji: "🦊",
    image: asset("/characters/FOX 3.png"),
    status: "live",
    category: "puzzles",
  },
  {
    slug: "color-mix",
    href: "/games/color-mix",
    title: "Colour Mix!",
    eyebrow: "Blend colours & learn",
    description:
      "Mix two paint buckets together and discover what colour you get! Learn red + yellow = orange, blue + yellow = green, and more!",
    accent: "#FF8C00",
    emoji: "🎨",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "learning",
  },
  {
    slug: "jangles-pong",
    href: "/games/jangles-pong",
    title: "Jangles Pong",
    eyebrow: "You vs CPU arcade classic",
    description:
      "Classic arcade Pong with a neon Jangles twist! Move your paddle, bounce the ball, and beat the CPU. First to 7 wins!",
    accent: "#00eeff",
    emoji: "🏓",
    image: asset("/characters/jangles-ball-thumb.png"),
    status: "live",
    category: "arcade-adventures",
  },
  {
    slug: "type-with-casey",
    href: "/games/type-with-casey",
    title: "Type with Casey!",
    eyebrow: "Learn proper typing — ages 5+",
    description:
      "Casey teaches you the right way to type! Color-coded keys show which finger to use, and a hand diagram keeps you on track. Start on the home row and work up to the full keyboard!",
    accent: "#48DBFB",
    emoji: "⌨️",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "learning",
  },
  {
    slug: "casey-can-roman-numeral",
    href: "/games/casey-can-roman-numeral",
    title: "Casey Can Roman Numeral!",
    eyebrow: "Teach & test — grades 3–5",
    description:
      "Learn Roman numerals with Casey! Step through lessons for I, V, X, L, C, D, and M — then quiz yourself. Three grade levels from I–XX all the way up to MMMCMXCIX.",
    accent: "#C4B5FD",
    emoji: "🏛️",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "math-games",
  },
  {
    slug: "casey-can-pay",
    href: "/games/casey-can-pay",
    title: "Casey Can Pay!",
    eyebrow: "Shop math — ages 5–8",
    description:
      "Casey is going shopping! Add coins to her wallet, spend money on objects, and figure out the change. Currency math with adding and subtracting.",
    accent: "#f59e0b",
    emoji: "💰",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "math-games",
  },
  {
    slug: "chess",
    href: "/games/chess",
    title: "Chess",
    eyebrow: "Lessons + play vs computer",
    description:
      "Learn how every chess piece moves and attacks, then challenge the computer to a real game. Lesson mode walks you through each piece step by step!",
    accent: "#6366f1",
    emoji: "♟",
    image: asset("/characters/casey-pointing.png"),
    status: "live",
    category: "puzzles",
  },
  {
    slug: "racer",
    href: "/games/racer",
    title: "Jangles Racer",
    eyebrow: "Dodge and survive",
    description:
      "Hit the gas in this F-Zero style 8-bit racer! Steer your F1 car, dodge oncoming traffic, and survive as long as you can.",
    accent: "#FB923C",
    emoji: "🏎️",
    image: asset("/characters/jangles-ball-thumb.png"),
    status: "live",
    category: "arcade-adventures",
  },
];

export function getGameBySlug(slug: GameManifestEntry["slug"]) {
  return GAME_MANIFEST.find((game) => game.slug === slug);
}
