// Jeff's recorded voice clips for numbers, operators, and levels.
// Source files live in public/audio/exclamations/Jangles_Games_Jeff_MP3_Clips/
import { asset } from "@/lib/asset";

const CLIP_DIR = "/audio/exclamations/Jangles_Games_Jeff_MP3_Clips";
const NUMBER_WORDS = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

const NUMBER_CLIPS = NUMBER_WORDS.map((word, i) =>
  asset(`${CLIP_DIR}/${String(i + 1).padStart(2, "0")}_${word}.mp3`)
);

const LEVEL_CLIPS = NUMBER_WORDS.map((word, i) =>
  asset(`${CLIP_DIR}/${String(i + 15).padStart(2, "0")}_level_${word}.mp3`)
);

const OPERATOR_CLIPS: Record<"plus" | "minus" | "times" | "divided_by", string> = {
  plus: asset(`${CLIP_DIR}/11_plus.mp3`),
  minus: asset(`${CLIP_DIR}/12_minus.mp3`),
  times: asset(`${CLIP_DIR}/13_times.mp3`),
  divided_by: asset(`${CLIP_DIR}/14_divided_by.mp3`),
};

function play(src: string, muted: boolean) {
  if (muted) return;
  new Audio(src).play().catch(() => undefined);
}

export function playJeffNumber(n: number, muted = false) {
  const src = NUMBER_CLIPS[n - 1];
  if (src) play(src, muted);
}

export function playJeffOperator(op: keyof typeof OPERATOR_CLIPS, muted = false) {
  play(OPERATOR_CLIPS[op], muted);
}

export function playJeffLevel(n: number, muted = false) {
  const src = LEVEL_CLIPS[n - 1];
  if (src) play(src, muted);
}
