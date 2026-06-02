import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import { asset } from "@/lib/asset";

// ─── Audio ─────────────────────────────────────────────────────────────────
function createAudioCtx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch { return null; }
}
function playTone(ctx: AudioContext, freq: number, dur: number, type: OscillatorType = "square", vol = 0.12, delay = 0) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
  osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + dur + 0.01);
}
function sfxEat(ctx: AudioContext) { playTone(ctx, 600, 0.04, "square", 0.08); }
function sfxPower(ctx: AudioContext) {
  [300, 400, 500, 600].forEach((f, i) => playTone(ctx, f, 0.08, "square", 0.15, i * 0.06));
}
function sfxGhostEat(ctx: AudioContext) {
  [800, 600, 400].forEach((f, i) => playTone(ctx, f, 0.08, "sawtooth", 0.2, i * 0.07));
}
function sfxDie(ctx: AudioContext) {
  [440, 349, 294, 220, 165].forEach((f, i) => playTone(ctx, f, 0.15, "sawtooth", 0.2, i * 0.12));
}
function sfxLevelUp(ctx: AudioContext) {
  [523, 659, 784, 1047].forEach((f, i) => playTone(ctx, f, 0.12, "square", 0.15, i * 0.1));
}

// ─── Levels: page → country/flag ──────────────────────────────────────────
interface LevelDef { page: string; country: string; flag: string; isoCode: string; }
const LEVELS: LevelDef[] = [
  { page: "page-03", country: "USA",          flag: "🇺🇸", isoCode: "us" },
  { page: "page-04", country: "Mexico",       flag: "🇲🇽", isoCode: "mx" },
  { page: "page-05", country: "Jamaica",      flag: "🇯🇲", isoCode: "jm" },
  { page: "page-06", country: "Barbados",     flag: "🇧🇧", isoCode: "bb" },
  { page: "page-07", country: "Peru",         flag: "🇵🇪", isoCode: "pe" },
  { page: "page-08", country: "Argentina",    flag: "🇦🇷", isoCode: "ar" },
  { page: "page-09", country: "Antarctica",   flag: "❄️",  isoCode: "" },
  { page: "page-10", country: "England",      flag: "🇬🇧", isoCode: "gb" },
  { page: "page-11", country: "Spain",        flag: "🇪🇸", isoCode: "es" },
  { page: "page-12", country: "France",       flag: "🇫🇷", isoCode: "fr" },
  { page: "page-13", country: "Italy",        flag: "🇮🇹", isoCode: "it" },
  { page: "page-15", country: "Sri Lanka",    flag: "🇱🇰", isoCode: "lk" },
  { page: "page-16", country: "Japan",        flag: "🇯🇵", isoCode: "jp" },
  { page: "page-17", country: "Switzerland",  flag: "🇨🇭", isoCode: "ch" },
  { page: "page-18", country: "Kenya",        flag: "🇰🇪", isoCode: "ke" },
  { page: "page-19", country: "South Africa", flag: "🇿🇦", isoCode: "za" },
  { page: "page-20", country: "Ghana",        flag: "🇬🇭", isoCode: "gh" },
  { page: "page-21", country: "South Korea",  flag: "🇰🇷", isoCode: "kr" },
  { page: "page-22", country: "Nepal",        flag: "🇳🇵", isoCode: "np" },
  { page: "page-23", country: "Indonesia",    flag: "🇮🇩", isoCode: "id" },
  { page: "page-24", country: "Australia",    flag: "🇦🇺", isoCode: "au" },
];

// ─── Characters ────────────────────────────────────────────────────────────
export type CharacterId = "casey" | "jaime" | "jeff" | "fante";
interface CharDef { id: CharacterId; name: string; color: string; accent: string; eyeColor: string; }
const CHARACTERS: CharDef[] = [
  { id: "casey", name: "Casey",  color: "#f97316", accent: "#fff",    eyeColor: "#1a1a1a" },
  { id: "jaime", name: "Jaime",  color: "#3b82f6", accent: "#fbbf24", eyeColor: "#1a1a1a" },
  { id: "jeff",  name: "Jeff",   color: "#22c55e", accent: "#fff",    eyeColor: "#1a1a1a" },
  { id: "fante", name: "Fante",  color: "#a855f7", accent: "#fff",    eyeColor: "#1a1a1a" },
];

// ─── Maze ──────────────────────────────────────────────────────────────────
// 0=dot, 1=wall, 2=empty, 3=power-flag, 4=ghost-house
const COLS = 19;
const ROWS = 21;
const CELL = 32;
const W = COLS * CELL;
const H = ROWS * CELL;

// Classic Pacman-style maze (19×21)
const BASE_MAZE: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  // rows 8-12: walls on outer edges — no unintended tunnel corridors
  [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,4,1,1,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,4,4,4,1,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,2,2,2,2,2,2,1,0,1,1,1,1],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,3,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,3,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function makeMaze(): number[][] {
  return BASE_MAZE.map(row => [...row]);
}

function countDots(maze: number[][]): number {
  let n = 0;
  for (const row of maze) for (const cell of row) if (cell === 0 || cell === 3) n++;
  return n;
}

// ─── Directions ────────────────────────────────────────────────────────────
type Dir = { dx: number; dy: number };
const UP:    Dir = { dx: 0,  dy: -1 };
const DOWN:  Dir = { dx: 0,  dy:  1 };
const LEFT:  Dir = { dx: -1, dy:  0 };
const RIGHT: Dir = { dx: 1,  dy:  0 };

function isWalkable(maze: number[][], col: number, row: number): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
  const v = maze[row][col];
  // Players can walk on dots (0), empty (2), and power flags (3) — NOT walls (1) or ghost house (4)
  return v === 0 || v === 2 || v === 3;
}
function isGhostWalkable(maze: number[][], col: number, row: number): boolean {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
  const v = maze[row][col];
  return v !== 1;
}

// ─── Ghost AI ──────────────────────────────────────────────────────────────
// Respawn point = centre of ghost house (row 10 col 9 is definitely value-4)
const GHOST_RESPAWN_COL = 9;
const GHOST_RESPAWN_ROW = 10;
const GHOST_REGEN_SECS  = 4; // seconds inside house before reappearing

interface Ghost {
  id: number;
  col: number; row: number;
  px: number; py: number; // pixel position (for smooth movement)
  dir: Dir;
  color: string;
  frightened: boolean;
  eaten: boolean;       // true → showing as eyes, waiting to regen
  regenTimer: number;   // counts down to 0 then ghost respawns
  exiting: boolean;     // true → just regenerated, navigating out of ghost house
  scatter: boolean;
  scatterTarget: { col: number; row: number };
  moving: boolean;
  moveTimer: number;
}

const GHOST_COLORS = ["#ff0000", "#ffb8ff", "#00ffff", "#ffb852"];
// All 4 start positions are confirmed value-4 cells inside the house
const GHOST_START: { col: number; row: number; dir: Dir }[] = [
  { col: 9,  row: 10, dir: LEFT  },  // Blinky
  { col: 8,  row: 10, dir: RIGHT },  // Pinky
  { col: 10, row: 10, dir: LEFT  },  // Inky
  { col: 9,  row:  9, dir: RIGHT },  // Clyde (row 9 col 9 = value 4)
];
const GHOST_SCATTER_TARGETS = [
  { col: COLS - 2, row: 0 },
  { col: 1,        row: 0 },
  { col: COLS - 2, row: ROWS - 1 },
  { col: 1,        row: ROWS - 1 },
];

function makeGhosts(): Ghost[] {
  return [0,1,2,3].map(id => {
    const s = GHOST_START[id];
    return {
      id,
      col: s.col, row: s.row,
      px: s.col * CELL, py: s.row * CELL,
      dir: s.dir,
      color: GHOST_COLORS[id],
      frightened: false,
      eaten: false,
      regenTimer: 0,
      exiting: true,  // all ghosts start inside house and must exit
      scatter: false,
      scatterTarget: GHOST_SCATTER_TARGETS[id],
      moving: true,
      moveTimer: id * 0.5,
    };
  });
}

function ghostSpeed(frightened: boolean, level: number): number {
  if (frightened) return 3.5 + level * 0.1;
  return 4.5 + level * 0.2;
}

function playerSpeed(level: number): number {
  return 5.5 + level * 0.15;
}

function chooseDirForGhost(ghost: Ghost, maze: number[][], target: { col: number; row: number }): Dir {
  const dirs: Dir[] = [UP, DOWN, LEFT, RIGHT];
  const opposite: Dir = { dx: -ghost.dir.dx, dy: -ghost.dir.dy };
  let bestDir: Dir | null = null;
  let bestDist = Infinity;
  for (const d of dirs) {
    if (d.dx === opposite.dx && d.dy === opposite.dy) continue;
    const nc = ghost.col + d.dx;
    const nr = ghost.row + d.dy;
    if (!isGhostWalkable(maze, nc, nr)) continue;
    const dist = Math.hypot(nc - target.col, nr - target.row);
    if (dist < bestDist) { bestDist = dist; bestDir = d; }
  }
  // If completely boxed in (only reverse is valid), allow it
  if (!bestDir) return opposite;
  return bestDir;
}

function randomDir(ghost: Ghost, maze: number[][]): Dir {
  const dirs: Dir[] = [UP, DOWN, LEFT, RIGHT];
  const opposite: Dir = { dx: -ghost.dir.dx, dy: -ghost.dir.dy };
  const valid = dirs.filter(d => {
    if (d.dx === opposite.dx && d.dy === opposite.dy) return false;
    return isGhostWalkable(maze, ghost.col + d.dx, ghost.row + d.dy);
  });
  if (valid.length === 0) return opposite;
  return valid[Math.floor(Math.random() * valid.length)];
}

// ─── Casey sprite (loaded once, shared across frames) ──────────────────────
let caseySpriteImg: HTMLImageElement | null = null;
let caseySpriteLoaded = false;
(function loadCaseySprite() {
  const img = new Image();
  img.onload = () => { caseySpriteImg = img; caseySpriteLoaded = true; };
  img.src = asset("/characters/casey-8bit.png");
})();

// ─── Drawing helpers ───────────────────────────────────────────────────────
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  px: number, py: number,
  _char: CharDef,
  dir: Dir,
  _mouthAngle: number,
  flash: boolean
) {
  if (flash) return;

  if (caseySpriteLoaded && caseySpriteImg) {
    const size = CELL * 1.6;
    const drawX = px + CELL / 2 - size / 2;
    const drawY = py + CELL / 2 - size * 0.65;

    ctx.save();
    if (dir.dx === 1) {
      // flip horizontally for right-facing
      ctx.translate(drawX + size, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(caseySpriteImg, 0, 0, size, size);
    } else {
      // default sprite faces left
      ctx.drawImage(caseySpriteImg, drawX, drawY, size, size);
    }
    ctx.restore();
    return;
  }

  // Fallback circle if image not loaded yet
  const cx = px + CELL / 2;
  const cy = py + CELL / 2;
  const r = CELL * 0.42;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "#f97316";
  ctx.fill();
  ctx.restore();
}

function drawGhost(ctx: CanvasRenderingContext2D, px: number, py: number, ghost: Ghost, tick: number) {
  const cx = px + CELL / 2;
  const cy = py + CELL / 2;
  const r = CELL * 0.42;

  // Pupil direction offset — looks the way the ghost is heading
  const pdx = ghost.dir.dx * r * 0.06;
  const pdy = ghost.dir.dy * r * 0.06;

  if (ghost.eaten) {
    ctx.save();
    const eyeXs = [cx - r * 0.22, cx + r * 0.22];
    const eyeY  = cy - r * 0.1;

    if (ghost.regenTimer <= 1.0) {
      // ── Materializing phase: ghost body fades in + blinks faster ──
      const progress = 1 - ghost.regenTimer; // 0→1 as timer 1→0
      const blinkPeriod = Math.max(4, Math.round(10 - progress * 7));
      const bodyVisible = tick % blinkPeriod < Math.ceil(blinkPeriod / 2);
      if (bodyVisible) {
        ctx.globalAlpha = 0.25 + 0.75 * progress;
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.1, r, Math.PI, 0);
        ctx.lineTo(cx + r, cy + r * 0.6);
        const waveW2 = (r * 2) / 3;
        for (let w = 0; w < 3; w++) {
          const wx = cx + r - w * waveW2;
          ctx.quadraticCurveTo(wx - waveW2 * 0.25, cy + r * 1.1, wx - waveW2 * 0.5, cy + r * 0.6);
          ctx.quadraticCurveTo(wx - waveW2 * 0.75, cy + r * 0.1, wx - waveW2, cy + r * 0.6);
        }
        ctx.closePath();
        ctx.fillStyle = ghost.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else {
      // ── Regenerating phase: orbiting sparkle dots ──
      const numDots = 6;
      for (let s = 0; s < numDots; s++) {
        const angle = tick * 0.055 + (s * Math.PI * 2) / numDots;
        const orbitR = r * 1.05;
        const sx = cx + Math.cos(angle) * orbitR;
        const sy = eyeY + Math.sin(angle) * orbitR * 0.65;
        const dotAlpha = 0.35 + 0.55 * ((Math.cos(angle - tick * 0.055) + 1) / 2);
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.11, 0, Math.PI * 2);
        ctx.globalAlpha = dotAlpha;
        ctx.fillStyle = ghost.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Eyes always visible while eaten
    ctx.fillStyle = "#fff";
    for (const ex of eyeXs) {
      ctx.beginPath();
      ctx.arc(ex, eyeY, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#1a35cc";
    for (const ex of eyeXs) {
      ctx.beginPath();
      ctx.arc(ex + pdx, eyeY + pdy, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#fff";
    for (const ex of eyeXs) {
      ctx.beginPath();
      ctx.arc(ex + pdx + r * 0.04, eyeY + pdy - r * 0.04, r * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  const flashing = ghost.frightened && powerTimerRef_draw < 3 && tick % 30 < 15;
  const color = ghost.frightened
    ? (flashing ? "#dc2626" : "#2563eb")
    : ghost.color;

  ctx.save();

  // body
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.1, r, Math.PI, 0);
  ctx.lineTo(cx + r, cy + r * 0.6);
  // wavy bottom (3 bumps)
  const waves = 3;
  const waveW = (r * 2) / waves;
  for (let w = 0; w < waves; w++) {
    const wx = cx + r - w * waveW;
    ctx.quadraticCurveTo(wx - waveW * 0.25, cy + r * 1.1,  wx - waveW * 0.5, cy + r * 0.6);
    ctx.quadraticCurveTo(wx - waveW * 0.75, cy + r * 0.1,  wx - waveW,       cy + r * 0.6);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  if (!ghost.frightened) {
    // ── Normal eyes ──
    const eyeXs = [cx - r * 0.22, cx + r * 0.22];
    const eyeY  = cy - r * 0.18;
    // whites
    ctx.fillStyle = "#fff";
    for (const ex of eyeXs) {
      ctx.beginPath();
      ctx.arc(ex, eyeY, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    // pupils — centred in the white, nudged by direction
    ctx.fillStyle = "#1a35cc";
    for (const ex of eyeXs) {
      ctx.beginPath();
      ctx.arc(ex + pdx, eyeY + pdy, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    // tiny shine
    ctx.fillStyle = "#fff";
    for (const ex of eyeXs) {
      ctx.beginPath();
      ctx.arc(ex + pdx + r * 0.05, eyeY + pdy - r * 0.05, r * 0.03, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // ── Frightened face ──
    // dots for eyes
    ctx.fillStyle = "#fff";
    for (const ex of [cx - r * 0.2, cx + r * 0.2]) {
      ctx.beginPath();
      ctx.arc(ex, cy - r * 0.2, r * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
    // wobbly mouth
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.35, cy + r * 0.15);
    for (let i = 0; i <= 4; i++) {
      const tx = cx - r * 0.35 + i * (r * 0.7 / 4);
      const ty = cy + r * 0.15 + (i % 2 === 0 ? r * 0.1 : -r * 0.1);
      ctx.lineTo(tx, ty);
    }
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

// Module-level var so drawGhost can read power timer for flash timing
// (set each frame before calling drawGhost)
let powerTimerRef_draw = 8;

function drawMaze(ctx: CanvasRenderingContext2D, maze: number[][], tick: number, flag: string, powerActive: boolean, powerTimer: number) {
  const wallColor = "#1e40af";
  const wallHighlight = "#3b82f6";

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = maze[r][c];
      const px = c * CELL;
      const py = r * CELL;

      if (v === 1) {
        ctx.fillStyle = wallColor;
        ctx.fillRect(px, py, CELL, CELL);
        // inset highlight
        ctx.strokeStyle = wallHighlight;
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 2, py + 2, CELL - 4, CELL - 4);
      } else if (v === 0) {
        // dot
        ctx.beginPath();
        ctx.arc(px + CELL / 2, py + CELL / 2, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fef9c3";
        ctx.fill();
      } else if (v === 3) {
        // power flag
        const pulse = 0.8 + 0.2 * Math.sin(tick * 0.08);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.font = `${Math.round(CELL * 0.7)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(flag, px + CELL / 2, py + CELL / 2);
        ctx.restore();
      } else if (v === 4) {
        // ghost house
        ctx.fillStyle = "rgba(255,100,200,0.15)";
        ctx.fillRect(px, py, CELL, CELL);
      }
    }
  }

  // power timer bar
  if (powerActive) {
    const frac = powerTimer / 8;
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(0, H - 4, W * frac, 4);
  }
}

// ─── Main Game Component ───────────────────────────────────────────────────
type Phase = "select" | "playing" | "dead" | "levelComplete" | "gameOver" | "win";

// Central spawn — row 16 col 9 is confirmed empty (value 2, no dot)
const PLAYER_SPAWN_COL = 9;
const PLAYER_SPAWN_ROW = 16;
const PLAYER_DEAD_SECS  = 5;   // invisible wait before respawning
const PLAYER_FLASH_SECS = 2;   // flashing invincibility after respawn

interface PlayerState {
  col: number; row: number;
  px: number; py: number;
  dir: Dir; nextDir: Dir;
  mouthAngle: number; mouthDir: number;
  dead: boolean;      // invisible, waiting to respawn
  deadTimer: number;  // countdown to respawn
  flash: boolean;     // flashing invincibility after respawn
  flashTimer: number;
}

export function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedChar, setSelectedChar] = useState<CharDef>(CHARACTERS[2]); // Jeff default
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [levelIndex, setLevelIndex] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem("pacman-hs") || "0"); } catch { return 0; }
  });

  const phaseRef       = useRef<Phase>("select");
  const mazeRef        = useRef<number[][]>(makeMaze());
  const playerRef      = useRef<PlayerState>({ col:PLAYER_SPAWN_COL, row:PLAYER_SPAWN_ROW, px:PLAYER_SPAWN_COL*CELL, py:PLAYER_SPAWN_ROW*CELL, dir:LEFT, nextDir:LEFT, mouthAngle:0, mouthDir:1, dead:false, deadTimer:0, flash:false, flashTimer:0 });
  const ghostsRef      = useRef<Ghost[]>(makeGhosts());
  const scoreRef       = useRef(0);
  const livesRef       = useRef(3);
  const levelRef       = useRef(0);   // absolute index into LEVELS[]
  const roundRef       = useRef(0);   // rounds completed this game (0-based) — drives difficulty
  const dotsLeftRef    = useRef(0);
  const powerRef       = useRef(false);
  const powerTimerRef  = useRef(0);
  const tickRef        = useRef(0);
  const lastTimeRef    = useRef(0);
  const charRef        = useRef<CharDef>(CHARACTERS[2]);
  const bgImgRef       = useRef<HTMLImageElement | null>(null);
  const bgLoadedRef    = useRef(false);
  const bgUrlRef       = useRef("");
  const animRef        = useRef<number>(0);
  const ghostEatCount  = useRef(0);

  const initLevel = useCallback((lvlIdx: number) => {
    const maze = makeMaze();
    mazeRef.current = maze;
    dotsLeftRef.current = countDots(maze);
    playerRef.current = { col:PLAYER_SPAWN_COL, row:PLAYER_SPAWN_ROW, px:PLAYER_SPAWN_COL*CELL, py:PLAYER_SPAWN_ROW*CELL, dir:LEFT, nextDir:LEFT, mouthAngle:0, mouthDir:1, dead:false, deadTimer:0, flash:false, flashTimer:0 };
    ghostsRef.current = makeGhosts();
    powerRef.current = false;
    powerTimerRef.current = 0;
    ghostEatCount.current = 0;

    // Load background
    const lvl = LEVELS[lvlIdx] ?? LEVELS[0];
    const url = asset(`/book3-nt/${lvl.page}.png`);
    if (url !== bgUrlRef.current) {
      bgLoadedRef.current = false;
      bgUrlRef.current = url;
      const img = new Image();
      img.onload = () => { bgImgRef.current = img; bgLoadedRef.current = true; };
      img.src = url;
    }
  }, []);

  const startGame = useCallback((char: CharDef) => {
    charRef.current = char;
    scoreRef.current = 0;
    livesRef.current = 3;
    roundRef.current = 0;
    // Start on a random country each game
    const startIdx = Math.floor(Math.random() * LEVELS.length);
    levelRef.current = startIdx;
    setScore(0);
    setLives(3);
    setLevelIndex(startIdx);
    initLevel(startIdx);
    phaseRef.current = "playing";
    setPhase("playing");
  }, [initLevel]);


  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const p = playerRef.current;
      switch (e.key) {
        case "ArrowUp":    case "w": case "W": p.nextDir = UP;    e.preventDefault(); break;
        case "ArrowDown":  case "s": case "S": p.nextDir = DOWN;  e.preventDefault(); break;
        case "ArrowLeft":  case "a": case "A": p.nextDir = LEFT;  e.preventDefault(); break;
        case "ArrowRight": case "d": case "D": p.nextDir = RIGHT; e.preventDefault(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Touch / swipe
  useEffect(() => {
    let tx0 = 0, ty0 = 0;
    const onStart = (e: TouchEvent) => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - tx0;
      const dy = e.changedTouches[0].clientY - ty0;
      if (Math.abs(dx) > Math.abs(dy)) playerRef.current.nextDir = dx > 0 ? RIGHT : LEFT;
      else playerRef.current.nextDir = dy > 0 ? DOWN : UP;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => { window.removeEventListener("touchstart", onStart); window.removeEventListener("touchend", onEnd); };
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    lastTimeRef.current = performance.now();

    function loop(now: number) {
      if (phaseRef.current !== "playing") return;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      tickRef.current++;

      const maze  = mazeRef.current;
      const p     = playerRef.current;
      const ghosts = ghostsRef.current;
      const lvlIdx = levelRef.current;
      const lvl   = LEVELS[lvlIdx] ?? LEVELS[0];
      const audio = audioRef.current;

      // ── Power timer ──
      if (powerRef.current) {
        powerTimerRef.current -= dt;
        if (powerTimerRef.current <= 0) {
          powerRef.current = false;
          ghosts.forEach(g => { g.frightened = false; });
          ghostEatCount.current = 0;
        }
      }

      // ── Player dead — waiting to respawn ──
      if (p.dead) {
        p.deadTimer -= dt;
        if (p.deadTimer <= 0) {
          // Respawn at centre
          p.col = PLAYER_SPAWN_COL; p.row = PLAYER_SPAWN_ROW;
          p.px  = PLAYER_SPAWN_COL * CELL; p.py = PLAYER_SPAWN_ROW * CELL;
          p.dir = LEFT; p.nextDir = LEFT;
          p.dead = false;
          p.flash = true; p.flashTimer = PLAYER_FLASH_SECS;
          // Reset ghosts so they don't immediately kill the respawned player
          ghostsRef.current = makeGhosts();
          powerRef.current = false; powerTimerRef.current = 0;
        }
        // Skip movement and collision while dead
        // (still draw maze and ghosts below)
      }

      // ── Spawn-invincibility flash countdown ──
      if (p.flash && !p.dead) {
        p.flashTimer -= dt;
        if (p.flashTimer <= 0) p.flash = false;
      }

      // ── Player movement (skip while dead) ──
      if (!p.dead) {
        const spd = playerSpeed(roundRef.current);
        const pxTarget = p.col * CELL;
        const pyTarget = p.row * CELL;
        const atCenter = Math.abs(p.px - pxTarget) < 2 && Math.abs(p.py - pyTarget) < 2;

        if (atCenter) {
          p.px = pxTarget; p.py = pyTarget;
          // Try queued direction first
          const nc = p.col + p.nextDir.dx;
          const nr = p.row + p.nextDir.dy;
          if (isWalkable(maze, nc, nr)) p.dir = p.nextDir;

          // Move in current direction
          const mc = p.col + p.dir.dx;
          const mr = p.row + p.dir.dy;
          // Wrap only when actually leaving the screen edge
          if (mc < 0 || mc >= COLS) {
            const wrapC = ((mc % COLS) + COLS) % COLS;
            if (isWalkable(maze, wrapC, mr)) {
              p.col = wrapC; p.row = mr;
              p.px = wrapC * CELL; p.py = mr * CELL; // snap so no glide across screen
            }
          } else if (isWalkable(maze, mc, mr)) {
            p.col = mc; p.row = mr;
          }
        } else {
          // Slide toward cell centre
          const moveAmt = spd * CELL * dt;
          const pxTarget2 = p.col * CELL;
          const pyTarget2 = p.row * CELL;
          const dx = pxTarget2 - p.px;
          const dy = pyTarget2 - p.py;
          if (Math.abs(dx) > 0) p.px += Math.sign(dx) * Math.min(moveAmt, Math.abs(dx));
          if (Math.abs(dy) > 0) p.py += Math.sign(dy) * Math.min(moveAmt, Math.abs(dy));
        }
      }

      // ── Mouth animation ──
      p.mouthAngle += p.mouthDir * 4;
      if (p.mouthAngle >= 40) p.mouthDir = -1;
      if (p.mouthAngle <= 0)  p.mouthDir = 1;

      // ── Eat dots/flags (skip while dead) ──
      const pc = p.col, pr = p.row;
      if (!p.dead && maze[pr]?.[pc] === 0) {
        maze[pr][pc] = 2;
        scoreRef.current += 10;
        dotsLeftRef.current--;
        if (audio) sfxEat(audio);
      } else if (!p.dead && maze[pr]?.[pc] === 3) {
        maze[pr][pc] = 2;
        scoreRef.current += 50;
        dotsLeftRef.current--;
        powerRef.current = true;
        powerTimerRef.current = 8;
        ghostEatCount.current = 0;
        ghosts.forEach(g => { if (!g.eaten) g.frightened = true; });
        if (audio) sfxPower(audio);
      }

      setScore(scoreRef.current);

      // ── Level complete ──
      if (dotsLeftRef.current <= 0) {
        if (audio) sfxLevelUp(audio);
        roundRef.current++;
        // Win after completing all 21 countries
        if (roundRef.current >= LEVELS.length) {
          phaseRef.current = "win";
          setPhase("win");
          return;
        }
        // Wrap around the level list so we always have a country to show
        const nextLvl = (lvlIdx + 1) % LEVELS.length;
        levelRef.current = nextLvl;
        setLevelIndex(nextLvl);
        initLevel(nextLvl);
        phaseRef.current = "levelComplete";
        setPhase("levelComplete");
        setTimeout(() => {
          phaseRef.current = "playing";
          setPhase("playing");
        }, 2000);
        return;
      }

      // ── Ghost logic ──
      for (const g of ghosts) {
        // ── Regen countdown (ghost sitting in house) ──
        if (g.eaten) {
          g.regenTimer -= dt;
          if (g.regenTimer <= 0) {
            // Respawn — place at house centre, begin exiting
            g.eaten = false;
            g.frightened = false;
            g.col = GHOST_RESPAWN_COL; g.row = GHOST_RESPAWN_ROW;
            g.px  = GHOST_RESPAWN_COL * CELL; g.py = GHOST_RESPAWN_ROW * CELL;
            g.dir = UP;   // start moving up — LEFT gets trapped at (col 8, row 10)
            g.exiting = true;
            g.moveTimer = 0;
          }
          continue; // no movement while regenerating
        }

        // ── Normal / frightened movement ──
        if (!g.moving) continue;
        g.moveTimer -= dt;
        if (g.moveTimer > 0) continue;
        g.moveTimer = 0;

        const spd2 = ghostSpeed(g.frightened, roundRef.current);
        const gxTarget = g.col * CELL;
        const gyTarget = g.row * CELL;
        const gAtCenter = Math.abs(g.px - gxTarget) < 2 && Math.abs(g.py - gyTarget) < 2;

        if (gAtCenter) {
          g.px = gxTarget; g.py = gyTarget;

          // Once the ghost clears the house roof (row 6), it roams freely
          if (g.exiting && g.row <= 6) g.exiting = false;

          let target: { col: number; row: number };
          if (g.exiting) {
            // Navigate straight up and out — ignore player position until free
            target = { col: GHOST_RESPAWN_COL, row: 0 };
            g.dir = chooseDirForGhost(g, maze, target);
          } else if (g.frightened) {
            g.dir = randomDir(g, maze);
            target = { col: g.col + g.dir.dx, row: g.row + g.dir.dy };
          } else {
            if (g.id === 0) target = { col: p.col, row: p.row };
            else if (g.id === 1) target = { col: p.col + p.dir.dx * 4, row: p.row + p.dir.dy * 4 };
            else if (g.id === 2) {
              const bx = ghosts[0].col, by = ghosts[0].row;
              const ax = p.col + p.dir.dx * 2, ay = p.row + p.dir.dy * 2;
              target = { col: 2 * ax - bx, row: 2 * ay - by };
            } else {
              const dist = Math.hypot(g.col - p.col, g.row - p.row);
              target = dist > 8 ? { col: p.col, row: p.row } : g.scatterTarget;
            }
            g.dir = chooseDirForGhost(g, maze, target);
          }

          const nc = g.col + g.dir.dx;
          const nr = g.row + g.dir.dy;
          const wrapC2 = ((nc % COLS) + COLS) % COLS;
          if (isGhostWalkable(maze, wrapC2, nr)) {
            g.col = wrapC2; g.row = nr;
          }
        } else {
          const moveAmt = spd2 * CELL * dt;
          const dx = gxTarget - g.px;
          const dy = gyTarget - g.py;
          if (Math.abs(dx) > 0) g.px += Math.sign(dx) * Math.min(moveAmt, Math.abs(dx));
          if (Math.abs(dy) > 0) g.py += Math.sign(dy) * Math.min(moveAmt, Math.abs(dy));
        }
      }

      // ── Collision: player vs ghosts (skip while dead or invincible) ──
      for (const g of ghosts) {
        if (g.eaten || p.dead || p.flash) continue;
        const dist = Math.hypot(p.px - g.px, p.py - g.py);
        if (dist < CELL * 0.75) {
          if (g.frightened) {
            g.frightened = false;
            g.eaten = true;
            g.regenTimer = GHOST_REGEN_SECS;
            // Teleport eyes to ghost house immediately
            g.col = GHOST_RESPAWN_COL; g.row = GHOST_RESPAWN_ROW;
            g.px  = GHOST_RESPAWN_COL * CELL; g.py = GHOST_RESPAWN_ROW * CELL;
            ghostEatCount.current++;
            const pts = 200 * Math.pow(2, ghostEatCount.current - 1);
            scoreRef.current += pts;
            setScore(scoreRef.current);
            if (audio) sfxGhostEat(audio);
          } else {
            // player dies — go invisible for 5 seconds then respawn at centre
            if (audio) sfxDie(audio);
            livesRef.current--;
            setLives(livesRef.current);
            if (livesRef.current <= 0) {
              const hs = Math.max(highScore, scoreRef.current);
              setHighScore(hs);
              try { localStorage.setItem("pacman-hs", String(hs)); } catch {}
              phaseRef.current = "gameOver";
              setPhase("gameOver");
              return;
            }
            p.dead = true; p.deadTimer = PLAYER_DEAD_SECS;
            p.flash = false;
          }
        }
      }

      // ─── Draw ────────────────────────────────────────────────────────────
      ctx.clearRect(0, 0, W, H);

      // background image
      if (bgLoadedRef.current && bgImgRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.drawImage(bgImgRef.current, 0, 0, W, H);
        ctx.restore();
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, W, H);
      }

      // expose power timer to drawGhost for flash-when-expiring logic
      powerTimerRef_draw = powerTimerRef.current;
      drawMaze(ctx, maze, tickRef.current, lvl.flag, powerRef.current, powerTimerRef.current);

      // ghosts
      for (const g of ghosts) {
        drawGhost(ctx, g.px, g.py, g, tickRef.current);
      }

      // player — hidden while dead; flickers during spawn invincibility
      if (!p.dead) {
        const invisible = p.flash && Math.floor(tickRef.current / 8) % 2 === 0;
        drawPlayer(ctx, p.px, p.py, charRef.current, p.dir, p.mouthAngle, invisible);
      }

      animRef.current = requestAnimationFrame(loop);
    }

    if (!audioRef.current) audioRef.current = createAudioCtx();
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, initLevel, highScore]);

  // ─── Canvas scale — fit everything in one viewport ───────────────────────
  const [canvasScale, setCanvasScale] = useState(1);
  useLayoutEffect(() => {
    function calc() {
      // Fixed heights of all non-canvas UI (px):
      //   HUD 36 + gap 6 + border 6 + hint 22 + gap 6 + dpad 128 + gap 6 + padding 16
      const NON_CANVAS_H = 226;
      const NON_CANVAS_W = 16; // left+right padding
      const availH = window.innerHeight - NON_CANVAS_H;
      const availW = window.innerWidth  - NON_CANVAS_W;
      const s = Math.min(1, availH / H, availW / W);
      setCanvasScale(Math.max(0.4, s));
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // ─── D-pad for mobile ────────────────────────────────────────────────────
  const dpad = (dir: Dir) => { playerRef.current.nextDir = dir; };

  // ─── Render ───────────────────────────────────────────────────────────────
  const lvl = LEVELS[levelIndex] ?? LEVELS[0];

  if (phase === "select") {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-950 text-white p-4 overflow-hidden" style={{ height: "100dvh" }}>
        <div className="mb-6 text-center">
          <div className="text-5xl mb-2">🕹️</div>
          <h1 className="text-4xl font-black tracking-wider" style={{ fontFamily: "monospace", textShadow: "0 0 20px #3b82f6" }}>
            JANGLES PAC
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Travel the world, eat the flags!</p>
        </div>

        <p className="text-yellow-400 font-bold mb-4 tracking-widest text-sm">CHOOSE YOUR CHARACTER</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {CHARACTERS.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedChar(char)}
              className="relative px-6 py-4 rounded-xl border-2 transition-all duration-150 font-bold text-lg"
              style={{
                borderColor: selectedChar.id === char.id ? char.color : "#374151",
                background: selectedChar.id === char.id ? `${char.color}22` : "#111827",
                color: char.color,
                boxShadow: selectedChar.id === char.id ? `0 0 20px ${char.color}55` : "none",
              }}
            >
              <CharPreview char={char} />
              <div className="mt-2">{char.name}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => startGame(selectedChar)}
          className="px-10 py-4 rounded-xl text-xl font-black tracking-widest transition-all"
          style={{
            background: selectedChar.color,
            color: "#000",
            boxShadow: `0 0 30px ${selectedChar.color}88`,
            fontFamily: "monospace",
          }}
        >
          START GAME
        </button>

        {highScore > 0 && (
          <p className="mt-4 text-gray-500 text-sm font-mono">HIGH SCORE: {highScore}</p>
        )}
      </div>
    );
  }

  if (phase === "gameOver") {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-950 text-white p-4 overflow-hidden" style={{ height: "100dvh" }}>
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-4xl font-black font-mono text-red-500 mb-2">GAME OVER</h2>
        <p className="text-2xl font-mono text-yellow-400 mb-1">SCORE: {score}</p>
        <p className="text-sm font-mono text-gray-400 mb-8">HIGH SCORE: {highScore}</p>
        <div className="flex gap-4">
          <button onClick={() => { phaseRef.current = "select"; setPhase("select"); }}
            className="px-8 py-3 bg-blue-600 rounded-xl font-bold text-lg hover:bg-blue-500">
            Menu
          </button>
          <button onClick={() => startGame(charRef.current)}
            className="px-8 py-3 bg-green-600 rounded-xl font-bold text-lg hover:bg-green-500">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (phase === "win") {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-950 text-white p-4 overflow-hidden" style={{ height: "100dvh" }}>
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-4xl font-black font-mono text-yellow-400 mb-2">YOU WIN!</h2>
        <p className="text-lg font-mono text-gray-300 mb-1">Traveled all {LEVELS.length} countries!</p>
        <p className="text-2xl font-mono text-yellow-400 mb-8">SCORE: {score}</p>
        <button onClick={() => { phaseRef.current = "select"; setPhase("select"); }}
          className="px-8 py-3 bg-blue-600 rounded-xl font-bold text-lg hover:bg-blue-500">
          Play Again
        </button>
      </div>
    );
  }

  const scaledW = Math.round(W * canvasScale);
  const scaledH = Math.round(H * canvasScale);

  return (
    <div className="flex flex-col items-center bg-gray-950 text-white overflow-hidden"
         style={{ height: "100dvh" }}>

      {/* ── HUD ── */}
      <div className="flex items-center justify-between w-full px-3 shrink-0"
           style={{ height: 36 }}>
        <div className="font-mono text-yellow-400 text-xs font-bold">
          SCORE: <span className="text-white">{score}</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs font-bold">
          <span className="text-gray-400">{lvl.country}</span>
          <span>{lvl.flag}</span>
          <span className="text-gray-500">· {levelIndex + 1}/{LEVELS.length}</span>
        </div>
        <div className="font-mono text-sm font-bold">
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} style={{ color: charRef.current.color }}>♥</span>
          ))}
        </div>
      </div>

      {/* ── Canvas (CSS-scaled to fit) ── */}
      <div className="shrink-0 relative"
           style={{
             width: scaledW + 6,
             height: scaledH + 6,
             border: "3px solid #1e40af",
             borderRadius: 8,
             boxShadow: "0 0 24px #1e40af88",
             overflow: "hidden",
           }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            display: "block",
            imageRendering: "pixelated",
            width: scaledW,
            height: scaledH,
          }}
        />
        {phase === "levelComplete" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded">
            <div className="text-4xl mb-1">{lvl.flag}</div>
            <div className="text-xl font-black font-mono text-yellow-400">LEVEL CLEAR!</div>
            <div className="text-gray-300 mt-1 font-mono text-xs">
              Next: {LEVELS[(levelIndex + 1) % LEVELS.length]?.country}
            </div>
          </div>
        )}
      </div>

      {/* ── Hint ── */}
      <div className="shrink-0 text-xs text-gray-500 font-mono text-center" style={{ height: 22, lineHeight: "22px" }}>
        Eat {lvl.flag} → 8 sec power-up!
      </div>

      {/* ── D-pad ── */}
      <div className="shrink-0 grid gap-1"
           style={{
             gridTemplateColumns: "repeat(3, 40px)",
             gridTemplateRows: "repeat(3, 40px)",
           }}>
        <div /><DBtn label="▲" onClick={() => dpad(UP)} /><div />
        <DBtn label="◀" onClick={() => dpad(LEFT)} />
        <div style={{ background: "#1e293b", borderRadius: 6 }} />
        <DBtn label="▶" onClick={() => dpad(RIGHT)} />
        <div /><DBtn label="▼" onClick={() => dpad(DOWN)} /><div />
      </div>

    </div>
  );
}

function DBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onPointerDown={onClick}
      className="flex items-center justify-center rounded-lg text-white font-bold select-none active:opacity-60"
      style={{ background: "#1e3a5f", border: "2px solid #3b82f6", width: 40, height: 40, touchAction: "none", fontSize: 15 }}
    >
      {label}
    </button>
  );
}

function CharPreview({ char }: { char: CharDef }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 64, 64);
    const fakePlayer: PlayerState = {
      col:0, row:0, px:0, py:0, dir:RIGHT,
      nextDir:RIGHT, mouthAngle:25, mouthDir:1,
      dead:false, deadTimer:0, flash:false, flashTimer:0,
    };
    drawPlayer(ctx, 0, 0, char, fakePlayer.dir, fakePlayer.mouthAngle, false);
  }, [char]);
  return <canvas ref={canvasRef} width={CELL} height={CELL} style={{ imageRendering: "pixelated", margin: "0 auto", display: "block" }} />;
}
