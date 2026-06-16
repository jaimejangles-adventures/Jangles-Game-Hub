import { useEffect, useRef, useCallback } from "react";
import { useArcadeSession } from "@/lib/arcade-session-context";
import { useScore } from "@/hooks/use-score";

// ── Constants ──────────────────────────────────────────────────────────────
const W = 480;
const H = 640;
const HORIZON_Y = 200;
const N_ROWS = H - HORIZON_Y;
const BASE_HW = 210;
const CAR_STEER = 0.022;
const BASE_SPEED = 0.005;
const MAX_SPEED = 0.016;
const SPEED_PER_LEVEL = 0.0015;
const CURVE_STR = 90;
const DRIFT = 0.0012;
const CAR_MAX_X = 0.85;
const SPAWN_MIN = 55;
const SPAWN_MAX = 110;
const HIT_WIDTH = 0.45;
const HIT_DEPTH = 0.87;
const COLLECT_WIDTH = 0.48;
const COLLECT_DEPTH = 0.88;
const FLAGS_PER_LEVEL = 5;
const MAX_LIVES = 3;
const INVINCIBLE_FRAMES = 90;
const OBS_COLORS = ["#ff3333", "#3399ff", "#ff9900", "#ff33ff", "#33ff99"];
const LANES = [-0.55, 0, 0.55];

// ── Level themes ───────────────────────────────────────────────────────────
interface LevelTheme {
  skyTop: string;
  skyBot: string;
  grass1: string;
  grass2: string;
  road1: string;
  road2: string;
  curb: string;
  stripe: string;
  glow: string;
  country: string;
  music: string; // filename inside /music/
  // Three flag stripe colors (top→bottom) for the collectible ball
  ball: [string, string, string];
}

const TITLE_MUSIC = "/music/THEME_003_1.1.wav";

// One entry per book page (pages 3-24, skipping 14 = 21 total)
const LEVEL_THEMES: LevelTheme[] = [
  // pg 3  New Orleans / USA
  { skyTop:"#0d1a3e", skyBot:"#1a2855", grass1:"#1a3a2a", grass2:"#0d2218",
    road1:"#2a2535", road2:"#1e1a28", curb:"#cc3322", stripe:"#f0c060",
    glow:"rgba(240,180,60,0.40)", country:"USA",
    music:"NEW ORLEANS.wav",
    ball:["#b22234","#ffffff","#3c3b6e"] },
  // pg 4  Mexico
  { skyTop:"#1a7ab5", skyBot:"#4fb8e8", grass1:"#2a8a2a", grass2:"#1a6a1a",
    road1:"#c8a870", road2:"#a88850", curb:"#dd2222", stripe:"#ffffff",
    glow:"rgba(80,200,100,0.32)", country:"Mexico",
    music:"MEXICO.wav",
    ball:["#006847","#ffffff","#ce1126"] },
  // pg 5  Jamaica
  { skyTop:"#1a8cc0", skyBot:"#5ad0f0", grass1:"#2a7a2a", grass2:"#1a5a1a",
    road1:"#d4b878", road2:"#b09050", curb:"#111111", stripe:"#228b22",
    glow:"rgba(34,180,34,0.30)", country:"Jamaica",
    music:"JAMAICA.wav",
    ball:["#000000","#ffd700","#007847"] },
  // pg 6  Barbados
  { skyTop:"#1a9aaa", skyBot:"#4ad8e8", grass1:"#e8c87a", grass2:"#c8a850",
    road1:"#c0b090", road2:"#a09070", curb:"#5544aa", stripe:"#ffffff",
    glow:"rgba(80,220,230,0.36)", country:"Barbados",
    music:"BARBADOS_2.wav",
    ball:["#00267f","#ffc726","#00267f"] },
  // pg 7  Peru
  { skyTop:"#4a7ab0", skyBot:"#8abadc", grass1:"#4a6a2a", grass2:"#2a4a1a",
    road1:"#9a7050", road2:"#7a5030", curb:"#aa3333", stripe:"#ddccaa",
    glow:"rgba(150,100,60,0.30)", country:"Peru",
    music:"PERU.wav",
    ball:["#d91023","#ffffff","#d91023"] },
  // pg 8  Argentina
  { skyTop:"#6ab0d8", skyBot:"#a0d0ee", grass1:"#3a7a3a", grass2:"#2a5a2a",
    road1:"#606070", road2:"#484858", curb:"#5599dd", stripe:"#ffffff",
    glow:"rgba(80,150,230,0.30)", country:"Argentina",
    music:"ARGENTINA DRUMS AND HORNS_1.2.wav",
    ball:["#74acdf","#ffffff","#74acdf"] },
  // pg 9  Antarctica
  { skyTop:"#8ac8e8", skyBot:"#c0e4f4", grass1:"#a0c8d8", grass2:"#80a8c0",
    road1:"#c0d8e8", road2:"#a0b8cc", curb:"#e0eeee", stripe:"#b0d4ec",
    glow:"rgba(180,220,240,0.42)", country:"Antarctica",
    music:"THEME_003_1.1.wav",
    ball:["#ffffff","#aaddee","#ffffff"] },
  // pg 10 UK
  { skyTop:"#6090b0", skyBot:"#90b8cc", grass1:"#3a6030", grass2:"#2a4820",
    road1:"#787060", road2:"#585048", curb:"#cc2222", stripe:"#f0f0f0",
    glow:"rgba(160,140,100,0.30)", country:"UK",
    music:"UK.wav",
    ball:["#cc0000","#ffffff","#00247d"] },
  // pg 11 Spain
  { skyTop:"#3888cc", skyBot:"#70b8e8", grass1:"#c07870", grass2:"#a05850",
    road1:"#c8bca0", road2:"#a89c80", curb:"#cc2222", stripe:"#f8f0e0",
    glow:"rgba(220,80,80,0.36)", country:"Spain",
    music:"SPAIN1.2.wav",
    ball:["#c60b1e","#f1bf00","#c60b1e"] },
  // pg 12 France
  { skyTop:"#5090c0", skyBot:"#90c0e0", grass1:"#2a7030", grass2:"#1a5020",
    road1:"#b89a70", road2:"#987850", curb:"#f8a0b0", stripe:"#f0e0c0",
    glow:"rgba(240,160,80,0.36)", country:"France",
    music:"FRANCE.wav",
    ball:["#002395","#ffffff","#ed2939"] },
  // pg 13 Italy
  { skyTop:"#5088c0", skyBot:"#88b8dc", grass1:"#3a8030", grass2:"#2a6020",
    road1:"#c8a870", road2:"#a88850", curb:"#cc2222", stripe:"#f0e8d0",
    glow:"rgba(200,160,80,0.30)", country:"Italy",
    music:"ITALY.wav",
    ball:["#009246","#ffffff","#ce2b37"] },
  // pg 15 Sri Lanka
  { skyTop:"#6050a0", skyBot:"#9080c0", grass1:"#a0c850", grass2:"#80a830",
    road1:"#c89860", road2:"#a87840", curb:"#cc44aa", stripe:"#ffee88",
    glow:"rgba(200,100,220,0.36)", country:"Sri Lanka",
    music:"SRI LANKA_1.1.wav",
    ball:["#8d153a","#f5af00","#8d153a"] },
  // pg 16 Japan
  { skyTop:"#88b8c8", skyBot:"#b8d8e0", grass1:"#2a7888", grass2:"#1a5868",
    road1:"#506878", road2:"#384858", curb:"#cc2222", stripe:"#f0f0f0",
    glow:"rgba(80,180,200,0.36)", country:"Japan",
    music:"JAPAN.wav",
    ball:["#ffffff","#bc002d","#ffffff"] },
  // pg 17 Switzerland
  { skyTop:"#88b8d8", skyBot:"#c0dced", grass1:"#e8f0f8", grass2:"#c8d8e8",
    road1:"#e8e0d8", road2:"#c8c0b8", curb:"#cc2222", stripe:"#ffffff",
    glow:"rgba(180,220,240,0.42)", country:"Switzerland",
    music:"SWITZERLAND.wav",
    ball:["#ff0000","#ffffff","#ff0000"] },
  // pg 18 Kenya
  { skyTop:"#38a0d8", skyBot:"#70c8e8", grass1:"#90b840", grass2:"#70981a",
    road1:"#c8a050", road2:"#a88030", curb:"#cc6622", stripe:"#f8e880",
    glow:"rgba(240,180,40,0.36)", country:"Kenya",
    music:"KENYA.wav",
    ball:["#006600","#cc0000","#000000"] },
  // pg 19 South Africa
  { skyTop:"#38a8e0", skyBot:"#70d0f0", grass1:"#2a9060", grass2:"#1a7040",
    road1:"#d8c8a0", road2:"#b8a880", curb:"#cc4488", stripe:"#ffee44",
    glow:"rgba(120,220,180,0.36)", country:"South Africa",
    music:"SOUTH AFRICA_1.2.wav",
    ball:["#007749","#ffb81c","#de3831"] },
  // pg 20 Ghana
  { skyTop:"#3890c8", skyBot:"#60b8e0", grass1:"#e89030", grass2:"#c87010",
    road1:"#c8a060", road2:"#a88040", curb:"#dd4422", stripe:"#88cc44",
    glow:"rgba(240,140,40,0.42)", country:"Ghana",
    music:"GHANA.wav",
    ball:["#006b3f","#fcd116","#ce1126"] },
  // pg 21 South Korea
  { skyTop:"#8880c0", skyBot:"#b0a8d8", grass1:"#6888a8", grass2:"#485888",
    road1:"#706080", road2:"#504060", curb:"#cc4444", stripe:"#f0e8e0",
    glow:"rgba(160,120,200,0.36)", country:"South Korea",
    music:"SOUTH KOREA.wav",
    ball:["#c60c30","#ffffff","#003478"] },
  // pg 22 Nepal
  { skyTop:"#70b8e8", skyBot:"#a8d8f4", grass1:"#f0f0f8", grass2:"#d0d8e8",
    road1:"#d0c0a8", road2:"#b0a088", curb:"#cc5522", stripe:"#ffffff",
    glow:"rgba(180,220,240,0.42)", country:"Nepal",
    music:"NEPAL.wav",
    ball:["#003893","#dc143c","#003893"] },
  // pg 23 Indonesia
  { skyTop:"#3898d0", skyBot:"#60c0e8", grass1:"#9a6030", grass2:"#7a4020",
    road1:"#d4b878", road2:"#b49858", curb:"#cc2222", stripe:"#f8f0d0",
    glow:"rgba(60,180,220,0.36)", country:"Indonesia",
    music:"INDONESIA.wav",
    ball:["#ce1126","#ce1126","#ffffff"] },
  // pg 24 Australia
  { skyTop:"#1a2a60", skyBot:"#2a3a80", grass1:"#2a5080", grass2:"#1a3868",
    road1:"#3868a0", road2:"#285888", curb:"#ffffff", stripe:"#55aaff",
    glow:"rgba(60,120,220,0.42)", country:"Australia",
    music:"Jamie Jangles_Daniel_Australia.wav",
    ball:["#00008b","#cc0000","#ffffff"] },
];

// ── Types ──────────────────────────────────────────────────────────────────
type Phase = "title" | "playing" | "levelup" | "gameover";

interface Obstacle { depth: number; laneX: number; color: string; id: number; }
interface Ball     { depth: number; laneX: number; id: number; }

interface GameState {
  phase: Phase;
  carX: number;
  speed: number;
  trackPos: number;
  score: number;
  bestScore: number;
  lives: number;
  level: number;
  ballsCollected: number;
  balls: Ball[];
  obstacles: Obstacle[];
  bgOrder: number[];
  nextId: number;
  leftDown: boolean;
  rightDown: boolean;
  touchX: number | null;
  tick: number;
  spawnIn: number;
  ballSpawnIn: number;
  invincible: number;
  levelFlash: number;
  scoreSubmitted: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getCurve(pos: number): number {
  return Math.sin(pos * 0.013) * 0.7 + Math.sin(pos * 0.031) * 0.3;
}

function levelSpeed(level: number): number {
  return Math.min(BASE_SPEED + (level - 1) * SPEED_PER_LEVEL, MAX_SPEED);
}

function makeInitialState(bestScore = 0): GameState {
  return {
    phase: "title",
    carX: 0,
    speed: BASE_SPEED,
    trackPos: 0,
    score: 0,
    bestScore,
    lives: MAX_LIVES,
    level: 1,
    ballsCollected: 0,
    balls: [],
    obstacles: [],
    bgOrder: shuffle(LEVEL_THEMES.map((_, i) => i)),
    nextId: 0,
    leftDown: false,
    rightDown: false,
    touchX: null,
    tick: 0,
    spawnIn: 40,
    ballSpawnIn: 30,
    invincible: 0,
    levelFlash: 0,
    scoreSubmitted: false,
  };
}

// ── Draw: sky ──────────────────────────────────────────────────────────────
function drawSky(ctx: CanvasRenderingContext2D, theme: LevelTheme) {
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(1, theme.skyBot);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON_Y);

  const glow = ctx.createLinearGradient(0, HORIZON_Y - 22, 0, HORIZON_Y);
  glow.addColorStop(0, "rgba(0,0,0,0)");
  glow.addColorStop(1, theme.glow);
  ctx.fillStyle = glow;
  ctx.fillRect(0, HORIZON_Y - 22, W, 22);
}

// ── Draw: road ─────────────────────────────────────────────────────────────
function drawRoad(ctx: CanvasRenderingContext2D, trackPos: number, carX: number, theme: LevelTheme) {
  const curve = getCurve(trackPos);
  for (let i = 0; i < N_ROWS; i++) {
    const t = i / N_ROWS;
    const scale = 1 - t;
    const y = H - 1 - i;
    const curveOffset = curve * CURVE_STR * t;
    const cx = W / 2 - carX * BASE_HW * scale + curveOffset;
    const hw = BASE_HW * scale;
    const stripe = Math.floor(Math.sqrt(t) * 28 + trackPos * 1.1) % 2;

    ctx.fillStyle = stripe ? theme.grass1 : theme.grass2;
    ctx.fillRect(0, y, W, 1);

    if (hw < 1) continue;
    ctx.fillStyle = stripe ? theme.road1 : theme.road2;
    ctx.fillRect(Math.round(cx - hw), y, Math.max(1, Math.round(hw * 2)), 1);

    if (hw > 3) {
      const rw = Math.max(2, Math.round(hw * 0.11));
      ctx.fillStyle = stripe ? theme.curb : theme.stripe;
      ctx.fillRect(Math.round(cx - hw), y, rw, 1);
      ctx.fillRect(Math.round(cx + hw - rw), y, rw, 1);
    }
    if (hw > 10 && !stripe && Math.floor(Math.sqrt(t) * 28 + trackPos * 1.1) % 6 < 3) {
      const dw = Math.max(1, Math.round(hw * 0.04));
      ctx.fillStyle = "#ffffff55";
      ctx.fillRect(Math.round(cx - dw / 2), y, dw, 1);
    }
  }
}

// ── Draw: flag ball collectible ────────────────────────────────────────────
function drawFlagBall(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, scale: number,
  tick: number, id: number,
  colors: [string, string, string]
) {
  const r = Math.max(2, Math.round(18 * scale));
  // gentle vertical bob
  const bob = Math.sin(tick * 0.14 + id * 0.9) * 4 * scale;
  const cx = Math.round(sx);
  const cy = Math.round(sy - r + bob);

  ctx.save();

  // outer glow
  ctx.shadowColor = colors[1];
  ctx.shadowBlur = 10 * scale;

  // clip circle
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // three horizontal flag stripes
  const sh = Math.ceil((r * 2) / 3) + 1;
  ctx.fillStyle = colors[0];
  ctx.fillRect(cx - r, cy - r, r * 2, sh);
  ctx.fillStyle = colors[1];
  ctx.fillRect(cx - r, cy - r + sh, r * 2, sh);
  ctx.fillStyle = colors[2];
  ctx.fillRect(cx - r, cy - r + sh * 2, r * 2, sh + 2);

  // spherical highlight
  const shine = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r);
  shine.addColorStop(0, "rgba(255,255,255,0.50)");
  shine.addColorStop(0.45, "rgba(255,255,255,0.05)");
  shine.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = shine;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);

  ctx.restore();

  // sparkle dots around ball
  const spark = 0.3 + 0.7 * Math.abs(Math.sin(tick * 0.18 + id * 1.4));
  ctx.save();
  ctx.globalAlpha = spark * Math.min(1, scale * 1.4);
  ctx.fillStyle = colors[1];
  const starD = r + Math.round(5 * scale);
  ctx.fillRect(cx - 1, cy - starD - 1, 2, 2);
  ctx.fillRect(cx - 1, cy + starD - 1, 2, 2);
  ctx.fillRect(cx - starD - 1, cy - 1, 2, 2);
  ctx.fillRect(cx + starD - 1, cy - 1, 2, 2);
  ctx.restore();
}

// ── Draw: obstacle car ─────────────────────────────────────────────────────
function drawObstacleCar(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, scale: number, color: string
) {
  const w = Math.round(50 * scale);
  const h = Math.round(72 * scale);
  if (w < 3 || h < 3) return;

  const x = Math.round(sx - w / 2);
  const y = Math.round(sy - h);

  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x + Math.round(w * 0.1), y, Math.round(w * 0.8), Math.round(h * 0.68));
  ctx.fillStyle = "#000022";
  ctx.fillRect(x + Math.round(w * 0.18), y + Math.round(h * 0.04), Math.round(w * 0.64), Math.round(h * 0.33));
  ctx.fillStyle = "#334488";
  ctx.fillRect(x + Math.round(w * 0.22), y + Math.round(h * 0.07), Math.round(w * 0.56), Math.round(h * 0.22));
  ctx.fillStyle = color;
  ctx.fillRect(x, y + Math.round(h * 0.62), w, Math.round(h * 0.08));
  ctx.fillRect(x + Math.round(w * 0.2), y + Math.round(h * 0.66), Math.round(w * 0.6), Math.round(h * 0.12));
  ctx.fillRect(x, y + Math.round(h * 0.76), w, Math.round(h * 0.07));
  ctx.fillStyle = "#222222";
  ctx.fillRect(x,                              y + Math.round(h * 0.18), Math.round(w * 0.13), Math.round(h * 0.26));
  ctx.fillRect(x + Math.round(w * 0.87),       y + Math.round(h * 0.18), Math.round(w * 0.13), Math.round(h * 0.26));
  ctx.fillRect(x + Math.round(w * 0.04),       y + Math.round(h * 0.58), Math.round(w * 0.13), Math.round(h * 0.2));
  ctx.fillRect(x + Math.round(w * 0.83),       y + Math.round(h * 0.58), Math.round(w * 0.13), Math.round(h * 0.2));
  ctx.restore();
}

// ── Draw: player car ───────────────────────────────────────────────────────
function drawPlayerCar(ctx: CanvasRenderingContext2D, invincible: number) {
  const cx = W / 2;
  const cy = H - 58;
  const w = 54;
  const h = 82;

  if (invincible > 0 && Math.floor(invincible / 5) % 2 === 0) return;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + Math.round(h / 2) + 6, Math.round(w * 0.55), 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#cc0000";
  ctx.fillRect(cx - Math.round(w * 0.5), cy - Math.round(h * 0.46), w, Math.round(h * 0.08));
  ctx.fillStyle = "#0044ff";
  ctx.fillRect(cx - Math.round(w * 0.34), cy - Math.round(h * 0.38), Math.round(w * 0.68), Math.round(h * 0.65));
  ctx.fillStyle = "#002299";
  ctx.fillRect(cx - Math.round(w * 0.22), cy - Math.round(h * 0.33), Math.round(w * 0.44), Math.round(h * 0.36));
  ctx.fillStyle = "#88aaff";
  ctx.fillRect(cx - Math.round(w * 0.16), cy - Math.round(h * 0.28), Math.round(w * 0.32), Math.round(h * 0.22));
  ctx.fillStyle = "#ccddff";
  ctx.fillRect(cx - Math.round(w * 0.12), cy - Math.round(h * 0.25), Math.round(w * 0.08), Math.round(h * 0.06));
  ctx.fillStyle = "#0033cc";
  ctx.fillRect(cx - Math.round(w * 0.18), cy + Math.round(h * 0.22), Math.round(w * 0.36), Math.round(h * 0.13));
  ctx.fillStyle = "#cc0000";
  ctx.fillRect(cx - Math.round(w * 0.5), cy + Math.round(h * 0.33), w, Math.round(h * 0.06));
  ctx.fillStyle = "#333333";
  ctx.fillRect(cx - Math.round(w * 0.5),  cy - Math.round(h * 0.2),  Math.round(w * 0.14), Math.round(h * 0.3));
  ctx.fillRect(cx + Math.round(w * 0.36), cy - Math.round(h * 0.2),  Math.round(w * 0.14), Math.round(h * 0.3));
  ctx.fillRect(cx - Math.round(w * 0.48), cy + Math.round(h * 0.06), Math.round(w * 0.14), Math.round(h * 0.22));
  ctx.fillRect(cx + Math.round(w * 0.34), cy + Math.round(h * 0.06), Math.round(w * 0.14), Math.round(h * 0.22));
  ctx.fillStyle = "#555566";
  ctx.fillRect(cx - Math.round(w * 0.22), cy - Math.round(h * 0.5),  Math.round(w * 0.08), Math.round(h * 0.12));
  ctx.fillRect(cx + Math.round(w * 0.14), cy - Math.round(h * 0.5),  Math.round(w * 0.08), Math.round(h * 0.12));
  ctx.restore();
}

// ── Draw: HUD ──────────────────────────────────────────────────────────────
function drawHUD(
  ctx: CanvasRenderingContext2D,
  score: number, lives: number, level: number,
  ballsCollected: number, bestScore: number, theme: LevelTheme
) {
  ctx.save();

  // score box
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(8, 8, 160, 62);
  ctx.strokeStyle = "#ff9900";
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 160, 62);
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 11px 'Baloo 2', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("SCORE", 16, 14);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'Baloo 2', monospace";
  ctx.fillText(String(Math.floor(score)).padStart(6, "0"), 16, 28);
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "bold 10px 'Baloo 2', monospace";
  ctx.fillText(`BEST  ${String(Math.floor(bestScore)).padStart(6, "0")}`, 16, 54);

  // country + progress box
  ctx.fillStyle = "rgba(0,0,0,0.68)";
  ctx.fillRect(180, 8, 150, 62);
  ctx.strokeStyle = theme.ball[1];
  ctx.lineWidth = 2;
  ctx.strokeRect(180, 8, 150, 62);
  ctx.fillStyle = theme.ball[1];
  ctx.font = "bold 10px 'Baloo 2', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(theme.country.toUpperCase(), 188, 14);

  // mini flag ball in HUD
  ctx.save();
  ctx.beginPath();
  ctx.arc(320, 24, 8, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = theme.ball[0];
  ctx.fillRect(312, 16, 16, 6);
  ctx.fillStyle = theme.ball[1];
  ctx.fillRect(312, 22, 16, 5);
  ctx.fillStyle = theme.ball[2];
  ctx.fillRect(312, 27, 16, 5);
  ctx.restore();

  // progress bar
  const barW = 130;
  const pct = ballsCollected / FLAGS_PER_LEVEL;
  ctx.fillStyle = "#333344";
  ctx.fillRect(188, 32, barW, 12);
  ctx.fillStyle = theme.ball[0];
  ctx.fillRect(188, 32, Math.round(barW * pct * 0.5), 12);
  ctx.fillStyle = theme.ball[1];
  ctx.fillRect(188 + Math.round(barW * pct * 0.5), 32, Math.round(barW * pct * 0.3), 12);
  ctx.fillStyle = theme.ball[2];
  ctx.fillRect(188 + Math.round(barW * pct * 0.8), 32, Math.round(barW * pct * 0.2), 12);
  ctx.strokeStyle = theme.ball[1];
  ctx.lineWidth = 1.5;
  ctx.strokeRect(188, 32, barW, 12);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${ballsCollected}/${FLAGS_PER_LEVEL}`, 188 + barW / 2, 38);

  // hearts
  const heartSize = 18;
  for (let i = 0; i < MAX_LIVES; i++) {
    ctx.font = `${heartSize}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = i < lives ? "#ff3333" : "#555555";
    ctx.fillText("♥", 188 + i * (heartSize + 3), 52);
  }

  ctx.restore();
}

// ── Draw: title screen ─────────────────────────────────────────────────────
function drawTitleScreen(
  ctx: CanvasRenderingContext2D,
  tick: number, trackPos: number, bestScore: number,
  theme: LevelTheme
) {
  drawSky(ctx, theme);
  drawRoad(ctx, trackPos, 0, theme);

  ctx.fillStyle = "rgba(5,2,20,0.74)";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const pulse = 0.88 + 0.12 * Math.sin(tick * 0.06);
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 28;
  ctx.fillStyle = "#ff6600";
  ctx.font = "bold 56px 'Baloo 2', monospace";
  ctx.globalAlpha = pulse;
  ctx.fillText("JANGLES", W / 2, 150);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffff00";
  ctx.font = "bold 56px 'Baloo 2', monospace";
  ctx.fillText("RACER", W / 2, 212);

  ctx.fillStyle = "#ffffff88";
  ctx.font = "13px 'Baloo 2', monospace";
  ctx.fillText("COLLECT FLAG BALLS • AVOID CARS • 3 LIVES", W / 2, 262);

  if (bestScore > 0) {
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 13px 'Baloo 2', monospace";
    ctx.fillText(`BEST: ${Math.floor(bestScore)}`, W / 2, 292);
  }

  ctx.fillStyle = "#ffffff55";
  ctx.font = "12px 'Baloo 2', monospace";
  ctx.fillText("← → ARROW KEYS TO STEER", W / 2, 324);

  ctx.fillStyle = "#ff6600";
  ctx.shadowColor = "#ff6600";
  ctx.shadowBlur = 22;
  ctx.fillRect(W / 2 - 100, 360, 200, 56);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px 'Baloo 2', monospace";
  ctx.fillText("START!", W / 2, 360 + 28);

  ctx.restore();
}

// ── Draw: level up overlay ─────────────────────────────────────────────────
function drawLevelUp(
  ctx: CanvasRenderingContext2D,
  flash: number, nextTheme: LevelTheme
) {
  const alpha = Math.min(1, flash / 20) * 0.88;
  ctx.fillStyle = `rgba(5,2,20,${alpha})`;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fade = Math.min(1, flash / 20);
  ctx.globalAlpha = fade;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#ffff00";
  ctx.shadowBlur = 30;
  ctx.font = "bold 54px 'Baloo 2', monospace";
  ctx.fillText(nextTheme.country.toUpperCase(), W / 2, H / 2);
  ctx.shadowBlur = 0;
  ctx.fillStyle = nextTheme.ball[1];
  ctx.font = "bold 14px 'Baloo 2', monospace";
  ctx.fillText("▸ COLLECT 5 FLAG BALLS ◂", W / 2, H / 2 + 48);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Draw: game over ────────────────────────────────────────────────────────
function drawGameOver(
  ctx: CanvasRenderingContext2D,
  score: number, bestScore: number, level: number, tick: number, theme: LevelTheme
) {
  ctx.fillStyle = "rgba(5,2,20,0.86)";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ff3333";
  ctx.shadowColor = "#ff3333";
  ctx.shadowBlur = 28;
  ctx.font = "bold 50px 'Baloo 2', monospace";
  ctx.fillText("GAME OVER", W / 2, 185);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffff00";
  ctx.font = "bold 18px 'Baloo 2', monospace";
  ctx.fillText(`SCORE: ${Math.floor(score)}`, W / 2, 255);
  ctx.fillStyle = theme.ball[1];
  ctx.font = "bold 16px 'Baloo 2', monospace";
  ctx.fillText(`MADE IT TO ${theme.country.toUpperCase()}`, W / 2, 285);

  if (score >= bestScore && score > 0) {
    const pulse = 0.65 + 0.35 * Math.sin(tick * 0.12);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#ffcc00";
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 14;
    ctx.font = "bold 18px 'Baloo 2', monospace";
    ctx.fillText("✦ NEW BEST! ✦", W / 2, 318);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  } else if (bestScore > 0) {
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "13px 'Baloo 2', monospace";
    ctx.fillText(`BEST: ${Math.floor(bestScore)}`, W / 2, 318);
  }

  ctx.fillStyle = "#ffcc00";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 16;
  ctx.fillRect(W / 2 - 110, 360, 220, 56);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0520";
  ctx.font = "bold 22px 'Baloo 2', monospace";
  ctx.fillText("PLAY AGAIN", W / 2, 360 + 28);

  ctx.restore();
}

// ── Component ──────────────────────────────────────────────────────────────
export function RacerGame() {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const stateRef        = useRef<GameState>(makeInitialState());
  const rafRef          = useRef<number>(0);

  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const lastMusicRef  = useRef<string>("");

  const { endSession } = useArcadeSession();
  const endSessionRef  = useRef(endSession);
  useEffect(() => { endSessionRef.current = endSession; }, [endSession]);

  const { saveScore } = useScore("racer");
  const saveScoreRef  = useRef(saveScore);
  useEffect(() => { saveScoreRef.current = saveScore; }, [saveScore]);

  // ── Music helpers ──────────────────────────────────────────────────────
  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    lastMusicRef.current = "";
  }, []);

  const playMusic = useCallback((filename: string) => {
    if (lastMusicRef.current === filename) return;
    lastMusicRef.current = filename;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const a = new Audio(`/music/${encodeURIComponent(filename)}`);
    a.loop = true;
    a.volume = 0.55;
    a.play().catch(() => {});
    audioRef.current = a;
  }, []);

  // Stop music on unmount
  useEffect(() => () => { stopMusic(); }, [stopMusic]);

  const getTheme = useCallback((s: GameState): LevelTheme => {
    const idx = s.bgOrder[(s.level - 1) % s.bgOrder.length];
    return LEVEL_THEMES[idx] ?? LEVEL_THEMES[0];
  }, []);

  const getNextTheme = useCallback((s: GameState): LevelTheme => {
    const idx = s.bgOrder[s.level % s.bgOrder.length];
    return LEVEL_THEMES[idx] ?? LEVEL_THEMES[0];
  }, []);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    s.tick++;

    // ── Music cues (phase / level transitions) ─────────────────────────
    if (s.phase === "title") {
      playMusic("THEME_003_1.1.wav");
    } else if (s.phase === "gameover") {
      stopMusic();
    }

    // ── Update ──────────────────────────────────────────────────────────

    if (s.phase === "playing") {
      if (s.touchX !== null) {
        const target = ((s.touchX / W) * 2 - 1) * CAR_MAX_X;
        s.carX += Math.sign(target - s.carX) * Math.min(Math.abs(target - s.carX), CAR_STEER * 1.4);
      } else {
        // Start country music when entering playing phase
      playMusic(getTheme(s).music);

      if (s.leftDown)  s.carX -= CAR_STEER;
        if (s.rightDown) s.carX += CAR_STEER;
      }
      s.carX -= getCurve(s.trackPos) * DRIFT;
      s.carX = Math.max(-CAR_MAX_X, Math.min(CAR_MAX_X, s.carX));

      s.trackPos += s.speed * 100;
      s.score += s.speed * 300;

      if (s.invincible > 0) s.invincible--;
      if (s.levelFlash > 0) {
        s.levelFlash--;
        const theme = getTheme(s);
        rafRef.current = requestAnimationFrame(tick);
        drawSky(ctx, theme);
        drawRoad(ctx, s.trackPos, s.carX, theme);
        drawPlayerCar(ctx, s.invincible);
        drawHUD(ctx, s.score, s.lives, s.level, s.ballsCollected, s.bestScore, theme);
        drawLevelUp(ctx, s.levelFlash, theme);
        return;
      }

      for (const obs of s.obstacles) obs.depth += s.speed;
      for (const ball of s.balls)    ball.depth += s.speed;

      s.obstacles = s.obstacles.filter((o) => o.depth < 1.06);
      s.balls     = s.balls.filter((b) => b.depth < 1.06);

      // collect balls
      const collected = s.balls.filter(
        (b) => b.depth >= COLLECT_DEPTH && Math.abs(b.laneX - s.carX) < COLLECT_WIDTH
      );
      for (const b of collected) {
        s.balls = s.balls.filter((x) => x.id !== b.id);
        s.ballsCollected++;
        s.score += 100;
      }

      // level up
      if (s.ballsCollected >= FLAGS_PER_LEVEL) {
        s.level++;
        s.ballsCollected = 0;
        s.speed = levelSpeed(s.level);
        s.balls = [];
        s.obstacles = [];
        s.levelFlash = 120;
        s.spawnIn = 40;
        s.ballSpawnIn = 25;
        // Switch to new country's music
        playMusic(getTheme(s).music);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // obstacle collision
      if (s.invincible === 0) {
        const hit = s.obstacles.find(
          (o) => o.depth >= HIT_DEPTH && Math.abs(o.laneX - s.carX) < HIT_WIDTH
        );
        if (hit) {
          s.lives--;
          s.invincible = INVINCIBLE_FRAMES;
          s.obstacles = s.obstacles.filter((o) => o.id !== hit.id);
          if (s.lives <= 0) {
            s.phase = "gameover";
            if (s.score > s.bestScore) s.bestScore = s.score;
            if (!s.scoreSubmitted) {
              saveScoreRef.current(Math.floor(s.score));
              s.scoreSubmitted = true;
            }
          }
        }
      }

      // spawn obstacles
      s.spawnIn--;
      if (s.spawnIn <= 0) {
        const laneX = LANES[Math.floor(Math.random() * LANES.length)];
        s.obstacles.push({ depth: 0, laneX, color: OBS_COLORS[Math.floor(Math.random() * OBS_COLORS.length)], id: s.nextId++ });
        let iv = SPAWN_MIN + Math.round(Math.random() * (SPAWN_MAX - SPAWN_MIN));
        if (s.speed > MAX_SPEED * 0.5) iv = Math.round(iv * 0.65);
        s.spawnIn = Math.max(30, iv);
      }

      // spawn balls
      s.ballSpawnIn--;
      if (s.ballSpawnIn <= 0) {
        const laneX = LANES[Math.floor(Math.random() * LANES.length)];
        const occupied = s.balls.some((b) => b.laneX === laneX && b.depth < 0.3);
        if (!occupied) {
          s.balls.push({ depth: 0, laneX, id: s.nextId++ });
        }
        s.ballSpawnIn = 45 + Math.round(Math.random() * 30);
      }
    }

    // ── Render ─────────────────────────────────────────────────────────

    if (s.phase === "title") {
      s.trackPos += 0.28;
      drawTitleScreen(ctx, s.tick, s.trackPos, s.bestScore, LEVEL_THEMES[0]);
    } else if (s.phase === "playing") {
      const theme = getTheme(s);
      drawSky(ctx, theme);
      drawRoad(ctx, s.trackPos, s.carX, theme);

      const curve = getCurve(s.trackPos);

      // balls far→near
      const sortedBalls = [...s.balls].sort((a, b) => a.depth - b.depth);
      for (const b of sortedBalls) {
        const t = 1 - b.depth;
        const curveOffset = curve * CURVE_STR * t;
        const sx = W / 2 + (b.laneX - s.carX) * BASE_HW * b.depth + curveOffset;
        const sy = HORIZON_Y + b.depth * N_ROWS;
        drawFlagBall(ctx, sx, sy, b.depth, s.tick, b.id, theme.ball);
      }

      // obstacles far→near
      const sortedObs = [...s.obstacles].sort((a, b) => a.depth - b.depth);
      for (const obs of sortedObs) {
        const t = 1 - obs.depth;
        const curveOffset = curve * CURVE_STR * t;
        const sx = W / 2 + (obs.laneX - s.carX) * BASE_HW * obs.depth + curveOffset;
        const sy = HORIZON_Y + obs.depth * N_ROWS;
        drawObstacleCar(ctx, sx, sy, obs.depth, obs.color);
      }

      drawPlayerCar(ctx, s.invincible);
      drawHUD(ctx, s.score, s.lives, s.level, s.ballsCollected, s.bestScore, theme);

      if (s.invincible > INVINCIBLE_FRAMES - 15) {
        const flashAlpha = ((s.invincible - (INVINCIBLE_FRAMES - 15)) / 15) * 0.55;
        ctx.fillStyle = `rgba(255,40,40,${flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
      }
    } else if (s.phase === "gameover") {
      const theme = getTheme(s);
      drawSky(ctx, theme);
      drawRoad(ctx, s.trackPos, s.carX, theme);
      drawGameOver(ctx, s.score, s.bestScore, s.level, s.tick, theme);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [getTheme, playMusic, stopMusic]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

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

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top)  * (H / rect.height);

    if (s.phase === "title") {
      if (cx >= W / 2 - 100 && cx <= W / 2 + 100 && cy >= 360 && cy <= 416) {
        Object.assign(s, makeInitialState(s.bestScore), { phase: "playing" });
      }
    } else if (s.phase === "gameover") {
      if (cx >= W / 2 - 110 && cx <= W / 2 + 110 && cy >= 360 && cy <= 416) {
        Object.assign(s, makeInitialState(s.bestScore), { phase: "playing" });
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
      if (cx >= W / 2 - 100 && cx <= W / 2 + 100 && cy >= 360 && cy <= 416) {
        Object.assign(s, makeInitialState(s.bestScore), { phase: "playing" });
      }
      return;
    }
    if (s.phase === "gameover") {
      if (cx >= W / 2 - 110 && cx <= W / 2 + 110 && cy >= 360 && cy <= 416) {
        Object.assign(s, makeInitialState(s.bestScore), { phase: "playing" });
      }
      return;
    }
    s.touchX = cx;
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (stateRef.current.phase !== "playing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    stateRef.current.touchX = (e.touches[0].clientX - rect.left) * (W / rect.width);
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    stateRef.current.touchX = null;
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100dvh", background:"#0a0520", padding:"1rem" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ border:"3px solid rgba(255,102,0,0.3)", borderRadius:"0.75rem", boxShadow:"0 0 40px rgba(255,102,0,0.15), 0 0 80px rgba(255,50,50,0.08)", maxWidth:"100%", maxHeight:"calc(100dvh - 120px)", touchAction:"none", cursor:"default", display:"block" }}
      />
      <p style={{ marginTop:"0.75rem", fontSize:"0.7rem", color:"#ffffff44", fontFamily:"'Baloo 2', sans-serif", letterSpacing:"0.1em" }}>
        ← → ARROW KEYS · COLLECT FLAG BALLS · AVOID CARS
      </p>
    </div>
  );
}
