import { useEffect, useRef, useCallback } from "react";

// ── Audio ──────────────────────────────────────────────────────────────────
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
function sfxShoot(ctx: AudioContext)     { tone(ctx, 1200, 0.06, "square", 0.07); }
function sfxEnemyDie(ctx: AudioContext)  { [400, 300, 200].forEach((f, i) => tone(ctx, f, 0.07, "sawtooth", 0.12, i * 0.05)); }
function sfxPlayerDie(ctx: AudioContext) { [440, 349, 294, 220, 165].forEach((f, i) => tone(ctx, f, 0.14, "sawtooth", 0.18, i * 0.1)); }
function sfxWave(ctx: AudioContext)      { [523, 659, 784, 1047].forEach((f, i) => tone(ctx, f, 0.09, "square", 0.12, i * 0.08)); }

// ── Constants ──────────────────────────────────────────────────────────────
const W = 480, H = 640;
const COLS = 8, ROWS = 4;
const E_W = 36, E_H = 28;
const GRID_COLS_GAP = 52, GRID_ROWS_GAP = 44;
const GRID_TOP = 70;
const GRID_LEFT = (W - COLS * GRID_COLS_GAP) / 2 + GRID_COLS_GAP / 2 - E_W / 2;

// Enemy tier by row (0=top=flagship, 1=mid, 2-3=grunt)
const TIER = [2, 1, 0, 0] as const; // 0=grunt,1=mid,2=flagship
const TIER_SCORE   = [30, 60, 150];
const TIER_COLOR   = ["#6ee7b7", "#60a5fa", "#f9a8d4"];
const TIER_OUTLINE = ["#059669", "#2563eb", "#db2777"];

const PLAYER_W = 40, PLAYER_H = 34;
const PLAYER_Y = H - 60;
const PLAYER_SPEED = 4;
const BULLET_SPEED = 9;
const ENEMY_BULLET_SPEED = 3.5;
const MAX_LIVES = 3;
const DIVE_SQUAD = 2;

// ── Types ──────────────────────────────────────────────────────────────────
type State = "idle" | "playing" | "dying" | "gameover";

interface Star { x: number; y: number; speed: number; r: number; alpha: number; }
interface Enemy {
  row: number; col: number;
  homeX: number; homeY: number;
  x: number; y: number;
  alive: boolean;
  diving: boolean;
  diveT: number;      // 0-1 parameter along dive path
  diveSpeed: number;
  diveStartX: number; diveStartY: number;
  diveTargetX: number;
  divePhase: number;  // random phase for sine-wave wiggle
  returning: boolean;
  returnT: number;
}
interface Bullet  { x: number; y: number; active: boolean; }
interface EBullet { x: number; y: number; active: boolean; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

// ── Draw helpers ───────────────────────────────────────────────────────────
function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color = "#a78bfa") {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  // body
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(w * 0.3, h * 0.25);
  ctx.lineTo(-w * 0.3, h * 0.25);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  // cockpit
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.1, w * 0.12, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#e0f2fe";
  ctx.fill();
  // engines
  for (const ex of [-w * 0.28, w * 0.28]) {
    ctx.beginPath();
    ctx.rect(ex - 5, h * 0.25, 10, h * 0.2);
    ctx.fillStyle = "#f97316";
    ctx.fill();
  }
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, tier: number) {
  const w = E_W, h = E_H;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  // body
  ctx.beginPath();
  ctx.moveTo(0, h / 2);            // bottom center (nose pointing down)
  ctx.lineTo(-w / 2, -h * 0.1);
  ctx.lineTo(-w * 0.25, -h / 2);
  ctx.lineTo(w * 0.25, -h / 2);
  ctx.lineTo(w / 2, -h * 0.1);
  ctx.closePath();
  ctx.fillStyle = TIER_COLOR[tier];
  ctx.fill();
  ctx.strokeStyle = TIER_OUTLINE[tier];
  ctx.lineWidth = 2;
  ctx.stroke();
  // eyes
  for (const ex of [-w * 0.2, w * 0.2]) {
    ctx.beginPath();
    ctx.arc(ex, -h * 0.1, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex + 1, -h * 0.1, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#1e1b4b";
    ctx.fill();
  }
  // flagship crown
  if (tier === 2) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -h / 2);
    ctx.lineTo(-w * 0.15, -h * 0.7);
    ctx.lineTo(0, -h / 2);
    ctx.lineTo(w * 0.15, -h * 0.7);
    ctx.lineTo(w * 0.3, -h / 2);
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

// ── Stars ──────────────────────────────────────────────────────────────────
function makeStars(): Star[] {
  return Array.from({ length: 80 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    speed: 0.3 + Math.random() * 0.8,
    r: 0.5 + Math.random() * 1.5,
    alpha: 0.4 + Math.random() * 0.6,
  }));
}

function makeEnemies(): Enemy[] {
  const arr: Enemy[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const hx = GRID_LEFT + col * GRID_COLS_GAP;
      const hy = GRID_TOP + row * GRID_ROWS_GAP;
      arr.push({
        row, col,
        homeX: hx, homeY: hy,
        x: hx, y: hy,
        alive: true,
        diving: false,
        diveT: 0, diveSpeed: 0.006,
        diveStartX: hx, diveStartY: hy,
        diveTargetX: W / 2,
        divePhase: Math.random() * Math.PI * 2,
        returning: false,
        returnT: 0,
      });
    }
  }
  return arr;
}

// ── Component ──────────────────────────────────────────────────────────────
export function SpaceJanglesGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef  = useRef<AudioContext | null>(null);
  const stateRef  = useRef<State>("idle");
  const rafRef    = useRef<number>(0);

  // game state (mutable refs for perf inside rAF loop)
  const playerX   = useRef(W / 2 - PLAYER_W / 2);
  const score     = useRef(0);
  const hiScore   = useRef(0);
  const lives     = useRef(MAX_LIVES);
  const wave      = useRef(1);
  const keys      = useRef<Record<string, boolean>>({});
  const stars     = useRef<Star[]>(makeStars());
  const enemies   = useRef<Enemy[]>(makeEnemies());
  const bullet    = useRef<Bullet>({ x: 0, y: 0, active: false });
  const eBullets  = useRef<EBullet[]>([]);
  const particles = useRef<Particle[]>([]);
  const shootCool = useRef(0);
  const diveTimer = useRef(0);
  const diveInterval = useRef(180); // frames between dives
  const dyingTimer = useRef(0);
  const touchX    = useRef<number | null>(null);
  const touchShooting = useRef(false);
  const formBobOffset = useRef(0);
  const formDir   = useRef(1);

  function ac() {
    if (!audioRef.current) audioRef.current = makeAudio();
    return audioRef.current;
  }

  function resetWave() {
    enemies.current = makeEnemies();
    bullet.current = { x: 0, y: 0, active: false };
    eBullets.current = [];
    diveTimer.current = 0;
    diveInterval.current = Math.max(80, 180 - (wave.current - 1) * 15);
    formBobOffset.current = 0;
    formDir.current = 1;
  }

  function startGame() {
    stateRef.current = "playing";
    score.current = 0;
    lives.current = MAX_LIVES;
    wave.current = 1;
    playerX.current = W / 2 - PLAYER_W / 2;
    particles.current = [];
    resetWave();
  }

  function spawnExplosion(x: number, y: number, color: string) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      particles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30 + Math.random() * 20,
        color,
      });
    }
  }

  function triggerDive() {
    const alive = enemies.current.filter(e => e.alive && !e.diving && !e.returning);
    if (alive.length === 0) return;
    // pick up to DIVE_SQUAD random alive enemies
    const squad = alive.sort(() => Math.random() - 0.5).slice(0, DIVE_SQUAD);
    const px = playerX.current + PLAYER_W / 2;
    squad.forEach(e => {
      e.diving = true;
      e.returning = false;
      e.diveT = 0;
      e.diveSpeed = 0.005 + Math.random() * 0.003 + (wave.current - 1) * 0.0008;
      e.diveStartX = e.x;
      e.diveStartY = e.y;
      e.diveTargetX = px + (Math.random() - 0.5) * 60;
    });
  }

  // Draw HUD
  function drawHUD(ctx: CanvasRenderingContext2D) {
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#e0e7ff";
    ctx.textAlign = "left";
    ctx.fillText(`SCORE ${score.current}`, 10, 24);
    ctx.textAlign = "center";
    ctx.fillText(`WAVE ${wave.current}`, W / 2, 24);
    ctx.textAlign = "right";
    ctx.fillText(`HI ${hiScore.current}`, W - 10, 24);
    // lives
    for (let i = 0; i < lives.current; i++) {
      const lx = 10 + i * 28;
      const ly = H - 24;
      ctx.save();
      ctx.translate(lx + 10, ly);
      ctx.scale(0.55, 0.55);
      ctx.beginPath();
      ctx.moveTo(0, -16); ctx.lineTo(18, 10); ctx.lineTo(5, 5); ctx.lineTo(-5, 5); ctx.lineTo(-18, 10);
      ctx.closePath();
      ctx.fillStyle = "#a78bfa";
      ctx.fill();
      ctx.restore();
    }
  }

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const st = stateRef.current;

    ctx.fillStyle = "#0f0c29";
    ctx.fillRect(0, 0, W, H);

    // stars
    for (const s of stars.current) {
      s.y += s.speed;
      if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (st === "idle") {
      ctx.fillStyle = "#a78bfa";
      ctx.font = "bold 42px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SPACE", W / 2, H / 2 - 60);
      ctx.fillStyle = "#f9a8d4";
      ctx.fillText("JANGLES", W / 2, H / 2 - 10);
      ctx.font = "18px monospace";
      ctx.fillStyle = "#e0e7ff";
      ctx.fillText("← → or A/D  to move", W / 2, H / 2 + 50);
      ctx.fillText("SPACE  to fire", W / 2, H / 2 + 78);
      ctx.fillText("tap screen on mobile", W / 2, H / 2 + 106);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 20px monospace";
      const blink = Math.floor(Date.now() / 500) % 2 === 0;
      if (blink) ctx.fillText("PRESS SPACE OR TAP", W / 2, H / 2 + 155);
      // draw a sample ship
      drawShip(ctx, W / 2 - PLAYER_W / 2, H / 2 + 175, PLAYER_W, PLAYER_H);
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    if (st === "gameover") {
      ctx.fillStyle = "#f87171";
      ctx.font = "bold 44px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 40);
      ctx.fillStyle = "#e0e7ff";
      ctx.font = "20px monospace";
      ctx.fillText(`SCORE: ${score.current}`, W / 2, H / 2 + 10);
      ctx.fillText(`BEST:  ${hiScore.current}`, W / 2, H / 2 + 40);
      const blink = Math.floor(Date.now() / 600) % 2 === 0;
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 18px monospace";
      if (blink) ctx.fillText("PRESS SPACE OR TAP", W / 2, H / 2 + 90);
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // ── dying state ───────────────────────────────────────────────────────
    if (st === "dying") {
      dyingTimer.current--;
      if (dyingTimer.current <= 0) {
        if (lives.current <= 0) {
          stateRef.current = "gameover";
        } else {
          stateRef.current = "playing";
          bullet.current.active = false;
          eBullets.current = [];
        }
      }
      // particles only
      for (const p of particles.current) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.95; p.vy *= 0.95;
        p.life--;
        ctx.globalAlpha = p.life / 50;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      particles.current = particles.current.filter(p => p.life > 0);
      // still draw enemies and HUD
      for (const e of enemies.current) {
        if (!e.alive) continue;
        drawEnemy(ctx, e.x, e.y, TIER[e.row]);
      }
      drawHUD(ctx);
      rafRef.current = requestAnimationFrame(loop);
      return;
    }

    // ── playing ───────────────────────────────────────────────────────────

    // player movement
    let moved = false;
    if (keys.current["ArrowLeft"] || keys.current["a"] || keys.current["A"]) {
      playerX.current = Math.max(0, playerX.current - PLAYER_SPEED);
      moved = true;
    }
    if (keys.current["ArrowRight"] || keys.current["d"] || keys.current["D"]) {
      playerX.current = Math.min(W - PLAYER_W, playerX.current + PLAYER_SPEED);
      moved = true;
    }
    // touch movement
    if (touchX.current !== null) {
      const target = touchX.current - PLAYER_W / 2;
      const diff = target - playerX.current;
      playerX.current = Math.max(0, Math.min(W - PLAYER_W, playerX.current + Math.sign(diff) * Math.min(Math.abs(diff), PLAYER_SPEED * 1.5)));
    }
    _ = moved;

    // shooting
    if (shootCool.current > 0) shootCool.current--;
    const wantsShoot = keys.current[" "] || touchShooting.current;
    if (wantsShoot && !bullet.current.active && shootCool.current === 0) {
      bullet.current = { x: playerX.current + PLAYER_W / 2 - 2, y: PLAYER_Y, active: true };
      shootCool.current = 12;
      const a = ac();
      if (a) sfxShoot(a);
    }

    // formation bob
    formBobOffset.current += 0.6 * formDir.current;
    if (Math.abs(formBobOffset.current) > 30) formDir.current *= -1;

    // dive timer
    diveTimer.current++;
    if (diveTimer.current >= diveInterval.current) {
      diveTimer.current = 0;
      triggerDive();
    }

    // update enemies
    for (const e of enemies.current) {
      if (!e.alive) continue;
      if (e.diving) {
        e.diveT += e.diveSpeed;
        // cubic bezier-ish: start → control → bottom of screen
        const t = e.diveT;
        const mx = (e.diveStartX + e.diveTargetX) / 2 + Math.sin(e.divePhase + t * Math.PI * 4) * 60;
        const my = e.diveStartY + (H + E_H - e.diveStartY) * 0.5;
        // quadratic bezier
        const bx = (1 - t) * (1 - t) * e.diveStartX + 2 * (1 - t) * t * mx + t * t * e.diveTargetX;
        const by = (1 - t) * (1 - t) * e.diveStartY + 2 * (1 - t) * t * my + t * t * (H + E_H + 20);
        e.x = bx - E_W / 2;
        e.y = by - E_H / 2;
        if (e.diveT >= 1) {
          e.diving = false;
          e.returning = true;
          e.returnT = 0;
          e.x = e.homeX; e.y = -E_H - 10;
        }
        // enemy shoots randomly mid-dive
        if (Math.random() < 0.004 + (wave.current - 1) * 0.001) {
          eBullets.current.push({ x: e.x + E_W / 2, y: e.y + E_H, active: true });
        }
      } else if (e.returning) {
        e.returnT += 0.03;
        e.y = -E_H - 10 + (e.homeY - (-E_H - 10)) * e.returnT;
        e.x = e.homeX;
        if (e.returnT >= 1) {
          e.returning = false;
          e.x = e.homeX;
          e.y = e.homeY;
        }
      } else {
        // formation bob
        e.x = e.homeX + formBobOffset.current;
        e.y = e.homeY;
      }
      drawEnemy(ctx, e.x, e.y, TIER[e.row]);
    }

    // player bullet
    if (bullet.current.active) {
      bullet.current.y -= BULLET_SPEED;
      if (bullet.current.y < -10) {
        bullet.current.active = false;
      } else {
        // draw bullet
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 8;
        ctx.fillRect(bullet.current.x - 2, bullet.current.y, 4, 14);
        ctx.shadowBlur = 0;
        // hit test
        for (const e of enemies.current) {
          if (!e.alive) continue;
          if (
            bullet.current.x > e.x && bullet.current.x < e.x + E_W &&
            bullet.current.y < e.y + E_H && bullet.current.y + 14 > e.y
          ) {
            e.alive = false;
            e.diving = false;
            e.returning = false;
            bullet.current.active = false;
            const pts = TIER_SCORE[TIER[e.row]];
            score.current += pts;
            if (score.current > hiScore.current) hiScore.current = score.current;
            spawnExplosion(e.x + E_W / 2, e.y + E_H / 2, TIER_COLOR[TIER[e.row]]);
            const a = ac();
            if (a) sfxEnemyDie(a);
            break;
          }
        }
      }
    }

    // enemy bullets
    eBullets.current = eBullets.current.filter(b => b.active && b.y < H + 10);
    for (const eb of eBullets.current) {
      eb.y += ENEMY_BULLET_SPEED + (wave.current - 1) * 0.3;
      ctx.fillStyle = "#f87171";
      ctx.shadowColor = "#f87171";
      ctx.shadowBlur = 6;
      ctx.fillRect(eb.x - 2, eb.y, 4, 10);
      ctx.shadowBlur = 0;
      // hit player
      const px = playerX.current, py = PLAYER_Y;
      if (eb.x > px + 4 && eb.x < px + PLAYER_W - 4 && eb.y + 10 > py && eb.y < py + PLAYER_H) {
        eb.active = false;
        lives.current--;
        spawnExplosion(px + PLAYER_W / 2, py + PLAYER_H / 2, "#a78bfa");
        const a = ac();
        if (a) sfxPlayerDie(a);
        stateRef.current = "dying";
        dyingTimer.current = 80;
      }
    }

    // particles
    for (const p of particles.current) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.94; p.vy *= 0.94;
      p.life--;
      ctx.globalAlpha = p.life / 50;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    particles.current = particles.current.filter(p => p.life > 0);

    // draw player
    drawShip(ctx, playerX.current, PLAYER_Y, PLAYER_W, PLAYER_H);

    // check wave clear
    if (enemies.current.every(e => !e.alive)) {
      wave.current++;
      resetWave();
      const a = ac();
      if (a) sfxWave(a);
    }

    // HUD
    drawHUD(ctx);

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  // silence unused var warning from TS
  let _ = false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onKey = (e: KeyboardEvent) => {
      keys.current[e.key] = e.type === "keydown";
      if (e.key === " ") e.preventDefault();
      if (e.type === "keydown" && e.key === " ") {
        if (stateRef.current === "idle" || stateRef.current === "gameover") startGame();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (stateRef.current === "idle" || stateRef.current === "gameover") { startGame(); return; }
      touchShooting.current = true;
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        touchX.current = (e.touches[0].clientX - rect.left) * scaleX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = W / rect.width;
        touchX.current = (e.touches[0].clientX - rect.left) * scaleX;
      }
    };
    const onTouchEnd = () => {
      touchX.current = null;
      touchShooting.current = false;
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      cancelAnimationFrame(rafRef.current);
    };
  }, [loop]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0c29",
        minHeight: "100vh",
        padding: "8px",
        touchAction: "none",
      }}
    >
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          display: "block",
          maxWidth: "100%",
          maxHeight: "90vh",
          borderRadius: 16,
          boxShadow: "0 0 40px #6366f188",
          border: "2px solid #4338ca",
          imageRendering: "pixelated",
          cursor: "crosshair",
        }}
      />
    </div>
  );
}
