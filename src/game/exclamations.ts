// Add new files to public/audio/exclamations/correct/ or incorrect/
// then add the filename to the matching array below.

const CORRECT: string[] = [
  // ZDJ (Jeff)
  "/audio/exclamations/correct/ZDJ_Hurray.mp3",
  "/audio/exclamations/correct/ZDJ_Keep On Going.mp3",
  "/audio/exclamations/correct/ZDJ_Way To Go.mp3",
  "/audio/exclamations/correct/ZDJ_You Did It.mp3",
  "/audio/exclamations/correct/ZDJ_You got it.mp3",
  // Jaime
  "/audio/exclamations/correct/JAIME_Hurray.mp3",
  "/audio/exclamations/correct/JAIME_Keep On Going.mp3",
  "/audio/exclamations/correct/JAIME_Way To Go.mp3",
  "/audio/exclamations/correct/JAIME_You Did It.mp3",
  "/audio/exclamations/correct/JAIME_You Got It.mp3",
  // Casey
  "/audio/exclamations/correct/CASEY_Hurray.mp3",
  "/audio/exclamations/correct/CASEY_Keep On Going.mp3",
  "/audio/exclamations/correct/CASEY_Way To Go.mp3",
  "/audio/exclamations/correct/CASEY_You Did It.mp3",
  "/audio/exclamations/correct/CASEY_You_Got_It.mp3",
];

const INCORRECT: string[] = [
  // ZDJ (Jeff)
  "/audio/exclamations/incorrect/ZDJ_Give It Another Shot.mp3",
  "/audio/exclamations/incorrect/ZDJ_Give It Another Shot_2.mp3",
  "/audio/exclamations/incorrect/ZDJ_Try Again.mp3",
  "/audio/exclamations/incorrect/ZDJ_Try Again_2.mp3",
  // Jaime
  "/audio/exclamations/incorrect/JAIME_Give It Another Shot.mp3",
  "/audio/exclamations/incorrect/JAIME_Try Again.mp3",
  // Casey
  "/audio/exclamations/incorrect/CASEY_Give It Another Shot.mp3",
  "/audio/exclamations/incorrect/CASEY_Try Again.mp3",
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function characterOf(src: string): string {
  const filename = src.split("/").pop() ?? "";
  return filename.split("_")[0];
}

function pickNoRepeat(pool: string[], queue: { items: string[] }, lastChar: { value: string }): string | null {
  if (pool.length === 0) return null;

  if (queue.items.length === 0) queue.items = shuffle(pool);

  // If the next pick would repeat the same character, find the first different one and swap it to front
  if (characterOf(queue.items[0]) === lastChar.value && queue.items.length > 1) {
    const swapIdx = queue.items.findIndex((s) => characterOf(s) !== lastChar.value);
    if (swapIdx !== -1) {
      [queue.items[0], queue.items[swapIdx]] = [queue.items[swapIdx], queue.items[0]];
    }
  }

  const src = queue.items.shift()!;
  lastChar.value = characterOf(src);
  return src;
}

const correctQueue = { items: [] as string[] };
const incorrectQueue = { items: [] as string[] };
const lastCorrectChar = { value: "" };
const lastIncorrectChar = { value: "" };

export function playCorrectExclamation() {
  const src = pickNoRepeat(CORRECT, correctQueue, lastCorrectChar);
  if (src) new Audio(src).play().catch(() => undefined);
}

export function playIncorrectExclamation() {
  const src = pickNoRepeat(INCORRECT, incorrectQueue, lastIncorrectChar);
  if (src) new Audio(src).play().catch(() => undefined);
}
