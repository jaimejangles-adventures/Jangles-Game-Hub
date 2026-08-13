import { useEffect, useRef, useCallback } from "react";
import { useArcadeSession } from "@/lib/arcade-session-context";
import { useScore } from "@/hooks/use-score";

// ── Constants ─────────────────────────────────────────────────────────────────
const W = 480;
const H = 640;
const HORIZON_Y = 200;
const N_ROWS = H - HORIZON_Y;
const BASE_HW = 210;
const CURVE_STR = 90;
const CAR_MAX_X = 0.85;
const STEER_ACCEL = 0.0032;       // lateral acceleration while holding a direction
const STEER_FRICTION = 0.84;      // velocity kept each frame — smooth accel/coast instead of an instant snap
const CURVE_DRIFT_ACCEL = 0.0022; // how hard a curve pulls the car off-line if you don't counter-steer

const NUM_LAPS = 3;
const TRACK_LENGTH = 2800;
const TOTAL_RACE = TRACK_LENGTH * NUM_LAPS;

// How far ahead (in trackPos units) the view shows.
// AI cars beyond this are near the horizon; below 0 = behind player.
const VISIBLE_AHEAD = 400;
// Cars the player just overtook stay visible (fading out) for this many
// trackPos units behind, instead of blinking off-screen the instant they're passed.
const REAR_FADE = 70;

const PLAYER_MAX_SPEED = 0.021;
const PLAYER_ACCEL    = 0.000090;
const AI_ACCEL         = 0.000075; // standing-start ramp-up rate
const AI_CATCHUP_ACCEL = 0.0006;   // rate an AI closes the gap when rubber-banding back into view

// Collision: only same-lane AND very close-depth triggers slowdown
const COLLISION_WIDTH     = 0.27;   // tight – pass cleanly by moving one lane over
const COLLISION_DEPTH_MIN = 0.91;   // only when < ~32 units ahead
const COLLISION_COOLDOWN  = 80;
const SLOWDOWN_FRAMES     = 10;

const COUNTDOWN_GO  = 130; // frame when GO! fires
const COUNTDOWN_END = 160;

const LANES = [-0.55, 0, 0.55];

// ── Circuit themes ─────────────────────────────────────────────────────────────
interface Circuit {
  skyTop: string; skyBot: string;
  grass1: string; grass2: string;
  road1: string;  road2: string;
  curb: string;   stripe: string;
  glow: string;
  country: string;
  music: string;
}

const CIRCUITS: Circuit[] = [
  { skyTop:"#0d1a3e", skyBot:"#1a2855", grass1:"#1a3a2a", grass2:"#0d2218",
    road1:"#2a2535", road2:"#1e1a28", curb:"#cc3322", stripe:"#f0c060",
    glow:"rgba(240,180,60,0.40)", country:"USA", music:"NEW ORLEANS.wav" },
  { skyTop:"#1a7ab5", skyBot:"#4fb8e8", grass1:"#2a8a2a", grass2:"#1a6a1a",
    road1:"#c8a870", road2:"#a88850", curb:"#dd2222", stripe:"#ffffff",
    glow:"rgba(80,200,100,0.32)", country:"MEXICO", music:"MEXICO.wav" },
  { skyTop:"#5088c0", skyBot:"#88b8dc", grass1:"#3a8030", grass2:"#2a6020",
    road1:"#c8a870", road2:"#a88850", curb:"#cc2222", stripe:"#f0e8d0",
    glow:"rgba(200,160,80,0.30)", country:"ITALY", music:"ITALY.wav" },
  { skyTop:"#6090b0", skyBot:"#90b8cc", grass1:"#3a6030", grass2:"#2a4820",
    road1:"#787060", road2:"#585048", curb:"#cc2222", stripe:"#f0f0f0",
    glow:"rgba(160,140,100,0.30)", country:"UK", music:"UK.wav" },
  { skyTop:"#3888cc", skyBot:"#70b8e8", grass1:"#c07870", grass2:"#a05850",
    road1:"#c8bca0", road2:"#a89c80", curb:"#cc2222", stripe:"#f8f0e0",
    glow:"rgba(220,80,80,0.36)", country:"SPAIN", music:"SPAIN1.2.wav" },
  { skyTop:"#5090c0", skyBot:"#90c0e0", grass1:"#2a7030", grass2:"#1a5020",
    road1:"#b89a70", road2:"#987850", curb:"#f8a0b0", stripe:"#f0e0c0",
    glow:"rgba(240,160,80,0.36)", country:"FRANCE", music:"FRANCE.wav" },
  { skyTop:"#88b8c8", skyBot:"#b8d8e0", grass1:"#2a7888", grass2:"#1a5868",
    road1:"#506878", road2:"#384858", curb:"#cc2222", stripe:"#f0f0f0",
    glow:"rgba(80,180,200,0.36)", country:"JAPAN", music:"JAPAN.wav" },
  { skyTop:"#38a0d8", skyBot:"#70c8e8", grass1:"#90b840", grass2:"#70981a",
    road1:"#c8a050", road2:"#a88030", curb:"#cc6622", stripe:"#f8e880",
    glow:"rgba(240,180,40,0.36)", country:"KENYA", music:"KENYA.wav" },
  { skyTop:"#38a8e0", skyBot:"#70d0f0", grass1:"#2a9060", grass2:"#1a7040",
    road1:"#d8c8a0", road2:"#b8a880", curb:"#cc4488", stripe:"#ffee44",
    glow:"rgba(120,220,180,0.36)", country:"SOUTH AFRICA", music:"SOUTH AFRICA_1.2.wav" },
  { skyTop:"#1a2a60", skyBot:"#2a3a80", grass1:"#2a5080", grass2:"#1a3868",
    road1:"#3868a0", road2:"#285888", curb:"#ffffff", stripe:"#55aaff",
    glow:"rgba(60,120,220,0.42)", country:"AUSTRALIA", music:"Jamie Jangles_Daniel_Australia.wav" },
];

// ── AI definitions ─────────────────────────────────────────────────────────────
// Speeds sit close to PLAYER_MAX_SPEED (0.021) — close enough that the pack stays
// in view for the whole race instead of the player blowing past everyone on lap 1.
// Rubber banding keeps the race close without making it unbeatable.
const AI_DEFS = [
  { id: 1, name: "TURBO", color: "#ff4444", baseSpeed: 0.0178 },
  { id: 2, name: "BLITZ", color: "#44ee88", baseSpeed: 0.0164 },
  { id: 3, name: "ZOOM",  color: "#ffaa00", baseSpeed: 0.0192 },
  { id: 4, name: "FLASH", color: "#cc44ff", baseSpeed: 0.0155 },
  { id: 5, name: "SPIKE", color: "#00ccff", baseSpeed: 0.0172 },
];

// P1=ZOOM, P2=TURBO, P3=SPIKE ahead, player=P4, P5/P6 behind.
// Each starting lane is unique so nobody blocks all three at once.
const GRID_SLOTS = [
  { aiDefIdx: 2, offset: +170, lane: -0.55 }, // P1: ZOOM (far ahead, left)
  { aiDefIdx: 0, offset: +110, lane:  0.55 }, // P2: TURBO (medium, right)
  { aiDefIdx: 4, offset: +80,  lane:  0.0  }, // P3: SPIKE (close, center)
  // P4 = PLAYER (0, center lane at start)
  { aiDefIdx: 1, offset: -70,  lane:  0.55 }, // P5: BLITZ (behind)
  { aiDefIdx: 3, offset: -130, lane: -0.55 }, // P6: FLASH (further behind)
];

// ── Types ──────────────────────────────────────────────────────────────────────
type Phase = "title" | "countdown" | "racing" | "finished";

interface AICar {
  id: number;
  name: string;
  color: string;
  baseSpeed: number;
  trackPos: number;
  laneX: number;
  targetLaneX: number;
  changeLaneIn: number;
  speed: number;
  finished: boolean;
  finishRank: number;
}

interface Finisher {
  name: string;
  color: string;
  rank: number;
  isPlayer: boolean;
}

interface StandingEntry {
  name: string;
  color: string;
  trackPos: number;
  isPlayer: boolean;
}

interface GPState {
  phase: Phase;
  carX: number;
  carVX: number;
  playerSpeed: number;
  playerTrackPos: number;
  roadScrollPos: number;
  playerLap: number;

  aiCars: AICar[];
  circuitIdx: number;

  countdownTick: number;
  collisionCooldown: number;
  slowdownLeft: number;
  collisionFlash: number;

  lapFlashTick: number;
  lapFlashLabel: string;

  playerFinishRank: number;
  finishers: Finisher[];
  numFinished: number;
  finishTick: number;

  bestRank: number;
  leftDown: boolean;
  rightDown: boolean;
  touchX: number | null;
  tick: number;
  scoreSubmitted: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getCurve(pos: number): number {
  return Math.sin(pos * 0.013) * 0.7 + Math.sin(pos * 0.031) * 0.3;
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function positionColor(rank: number): string {
  if (rank === 1) return "#ffd700";
  if (rank === 2) return "#c0c0c0";
  if (rank === 3) return "#cd7f32";
  return "#ffffff";
}

function calcPosition(playerTrackPos: number, aiCars: AICar[]): number {
  let rank = 1;
  for (const ai of aiCars) {
    if (ai.finished || ai.trackPos > playerTrackPos) rank++;
  }
  return clamp(rank, 1, 6);
}

function getLiveStandings(playerTrackPos: number, aiCars: AICar[]): StandingEntry[] {
  const entries: StandingEntry[] = [
    { name: "YOU", color: "#0044ff", trackPos: playerTrackPos, isPlayer: true },
    ...aiCars.map(ai => ({ name: ai.name, color: ai.color, trackPos: ai.finished ? Infinity : ai.trackPos, isPlayer: false })),
  ];
  return entries.sort((a, b) => b.trackPos - a.trackPos);
}

function makeAICars(): AICar[] {
  return GRID_SLOTS.map(slot => {
    const def = AI_DEFS[slot.aiDefIdx];
    return {
      id: def.id, name: def.name, color: def.color, baseSpeed: def.baseSpeed,
      trackPos: slot.offset,
      laneX: slot.lane, targetLaneX: slot.lane,
      changeLaneIn: 80 + Math.floor(Math.random() * 80),
      speed: 0, finished: false, finishRank: 0,
    };
  });
}

function makeState(bestRank = 0): GPState {
  return {
    phase: "title", carX: 0, carVX: 0, playerSpeed: 0, playerTrackPos: 0,
    roadScrollPos: 0, playerLap: 1,
    aiCars: makeAICars(),
    circuitIdx: Math.floor(Math.random() * CIRCUITS.length),
    countdownTick: 0,
    collisionCooldown: 0, slowdownLeft: 0, collisionFlash: 0,
    lapFlashTick: 0, lapFlashLabel: "",
    playerFinishRank: 0, finishers: [], numFinished: 0, finishTick: 0,
    bestRank,
    leftDown: false, rightDown: false, touchX: null,
    tick: 0, scoreSubmitted: false,
  };
}

// ── Draw: sky ─────────────────────────────────────────────────────────────────
function drawSky(ctx: CanvasRenderingContext2D, c: Circuit) {
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
  sky.addColorStop(0, c.skyTop);
  sky.addColorStop(1, c.skyBot);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, HORIZON_Y);
  const glow = ctx.createLinearGradient(0, HORIZON_Y - 22, 0, HORIZON_Y);
  glow.addColorStop(0, "rgba(0,0,0,0)");
  glow.addColorStop(1, c.glow);
  ctx.fillStyle = glow;
  ctx.fillRect(0, HORIZON_Y - 22, W, 22);
}

// ── Draw: road ────────────────────────────────────────────────────────────────
function drawRoad(ctx: CanvasRenderingContext2D, scrollPos: number, carX: number, c: Circuit) {
  const curve = getCurve(scrollPos);
  for (let i = 0; i < N_ROWS; i++) {
    const t = i / N_ROWS;
    const scale = 1 - t;
    const y = H - 1 - i;
    const curveOffset = curve * CURVE_STR * t;
    const cx = W / 2 - carX * BASE_HW * scale + curveOffset;
    const hw = BASE_HW * scale;
    const stripe = Math.floor(Math.sqrt(t) * 28 + scrollPos * 1.1) % 2;

    ctx.fillStyle = stripe ? c.grass1 : c.grass2;
    ctx.fillRect(0, y, W, 1);
    if (hw < 1) continue;
    ctx.fillStyle = stripe ? c.road1 : c.road2;
    ctx.fillRect(Math.round(cx - hw), y, Math.max(1, Math.round(hw * 2)), 1);
    if (hw > 3) {
      const rw = Math.max(2, Math.round(hw * 0.11));
      ctx.fillStyle = stripe ? c.curb : c.stripe;
      ctx.fillRect(Math.round(cx - hw), y, rw, 1);
      ctx.fillRect(Math.round(cx + hw - rw), y, rw, 1);
    }
    if (hw > 10 && !stripe && Math.floor(Math.sqrt(t) * 28 + scrollPos * 1.1) % 6 < 3) {
      const dw = Math.max(1, Math.round(hw * 0.04));
      ctx.fillStyle = "#ffffff55";
      ctx.fillRect(Math.round(cx - dw / 2), y, dw, 1);
    }
  }
}

// ── Draw: AI car ──────────────────────────────────────────────────────────────
function drawAICar(
  ctx: CanvasRenderingContext2D,
  sx: number, sy: number, scale: number,
  color: string, number: number, name: string
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

  if (scale > 0.32) {
    const bw = Math.round(14 * scale);
    const bh = Math.round(11 * scale);
    const bx = Math.round(sx - bw / 2);
    const by = y + Math.round(h * 0.07);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = "#000000";
    ctx.font = `bold ${Math.round(9 * scale)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(number), sx, by + bh / 2);
  }
  if (scale > 0.68) {
    ctx.fillStyle = "#ffffffcc";
    ctx.font = `bold ${Math.round(7 * scale)}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(name, sx, y - 2);
  }
  ctx.restore();
}

// ── Draw: player car ──────────────────────────────────────────────────────────
function drawPlayerCar(ctx: CanvasRenderingContext2D, flash: number) {
  if (flash > 0 && Math.floor(flash / 5) % 2 === 0) return;
  const cx = W / 2, cy = H - 58, w = 54, h = 82;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.30)";
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

// ── Draw: HUD ─────────────────────────────────────────────────────────────────
function drawHUD(
  ctx: CanvasRenderingContext2D,
  lap: number, position: number, circuit: Circuit,
  standings: StandingEntry[],
  lapFlashTick: number, lapFlashLabel: string
) {
  ctx.save();

  // Lap box (top-left)
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillRect(8, 8, 112, 52);
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 112, 52);
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 10px 'Baloo 2', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("LAP", 16, 13);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px 'Baloo 2', monospace";
  ctx.fillText(`${Math.min(lap, NUM_LAPS)}/${NUM_LAPS}`, 46, 11);
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "bold 9px 'Baloo 2', monospace";
  ctx.fillText(circuit.country, 16, 43);

  // Position badge (top-center)
  const pc = positionColor(position);
  ctx.fillStyle = "rgba(0,0,0,0.78)";
  ctx.fillRect(W / 2 - 52, 8, 104, 56);
  ctx.strokeStyle = pc;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(W / 2 - 52, 8, 104, 56);
  ctx.fillStyle = "#888888";
  ctx.font = "bold 9px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("POSITION", W / 2, 13);
  ctx.fillStyle = pc;
  ctx.shadowColor = pc;
  ctx.shadowBlur = 12;
  ctx.font = "bold 36px 'Baloo 2', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(`P${position}`, W / 2, 39);
  ctx.shadowBlur = 0;

  // Live standings (top-right) – real order from live data
  const standW = 86;
  const standH = 6 + standings.length * 20;
  const standX = W - standW - 6;
  ctx.fillStyle = "rgba(0,0,0,0.70)";
  ctx.fillRect(standX, 8, standW, standH);
  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(standX, 8, standW, standH);

  for (let i = 0; i < standings.length; i++) {
    const s = standings[i];
    const sy = 8 + 4 + i * 20;
    const isPlayer = s.isPlayer;

    // color dot
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(standX + 9, sy + 8, 4, 0, Math.PI * 2);
    ctx.fill();

    // rank + name
    ctx.fillStyle = isPlayer ? pc : (i < 3 ? "#dddddd" : "#888888");
    ctx.font = isPlayer ? "bold 10px 'Baloo 2', monospace" : "9px 'Baloo 2', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`P${i + 1} ${isPlayer ? "YOU" : s.name}`, standX + 17, sy + 8);
  }

  // Lap flash overlay
  if (lapFlashTick > 0) {
    const fade = clamp(lapFlashTick / 30, 0, 1);
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#ffcc00";
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 32;
    ctx.font = "bold 54px 'Baloo 2', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(lapFlashLabel, W / 2, H / 2 - 40);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ── Draw: countdown overlay ───────────────────────────────────────────────────
function drawCountdown(ctx: CanvasRenderingContext2D, tick: number, circuit: Circuit) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // dark band at top showing circuit name
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0, 0, W, 48);
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 13px 'Baloo 2', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(`CIRCUIT: ${circuit.country}  ·  ${NUM_LAPS} LAPS`, W / 2, 16);
  ctx.fillStyle = "#ffffff88";
  ctx.font = "10px 'Baloo 2', monospace";
  ctx.fillText("JANGLES GRAND PRIX", W / 2, 34);

  let text = "3", color = "#ff4444";
  if (tick >= 50 && tick < 100) { text = "2"; color = "#ffaa00"; }
  else if (tick >= 100 && tick < COUNTDOWN_GO) { text = "1"; color = "#44ff88"; }
  else if (tick >= COUNTDOWN_GO) { text = "GO!"; color = "#ffffff"; }

  const pulse = 0.82 + 0.18 * Math.sin(tick * 0.28);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 44;
  ctx.font = "bold 88px 'Baloo 2', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, H / 2);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── Draw: title screen ─────────────────────────────────────────────────────────
function drawTitle(ctx: CanvasRenderingContext2D, tick: number, scrollPos: number, circuit: Circuit, bestRank: number) {
  drawSky(ctx, circuit);
  drawRoad(ctx, scrollPos, 0, circuit);

  ctx.fillStyle = "rgba(5,2,20,0.80)";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const pulse = 0.88 + 0.12 * Math.sin(tick * 0.06);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = "#ffcc00";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 28;
  ctx.font = "bold 62px 'Baloo 2', monospace";
  ctx.fillText("JANGLES", W / 2, 126);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ff3333";
  ctx.shadowColor = "#ff3333";
  ctx.shadowBlur = 22;
  ctx.font = "bold 62px 'Baloo 2', monospace";
  ctx.fillText("GP", W / 2, 192);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff77";
  ctx.font = "12px 'Baloo 2', monospace";
  ctx.fillText("5 AI OPPONENTS · 3 LAPS · RACE TO WIN", W / 2, 248);

  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 14px 'Baloo 2', monospace";
  ctx.fillText(`CIRCUIT: ${circuit.country}`, W / 2, 276);

  if (bestRank > 0) {
    ctx.fillStyle = positionColor(bestRank);
    ctx.font = "bold 12px 'Baloo 2', monospace";
    ctx.fillText(`BEST FINISH: P${bestRank}`, W / 2, 302);
  }

  ctx.fillStyle = "#ffffff44";
  ctx.font = "11px 'Baloo 2', monospace";
  ctx.fillText("← → ARROW KEYS TO STEER", W / 2, 330);

  ctx.fillStyle = "#ff3333";
  ctx.shadowColor = "#ff3333";
  ctx.shadowBlur = 22;
  ctx.fillRect(W / 2 - 108, 366, 216, 58);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px 'Baloo 2', monospace";
  ctx.fillText("START RACE!", W / 2, 366 + 29);
  ctx.restore();
}

// ── Draw: podium / finish ──────────────────────────────────────────────────────
function drawFinish(
  ctx: CanvasRenderingContext2D,
  finishers: Finisher[], playerRank: number,
  circuit: Circuit, tick: number, bestRank: number
) {
  ctx.fillStyle = "rgba(5,2,20,0.94)";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = positionColor(playerRank);
  ctx.shadowColor = positionColor(playerRank);
  ctx.shadowBlur = 26;
  ctx.font = "bold 42px 'Baloo 2', monospace";
  ctx.fillText(`YOU FINISHED P${playerRank}!`, W / 2, 76);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ffffff66";
  ctx.font = "11px 'Baloo 2', monospace";
  ctx.fillText(`${circuit.country} GRAND PRIX`, W / 2, 112);

  if (bestRank > 0 && playerRank <= bestRank) {
    const gp = 0.6 + 0.4 * Math.sin(tick * 0.12);
    ctx.globalAlpha = gp;
    ctx.fillStyle = "#ffcc00";
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 14;
    ctx.font = "bold 13px 'Baloo 2', monospace";
    ctx.fillText("✦ NEW BEST! ✦", W / 2, 136);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Podium blocks
  const podiumCols = [W / 2 - 112, W / 2, W / 2 + 112];
  const podiumHeights = [88, 116, 66];
  const podiumRanks = [2, 1, 3];
  const podiumBaseY = 300;

  for (let col = 0; col < 3; col++) {
    const rank = podiumRanks[col];
    const ph = podiumHeights[col];
    const px = podiumCols[col];
    const finisher = finishers.find(f => f.rank === rank);

    ctx.fillStyle = rank === 1 ? "#3a2a00" : rank === 2 ? "#2a2a2a" : "#2a1a00";
    ctx.fillRect(px - 40, podiumBaseY, 80, ph);
    ctx.strokeStyle = positionColor(rank);
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 40, podiumBaseY, 80, ph);

    ctx.fillStyle = positionColor(rank);
    ctx.font = `bold ${rank === 1 ? 34 : 26}px 'Baloo 2', monospace`;
    ctx.textBaseline = "middle";
    ctx.fillText(`P${rank}`, px, podiumBaseY + ph / 2);

    if (finisher) {
      const label = finisher.isPlayer ? "YOU" : finisher.name;
      ctx.fillStyle = finisher.color;
      ctx.shadowColor = finisher.isPlayer ? finisher.color : "transparent";
      ctx.shadowBlur = finisher.isPlayer ? 14 : 0;
      ctx.font = `bold ${finisher.isPlayer ? 13 : 11}px 'Baloo 2', monospace`;
      ctx.textBaseline = "bottom";
      ctx.fillText(label, px, podiumBaseY - 6);
      ctx.shadowBlur = 0;

      // mini car icon
      const sc = rank === 1 ? 0.52 : 0.40;
      const carY = podiumBaseY - 42;
      if (finisher.isPlayer) {
        ctx.fillStyle = "#cc0000";
        ctx.fillRect(px - Math.round(12*sc), carY - Math.round(18*sc), Math.round(24*sc), Math.round(4*sc));
        ctx.fillStyle = "#0044ff";
        ctx.fillRect(px - Math.round(8*sc), carY - Math.round(14*sc), Math.round(16*sc), Math.round(26*sc));
      } else {
        ctx.fillStyle = finisher.color;
        ctx.fillRect(px - Math.round(10*sc), carY - Math.round(16*sc), Math.round(20*sc), Math.round(30*sc));
        ctx.fillStyle = "#00002288";
        ctx.fillRect(px - Math.round(6*sc), carY - Math.round(12*sc), Math.round(12*sc), Math.round(12*sc));
      }
    }
  }

  // Full standings
  ctx.textBaseline = "top";
  for (let r = 1; r <= Math.min(finishers.length, 6); r++) {
    const f = finishers.find(x => x.rank === r);
    if (!f) continue;
    const fy = 428 + (r - 1) * 17;
    ctx.fillStyle = f.isPlayer ? positionColor(r) : (r <= 3 ? "#aaaaaa" : "#666666");
    ctx.textAlign = "left";
    ctx.font = `${f.isPlayer ? "bold " : ""}10px 'Baloo 2', monospace`;
    ctx.fillText(`P${r}  ${f.isPlayer ? "YOU" : f.name}${f.isPlayer ? "  ◂" : ""}`, W / 2 - 60, fy);
  }

  // Play again button
  ctx.fillStyle = "#ffcc00";
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 16;
  ctx.fillRect(W / 2 - 108, 536, 216, 52);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0520";
  ctx.font = "bold 22px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("RACE AGAIN!", W / 2, 536 + 26);
  ctx.restore();
}

// ── Component ──────────────────────────────────────────────────────────────────
export function JanglesGPGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef<GPState>(makeState());
  const rafRef    = useRef<number>(0);

  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const lastMusicRef = useRef<string>("");

  const { endSession } = useArcadeSession();
  const endSessionRef  = useRef(endSession);
  useEffect(() => { endSessionRef.current = endSession; }, [endSession]);

  const { saveScore } = useScore("jangles-gp");
  const saveScoreRef  = useRef(saveScore);
  useEffect(() => { saveScoreRef.current = saveScore; }, [saveScore]);

  const stopMusic = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    lastMusicRef.current = "";
  }, []);

  const playMusic = useCallback((filename: string) => {
    if (lastMusicRef.current === filename) return;
    lastMusicRef.current = filename;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    const a = new Audio(`/music/${encodeURIComponent(filename)}`);
    a.loop = true; a.volume = 0.55;
    a.play().catch(() => {});
    audioRef.current = a;
  }, []);

  useEffect(() => () => stopMusic(), [stopMusic]);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;
    s.tick++;

    const circuit = CIRCUITS[s.circuitIdx];

    // ── Title ────────────────────────────────────────────────────────────
    if (s.phase === "title") {
      s.roadScrollPos += 0.22;
      playMusic("THEME_003_1.1.wav");
      drawTitle(ctx, s.tick, s.roadScrollPos, circuit, s.bestRank);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // ── Countdown ────────────────────────────────────────────────────────
    if (s.phase === "countdown") {
      s.countdownTick++;
      drawSky(ctx, circuit);
      drawRoad(ctx, s.roadScrollPos, s.carX, circuit);

      // Draw only AI cars that are AHEAD (relDist > 0) during countdown
      const curve = getCurve(s.roadScrollPos);
      const sorted = [...s.aiCars].sort((a, b) => a.trackPos - b.trackPos);
      for (const ai of sorted) {
        const relDist = ai.trackPos - s.playerTrackPos;
        if (relDist <= 0 || relDist > VISIBLE_AHEAD) continue;
        const depth = clamp(1 - relDist / VISIBLE_AHEAD, 0, 1);
        const t = 1 - depth;
        const curveOffset = curve * CURVE_STR * t;
        const sx = W / 2 + (ai.laneX - s.carX) * BASE_HW * depth + curveOffset;
        const sy = HORIZON_Y + depth * N_ROWS;
        drawAICar(ctx, sx, sy, depth, ai.color, ai.id, ai.name);
      }
      drawPlayerCar(ctx, 0);
      drawCountdown(ctx, s.countdownTick, circuit);

      if (s.countdownTick >= COUNTDOWN_END) {
        s.phase = "racing";
        playMusic(circuit.music);
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // ── Finished ─────────────────────────────────────────────────────────
    if (s.phase === "finished") {
      s.finishTick++;
      drawSky(ctx, circuit);
      drawRoad(ctx, s.roadScrollPos, s.carX, circuit);
      drawPlayerCar(ctx, 0);
      drawFinish(ctx, s.finishers, s.playerFinishRank, circuit, s.finishTick, s.bestRank);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // ── Racing ────────────────────────────────────────────────────────────
    playMusic(circuit.music);

    // Player steering
    if (s.leftDown)  s.carVX -= STEER_ACCEL;
    if (s.rightDown) s.carVX += STEER_ACCEL;
    s.carVX *= STEER_FRICTION;
    // Curves pull the car off-line as an actual force — has to be countered by steering,
    // and pulls harder the faster you're going, instead of a flat nudge that's basically invisible.
    s.carVX -= getCurve(s.roadScrollPos) * CURVE_DRIFT_ACCEL * (s.playerSpeed / PLAYER_MAX_SPEED);
    s.carX = clamp(s.carX + s.carVX, -CAR_MAX_X, CAR_MAX_X);
    if (s.carX <= -CAR_MAX_X && s.carVX < 0) s.carVX = 0;
    if (s.carX >=  CAR_MAX_X && s.carVX > 0) s.carVX = 0;

    // Player speed
    if (s.slowdownLeft > 0) {
      s.slowdownLeft--;
      // Slow to 65% max during collision recovery
      s.playerSpeed = Math.max(s.playerSpeed - 0.0003, PLAYER_MAX_SPEED * 0.65);
    } else {
      s.playerSpeed = Math.min(s.playerSpeed + PLAYER_ACCEL, PLAYER_MAX_SPEED);
    }
    s.roadScrollPos  += s.playerSpeed * 100;
    s.playerTrackPos += s.playerSpeed * 100;

    // Lap counting
    const newLap = Math.floor(s.playerTrackPos / TRACK_LENGTH) + 1;
    if (newLap > s.playerLap && newLap <= NUM_LAPS) {
      s.playerLap = newLap;
      s.lapFlashTick = 90;
      s.lapFlashLabel = `LAP ${newLap}`;
    }
    if (s.lapFlashTick > 0) s.lapFlashTick--;

    // Player finish
    if (s.playerTrackPos >= TOTAL_RACE && s.playerFinishRank === 0) {
      const rank = s.numFinished + 1;
      s.playerFinishRank = rank;
      s.numFinished++;
      s.finishers.push({ name: "YOU", color: "#0044ff", rank, isPlayer: true });

      // Resolve remaining AI in current order
      const remaining = s.aiCars.filter(ai => !ai.finished)
        .sort((a, b) => b.trackPos - a.trackPos);
      for (const ai of remaining) {
        const r = s.numFinished + 1;
        s.numFinished++;
        ai.finished = true;
        ai.finishRank = r;
        s.finishers.push({ name: ai.name, color: ai.color, rank: r, isPlayer: false });
      }

      if (!s.scoreSubmitted) {
        saveScoreRef.current((7 - rank) * 1000);
        s.scoreSubmitted = true;
      }
      if (s.bestRank === 0 || rank < s.bestRank) s.bestRank = rank;

      stopMusic();
      s.phase = "finished";
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // ── AI update ─────────────────────────────────────────────────────────
    if (s.collisionCooldown > 0) s.collisionCooldown--;
    if (s.collisionFlash   > 0) s.collisionFlash--;

    for (const ai of s.aiCars) {
      if (ai.finished) continue;

      // Accelerate toward base speed from a standing start. Guarded to only fire while under
      // baseSpeed — unconditionally re-running this every frame used to reset any rubber-band
      // boost straight back down before it could compound, which is why catch-up never worked.
      if (ai.speed < ai.baseSpeed) ai.speed = Math.min(ai.speed + AI_ACCEL, ai.baseSpeed);

      // Rubber band: if far behind player, speed up to catch back into view; far ahead, slow a bit.
      // Kicks in sooner and pulls harder than before so a passed car doesn't just vanish for good.
      const gap = ai.trackPos - s.playerTrackPos;
      if (gap >  400) ai.speed = Math.max(ai.speed - AI_ACCEL, ai.baseSpeed * 0.82);
      if (gap < -150) ai.speed = Math.min(ai.speed + AI_CATCHUP_ACCEL, ai.baseSpeed * 1.22);

      // Small random variation to make racing feel natural
      ai.speed += (Math.random() - 0.5) * 0.0003;
      // Ceiling has to clear the gap<-150 catch-up target above, or this clamp silently cancels it out.
      ai.speed = clamp(ai.speed, ai.baseSpeed * 0.80, ai.baseSpeed * 1.25);

      ai.trackPos += ai.speed * 100;

      // Lane changes: pick a lane nobody ahead is using, then move decisively
      ai.changeLaneIn--;
      if (ai.changeLaneIn <= 0) {
        // Prefer lanes not occupied by another AI within 120 units ahead
        const freeLanes = LANES.filter(lx => {
          return !s.aiCars.some(other =>
            other !== ai && !other.finished &&
            Math.abs(other.laneX - lx) < 0.25 &&
            other.trackPos > ai.trackPos &&
            other.trackPos - ai.trackPos < 120
          );
        });
        // Also avoid player lane if player is just ahead
        const playerAhead = s.playerTrackPos > ai.trackPos && s.playerTrackPos - ai.trackPos < 120;
        const filtered = playerAhead ? freeLanes.filter(lx => Math.abs(lx - s.carX) > 0.3) : freeLanes;
        const pick = (filtered.length > 0 ? filtered : freeLanes);
        if (pick.length > 0) {
          ai.targetLaneX = pick[Math.floor(Math.random() * pick.length)];
        }
        ai.changeLaneIn = 90 + Math.floor(Math.random() * 70);
      }

      // Move toward target lane
      const step = 0.030;
      if (Math.abs(ai.laneX - ai.targetLaneX) > step) {
        ai.laneX += Math.sign(ai.targetLaneX - ai.laneX) * step;
      } else {
        ai.laneX = ai.targetLaneX;
      }

      // AI finish
      if (!ai.finished && ai.trackPos >= TOTAL_RACE) {
        ai.finished = true;
        const r = s.numFinished + 1;
        ai.finishRank = r;
        s.numFinished++;
        s.finishers.push({ name: ai.name, color: ai.color, rank: r, isPlayer: false });
      }
    }

    // ── Collision: player vs AI cars AHEAD only ───────────────────────────
    if (s.collisionCooldown === 0) {
      for (const ai of s.aiCars) {
        if (ai.finished) continue;
        const relDist = ai.trackPos - s.playerTrackPos;
        // Only cars ahead of player can cause a collision
        if (relDist <= 0 || relDist > VISIBLE_AHEAD) continue;
        const depth = 1 - relDist / VISIBLE_AHEAD;
        if (depth >= COLLISION_DEPTH_MIN && Math.abs(ai.laneX - s.carX) < COLLISION_WIDTH) {
          s.slowdownLeft = SLOWDOWN_FRAMES;
          s.collisionCooldown = COLLISION_COOLDOWN;
          s.collisionFlash = 18;
          // Push player sideways away from the AI car as a velocity impulse (resolved smoothly
          // over the next few frames by friction) instead of an instant position teleport.
          const pushDir = s.carX <= ai.laneX ? -1 : 1;
          s.carVX += pushDir * 0.045;
          break;
        }
      }
    }

    // ── Render ────────────────────────────────────────────────────────────
    drawSky(ctx, circuit);
    drawRoad(ctx, s.roadScrollPos, s.carX, circuit);

    const curve = getCurve(s.roadScrollPos);

    // Draw AI cars: cars ahead (relDist > 0) render normally; cars just overtaken
    // (relDist slightly negative) stay visible, fading out, instead of blinking off-screen.
    const sortedAI = [...s.aiCars].sort((a, b) => a.trackPos - b.trackPos);
    for (const ai of sortedAI) {
      if (ai.finished) continue;
      const relDist = ai.trackPos - s.playerTrackPos;
      if (relDist > VISIBLE_AHEAD || relDist < -REAR_FADE) continue;

      let depth: number;
      let alpha = 1;
      if (relDist >= 0) {
        depth = clamp(1 - relDist / VISIBLE_AHEAD, 0, 1);
      } else {
        depth = 1;
        alpha = clamp(1 + relDist / REAR_FADE, 0, 1);
      }
      if (depth < 0.01) continue;

      const t = 1 - depth;
      const curveOffset = curve * CURVE_STR * t;
      const sx = W / 2 + (ai.laneX - s.carX) * BASE_HW * depth + curveOffset;
      const sy = HORIZON_Y + depth * N_ROWS;
      ctx.save();
      ctx.globalAlpha = alpha;
      drawAICar(ctx, sx, sy, depth, ai.color, ai.id, ai.name);
      ctx.restore();
    }

    drawPlayerCar(ctx, s.collisionFlash);

    // Collision screen flash
    if (s.collisionFlash > 10) {
      const alpha = ((s.collisionFlash - 10) / 8) * 0.42;
      ctx.fillStyle = `rgba(255,40,40,${alpha})`;
      ctx.fillRect(0, 0, W, H);
    }

    const position = calcPosition(s.playerTrackPos, s.aiCars);
    const standings = getLiveStandings(s.playerTrackPos, s.aiCars);
    drawHUD(ctx, s.playerLap, position, circuit, standings, s.lapFlashTick, s.lapFlashLabel);

    // Speed streak lines at edges — intensity scales with speed
    const spdFrac = clamp(s.playerSpeed / PLAYER_MAX_SPEED, 0, 1);
    if (spdFrac > 0.4) {
      ctx.save();
      ctx.globalAlpha = (spdFrac - 0.4) * 0.5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const lx = 14 + i * 7;
        ctx.beginPath(); ctx.moveTo(lx, HORIZON_Y + 30 + i * 10); ctx.lineTo(lx - 3, H - 30); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W - lx, HORIZON_Y + 30 + i * 10); ctx.lineTo(W - lx + 3, H - 30); ctx.stroke();
      }
      ctx.restore();
    }

    // Touch steering guides — faint arrows so mobile players know where to press
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px 'Baloo 2', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("◀", W * 0.12, H - 85);
    ctx.fillText("▶", W * 0.88, H - 85);
    ctx.globalAlpha = 1;
    ctx.restore();

    rafRef.current = requestAnimationFrame(tick);
  }, [playMusic, stopMusic]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const s = stateRef.current;
      if (s.phase !== "racing") return;
      if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") { s.leftDown  = down; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { s.rightDown = down; e.preventDefault(); }
    };
    const dn = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top)  * (H / rect.height);
    if (s.phase === "title") {
      if (cx >= W / 2 - 108 && cx <= W / 2 + 108 && cy >= 366 && cy <= 424) {
        const best = s.bestRank;
        Object.assign(s, makeState(best));
        s.phase = "countdown"; stopMusic();
      }
    } else if (s.phase === "finished") {
      if (cx >= W / 2 - 108 && cx <= W / 2 + 108 && cy >= 536 && cy <= 588) {
        const best = s.bestRank;
        Object.assign(s, makeState(best));
        s.phase = "countdown"; stopMusic();
      }
    }
  }, [stopMusic]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const t0 = e.touches[0];
    const cx = (t0.clientX - rect.left) * (W / rect.width);
    const cy = (t0.clientY - rect.top)  * (H / rect.height);
    if (s.phase === "title") {
      if (cx >= W / 2 - 108 && cx <= W / 2 + 108 && cy >= 366 && cy <= 424) {
        const best = s.bestRank;
        Object.assign(s, makeState(best));
        s.phase = "countdown"; stopMusic();
      }
      return;
    }
    if (s.phase === "finished") {
      if (cx >= W / 2 - 108 && cx <= W / 2 + 108 && cy >= 536 && cy <= 588) {
        const best = s.bestRank;
        Object.assign(s, makeState(best));
        s.phase = "countdown"; stopMusic();
      }
      return;
    }
    if (s.phase === "racing") {
      s.leftDown  = cx < W / 2;
      s.rightDown = cx >= W / 2;
      e.preventDefault();
    }
  }, [stopMusic]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (stateRef.current.phase !== "racing") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.touches[0].clientX - rect.left) * (W / rect.width);
    stateRef.current.leftDown  = cx < W / 2;
    stateRef.current.rightDown = cx >= W / 2;
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    stateRef.current.leftDown  = false;
    stateRef.current.rightDown = false;
    stateRef.current.touchX    = null;
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100dvh", background:"#0a0520", padding:"0.5rem" }}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          border: "3px solid rgba(255,50,50,0.35)",
          borderRadius: "0.75rem",
          boxShadow: "0 0 40px rgba(255,50,50,0.18), 0 0 80px rgba(255,200,0,0.08)",
          maxWidth: "100%",
          maxHeight: "calc(100dvh - 80px)",
          touchAction: "none",
          cursor: "default",
          display: "block",
        }}
      />
      <p style={{ marginTop:"0.5rem", fontSize:"0.65rem", color:"#ffffff44", fontFamily:"'Baloo 2', sans-serif", letterSpacing:"0.1em" }}>
        TAP LEFT / TAP RIGHT TO STEER  ·  ← → ARROW KEYS  ·  3 LAPS
      </p>
    </div>
  );
}
