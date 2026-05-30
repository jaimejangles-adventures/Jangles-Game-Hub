import { useEffect, useRef, useState, useCallback } from "react";

// ─── Audio ────────────────────────────────────────────────────────────────────
function createAudioCtx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  vol = 0.15,
  delay = 0
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration + 0.01);
}

function sfxMove(ctx: AudioContext) {
  playTone(ctx, 440, 0.07, "square", 0.1);
}

function sfxHit(ctx: AudioContext) {
  playTone(ctx, 120, 0.1, "sawtooth", 0.2);
  playTone(ctx, 80, 0.2, "sawtooth", 0.15, 0.08);
}

function sfxLevelComplete(ctx: AudioContext) {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => playTone(ctx, f, 0.15, "square", 0.12, i * 0.12));
}

function sfxGameOver(ctx: AudioContext) {
  const notes = [440, 349, 294, 220];
  notes.forEach((f, i) => playTone(ctx, f, 0.18, "sawtooth", 0.15, i * 0.15));
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CELL = 52;
const COLS = 13;
const ROWS = 11;
const W = CELL * COLS;
const H = CELL * ROWS;
const LEVEL_TIME = 45; // seconds per level

// ─── Level Definitions ────────────────────────────────────────────────────────
interface LaneConfig {
  row: number;
  speed: number; // cells per second (positive = right, negative = left)
  obstacleWidth: number;
  gap: number;
  color: string;
}

interface LevelDef {
  country: string;
  flag: string;
  bgTop: string;
  bgBottom: string;
  safeColor: string;
  laneColor: string;
  obstacleColor: string;
  obstacleType:
    | "van" | "sombrero" | "drum" | "flyingfish" | "llama"
    | "soccer" | "penguin" | "bus" | "balloon" | "vespa"
    | "tuktuk" | "sushi" | "sled" | "jeep" | "sailboat" | "basket";
  lanes: LaneConfig[];
  speedMult: number;
}

// ─── Lane helper ─────────────────────────────────────────────────────────────
// Generates 7 lanes (rows 2–8) scaled by a speed factor.
// gap shrinks slightly at higher levels for more challenge.
function makeLanes(
  spd: number, ow: number, gap: number,
  c1: string, c2: string
): LaneConfig[] {
  const base = [1.2, -1.0, 1.4, -0.9, 1.1, -1.3, 0.8];
  return base.map((s, i) => ({
    row: 2 + i,
    speed: s * spd,
    obstacleWidth: ow,
    gap,
    color: i % 2 === 0 ? c1 : c2,
  }));
}

// 16 levels — one per country from book pages 3–23 (omitting p14 & p17 dance)
const LEVELS: LevelDef[] = [
  // ── L1: USA, New Orleans (p6) ─ Jangles VW vans ───────────────────────────
  { country:"USA", flag:"🇺🇸", bgTop:"#0d1b3e", bgBottom:"#1a1a4e",
    safeColor:"#2c3e6b", laneColor:"#1c1c1c", obstacleColor:"#c0392b",
    obstacleType:"van", speedMult:1,
    lanes: makeLanes(1.0, 2, 6, "#1c1c1c","#2a2a2a") },

  // ── L2: Mexico, Tulum (p7) ─ Rolling sombreros ────────────────────────────
  { country:"Mexico", flag:"🇲🇽", bgTop:"#87ceeb", bgBottom:"#f5deb3",
    safeColor:"#c8e6c9", laneColor:"#d2a679", obstacleColor:"#8b4513",
    obstacleType:"sombrero", speedMult:1,
    lanes: makeLanes(1.15, 1, 6, "#d2a679","#c49a6c") },

  // ── L3: Jamaica (p8) ─ Steel drums rolling down the beach ─────────────────
  { country:"Jamaica", flag:"🇯🇲", bgTop:"#1565c0", bgBottom:"#f5deb3",
    safeColor:"#2e7d32", laneColor:"#1b5e20", obstacleColor:"#ffd600",
    obstacleType:"drum", speedMult:1,
    lanes: makeLanes(1.3, 1, 5, "#1b5e20","#388e3c") },

  // ── L4: Barbados, Oistins (p9) ─ Flying fish leaping across ───────────────
  { country:"Barbados", flag:"🇧🇧", bgTop:"#0288d1", bgBottom:"#c8a850",
    safeColor:"#4fc3f7", laneColor:"#0277bd", obstacleColor:"#e53935",
    obstacleType:"flyingfish", speedMult:1,
    lanes: makeLanes(1.45, 1, 5, "#0277bd","#0288d1") },

  // ── L5: Peru, Machu Picchu (p10) ─ Llamas trotting the ruins ──────────────
  { country:"Peru", flag:"🇵🇪", bgTop:"#546e7a", bgBottom:"#6d4c41",
    safeColor:"#8d6e63", laneColor:"#5d4037", obstacleColor:"#bcaaa4",
    obstacleType:"llama", speedMult:1,
    lanes: makeLanes(1.6, 2, 5, "#5d4037","#4e342e") },

  // ── L6: Argentina, Buenos Aires (p11) ─ Soccer balls bouncing ─────────────
  { country:"Argentina", flag:"🇦🇷", bgTop:"#74b9ff", bgBottom:"#dfe6e9",
    safeColor:"#a8d8f0", laneColor:"#5c94c8", obstacleColor:"#2c3e50",
    obstacleType:"soccer", speedMult:1,
    lanes: makeLanes(1.75, 1, 5, "#5c94c8","#4a83b7") },

  // ── L7: Antarctica (p12) ─ Penguins sliding on ice ────────────────────────
  { country:"Antarctica", flag:"🐧", bgTop:"#b3e5fc", bgBottom:"#e3f2fd",
    safeColor:"#e1f5fe", laneColor:"#81d4fa", obstacleColor:"#263238",
    obstacleType:"penguin", speedMult:1,
    lanes: makeLanes(1.9, 1, 5, "#81d4fa","#4fc3f7") },

  // ── L8: England, London (p13) ─ Red double-decker buses ───────────────────
  { country:"England", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", bgTop:"#b0bec5", bgBottom:"#78909c",
    safeColor:"#546e7a", laneColor:"#37474f", obstacleColor:"#c62828",
    obstacleType:"bus", speedMult:1,
    lanes: makeLanes(2.0, 2, 5, "#37474f","#455a64") },

  // ── L9: France, Paris (p15) ─ Hot air balloons drifting ───────────────────
  { country:"France", flag:"🇫🇷", bgTop:"#90caf9", bgBottom:"#c8e6c9",
    safeColor:"#bbdefb", laneColor:"#1565c0", obstacleColor:"#e53935",
    obstacleType:"balloon", speedMult:1,
    lanes: makeLanes(2.1, 1, 5, "#1565c0","#1976d2") },

  // ── L10: Italy (p16) ─ Vespas zipping past the Colosseum ──────────────────
  { country:"Italy", flag:"🇮🇹", bgTop:"#87ceeb", bgBottom:"#e8d5a3",
    safeColor:"#ffe082", laneColor:"#7b5e30", obstacleColor:"#c62828",
    obstacleType:"vespa", speedMult:1,
    lanes: makeLanes(2.2, 2, 4, "#8d6e40","#7b5e30") },

  // ── L11: Sri Lanka (p18) ─ Tuk-tuks weaving through the spice market ──────
  { country:"Sri Lanka", flag:"🇱🇰", bgTop:"#ce93d8", bgBottom:"#ab47bc",
    safeColor:"#e1bee7", laneColor:"#6a1b9a", obstacleColor:"#f57f17",
    obstacleType:"tuktuk", speedMult:1,
    lanes: makeLanes(2.3, 2, 4, "#6a1b9a","#7b1fa2") },

  // ── L12: Japan, Tokyo (p19) ─ Sushi rolls on the conveyor belt ────────────
  { country:"Japan", flag:"🇯🇵", bgTop:"#e0f7fa", bgBottom:"#b2ebf2",
    safeColor:"#80deea", laneColor:"#00838f", obstacleColor:"#263238",
    obstacleType:"sushi", speedMult:1,
    lanes: makeLanes(2.4, 1, 4, "#00838f","#006978") },

  // ── L13: Switzerland, Alps (p20) ─ Ski sleds flying down the slope ────────
  { country:"Switzerland", flag:"🇨🇭", bgTop:"#e3f2fd", bgBottom:"#fff",
    safeColor:"#e8f5e9", laneColor:"#b0bec5", obstacleColor:"#c62828",
    obstacleType:"sled", speedMult:1,
    lanes: makeLanes(2.5, 2, 4, "#b0bec5","#90a4ae") },

  // ── L14: Kenya, Masai Mara (p21) ─ Safari jeeps bouncing the savanna ──────
  { country:"Kenya", flag:"🇰🇪", bgTop:"#87ceeb", bgBottom:"#c8a850",
    safeColor:"#7cb342", laneColor:"#a0783a", obstacleColor:"#4e342e",
    obstacleType:"jeep", speedMult:1,
    lanes: makeLanes(2.6, 2, 4, "#a0783a","#8d6a30") },

  // ── L15: South Africa, Cape Town (p22) ─ Sailboats rounding the cape ──────
  { country:"South Africa", flag:"🇿🇦", bgTop:"#87ceeb", bgBottom:"#e8d5a3",
    safeColor:"#a5d6a7", laneColor:"#0288d1", obstacleColor:"#e53935",
    obstacleType:"sailboat", speedMult:1,
    lanes: makeLanes(2.7, 2, 4, "#0277bd","#0288d1") },

  // ── L16: Ghana, Accra (p23) ─ Market baskets tumbling to the beach ─────────
  { country:"Ghana", flag:"🇬🇭", bgTop:"#ff8f00", bgBottom:"#4caf50",
    safeColor:"#ffcc02", laneColor:"#2e7d32", obstacleColor:"#e53935",
    obstacleType:"basket", speedMult:1,
    lanes: makeLanes(2.8, 1, 3, "#2e7d32","#388e3c") },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type GameState = "start" | "banner" | "playing" | "levelComplete" | "gameOver";

interface Obstacle {
  x: number; // pixel x (can go off screen)
  row: number;
  width: number; // in cells
  speed: number; // pixels per second
}

interface FoxyPos {
  col: number;
  row: number;
}

// ─── Drawing Helpers ──────────────────────────────────────────────────────────
function drawFoxy(ctx: CanvasRenderingContext2D, px: number, py: number, bounce: number) {
  const cx = px + CELL / 2;
  const cy = py + CELL / 2 - bounce * 4;
  const s = CELL * 0.38;

  // tail
  ctx.save();
  ctx.translate(cx + s * 0.6, cy + s * 0.5);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.5, s * 0.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ef6c00";
  ctx.fill();
  // tail tip
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.55, s * 0.3, s * 0.35, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.restore();

  // body
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.2, s * 0.55, s * 0.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#ef6c00";
  ctx.fill();

  // white belly
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.35, s * 0.32, s * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8e1";
  ctx.fill();

  // head
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.35, s * 0.45, 0, Math.PI * 2);
  ctx.fillStyle = "#ef6c00";
  ctx.fill();

  // white face
  ctx.beginPath();
  ctx.ellipse(cx, cy - s * 0.25, s * 0.28, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8e1";
  ctx.fill();

  // ears
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * s * 0.25, cy - s * 0.65);
    ctx.lineTo(cx + side * s * 0.45, cy - s * 1.05);
    ctx.lineTo(cx + side * s * 0.05, cy - s * 0.75);
    ctx.fillStyle = "#ef6c00";
    ctx.fill();
    // inner ear
    ctx.beginPath();
    ctx.moveTo(cx + side * s * 0.27, cy - s * 0.68);
    ctx.lineTo(cx + side * s * 0.4, cy - s * 0.97);
    ctx.lineTo(cx + side * s * 0.1, cy - s * 0.76);
    ctx.fillStyle = "#e91e63";
    ctx.fill();
  }

  // eyes
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * s * 0.15, cy - s * 0.35, s * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    // shine
    ctx.beginPath();
    ctx.arc(cx + side * s * 0.17, cy - s * 0.37, s * 0.025, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  // nose
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.18, s * 0.055, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a1a";
  ctx.fill();

  // legs
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.roundRect(cx + side * s * 0.28 - s * 0.12, cy + s * 0.7, s * 0.22, s * 0.35, 4);
    ctx.fillStyle = "#e65100";
    ctx.fill();
  }
}

function drawFoxyIcon(ctx: CanvasRenderingContext2D, px: number, py: number, size: number) {
  const cx = px + size / 2;
  const cy = py + size / 2;
  const s = size * 0.38;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#ef6c00";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx, cy + s * 0.1, s * 0.28, s * 0.32, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff8e1";
  ctx.fill();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + side * s * 0.2, cy - s * 0.5);
    ctx.lineTo(cx + side * s * 0.4, cy - s * 0.9);
    ctx.lineTo(cx + side * s * 0.05, cy - s * 0.6);
    ctx.fillStyle = "#ef6c00";
    ctx.fill();
  }
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  type: LevelDef["obstacleType"],
  _color: string,
  x: number,
  y: number,
  w: number
) {
  const h = CELL;
  const px = x;
  const py = y;
  const totalW = w * CELL;

  if (type === "van") {
    // Jangles red VW camper van (p6 New Orleans)
    // Body
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 14, totalW - 4, h - 18, 6);
    ctx.fillStyle = "#c0392b";
    ctx.fill();
    // Roof rounded
    ctx.beginPath();
    ctx.roundRect(px + totalW * 0.15, py + 4, totalW * 0.7, h * 0.42, [10, 10, 0, 0]);
    ctx.fillStyle = "#a93226";
    ctx.fill();
    // Big windshield
    ctx.beginPath();
    ctx.roundRect(px + totalW * 0.17, py + 7, totalW * 0.32, h * 0.28, 3);
    ctx.fillStyle = "#aed6f1";
    ctx.fill();
    // Side windows
    ctx.beginPath();
    ctx.roundRect(px + totalW * 0.54, py + 7, totalW * 0.28, h * 0.28, 3);
    ctx.fillStyle = "#aed6f1";
    ctx.fill();
    // "J" circle logo
    ctx.beginPath();
    ctx.arc(px + totalW * 0.5, py + h - 10, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#f9ca24";
    ctx.fill();
    ctx.fillStyle = "#c0392b";
    ctx.font = `bold 9px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("J", px + totalW * 0.5, py + h - 6);
    // Wheels
    for (const wx of [px + 12, px + totalW - 14]) {
      ctx.beginPath();
      ctx.arc(wx, py + h - 2, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#2c3e50";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(wx, py + h - 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#7f8c8d";
      ctx.fill();
    }
    // Headlights
    ctx.beginPath();
    ctx.arc(px + totalW - 5, py + h - 9, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#f9ca24";
    ctx.fill();

  } else if (type === "sombrero") {
    // Rolling sombrero (p7 Mexico)
    const cx = px + totalW / 2;
    const cy = py + h / 2;
    const r = Math.min(totalW / 2, h / 2) - 3;
    // Wide brim
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, r, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#8b4513";
    ctx.fill();
    // Crown dome
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2, r * 0.52, r * 0.6, 0, 0, Math.PI);
    ctx.fillStyle = "#c8860a";
    ctx.fill();
    // Decorative band
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, r * 0.52, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#e74c3c";
    ctx.fill();
    // Pom-pom top
    ctx.beginPath();
    ctx.arc(cx, cy - r * 0.58, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#f39c12";
    ctx.fill();
    // Brim detail dots
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r * 0.75, cy + 4 + Math.sin(a) * r * 0.18, 2, 0, Math.PI * 2);
      ctx.fillStyle = "#f39c12";
      ctx.fill();
    }

  } else if (type === "sushi") {
    // Sushi roll on a conveyor plate (p19 Japan)
    const cx = px + totalW / 2;
    const cy = py + h / 2;
    const r = Math.min(totalW / 2, h / 2) - 4;
    // Plate (white oval)
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, r + 5, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ecf0f1";
    ctx.fill();
    // Nori (black seaweed ring)
    ctx.beginPath();
    ctx.arc(cx, cy - 2, r, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    // Rice (white ring)
    ctx.beginPath();
    ctx.arc(cx, cy - 2, r * 0.82, 0, Math.PI * 2);
    ctx.fillStyle = "#f8f9fa";
    ctx.fill();
    // Filling (salmon / tuna)
    ctx.beginPath();
    ctx.arc(cx, cy - 2, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = "#e07b54";
    ctx.fill();
    // Wasabi dot
    ctx.beginPath();
    ctx.arc(cx + r * 0.6, cy - 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#27ae60";
    ctx.fill();

  } else if (type === "jeep") {
    // Safari jeep (p21 Kenya)
    // Body
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 16, totalW - 4, h - 20, 4);
    ctx.fillStyle = "#d4a843";
    ctx.fill();
    // Cab
    ctx.beginPath();
    ctx.roundRect(px + totalW * 0.12, py + 6, totalW * 0.55, h * 0.42, [5, 5, 0, 0]);
    ctx.fillStyle = "#c49a30";
    ctx.fill();
    // Windshield
    ctx.beginPath();
    ctx.roundRect(px + totalW * 0.14, py + 9, totalW * 0.5, h * 0.28, 3);
    ctx.fillStyle = "#a9cce3";
    ctx.fill();
    // Open safari roof rack
    ctx.beginPath();
    ctx.strokeStyle = "#795548";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + totalW * 0.18, py + 5, totalW * 0.44, 4);
    // Wheels (chunky off-road)
    for (const wx of [px + 12, px + totalW - 14]) {
      ctx.beginPath();
      ctx.arc(wx, py + h - 2, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#2c2c2c";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(wx, py + h - 2, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#7f8c8d";
      ctx.fill();
    }
    // Headlight
    ctx.beginPath();
    ctx.arc(px + totalW - 4, py + h - 9, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#f9e79f";
    ctx.fill();

  } else if (type === "bus") {
    // London red double-decker bus (p13 England)
    // Main body — tall double-decker
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 2, totalW - 4, h - 6, 4);
    ctx.fillStyle = "#c62828";
    ctx.fill();
    // White dividing stripe between decks
    ctx.fillStyle = "#fff";
    ctx.fillRect(px + 2, py + h * 0.48, totalW - 4, 3);
    // Upper deck windows
    for (let i = 0; i < w + 1; i++) {
      const wx = px + 8 + i * ((totalW - 16) / (w + 1));
      ctx.beginPath();
      ctx.roundRect(wx, py + 6, (totalW - 16) / (w + 1) - 4, h * 0.36, 2);
      ctx.fillStyle = "#aed6f1";
      ctx.fill();
    }
    // Lower deck windows
    for (let i = 0; i < w + 1; i++) {
      const wx = px + 8 + i * ((totalW - 16) / (w + 1));
      ctx.beginPath();
      ctx.roundRect(wx, py + h * 0.54, (totalW - 16) / (w + 1) - 4, h * 0.32, 2);
      ctx.fillStyle = "#aed6f1";
      ctx.fill();
    }
    // Wheels
    for (const wx of [px + 10, px + totalW - 14]) {
      ctx.beginPath();
      ctx.arc(wx, py + h - 1, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();
    }
    // "LONDON" text
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.floor(CELL * 0.18)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText("LONDON", px + totalW / 2, py + h - 8);

  } else if (type === "drum") {
    // Steel drum / pan (Jamaica)
    const cx = px + totalW / 2;
    const cy = py + h / 2 + 2;
    const r = Math.min(totalW / 2, h / 2) - 4;
    // Drum body (cylinder side)
    ctx.beginPath();
    ctx.roundRect(cx - r, cy - r * 0.5, r * 2, r * 1.1, 4);
    ctx.fillStyle = "#b0bec5";
    ctx.fill();
    // Top face (oval pan)
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.4, r, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#78909c";
    ctx.fill();
    // Dents/notes on top (concave sections)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(a) * r * 0.55, cy - r * 0.4 + Math.sin(a) * r * 0.2, r * 0.17, r * 0.12, a, 0, Math.PI * 2);
      ctx.fillStyle = "#546e7a";
      ctx.fill();
    }
    // Rasta colour ring
    const rasta = ["#e53935","#fdd835","#2e7d32"];
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.3, r - 2 - i * 3, 0, Math.PI * 2);
      ctx.strokeStyle = rasta[i];
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

  } else if (type === "flyingfish") {
    // Flying fish leaping (Barbados)
    const cx = px + totalW / 2;
    const cy = py + h / 2;
    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy, totalW * 0.4, h * 0.22, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#42a5f5";
    ctx.fill();
    // Scales shimmer
    ctx.strokeStyle = "#1565c0";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(cx - totalW * 0.15 + i * totalW * 0.1, cy, totalW * 0.08, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Big pectoral "wing" fins
    ctx.beginPath();
    ctx.moveTo(cx - totalW * 0.1, cy - 2);
    ctx.lineTo(cx - totalW * 0.25, cy - h * 0.45);
    ctx.lineTo(cx + totalW * 0.15, cy - 2);
    ctx.fillStyle = "#90caf9cc";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - totalW * 0.1, cy + 2);
    ctx.lineTo(cx - totalW * 0.25, cy + h * 0.45);
    ctx.lineTo(cx + totalW * 0.15, cy + 2);
    ctx.fillStyle = "#90caf9cc";
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(cx + totalW * 0.35, cy);
    ctx.lineTo(cx + totalW * 0.5, cy - h * 0.3);
    ctx.lineTo(cx + totalW * 0.5, cy + h * 0.3);
    ctx.closePath();
    ctx.fillStyle = "#1976d2";
    ctx.fill();
    // Eye
    ctx.beginPath();
    ctx.arc(cx - totalW * 0.28, cy - 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - totalW * 0.27, cy - 3, 1, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

  } else if (type === "llama") {
    // Llama trotting (Peru)
    const cx = px + totalW / 2;
    const cy = py + h / 2;
    const s = Math.min(totalW, h) * 0.42;
    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.1, s * 0.55, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#f5f5dc";
    ctx.fill();
    // Neck
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.1, cy - s * 0.5, s * 0.22, s * 0.55, 6);
    ctx.fillStyle = "#f5f5dc";
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.1, cy - s * 0.6, s * 0.2, s * 0.16, 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#f5f5dc";
    ctx.fill();
    // Ear
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.18, cy - s * 0.7);
    ctx.lineTo(cx + s * 0.28, cy - s * 0.85);
    ctx.lineTo(cx + s * 0.08, cy - s * 0.72);
    ctx.fillStyle = "#efebe9";
    ctx.fill();
    // Eye
    ctx.beginPath();
    ctx.arc(cx + s * 0.18, cy - s * 0.6, s * 0.04, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();
    // Legs
    const legOffsets = [-0.3, -0.1, 0.12, 0.32];
    legOffsets.forEach((ox, i) => {
      ctx.beginPath();
      ctx.roundRect(cx + ox * s, cy + s * 0.38, s * 0.12, s * 0.45, 3);
      ctx.fillStyle = i % 2 === 0 ? "#ede0d4" : "#d7ccc8";
      ctx.fill();
    });
    // Colourful blanket on back
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.42, cy - s * 0.05, s * 0.55, s * 0.28, 4);
    ctx.fillStyle = "#e53935";
    ctx.fill();
    // Blanket stripes
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = ["#fdd835","#2e7d32","#ff8f00","#1565c0"][i];
      ctx.fillRect(cx - s * 0.42 + i * s * 0.14, cy - s * 0.05, s * 0.12, s * 0.28);
    }

  } else if (type === "soccer") {
    // Soccer ball bouncing (Argentina)
    const cx = px + totalW / 2;
    const cy = py + h / 2;
    const r = Math.min(totalW / 2, h / 2) - 5;
    // White ball
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Pentagon patches (simplified black spots)
    const patches = [[0,-0.6],[0.5,-0.3],[-0.5,-0.3],[0.55,0.3],[-0.55,0.3],[0,0.65]];
    patches.forEach(([ox,oy]) => {
      ctx.save();
      ctx.translate(cx + ox * r * 0.85, cy + oy * r * 0.85);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r * 0.22, Math.sin(a) * r * 0.22);
        else ctx.lineTo(Math.cos(a) * r * 0.22, Math.sin(a) * r * 0.22);
      }
      ctx.closePath();
      ctx.fillStyle = "#111";
      ctx.fill();
      ctx.restore();
    });

  } else if (type === "penguin") {
    // Penguin sliding on ice (Antarctica)
    const cx = px + totalW / 2;
    const cy = py + h / 2;
    const s = Math.min(totalW * 0.45, h * 0.5);
    // Shadow/ice skid
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.8, s * 0.55, s * 0.12, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#b3e5fc88";
    ctx.fill();
    // Body (tuxedo)
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.1, s * 0.42, s * 0.65, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#212121";
    ctx.fill();
    // White belly
    ctx.beginPath();
    ctx.ellipse(cx, cy + s * 0.2, s * 0.24, s * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#fafafa";
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.55, s * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = "#212121";
    ctx.fill();
    // White eye patches
    for (const side of [-1,1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * s * 0.12, cy - s * 0.57, s * 0.1, s * 0.08, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#fafafa";
      ctx.fill();
      // Eyes
      ctx.beginPath();
      ctx.arc(cx + side * s * 0.12, cy - s * 0.57, s * 0.045, 0, Math.PI * 2);
      ctx.fillStyle = "#111";
      ctx.fill();
    }
    // Beak
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.46);
    ctx.lineTo(cx + s * 0.14, cy - s * 0.5);
    ctx.lineTo(cx, cy - s * 0.38);
    ctx.closePath();
    ctx.fillStyle = "#ff8f00";
    ctx.fill();
    // Flippers (arms out for sliding)
    for (const side of [-1,1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * s * 0.52, cy + s * 0.05, s * 0.18, s * 0.1, side * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = "#212121";
      ctx.fill();
    }
    // Feet
    for (const side of [-1,1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * s * 0.18, cy + s * 0.72, s * 0.18, s * 0.08, side * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "#ff8f00";
      ctx.fill();
    }

  } else if (type === "balloon") {
    // Hot air balloon (France)
    const cx = px + totalW / 2;
    const cy = py + h / 2;
    const r = Math.min(totalW / 2, h * 0.4);
    // Balloon envelope (French tricolour stripes: blue/white/red)
    const stripes = ["#1565c0","#fff","#e53935"];
    stripes.forEach((c, i) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy - r * 0.2, r, r * 1.15, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = c;
      ctx.fillRect(cx - r + i * r * 0.67, cy - r * 1.4, r * 0.7, r * 2.5);
      ctx.restore();
    });
    // Outline
    ctx.beginPath();
    ctx.ellipse(cx, cy - r * 0.2, r, r * 1.15, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Ropes
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 1;
    for (const ox of [-r * 0.35, 0, r * 0.35]) {
      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + r * 0.9);
      ctx.lineTo(cx + ox * 0.4, cy + r * 1.2);
      ctx.stroke();
    }
    // Wicker basket
    ctx.beginPath();
    ctx.roundRect(cx - r * 0.3, cy + r * 1.2, r * 0.6, r * 0.38, 3);
    ctx.fillStyle = "#8d6e63";
    ctx.fill();
    ctx.strokeStyle = "#5d4037";
    ctx.lineWidth = 1;
    // Basket weave lines
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 1.2);
    ctx.lineTo(cx, cy + r * 1.58);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.3, cy + r * 1.38);
    ctx.lineTo(cx + r * 0.3, cy + r * 1.38);
    ctx.stroke();
    // Flame at bottom of envelope
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.88);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.65);
    ctx.lineTo(cx, cy + r * 0.75);
    ctx.lineTo(cx + r * 0.1, cy + r * 0.58);
    ctx.lineTo(cx + r * 0.06, cy + r * 0.78);
    ctx.lineTo(cx, cy + r * 0.88);
    ctx.fillStyle = "#ff6d00";
    ctx.fill();

  } else if (type === "vespa") {
    // Vespa scooter (Italy)
    ctx.beginPath();
    ctx.roundRect(px + 4, py + h * 0.45, totalW - 8, h * 0.35, 8);
    ctx.fillStyle = "#c62828";
    ctx.fill();
    // Front fairing
    ctx.beginPath();
    ctx.ellipse(px + totalW - 12, py + h * 0.5, totalW * 0.18, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#b71c1c";
    ctx.fill();
    // Seat
    ctx.beginPath();
    ctx.roundRect(px + totalW * 0.18, py + h * 0.32, totalW * 0.5, h * 0.18, 6);
    ctx.fillStyle = "#4a148c";
    ctx.fill();
    // Handlebars
    ctx.strokeStyle = "#bdbdbd"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + totalW * 0.78, py + h * 0.32);
    ctx.lineTo(px + totalW * 0.78, py + h * 0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + totalW * 0.65, py + h * 0.18);
    ctx.lineTo(px + totalW * 0.9, py + h * 0.18);
    ctx.stroke();
    // Wheels
    for (const [wx, wy] of [[px + 10, py + h - 5],[px + totalW - 12, py + h - 5]] as [number,number][]) {
      ctx.beginPath();
      ctx.arc(wx, wy, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#212121"; ctx.fill();
      ctx.beginPath();
      ctx.arc(wx, wy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#757575"; ctx.fill();
    }
    // Headlight
    ctx.beginPath();
    ctx.arc(px + totalW - 5, py + h * 0.52, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffe082"; ctx.fill();

  } else if (type === "tuktuk") {
    // Tuk-tuk (Sri Lanka)
    // Canopy (rounded top)
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 4, totalW - 4, h * 0.5, [10, 10, 0, 0]);
    ctx.fillStyle = "#f57f17";
    ctx.fill();
    // Body
    ctx.beginPath();
    ctx.roundRect(px + 2, py + h * 0.5, totalW - 4, h * 0.35, 4);
    ctx.fillStyle = "#ffa000";
    ctx.fill();
    // Fringe hanging from canopy
    for (let i = 0; i < Math.floor(totalW / 8); i++) {
      ctx.beginPath();
      ctx.moveTo(px + 4 + i * 8, py + h * 0.52);
      ctx.lineTo(px + 4 + i * 8 + 4, py + h * 0.62);
      ctx.strokeStyle = i % 2 === 0 ? "#e53935" : "#fdd835";
      ctx.lineWidth = 2; ctx.stroke();
    }
    // Front windshield opening
    ctx.beginPath();
    ctx.roundRect(px + totalW * 0.58, py + 8, totalW * 0.32, h * 0.38, 4);
    ctx.fillStyle = "#b3e5fc88";
    ctx.fill();
    // Wheels (3 wheels: front centre, back two)
    for (const [wx, wy] of [
      [px + totalW * 0.75, py + h - 4],
      [px + 9, py + h - 3],
    ] as [number,number][]) {
      ctx.beginPath();
      ctx.arc(wx, wy, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#1a1a1a"; ctx.fill();
      ctx.beginPath();
      ctx.arc(wx, wy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#9e9e9e"; ctx.fill();
    }

  } else if (type === "sled") {
    // Alpine ski sled (Switzerland)
    const sy = py + h * 0.55;
    // Sled body (plank)
    ctx.beginPath();
    ctx.roundRect(px + 4, sy - h * 0.18, totalW - 8, h * 0.28, 5);
    ctx.fillStyle = "#d32f2f";
    ctx.fill();
    // Wood grain stripes
    ctx.strokeStyle = "#b71c1c"; ctx.lineWidth = 1.5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(px + 4 + i * ((totalW - 8) / 4), sy - h * 0.18);
      ctx.lineTo(px + 4 + i * ((totalW - 8) / 4), sy + h * 0.1);
      ctx.stroke();
    }
    // Swiss cross on plank
    ctx.fillStyle = "#fff";
    ctx.fillRect(px + totalW / 2 - 3, sy - h * 0.14, 6, 18);
    ctx.fillRect(px + totalW / 2 - 9, sy - h * 0.06, 18, 6);
    // Curved runners (2 blades)
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(px + 2, sy + h * 0.12 + side * 5);
      ctx.quadraticCurveTo(px + totalW / 2, sy + h * 0.22 + side * 5, px + totalW - 2, sy + h * 0.12 + side * 5);
      ctx.strokeStyle = "#90a4ae"; ctx.lineWidth = 3; ctx.stroke();
    }
    // Rope handle
    ctx.strokeStyle = "#8d6e63"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 8, sy - h * 0.05);
    ctx.lineTo(px + 8, sy - h * 0.32);
    ctx.lineTo(px + 28, sy - h * 0.32);
    ctx.stroke();

  } else if (type === "sailboat") {
    // Sailboat (South Africa)
    const cx = px + totalW / 2;
    const waterY = py + h * 0.7;
    // Hull
    ctx.beginPath();
    ctx.moveTo(px + 4, waterY);
    ctx.lineTo(px + totalW * 0.18, waterY + h * 0.28);
    ctx.lineTo(px + totalW * 0.82, waterY + h * 0.28);
    ctx.lineTo(px + totalW - 4, waterY);
    ctx.closePath();
    ctx.fillStyle = "#c62828";
    ctx.fill();
    // Mast
    ctx.strokeStyle = "#5d4037"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, waterY);
    ctx.lineTo(cx, py + h * 0.04);
    ctx.stroke();
    // Main sail (white with South African flag colours)
    ctx.beginPath();
    ctx.moveTo(cx, py + h * 0.06);
    ctx.lineTo(cx + totalW * 0.45, waterY - 4);
    ctx.lineTo(cx, waterY - 4);
    ctx.closePath();
    ctx.fillStyle = "#fffde7";
    ctx.fill();
    ctx.strokeStyle = "#bdbdbd"; ctx.lineWidth = 1; ctx.stroke();
    // Coloured stripe on sail (SA green/gold)
    ctx.beginPath();
    ctx.moveTo(cx + totalW * 0.1, py + h * 0.25);
    ctx.lineTo(cx + totalW * 0.38, waterY - 6);
    ctx.lineTo(cx + totalW * 0.28, waterY - 6);
    ctx.lineTo(cx + totalW * 0.02, py + h * 0.25);
    ctx.closePath();
    ctx.fillStyle = "#2e7d3288";
    ctx.fill();
    // Jib sail (fore)
    ctx.beginPath();
    ctx.moveTo(cx, py + h * 0.12);
    ctx.lineTo(cx - totalW * 0.38, waterY - 4);
    ctx.lineTo(cx, waterY - 4);
    ctx.closePath();
    ctx.fillStyle = "#fff9c4";
    ctx.fill();
    ctx.strokeStyle = "#bdbdbd"; ctx.lineWidth = 1; ctx.stroke();
    // Water ripple
    ctx.strokeStyle = "#42a5f5aa"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + 2, waterY + h * 0.14);
    ctx.quadraticCurveTo(px + totalW * 0.25, waterY + h * 0.06, px + totalW * 0.5, waterY + h * 0.14);
    ctx.quadraticCurveTo(px + totalW * 0.75, waterY + h * 0.22, px + totalW - 2, waterY + h * 0.14);
    ctx.stroke();

  } else if (type === "basket") {
    // African market basket (Ghana)
    const cx = px + totalW / 2;
    const cy = py + h / 2 + 2;
    const bw = totalW * 0.72;
    const bh = h * 0.58;
    // Basket body (trapezoid, wider at top)
    ctx.beginPath();
    ctx.moveTo(cx - bw / 2, cy + bh / 2);
    ctx.lineTo(cx + bw / 2, cy + bh / 2);
    ctx.lineTo(cx + bw * 0.42, cy - bh / 2);
    ctx.lineTo(cx - bw * 0.42, cy - bh / 2);
    ctx.closePath();
    ctx.fillStyle = "#d4a843";
    ctx.fill();
    // Weave pattern (horizontal stripes)
    const stripeCols = ["#e53935","#2e7d32","#1565c0","#ff8f00"];
    for (let i = 0; i < 5; i++) {
      const fy = cy - bh / 2 + i * bh / 5;
      const fw = bw * 0.84 + i * bw * 0.032;
      ctx.beginPath();
      ctx.moveTo(cx - fw / 2, fy);
      ctx.lineTo(cx + fw / 2, fy);
      ctx.strokeStyle = stripeCols[i % stripeCols.length];
      ctx.lineWidth = 2.5; ctx.stroke();
    }
    // Rim at top
    ctx.beginPath();
    ctx.ellipse(cx, cy - bh / 2, bw * 0.42, bh * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#c8941c";
    ctx.fill();
    // Handle arcing over top
    ctx.strokeStyle = "#8d6e63"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy - bh / 2 - 2, bw * 0.28, Math.PI, 0);
    ctx.stroke();
    // Colourful cloth sticking out (Kente)
    ctx.beginPath();
    ctx.moveTo(cx - bw * 0.35, cy - bh / 2);
    ctx.lineTo(cx - bw * 0.25, cy - bh / 2 - h * 0.28);
    ctx.lineTo(cx + bw * 0.1, cy - bh / 2 - h * 0.22);
    ctx.lineTo(cx + bw * 0.15, cy - bh / 2);
    ctx.closePath();
    ctx.fillStyle = "#ff8f00cc";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + bw * 0.2, cy - bh / 2);
    ctx.lineTo(cx + bw * 0.28, cy - bh / 2 - h * 0.2);
    ctx.lineTo(cx + bw * 0.42, cy - bh / 2 - h * 0.14);
    ctx.lineTo(cx + bw * 0.38, cy - bh / 2);
    ctx.closePath();
    ctx.fillStyle = "#e53935cc";
    ctx.fill();
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, level: LevelDef, _levelIdx: number) {
  // Sky/ground gradient fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, level.bgTop);
  grad.addColorStop(1, level.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Safe zones
  ctx.fillStyle = level.safeColor;
  ctx.fillRect(0, 0, W, CELL);       // top safe
  ctx.fillRect(0, CELL, W, CELL);    // 2nd row
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2); // bottom safe

  // Country-specific scenery behind lanes
  if      (level.obstacleType === "van")       drawNewOrleansScene(ctx);
  else if (level.obstacleType === "sombrero")  drawTulumScene(ctx);
  else if (level.obstacleType === "drum")      drawJamaicaScene(ctx);
  else if (level.obstacleType === "flyingfish")drawBarbadosScene(ctx);
  else if (level.obstacleType === "llama")     drawPeruScene(ctx);
  else if (level.obstacleType === "soccer")    drawArgentinaScene(ctx);
  else if (level.obstacleType === "penguin")   drawAntarcticaScene(ctx);
  else if (level.obstacleType === "bus")       drawLondonScene(ctx);
  else if (level.obstacleType === "balloon")   drawParisScene(ctx);
  else if (level.obstacleType === "vespa")     drawItalyScene(ctx);
  else if (level.obstacleType === "tuktuk")    drawSriLankaScene(ctx);
  else if (level.obstacleType === "sushi")     drawTokyoScene(ctx);
  else if (level.obstacleType === "sled")      drawSwitzerlandScene(ctx);
  else if (level.obstacleType === "jeep")      drawSavannaScene(ctx);
  else if (level.obstacleType === "sailboat")  drawSouthAfricaScene(ctx);
  else if (level.obstacleType === "basket")    drawGhanaScene(ctx);

  // Lane roads
  level.lanes.forEach((lane) => {
    ctx.fillStyle = lane.color + "dd";
    ctx.fillRect(0, lane.row * CELL, W, CELL);
    // lane divider dashes
    ctx.strokeStyle = "#ffffff33";
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 14]);
    ctx.beginPath();
    ctx.moveTo(0, lane.row * CELL);
    ctx.lineTo(W, lane.row * CELL);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Goal zone
  ctx.fillStyle = "#ffffff22";
  ctx.fillRect(0, 0, W, CELL);
  ctx.strokeStyle = "#ffffffbb";
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, W - 6, CELL - 6);
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${CELL * 0.38}px monospace`;
  ctx.textAlign = "center";
  ctx.fillText("🏁 SAFE ZONE", W / 2, CELL * 0.65);
}

// ── USA: New Orleans night street (p6) ──────────────────────────────────────
function drawNewOrleansScene(ctx: CanvasRenderingContext2D) {
  // Stars in dark sky
  ctx.fillStyle = "#ffffffaa";
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.arc((i * 113 + 40) % W, 10 + (i * 37) % (CELL * 1.5), 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Colorful French Quarter buildings (top safe zone)
  const bldgs = [
    { x: 0,   w: 70,  h: 44, c: "#2c3e6b" },
    { x: 72,  w: 55,  h: 50, c: "#1a3a5c" },
    { x: 130, w: 80,  h: 38, c: "#2c3e6b" },
    { x: 490, w: 60,  h: 46, c: "#1a3a5c" },
    { x: 555, w: 75,  h: 54, c: "#2c3e6b" },
    { x: 635, w: 65,  h: 40, c: "#1a3a5c" },
  ];
  bldgs.forEach(({ x, w, h, c }) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, CELL * 2 - h, w, h);
    // Lit windows
    ctx.fillStyle = "#f9ca24";
    for (let wy = CELL * 2 - h + 6; wy < CELL * 2 - 4; wy += 12) {
      for (let wx = x + 5; wx < x + w - 5; wx += 11) {
        ctx.fillRect(wx, wy, 6, 7);
      }
    }
    // Balcony rail
    ctx.strokeStyle = "#f9ca2488";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 2, CELL * 2 - 14, w - 4, 12);
  });
  // Street lamp
  ctx.strokeStyle = "#f9ca24";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(W / 2, CELL * 2); ctx.lineTo(W / 2, CELL * 2 - 40); ctx.stroke();
  ctx.beginPath(); ctx.arc(W / 2, CELL * 2 - 40, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#fff9c4"; ctx.fill();
  // US flags
  for (const fx of [30, W - 50]) {
    ctx.fillStyle = "#c0392b"; ctx.fillRect(fx, CELL * 1.2, 28, 16);
    ctx.fillStyle = "#fff";
    for (let row = 0; row < 3; row++) ctx.fillRect(fx, CELL * 1.2 + row * 5 + 1, 28, 2);
    ctx.fillStyle = "#1a237e"; ctx.fillRect(fx, CELL * 1.2, 11, 8);
  }
  // Sidewalk at bottom safe zone
  ctx.fillStyle = "#2c3e6b";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
}

// ── Mexico: Tulum beach (p7) ─────────────────────────────────────────────────
function drawTulumScene(ctx: CanvasRenderingContext2D) {
  // Ocean at top
  ctx.fillStyle = "#1e90ff";
  ctx.fillRect(0, 0, W, CELL * 1.4);
  // Waves
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(30 + i * 88, CELL * 1.3, 18, Math.PI, 0);
    ctx.strokeStyle = "#ffffffaa";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Palm trees flanking
  for (const tx of [20, 60, W - 65, W - 25]) {
    const ty = CELL * 1.9;
    // Trunk
    ctx.strokeStyle = "#5d4037"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(tx, ty + 20); ctx.lineTo(tx + 5, ty - 10); ctx.stroke();
    // Leaves
    ctx.fillStyle = "#2e7d32";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(tx + 5, ty - 10);
      ctx.lineTo(tx + 5 + Math.cos(a) * 22, ty - 10 + Math.sin(a) * 12);
      ctx.lineWidth = 3; ctx.strokeStyle = "#388e3c"; ctx.stroke();
    }
  }
  // Colorful bunting flags across top
  const bunting = ["#e74c3c","#f39c12","#27ae60","#3498db","#9b59b6"];
  ctx.strokeStyle = "#5d4037"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, CELL * 1.1); ctx.lineTo(W, CELL * 1.1); ctx.stroke();
  for (let i = 0; i < 18; i++) {
    const bx = i * (W / 18);
    ctx.beginPath();
    ctx.moveTo(bx, CELL * 1.1);
    ctx.lineTo(bx + 10, CELL * 1.3);
    ctx.lineTo(bx + 20, CELL * 1.1);
    ctx.fillStyle = bunting[i % bunting.length];
    ctx.fill();
  }
  // Sandy bottom safe zone
  ctx.fillStyle = "#e8d5a3";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
}

// ── Japan: Tokyo sushi restaurant (p19) ──────────────────────────────────────
function drawTokyoScene(ctx: CanvasRenderingContext2D) {
  // Clean restaurant interior top zone
  ctx.fillStyle = "#e0f7fa";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Japanese flag on wall
  ctx.fillStyle = "#fff";
  ctx.fillRect(W / 2 - 30, 6, 60, 38);
  ctx.strokeStyle = "#ccc"; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 30, 6, 60, 38);
  ctx.beginPath();
  ctx.arc(W / 2, 25, 12, 0, Math.PI * 2);
  ctx.fillStyle = "#e53935"; ctx.fill();
  // Aquarium tank (left side, like p19)
  ctx.fillStyle = "#006978";
  ctx.fillRect(10, CELL * 0.3, 100, CELL * 1.6);
  ctx.fillStyle = "#00acc1aa";
  ctx.fillRect(12, CELL * 0.35, 96, CELL * 1.5);
  // Fish in tank
  for (const [fx, fy] of [[30,CELL*0.7],[70,CELL*1.1],[50,CELL*1.4]]) {
    ctx.beginPath();
    ctx.ellipse(fx, fy, 10, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#ef9a9a"; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(fx - 10, fy); ctx.lineTo(fx - 16, fy - 5); ctx.lineTo(fx - 16, fy + 5);
    ctx.fillStyle = "#ef9a9a"; ctx.fill();
  }
  // Sushi counter (bar area at bottom safe)
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, 8);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(0, (ROWS - 2) * CELL + 8, W, CELL * 2 - 8);
  // Bar stools
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(40 + i * 110, (ROWS - 2) * CELL + 4, 12, 0, Math.PI * 2);
    ctx.fillStyle = "#78909c"; ctx.fill();
  }
}

// ── Kenya: Masai Mara savanna (p21) ──────────────────────────────────────────
function drawSavannaScene(ctx: CanvasRenderingContext2D) {
  // Blue sky
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Distant mountains / hills
  ctx.fillStyle = "#66bb6a88";
  ctx.beginPath();
  ctx.moveTo(0, CELL * 2);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, CELL * 2 - 20 - Math.sin(x * 0.04) * 18);
  ctx.lineTo(W, CELL * 2); ctx.closePath(); ctx.fill();
  // Acacia trees (flat-top, iconic)
  const drawAcacia = (tx: number) => {
    ctx.strokeStyle = "#5d4037"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(tx, CELL * 2); ctx.lineTo(tx, CELL * 1.3); ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(tx, CELL * 1.7); ctx.lineTo(tx - 18, CELL * 1.35); ctx.stroke();
    // Flat canopy
    ctx.beginPath();
    ctx.ellipse(tx, CELL * 1.25, 30, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#33691e"; ctx.fill();
  };
  drawAcacia(50); drawAcacia(150); drawAcacia(W - 55); drawAcacia(W - 160);
  // Golden grass bottom safe zone
  ctx.fillStyle = "#c8a850";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  // Grass tufts
  ctx.strokeStyle = "#9e7a20"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 30; i++) {
    const gx = (i * 73 + 15) % W;
    const gy = (ROWS - 2) * CELL + 10;
    for (let j = -1; j <= 1; j++) {
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + j * 4, gy - 10); ctx.stroke();
    }
  }
}

// ── England: London (p13) ────────────────────────────────────────────────────
function drawLondonScene(ctx: CanvasRenderingContext2D) {
  // Grey cloudy sky
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Clouds
  const drawCloud = (cx: number, cy: number) => {
    ctx.fillStyle = "#eceff1";
    for (const [ox,oy,r] of [[0,0,14],[-18,5,10],[18,5,10],[0,10,12]] as [number,number,number][]) {
      ctx.beginPath(); ctx.arc(cx+ox, cy+oy, r, 0, Math.PI*2); ctx.fill();
    }
  };
  drawCloud(80, 20); drawCloud(280, 15); drawCloud(500, 22); drawCloud(W - 80, 18);
  // Tower Bridge silhouette (iconic, p13)
  ctx.fillStyle = "#455a64";
  // Left tower
  ctx.fillRect(W/2 - 80, CELL * 0.3, 24, CELL * 1.7);
  ctx.fillRect(W/2 - 86, CELL * 0.3, 36, 18); // top cap
  // Right tower
  ctx.fillRect(W/2 + 56, CELL * 0.3, 24, CELL * 1.7);
  ctx.fillRect(W/2 + 50, CELL * 0.3, 36, 18);
  // Bridge roadway
  ctx.fillRect(W/2 - 80, CELL * 1.5, 160, 10);
  // Suspension cables
  ctx.strokeStyle = "#546e7a"; ctx.lineWidth = 2;
  for (const [sx, ex] of [[W/2-80, W/2-56],[W/2+80, W/2+56]]) {
    ctx.beginPath(); ctx.moveTo(sx, CELL*0.6); ctx.quadraticCurveTo((sx+ex)/2, CELL*1.3, ex, CELL*1.55); ctx.stroke();
  }
  // Union Jack flags on towers
  for (const fx of [W/2-78, W/2+60]) {
    ctx.fillStyle = "#c62828"; ctx.fillRect(fx, CELL*0.35, 18, 12);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx,CELL*0.35); ctx.lineTo(fx+18,CELL*0.47); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx+18,CELL*0.35); ctx.lineTo(fx,CELL*0.47); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx+9,CELL*0.35); ctx.lineTo(fx+9,CELL*0.47); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fx,CELL*0.41); ctx.lineTo(fx+18,CELL*0.41); ctx.stroke();
  }
  // Stone pavement at bottom
  ctx.fillStyle = "#546e7a";
  ctx.fillRect(0, (ROWS-2)*CELL, W, CELL*2);
  // Stone block pattern
  ctx.strokeStyle = "#455a64"; ctx.lineWidth = 1;
  for (let bx = 0; bx < W; bx += 38) {
    ctx.strokeRect(bx, (ROWS-2)*CELL+2, 36, CELL-4);
  }
}

// ── Jamaica: beach / reggae (p8) ─────────────────────────────────────────────
function drawJamaicaScene(ctx: CanvasRenderingContext2D) {
  // Blue sky + turquoise sea
  ctx.fillStyle = "#1565c0";
  ctx.fillRect(0, 0, W, CELL * 1.6);
  ctx.fillStyle = "#00acc1";
  ctx.fillRect(0, CELL * 1.3, W, CELL * 0.6);
  // Waves
  ctx.strokeStyle = "#ffffffaa"; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(20 + i * 100, CELL * 1.65, 22, Math.PI, 0);
    ctx.stroke();
  }
  // Reggae sky sun
  ctx.beginPath();
  ctx.arc(W - 70, 30, 22, 0, Math.PI * 2);
  ctx.fillStyle = "#fdd835"; ctx.fill();
  // Sun rays
  ctx.strokeStyle = "#fdd835aa"; ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(W - 70 + Math.cos(a) * 26, 30 + Math.sin(a) * 26);
    ctx.lineTo(W - 70 + Math.cos(a) * 38, 30 + Math.sin(a) * 38);
    ctx.stroke();
  }
  // Palm trees
  for (const tx of [30, 80, W - 35, W - 85]) {
    ctx.strokeStyle = "#4e342e"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(tx, CELL * 2); ctx.lineTo(tx + 8, CELL * 1.1); ctx.stroke();
    ctx.fillStyle = "#2e7d32";
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(tx + 8, CELL * 1.1);
      ctx.lineTo(tx + 8 + Math.cos(a) * 28, CELL * 1.1 + Math.sin(a) * 14);
      ctx.lineWidth = 3; ctx.strokeStyle = "#388e3c"; ctx.stroke();
    }
  }
  // Green & gold ground
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  ctx.fillStyle = "#fdd835";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, 5);
}

// ── Barbados: Oistins fish market (p9) ───────────────────────────────────────
function drawBarbadosScene(ctx: CanvasRenderingContext2D) {
  // Ocean blue sky
  ctx.fillStyle = "#0288d1";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Foamy waves at horizon
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.arc(i * 80, CELL * 1.55, 25, Math.PI, 0);
    ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 2; ctx.stroke();
  }
  // Barbados flag colour on pier posts
  ctx.fillStyle = "#00267f";
  for (const px2 of [40, 120, W - 120, W - 40]) {
    ctx.fillRect(px2 - 4, CELL * 1.2, 8, CELL * 0.8);
    ctx.fillStyle = "#ffc400";
    ctx.fillRect(px2 - 8, CELL * 1.1, 16, 6);
    ctx.fillStyle = "#00267f";
  }
  // Fishing net strung between posts
  ctx.strokeStyle = "#ffffffaa"; ctx.lineWidth = 1;
  ctx.setLineDash([4, 6]);
  ctx.beginPath(); ctx.moveTo(40, CELL * 1.15); ctx.lineTo(W - 40, CELL * 1.15); ctx.stroke();
  ctx.setLineDash([]);
  // Sandy beach bottom
  ctx.fillStyle = "#c8a850";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  // Shell decorations
  ctx.fillStyle = "#fffde7";
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.arc((i * 57 + 20) % W, (ROWS - 2) * CELL + 14, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Peru: Machu Picchu mountains (p10) ───────────────────────────────────────
function drawPeruScene(ctx: CanvasRenderingContext2D) {
  // Misty mountain sky
  ctx.fillStyle = "#546e7a";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Mountain silhouettes
  const drawMtn = (mx: number, mh: number, c: string) => {
    ctx.beginPath();
    ctx.moveTo(mx - 60, CELL * 2);
    ctx.lineTo(mx, CELL * 2 - mh);
    ctx.lineTo(mx + 60, CELL * 2);
    ctx.closePath();
    ctx.fillStyle = c; ctx.fill();
  };
  drawMtn(80, 70, "#37474f"); drawMtn(200, 55, "#455a64");
  drawMtn(W / 2, 80, "#263238"); drawMtn(W - 120, 65, "#37474f");
  drawMtn(W - 30, 50, "#455a64");
  // Snow caps
  for (const [mx, mh] of [[80,70],[W/2,80],[W-120,65]] as [number,number][]) {
    ctx.beginPath();
    ctx.moveTo(mx, CELL * 2 - mh);
    ctx.lineTo(mx - 14, CELL * 2 - mh + 22);
    ctx.lineTo(mx + 14, CELL * 2 - mh + 22);
    ctx.closePath();
    ctx.fillStyle = "#eceff1"; ctx.fill();
  }
  // Mist bands
  ctx.fillStyle = "#b0bec566";
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(0, CELL * 1.3 + i * 8, W, 5);
  }
  // Inca stone wall at bottom
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  ctx.strokeStyle = "#4e342e"; ctx.lineWidth = 1;
  for (let bx = 0; bx < W; bx += 34) {
    ctx.strokeRect(bx, (ROWS - 2) * CELL + 3, 32, CELL - 6);
  }
}

// ── Argentina: Buenos Aires city (p11) ────────────────────────────────────────
function drawArgentinaScene(ctx: CanvasRenderingContext2D) {
  // Light blue sky (Arg flag colour)
  ctx.fillStyle = "#74b9ff";
  ctx.fillRect(0, 0, W, CELL * 2);
  // White clouds
  const drawCloud2 = (cx: number, cy: number) => {
    ctx.fillStyle = "#fff";
    for (const [ox,oy,r] of [[0,0,14],[-16,5,10],[16,5,10],[0,10,12]] as [number,number,number][]) {
      ctx.beginPath(); ctx.arc(cx+ox, cy+oy, r, 0, Math.PI * 2); ctx.fill();
    }
  };
  drawCloud2(60,18); drawCloud2(300,12); drawCloud2(W-80,20);
  // Obelisco de Buenos Aires
  ctx.fillStyle = "#90a4ae";
  ctx.fillRect(W/2 - 5, CELL * 0.5, 10, CELL * 1.5);
  ctx.beginPath();
  ctx.moveTo(W/2, CELL * 0.35);
  ctx.lineTo(W/2 - 8, CELL * 0.5);
  ctx.lineTo(W/2 + 8, CELL * 0.5);
  ctx.closePath(); ctx.fill();
  // City block buildings
  const bldgs2 = [{x:0,w:60,h:44},{x:62,w:44,h:38},{x:W-104,w:44,h:42},{x:W-60,w:58,h:36}];
  bldgs2.forEach(({x,w,h}) => {
    ctx.fillStyle = "#b0bec5";
    ctx.fillRect(x, CELL * 2 - h, w, h);
    ctx.fillStyle = "#78909c";
    for (let wy = CELL * 2 - h + 6; wy < CELL * 2 - 4; wy += 10) {
      for (let wx = x + 5; wx < x + w - 5; wx += 9) {
        ctx.fillRect(wx, wy, 5, 6);
      }
    }
  });
  // Blue + white sidewalk stripe (Arg flag)
  ctx.fillStyle = "#74b9ff";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  ctx.fillStyle = "#fff";
  for (let i = 0; i < W; i += 36) ctx.fillRect(i, (ROWS - 2) * CELL + 10, 22, 4);
}

// ── Antarctica: ice sheet (p12) ───────────────────────────────────────────────
function drawAntarcticaScene(ctx: CanvasRenderingContext2D) {
  // Aurora borealis-ish sky
  ctx.fillStyle = "#b3e5fc";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Pale green aurora streaks
  ctx.strokeStyle = "#a5d6a7aa"; ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 160 - 40, 0);
    ctx.quadraticCurveTo(i * 160, CELL, i * 160 + 60, CELL * 2);
    ctx.stroke();
  }
  // Icebergs
  const drawIceberg = (ix: number) => {
    ctx.beginPath();
    ctx.moveTo(ix, CELL * 2);
    ctx.lineTo(ix - 30, CELL * 1.3);
    ctx.lineTo(ix + 10, CELL * 1.0);
    ctx.lineTo(ix + 40, CELL * 1.4);
    ctx.lineTo(ix + 50, CELL * 2);
    ctx.closePath();
    ctx.fillStyle = "#e1f5fe"; ctx.fill();
    ctx.strokeStyle = "#81d4fa"; ctx.lineWidth = 1; ctx.stroke();
  };
  drawIceberg(60); drawIceberg(W - 70); drawIceberg(W/2 + 80);
  // Snow ground
  ctx.fillStyle = "#e3f2fd";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  // Snow bumps
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.ellipse((i * 72 + 25) % W, (ROWS - 2) * CELL + 5, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── France: Paris (p15) ────────────────────────────────────────────────────────
function drawParisScene(ctx: CanvasRenderingContext2D) {
  // Parisian blue sky
  ctx.fillStyle = "#90caf9";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Eiffel Tower silhouette (centre)
  ctx.fillStyle = "#455a64";
  // Legs
  ctx.beginPath();
  ctx.moveTo(W/2 - 38, CELL * 2);
  ctx.lineTo(W/2 - 12, CELL * 1.0);
  ctx.lineTo(W/2 - 8, CELL * 1.0);
  ctx.lineTo(W/2 + 8, CELL * 1.0);
  ctx.lineTo(W/2 + 12, CELL * 1.0);
  ctx.lineTo(W/2 + 38, CELL * 2);
  ctx.closePath(); ctx.fill();
  // Crossbar
  ctx.fillRect(W/2 - 22, CELL * 1.55, 44, 7);
  // Middle section
  ctx.beginPath();
  ctx.moveTo(W/2 - 12, CELL * 1.0);
  ctx.lineTo(W/2 - 7, CELL * 0.6);
  ctx.lineTo(W/2 + 7, CELL * 0.6);
  ctx.lineTo(W/2 + 12, CELL * 1.0);
  ctx.closePath(); ctx.fill();
  // Top spire
  ctx.beginPath();
  ctx.moveTo(W/2, CELL * 0.15);
  ctx.lineTo(W/2 - 6, CELL * 0.6);
  ctx.lineTo(W/2 + 6, CELL * 0.6);
  ctx.closePath(); ctx.fill();
  // Lights on tower
  ctx.fillStyle = "#ffd54f";
  for (const [tx,ty] of [[W/2,CELL*0.18],[W/2-4,CELL*0.62],[W/2+4,CELL*0.62],[W/2-10,CELL*1.02],[W/2+10,CELL*1.02]] as [number,number][]) {
    ctx.beginPath(); ctx.arc(tx, ty, 2, 0, Math.PI * 2); ctx.fill();
  }
  // Café-style awning at bottom
  ctx.fillStyle = "#c8e6c9";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  // Cobblestones
  ctx.strokeStyle = "#a5d6a7"; ctx.lineWidth = 1;
  for (let bx = 0; bx < W; bx += 28) ctx.strokeRect(bx + 2, (ROWS - 2) * CELL + 4, 24, CELL - 8);
}

// ── Italy: Rome (p16) ──────────────────────────────────────────────────────────
function drawItalyScene(ctx: CanvasRenderingContext2D) {
  // Warm terracotta sky
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Colosseum arch silhouette
  ctx.fillStyle = "#a1887f";
  // Base
  ctx.fillRect(W/2 - 90, CELL * 1.1, 180, CELL * 0.9);
  // Arched openings
  for (let i = 0; i < 5; i++) {
    const ax = W/2 - 75 + i * 36;
    ctx.beginPath();
    ctx.roundRect(ax, CELL * 1.2, 24, CELL * 0.7, [12, 12, 0, 0]);
    ctx.fillStyle = "#87ceeb"; ctx.fill();
  }
  // Upper row smaller arches
  ctx.fillStyle = "#a1887f";
  ctx.fillRect(W/2 - 80, CELL * 0.8, 160, CELL * 0.35);
  for (let i = 0; i < 8; i++) {
    const ax = W/2 - 72 + i * 18;
    ctx.beginPath();
    ctx.roundRect(ax, CELL * 0.82, 12, CELL * 0.26, [6, 6, 0, 0]);
    ctx.fillStyle = "#87ceeb"; ctx.fill();
  }
  // Cypress trees flanking
  for (const tx of [55, 105, W - 60, W - 110]) {
    ctx.beginPath();
    ctx.ellipse(tx, CELL * 1.5, 8, 38, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#2e7d32"; ctx.fill();
  }
  // Warm cobblestone ground
  ctx.fillStyle = "#e8d5a3";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  ctx.strokeStyle = "#d7c08a"; ctx.lineWidth = 1;
  for (let bx = 0; bx < W; bx += 32) ctx.strokeRect(bx + 1, (ROWS - 2) * CELL + 3, 30, CELL - 6);
}

// ── Sri Lanka: spice market (p18) ──────────────────────────────────────────────
function drawSriLankaScene(ctx: CanvasRenderingContext2D) {
  // Purple/teal market sky
  ctx.fillStyle = "#ce93d8";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Market stall awnings (colourful stripes)
  const awningCols = ["#e53935","#f57f17","#fdd835","#2e7d32","#1565c0","#6a1b9a"];
  for (let i = 0; i < 6; i++) {
    const aw = W / 6;
    ctx.fillStyle = awningCols[i];
    ctx.beginPath();
    ctx.moveTo(i * aw, CELL * 1.4);
    ctx.lineTo(i * aw + aw / 2, CELL * 1.7);
    ctx.lineTo((i + 1) * aw, CELL * 1.4);
    ctx.closePath(); ctx.fill();
    // Fringe
    for (let j = 0; j < 5; j++) {
      ctx.beginPath();
      ctx.moveTo(i * aw + j * aw / 5, CELL * 1.4);
      ctx.lineTo(i * aw + j * aw / 5, CELL * 1.55);
      ctx.strokeStyle = "#ffffffaa"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
  // Stupa dome (Lion Rock inspired)
  ctx.beginPath();
  ctx.arc(W / 2, CELL * 0.9, 24, Math.PI, 0);
  ctx.fillStyle = "#fff8e1"; ctx.fill();
  ctx.beginPath();
  ctx.roundRect(W/2 - 6, CELL * 0.25, 12, CELL * 0.65, 3);
  ctx.fillStyle = "#fff8e1"; ctx.fill();
  // Ground: colourful market tiles
  ctx.fillStyle = "#e1bee7";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = awningCols[i % awningCols.length] + "55";
    ctx.fillRect(i * W / 8, (ROWS - 2) * CELL, W / 8, CELL * 2);
  }
}

// ── Switzerland: Alps ski slope (p20) ─────────────────────────────────────────
function drawSwitzerlandScene(ctx: CanvasRenderingContext2D) {
  // Clear alpine sky
  ctx.fillStyle = "#e3f2fd";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Sun
  ctx.beginPath();
  ctx.arc(90, 28, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#fff9c4"; ctx.fill();
  // Mountain ridges
  ctx.beginPath();
  ctx.moveTo(0, CELL * 2);
  ctx.lineTo(80, CELL * 0.5);
  ctx.lineTo(160, CELL * 1.2);
  ctx.lineTo(280, CELL * 0.3);
  ctx.lineTo(400, CELL * 1.0);
  ctx.lineTo(520, CELL * 0.5);
  ctx.lineTo(W, CELL * 1.3);
  ctx.lineTo(W, CELL * 2);
  ctx.closePath();
  ctx.fillStyle = "#eceff1"; ctx.fill();
  // Snow caps blue tint shadows
  ctx.fillStyle = "#b3e5fc88";
  ctx.beginPath();
  ctx.moveTo(80, CELL * 0.5); ctx.lineTo(60, CELL * 1.0); ctx.lineTo(100, CELL * 1.0); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(280, CELL * 0.3); ctx.lineTo(250, CELL * 0.85); ctx.lineTo(310, CELL * 0.85); ctx.closePath(); ctx.fill();
  // Chalet silhouette
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(W - 95, CELL * 1.35, 60, CELL * 0.65);
  ctx.beginPath();
  ctx.moveTo(W - 105, CELL * 1.35);
  ctx.lineTo(W - 65, CELL * 0.95);
  ctx.lineTo(W - 25, CELL * 1.35);
  ctx.closePath(); ctx.fillStyle = "#4e342e"; ctx.fill();
  // Swiss flag on chalet
  ctx.fillStyle = "#e53935"; ctx.fillRect(W - 80, CELL * 1.05, 14, 14);
  ctx.fillStyle = "#fff"; ctx.fillRect(W - 77, CELL * 1.08, 8, 2); ctx.fillRect(W - 74, CELL * 1.07, 2, 8);
  // Snow ground
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  ctx.fillStyle = "#b3e5fc66";
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse((i * 95 + 30) % W, (ROWS - 2) * CELL + 8, 32, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── South Africa: Cape Town (p22) ──────────────────────────────────────────────
function drawSouthAfricaScene(ctx: CanvasRenderingContext2D) {
  // Blue sky and ocean
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Table Mountain (flat-top, iconic)
  ctx.fillStyle = "#546e7a";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 130, CELL * 2);
  ctx.lineTo(W / 2 - 100, CELL * 0.6);
  ctx.lineTo(W / 2 + 100, CELL * 0.6);
  ctx.lineTo(W / 2 + 130, CELL * 2);
  ctx.closePath(); ctx.fill();
  // Table cloth cloud on top
  ctx.fillStyle = "#eceff1cc";
  ctx.fillRect(W / 2 - 100, CELL * 0.45, 200, 18);
  // Fynbos shrubs (SA native plants, colourful)
  for (let i = 0; i < 10; i++) {
    const fx = (i * 72 + 15) % W;
    ctx.beginPath();
    ctx.ellipse(fx, CELL * 1.9, 12, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "#ef9a9a" : "#ce93d8"; ctx.fill();
  }
  // Green + gold ground (SA flag)
  ctx.fillStyle = "#a5d6a7";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, 6);
}

// ── Ghana: Accra market (p23) ─────────────────────────────────────────────────
function drawGhanaScene(ctx: CanvasRenderingContext2D) {
  // Bright orange African sky
  ctx.fillStyle = "#ff8f00";
  ctx.fillRect(0, 0, W, CELL * 2);
  // Setting sun
  ctx.beginPath();
  ctx.arc(W - 80, 40, 28, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd54f"; ctx.fill();
  // Kente cloth colours on horizon band
  const kente = ["#e53935","#fdd835","#2e7d32","#1565c0","#ff8f00","#9c27b0"];
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = kente[i];
    ctx.fillRect(i * W / 6, CELL * 1.6, W / 6, CELL * 0.4);
  }
  // Baobab tree
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(60 - 8, CELL * 0.7, 16, CELL * 1.3);
  ctx.beginPath();
  ctx.ellipse(60, CELL * 0.65, 32, 22, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#33691e"; ctx.fill();
  // Drumbeats — small decorative drums
  for (let i = 0; i < 4; i++) {
    const dx = 170 + i * 130;
    ctx.beginPath();
    ctx.ellipse(dx, CELL * 1.75, 12, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#8d6e63"; ctx.fill();
    ctx.beginPath();
    ctx.ellipse(dx, CELL * 1.72, 12, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#6d4c41"; ctx.fill();
  }
  // Orange/green earth ground
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, CELL * 2);
  ctx.fillStyle = "#ff8f00";
  ctx.fillRect(0, (ROWS - 2) * CELL, W, 7);
  // Market mat pattern
  ctx.strokeStyle = "#fdd835"; ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(i * W / 10, (ROWS - 2) * CELL);
    ctx.lineTo(i * W / 10, (ROWS) * CELL);
    ctx.stroke();
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FoxerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const foxyImgRef = useRef<HTMLImageElement | null>(null);
  const stateRef = useRef<GameState>("start");
  const foxyRef = useRef<FoxyPos>({ col: 6, row: ROWS - 2 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const levelRef = useRef(0);
  const timerRef = useRef(LEVEL_TIME);
  const bounceRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);
  const invincibleRef = useRef(0); // seconds of invincibility after hit
  const rowsCrossedRef = useRef<Set<number>>(new Set());

  // UI state — only used for overlay screens (start / levelComplete / gameOver)
  // Everything else (score, lives, timer) is drawn directly on canvas via refs
  const [gameState, setGameState] = useState<GameState>("start");
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(3);
  const [displayHighScore, setDisplayHighScore] = useState(0);
  const [levelStars, setLevelStars] = useState(3);

  // Load the real Foxy image once
  useEffect(() => {
    const img = new Image();
    img.src = "/characters/FOX 3.png";
    img.onload = () => { foxyImgRef.current = img; };
  }, []);

  const getAudio = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioCtx();
    if (audioCtxRef.current?.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  const initObstacles = useCallback((levelIdx: number) => {
    const def = LEVELS[levelIdx];
    const obs: Obstacle[] = [];
    def.lanes.forEach((lane) => {
      const totalWidth = COLS * CELL;
      const step = (lane.obstacleWidth + lane.gap) * CELL;
      // Random offset per lane so no two lanes ever align into a clear corridor
      const randomOffset = Math.random() * step;
      let ox = randomOffset;
      while (ox < totalWidth * 2) {
        obs.push({
          x: lane.speed > 0 ? ox : totalWidth - ox,
          row: lane.row,
          width: lane.obstacleWidth,
          speed: lane.speed * CELL * def.speedMult,
        });
        ox += step;
      }
    });
    obstaclesRef.current = obs;
  }, []);

  const startLevel = useCallback(
    (levelIdx: number) => {
      levelRef.current = levelIdx;
      foxyRef.current = { col: 6, row: ROWS - 2 };
      timerRef.current = LEVEL_TIME;
      rowsCrossedRef.current = new Set();
      invincibleRef.current = 0;
      initObstacles(levelIdx);
      // Show banner for 2.5 s using a simple timeout — no frame-timing dependency
      stateRef.current = "banner";
      setGameState("banner");
      setTimeout(() => {
        stateRef.current = "playing";
        setGameState("playing");
      }, 2500);
    },
    [initObstacles]
  );

  const startGame = useCallback(() => {
    livesRef.current = 3;
    scoreRef.current = 0;
    setDisplayScore(0);
    setDisplayLives(3);
    startLevel(0);
  }, [startLevel]);

  const handleHit = useCallback(() => {
    if (invincibleRef.current > 0) return;
    const ac = getAudio();
    if (ac) sfxHit(ac);
    livesRef.current -= 1;
    setDisplayLives(livesRef.current);
    if (livesRef.current <= 0) {
      if (scoreRef.current > highScoreRef.current) {
        highScoreRef.current = scoreRef.current;
        setDisplayHighScore(highScoreRef.current);
      }
      stateRef.current = "gameOver";
      setGameState("gameOver");
    } else {
      // reset Foxy to start of level
      foxyRef.current = { col: 6, row: ROWS - 2 };
      rowsCrossedRef.current = new Set();
      invincibleRef.current = 1.5;
    }
  }, [getAudio]);

  // Reusable collision check — tests Foxy at given col/row against current obstacles
  const checkCollisionAt = useCallback((col: number, row: number): boolean => {
    if (invincibleRef.current > 0) return false;
    const foxyX = col * CELL + 6;
    const foxyY = row * CELL + 6;
    const foxyW = CELL - 12;
    const foxyH = CELL - 12;
    for (const obs of obstaclesRef.current) {
      if (obs.row !== row) continue;
      const ox = obs.x + 4;
      const ow = obs.width * CELL - 8;
      const oy = obs.row * CELL + 4;
      const oh = CELL - 8;
      if (foxyX < ox + ow && foxyX + foxyW > ox && foxyY < oy + oh && foxyY + foxyH > oy) {
        return true;
      }
    }
    return false;
  }, []);

  const moveFoxy = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      if (stateRef.current !== "playing") return;
      const ac = getAudio();
      if (ac) sfxMove(ac);
      const p = foxyRef.current;
      let { col, row } = p;
      if (dir === "up") row = Math.max(0, row - 1);
      else if (dir === "down") row = Math.min(ROWS - 2, row + 1);
      else if (dir === "left") col = Math.max(0, col - 1);
      else if (dir === "right") col = Math.min(COLS - 1, col + 1);
      foxyRef.current = { col, row };
      bounceRef.current = 1;

      // ── Immediate collision check after landing on new cell ──
      if (checkCollisionAt(col, row)) {
        handleHit();
        return;
      }

      // Check if new row is a lane that hasn't been crossed
      const level = LEVELS[levelRef.current];
      if (dir === "up" && level.lanes.some((l) => l.row === row)) {
        if (!rowsCrossedRef.current.has(row)) {
          rowsCrossedRef.current.add(row);
          scoreRef.current += 10;
          setDisplayScore(scoreRef.current);
        }
      }

      // Reached top (row 0 = goal)
      if (row === 0) {
        const ac2 = getAudio();
        if (ac2) sfxLevelComplete(ac2);
        // Time bonus
        const timeBonus = Math.floor(timerRef.current * 2);
        scoreRef.current += timeBonus + 50;
        setDisplayScore(scoreRef.current);
        const stars = timerRef.current > 30 ? 3 : timerRef.current > 15 ? 2 : 1;
        setLevelStars(stars);
        stateRef.current = "levelComplete";
        setGameState("levelComplete");
      }
    },
    [getAudio, checkCollisionAt, handleHit]
  );

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp") moveFoxy("up");
      else if (e.key === "ArrowDown") moveFoxy("down");
      else if (e.key === "ArrowLeft") moveFoxy("left");
      else if (e.key === "ArrowRight") moveFoxy("right");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [moveFoxy]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const loop = (ts: number) => {
      const dt = lastTimeRef.current === null ? 0 : Math.min((ts - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = ts;

      const state = stateRef.current;

      // Clear
      ctx.clearRect(0, 0, W, H);

      if (state === "start" || state === "gameOver" || state === "levelComplete") {
        // Minimal canvas bg — React renders the overlays
        ctx.fillStyle = "#1a237e";
        ctx.fillRect(0, 0, W, H);
        // Draw some stars
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 60; i++) {
          const sx = ((i * 137 + 50) % W);
          const sy = ((i * 79 + 30) % H);
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const levelDef = LEVELS[levelRef.current];

      if (state === "banner") {
        // Draw game bg with banner overlay — transition is handled by setTimeout in startLevel
        drawBackground(ctx, levelDef, levelRef.current);
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, H / 2 - 60, W, 120);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${CELL * 0.9}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${levelDef.flag} ${levelDef.country.toUpperCase()} ${levelDef.flag}`, W / 2, H / 2 - 10);
        ctx.font = `${CELL * 0.5}px monospace`;
        ctx.fillStyle = "#ffd54f";
        ctx.fillText(`Level ${levelRef.current + 1}`, W / 2, H / 2 + 35);
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      // ── PLAYING ──────────────────────────────────────
      timerRef.current = Math.max(0, timerRef.current - dt);
      if (timerRef.current <= 0) {
        handleHit();
        timerRef.current = LEVEL_TIME;
      }

      if (invincibleRef.current > 0) invincibleRef.current -= dt;

      // Move obstacles
      obstaclesRef.current.forEach((obs) => {
        obs.x += obs.speed * dt;
        // wrap
        const totalSpan = (COLS + obs.width) * CELL + CELL * 4;
        if (obs.speed > 0 && obs.x > W + obs.width * CELL) obs.x -= totalSpan;
        else if (obs.speed < 0 && obs.x + obs.width * CELL < -CELL * 2) obs.x += totalSpan;
      });

      // Bounce decay
      if (bounceRef.current > 0) bounceRef.current = Math.max(0, bounceRef.current - dt * 8);

      // Draw background
      drawBackground(ctx, levelDef, levelRef.current);

      // Draw obstacles
      obstaclesRef.current.forEach((obs) => {
        drawObstacle(
          ctx,
          levelDef.obstacleType,
          levelDef.obstacleColor,
          obs.x,
          obs.row * CELL,
          obs.width
        );
      });

      // Collision detection
      if (invincibleRef.current <= 0) {
        const foxyX = foxyRef.current.col * CELL + 6;
        const foxyY = foxyRef.current.row * CELL + 6;
        const foxyW = CELL - 12;
        const foxyH = CELL - 12;
        for (const obs of obstaclesRef.current) {
          if (obs.row !== foxyRef.current.row) continue;
          const ox = obs.x + 4;
          const oy = obs.row * CELL + 4;
          const ow = obs.width * CELL - 8;
          const oh = CELL - 8;
          if (foxyX < ox + ow && foxyX + foxyW > ox && foxyY < oy + oh && foxyY + foxyH > oy) {
            handleHit();
            break;
          }
        }
      }

      // Draw Foxy — use the real PNG, fall back to canvas sprite if not loaded yet
      const foxyPx = foxyRef.current.col * CELL;
      const foxyPy = foxyRef.current.row * CELL;
      const bounce = bounceRef.current;
      if (invincibleRef.current <= 0 || Math.floor(invincibleRef.current * 8) % 2 === 0) {
        if (foxyImgRef.current) {
          const offsetY = -bounce * 5;
          const padding = 2;
          ctx.drawImage(foxyImgRef.current, foxyPx + padding, foxyPy + padding + offsetY, CELL - padding * 2, CELL - padding * 2);
        } else {
          drawFoxy(ctx, foxyPx, foxyPy, bounce);
        }
      }

      // HUD
      drawHUD(ctx, levelRef.current, scoreRef.current, highScoreRef.current, livesRef.current, timerRef.current);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [handleHit]);

  function drawHUD(
    ctx: CanvasRenderingContext2D,
    level: number,
    score: number,
    high: number,
    lives: number,
    timer: number
  ) {
    // HUD bar at top
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.fillRect(0, 0, W, 38);
    ctx.fillStyle = "#ffd54f";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${LEVELS[level].flag} ${LEVELS[level].country}`, 8, 24);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(`SCORE: ${score}`, W / 2, 24);
    ctx.fillStyle = "#80deea";
    ctx.textAlign = "right";
    ctx.fillText(`BEST: ${high}`, W - 8, 24);
    // lives icons
    for (let i = 0; i < lives; i++) {
      if (foxyImgRef.current) {
        ctx.drawImage(foxyImgRef.current, 8 + i * 26, 40, 22, 22);
      } else {
        drawFoxyIcon(ctx, 8 + i * 26, 40, 22);
      }
    }
    // timer
    const pct = timer / LEVEL_TIME;
    ctx.fillStyle = pct > 0.5 ? "#69f0ae" : pct > 0.25 ? "#ffd54f" : "#ef5350";
    ctx.fillRect(W - 80, 42, 72 * pct, 10);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W - 80, 42, 72, 10);
    ctx.fillStyle = "#fff";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.ceil(timer)}s`, W - 4, 52);
  }

  const nextLevel = useCallback(() => {
    const next = levelRef.current + 1;
    if (next >= LEVELS.length) {
      // Win!
      if (scoreRef.current > highScoreRef.current) {
        highScoreRef.current = scoreRef.current;
        setDisplayHighScore(highScoreRef.current);
      }
      stateRef.current = "gameOver";
      setGameState("gameOver");
    } else {
      startLevel(next);
    }
  }, [startLevel]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#0d0d2b",
        minHeight: "100vh",
        padding: "8px",
        fontFamily: "monospace",
        userSelect: "none",
      }}
    >
      <div style={{ position: "relative", width: W, maxWidth: "100%" }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", width: "100%", imageRendering: "pixelated", borderRadius: 8 }}
        />

        {/* START SCREEN */}
        {gameState === "start" && (
          <Overlay>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#ffd54f", letterSpacing: 6, textShadow: "4px 4px 0 #e65100" }}>
              FOXER
            </div>
            <div style={{ color: "#ef9a9a", fontSize: 18, marginTop: 8 }}>Help Foxy Cross the World!</div>
            <div style={{ marginTop: 28, display: "flex", gap: 32 }}>
              <InfoBox icon="🎮" text="Arrow keys or tap buttons" />
              <InfoBox icon="❤️" text="3 lives" />
              <InfoBox icon="⏱️" text="Race the clock" />
            </div>
            <div style={{ marginTop: 16, color: "#b0bec5", fontSize: 13, textAlign: "center", lineHeight: 1.8 }}>
              🇺🇸 USA · 🇲🇽 Mexico · 🇯🇲 Jamaica · 🇧🇧 Barbados · 🇵🇪 Peru · 🇦🇷 Argentina<br/>
              🐧 Antarctica · 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England · 🇫🇷 France · 🇮🇹 Italy · 🇱🇰 Sri Lanka<br/>
              🇯🇵 Japan · 🇨🇭 Switzerland · 🇰🇪 Kenya · 🇿🇦 South Africa · 🇬🇭 Ghana
            </div>
            <button onClick={startGame} style={btnStyle("#43a047")}>
              ▶ START GAME
            </button>
          </Overlay>
        )}

        {/* LEVEL COMPLETE SCREEN */}
        {gameState === "levelComplete" && (
          <Overlay>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#69f0ae" }}>LEVEL CLEAR!</div>
            <div style={{ fontSize: 24, color: "#ffd54f", marginTop: 8 }}>
              {LEVELS[levelRef.current].flag} {LEVELS[levelRef.current].country}
            </div>
            <div style={{ fontSize: 44, marginTop: 12 }}>
              {"★".repeat(levelStars)}
              <span style={{ color: "#444" }}>{"★".repeat(3 - levelStars)}</span>
            </div>
            <div style={{ color: "#fff", fontSize: 20, marginTop: 12 }}>Score: {displayScore}</div>
            {levelRef.current < LEVELS.length - 1 ? (
              <button onClick={nextLevel} style={btnStyle("#1e88e5")}>
                NEXT LEVEL →
              </button>
            ) : (
              <>
                <div style={{ color: "#ffd54f", fontSize: 22, marginTop: 8 }}>You helped Foxy cross the world! 🌍</div>
                <button onClick={startGame} style={btnStyle("#e53935")}>
                  PLAY AGAIN
                </button>
              </>
            )}
          </Overlay>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === "gameOver" && (
          <Overlay>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#ef5350", textShadow: "3px 3px 0 #b71c1c" }}>
              GAME OVER
            </div>
            <div style={{ color: "#fff", fontSize: 22, marginTop: 16 }}>Score: {displayScore}</div>
            <div style={{ color: "#ffd54f", fontSize: 18 }}>Best: {displayHighScore}</div>
            {displayScore >= displayHighScore && displayScore > 0 && (
              <div style={{ color: "#69f0ae", fontSize: 16, marginTop: 4 }}>🏆 New High Score!</div>
            )}
            <button onClick={startGame} style={btnStyle("#e53935")}>
              PLAY AGAIN
            </button>
          </Overlay>
        )}
      </div>

      {/* Mobile Controls */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <MobileBtn label="▲" onClick={() => moveFoxy("up")} />
        <div style={{ display: "flex", gap: 12 }}>
          <MobileBtn label="◀" onClick={() => moveFoxy("left")} />
          <MobileBtn label="▼" onClick={() => moveFoxy("down")} />
          <MobileBtn label="▶" onClick={() => moveFoxy("right")} />
        </div>
      </div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(10,10,40,0.88)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        color: "#fff",
        gap: 6,
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

function InfoBox({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", color: "#b0bec5", fontSize: 13 }}>
      <div style={{ fontSize: 24 }}>{icon}</div>
      {text}
    </div>
  );
}

function MobileBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); onClick(); }}
      onClick={onClick}
      style={{
        width: 56,
        height: 56,
        borderRadius: 12,
        background: "#1e2a4a",
        border: "2px solid #3d5afe",
        color: "#fff",
        fontSize: 22,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
      }}
    >
      {label}
    </button>
  );
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    marginTop: 20,
    padding: "14px 36px",
    background: bg,
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 20,
    fontWeight: 900,
    fontFamily: "monospace",
    cursor: "pointer",
    letterSpacing: 2,
    boxShadow: "0 4px 0 rgba(0,0,0,0.4)",
  };
}
