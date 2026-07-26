import { useState, useCallback, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Player = "red" | "blue";
type PieceKind = "man" | "king";
type GameMode = "menu" | "play";

interface Piece {
  player: Player;
  kind: PieceKind;
  id: string;
}

type Board = (Piece | null)[][];

interface Square {
  row: number;
  col: number;
}

interface JumpMove {
  from: Square;
  over: Square;
  to: Square;
}

interface SimpleMove {
  from: Square;
  to: Square;
}

type AnyMove = JumpMove | SimpleMove;

function isJump(m: AnyMove): m is JumpMove {
  return "over" in m;
}

// ─── Board Setup ─────────────────────────────────────────────────────────────

let _id = 0;
function mkPiece(player: Player): Piece {
  return { player, kind: "man", id: `p${_id++}` };
}

function initialBoard(): Board {
  const board: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) board[r][c] = mkPiece("blue");
  for (let r = 5; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if ((r + c) % 2 === 1) board[r][c] = mkPiece("red");
  return board;
}

// ─── Move Logic ───────────────────────────────────────────────────────────────

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function rowDirs(piece: Piece): number[] {
  if (piece.kind === "king") return [-1, 1];
  return piece.player === "red" ? [-1] : [1];
}

function getSimpleMoves(board: Board, sq: Square): Square[] {
  const piece = board[sq.row][sq.col];
  if (!piece) return [];
  const result: Square[] = [];
  for (const dr of rowDirs(piece)) {
    for (const dc of [-1, 1]) {
      const nr = sq.row + dr, nc = sq.col + dc;
      if (inBounds(nr, nc) && !board[nr][nc]) result.push({ row: nr, col: nc });
    }
  }
  return result;
}

function getJumps(board: Board, sq: Square): JumpMove[] {
  const piece = board[sq.row][sq.col];
  if (!piece) return [];
  const result: JumpMove[] = [];
  for (const dr of rowDirs(piece)) {
    for (const dc of [-1, 1]) {
      const mr = sq.row + dr, mc = sq.col + dc;
      const lr = sq.row + 2 * dr, lc = sq.col + 2 * dc;
      if (
        inBounds(lr, lc) &&
        board[mr][mc] &&
        board[mr][mc]!.player !== piece.player &&
        !board[lr][lc]
      ) {
        result.push({ from: sq, over: { row: mr, col: mc }, to: { row: lr, col: lc } });
      }
    }
  }
  return result;
}

function getPlayerJumps(board: Board, player: Player): JumpMove[] {
  const all: JumpMove[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.player === player) all.push(...getJumps(board, { row: r, col: c }));
  return all;
}

function getPlayerSimpleMoves(board: Board, player: Player): SimpleMove[] {
  const all: SimpleMove[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.player === player)
        getSimpleMoves(board, { row: r, col: c }).forEach(to => all.push({ from: { row: r, col: c }, to }));
  return all;
}

function getAllMoves(board: Board, player: Player): AnyMove[] {
  const jumps = getPlayerJumps(board, player);
  return jumps.length > 0 ? jumps : getPlayerSimpleMoves(board, player);
}

function applyMove(board: Board, move: AnyMove): Board {
  const nb = board.map(row => [...row]);
  const piece = { ...nb[move.from.row][move.from.col]! };
  nb[move.to.row][move.to.col] = piece;
  nb[move.from.row][move.from.col] = null;
  if (isJump(move)) nb[move.over.row][move.over.col] = null;
  if (piece.player === "red" && move.to.row === 0) piece.kind = "king";
  if (piece.player === "blue" && move.to.row === 7) piece.kind = "king";
  nb[move.to.row][move.to.col] = piece;
  return nb;
}

function countPieces(board: Board) {
  let red = 0, blue = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.player === "red") red++;
      else if (board[r][c]?.player === "blue") blue++;
    }
  return { red, blue };
}

// ─── AI ───────────────────────────────────────────────────────────────────────

function evaluate(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const base = p.kind === "king" ? 3 : 1;
      const center = (r >= 2 && r <= 5 && c >= 2 && c <= 5) ? 0.15 : 0;
      const back = (p.player === "blue" && r === 0) || (p.player === "red" && r === 7) ? 0.2 : 0;
      const val = base + center + back;
      if (p.player === "blue") score += val;
      else score -= val;
    }
  return score;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  const player: Player = maximizing ? "blue" : "red";
  const moves = getAllMoves(board, player);
  if (depth === 0 || moves.length === 0) return evaluate(board);

  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      best = Math.max(best, minimax(applyMove(board, m), depth - 1, alpha, beta, false));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      best = Math.min(best, minimax(applyMove(board, m), depth - 1, alpha, beta, true));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(board: Board): AnyMove | null {
  const moves = getAllMoves(board, "blue");
  if (moves.length === 0) return null;
  let best: AnyMove | null = null;
  let bestVal = -Infinity;
  for (const m of moves) {
    const v = minimax(applyMove(board, m), 5, -Infinity, Infinity, false);
    if (v > bestVal) { bestVal = v; best = m; }
  }
  return best;
}

// ─── Colours ─────────────────────────────────────────────────────────────────

const LIGHT_SQ = "#FEF3C7";
const DARK_SQ  = "#7C3AED";
const RED_FILL = "#F43F5E";
const RED_RING = "#FF8FA3";
const BLU_FILL = "#0EA5E9";
const BLU_RING = "#7DD3FC";
const KING_STAR = "#FBBF24";
const SEL_GLOW  = "#22C55E";
const HINT_CLR  = "#34D399";

// ─── Component ────────────────────────────────────────────────────────────────

interface PlayState {
  board: Board;
  turn: Player;
  selected: Square | null;
  hints: Square[];
  forcedJumper: Square | null;
  status: "playing" | "won" | "draw";
  winner: Player | null;
  thinking: boolean;
  redCount: number;
  blueCount: number;
  capturedRed: number;
  capturedBlue: number;
}

function initPlay(): PlayState {
  const board = initialBoard();
  const counts = countPieces(board);
  return {
    board,
    turn: "red",
    selected: null,
    hints: [],
    forcedJumper: null,
    status: "playing",
    winner: null,
    thinking: false,
    redCount: counts.red,
    blueCount: counts.blue,
    capturedRed: 0,
    capturedBlue: 0,
  };
}

function sqEq(a: Square, b: Square) {
  return a.row === b.row && a.col === b.col;
}

export function CheckersGame() {
  const [mode, setMode] = useState<GameMode>("menu");
  const [twoPlayer, setTwoPlayer] = useState(false);
  const [ps, setPs] = useState<PlayState | null>(null);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aiMoving = useRef(false);

  const startGame = useCallback((tp: boolean) => {
    setTwoPlayer(tp);
    setPs(initPlay());
    setMode("play");
  }, []);

  const resetGame = useCallback(() => {
    if (aiTimer.current) clearTimeout(aiTimer.current);
    setMode("menu");
    setPs(null);
  }, []);

  // AI turn trigger
  useEffect(() => {
    if (!ps || ps.status !== "playing") return;
    if (twoPlayer) return;
    if (ps.turn !== "blue") return;
    if (aiMoving.current) return;
    aiMoving.current = true;

    setPs(prev => prev ? { ...prev, thinking: true } : prev);

    aiTimer.current = setTimeout(() => {
      aiMoving.current = false;
      setPs(prev => {
        if (!prev) return prev;
        const move = getBestMove(prev.board);
        if (!move) {
          return { ...prev, status: "won", winner: "red", thinking: false };
        }
        let board = applyMove(prev.board, move);
        let forcedJumper: Square | null = null;

        // Check if AI can chain-jump
        if (isJump(move)) {
          const chainJumps = getJumps(board, move.to);
          if (chainJumps.length > 0) {
            // AI chains automatically
            let cur = move.to;
            let nb = board;
            while (true) {
              const cj = getJumps(nb, cur);
              if (cj.length === 0) break;
              const best = cj[Math.floor(Math.random() * cj.length)];
              nb = applyMove(nb, best);
              cur = best.to;
            }
            board = nb;
          }
        }

        const counts = countPieces(board);
        const allMoves = getAllMoves(board, "red");
        let status: PlayState["status"] = "playing";
        let winner: Player | null = null;

        if (counts.red === 0 || allMoves.length === 0) {
          status = "won"; winner = "blue";
        }

        return {
          ...prev,
          board,
          turn: "red",
          selected: null,
          hints: [],
          forcedJumper,
          status,
          winner,
          thinking: false,
          redCount: counts.red,
          blueCount: counts.blue,
          capturedRed: 12 - counts.red,
          capturedBlue: 12 - counts.blue,
        };
      });
    }, 500);

    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
      aiMoving.current = false;
    };
  }, [ps?.turn, ps?.status, twoPlayer]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    setPs(prev => {
      if (!prev || prev.status !== "playing" || prev.thinking) return prev;
      if (!twoPlayer && prev.turn === "blue") return prev;

      const clickedSq: Square = { row, col };
      const clickedPiece = prev.board[row][col];

      // Clicked on a hint (valid destination)
      if (prev.selected && prev.hints.some(h => sqEq(h, clickedSq))) {
        const allJumps = getPlayerJumps(prev.board, prev.turn);
        const jumps = getJumps(prev.board, prev.selected);

        let board: Board;
        let forcedJumper: Square | null = null;
        let nextTurn: Player = prev.turn === "red" ? "blue" : "red";

        if (allJumps.length > 0) {
          const jump = jumps.find(j => sqEq(j.to, clickedSq))!;
          board = applyMove(prev.board, jump);
          // Check for chain jump
          const chainJumps = getJumps(board, jump.to);
          if (chainJumps.length > 0) {
            forcedJumper = jump.to;
            nextTurn = prev.turn;
          }
        } else {
          board = applyMove(prev.board, { from: prev.selected, to: clickedSq });
        }

        const counts = countPieces(board);
        let status: PlayState["status"] = "playing";
        let winner: Player | null = null;

        const nextMoves = getAllMoves(board, nextTurn);
        if (counts.red === 0 || (nextTurn === "red" && nextMoves.length === 0)) {
          status = "won"; winner = "blue";
        } else if (counts.blue === 0 || (nextTurn === "blue" && nextMoves.length === 0)) {
          status = "won"; winner = "red";
        }

        // Build hints for forced jumper
        let hints: Square[] = [];
        let selected: Square | null = null;
        if (forcedJumper) {
          selected = forcedJumper;
          hints = getJumps(board, forcedJumper).map(j => j.to);
        }

        return {
          ...prev,
          board,
          turn: nextTurn,
          selected,
          hints,
          forcedJumper,
          status,
          winner,
          redCount: counts.red,
          blueCount: counts.blue,
          capturedRed: 12 - counts.red,
          capturedBlue: 12 - counts.blue,
        };
      }

      // If in chain jump, only allow moving the forced piece
      if (prev.forcedJumper) {
        if (!sqEq(clickedSq, prev.forcedJumper)) return prev;
      }

      // Clicked on own piece
      if (clickedPiece?.player === prev.turn) {
        const allJumps = getPlayerJumps(prev.board, prev.turn);
        let hints: Square[];

        if (allJumps.length > 0) {
          const myJumps = getJumps(prev.board, clickedSq);
          if (myJumps.length === 0) return prev; // must pick a jumping piece
          hints = myJumps.map(j => j.to);
        } else {
          hints = getSimpleMoves(prev.board, clickedSq);
        }

        return { ...prev, selected: clickedSq, hints };
      }

      // Clicked empty square or opponent — deselect
      return { ...prev, selected: null, hints: [] };
    });
  }, [twoPlayer]);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (mode === "menu") {
    return <MenuScreen onStart={startGame} />;
  }

  if (!ps) return null;

  return (
    <GameScreen
      ps={ps}
      twoPlayer={twoPlayer}
      onSquareClick={handleSquareClick}
      onReset={resetGame}
    />
  );
}

// ─── Menu Screen ─────────────────────────────────────────────────────────────

function MenuScreen({ onStart }: { onStart: (twoPlayer: boolean) => void }) {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F97316 100%)",
        borderRadius: "2rem",
        gap: "2rem",
      }}
    >
      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", lineHeight: 1 }}>🔴🟣</div>
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 900,
            color: "#fff",
            textShadow: "0 4px 0 rgba(0,0,0,0.3)",
            margin: "0.5rem 0 0.25rem",
            letterSpacing: "-0.02em",
          }}
        >
          Jangles Checkers!
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", margin: 0 }}>
          Jump, capture & crown your kings 👑
        </p>
      </div>

      {/* Rules card */}
      <div
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          borderRadius: "1.5rem",
          padding: "1.25rem 1.75rem",
          maxWidth: "22rem",
          border: "2px solid rgba(255,255,255,0.3)",
        }}
      >
        <div style={{ color: "#fff", fontSize: "0.85rem", lineHeight: 1.8 }}>
          <div>🔴 <strong>You are Red</strong> — move from the bottom up</div>
          <div>🔵 <strong>Computer is Blue</strong> — moves from the top down</div>
          <div>⚡ Jump over enemy pieces to capture them</div>
          <div>👑 Reach the back row to become a <strong>King</strong>!</div>
          <div>🎯 If you can jump, you <strong>must</strong> jump</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", maxWidth: "18rem" }}>
        <button
          onClick={() => onStart(false)}
          style={{
            background: "#F43F5E",
            color: "#fff",
            border: "3px solid #1a1a2e",
            borderBottomWidth: 6,
            borderRightWidth: 5,
            borderRadius: "1rem",
            padding: "0.9rem 1.5rem",
            fontSize: "1.1rem",
            fontWeight: 900,
            cursor: "pointer",
            transition: "transform 0.1s",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "translateY(3px)")}
          onMouseUp={e => (e.currentTarget.style.transform = "")}
        >
          🤖 Play vs Computer
        </button>
        <button
          onClick={() => onStart(true)}
          style={{
            background: "#0EA5E9",
            color: "#fff",
            border: "3px solid #1a1a2e",
            borderBottomWidth: 6,
            borderRightWidth: 5,
            borderRadius: "1rem",
            padding: "0.9rem 1.5rem",
            fontSize: "1.1rem",
            fontWeight: 900,
            cursor: "pointer",
            transition: "transform 0.1s",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "translateY(3px)")}
          onMouseUp={e => (e.currentTarget.style.transform = "")}
        >
          👫 2 Player Mode
        </button>
      </div>
    </div>
  );
}

// ─── Game Screen ─────────────────────────────────────────────────────────────

function GameScreen({
  ps,
  twoPlayer,
  onSquareClick,
  onReset,
}: {
  ps: PlayState;
  twoPlayer: boolean;
  onSquareClick: (r: number, c: number) => void;
  onReset: () => void;
}) {
  const turnLabel = twoPlayer
    ? ps.turn === "red" ? "🔴 Red's Turn" : "🔵 Blue's Turn"
    : ps.turn === "red" ? "🔴 Your Turn" : "🤖 Computer Thinking…";

  const turnColor = ps.turn === "red" ? RED_FILL : BLU_FILL;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        borderRadius: "2rem",
        minHeight: "80vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "40rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={onReset}
          style={{
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: "0.75rem",
            padding: "0.4rem 1rem",
            fontSize: "0.85rem",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← Menu
        </button>

        <div
          style={{
            background: turnColor + "33",
            border: `2px solid ${turnColor}`,
            borderRadius: "2rem",
            padding: "0.35rem 1rem",
            color: "#fff",
            fontWeight: 800,
            fontSize: "0.95rem",
          }}
        >
          {ps.status === "won"
            ? ps.winner === "red"
              ? "🎉 Red Wins!"
              : "🎉 Blue Wins!"
            : ps.thinking ? "🤔 Thinking…" : turnLabel}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 700,
          }}
        >
          <span style={{ color: RED_RING }}>🔴 ×{ps.redCount}</span>
          <span style={{ color: BLU_RING }}>🔵 ×{ps.blueCount}</span>
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          padding: "0.5rem",
          borderRadius: "1.25rem",
          background: "linear-gradient(135deg, #F59E0B, #EC4899, #7C3AED, #0EA5E9)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            borderRadius: "0.75rem",
            overflow: "hidden",
            width: "min(90vw, 480px)",
            aspectRatio: "1",
          }}
        >
          {ps.board.map((row, r) =>
            row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = ps.selected && sqEq(ps.selected, { row: r, col: c });
              const isHint = ps.hints.some(h => sqEq(h, { row: r, col: c }));
              const isJumpingPiece = ps.forcedJumper && sqEq(ps.forcedJumper, { row: r, col: c });

              let bg = isDark ? DARK_SQ : LIGHT_SQ;
              if (isSelected) bg = "#166534";
              if (isHint && isDark) bg = "#065f46";

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => onSquareClick(r, c)}
                  style={{
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isDark ? "pointer" : "default",
                    position: "relative",
                    transition: "background 0.15s",
                    aspectRatio: "1",
                  }}
                >
                  {/* Hint dot */}
                  {isHint && !piece && (
                    <div
                      style={{
                        width: "30%",
                        height: "30%",
                        borderRadius: "50%",
                        background: HINT_CLR,
                        opacity: 0.9,
                        boxShadow: `0 0 8px ${HINT_CLR}`,
                      }}
                    />
                  )}

                  {/* Piece */}
                  {piece && (
                    <CheckerPiece
                      piece={piece}
                      isSelected={!!isSelected}
                      isForced={!!isJumpingPiece}
                      isHintTarget={isHint}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Win overlay */}
      {ps.status === "won" && (
        <div
          style={{
            background: ps.winner === "red"
              ? "linear-gradient(135deg, #F43F5E, #F97316)"
              : "linear-gradient(135deg, #0EA5E9, #7C3AED)",
            borderRadius: "1.5rem",
            padding: "1.5rem 2rem",
            textAlign: "center",
            color: "#fff",
            maxWidth: "22rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontSize: "3rem" }}>
            {ps.winner === "red" ? "🎉🏆🎉" : "🤖✨🤖"}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, marginTop: "0.5rem" }}>
            {ps.winner === "red"
              ? twoPlayer ? "Red Wins!" : "You Win!"
              : twoPlayer ? "Blue Wins!" : "Computer Wins!"}
          </div>
          <p style={{ opacity: 0.85, margin: "0.5rem 0 1rem", fontSize: "0.9rem" }}>
            {ps.winner === "red"
              ? twoPlayer ? "Well played Red!" : "Amazing checkers skills! 🌟"
              : twoPlayer ? "Blue takes the board!" : "Good game! Try again? 💪"}
          </p>
          <button
            onClick={onReset}
            style={{
              background: "rgba(255,255,255,0.25)",
              color: "#fff",
              border: "2px solid rgba(255,255,255,0.5)",
              borderRadius: "0.75rem",
              padding: "0.6rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Play Again →
          </button>
        </div>
      )}

      {/* Captured pieces display */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          color: "rgba(255,255,255,0.7)",
          fontSize: "0.8rem",
          fontWeight: 600,
        }}
      >
        {ps.capturedBlue > 0 && (
          <span>🔴 captured {ps.capturedBlue} blue {ps.capturedBlue === 1 ? "piece" : "pieces"}</span>
        )}
        {ps.capturedRed > 0 && (
          <span>🔵 captured {ps.capturedRed} red {ps.capturedRed === 1 ? "piece" : "pieces"}</span>
        )}
      </div>
    </div>
  );
}

// ─── Checker Piece ────────────────────────────────────────────────────────────

function CheckerPiece({
  piece,
  isSelected,
  isForced,
  isHintTarget,
}: {
  piece: Piece;
  isSelected: boolean;
  isForced: boolean;
  isHintTarget: boolean;
}) {
  const fill = piece.player === "red" ? RED_FILL : BLU_FILL;
  const ring = piece.player === "red" ? RED_RING : BLU_RING;
  const shadow = piece.player === "red" ? "#BE123C" : "#0369A1";

  const glowColor = isSelected ? SEL_GLOW : isForced ? "#FBBF24" : "transparent";

  return (
    <div
      style={{
        width: "80%",
        height: "80%",
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${ring}, ${fill} 55%, ${shadow})`,
        border: `3px solid ${isSelected ? SEL_GLOW : isForced ? "#FBBF24" : shadow}`,
        boxShadow: isSelected || isForced
          ? `0 0 0 3px ${glowColor}, 0 4px 8px rgba(0,0,0,0.4)`
          : `0 3px 6px rgba(0,0,0,0.35)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "box-shadow 0.15s, border-color 0.15s",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {piece.kind === "king" && (
        <span
          style={{
            fontSize: "clamp(0.65rem, 2.5vw, 1rem)",
            lineHeight: 1,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
            userSelect: "none",
          }}
        >
          👑
        </span>
      )}

      {/* Shine */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "20%",
          width: "30%",
          height: "20%",
          background: "rgba(255,255,255,0.45)",
          borderRadius: "50%",
          transform: "rotate(-30deg)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
