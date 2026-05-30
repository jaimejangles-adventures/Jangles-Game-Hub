import { useCallback, useRef, useState } from 'react';
import type { GhostPaths, PathStroke } from '@/game/draw-casey/data';

const GHOST_COLOR = '#c8eeff';
const GHOST_GLOW  = '#5ac8fa';

/** Draws a single ghost chalk dot on the tutorial canvas. */
function ghostDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.globalAlpha = 0.40 + Math.random() * 0.20;
  ctx.fillStyle = GHOST_COLOR;
  ctx.beginPath();
  ctx.arc(x + (Math.random() - 0.5) * 4, y + (Math.random() - 0.5) * 4, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = GHOST_GLOW;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

/** Expand path strokes into a flat sequence of {x, y} tokens + 'gap' separators. */
function buildSequence(
  strokes: PathStroke[],
  W: number,
  H: number,
): Array<{ type: 'dot'; x: number; y: number } | { type: 'gap' } | { type: 'circle'; cx: number; cy: number; r: number }> {
  const seq: ReturnType<typeof buildSequence> = [];

  for (const stroke of strokes) {
    if (stroke[0] === 'circle') {
      const [, cx, cy, r] = stroke as ['circle', number, number, number];
      seq.push({ type: 'circle', cx: cx * W, cy: cy * H, r: r * W });
    } else {
      const pts = stroke as [number, number][];
      for (const [px, py] of pts) {
        seq.push({ type: 'dot', x: px * W, y: py * H });
      }
      seq.push({ type: 'gap' });
    }
  }

  return seq;
}

export function useGhostTutorial(ghostPaths: GhostPaths) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const stop = useCallback((tutCanvas: HTMLCanvasElement | null) => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (tutCanvas) tutCanvas.getContext('2d')!.clearRect(0, 0, tutCanvas.width, tutCanvas.height);
    setIsRunning(false);
  }, []);

  const run = useCallback(
    (word: string, tutCanvas: HTMLCanvasElement | null) => {
      if (!tutCanvas) return;
      stop(tutCanvas);

      const key = word.toLowerCase().replace(/\s+/g, '');
      const strokes = ghostPaths[key] ?? ghostPaths['star'];
      const ctx = tutCanvas.getContext('2d')!;
      const { width: W, height: H } = tutCanvas;

      ctx.clearRect(0, 0, W, H);
      setIsRunning(true);

      const seq = buildSequence(strokes, W, H);
      let idx = 0;

      const tick = () => {
        if (idx >= seq.length) {
          // Fade out after a pause
          timerRef.current = setTimeout(() => {
            ctx.clearRect(0, 0, W, H);
            setIsRunning(false);
          }, 1400);
          return;
        }

        const token = seq[idx++];

        if (token.type === 'gap') {
          timerRef.current = setTimeout(tick, 90);
          return;
        }

        if (token.type === 'circle') {
          // Rasterise circle as 24 ghost dots
          const { cx, cy, r } = token;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
            ghostDot(ctx, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          }
          timerRef.current = setTimeout(tick, 50);
          return;
        }

        // dot
        ghostDot(ctx, token.x, token.y);
        timerRef.current = setTimeout(tick, 46);
      };

      tick();
    },
    [ghostPaths, stop],
  );

  return { run, stop, isRunning };
}
