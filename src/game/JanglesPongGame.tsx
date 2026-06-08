import { useEffect, useRef, useCallback } from "react";
import { useArcadeSession } from "@/lib/arcade-session-context";
import { asset } from "@/lib/asset";

// ─── Characters ───────────────────────────────────────────────────────────────

const CHARACTERS = [
  { id: "casey", name: "Casey", color: "#f97316", spriteUrl: "/characters/casey-8bit.png" },
  { id: "jaime", name: "Jaime", color: "#3b82f6", spriteUrl: "/characters/jaime-8bit.png" },
  { id: "jeff",  name: "Jeff",  color: "#22c55e", spriteUrl: "/characters/jeff-8bit.png"  },
] as const;

// ─── Constants ────────────────────────────────────────────────────────────────

const W = 480;
const H = 640;
const PADDLE_W = 90;
const PADDLE_H = 14;
const PADDLE_SPEED = 6;
const BALL_R = 10;
const WINNING_SCORE = 7;
const AI_SPEED = 3.0;
const BALL_INIT_SPEED = 3.5;
const BALL_MAX_SPEED = 9;
const TRAIL_LEN = 8;
const PLAYER_Y = H - 50;
const AI_Y = 36;

// ─── Stage decorations ────────────────────────────────────────────────────────

const MARQUEE_BULB_COUNT = 13;
const WING_W = 20;
const WING_STRIPE_H = 38;
const WING_COLORS = ["#ff4eab", "#ffe033", "#00eeff"];
const FOOTLIGHT_COUNT = 9;

// Faint mid-court music notes (shifted inside the wings)
const BG_NOTES = [
  { x: 55,  y: 120, size: 15, sym: "♪", phase: 0.0 },
  { x: 425, y: 90,  size: 18, sym: "♫", phase: 1.2 },
  { x: 42,  y: 390, size: 13, sym: "♩", phase: 2.4 },
  { x: 438, y: 370, size: 16, sym: "♪", phase: 0.7 },
  { x: 58,  y: 560, size: 14, sym: "♫", phase: 1.8 },
  { x: 422, y: 545, size: 17, sym: "♩", phase: 3.1 },
];

// ─── Palette ──────────────────────────────────────────────────────────────────

const P = {
  bg:      "#0a0a1a",
  bgMid:   "#0f1230",
  aiPaddle:"#ff4eab",
  ball:    "#ffe033",
  center:  "#ffffff22",
  aiScore: "#ff4eab",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "title" | "countdown" | "playing" | "point" | "game-over";

interface Trail { x: number; y: number; }

interface GameState {
  phase: Phase;
  selectedCharIdx: number;
  playerX: number;
  aiX: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  trail: Trail[];
  playerScore: number;
  aiScore: number;
  countdownTimer: number;
  pointPauseTimer: number;
  scoreFlashTimer: number;
  winner: "player" | "ai" | null;
  leftDown: boolean;
  rightDown: boolean;
  touchDragX: number | null;
  tick: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initBall(dir: 1 | -1): Pick<GameState, "ballX" | "ballY" | "ballVX" | "ballVY" | "trail"> {
  const angle = (Math.random() * 36 - 18) * (Math.PI / 180);
  return {
    ballX: W / 2,
    ballY: H / 2,
    ballVX: Math.sin(angle) * BALL_INIT_SPEED,
    ballVY: dir * Math.cos(angle) * BALL_INIT_SPEED,
    trail: [],
  };
}

function makeInitialState(): GameState {
  return {
    phase: "title",
    selectedCharIdx: 0,
    playerX: W / 2 - PADDLE_W / 2,
    aiX: W / 2 - PADDLE_W / 2,
    ...initBall(1),
    playerScore: 0,
    aiScore: 0,
    countdownTimer: 180,
    pointPauseTimer: 0,
    scoreFlashTimer: 0,
    winner: null,
    leftDown: false,
    rightDown: false,
    touchDragX: null,
    tick: 0,
  };
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawPaddle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  roundRect(ctx, x, y, PADDLE_W, PADDLE_H, 7);
  ctx.fill();
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, tick: number) {
  // ── Base gradient (warmer at bottom = stage floor) ───────────────────────
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   "#0d0d26");
  grad.addColorStop(0.5, "#0a0a1a");
  grad.addColorStop(1,   "#15090a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Center spotlight ─────────────────────────────────────────────────────
  const spot = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 230);
  spot.addColorStop(0, "rgba(255,245,210,0.065)");
  spot.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, W, H);

  // ── Stage floor warm glow ────────────────────────────────────────────────
  const floor = ctx.createLinearGradient(0, H - 70, 0, H);
  floor.addColorStop(0, "rgba(0,0,0,0)");
  floor.addColorStop(1, "rgba(255,140,40,0.10)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, H - 70, W, 70);

  // ── Top marquee bar ──────────────────────────────────────────────────────
  ctx.fillStyle = "#00001e";
  ctx.fillRect(0, 0, W, 26);
  // separator line
  ctx.save();
  ctx.strokeStyle = "#ffe03355";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 26);
  ctx.lineTo(W, 26);
  ctx.stroke();
  ctx.restore();
  // bulbs
  const bulbSpacing = W / MARQUEE_BULB_COUNT;
  for (let i = 0; i < MARQUEE_BULB_COUNT; i++) {
    const bx = bulbSpacing * i + bulbSpacing / 2;
    const by = 12;
    const col = i % 2 === 0 ? "#ffe033" : "#ff4eab";
    const twinkle = 0.55 + 0.45 * Math.sin(tick * 0.055 + i * 0.75);
    ctx.save();
    ctx.globalAlpha = twinkle;
    ctx.shadowColor = col;
    ctx.shadowBlur = 10 * twinkle;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(bx, by, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Side wings ───────────────────────────────────────────────────────────
  for (let side = 0; side < 2; side++) {
    const baseX = side === 0 ? 0 : W - WING_W;
    const numStripes = Math.ceil(H / WING_STRIPE_H);
    for (let s = 0; s < numStripes; s++) {
      const sy = s * WING_STRIPE_H;
      const sh = Math.min(WING_STRIPE_H, H - sy);
      const col = WING_COLORS[s % WING_COLORS.length];
      const fade = ctx.createLinearGradient(
        side === 0 ? baseX : baseX + WING_W, 0,
        side === 0 ? baseX + WING_W : baseX, 0
      );
      fade.addColorStop(0, col + "44");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(baseX, sy, WING_W, sh);
    }
  }

  // ── Footlights (bottom) ──────────────────────────────────────────────────
  const ftSpacing = (W - 80) / (FOOTLIGHT_COUNT - 1);
  for (let i = 0; i < FOOTLIGHT_COUNT; i++) {
    const fx = 40 + i * ftSpacing;
    const fy = H - 12;
    const col = i % 2 === 0 ? "#ffe033" : "#ffffff";
    const pulse = 0.5 + 0.5 * Math.sin(tick * 0.04 + i * 0.6);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.25 * pulse;
    ctx.shadowColor = col;
    ctx.shadowBlur = 8 * pulse;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Center divider ───────────────────────────────────────────────────────
  ctx.save();
  ctx.strokeStyle = "#ffffff30";
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  // center star
  const starPulse = 0.18 + 0.08 * Math.sin(tick * 0.03);
  ctx.globalAlpha = starPulse;
  ctx.fillStyle = "#ffe033";
  ctx.font = "bold 18px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("★", W / 2, H / 2);
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Floating music notes ─────────────────────────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const n of BG_NOTES) {
    const alpha = 0.07 + 0.05 * Math.sin(tick * 0.025 + n.phase);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffe033";
    ctx.font = `bold ${n.size}px monospace`;
    ctx.fillText(n.sym, n.x, n.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, trail: Trail[]) {
  ctx.save();
  // trail
  for (let i = 0; i < trail.length; i++) {
    const t = trail[i];
    const ratio = (i + 1) / TRAIL_LEN;
    ctx.globalAlpha = ratio * 0.35;
    ctx.fillStyle = P.ball;
    ctx.beginPath();
    ctx.arc(t.x, t.y, BALL_R * (0.4 + ratio * 0.6), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // main ball
  ctx.shadowColor = P.ball;
  ctx.shadowBlur = 22;
  ctx.fillStyle = P.ball;
  ctx.beginPath();
  ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // highlight
  const gr = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, BALL_R);
  gr.addColorStop(0, "rgba(255,255,255,0.7)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  px: number,
  color: string
) {
  const sx = px + PADDLE_W / 2;
  const sy = PLAYER_Y - 4;
  const sw = 36;
  const sh = 46;

  ctx.save();
  // glow ring behind character
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = color + "55";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(sx, sy - sh / 2, sw / 2 + 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (img?.complete && img.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx - sw / 2, sy - sh, sw, sh);
  }
  ctx.restore();
}

function drawScores(ctx: CanvasRenderingContext2D, ps: number, as_: number) {
  ctx.save();
  ctx.font = "bold 52px 'Baloo 2', monospace";
  ctx.textAlign = "center";

  ctx.fillStyle = P.aiScore;
  ctx.shadowColor = P.aiPaddle;
  ctx.shadowBlur = 12;
  ctx.fillText(String(as_), W / 2, H / 2 - 30);

  ctx.restore();
}

function drawPlayerScore(ctx: CanvasRenderingContext2D, ps: number, color: string) {
  ctx.save();
  ctx.font = "bold 52px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillText(String(ps), W / 2, H / 2 + 60);
  ctx.restore();
}

function drawLabels(ctx: CanvasRenderingContext2D, charName: string, charColor: string) {
  ctx.save();
  ctx.font = "bold 10px 'Baloo 2', monospace";
  ctx.textAlign = "center";

  ctx.fillStyle = P.aiScore + "88";
  ctx.fillText("CPU", W / 2, 34);  // below the 26px marquee bar

  ctx.fillStyle = charColor + "99";
  ctx.fillText(charName.toUpperCase(), W / 2, H - 26);  // above footlights
  ctx.restore();
}

function drawCountdown(ctx: CanvasRenderingContext2D, timer: number) {
  const num = Math.ceil(timer / 60);
  if (num <= 0) return;
  ctx.save();
  ctx.font = "bold 80px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffe033";
  ctx.shadowBlur = 30;
  ctx.globalAlpha = 0.85;
  ctx.fillText(String(num), W / 2, H / 2 - 10);
  ctx.restore();
}

function drawScoreFlash(ctx: CanvasRenderingContext2D, timer: number) {
  if (timer <= 0) return;
  ctx.save();
  ctx.globalAlpha = (timer / 20) * 0.28;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ─── Title screen ─────────────────────────────────────────────────────────────

function drawTitleScreen(
  ctx: CanvasRenderingContext2D,
  selectedCharIdx: number,
  charImgs: (HTMLImageElement | null)[],
  tick: number
) {
  drawBackground(ctx, tick);

  // Title pill
  ctx.save();
  ctx.fillStyle = "#ffe033";
  ctx.shadowColor = "#ffe033";
  ctx.shadowBlur = 20;
  roundRect(ctx, W / 2 - 130, 50, 260, 58, 29);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 26px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("JANGLES PONG", W / 2, 79);
  ctx.restore();

  // Subtitle
  ctx.save();
  ctx.font = "13px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff88";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("YOU vs CPU — first to 7 wins!", W / 2, 132);
  ctx.restore();

  // "Pick your player" label
  ctx.save();
  ctx.font = "bold 11px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe03388";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "0.18em";
  ctx.fillText("PICK YOUR PLAYER", W / 2, 162);
  ctx.restore();

  // Character cards (3 wide)
  const cardW = 108;
  const cardH = 128;
  const cardGap = 14;
  const totalW = cardW * 3 + cardGap * 2;
  const startX = (W - totalW) / 2;
  const cardY = 172;

  for (let i = 0; i < CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    const cx = startX + i * (cardW + cardGap);
    const isSelected = i === selectedCharIdx;

    ctx.save();
    // card background
    ctx.fillStyle = isSelected ? char.color + "22" : "#ffffff0a";
    roundRect(ctx, cx, cardY, cardW, cardH, 12);
    ctx.fill();

    // card border
    ctx.strokeStyle = isSelected ? char.color : "#ffffff22";
    ctx.lineWidth = isSelected ? 2.5 : 1;
    if (isSelected) {
      ctx.shadowColor = char.color;
      ctx.shadowBlur = 14;
    }
    roundRect(ctx, cx, cardY, cardW, cardH, 12);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // character sprite
    const img = charImgs[i];
    const imgW = 56;
    const imgH = 72;
    const imgX = cx + (cardW - imgW) / 2;
    const imgY = cardY + 10;
    if (img?.complete && img.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, imgX, imgY, imgW, imgH);
    } else {
      // placeholder circle
      ctx.fillStyle = char.color + "55";
      ctx.beginPath();
      ctx.arc(cx + cardW / 2, imgY + imgH / 2, 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // name label
    ctx.fillStyle = isSelected ? char.color : "#ffffff88";
    ctx.font = `bold 12px 'Baloo 2', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(char.name.toUpperCase(), cx + cardW / 2, cardY + cardH - 10);

    // selected check
    if (isSelected) {
      ctx.fillStyle = char.color;
      ctx.shadowColor = char.color;
      ctx.shadowBlur = 8;
      ctx.font = "bold 11px 'Baloo 2', monospace";
      ctx.fillText("✓ SELECTED", cx + cardW / 2, cardY + cardH + 16);
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // Controls hint
  ctx.save();
  ctx.font = "11px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff44";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("← → ARROW KEYS or DRAG to move", W / 2, 338);
  ctx.restore();

  // Play button
  const btnY = 354;
  ctx.save();
  ctx.fillStyle = "#00eeff";
  ctx.shadowColor = "#00eeff";
  ctx.shadowBlur = 16;
  roundRect(ctx, W / 2 - 90, btnY, 180, 52, 26);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 22px 'Baloo 2', monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("PLAY →", W / 2, btnY + 26);
  ctx.restore();

  // Decorative paddles at bottom
  ctx.save();
  const charColor = CHARACTERS[selectedCharIdx].color;
  ctx.fillStyle = P.aiPaddle + "33";
  roundRect(ctx, W / 2 - PADDLE_W / 2, 440, PADDLE_W, PADDLE_H, 7);
  ctx.fill();
  ctx.fillStyle = charColor + "33";
  roundRect(ctx, W / 2 - PADDLE_W / 2, 530, PADDLE_W, PADDLE_H, 7);
  ctx.fill();
  ctx.fillStyle = P.ball + "33";
  ctx.beginPath();
  ctx.arc(W / 2, 487, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGameOver(ctx: CanvasRenderingContext2D, winner: "player" | "ai", playerColor: string) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.62)";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  const isWin = winner === "player";
  const color = isWin ? playerColor : P.aiPaddle;
  const label = isWin ? "YOU WIN! 🎉" : "CPU WINS";
  const sub   = isWin ? "Great game!" : "Give it another go!";

  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  roundRect(ctx, W / 2 - 155, H / 2 - 105, 310, 82, 41);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 36px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, W / 2, H / 2 - 64);
  ctx.restore();

  ctx.save();
  ctx.font = "16px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffffcc";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(sub, W / 2, H / 2 + 22);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#ffe033";
  ctx.shadowColor = "#ffe033";
  ctx.shadowBlur = 16;
  roundRect(ctx, W / 2 - 105, H / 2 + 50, 210, 52, 26);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 20px 'Baloo 2', monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("PLAY AGAIN", W / 2, H / 2 + 76);
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function JanglesPongGame() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const stateRef   = useRef<GameState>(makeInitialState());
  const rafRef     = useRef<number>(0);
  const charImgsRef = useRef<(HTMLImageElement | null)[]>([null, null, null]);

  const { endSession } = useArcadeSession();
  const endSessionRef  = useRef(endSession);
  useEffect(() => { endSessionRef.current = endSession; }, [endSession]);

  // Preload all character sprites
  useEffect(() => {
    CHARACTERS.forEach((char, i) => {
      const img = new Image();
      img.src = asset(char.spriteUrl);
      img.onload = () => { charImgsRef.current[i] = img; };
    });
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    s.tick++;

    // ── Update ──────────────────────────────────────────────────────────────

    if (s.phase === "countdown") {
      s.countdownTimer--;
      if (s.countdownTimer <= 0) s.phase = "playing";
    }

    if (s.phase === "point") {
      s.pointPauseTimer--;
      if (s.pointPauseTimer <= 0) {
        const dir: 1 | -1 = s.aiScore > s.playerScore ? 1 : -1;
        Object.assign(s, initBall(dir));
        s.playerX = W / 2 - PADDLE_W / 2;
        s.aiX = W / 2 - PADDLE_W / 2;
        s.phase = "countdown";
        s.countdownTimer = 150;
      }
    }

    if (s.scoreFlashTimer > 0) s.scoreFlashTimer--;

    if (s.phase === "playing") {
      // Player paddle
      if (s.touchDragX !== null) {
        const target = s.touchDragX - PADDLE_W / 2;
        const diff = target - s.playerX;
        s.playerX += Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED + 3);
      } else {
        if (s.leftDown)  s.playerX -= PADDLE_SPEED;
        if (s.rightDown) s.playerX += PADDLE_SPEED;
      }
      s.playerX = Math.max(0, Math.min(W - PADDLE_W, s.playerX));

      // AI paddle — tracks ball with intentional imperfection
      const aiCenter = s.aiX + PADDLE_W / 2;
      const aiDiff = s.ballX - aiCenter;
      if (Math.abs(aiDiff) > 6) {
        s.aiX += Math.sign(aiDiff) * Math.min(Math.abs(aiDiff) * 0.07 + AI_SPEED, AI_SPEED);
      }
      s.aiX = Math.max(0, Math.min(W - PADDLE_W, s.aiX));

      // Ball trail
      s.trail.push({ x: s.ballX, y: s.ballY });
      if (s.trail.length > TRAIL_LEN) s.trail.shift();

      // Ball movement
      s.ballX += s.ballVX;
      s.ballY += s.ballVY;

      // Wall bounces
      if (s.ballX - BALL_R < 0)   { s.ballX = BALL_R;      s.ballVX =  Math.abs(s.ballVX); }
      if (s.ballX + BALL_R > W)   { s.ballX = W - BALL_R;  s.ballVX = -Math.abs(s.ballVX); }

      // Player paddle hit
      if (
        s.ballVY > 0 &&
        s.ballY + BALL_R >= PLAYER_Y &&
        s.ballY + BALL_R <= PLAYER_Y + PADDLE_H + 4 &&
        s.ballX >= s.playerX - 2 &&
        s.ballX <= s.playerX + PADDLE_W + 2
      ) {
        s.ballY = PLAYER_Y - BALL_R;
        const hit = (s.ballX - (s.playerX + PADDLE_W / 2)) / (PADDLE_W / 2);
        const angle = hit * 60 * (Math.PI / 180);
        const speed = Math.min(Math.hypot(s.ballVX, s.ballVY) * 1.03, BALL_MAX_SPEED);
        s.ballVX = Math.sin(angle) * speed;
        s.ballVY = -Math.abs(Math.cos(angle) * speed);
        s.trail = [];
      }

      // AI paddle hit
      if (
        s.ballVY < 0 &&
        s.ballY - BALL_R <= AI_Y + PADDLE_H &&
        s.ballY - BALL_R >= AI_Y - 4 &&
        s.ballX >= s.aiX - 2 &&
        s.ballX <= s.aiX + PADDLE_W + 2
      ) {
        s.ballY = AI_Y + PADDLE_H + BALL_R;
        const hit = (s.ballX - (s.aiX + PADDLE_W / 2)) / (PADDLE_W / 2);
        const angle = hit * 60 * (Math.PI / 180);
        const speed = Math.min(Math.hypot(s.ballVX, s.ballVY) * 1.03, BALL_MAX_SPEED);
        s.ballVX = Math.sin(angle) * speed;
        s.ballVY = Math.abs(Math.cos(angle) * speed);
        s.trail = [];
      }

      // Scoring
      if (s.ballY - BALL_R > H) {
        s.aiScore++;
        s.scoreFlashTimer = 20;
        s.phase = "point";
        s.pointPauseTimer = 90;
        if (s.aiScore >= WINNING_SCORE) { s.phase = "game-over"; s.winner = "ai"; }
      } else if (s.ballY + BALL_R < 0) {
        s.playerScore++;
        s.scoreFlashTimer = 20;
        s.phase = "point";
        s.pointPauseTimer = 90;
        if (s.playerScore >= WINNING_SCORE) { s.phase = "game-over"; s.winner = "player"; }
      }
    }

    // ── Render ──────────────────────────────────────────────────────────────

    const char = CHARACTERS[s.selectedCharIdx];
    const playerColor = char.color;
    const playerImg = charImgsRef.current[s.selectedCharIdx];

    if (s.phase === "title") {
      drawTitleScreen(ctx, s.selectedCharIdx, charImgsRef.current, s.tick);
    } else {
      drawBackground(ctx, s.tick);
      drawScores(ctx, s.playerScore, s.aiScore);
      drawPlayerScore(ctx, s.playerScore, playerColor);
      drawLabels(ctx, char.name, playerColor);

      drawPaddle(ctx, s.aiX, AI_Y, P.aiPaddle);
      drawPaddle(ctx, s.playerX, PLAYER_Y, playerColor);
      drawPlayerSprite(ctx, playerImg, s.playerX, playerColor);

      if (s.phase !== "game-over") {
        drawBall(ctx, s.ballX, s.ballY, s.trail);
      }
      if (s.phase === "countdown") {
        drawCountdown(ctx, s.countdownTimer);
      }
      drawScoreFlash(ctx, s.scoreFlashTimer);

      if (s.phase === "game-over" && s.winner) {
        drawBall(ctx, s.ballX, s.ballY, s.trail);
        drawGameOver(ctx, s.winner, playerColor);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // ── Keyboard input ──────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") { s.leftDown  = down; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { s.rightDown = down; e.preventDefault(); }
    };
    const dn = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  // ── Click / tap ─────────────────────────────────────────────────────────────

  const getCanvasXY = (e: React.MouseEvent | React.Touch, el: HTMLCanvasElement) => {
    const rect = el.getBoundingClientRect();
    return {
      cx: ((e as React.MouseEvent).clientX ?? (e as React.Touch).clientX - rect.left) * (W / rect.width),
      cy: ((e as React.MouseEvent).clientY ?? (e as React.Touch).clientY - rect.top)  * (H / rect.height),
    };
  };

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top)  * (H / rect.height);

    if (s.phase === "title") {
      // character card click
      const cardW = 108, cardH = 128, cardGap = 14;
      const totalW = cardW * 3 + cardGap * 2;
      const startX = (W - totalW) / 2;
      const cardY = 172;
      for (let i = 0; i < CHARACTERS.length; i++) {
        const cxCard = startX + i * (cardW + cardGap);
        if (cx >= cxCard && cx <= cxCard + cardW && cy >= cardY && cy <= cardY + cardH) {
          s.selectedCharIdx = i;
          return;
        }
      }
      // play button
      if (cx >= W / 2 - 90 && cx <= W / 2 + 90 && cy >= 354 && cy <= 406) {
        Object.assign(s, makeInitialState(), {
          phase: "countdown",
          countdownTimer: 180,
          selectedCharIdx: s.selectedCharIdx,
        });
      }
    } else if (s.phase === "game-over") {
      if (cx >= W / 2 - 105 && cx <= W / 2 + 105 && cy >= H / 2 + 50 && cy <= H / 2 + 102) {
        endSessionRef.current();
      }
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const t = e.touches[0];
    const cx = (t.clientX - rect.left) * (W / rect.width);
    const cy = (t.clientY - rect.top)  * (H / rect.height);

    if (s.phase === "title") {
      const cardW = 108, cardH = 128, cardGap = 14;
      const totalW = cardW * 3 + cardGap * 2;
      const startX = (W - totalW) / 2;
      const cardY = 172;
      for (let i = 0; i < CHARACTERS.length; i++) {
        const cxCard = startX + i * (cardW + cardGap);
        if (cx >= cxCard && cx <= cxCard + cardW && cy >= cardY && cy <= cardY + cardH) {
          s.selectedCharIdx = i;
          return;
        }
      }
      if (cx >= W / 2 - 90 && cx <= W / 2 + 90 && cy >= 354 && cy <= 406) {
        Object.assign(s, makeInitialState(), {
          phase: "countdown",
          countdownTimer: 180,
          selectedCharIdx: s.selectedCharIdx,
        });
      }
      return;
    }
    if (s.phase === "game-over") {
      if (cx >= W / 2 - 105 && cx <= W / 2 + 105 && cy >= H / 2 + 50 && cy <= H / 2 + 102) {
        endSessionRef.current();
      }
      return;
    }
    s.touchDragX = cx;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.phase !== "playing" && s.phase !== "countdown") return;
    const rect = e.currentTarget.getBoundingClientRect();
    s.touchDragX = (e.touches[0].clientX - rect.left) * (W / rect.width);
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    stateRef.current.touchDragX = null;
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        background: "#0a0a1a",
        padding: "1rem",
      }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          border: "3px solid #ffffff22",
          borderRadius: "1rem",
          boxShadow: "0 0 40px #00eeff22, 0 0 80px #ff4eab11",
          maxWidth: "100%",
          maxHeight: "85dvh",
          touchAction: "none",
          cursor: "default",
          display: "block",
        }}
      />
      <p
        style={{
          marginTop: "0.75rem",
          fontSize: "0.7rem",
          color: "#ffffff44",
          fontFamily: "'Baloo 2', sans-serif",
          letterSpacing: "0.1em",
        }}
      >
        ← → ARROW KEYS · DRAG TO PLAY
      </p>
    </div>
  );
}
