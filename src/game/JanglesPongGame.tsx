import { useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const W = 480;
const H = 640;
const PADDLE_W = 90;
const PADDLE_H = 14;
const PADDLE_SPEED = 7;
const BALL_R = 10;
const WINNING_SCORE = 7;
const AI_SPEED = 4.2;

// ─── Palettes ─────────────────────────────────────────────────────────────────

const PALETTE = {
  bg: "#0a0a1a",
  bgMid: "#0f1230",
  playerPaddle: "#00eeff",
  aiPaddle: "#ff4eab",
  ball: "#ffe033",
  centerLine: "#ffffff22",
  playerScore: "#00eeff",
  aiScore: "#ff4eab",
  glow: "#ffe033",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "title" | "countdown" | "playing" | "point" | "game-over";

interface GameState {
  phase: Phase;
  playerX: number;
  aiX: number;
  ballX: number;
  ballY: number;
  ballVX: number;
  ballVY: number;
  playerScore: number;
  aiScore: number;
  countdownTimer: number;
  pointPauseTimer: number;
  winner: "player" | "ai" | null;
  // input
  leftDown: boolean;
  rightDown: boolean;
  touchDragX: number | null;
}

function initBall(dir: 1 | -1): Pick<GameState, "ballX" | "ballY" | "ballVX" | "ballVY"> {
  const angle = (Math.random() * 40 - 20) * (Math.PI / 180);
  const speed = 5.5;
  return {
    ballX: W / 2,
    ballY: H / 2,
    ballVX: Math.sin(angle) * speed,
    ballVY: dir * Math.cos(angle) * speed,
  };
}

function makeInitialState(): GameState {
  return {
    phase: "title",
    playerX: W / 2 - PADDLE_W / 2,
    aiX: W / 2 - PADDLE_W / 2,
    ...initBall(1),
    playerScore: 0,
    aiScore: 0,
    countdownTimer: 180,
    pointPauseTimer: 0,
    winner: null,
    leftDown: false,
    rightDown: false,
    touchDragX: null,
  };
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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

function drawGlowPaddle(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillStyle = color;
  drawRoundRect(ctx, x, y, PADDLE_W, PADDLE_H, 7);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.shadowColor = PALETTE.glow;
  ctx.shadowBlur = 24;
  ctx.fillStyle = PALETTE.ball;
  ctx.beginPath();
  ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // inner highlight
  const grad = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, BALL_R);
  grad.addColorStop(0, "rgba(255,255,255,0.7)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, PALETTE.bg);
  grad.addColorStop(1, PALETTE.bgMid);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // center dashed line
  ctx.save();
  ctx.strokeStyle = PALETTE.centerLine;
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(0, H / 2);
  ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // subtle side borders
  ctx.save();
  ctx.strokeStyle = "#ffffff0a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, H);
  ctx.moveTo(W, 0); ctx.lineTo(W, H);
  ctx.stroke();
  ctx.restore();
}

function drawScore(ctx: CanvasRenderingContext2D, playerScore: number, aiScore: number) {
  ctx.save();
  ctx.font = "bold 52px 'Baloo 2', monospace";
  ctx.textAlign = "center";

  // AI score (top half)
  ctx.fillStyle = PALETTE.aiScore;
  ctx.shadowColor = PALETTE.aiPaddle;
  ctx.shadowBlur = 12;
  ctx.fillText(String(aiScore), W / 2, H / 2 - 30);

  // Player score (bottom half)
  ctx.fillStyle = PALETTE.playerScore;
  ctx.shadowColor = PALETTE.playerPaddle;
  ctx.shadowBlur = 12;
  ctx.fillText(String(playerScore), W / 2, H / 2 + 60);

  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawLabels(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "bold 10px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.letterSpacing = "0.15em";

  ctx.fillStyle = PALETTE.aiScore + "88";
  ctx.fillText("CPU", W / 2, 30);

  ctx.fillStyle = PALETTE.playerScore + "88";
  ctx.fillText("YOU", W / 2, H - 18);
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

function drawTitleScreen(ctx: CanvasRenderingContext2D) {
  drawBackground(ctx);

  // Title pill
  ctx.save();
  ctx.fillStyle = "#ffe033";
  ctx.shadowColor = "#ffe033";
  ctx.shadowBlur = 20;
  drawRoundRect(ctx, W / 2 - 130, 160, 260, 60, 30);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 28px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("JANGLES PONG", W / 2, 190);
  ctx.restore();

  // Subtitle
  ctx.save();
  ctx.font = "14px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff99";
  ctx.fillText("YOU vs CPU — first to 7 wins!", W / 2, 250);
  ctx.restore();

  // Controls
  ctx.save();
  ctx.font = "12px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff55";
  ctx.fillText("← → Arrow keys or drag to move", W / 2, 285);
  ctx.restore();

  // Play button
  ctx.save();
  ctx.fillStyle = "#00eeff";
  ctx.shadowColor = "#00eeff";
  ctx.shadowBlur = 16;
  drawRoundRect(ctx, W / 2 - 80, 330, 160, 52, 26);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 22px 'Baloo 2', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("PLAY →", W / 2, 356);
  ctx.restore();

  // Decorative paddles
  ctx.save();
  ctx.fillStyle = PALETTE.aiPaddle + "55";
  drawRoundRect(ctx, W / 2 - PADDLE_W / 2, 430, PADDLE_W, PADDLE_H, 7);
  ctx.fill();
  ctx.fillStyle = PALETTE.playerPaddle + "55";
  drawRoundRect(ctx, W / 2 - PADDLE_W / 2, 500, PADDLE_W, PADDLE_H, 7);
  ctx.fill();
  // decorative ball
  ctx.fillStyle = PALETTE.ball + "55";
  ctx.beginPath();
  ctx.arc(W / 2, 465, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGameOver(ctx: CanvasRenderingContext2D, winner: "player" | "ai") {
  // dim overlay
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  const isWin = winner === "player";
  const mainColor = isWin ? PALETTE.playerPaddle : PALETTE.aiPaddle;
  const label = isWin ? "YOU WIN!" : "CPU WINS";
  const sub = isWin ? "Great game! 🎉" : "Try again!";

  ctx.save();
  ctx.fillStyle = mainColor;
  ctx.shadowColor = mainColor;
  ctx.shadowBlur = 30;
  drawRoundRect(ctx, W / 2 - 150, H / 2 - 100, 300, 80, 40);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 38px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, W / 2, H / 2 - 60);
  ctx.restore();

  ctx.save();
  ctx.font = "18px 'Baloo 2', monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffffcc";
  ctx.fillText(sub, W / 2, H / 2 + 20);
  ctx.restore();

  // Play again button
  ctx.save();
  ctx.fillStyle = "#ffe033";
  ctx.shadowColor = "#ffe033";
  ctx.shadowBlur = 16;
  drawRoundRect(ctx, W / 2 - 100, H / 2 + 60, 200, 52, 26);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#0a0a1a";
  ctx.font = "bold 20px 'Baloo 2', monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("PLAY AGAIN", W / 2, H / 2 + 86);
  ctx.restore();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function JanglesPongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(makeInitialState());
  const rafRef = useRef<number>(0);

  const PLAYER_Y = H - 50;
  const AI_Y = 36;

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

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
        s.phase = "countdown";
        s.countdownTimer = 150;
      }
    }

    if (s.phase === "playing") {
      // Player paddle movement
      if (s.touchDragX !== null) {
        const target = s.touchDragX - PADDLE_W / 2;
        const diff = target - s.playerX;
        s.playerX += Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED + 3);
      } else {
        if (s.leftDown) s.playerX -= PADDLE_SPEED;
        if (s.rightDown) s.playerX += PADDLE_SPEED;
      }
      s.playerX = Math.max(0, Math.min(W - PADDLE_W, s.playerX));

      // AI paddle movement (tracks ball with limited speed)
      const aiCenter = s.aiX + PADDLE_W / 2;
      const diff = s.ballX - aiCenter;
      if (Math.abs(diff) > 4) {
        s.aiX += Math.sign(diff) * Math.min(Math.abs(diff) * 0.08 + AI_SPEED, AI_SPEED + 1);
      }
      s.aiX = Math.max(0, Math.min(W - PADDLE_W, s.aiX));

      // Ball movement
      s.ballX += s.ballVX;
      s.ballY += s.ballVY;

      // Wall bounces (left/right)
      if (s.ballX - BALL_R < 0) { s.ballX = BALL_R; s.ballVX = Math.abs(s.ballVX); }
      if (s.ballX + BALL_R > W) { s.ballX = W - BALL_R; s.ballVX = -Math.abs(s.ballVX); }

      // Player paddle collision (bottom)
      if (
        s.ballVY > 0 &&
        s.ballY + BALL_R >= PLAYER_Y &&
        s.ballY + BALL_R <= PLAYER_Y + PADDLE_H + 4 &&
        s.ballX >= s.playerX - 2 &&
        s.ballX <= s.playerX + PADDLE_W + 2
      ) {
        s.ballY = PLAYER_Y - BALL_R;
        const hit = (s.ballX - (s.playerX + PADDLE_W / 2)) / (PADDLE_W / 2);
        const angle = hit * 65 * (Math.PI / 180);
        const speed = Math.min(Math.hypot(s.ballVX, s.ballVY) * 1.04, 14);
        s.ballVX = Math.sin(angle) * speed;
        s.ballVY = -Math.abs(Math.cos(angle) * speed);
      }

      // AI paddle collision (top)
      if (
        s.ballVY < 0 &&
        s.ballY - BALL_R <= AI_Y + PADDLE_H &&
        s.ballY - BALL_R >= AI_Y - 4 &&
        s.ballX >= s.aiX - 2 &&
        s.ballX <= s.aiX + PADDLE_W + 2
      ) {
        s.ballY = AI_Y + PADDLE_H + BALL_R;
        const hit = (s.ballX - (s.aiX + PADDLE_W / 2)) / (PADDLE_W / 2);
        const angle = hit * 65 * (Math.PI / 180);
        const speed = Math.min(Math.hypot(s.ballVX, s.ballVY) * 1.04, 14);
        s.ballVX = Math.sin(angle) * speed;
        s.ballVY = Math.abs(Math.cos(angle) * speed);
      }

      // Scoring
      if (s.ballY - BALL_R > H) {
        s.aiScore++;
        s.phase = "point";
        s.pointPauseTimer = 80;
        if (s.aiScore >= WINNING_SCORE) { s.phase = "game-over"; s.winner = "ai"; }
      } else if (s.ballY + BALL_R < 0) {
        s.playerScore++;
        s.phase = "point";
        s.pointPauseTimer = 80;
        if (s.playerScore >= WINNING_SCORE) { s.phase = "game-over"; s.winner = "player"; }
      }
    }

    // ── Render ──────────────────────────────────────────────────────────────

    if (s.phase === "title") {
      drawTitleScreen(ctx);
    } else {
      drawBackground(ctx);
      drawScore(ctx, s.playerScore, s.aiScore);
      drawLabels(ctx);

      drawGlowPaddle(ctx, s.playerX, PLAYER_Y, PALETTE.playerPaddle);
      drawGlowPaddle(ctx, s.aiX, AI_Y, PALETTE.aiPaddle);

      if (s.phase === "playing" || s.phase === "point" || s.phase === "countdown") {
        drawBall(ctx, s.ballX, s.ballY);
      }

      if (s.phase === "countdown") {
        drawCountdown(ctx, s.countdownTimer);
      }

      if (s.phase === "game-over" && s.winner) {
        drawBall(ctx, s.ballX, s.ballY);
        drawGameOver(ctx, s.winner);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [PLAYER_Y, AI_Y]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  // ── Input ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      const s = stateRef.current;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { s.leftDown = down; e.preventDefault(); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { s.rightDown = down; e.preventDefault(); }
    };
    const onDown = (e: KeyboardEvent) => onKey(e, true);
    const onUp = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const scaleX = W / rect.width;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * (H / rect.height);

    if (s.phase === "title") {
      // check play button hit zone
      if (cx >= W / 2 - 80 && cx <= W / 2 + 80 && cy >= 330 && cy <= 382) {
        Object.assign(s, makeInitialState(), { phase: "countdown", countdownTimer: 180 });
      }
    } else if (s.phase === "game-over") {
      // check play again button
      if (cx >= W / 2 - 100 && cx <= W / 2 + 100 && cy >= H / 2 + 60 && cy <= H / 2 + 112) {
        Object.assign(s, makeInitialState(), { phase: "countdown", countdownTimer: 180 });
      }
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const scaleX = W / rect.width;
    const t = e.touches[0];
    const cx = (t.clientX - rect.left) * scaleX;
    const cy = (t.clientY - rect.top) * (H / rect.height);

    if (s.phase === "title") {
      if (cx >= W / 2 - 80 && cx <= W / 2 + 80 && cy >= 330 && cy <= 382) {
        Object.assign(s, makeInitialState(), { phase: "countdown", countdownTimer: 180 });
      }
      return;
    }
    if (s.phase === "game-over") {
      if (cx >= W / 2 - 100 && cx <= W / 2 + 100 && cy >= H / 2 + 60 && cy <= H / 2 + 112) {
        Object.assign(s, makeInitialState(), { phase: "countdown", countdownTimer: 180 });
      }
      return;
    }
    s.touchDragX = cx;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.phase !== "playing" && s.phase !== "countdown") return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const scaleX = W / rect.width;
    s.touchDragX = (e.touches[0].clientX - rect.left) * scaleX;
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
