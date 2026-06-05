import { useEffect, useRef, useState, useCallback } from "react";
import { asset } from "@/lib/asset";

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
function sfxWin(ctx: AudioContext)   { [523,587,659,784,880,1047].forEach((f,i) => tone(ctx, f, 0.13, "square", 0.13, i*0.1)); }

// ── Country levels ────────────────────────────────────────────────────────
interface KongLevel { country: string; flag: string; music: string; bgTint: string; }
const KONG_LEVELS: KongLevel[] = [
  { country: "USA",          flag: "🇺🇸", music: "NEW ORLEANS.wav",                    bgTint: "#001830" },
  { country: "Mexico",       flag: "🇲🇽", music: "MEXICO.wav",                          bgTint: "#0a1a00" },
  { country: "Jamaica",      flag: "🇯🇲", music: "JAMAICA.wav",                         bgTint: "#001a10" },
  { country: "England",      flag: "🇬🇧", music: "ENGLAND.wav",                         bgTint: "#0a001a" },
  { country: "Japan",        flag: "🇯🇵", music: "JAPAN.wav",                           bgTint: "#1a0010" },
  { country: "France",       flag: "🇫🇷", music: "FRANCE.wav",                          bgTint: "#000e1a" },
  { country: "Kenya",        flag: "🇰🇪", music: "KENYA.wav",                           bgTint: "#0a0a00" },
  { country: "Spain",        flag: "🇪🇸", music: "SPAIN1.2.wav",                        bgTint: "#1a0800" },
  { country: "Italy",        flag: "🇮🇹", music: "ITALY.wav",                           bgTint: "#001a0a" },
  { country: "Peru",         flag: "🇵🇪", music: "PERU.wav",                            bgTint: "#10000a" },
  { country: "Ghana",        flag: "🇬🇭", music: "GHANA.wav",                           bgTint: "#0a0800" },
  { country: "South Korea",  flag: "🇰🇷", music: "SOUTH KOREA.wav",                    bgTint: "#00101a" },
];

// ── Constants ─────────────────────────────────────────────────────────────
const W = 480, H = 560;
const GRAVITY    = 0.30;   // slightly lower → more hang time
const JUMP_V     = -6;     // small jump — clears a compass, can't skip a platform
const MOVE_SPEED = 2.2;
const CLIMB_SPD  = 1.8;
const MAX_FALL   = 9;
const PLAYER_W   = 32, PLAYER_H = 40;
const COMPASS_R  = 10;     // smaller — easier to jump over

// ── Platform layout (x, y, w) ─────────────────────────────────────────────
const PLATFORMS = [
  { x: 0,   y: 520, w: W   },  // ground
  { x: 0,   y: 420, w: 360 },  // row 1 — left-anchored, gap on right
  { x: 120, y: 320, w: 360 },  // row 2 — right-anchored, gap on left
  { x: 0,   y: 220, w: 360 },  // row 3 — left-anchored
  { x: 120, y: 120, w: 360 },  // row 4 — Jeff's perch
];

// Ladders: x is left edge, connects platform above to platform below
const LADDERS = [
  { x: 55,  yTop: 420, yBot: 520 },
  { x: 320, yTop: 320, yBot: 420 },
  { x: 130, yTop: 220, yBot: 320 },
  { x: 340, yTop: 120, yBot: 220 },
];

// Collectible notes/hats on each platform
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
  angle: number;   // spinning rotation in radians
  id: number;
}

interface GameState {
  player: Player;
  compasses: Compass[];
  hats: { x: number; y: number; collected: boolean }[];
  score: number;
  lives: number;
  level: number;
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

function makeState(level = 1, lives = 3, score = 0): GameState {
  return {
    player: makePlayer(),
    compasses: [],
    hats: makeHats(),
    score,
    lives,
    level,
    phase: "playing",
    throwTimer: 0,
    throwInterval: Math.max(160 - (level - 1) * 10, 80),  // starts slow
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

// Returns the platform y the player should land on, or null
function checkPlayerLanding(prevBottomY: number, curBottomY: number, leftX: number, rightX: number): number | null {
  if (curBottomY < prevBottomY) return null; // moving upward — no landing
  for (const plat of PLATFORMS) {
    if (prevBottomY <= plat.y && curBottomY >= plat.y &&
        rightX > plat.x + 4 && leftX < plat.x + plat.w - 4) {
      return plat.y;
    }
  }
  return null;
}

// Returns the platform y a compass should land on, or null
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

function onLadderCheck(p: Player): { on: boolean; snapX: number; yBot: number } {
  const cx = p.x + PLAYER_W / 2;
  const cy = p.y + PLAYER_H / 2;
  for (const l of LADDERS) {
    if (Math.abs(cx - (l.x + 8)) < 20 && cy > l.yTop - 4 && cy < l.yBot + 4) {
      return { on: true, snapX: l.x - 8, yBot: l.yBot };
    }
  }
  return { on: false, snapX: 0, yBot: 0 };
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

  // outer ring
  ctx.beginPath(); ctx.arc(0, 0, COMPASS_R, 0, Math.PI * 2);
  ctx.fillStyle = "#1a1a2e"; ctx.fill();
  ctx.strokeStyle = "#e8c84a"; ctx.lineWidth = 2.5; ctx.stroke();

  // cardinal tick marks
  ctx.strokeStyle = "#e8c84a"; ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (COMPASS_R - 4), Math.sin(a) * (COMPASS_R - 4));
    ctx.lineTo(Math.cos(a) * COMPASS_R,       Math.sin(a) * COMPASS_R);
    ctx.stroke();
  }

  // N / S labels (tiny)
  ctx.fillStyle = "#e8c84a";
  ctx.font = "bold 6px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -(COMPASS_R - 7));
  ctx.fillText("S", 0,  (COMPASS_R - 7));

  // spinning needle (red = north, white = south)
  ctx.save();
  ctx.rotate(angle);
  // north half — red
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2.5, 0);
  ctx.lineTo(0, -(COMPASS_R - 4));
  ctx.lineTo(2.5, 0);
  ctx.closePath();
  ctx.fillStyle = "#e84040"; ctx.fill();
  // south half — white
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2.5, 0);
  ctx.lineTo(0,  (COMPASS_R - 4));
  ctx.lineTo(2.5, 0);
  ctx.closePath();
  ctx.fillStyle = "#f0f0f0"; ctx.fill();
  ctx.restore();

  // center dot
  ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd700"; ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawHat(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  // music note collectible
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 14px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("♪", x, y);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawFlag(ctx: CanvasRenderingContext2D, lvl: KongLevel, frame: number) {
  const cx = W / 2;

  // pulsing glow behind flag
  const glow = 0.35 + 0.2 * Math.sin(Date.now() * 0.004);
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = "#ffd700";
  ctx.beginPath(); ctx.arc(cx, 78, 42, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // flag emoji — big
  ctx.font = "52px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(lvl.flag, cx, 78);

  // slight bob on frame
  const bobY = frame === 1 ? 1 : 0;

  // country name badge
  ctx.font = "bold 12px monospace";
  const nameW = ctx.measureText(lvl.country).width + 16;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(cx - nameW / 2, 104 + bobY, nameW, 18);
  ctx.fillStyle = "#ffd700";
  ctx.fillText(lvl.country, cx, 113 + bobY);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.restore();
}

function drawCasey(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, p: Player) {
  ctx.save();
  // flash when dead
  if (p.dead && Math.floor(p.deadTimer / 5) % 2 === 0) { ctx.restore(); return; }

  const drawX = p.facingLeft ? p.x + PLAYER_W : p.x;
  ctx.translate(drawX, p.y);
  ctx.scale(p.facingLeft ? -1 : 1, 1);

  if (img && img.complete) {
    ctx.drawImage(img, 0, 0, PLAYER_W, PLAYER_H);
  } else {
    ctx.fillStyle = "#f97316";
    ctx.fillRect(0, 0, PLAYER_W, PLAYER_H);
    ctx.fillStyle = "#fff"; ctx.font = "8px monospace"; ctx.fillText("C", 10, 24);
  }
  ctx.restore();
}

function drawHUD(ctx: CanvasRenderingContext2D, s: GameState, lvl: KongLevel) {
  ctx.save();
  ctx.fillStyle = "#ffd700"; ctx.font = "bold 13px monospace";
  ctx.fillText(`${s.score}pts`, 8, 17);
  ctx.textAlign = "center";
  ctx.fillText(`${lvl.flag} ${lvl.country}`, W / 2, 17);
  ctx.textAlign = "right";
  ctx.fillText("♥".repeat(Math.max(0, s.lives)), W - 8, 17);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, casey: HTMLImageElement | null) {
  ctx.save();
  ctx.fillStyle = "#aa0000";
  ctx.fillRect(40, 48, 400, 82);
  ctx.strokeStyle = "#ff4444"; ctx.lineWidth = 3;
  ctx.strokeRect(40, 48, 400, 82);
  ctx.fillStyle = "#fff"; ctx.font = "bold 28px monospace"; ctx.textAlign = "center";
  ctx.fillText("JANGLES KONG", W / 2, 93);
  ctx.font = "13px monospace"; ctx.fillStyle = "#ffd700";
  ctx.fillText("Climb to the flag! Collect the music!", W / 2, 117);

  // Casey on left, flags on right
  if (casey?.complete) ctx.drawImage(casey, 50, 165, 70, 90);

  // sample flags from first few levels
  ctx.font = "36px serif"; ctx.textBaseline = "middle";
  const flags = ["🇺🇸","🇲🇽","🇯🇲","🇬🇧","🇯🇵","🇫🇷"];
  flags.forEach((f, i) => ctx.fillText(f, W - 130 + (i % 3) * 38, 195 + Math.floor(i / 3) * 44));
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#f97316"; ctx.font = "bold 13px monospace";
  ctx.fillText("CASEY", 62, 268);

  ctx.fillStyle = "#ccc"; ctx.font = "12px monospace";
  ctx.fillText("← → run   ↑ ↓ climb ladders", W / 2, 340);
  ctx.fillText("SPACE / ↑ to jump over compasses 🧭", W / 2, 360);
  ctx.fillText("Collect ♪ notes for bonus points", W / 2, 380);
  ctx.fillText("Reach the flag 🏳 at the top — hear", W / 2, 400);
  ctx.fillText("the country's music when you arrive!", W / 2, 418);

  ctx.fillStyle = Math.sin(Date.now() * 0.005) > 0 ? "#ffd700" : "#ff9900";
  ctx.font = "bold 15px monospace";
  ctx.fillText("PRESS ANY KEY TO START", W / 2, 460);
  ctx.textAlign = "left";
  ctx.restore();
}

function drawWinOverlay(ctx: CanvasRenderingContext2D, s: GameState, lvl: KongLevel) {
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.72)"; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";

  // big flag
  ctx.font = "64px serif";
  ctx.textBaseline = "middle";
  ctx.fillText(lvl.flag, W / 2, H / 2 - 70);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffd700"; ctx.font = "bold 26px monospace";
  ctx.fillText(`${lvl.country}!`, W / 2, H / 2 - 14);

  ctx.font = "15px monospace"; ctx.fillStyle = "#fff";
  ctx.fillText(`+${1000 * s.level} bonus`, W / 2, H / 2 + 18);

  const nextLvl = KONG_LEVELS[s.level % KONG_LEVELS.length];
  ctx.fillStyle = "#aaa"; ctx.font = "12px monospace";
  ctx.fillText(`Next: ${nextLvl.flag} ${nextLvl.country}`, W / 2, H / 2 + 46);

  ctx.textAlign = "left"; ctx.restore();
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
  ctx.fillText("SPACE or tap JUMP to play again", W / 2, 315);
  ctx.textAlign = "left"; ctx.restore();
}

// ── Main component ────────────────────────────────────────────────────────
export function JanglesKongGame() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const stateRef     = useRef<GameState>({ ...makeState(), phase: "title" });
  const keysRef      = useRef<Set<string>>(new Set());
  const audioRef    = useRef<AudioContext | null>(null);
  const bgMusicRef  = useRef<HTMLAudioElement | null>(null);
  const rafRef      = useRef<number>(0);
  const caseyImgRef = useRef<HTMLImageElement | null>(null);
  const [, rerender] = useState(0);

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

  useEffect(() => {
    const casey = new Image(); casey.src = asset("/characters/casey-8bit.png");
    caseyImgRef.current = casey;
  }, []);

  const getAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = makeAudio();
    audioRef.current?.resume();
    return audioRef.current;
  }, []);

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)) e.preventDefault();
      const s = stateRef.current;
      if (s.phase === "title") {
        getAudio();
        keysRef.current.clear();   // ← prevent the start key from becoming a move input
        stateRef.current = makeState(1);
        rerender(n => n + 1);
      }
      if (s.phase === "gameover" && (e.key === " " || e.key === "Enter")) {
        keysRef.current.clear();
        stateRef.current = makeState(1);
        rerender(n => n + 1);
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [getAudio]);

  // game loop
  useEffect(() => {
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) { rafRef.current = requestAnimationFrame(tick); return; }
      const ctx = canvas.getContext("2d");
      if (!ctx)    { rafRef.current = requestAnimationFrame(tick); return; }
      rafRef.current = requestAnimationFrame(tick);

      const s   = stateRef.current;
      const keys = keysRef.current;

      if (s.phase === "playing") {
        const p = s.player;

        // ── Jeff animation
        if (++s.jeffFrameTimer > 18) { s.jeffFrame = (s.jeffFrame + 1) % 2; s.jeffFrameTimer = 0; }

        // ── Spawn compass
        if (++s.throwTimer >= s.throwInterval) {
          s.throwTimer = 0;
          const ac = getAudio(); if (ac) sfxThrow(ac);
          const goRight = s.compassId % 2 === 0;
          const spd = 1.2 + (s.level - 1) * 0.2;
          s.compasses.push({
            x: goRight ? 210 : 270, y: 115, prevY: 115,
            vx: goRight ? spd : -spd, vy: 0,
            onGround: false, angle: 0, id: s.compassId++,
          });
        }

        // ── Compass physics
        for (const c of s.compasses) {
          c.prevY = c.y;
          c.vy = Math.min(c.vy + GRAVITY * 0.75, MAX_FALL);
          c.x += c.vx;
          c.y += c.vy;
          c.angle += 0.07 * (c.vx > 0 ? 1 : -1);  // spin direction matches travel

          const landY = checkCompassLanding(c.prevY + COMPASS_R, c.y + COMPASS_R, c.x);
          if (landY !== null) {
            c.y = landY - COMPASS_R;
            c.vy = 0;
            c.onGround = true;
          } else {
            c.onGround = false;
          }

          // wall bounce
          if (c.x - COMPASS_R < 0)  { c.x = COMPASS_R;     c.vx =  Math.abs(c.vx); }
          if (c.x + COMPASS_R > W)  { c.x = W - COMPASS_R; c.vx = -Math.abs(c.vx); }
        }
        // cull compasses that fell off bottom
        s.compasses = s.compasses.filter(c => c.y < H + 60);

        // ── Player input & physics
        if (!p.dead) {
          const ladder = onLadderCheck(p);

          // horizontal — disabled while on ladder
          if (!p.onLadder) {
            if      (keys.has("ArrowLeft"))  { p.vx = -MOVE_SPEED; p.facingLeft = true; }
            else if (keys.has("ArrowRight")) { p.vx =  MOVE_SPEED; p.facingLeft = false; }
            else                              p.vx = 0;
          } else {
            p.vx = 0;
          }

          // grab / ride ladder
          if (ladder.on && (keys.has("ArrowUp") || keys.has("ArrowDown"))) {
            const goingDown = keys.has("ArrowDown");
            // block downward movement when already at the bottom of this ladder
            const atBottom = goingDown && (p.y + PLAYER_H >= ladder.yBot - 2);
            if (!atBottom) {
              p.onLadder = true;
              p.x = ladder.snapX;
              p.vy = goingDown ? CLIMB_SPD : -CLIMB_SPD;
              p.vx = 0;
            } else {
              // sit on ground, don't enter ladder
              p.onLadder = false;
              p.vy = 0;
              p.onGround = true;
            }
          } else if (p.onLadder && !ladder.on) {
            // stepped off top or bottom of ladder
            p.onLadder = false;
          } else if (p.onLadder && !keys.has("ArrowUp") && !keys.has("ArrowDown")) {
            p.vy = 0; // hold still on ladder
          }

          // jump — only from ground, not while climbing
          if ((keys.has(" ") || keys.has("ArrowUp")) && p.onGround && !p.onLadder) {
            p.vy = JUMP_V;
            p.onGround = false;
            const ac = getAudio(); if (ac) sfxJump(ac);
          }
        }

        // gravity (skip when on ladder)
        if (!p.onLadder) p.vy = Math.min(p.vy + GRAVITY, MAX_FALL);

        // save prevY, then move
        const oldBottomY = p.prevY + PLAYER_H;
        p.prevY = p.y;
        p.x += p.vx;
        p.y += p.vy;

        // clamp to walls
        if (p.x < 0) p.x = 0;
        if (p.x + PLAYER_W > W) p.x = W - PLAYER_W;

        // platform landing
        if (!p.onLadder) {
          const landY = checkPlayerLanding(oldBottomY, p.y + PLAYER_H, p.x, p.x + PLAYER_W);
          if (landY !== null) {
            p.y = landY - PLAYER_H;
            p.vy = 0;
            p.onGround = true;
          } else {
            p.onGround = false;
          }
        }

        // hard floor — never let the player sink below ground platform
        const GROUND_Y = PLATFORMS[0].y;
        if (p.y + PLAYER_H > GROUND_Y) {
          p.y = GROUND_Y - PLAYER_H;
          p.vy = 0;
          p.onGround = true;
          p.onLadder = false;
        }

        // fell off screen (walked off the side gap in a platform)
        if (p.y > H + 20 && !p.dead) {
          p.dead = true; p.deadTimer = 100;
          const ac = getAudio(); if (ac) sfxDie(ac);
        }

        // walk animation
        if (++p.frameTimer > 8) { p.frame = (p.frame + 1) % 4; p.frameTimer = 0; }

        // death countdown
        if (p.dead) {
          if (--p.deadTimer <= 0) {
            s.lives--;
            if (s.lives <= 0) {
              s.phase = "gameover";
            } else {
              s.player    = makePlayer();
              s.compasses = [];
            }
          }
        }

        // ── Hat / note collection
        if (!p.dead) {
          for (const hat of s.hats) {
            if (!hat.collected && rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, hat.x - 10, hat.y - 10, 20, 20)) {
              hat.collected = true;
              s.score += 50;
              const ac = getAudio(); if (ac) sfxBonus(ac);
            }
          }
        }

        // ── Compass hit detection — full 2-axis overlap check
        // Horizontal: player body overlaps compass width
        // Vertical:   compass is actually AT the player's level (not above or below)
        //             + jump allowance: feet must be >4px below compass top to count
        if (!p.dead) {
          for (const c of s.compasses) {
            const playerTop     = p.y;
            const playerBottom  = p.y + PLAYER_H;
            const compassTop    = c.y - COMPASS_R;
            const compassBottom = c.y + COMPASS_R;
            const playerCenterX = p.x + PLAYER_W / 2;

            const horizOverlap = Math.abs(playerCenterX - c.x) < PLAYER_W / 2 + COMPASS_R - 3;
            // compass must be within the player's vertical band (not just below or above)
            const vertOverlap  = playerTop < compassBottom && playerBottom > compassTop + 4;

            if (horizOverlap && vertOverlap) {
              p.dead = true; p.deadTimer = 100;
              const ac = getAudio(); if (ac) sfxDie(ac);
              break;
            }
          }
        }

        // ── Reach the flag
        if (!p.dead) {
          // flag area: spans the whole top-platform region
          if (rectsOverlap(p.x, p.y, PLAYER_W, PLAYER_H, 150, 55, 200, 68)) {
            s.score += 1000 * s.level;
            const ac = getAudio(); if (ac) sfxWin(ac);
            // play this level's country music
            const lvlDef = KONG_LEVELS[(s.level - 1) % KONG_LEVELS.length];
            playCountryMusic(lvlDef);
            s.phase = "winPause";
            setTimeout(() => {
              if (stateRef.current.phase === "winPause") {
                stopMusic();
                stateRef.current = makeState(s.level + 1, s.lives, s.score);
                rerender(n => n + 1);
              }
            }, 4000);
          }
        }
      }

      // ── Draw ──────────────────────────────────────────────────────────────
      const lvlDef = KONG_LEVELS[(s.level - 1) % KONG_LEVELS.length];
      ctx.fillStyle = lvlDef?.bgTint ?? "#000814"; ctx.fillRect(0, 0, W, H);

      // static starfield
      ctx.fillStyle = "#ffffff22";
      for (let i = 0; i < 45; i++) {
        ctx.fillRect((i * 139 + 23) % W, (i * 97 + 41) % (H - 30), 1, 1);
      }

      if (s.phase === "title") {
        drawTitle(ctx, caseyImgRef.current);
        return;
      }
      if (s.phase === "gameover") {
        drawGameOver(ctx, s.score);
        return;
      }

      // platforms & ladders
      for (const plat of PLATFORMS) drawPlatform(ctx, plat.x, plat.y, plat.w);
      for (const l of LADDERS)    drawLadder(ctx, l.x, l.yTop, l.yBot);

      // collectibles
      for (const hat of s.hats) if (!hat.collected) drawHat(ctx, hat.x, hat.y);

      // Country flag at top
      drawFlag(ctx, lvlDef, s.jeffFrame);

      // compasses
      for (const c of s.compasses) drawCompass(ctx, c.x, c.y, c.angle);

      // Casey
      drawCasey(ctx, caseyImgRef.current, s.player);

      // HUD
      drawHUD(ctx, s, lvlDef);

      // win overlay
      if (s.phase === "winPause") drawWinOverlay(ctx, s, lvlDef);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [getAudio]);

  // touch controls
  const touchStart = useCallback((dir: string) => {
    keysRef.current.add(dir);
    getAudio();
    const s = stateRef.current;
    if (s.phase === "title") { stateRef.current = makeState(1); rerender(n => n + 1); }
    if (s.phase === "gameover") { stateRef.current = makeState(1); rerender(n => n + 1); }
  }, [getAudio]);
  const touchEnd = useCallback((dir: string) => keysRef.current.delete(dir), []);

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
        {/* touch d-pad */}
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
