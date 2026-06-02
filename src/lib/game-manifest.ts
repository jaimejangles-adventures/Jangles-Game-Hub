export type GameCategory = "geography-quest" | "music-arts" | "arcade-adventures" | "math-games" | "puzzles";
import { asset } from "@/lib/asset";

export type CategoryEntry = {
  slug: GameCategory;
  title: string;
  emoji: string;
  eyebrow: string;
  accent: string;
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
];

export type GameManifestEntry = {
  slug: "music-match" | "find-foxy" | "world-adventure" | "elefante" | "fly-the-flag" | "name-that-country" | "air-fante-collect" | "draw-with-casey" | "sliding-puzzle" | "casey-can-count" | "foxer" | "jangles-ball" | "count-with-jaime" | "spot-the-difference" | "pacman" | "mastermind";
  href: "/games/music-match" | "/games/find-foxy" | "/games/world-adventure" | "/games/elefante" | "/games/fly-the-flag" | "/games/name-that-country" | "/games/air-fante-collect" | "/games/draw-with-casey" | "/games/sliding-puzzle" | "/games/casey-can-count" | "/games/foxer" | "/games/jangles-ball" | "/games/count-with-jaime" | "/games/spot-the-difference" | "/games/pacman" | "/games/mastermind";
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
    title: "Air Fante World Tour",
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
    image: asset("/characters/casey-logo.png"),
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
    image: asset("/characters/casey-logo.png"),
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
    image: asset("/characters/casey-logo.png"),
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
    image: asset("/characters/casey-logo.png"),
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
];

export function getGameBySlug(slug: GameManifestEntry["slug"]) {
  return GAME_MANIFEST.find((game) => game.slug === slug);
}
