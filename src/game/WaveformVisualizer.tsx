import { useEffect, useRef } from "react";

// Brand colours matching the rainbow gradient in the rest of the UI
const GRADIENT_STOPS: [number, string][] = [
  [0,    "#FF4EAB"],
  [0.4,  "#FBBF24"],
  [0.75, "#22C55E"],
  [1,    "#3B82F6"],
];

function makeGradient(ctx: CanvasRenderingContext2D, width: number): CanvasGradient {
  const g = ctx.createLinearGradient(0, 0, width, 0);
  for (const [stop, color] of GRADIENT_STOPS) g.addColorStop(stop, color);
  return g;
}

type Props = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
};

/**
 * Renders a live bar-graph frequency visualizer while audio is playing,
 * and a static filled waveform (progress bar shape) while paused.
 */
export function WaveformVisualizer({ audioRef, isPlaying, currentTime, duration, onSeek }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number[]>([]);

  // --- Wire up Web Audio analyser on first play ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return; // already set up
    if (!isPlaying) return; // wait for first user-gesture before creating AudioContext

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audio);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    ctxRef.current = audioCtx;
    sourceRef.current = source;
    analyserRef.current = analyser;
  }, [isPlaying, audioRef]);

  // --- Animation loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const HEIGHT = canvas.height;
    const WIDTH = canvas.width;
    const BAR_COUNT = 40;
    const BAR_GAP = 2;
    const BAR_W = Math.floor((WIDTH - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT);
    const progress = duration > 0 ? currentTime / duration : 0;
    const drawBars = (amplitudes: number[]) => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const grad = makeGradient(ctx, WIDTH);
      const playedX = progress * WIDTH;

      for (let i = 0; i < BAR_COUNT; i++) {
        const amplitude = amplitudes[i] ?? 0.18;
        const barH = Math.max(4, amplitude * HEIGHT);
        const x = i * (BAR_W + BAR_GAP);
        const y = (HEIGHT - barH) / 2;

        ctx.globalAlpha = x + BAR_W <= playedX ? 1 : 0.25;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, BAR_W, barH, 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (isPlaying && analyserRef.current) {
      const analyser = analyserRef.current;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const draw = () => {
        rafRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        const amplitudes = Array.from({ length: BAR_COUNT }, (_, i) => {
          const dataIdx = Math.floor((i / BAR_COUNT) * dataArray.length);
          return dataArray[dataIdx] / 255;
        });
        lastFrameRef.current = amplitudes;
        drawBars(amplitudes);
      };
      draw();
    } else if (lastFrameRef.current.length > 0) {
      cancelAnimationFrame(rafRef.current);
      drawBars(lastFrameRef.current);
    } else {
      // Static progress fill when paused / not started
      cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const grad = makeGradient(ctx, WIDTH);
      const barH = HEIGHT * 0.36;
      const y = (HEIGHT - barH) / 2;
      const radius = barH / 2;

      // Background track
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#1a1a1a";
      ctx.beginPath();
      ctx.roundRect(0, y, WIDTH, barH, radius);
      ctx.fill();

      // Filled portion
      const filledW = Math.max(0, progress * WIDTH);
      if (filledW > radius * 2) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(0, y, filledW, barH, radius);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, currentTime, duration]);

  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ height: 56 }}
      onClick={onSeek}
      role="slider"
      aria-label="Audio progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={duration ? Math.round((currentTime / duration) * 100) : 0}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        width={600}
        height={56}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
