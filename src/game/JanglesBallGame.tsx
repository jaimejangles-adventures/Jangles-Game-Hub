import { useEffect, useRef, useCallback } from "react";
import { asset } from "@/lib/asset";

// ─── Types ────────────────────────────────────────────────────────────────────

type BrickType = "normal" | "tough" | "indestructible";
type PowerUpType = "extend" | "slow" | "laser" | "sticky";
type GamePhase =
  | "title" | "level-transition" | "ready" | "playing"
  | "ball-lost" | "level-clear" | "game-over" | "win";

interface Brick {
  x: number; y: number; w: number; h: number;
  type: BrickType; hp: number; maxHp: number; alive: boolean;
  palCol: number;   // palette colour index (ci % palette.length)
  gridCol: number;  // actual column index 0-6, used for image slice x
  row: number;      // actual row index 0-6, used for image slice y
}

interface Ball { x: number; y: number; vx: number; vy: number; r: number; }
interface Paddle { x: number; y: number; w: number; h: number; }

interface PowerUp {
  x: number; y: number; vy: number;
  type: PowerUpType; alive: boolean;
}

interface LaserBolt { x: number; y: number; alive: boolean; }

// ─── Constants ────────────────────────────────────────────────────────────────

const W = 480;
const H = 640;
const PADDLE_H = 12;
const PADDLE_BASE_W = 80;
const PADDLE_EXTEND_W = 140;
const BALL_R = 8;

// 7×7 grid — matches the 1:1 square images so every tile is a perfect square
const BRICK_W = 54;
const BRICK_H = 54;
const BRICK_COLS = 7;
const BRICK_GAP = 2;
const BRICK_TOP = 54;
const INITIAL_LIVES = 3;
const GRID_W = BRICK_COLS * (BRICK_W + BRICK_GAP) - BRICK_GAP; // 390
const GRID_OFFSET_X = Math.round((W - GRID_W) / 2);            // 45

const EFFECT_DURATION = 480;
const LASER_INTERVAL = 28;
const LASER_SPEED = 14;
const POWERUP_DROP_CHANCE = 0.22;
const COUNTDOWN_FRAMES = 180; // 3 seconds at 60fps

// Book 3 NO TEXT — pages 03–24 excluding 14
const AVAILABLE_PAGES = [
  "03","04","05","06","07","08","09","10",
  "11","12","13","15","16","17","18","19",
  "20","21","22","23","24",
];

function pickPages(): string[] {
  const pool = [...AVAILABLE_PAGES];
  const out: string[] = [];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// ─── Level palettes ───────────────────────────────────────────────────────────

const PALETTES = [
  { bg:"#0d1b4b", bgGrad:"#1a3a7a", paddle:"#00eeff", bricks:["#00eeff","#33bbff","#0077ff","#66ddff"], accent:"#00eeff", name:"NEON BLUE" },
  { bg:"#2d0a2e", bgGrad:"#5a1060", paddle:"#ff55cc", bricks:["#ff55cc","#ff88ee","#cc2299","#ff22aa"], accent:"#ff55cc", name:"HOT PINK" },
  { bg:"#0a2a10", bgGrad:"#164d20", paddle:"#44ff55", bricks:["#44ff55","#aaff44","#22dd33","#88ff22"], accent:"#44ff55", name:"TOXIC GREEN" },
  { bg:"#2a1f00", bgGrad:"#4a3800", paddle:"#ffe033", bricks:["#ffe033","#ffaa00","#ffcc44","#ff8800"], accent:"#ffe033", name:"DEEP GOLD" },
  { bg:"#2d0a00", bgGrad:"#5a1400", paddle:"#ff4411", bricks:["#ff4411","#ff7722","#ff2200","#ffaa33"], accent:"#ff5522", name:"FIRE RED" },
];

// ─── Level grids (7 cols × 7 rows — square grid for square images) ────────────

// prettier-ignore
const LEVEL_GRIDS: Record<number, (0|1|2|3)[][]> = {
  1: [ // Classic rows
    [1,1,1,1,1,1,1],
    [1,2,1,1,1,2,1],
    [2,1,1,2,1,1,2],
    [1,1,2,1,2,1,1],
    [1,2,1,1,1,2,1],
    [1,1,1,2,1,1,1],
    [2,1,2,1,2,1,2],
  ],
  2: [ // Pyramid
    [0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0],
    [0,1,2,1,2,1,0],
    [1,2,1,2,1,2,1],
    [2,1,2,1,2,1,2],
    [1,2,1,2,1,2,1],
    [0,1,1,1,1,1,0],
  ],
  3: [ // Checkerboard
    [1,0,1,0,1,0,1],
    [0,2,0,2,0,2,0],
    [1,0,2,0,2,0,1],
    [0,2,0,1,0,2,0],
    [2,0,1,0,1,0,2],
    [0,1,0,2,0,1,0],
    [1,0,2,0,2,0,1],
  ],
  4: [ // Fortress
    [3,1,1,1,1,1,3],
    [3,2,1,2,1,2,3],
    [3,1,2,1,2,1,3],
    [3,2,1,2,1,2,3],
    [3,1,2,1,2,1,3],
    [3,2,1,2,1,2,3],
    [3,3,1,1,1,3,3],
  ],
  5: [ // Diamond ring
    [3,3,2,2,2,3,3],
    [3,2,1,1,1,2,3],
    [2,1,2,1,2,1,2],
    [2,1,1,2,1,1,2],
    [2,1,2,1,2,1,2],
    [3,2,1,1,1,2,3],
    [3,3,2,2,2,3,3],
  ],
};

const BALL_SPEEDS: Record<number, number> = { 1:5.2, 2:5.9, 3:6.7, 4:7.5, 5:8.4 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeBricks(level: number): Brick[] {
  const grid = LEVEL_GRIDS[level] ?? LEVEL_GRIDS[1];
  const pal = PALETTES[level - 1];
  const bricks: Brick[] = [];
  grid.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      if (!cell) return;
      const type: BrickType = cell === 3 ? "indestructible" : cell === 2 ? "tough" : "normal";
      const hp = cell === 3 ? 999 : cell;
      bricks.push({
        x: GRID_OFFSET_X + ci * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + ri * (BRICK_H + BRICK_GAP),
        w: BRICK_W, h: BRICK_H, type, hp, maxHp: hp, alive: true,
        palCol: ci % pal.bricks.length,
        gridCol: ci,
        row: ri,
      });
    });
  });
  return bricks;
}

function getGridHeight(level: number): number {
  return (LEVEL_GRIDS[level]?.length ?? 7) * (BRICK_H + BRICK_GAP) - BRICK_GAP;
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function hexToRgb(hex: string) {
  return { r: parseInt(hex.slice(1,3),16), g: parseInt(hex.slice(3,5),16), b: parseInt(hex.slice(5,7),16) };
}

function getClearedPct(bricks: Brick[]): number {
  const destroyable = bricks.filter(b => b.type !== "indestructible");
  if (!destroyable.length) return 100;
  return Math.round(destroyable.filter(b => !b.alive).length / destroyable.length * 100);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

const STAR_CACHE: Record<number, {x:number;y:number;r:number;a:number}[]> = {};
function getStars(level: number) {
  if (!STAR_CACHE[level]) {
    const rng = (seed: number) => { const x = Math.sin(seed)*10000; return x-Math.floor(x); };
    STAR_CACHE[level] = Array.from({length:55},(_,i)=>({
      x: rng(level*100+i)*W,
      y: rng(level*200+i)*H,
      r: rng(level*300+i)*1.6+0.4,
      a: rng(level*400+i)*0.6+0.3,
    }));
  }
  return STAR_CACHE[level];
}

function drawBackground(ctx: CanvasRenderingContext2D, level: number) {
  const pal = PALETTES[level - 1];
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, pal.bg);
  grad.addColorStop(0.5, pal.bgGrad);
  grad.addColorStop(1, pal.bg);
  ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

  const rgb = hexToRgb(pal.accent);
  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.07)`;
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  const t = Date.now() / 1800;
  getStars(level).forEach((s,i) => {
    const twinkle = s.a * (0.6 + 0.4 * Math.sin(t + i * 1.3));
    ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
  });

  const sg = (x0: number, x1: number) => {
    const g = ctx.createLinearGradient(x0,0,x1,0);
    g.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},0.35)`);
    g.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    return g;
  };
  ctx.fillStyle = sg(0,24); ctx.fillRect(0,0,24,H);
  ctx.fillStyle = sg(W,W-24); ctx.fillRect(W-24,0,24,H);

  const tg = ctx.createLinearGradient(0,52,0,90);
  tg.addColorStop(0,`rgba(${rgb.r},${rgb.g},${rgb.b},0.25)`);
  tg.addColorStop(1,`rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
  ctx.fillStyle = tg; ctx.fillRect(0,52,W,38);
}

function drawGridBackground(
  ctx: CanvasRenderingContext2D,
  level: number,
  img: HTMLImageElement | null
) {
  const gridH = getGridHeight(level);
  const pal = PALETTES[level - 1];
  const rgb = hexToRgb(pal.accent);

  // Dark base
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(GRID_OFFSET_X, BRICK_TOP, GRID_W, gridH);

  // Blurred, dimmed version of the same image — "fog of war" effect.
  // As bricks are broken the crisp tiles sharpen into focus on top of this blur.
  if (img?.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.filter = "blur(7px)";
    ctx.globalAlpha = 0.32;
    ctx.drawImage(img, GRID_OFFSET_X, BRICK_TOP, GRID_W, gridH);
    ctx.filter = "none";
    ctx.restore();
    // Re-darken so the blur doesn't overpower the brick tiles
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.fillRect(GRID_OFFSET_X, BRICK_TOP, GRID_W, gridH);
  }

  ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.3)`;
  ctx.lineWidth = 1;
  ctx.strokeRect(GRID_OFFSET_X, BRICK_TOP, GRID_W, gridH);
}

// Each brick IS a tile of the book page image.
// gridCol/row map to the correct 1/7th slice of the 1:1 square source image.
function drawBrick(
  ctx: CanvasRenderingContext2D,
  b: Brick,
  level: number,
  img: HTMLImageElement | null
) {
  if (!b.alive) return;

  const BRICK_ROWS = LEVEL_GRIDS[level]?.length ?? 7;

  ctx.save();
  roundRect(ctx, b.x, b.y, b.w, b.h, 3);
  ctx.clip();

  if (img?.complete && img.naturalWidth > 0) {
    // Use gridCol (0-6) and row (0-6) so each of the 49 tiles maps to a unique
    // 1/7 × 1/7 portion of the square source image — no repeats, no distortion.
    const sw = img.naturalWidth  / BRICK_COLS;
    const sh = img.naturalHeight / BRICK_ROWS;
    const sx = b.gridCol * sw;
    const sy = b.row     * sh;
    ctx.drawImage(img, sx, sy, sw, sh, b.x, b.y, b.w, b.h);
  } else {
    const pal = PALETTES[level - 1];
    ctx.fillStyle = pal.bricks[b.palCol % pal.bricks.length];
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  if (b.type === "indestructible") {
    ctx.fillStyle = "rgba(0,0,0,0.52)";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = "rgba(180,180,180,0.35)"; ctx.lineWidth = 1.5;
    for (let i = -b.h; i < b.w + b.h; i += 10) {
      ctx.beginPath(); ctx.moveTo(b.x+i, b.y); ctx.lineTo(b.x+i+b.h, b.y+b.h); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(140,140,140,0.7)"; ctx.lineWidth = 1.5;
    roundRect(ctx, b.x, b.y, b.w, b.h, 3); ctx.stroke();
  } else if (b.type === "tough") {
    const dmgFrac = b.maxHp > 1 ? (b.maxHp - b.hp) / b.maxHp : 0;
    if (dmgFrac > 0) {
      ctx.fillStyle = `rgba(0,0,0,${0.4 * dmgFrac})`;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "rgba(0,0,0,0.8)"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x+b.w*.38, b.y+3); ctx.lineTo(b.x+b.w*.5, b.y+b.h*.5); ctx.lineTo(b.x+b.w*.62, b.y+b.h-3);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x+b.w*.5, b.y+b.h*.5); ctx.lineTo(b.x+b.w*.3, b.y+b.h*.78); ctx.stroke();
    }
    ctx.fillStyle = b.hp >= 2 ? "rgba(255,255,255,0.9)" : "rgba(255,80,80,0.9)";
    ctx.shadowColor = b.hp >= 2 ? "#fff" : "#ff3333"; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.arc(b.x+b.w-8, b.y+8, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  roundRect(ctx, b.x, b.y, b.w, b.h, 3); ctx.stroke();
}

function drawPaddle(ctx: CanvasRenderingContext2D, p: Paddle, level: number, laserActive: boolean, stickyActive: boolean) {
  const pal = PALETTES[level-1];
  const color = laserActive ? "#ff5555" : stickyActive ? "#bb88ff" : pal.paddle;
  ctx.shadowColor=color; ctx.shadowBlur=28;
  ctx.strokeStyle=color; ctx.lineWidth=4;
  roundRect(ctx,p.x,p.y,p.w,p.h,p.h/2); ctx.stroke();
  ctx.shadowBlur=0;
  const g = ctx.createLinearGradient(p.x,p.y,p.x,p.y+p.h);
  g.addColorStop(0,"#ffffff"); g.addColorStop(0.3,color); g.addColorStop(1,color+"88");
  ctx.fillStyle=g; roundRect(ctx,p.x,p.y,p.w,p.h,p.h/2); ctx.fill();
  ctx.fillStyle="rgba(255,255,255,0.5)";
  ctx.fillRect(p.x+6, p.y+2, p.w-12, 3);
  if (laserActive) {
    ctx.fillStyle="#ff5555"; ctx.shadowColor="#ff0000"; ctx.shadowBlur=14;
    ctx.fillRect(p.x+6,p.y-5,4,6); ctx.fillRect(p.x+p.w-10,p.y-5,4,6);
    ctx.shadowBlur=0;
  }
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball, level: number, slow: boolean, stuck: boolean) {
  const pal = PALETTES[level-1];
  const color = stuck ? "#bb88ff" : slow ? "#44ffaa" : "#ffffff";
  ctx.shadowColor=color; ctx.shadowBlur=30;
  ctx.fillStyle=color+"44";
  ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r+4,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.shadowColor=pal.accent; ctx.shadowBlur=18;
  const g = ctx.createRadialGradient(ball.x-ball.r*.35,ball.y-ball.r*.35,1,ball.x,ball.y,ball.r);
  g.addColorStop(0,"#ffffff"); g.addColorStop(0.5,color); g.addColorStop(1,pal.accent);
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
}

const POWERUP_COLORS: Record<PowerUpType,string> = {
  extend:"#4488ff", slow:"#44ffaa", laser:"#ff4444", sticky:"#bb88ff",
};
const POWERUP_LABELS: Record<PowerUpType,string> = {
  extend:"E", slow:"S", laser:"L", sticky:"M",
};

function drawPowerUps(ctx: CanvasRenderingContext2D, powerUps: PowerUp[]) {
  powerUps.forEach(pu => {
    if (!pu.alive) return;
    const c = POWERUP_COLORS[pu.type];
    const {r,g,b} = hexToRgb(c);
    const grad = ctx.createLinearGradient(pu.x-14,pu.y-8,pu.x-14,pu.y+8);
    grad.addColorStop(0,`rgba(${r},${g},${b},0.95)`);
    grad.addColorStop(1,`rgba(${Math.floor(r*.5)},${Math.floor(g*.5)},${Math.floor(b*.5)},0.95)`);
    ctx.fillStyle=grad; roundRect(ctx,pu.x-14,pu.y-8,28,16,8); ctx.fill();
    ctx.strokeStyle=c; ctx.lineWidth=1.5; roundRect(ctx,pu.x-14,pu.y-8,28,16,8); ctx.stroke();
    ctx.shadowColor=c; ctx.shadowBlur=10;
    ctx.font="bold 11px 'Courier New', monospace";
    ctx.fillStyle="#fff"; ctx.textAlign="center";
    ctx.fillText(POWERUP_LABELS[pu.type],pu.x,pu.y+4);
    ctx.shadowBlur=0;
  });
}

function drawLasers(ctx: CanvasRenderingContext2D, bolts: LaserBolt[]) {
  bolts.forEach(lb => {
    if (!lb.alive) return;
    ctx.strokeStyle="#ff6666"; ctx.lineWidth=2;
    ctx.shadowColor="#ff0000"; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.moveTo(lb.x,lb.y); ctx.lineTo(lb.x,lb.y+12); ctx.stroke();
    ctx.shadowBlur=0;
  });
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number, lives: number, level: number,
  cleared: number,
  extendTimer: number, slowTimer: number, laserTimer: number, stickyTimer: number,
  difficulty: "rookie" | "master"
) {
  const pal = PALETTES[level-1];

  ctx.font="bold 11px 'Courier New', monospace"; ctx.fillStyle=pal.accent; ctx.textAlign="left";
  ctx.fillText("SCORE",12,16);
  ctx.font="bold 13px 'Courier New', monospace"; ctx.fillStyle="#fff";
  ctx.fillText(String(score).padStart(6,"0"),12,30);
  // Difficulty badge
  ctx.font="bold 8px 'Courier New', monospace";
  ctx.fillStyle = difficulty === "rookie" ? "#44ff88" : "#00d4ff";
  ctx.textAlign="left";
  ctx.fillText(difficulty === "rookie" ? "ROOKIE" : "MASTER", 12, 44);

  ctx.font="bold 10px 'Courier New', monospace"; ctx.fillStyle=pal.accent+"aa"; ctx.textAlign="center";
  ctx.fillText(`LEVEL ${level}`,W/2,14);
  ctx.font="bold 11px 'Courier New', monospace";
  ctx.fillStyle=cleared>=100?"#ffff44":pal.accent;
  ctx.fillText(`${cleared}% CLEARED`,W/2,28);

  ctx.font="bold 11px 'Courier New', monospace"; ctx.fillStyle=pal.accent; ctx.textAlign="right";
  ctx.fillText("LIVES",W-12,16);
  for(let i=0;i<lives;i++){
    ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(W-14-i*16,28,4,0,Math.PI*2); ctx.fill();
  }

  const effects = [
    { label:"E", timer:extendTimer,  color:POWERUP_COLORS.extend },
    { label:"S", timer:slowTimer,    color:POWERUP_COLORS.slow },
    { label:"L", timer:laserTimer,   color:POWERUP_COLORS.laser },
    { label:"M", timer:stickyTimer,  color:POWERUP_COLORS.sticky },
  ].filter(e => e.timer > 0);

  if (effects.length) {
    let ox = W/2 - (effects.length-1)*28;
    effects.forEach(e => {
      const frac = Math.min(e.timer/EFFECT_DURATION,1);
      const {r,g,b:bv} = hexToRgb(e.color);
      ctx.fillStyle=`rgba(${r},${g},${bv},0.3)`;
      ctx.fillRect(ox-14,36,28,6);
      ctx.fillStyle=e.color;
      ctx.fillRect(ox-14,36,28*frac,6);
      ctx.font="bold 9px 'Courier New', monospace";
      ctx.fillStyle="#fff"; ctx.textAlign="center";
      ctx.fillText(e.label,ox,47);
      ox += 56;
    });
  }

  ctx.strokeStyle=pal.accent+"44"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(8,52); ctx.lineTo(W-8,52); ctx.stroke();
}

// ─── Main component ───────────────────────────────────────────────────────────

export function JanglesBallGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<number, HTMLImageElement>>({});
  const pagesRef = useRef<string[]>(pickPages());

  const state = useRef({
    phase: "title" as GamePhase,
    level: 1,
    lives: INITIAL_LIVES,
    score: 0,
    bricks: [] as Brick[],
    ball: { x:W/2, y:H-130, vx:3, vy:-3.17, r:BALL_R } as Ball,
    paddle: { x:W/2-40, y:H-52, w:PADDLE_BASE_W, h:PADDLE_H } as Paddle,
    paddleTarget: W/2,
    mouseY: 0,
    transitionTimer: 0,
    countdownTimer: 0,
    ballLostTimer: 0,
    clearTimer: 0,
    rafId: 0,
    particles: [] as { x:number;y:number;vx:number;vy:number;life:number;color:string;r:number; }[],
    powerUps: [] as PowerUp[],
    laserBolts: [] as LaserBolt[],
    laserFireTimer: 0,
    extendTimer: 0,
    slowTimer: 0,
    laserTimer: 0,
    stickyTimer: 0,
    ballStuck: false,
    stuckOffsetX: 0,
    baseSpeed: 3.64,
    difficulty: "master" as "rookie" | "master",
  });

  useEffect(() => {
    pagesRef.current = pickPages();
    pagesRef.current.forEach((pg, i) => {
      const img = new Image();
      img.src = asset(`/book3-nt/page-${pg}.png`);
      imagesRef.current[i + 1] = img;
    });
  }, []);

  const placeBallOnPaddle = useCallback(() => {
    const s = state.current;
    s.ballStuck = true;
    s.stuckOffsetX = s.paddle.w / 2;
    s.ball.x = s.paddle.x + s.stuckOffsetX;
    s.ball.y = s.paddle.y - BALL_R - 1;
    s.ball.vx = 0; s.ball.vy = 0;
  }, []);

  const launchBall = useCallback((lvl: number) => {
    const s = state.current;
    const diffMult = s.difficulty === "rookie" ? 0.4 : 1.0;
    const base = (BALL_SPEEDS[lvl] ?? 5.6) * diffMult;
    s.baseSpeed = base;
    const speed = s.slowTimer > 0 ? base * 0.55 : base;
    s.ballStuck = false;
    s.ball.vx = (Math.random() > 0.5 ? 1 : -1) * speed * 0.6;
    s.ball.vy = -speed;
  }, []);

  const resetBall = useCallback((lvl: number) => {
    const s = state.current;
    placeBallOnPaddle();
    const diffMult = s.difficulty === "rookie" ? 0.4 : 1.0;
    s.baseSpeed = (BALL_SPEEDS[lvl] ?? 5.6) * diffMult;
  }, [placeBallOnPaddle]);

  const startLevel = useCallback((lvl: number) => {
    const s = state.current;
    s.level = lvl;
    s.bricks = makeBricks(lvl);
    s.paddle = { x:W/2-40, y:H-52, w:PADDLE_BASE_W, h:PADDLE_H };
    s.paddleTarget = W/2;
    s.particles = []; s.powerUps = []; s.laserBolts = [];
    s.extendTimer = 0; s.slowTimer = 0; s.laserTimer = 0; s.stickyTimer = 0;
    s.laserFireTimer = 0;
    resetBall(lvl);
    s.phase = "level-transition";
    s.transitionTimer = 180;
  }, [resetBall]);

  const spawnParticles = useCallback((x:number, y:number, color:string, n=14) => {
    const s = state.current;
    for (let i=0;i<n;i++){
      const angle = Math.PI*2*i/n + Math.random()*.4;
      const spd = 1.5 + Math.random()*3.5;
      s.particles.push({ x,y, vx:Math.cos(angle)*spd, vy:Math.sin(angle)*spd, life:1, color, r:2+Math.random()*3 });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const s = state.current;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      s.paddleTarget = (e.clientX-rect.left)*(W/rect.width);
      s.mouseY = (e.clientY-rect.top)*(H/rect.height);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      s.paddleTarget = (e.touches[0].clientX-rect.left)*(W/rect.width);
      s.mouseY = (e.touches[0].clientY-rect.top)*(H/rect.height);
    };

    const releaseBall = () => {
      if ((s.phase === "ready" || s.phase === "playing") && s.ballStuck) {
        launchBall(s.level);
        if (s.phase === "ready") s.phase = "playing";
      }
    };

    // Button rects on the title screen (centred at W/2)
    const MASTER_Y  = H/2 + 60;
    const ROOKIE_Y  = H/2 + 118;

    const advance = (clickX?: number, clickY?: number) => {
      if (s.phase==="title") {
        if (clickX !== undefined && clickY !== undefined) {
          // Did they click Jangles Master? (top, wide button)
          if (Math.abs(clickX - W/2) <= 120 && Math.abs(clickY - MASTER_Y) <= 22) {
            s.difficulty = "master"; startLevel(1); return;
          }
          // Did they click Rookie? (smaller button below)
          if (Math.abs(clickX - W/2) <= 90 && Math.abs(clickY - ROOKIE_Y) <= 19) {
            s.difficulty = "rookie"; startLevel(1); return;
          }
          // Clicked somewhere else — do nothing (force them to choose a button)
          return;
        }
        // Keyboard: keep current difficulty
        startLevel(1);
      }
      else if (s.phase==="level-transition") { s.transitionTimer=0; }
      else if (s.phase==="ready" || (s.phase==="playing" && s.ballStuck)) { releaseBall(); }
      else if (s.phase==="ball-lost" && s.ballLostTimer<=0) {
        resetBall(s.level); s.phase="ready"; s.countdownTimer=0;
      }
      else if (s.phase==="level-clear" && s.clearTimer<=0) {
        if (s.level>=5) s.phase="win"; else startLevel(s.level+1);
      }
      else if (s.phase==="game-over"||s.phase==="win") {
        s.score=0; s.lives=INITIAL_LIVES;
        pagesRef.current = pickPages();
        pagesRef.current.forEach((pg,i) => {
          const img = new Image(); img.src=asset(`/book3-nt/page-${pg}.png`);
          imagesRef.current[i+1] = img;
        });
        // Return to title so the player can re-select difficulty
        s.phase = "title";
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key===" "||e.key==="Enter") {
        e.preventDefault();
        // Space always tries to release ball first, then advance
        if (s.ballStuck && (s.phase==="ready"||s.phase==="playing")) { releaseBall(); }
        else { advance(); }
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX-rect.left)*(W/rect.width);
      const cy = (e.clientY-rect.top)*(H/rect.height);
      advance(cx, cy);
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive:false });
    canvas.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);

    function tick() {
      s.rafId = requestAnimationFrame(tick);
      const c = ctx!;
      const lvl = s.level;
      const pal = PALETTES[lvl-1];
      const img = imagesRef.current[lvl] ?? null;

      drawBackground(c, lvl);

      // ── Title ──────────────────────────────────────────────────────────────
      if (s.phase==="title") {
        c.fillStyle="rgba(0,0,0,0.72)"; c.fillRect(0,0,W,H);
        c.strokeStyle="#00d4ff"; c.lineWidth=2; c.strokeRect(20,20,W-40,H-40);
        c.font="bold 52px 'Courier New', monospace"; c.textAlign="center";
        c.fillStyle="#00d4ff"; c.shadowColor="#00d4ff"; c.shadowBlur=28;
        c.fillText("JANGLES",W/2,H/2-55);
        c.fillStyle="#fff"; c.fillText("BALL",W/2,H/2);
        c.shadowBlur=0;

        // difficulty label
        c.font="bold 11px 'Courier New', monospace"; c.fillStyle="#555";
        c.fillText("— SELECT DIFFICULTY —",W/2,H/2+36);

        const masterY = H/2 + 60;
        const rookieY = H/2 + 118;
        const mx = s.paddleTarget; const my = s.mouseY;
        const overMaster = Math.abs(mx-W/2)<=120 && Math.abs(my-masterY)<=22;
        const overRookie = Math.abs(mx-W/2)<=90  && Math.abs(my-rookieY)<=19;

        // ── JANGLES MASTER — big primary button ──
        {
          const bw=240; const bh=44; const bx=W/2-bw/2; const by=masterY-bh/2;
          c.shadowColor="#00d4ff"; c.shadowBlur= overMaster ? 28 : 14;
          roundRect(c,bx,by,bw,bh,bh/2);
          c.fillStyle = overMaster ? "#00d4ff" : "rgba(0,30,50,0.85)"; c.fill();
          c.strokeStyle="#00d4ff"; c.lineWidth=2.5;
          roundRect(c,bx,by,bw,bh,bh/2); c.stroke();
          c.shadowBlur=0;
          c.font="bold 16px 'Courier New', monospace";
          c.fillStyle = overMaster ? "#000" : "#00d4ff";
          c.fillText("JANGLES MASTER ★", W/2, masterY+6);
        }

        // ── ROOKIE — smaller secondary button ──
        {
          const bw=180; const bh=36; const bx=W/2-bw/2; const by=rookieY-bh/2;
          if (overRookie) { c.shadowColor="#44ff88"; c.shadowBlur=18; }
          roundRect(c,bx,by,bw,bh,bh/2);
          c.fillStyle = overRookie ? "#44ff88" : "rgba(0,0,0,0.5)"; c.fill();
          c.strokeStyle="#44ff88"; c.lineWidth=1.5;
          roundRect(c,bx,by,bw,bh,bh/2); c.stroke();
          c.shadowBlur=0;
          c.font="bold 13px 'Courier New', monospace";
          c.fillStyle = overRookie ? "#000" : "#44ff88";
          c.fillText("ROOKIE", W/2, rookieY+5);
        }

        c.font="bold 10px 'Courier New', monospace"; c.fillStyle="#333";
        c.fillText("SMASH BRICKS · [E]XTEND [S]LOW [L]ASER [M]AGNET",W/2,H/2+162);
        return;
      }

      // ── Level transition ───────────────────────────────────────────────────
      if (s.phase==="level-transition") {
        s.transitionTimer--;
        if (img?.complete) { c.globalAlpha=.3; c.drawImage(img,0,0,W,H); c.globalAlpha=1; }
        c.fillStyle="rgba(0,0,0,0.80)"; c.fillRect(0,0,W,H);
        c.strokeStyle=pal.accent; c.lineWidth=2; c.strokeRect(20,20,W-40,H-40);
        c.font="bold 11px 'Courier New', monospace"; c.fillStyle=pal.accent+"99"; c.textAlign="center";
        c.fillText(`LEVEL ${lvl}`,W/2,H/2-100);
        c.font="bold 30px 'Courier New', monospace"; c.fillStyle="#fff";
        c.shadowColor=pal.accent; c.shadowBlur=20;
        c.fillText(pal.name,W/2,H/2-58);
        c.shadowBlur=0;
        c.font="bold 12px 'Courier New', monospace"; c.fillStyle="#888";
        c.fillText("SMASH ALL BRICKS TO CLEAR THE PICTURE!",W/2,H/2-28);
        c.fillText("CATCH FALLING POWER-UPS!",W/2,H/2-10);
        const cd=Math.ceil(s.transitionTimer/60);
        c.font="bold 52px 'Courier New', monospace"; c.fillStyle="#fff";
        c.shadowColor=pal.accent; c.shadowBlur=30; c.fillText(String(cd),W/2,H/2+70); c.shadowBlur=0;
        c.font="bold 11px 'Courier New', monospace"; c.fillStyle="#444";
        c.fillText("CLICK TO SKIP",W/2,H/2+115);
        if (s.transitionTimer<=0) {
          s.phase="ready";
          s.countdownTimer = COUNTDOWN_FRAMES;
        }
        return;
      }

      // ── Paddle movement (shared across ready + playing) ────────────────────
      const targetW = s.extendTimer>0 ? PADDLE_EXTEND_W : PADDLE_BASE_W;
      s.paddle.w += (targetW - s.paddle.w) * 0.12;
      const targetX = clamp(s.paddleTarget - s.paddle.w/2, 4, W - s.paddle.w - 4);
      s.paddle.x += (targetX - s.paddle.x) * 0.18;

      // Keep stuck ball riding the paddle
      if (s.ballStuck) {
        s.ball.x = s.paddle.x + s.stuckOffsetX;
        s.ball.y = s.paddle.y - BALL_R - 1;
      }

      // ── Grid + bricks ──────────────────────────────────────────────────────
      drawGridBackground(c, lvl, img);
      s.bricks.forEach(b => drawBrick(c, b, lvl, img));

      // ── Particles ─────────────────────────────────────────────────────────
      s.particles = s.particles.filter(p=>p.life>0);
      s.particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.vy+=.08; p.life-=.025;
        c.globalAlpha=p.life; c.fillStyle=p.color; c.shadowColor=p.color; c.shadowBlur=5;
        c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.fill();
        c.shadowBlur=0; c.globalAlpha=1;
      });

      // ── Power-ups ──────────────────────────────────────────────────────────
      s.powerUps = s.powerUps.filter(pu=>pu.alive);
      s.powerUps.forEach(pu=>{
        pu.y += pu.vy;
        const pad = s.paddle;
        if (pu.y+8>=pad.y && pu.y-8<=pad.y+pad.h && pu.x>=pad.x-14 && pu.x<=pad.x+pad.w+14) {
          pu.alive=false;
          if (pu.type==="extend") s.extendTimer=EFFECT_DURATION;
          if (pu.type==="slow")   { s.slowTimer=EFFECT_DURATION; scaleSpeed(s,.55); }
          if (pu.type==="laser")  s.laserTimer=EFFECT_DURATION;
          if (pu.type==="sticky") {
            s.stickyTimer=EFFECT_DURATION;
            // Immediately stick ball if it's in play
            if (!s.ballStuck) {
              s.stuckOffsetX = s.ball.x - pad.x;
              s.ballStuck = true;
            }
          }
          spawnParticles(pu.x, pu.y, POWERUP_COLORS[pu.type], 10);
        }
        if (pu.y>H+20) pu.alive=false;
      });
      drawPowerUps(c, s.powerUps);

      // ── Laser bolts ────────────────────────────────────────────────────────
      if (s.phase==="playing" && s.laserTimer>0) {
        s.laserFireTimer--;
        if (s.laserFireTimer<=0) {
          s.laserFireTimer=LASER_INTERVAL;
          s.laserBolts.push({ x:s.paddle.x+8,            y:s.paddle.y-5, alive:true });
          s.laserBolts.push({ x:s.paddle.x+s.paddle.w-8, y:s.paddle.y-5, alive:true });
        }
      }
      s.laserBolts = s.laserBolts.filter(lb=>lb.alive);
      s.laserBolts.forEach(lb=>{
        lb.y -= LASER_SPEED;
        if (lb.y < 52) { lb.alive=false; return; }
        for (const b of s.bricks) {
          if (!b.alive || b.type==="indestructible") continue;
          if (lb.x>=b.x && lb.x<=b.x+b.w && lb.y>=b.y && lb.y<=b.y+b.h) {
            b.hp--;
            if (b.hp<=0) {
              b.alive=false;
              s.score += (b.type==="tough"?20:10)*lvl;
              spawnParticles(b.x+b.w/2,b.y+b.h/2,pal.bricks[b.palCol%pal.bricks.length],8);
              maybeDropPowerUp(s,b);
            }
            lb.alive=false; break;
          }
        }
      });
      drawLasers(c, s.laserBolts);

      drawPaddle(c, s.paddle, lvl, s.laserTimer>0, s.stickyTimer>0);
      drawBall(c, s.ball, lvl, s.slowTimer>0, s.ballStuck);
      drawHUD(c, s.score, s.lives, lvl, getClearedPct(s.bricks), s.extendTimer, s.slowTimer, s.laserTimer, s.stickyTimer, s.difficulty);

      // ── Ready / countdown ──────────────────────────────────────────────────
      if (s.phase==="ready") {
        s.countdownTimer = Math.max(0, s.countdownTimer - 1);
        const secsLeft = Math.ceil(s.countdownTimer / 60);
        const label = secsLeft > 0 ? String(secsLeft) : "GO!";
        const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 120);
        c.font = `bold 72px 'Courier New', monospace`;
        c.textAlign = "center";
        c.shadowColor = pal.accent; c.shadowBlur = 40;
        c.fillStyle = secsLeft > 0 ? `rgba(255,255,255,${pulse})` : pal.accent;
        c.fillText(label, W/2, H/2 + 20);
        c.shadowBlur = 0;
        c.font = "bold 11px 'Courier New', monospace";
        c.fillStyle = "rgba(255,255,255,0.5)";
        c.fillText("SPACE or CLICK to launch early", W/2, H/2 + 58);
        if (s.countdownTimer <= 0) {
          launchBall(s.level);
          s.phase = "playing";
        }
        return;
      }

      // ── Level clear ────────────────────────────────────────────────────────
      if (s.phase==="level-clear") {
        s.clearTimer--;
        if (img?.complete) { c.drawImage(img,0,50,W,H-50); }
        c.fillStyle="rgba(0,0,0,0.58)"; c.fillRect(0,0,W,H);
        c.strokeStyle=pal.accent; c.lineWidth=2; c.strokeRect(20,20,W-40,H-40);
        c.font="bold 14px 'Courier New', monospace"; c.fillStyle=pal.accent; c.textAlign="center";
        c.fillText("CLEARED! 🎉",W/2,H/2-80);
        c.font="bold 36px 'Courier New', monospace"; c.fillStyle="#fff";
        c.shadowColor=pal.accent; c.shadowBlur=22;
        c.fillText(pal.name,W/2,H/2-38); c.shadowBlur=0;
        c.font="bold 16px 'Courier New', monospace"; c.fillStyle="#fff";
        c.fillText(`+${200+lvl*50} BONUS!`,W/2,H/2+10);
        if (s.clearTimer<=0) {
          c.font="bold 13px 'Courier New', monospace"; c.fillStyle=pal.accent;
          c.fillText(lvl>=5?"CLICK FOR FINAL SCORE!":`CLICK FOR LEVEL ${lvl+1}!`,W/2,H/2+55);
        }
        s.particles=s.particles.filter(p=>p.life>0);
        s.particles.forEach(p=>{
          p.x+=p.vx;p.y+=p.vy;p.vy+=.06;p.life-=.016;
          c.globalAlpha=p.life; c.fillStyle=p.color; c.shadowColor=p.color; c.shadowBlur=8;
          c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.fill();
          c.shadowBlur=0; c.globalAlpha=1;
        });
        return;
      }

      // ── Game Over ──────────────────────────────────────────────────────────
      if (s.phase==="game-over") {
        c.fillStyle="rgba(0,0,0,0.88)"; c.fillRect(0,0,W,H);
        c.strokeStyle="#ff3333"; c.lineWidth=2; c.strokeRect(20,20,W-40,H-40);
        c.font="bold 44px 'Courier New', monospace"; c.fillStyle="#ff3333"; c.textAlign="center";
        c.shadowColor="#ff0000"; c.shadowBlur=22; c.fillText("GAME OVER",W/2,H/2-40); c.shadowBlur=0;
        c.font="bold 18px 'Courier New', monospace"; c.fillStyle="#fff";
        c.fillText(`SCORE: ${s.score}`,W/2,H/2+20);
        c.font="bold 13px 'Courier New', monospace"; c.fillStyle="#ff3333";
        c.fillText("CLICK TO PLAY AGAIN",W/2,H/2+60);
        return;
      }

      // ── Win ────────────────────────────────────────────────────────────────
      if (s.phase==="win") {
        const img5=imagesRef.current[5];
        if (img5?.complete) { c.drawImage(img5,0,0,W,H); }
        c.fillStyle="rgba(0,0,0,0.72)"; c.fillRect(0,0,W,H);
        c.strokeStyle="#ff4400"; c.lineWidth=2; c.strokeRect(20,20,W-40,H-40);
        c.font="bold 40px 'Courier New', monospace"; c.fillStyle="#ff4400"; c.textAlign="center";
        c.shadowColor="#ff4400"; c.shadowBlur=26; c.fillText("YOU WIN! 🌍",W/2,H/2-60); c.shadowBlur=0;
        c.font="bold 14px 'Courier New', monospace"; c.fillStyle="#fff";
        c.fillText("5 PICTURES CLEARED!",W/2,H/2-15);
        c.fillText(`FINAL SCORE: ${s.score}`,W/2,H/2+22);
        c.font="bold 13px 'Courier New', monospace"; c.fillStyle="#ff4400";
        c.fillText("CLICK TO PLAY AGAIN",W/2,H/2+70);
        return;
      }

      // ── Ball-lost overlay ──────────────────────────────────────────────────
      if (s.phase==="ball-lost") {
        s.ballLostTimer--;
        if (s.ballLostTimer<=0) {
          c.fillStyle="rgba(0,0,0,0.6)"; c.fillRect(0,0,W,H);
          c.font="bold 28px 'Courier New', monospace"; c.fillStyle="#ff4444"; c.textAlign="center";
          c.fillText("BALL LOST!",W/2,H/2-20);
          c.font="bold 13px 'Courier New', monospace"; c.fillStyle=pal.accent;
          c.fillText("CLICK or SPACE to continue",W/2,H/2+22);
        }
        return;
      }
      if (s.phase!=="playing") return;

      // ── Effect timers ──────────────────────────────────────────────────────
      if (s.extendTimer>0) s.extendTimer--;
      if (s.laserTimer>0)  s.laserTimer--;
      if (s.stickyTimer>0) s.stickyTimer--;
      if (s.slowTimer>0) {
        s.slowTimer--;
        if (s.slowTimer===0) scaleSpeed(s, 1/0.55);
      }

      // ── Skip physics if ball is stuck ──────────────────────────────────────
      if (s.ballStuck) return;

      // ── Ball physics ───────────────────────────────────────────────────────
      s.ball.x += s.ball.vx;
      s.ball.y += s.ball.vy;

      if (s.ball.x-s.ball.r<4)   { s.ball.x=4+s.ball.r;    s.ball.vx=Math.abs(s.ball.vx); }
      if (s.ball.x+s.ball.r>W-4) { s.ball.x=W-4-s.ball.r;  s.ball.vx=-Math.abs(s.ball.vx); }
      if (s.ball.y-s.ball.r<52)  { s.ball.y=52+s.ball.r;   s.ball.vy=Math.abs(s.ball.vy); }

      const pad = s.paddle;
      if (s.ball.vy>0 &&
          s.ball.y+s.ball.r>=pad.y &&
          s.ball.y+s.ball.r<=pad.y+pad.h+6 &&
          s.ball.x>=pad.x-s.ball.r &&
          s.ball.x<=pad.x+pad.w+s.ball.r) {
        if (s.stickyTimer > 0) {
          // Magnet: stick ball to paddle
          s.ballStuck = true;
          s.stuckOffsetX = clamp(s.ball.x - pad.x, 0, pad.w);
        } else {
          const hit=(s.ball.x-(pad.x+pad.w/2))/(pad.w/2);
          const spd=Math.hypot(s.ball.vx,s.ball.vy);
          const ang=hit*(Math.PI/3);
          s.ball.vx=spd*Math.sin(ang);
          s.ball.vy=-Math.abs(spd*Math.cos(ang));
          s.ball.y=pad.y-s.ball.r;
        }
      }

      if (s.ball.y-s.ball.r>H+20) {
        s.lives--;
        if (s.lives<=0) s.phase="game-over";
        else { s.phase="ball-lost"; s.ballLostTimer=80; }
      }

      // ── Brick collisions ───────────────────────────────────────────────────
      for (const b of s.bricks) {
        if (!b.alive) continue;
        const nearX=clamp(s.ball.x,b.x,b.x+b.w);
        const nearY=clamp(s.ball.y,b.y,b.y+b.h);
        if (Math.hypot(s.ball.x-nearX,s.ball.y-nearY)>=s.ball.r) continue;

        const overlapX=s.ball.x>b.x && s.ball.x<b.x+b.w;
        const fromTop=s.ball.y<b.y;
        const fromLeft=s.ball.x<b.x;
        const fromRight=s.ball.x>b.x+b.w;
        if (overlapX) s.ball.vy=fromTop?-Math.abs(s.ball.vy):Math.abs(s.ball.vy);
        else { s.ball.vx=(fromLeft||(!fromRight&&fromTop))?-Math.abs(s.ball.vx):Math.abs(s.ball.vx); s.ball.vy=fromTop?-Math.abs(s.ball.vy):Math.abs(s.ball.vy); }

        if (b.type!=="indestructible") {
          b.hp--;
          if (b.hp<=0) {
            b.alive=false;
            s.score+=(b.type==="tough"?20:10)*lvl;
            spawnParticles(b.x+b.w/2,b.y+b.h/2,pal.bricks[b.palCol%pal.bricks.length]);
            maybeDropPowerUp(s,b);
          }
        }
        break;
      }

      // ── Level clear check ──────────────────────────────────────────────────
      if (!s.bricks.some(b=>b.alive&&b.type!=="indestructible")) {
        s.score+=200+lvl*50; s.phase="level-clear"; s.clearTimer=150;
        for(let i=0;i<8;i++) setTimeout(()=>{
          spawnParticles(GRID_OFFSET_X+Math.random()*GRID_W, BRICK_TOP+Math.random()*getGridHeight(lvl), pal.bricks[i%pal.bricks.length], 16);
        }, i*100);
      }
    }

    s.rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(s.rafId);
      canvas.removeEventListener("mousemove",onMouseMove);
      canvas.removeEventListener("touchmove",onTouchMove);
      canvas.removeEventListener("click",onClick);
      window.removeEventListener("keydown",onKeyDown);
    };
  }, [startLevel, resetBall, launchBall, placeBallOnPaddle, spawnParticles]);

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#000", padding:"16px" }}>
      <canvas
        ref={canvasRef} width={W} height={H}
        style={{ display:"block", maxWidth:"100%", maxHeight:"90vh", imageRendering:"pixelated",
          cursor:"none", border:"2px solid #111", borderRadius:"4px",
          boxShadow:"0 0 50px rgba(0,212,255,0.12), 0 0 100px rgba(0,0,0,0.8)" }}
      />
    </div>
  );
}

// ─── Helpers outside component ────────────────────────────────────────────────

function scaleSpeed(s: ReturnType<typeof buildState>, factor: number) {
  const spd = Math.hypot(s.ball.vx, s.ball.vy);
  const newSpd = spd * factor;
  const angle = Math.atan2(s.ball.vy, s.ball.vx);
  s.ball.vx = Math.cos(angle) * newSpd;
  s.ball.vy = Math.sin(angle) * newSpd;
}

function maybeDropPowerUp(s: ReturnType<typeof buildState>, b: Brick) {
  if (Math.random() > POWERUP_DROP_CHANCE) return;
  const types: PowerUpType[] = ["extend","slow","laser","sticky"];
  const type = types[Math.floor(Math.random()*types.length)];
  s.powerUps.push({ x:b.x+b.w/2, y:b.y, vy:1.8+Math.random()*.8, type, alive:true });
}

function buildState() {
  return {
    phase: "title" as GamePhase,
    level: 1, lives: 3, score: 0,
    bricks: [] as Brick[], ball: {} as Ball, paddle: {} as Paddle,
    paddleTarget: 0, mouseY: 0, transitionTimer: 0, countdownTimer: 0,
    ballLostTimer: 0, clearTimer: 0, rafId: 0,
    particles: [] as { x:number;y:number;vx:number;vy:number;life:number;color:string;r:number; }[],
    powerUps: [] as PowerUp[], laserBolts: [] as LaserBolt[],
    laserFireTimer: 0, extendTimer: 0, slowTimer: 0, laserTimer: 0,
    stickyTimer: 0, ballStuck: false, stuckOffsetX: 0, baseSpeed: 3.64,
    difficulty: "master" as "rookie" | "master",
  };
}
