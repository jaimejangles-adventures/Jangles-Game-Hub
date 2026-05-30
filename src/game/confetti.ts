import confetti from "canvas-confetti";

const PALETTE = ["#FF4EAB", "#3B82F6", "#FBBF24", "#22C55E", "#FB923C", "#EF4444"];

export function burstCorrect() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.65 },
    colors: PALETTE,
    scalar: 0.9,
  });
}

export function burstFinale() {
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors: PALETTE });
    confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors: PALETTE });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
