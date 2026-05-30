import musicMatchData from "./music-match.json";

export type Fact = {
  country: string;
  city: string;
  style: string;
  flag: string;
  audio: string;
  image: string;
  image2?: string;
  fact: string;
  clues: [string, string, string];
};

export const FACTS = musicMatchData as Fact[];

export const PALETTE = ["#FF4EAB", "#3B82F6", "#FBBF24", "#22C55E", "#FB923C", "#EF4444"] as const;

export function flagCdnUrl(flag: string): string {
  const codes = [...flag].map((c) => c.codePointAt(0)! - 0x1f1e6 + 97);
  if (codes.some((c) => c < 97 || c > 122)) return "";
  const code = String.fromCharCode(...codes);
  return `https://flagcdn.com/w160/${code}.png`;
}
