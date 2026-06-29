import { useEffect, useRef, useState, useCallback } from "react";
import { asset } from "@/lib/asset";
import { useAuth } from "@/lib/auth-context";
import { useScore } from "@/hooks/use-score";
import { useArcadeSession } from "@/lib/arcade-session-context";

// ── Characters ─────────────────────────────────────────────────────────────
const CHARACTERS = [
  { id: "casey" as const, name: "Casey", color: "#f97316", spriteUrl: "/characters/casey-8bit.png" },
  { id: "jaime" as const, name: "Jaime", color: "#3b82f6", spriteUrl: "/characters/jaime-8bit.png" },
  { id: "jeff"  as const, name: "Jeff",  color: "#22c55e", spriteUrl: "/characters/jeff-8bit.png"  },
];
type CharDef = typeof CHARACTERS[0];

// ── Audio ─────────────────────────────────────────────────────────────────
function makeAudio(): AudioContext | null {
  try { return new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
}
function tone(ctx: AudioContext, freq: number, dur: number, type: OscillatorType = "square", vol = 0.1, delay = 0) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
  g.gain.setValueAtTime(vol, ctx.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
  o.start(ctx.currentTime + delay); o.stop(ctx.currentTime + delay + dur + 0.01);
}
function sfxJump(ctx: AudioContext)  { tone(ctx, 440, 0.08, "square", 0.10); tone(ctx, 587, 0.08, "square", 0.08, 0.07); }
function sfxDie(ctx: AudioContext)   { [440,349,294,220,165].forEach((f,i) => tone(ctx, f, 0.14, "sawtooth", 0.18, i*0.1)); }
function sfxBonus(ctx: AudioContext) { [523,659,784,1047].forEach((f,i) => tone(ctx, f, 0.09, "square", 0.12, i*0.08)); }
function sfxThrow(ctx: AudioContext) { tone(ctx, 180, 0.1, "sawtooth", 0.07); }
function sfxWin(ctx: AudioContext)   {
  [523,659,784,1047,1175,1319,1568].forEach((f,i) => tone(ctx, f, 0.18, "square", 0.16, i*0.09));
}

// ── Country levels ────────────────────────────────────────────────────────
interface KongLevel { country: string; flag: string; music: string; bgTint: string; }
const KONG_LEVELS: KongLevel[] = [
  { country: "USA",          flag: "🇺🇸", music: "NEW ORLEANS.wav",  bgTint: "#001830" },
  { country: "Mexico",       flag: "🇲🇽", music: "MEXICO.wav",        bgTint: "#0a1a00" },
  { country: "Jamaica",      flag: "🇯🇲", music: "JAMAICA.wav",       bgTint: "#001a10" },
  { country: "England",      flag: "🇬🇧", music: "ENGLAND.wav",       bgTint: "#0a001a" },
  { country: "Japan",        flag: "🇯🇵", music: "JAPAN.wav",         bgTint: "#1a0010" },
  { country: "France",       flag: "🇫🇷", music: "FRANCE.wav",        bgTint: "#000e1a" },
  { country: "Kenya",        flag: "🇰🇪", music: "KENYA.wav",         bgTint: "#0a0a00" },
  { country: "Spain",        flag: "🇪🇸", music: "SPAIN1.2.wav",      bgTint: "#1a0800" },
  { country: "Italy",        flag: "🇮🇹", music: "ITALY.wav",         bgTint: "#001a0a" },
  { country: "Peru",         flag: "🇵🇪", music: "PERU.wav",          bgTint: "#10000a" },
  { country: "Ghana",        flag: "🇬🇭", music: "GHANA.wav",         bgTint: "#0a0800" },
  { country: "South Korea",  flag: "🇰🇷", music: "SOUTH KOREA.wav",  bgTint: "#00101a" },
];

function shuffleLevels(): number[] {
  const arr = KONG_LEVELS.map((_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Constants ─────────────────────────────────────────────────────────────
const W = 480, H = 560;
const GRAVITY    = 0.17;
const JUMP_V     = -5;
const MOVE_SPEED = 2.2;
const CLIMB_SPD  = 1.8;
const MAX_FALL   = 9;
const PLAYER_W   = 32, PLAYER_H = 40;
const COMPASS_R  = 7;

// ── Platform layout ───────────────────────────────────────────────────────
const PLATFORMS = [
  { x: 0,   y: 520, w: W   },
  { x: 0,   y: 420, w: 360 },
  { x: 120, y: 320, w: 360 },
  { x: 0,   y: 220, w: 360 },
  { x: 120, y: 120, w: 360 },
];
const LADDERS = [
  { x: 55,  yTop: 420, yBot: 520 },
  { x: 320, yTop: 320, yBot: 420 },
  { x: 130, yTop: 220, yBot: 320 },
  { x: 340, yTop: 120, yBot: 220 },
];

function makeHats() {
  return [
    { x: 170, y: 492, collected: false },
    { x: 270, y: 492, collected: false },
    { x: 90,  y: 392, collected: false },
    { x: 220, y: 392, collected: false },
    { x: 200, y: 292, collected: false },
    { x: 330, y: 292, collected: false },
    { x: 90,  y: 192, collected: false },
    { x: 290, y: 192, collected: false },
  ];
}

// ── Confetti ──────────────────────────────────────────────────────────────
interface Confetti {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  w: number; h: number;
  angle: number; spin: number;
}

const CONFETTI_COLORS = ["#ffd700","#ff4444","#44ff88","#4488ff","#ff88ff","#ffaa00","#ff88aa","#88ffff"];

function makeConfetti(): Confetti[] {
  return Array.from({ length: 80 }, (_, i) => ({
    x: (i / 80) * W + (Math.random() - 0.5) * 40,
    y: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 5,
    vy: 2.5 + Math.random() * 3.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    w: 6 + Math.random() * 8,
    h: 4 + Math.random() * 4,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.25,
  }));
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Player {
  x: number; y: number; prevY: number;
  vx: number; vy: number;
  onGround: boolean;
  onLadder: boolean;
  facingLeft: boolean;
  frame: number;
  frameTimer: number;
  dead: boolean;
  deadTimer: number;
}

interface Compass {
  x: number; y: number; prevY: number;
  vx: number; vy: number;
  onGround: boolean;
  angle: number;
  id: number;
}

interface GameState {
  player: Player;
  compasses: Compass[];
  hats: { x: number; y: number; collected: boolean }[];
  confetti: Confetti[];
  score: number;
  lives: number;
  level: number;
  levelOrder: number[];
  phase: "title" | "playing" | "winPause" | "win" | "gameover";
  throwTimer: number;
  throwInterval: number;
  compassId: number;
  jeffFrame: number;
  jeffFrameTimer: number;
}

function makePlayer(): Player {
  return {
    x: 40, y: 470, prevY: 470,
    vx: 0, vy: 0,
    onGround: false, onLadder: false,
    facingLeft: false,
    frame: 0, frameTimer: 0,
    dead: false, deadTimer: 0,
  };
}

function makeState(level = 1, lives = 3, score = 0, levelOrder?: number[]): GameState {
  const order = levelOrder ?? shuffleLevels();
  return {
    player: makePlayer(),
    compasses: [],
    hats: makeHats(),
    confetti: [],
    score,
    lives,
    level,
    levelOrder: order,
    phase: "playing",
    throwTimer: 0,
    throwInterval: Math.max(155 - (level - 1) * 13, 38),
    compassId: 0,
    jeffFrame: 0,
    jeffFrameTimer: 0,
  };
}

// ── Collision helpers ─────────────────────────────────────────────────────
function rectsOverlap(ax: number, ay: number, aw: number, ah: number,
                       bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function checkPlayerLanding(prevBottomY: number, curBottomY: number, leftX: number, rightX: number): number | null {
  if (curBottomY < prevBottomY) return null;
  for (const plat of PLATFORMS) {
    if (prevBottomY <= plat.y && curBottomY >= plat.y &&
        rightX > plat.x + 4 && leftX < plat.x + plat.w - 4) {
      return plat.y;
    }
  }
  return null;
}

function checkPlayerCeiling(prevTopY: number, curTopY: number, leftX: number, rightX: number): number | null {
  if (curTopY > prevTopY) return null;
  for (const plat of PLATFORMS) {
    const platBottom = plat.y + 10;
    if (prevTopY >= platBottom && curTopY < platBottom &&
        rightX > plat.x + 4 && leftX < plat.x + plat.w - 4) {
      return platBottom;
    }
  }
  return null;
}

function checkCompassLanding(prevBottomY: number, curBottomY: number, cx: number): number | null {
  if (curBottomY < prevBottomY) return null;
  for (const plat of PLATFORMS) {
    if (prevBottomY <= plat.y && curBottomY >= plat.y &&
        cx + COMPASS_R > plat.x + 4 && cx - COMPASS_R < plat.x + plat.w - 4) {
      return plat.y;
    }
  }
  return null;
}

function onLadderCheck(p: Player): { on: boolean; snapX: number; yBot: number; yTop: number } {
  const cx = p.x + PLAYER_W / 2;
  const cy = p.y + PLAYER_H / 2;
  for (const l of LADDERS) {
    if (Math.abs(cx - (l.x + 8)) < 20 && cy > l.yTop - 4 && cy < l.yBot + 4) {
      return { on: true, snapX: l.x - 8, yBot: l.yBot, yTop: l.yTop };
    }
  }
  return { on: false, snapX: 0, yBot: 0, yTop: 0 };
}

// ── Drawing ───────────────────────────────────────────────────────────────
function drawPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.fillStyle = "#7B3F10";
  ctx.fillRect(x, y, w, 10);
  ctx.fillStyle = "#A05228";
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle = "#C87840";
  for (let rx = x + 24; rx < x + w - 12; rx += 44) {
    ctx.beginPath(); ctx.arc(rx, y + 5, 3, 0, Math.PI * 2); ctx.fill();
  }
}

function drawLadder(ctx: CanvasRenderingContext2D, x: number, yTop: number, yBot: number) {
  ctx.strokeStyle = "#C8960A";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 2, yTop);  ctx.lineTo(x + 2, yBot);  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 14, yTop); ctx.lineTo(x + 14, yBot); ctx.stroke();
  ctx.lineWidth = 2;
  for (let ry = yTop + 10; ry < yBot; ry += 16) {
    ctx.beginPath(); ctx.moveTo(x + 2, ry); ctx.lineTo(x + 14, ry); ctx.stroke();
  }
}

function drawCompass(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, COMPASS_R, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a2e"; ctx.fill();
  ctx.strokeStyle = "#e8c84a"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = "#e8c84a"; ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (COMPASS_R - 4), Math.sin(a) * (COMPASS_R - 4));
    ctx.lineTo(Math.cos(a) * COMPASS_R,       Math.sin(a) * COMPASS_R);
    ctx.stroke();
  }
  ctx.fillStyle = "#e8c84a"; ctx.font = "bold 6px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -(COMPASS_R - 7)); ctx.fillText("S", 0, (COMPASS_R - 7));
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-2.5, 0); ctx.lineTo(0, -(COMPASS_R - 4)); ctx.lineTo(2.5, 0); ctx.closePath();
  ctx.fillStyle = "#e84040"; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-2.5, 0); ctx.lineTo(0, (COMPASS_R - 4)); ctx.lineTo(2.5, 0); ctx.closePath();
  ctx.fillStyle = "#f0f0f0"; ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd700"; ctx.fill();
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawHat(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.fillStyle = "#FFD700"; ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("♪", x, y);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawFlag(ctx: CanvasRenderingContext2D, lvl: KongLevel, frame: number) {
  const cx = W / 2;
  const glow = 0.35 + 0.2 * Math.sin(Date.now() * 0.004);
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = "#ffd700";
  ctx.beginPath(); ctx.arc(cx, 78, 42, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.font = "52px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(lvl.flag, cx, 78);
  const bobY = frame === 1 ? 1 : 0;
  ctx.font = "bold 12px monospace";
  const nameW = ctx.measureText(lvl.country).width + 16;
  ctx.fillStyle = "#1a1a1a"; ctx.fillRect(cx - nameW / 2, 104 + bobY, nameW, 18);
  ctx.fillStyle = "#ffd700"; ctx.fillText(lvl.country, cx, 113 + bobY);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.restore();
}

// Sprites face left by default (same as Pac characters).
// Flip horizontally when facing right so the character looks the correct way.
function drawPlayer(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, p: Player, color: string) {
  ctx.save();
  if (p.dead && Math.floor(p.deadTimer / 5) % 2 === 0) { ctx.restore(); return; }
  // When facing left (default sprite orientation): no flip. When facing right: flip.
  const drawX = p.facingLeft ? p.x : p.x + PLAYER_W;
  ctx.translate(drawX, p.y);
  ctx.scale(p.facingLeft ? 1 : -1, 1);
  if (img && img.complete) {
    ctx.drawImage(img, 0, 0, PLAYER_W, PLAYER_H);
  } else {
    ctx.fillStyle = color; ctx.fillRect(0, 0, PLAYER_W, PLAYER_H);
    ctx.fillStyle = "#fff"; ctx.font = "8px monospace"; ctx.fillText("?", 10, 24);
  }
  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, s: GameState, lvl: KongLevel) {
  ctx.save();
  ctx.fillStyle = "#ffd700"; ctx.font = "bold 13px monospace";
  ctx.fillText(`${s.score}pts`, 8, 17);
  ctx.textAlign = "center";
  ctx.fillText(`${lvl.flag} ${lvl.country}  Lv.${s.level}`, W / 2, 17);
  ctx.textAlign = "right";
  ctx.fillText("♥".repeat(Math.max(0, s.lives)), W - 8, 17);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, playerImg: HTMLImageElement | null, charColor: string) {
  ctx.save();
  ctx.fillStyle = "#aa0000"; ctx.fillRect(40, 48, 400, 82);
  ctx.strokeStyle = "#ff4444"; ctx.lineWidth = 3; ctx.strokeRect(40, 48, 400, 82);
  ctx.fillStyle = "#fff"; ctx.font = "bold 28px monospace"; ctx.textAlign = "center";
  ctx.fillText("JANGLES KONG", W / 2, 93);
  ctx.font = "13px monospace"; ctx.fillStyle = "#ffd700";
  ctx.fillText("Climb to the flag! Collect the music!", W / 2, 117);
  if (playerImg?.complete) ctx.drawImage(playerImg, 50, 165, 70, 90);
  else {
    ctx.fillStyle = charColor; ctx.fillRect(50, 165, 70, 90);
  }
  ctx.font = "36px serif"; ctx.textBaseline = "middle";
  const flags = ["🇺🇸","🇲🇽","🇯🇲","🇬🇧","🇯🇵","🇫🇷","🇰🇪","🇪🇸","🇮🇹","🇵🇪","🇬🇭","🇰🇷"];
  flags.forEach((f, i) => ctx.fillText(f, W - 170 + (i % 4) * 36, 188 + Math.floor(i / 4) * 44));
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ccc"; ctx.font = "12px monospace";
  ctx.fillText("← → run   ↑ ↓ climb ladders", W / 2, 340);
  ctx.fillText("SPACE / ↑ to jump over compasses 🧭", W / 2, 360);
  ctx.fillText("Collect ♪ notes for bonus points", W / 2, 378);
  ctx.fillText("Reach the flag! Each game: random countries!", W / 2, 396);
  ctx.fillStyle = Math.sin(Date.now() * 0.005) > 0 ? "#ffd700" : "#ff9900";
  ctx.font = "bold 15px monospace";
  ctx.fillText("PRESS ANY KEY TO START", W / 2, 460);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawConfetti(ctx: CanvasRenderingContext2D, confetti: Confetti[]) {
  for (const c of confetti) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle);
    ctx.fillStyle = c.color;
    ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
    ctx.restore();
  }
}

function drawWinOverlay(ctx: CanvasRenderingContext2D, s: GameState, lvlDef: KongLevel) {
  drawConfetti(ctx, s.confetti);
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.68)"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  const pulse = 1 + 0.08 * Math.sin(Date.now() * 0.008);
  ctx.save();
  ctx.translate(W / 2, H / 2 - 80);
  ctx.scale(pulse, pulse);
  ctx.font = "72px serif"; ctx.textBaseline = "middle";
  ctx.fillText(lvlDef.flag, 0, 0);
  ctx.restore();
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffd700"; ctx.font = "bold 28px monospace";
  ctx.fillText(`${lvlDef.country}!`, W / 2, H / 2 - 18);
  ctx.font = "14px monospace"; ctx.fillStyle = "#44ff88";
  ctx.fillText("🎵 Music playing!", W / 2, H / 2 + 14);
  ctx.font = "15px monospace"; ctx.fillStyle = "#fff";
  ctx.fillText(`+${1000 * s.level} bonus pts`, W / 2, H / 2 + 40);
  const nextLvlDef = KONG_LEVELS[s.levelOrder[s.level % s.levelOrder.length]];
  ctx.fillStyle = "#aaa"; ctx.font = "12px monospace";
  ctx.fillText(`Next: ${nextLvlDef.flag} ${nextLvlDef.country}`, W / 2, H / 2 + 66);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawGameOver(ctx: CanvasRenderingContext2D, score: number) {
  ctx.save();
  ctx.fillStyle = "#aa0000"; ctx.fillRect(60, 185, 360, 155);
  ctx.strokeStyle = "#ff5555"; ctx.lineWidth = 3; ctx.strokeRect(60, 185, 360, 155);
  ctx.fillStyle = "#fff"; ctx.font = "bold 30px monospace"; ctx.textAlign = "center";
  ctx.fillText("GAME OVER", W / 2, 238);
  ctx.font = "15px monospace"; ctx.fillStyle = "#ffd700";
  ctx.fillText(`Score: ${score}`, W / 2, 275);
  ctx.fillStyle = Math.sin(Date.now() * 0.005) > 0 ? "#fff" : "#ffd700";
  ctx.font = "13px monospace";
  ctx.fillText("SPACE or tap to play again", W / 2, 315);
  ctx.textAlign = "left";
  ctx.restore();
}

// ── Main component ────────────────────────────────────────────────────────
export function JanglesKongGame() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const stateRef       = useRef<GameState>({ ...makeState(), phase: "title" });
  const keysRef        = useRef<Set<string>>(new Set());
  const audioRef       = useRef<AudioContext | null>(null);
  const bgMusicRef     = useRef<HTMLAudioElement | null>(null);
  const rafRef         = useRef<number>(0);
  const playerImgRef   = useRef<HTMLImageElement | null>(null);
  const [, rerender]   = useState(0);

  // Character select state — drives the select screen before the game canvas
  const [screenPhase, setScreenPhase]   = useState<"select" | "game">("select");
  const [selectedChar, setSelectedChar] = useState<CharDef>(CHARACTERS[0]);
  const selectedCharRef                 = useRef<CharDef>(CHARACTERS[0]);

  const { user } = useAuth();
  const { saveScore } = useScore("jangles-kong");
  const saveScoreRef = useRef(saveScore);
  useEffect(() => { saveScoreRef.current = saveScore; }, [saveScore]);

  const { endSession } = useArcadeSession();
  const endSessionRef = useRef(endSession);
  useEffect(() => { endSessionRef.current = endSession; }, [endSession]);

  const stopMusic = useCallback(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.src = "";
      bgMusicRef.current = null;
    }
  }, []);

  const playCountryMusic = useCallback((level: KongLevel) => {
    stopMusic();
    const el = new Audio(asset(`/music/${level.music}`));
    el.volume = 0.55;
    bgMusicRef.current = el;
    el.play().catch(() => {});
  }, [stopMusic]);

  const getAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = makeAudio();
    audioRef.current?.resume();
    return audioRef.current;
  }, []);

  // Load character sprite whenever selected character changes
  useEffect(() => {
    const img = new Image();
    img.src = asset(selectedChar.spriteUrl);
    playerImgRef.current = img;
    selectedCharRef.current = selectedChar;
  }, [selectedChar]);

  const startGame = useCallback((char: CharDef) => {
    const img = new Image();
    img.src = asset(char.spriteUrl);
    playerImgRef.current = img;
    selectedCharRef.current = char;
    stateRef.current = { ...makeState(), phase: "title" };
    setScreenPhase("game");
    rerender(n => n + 1);
  }, []);

  // keyboard — only active while game canvas is visible
  useEffect(() => {
    if (screenPhase !== "game") return;
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault();
      const s = stateRef.current;
      if (s.phase === "title") {
        getAudio();
        keysRef.current.clear();
        stateRef.current = makeState(1);
        rerender(n => n + 1);
      }
      if (s.phase === "gameover" && (e.key === " " || e.key === "Enter")) {
        keysRef.current.clear();
        stopMusic();
        endSessionRef.current();
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [getAudio, screenPhase]);

  // game loop
  useEffect(() => {
    if (screenPhase !== "game") return;
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) { rafRef.current = requestAnimationFrame(tick); return; }
      const ctx = canvas.getContext("2d");
      if (!ctx)   { rafRef.current = requestAnimationFrame(tick); return; }
      rafRef.current = requestAnimationFrame(tick);

      const s    = stateRef.current;
      const keys = keysRef.current;
      const char = selectedCharRef.current;

      const lvlDef = KONG_LEVELS[s.levelOrder[(s.level - 1) % s.levelOrder.length]];

      if (s.phase === "winPause") {
        for (const c of s.confetti) {
          c.x += c.vx + Math.sin(Date.now() * 0.002 + c.angle) * 0.5;
          c.y += c.vy;
          c.angle += c.spin;
          if (c.y > H + 20) { c.y = -10 - Math.random() * 40; c.x = Math.random() * W; }
        }
      }

      if (s.phase === "playing") {
        const p = s.player;

        if (++s.jeffFrameTimer > 18) { s.jeffFrame = (s.jeffFrame + 1) % 2; s.jeffFrameTimer = 0; }

        // Spawn compasses
        if (++s.throwTimer >= s.throwInterval) {
          s.throwTimer = 0;
          const ac = getAudio(); if (ac) sfxThrow(ac);
          const spd = 1.0 + (s.level - 1) * 0.28;
          const goRight = s.compassId % 2 === 0;
          s.compasses.push({
            x: goRight ? 210 : 270, y: 115, prevY: 115,
            vx: goRight ? spd : -spd, vy: 0,
            onGround: false, angle: 0, id: s.compassId++,
          });
          if (s.level >= 6 && Math.random() < 0.4) {
            const spd2 = spd * (0.8 + Math.random() * 0.4);
            s.compasses.push({
              x: goRight ? 270 : 210, y: 115, prevY: 115,
              vx: goRight ? -spd2 : spd2, vy: 0,
              onGround: false, angle: 0, id: s.compassId++,
            });
          }
        }

        // Compass physics
        for (const c of s.compasses) {
          c.prevY = c.y;
          c.vy = Math.min(c.vy + GRAVITY * 0.75, MAX_FALL);
          c.x += c.vx;
          c.y += c.vy;
          c.angle += 0.07 * (c.vx > 0 ? 1 : -1);
          const landY = checkCompassLanding(c.prevY + COMPASS_R, c.y + COMPASS_R, c.x);
          if (landY !== null) { c.y = landY - COMPASS_R; c.vy = 0; c.onGround = true; }
          else { c.onGround = false; }
          if (c.x - COMPASS_R < 0)  { c.x = COMPASS_R;     c.vx =  Math.abs(c.vx); }
          if (c.x + COMPASS_R > W)  { c.x = W - COMPASS_R; c.vx = -Math.abs(c.vx); }
        }
        s.compasses = s.compasses.filter(c => c.y < H + 60);

        // Player input & physics
        if (!p.dead) {
          const ladder = onLadderCheck(p);

          if (!p.onLadder) {
            if      (keys.has("ArrowLeft"))  { p.vx = -MOVE_SPEED; p.facingLeft = true; }
            else if (keys.has("ArrowRight")) { p.vx =  MOVE_SPEED; p.facingLeft = false; }
            else                              p.vx = 0;
          } else {
            p.vx = 0;
          }

          if (ladder.on && (keys.has("ArrowUp") || keys.has("ArrowDown"))) {
            const goingDown = keys.has("ArrowDown");
            const atBottom  = goingDown  && (p.y + PLAYER_H >= ladder.yBot - 2);
            // Snap onto platform when player center reaches the top of the ladder
            const atTop     = !goingDown && (p.y + PLAYER_H / 2 <= ladder.yTop + 2);
            if (atTop) {
              p.y       = ladder.yTop - PLAYER_H;
              p.vy      = 0; p.vx = 0;
              p.onLadder  = false;
              p.onGround  = true;
            } else if (!atBottom) {
              p.onLadder = true; p.x = ladder.snapX;
              p.vy = goingDown ? CLIMB_SPD : -CLIMB_SPD; p.vx = 0;
            } else {
              p.onLadder = false; p.vy = 0; p.onGround = true;
            }
          } else if (p.onLadder && !ladder.on) {
            // Exited from the top while climbing up — snap onto the platform
            if (p.vy < 0) {
              const cx = p.x + PLAYER_W / 2;
              for (const l of LADDERS) {
                if (Math.abs(cx - (l.x + 8)) < 24) {
                  p.y        = l.yTop - PLAYER_H;
                  p.vy       = 0;
                  p.onGround = true;
                  break;
                }
              }
            }
            p.onLadder = false;
          } else if (p.onLadder && !keys.has("ArrowUp") && !keys.has("ArrowDown")) {
            p.vy = 0;
          }

          if ((keys.has(" ") || keys.has("ArrowUp")) && p.onGround && !p.onLadder) {
            p.vy = JUMP_V; p.onGround = false;
            const ac = getAudio(); if (ac) sfxJump(ac);
          }
        }

        if (!p.onLadder) p.vy = Math.min(p.vy + GRAVITY, MAX_FALL);

        const oldBottomY = p.prevY + PLAYER_H;
        p.prevY = p.y;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 0;
        if (p.x + PLAYER_W > W) p.x = W - PLAYER_W;

        if (!p.onLadder) {
          const landY = checkPlayerLanding(oldBottomY, p.y + PLAYER_H, p.x, p.x + PLAYER_W);
          if (landY !== null) {
            p.y = landY - PLAYER_H; p.vy = 0; p.onGround = true;
          } else {
            p.onGround = false;
          }
          const ceilY = checkPlayerCeiling(p.prevY, p.y, p.x, p.x + PLAYER_W);
          if (ceilY !== null) { p.y = ceilY; p.vy = 0; }
        }

        const GROUND_Y = PLATFORMS[0].y;
        if (p.y + PLAYER_H > GROUND_Y) {
          p.y = GROUND_Y - PLAYER_H; p.vy = 0; p.onGround = true; p.onLadder = false;
        }

        if (p.y > H + 20 && !p.dead) {
          p.dead = true; p.deadTimer = 100;
          const ac = getAudio(); if (ac) sfxDie(ac);
        }

        if (++p.frameTimer > 8) { p.frame = (p.frame + 1) % 4; p.frameTimer = 0; }

        if (p.dead) {
          if (--p.deadTimer <= 0) {
            s.lives--;
            if (s.lives <= 0) {
              s.phase = "gameover";
              if (user) saveScoreRef.current(s.score);
            } else {
              s.player = makePlayer(); s.compasses = [];
            }
          }
        }

        // Hat collection
        if (!p.dead) {
          for (const hat of s.hats) {
            if (!hat.collected && rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, hat.x - 10, hat.y - 10, 20, 20)) {
              hat.collected = true; s.score += 50;
              const ac = getAudio(); if (ac) sfxBonus(ac);
            }
          }
        }

        // Compass hit
        if (!p.dead) {
          for (const c of s.compasses) {
            const playerTop     = p.y;
            const playerBottom  = p.y + PLAYER_H;
            const compassTop    = c.y - COMPASS_R;
            const compassBottom = c.y + COMPASS_R;
            const playerCenterX = p.x + PLAYER_W / 2;
            const horizOverlap  = Math.abs(playerCenterX - c.x) < PLAYER_W / 2 + COMPASS_R - 3;
            const vertOverlap   = playerTop < compassBottom && playerBottom > compassTop + 4;
            if (horizOverlap && vertOverlap) {
              p.dead = true; p.deadTimer = 100;
              const ac = getAudio(); if (ac) sfxDie(ac);
              break;
            }
          }
        }

        // Reach the flag
        if (!p.dead) {
          if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, 150, 55, 200, 68)) {
            s.score += 1000 * s.level;
            const ac = getAudio(); if (ac) sfxWin(ac);
            playCountryMusic(lvlDef);
            s.confetti = makeConfetti();
            s.phase = "winPause";
            const capturedOrder = s.levelOrder;
            const capturedLives = s.lives;
            const capturedScore = s.score;
            const capturedLevel = s.level;
            setTimeout(() => {
              if (stateRef.current.phase === "winPause") {
                stopMusic();
                stateRef.current = makeState(capturedLevel + 1, capturedLives, capturedScore, capturedOrder);
                rerender(n => n + 1);
              }
            }, 5000);
          }
        }
      }

      // ── Draw ──────────────────────────────────────────────────────────
      ctx.fillStyle = lvlDef?.bgTint ?? "#000814"; ctx.fillRect(0, 0, W, H);

      // starfield
      ctx.fillStyle = "#ffffff22";
      for (let i = 0; i < 45; i++) {
        ctx.fillRect((i * 139 + 23) % W, (i * 97 + 41) % (H - 30), 1, 1);
      }

      if (s.phase === "title") {
        drawTitle(ctx, playerImgRef.current, char.color);
        return;
      }
      if (s.phase === "gameover") {
        drawGameOver(ctx, s.score);
        return;
      }

      for (const plat of PLATFORMS) drawPlatform(ctx, plat.x, plat.y, plat.w);
      for (const l of LADDERS)    drawLadder(ctx, l.x, l.yTop, l.yBot);
      for (const hat of s.hats)   if (!hat.collected) drawHat(ctx, hat.x, hat.y);
      drawFlag(ctx, lvlDef, s.jeffFrame);
      for (const c of s.compasses) drawCompass(ctx, c.x, c.y, c.angle);
      drawPlayer(ctx, playerImgRef.current, s.player, char.color);
      drawHUD(ctx, s, lvlDef);

      if (s.phase === "winPause") drawWinOverlay(ctx, s, lvlDef);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [getAudio, playCountryMusic, stopMusic, screenPhase]);

  // touch controls
  const touchStart = useCallback((dir: string) => {
    keysRef.current.add(dir);
    getAudio();
    const s = stateRef.current;
    if (s.phase === "title")    { stateRef.current = makeState(1); rerender(n => n + 1); }
    if (s.phase === "gameover") { stopMusic(); endSessionRef.current(); }
  }, [getAudio]);
  const touchEnd = useCallback((dir: string) => keysRef.current.delete(dir), []);

  // ── Character select screen ────────────────────────────────────────────
  if (screenPhase === "select") {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-950 text-white p-4"
        style={{ minHeight: "100dvh" }}
      >
        <div className="mb-6 text-center">
          <div className="text-5xl mb-2">🕹️</div>
          <h1
            className="text-4xl font-black tracking-wider"
            style={{ fontFamily: "monospace", textShadow: "0 0 20px #ef4444" }}
          >
            JANGLES KONG
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Climb to the flag! Dodge the compasses!</p>
        </div>

        <p className="text-yellow-400 font-bold mb-6 tracking-widest text-xs">CHOOSE YOUR CHARACTER</p>

        <div className="flex items-end justify-center gap-8 mb-8">
          {CHARACTERS.map(char => {
            const isSelected = selectedChar.id === char.id;
            return (
              <button
                key={char.id}
                onClick={() => setSelectedChar(char)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                className="flex flex-col items-center gap-2 transition-all"
              >
                <img
                  src={asset(char.spriteUrl)}
                  alt={char.name}
                  style={{
                    height: isSelected ? 130 : 96,
                    imageRendering: "pixelated",
                    opacity: isSelected ? 1 : 0.5,
                    transition: "all 0.15s ease",
                    filter: isSelected ? `drop-shadow(0 0 10px ${char.color})` : "none",
                    transform: "scaleX(-1)", // sprites face left; flip to show them facing the player
                  }}
                />
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: isSelected ? char.color : "#6b7280", transition: "color 0.15s" }}
                >
                  {char.name}
                </span>
              </button>
            );
          })}
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
      </div>
    );
  }

  // ── Game canvas ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center bg-gray-950 overflow-y-auto" style={{ minHeight: "100dvh" }}>
      <div className="flex flex-col items-center gap-3 py-4 px-2">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{
            imageRendering: "pixelated",
            maxWidth: "min(100vw - 16px, 480px)",
            display: "block",
            cursor: "none",
            borderRadius: 12,
            border: "3px solid #333",
          }}
        />
        <div className="flex gap-4 select-none">
          <div className="flex gap-2">
            <button onPointerDown={() => touchStart("ArrowLeft")}  onPointerUp={() => touchEnd("ArrowLeft")}  onPointerLeave={() => touchEnd("ArrowLeft")}
              className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 text-white text-2xl font-bold active:bg-white/25 touch-none">◀</button>
            <button onPointerDown={() => touchStart("ArrowRight")} onPointerUp={() => touchEnd("ArrowRight")} onPointerLeave={() => touchEnd("ArrowRight")}
              className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 text-white text-2xl font-bold active:bg-white/25 touch-none">▶</button>
          </div>
          <div className="flex gap-2">
            <button onPointerDown={() => touchStart("ArrowUp")}   onPointerUp={() => touchEnd("ArrowUp")}   onPointerLeave={() => touchEnd("ArrowUp")}
              className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 text-white text-2xl font-bold active:bg-white/25 touch-none">▲</button>
            <button onPointerDown={() => touchStart("ArrowDown")} onPointerUp={() => touchEnd("ArrowDown")} onPointerLeave={() => touchEnd("ArrowDown")}
              className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 text-white text-2xl font-bold active:bg-white/25 touch-none">▼</button>
            <button onPointerDown={() => touchStart(" ")} onPointerUp={() => touchEnd(" ")} onPointerLeave={() => touchEnd(" ")}
              className="w-14 h-14 rounded-xl bg-yellow-400/80 border border-yellow-300 text-black text-sm font-extrabold active:bg-yellow-300 touch-none">JUMP</button>
          </div>
        </div>
        <p className="text-white/40 text-xs text-center">Arrow keys to move &amp; climb · Space / ↑ to jump</p>
      </div>
    </div>
  );
}
