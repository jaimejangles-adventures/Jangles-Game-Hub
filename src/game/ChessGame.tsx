import { useState, useCallback, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Color = "white" | "black";
type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
type Mode = "menu" | "lesson" | "play";
type LessonPiece = PieceType | "overview";

interface Piece {
  type: PieceType;
  color: Color;
  id: string;
}

interface Square {
  row: number;
  col: number;
}

type Board = (Piece | null)[][];

interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

interface MoveRecord {
  label: string;
  board: Board;
  lastMove: { from: Square; to: Square };
}

interface GameState {
  board: Board;
  turn: Color;
  selected: Square | null;
  validMoves: Square[];
  capturedWhite: Piece[];
  capturedBlack: Piece[];
  castlingRights: CastlingRights;
  enPassantTarget: Square | null;
  status: "playing" | "check" | "checkmate" | "stalemate";
  winner: Color | null;
  moveHistory: string[];
  promotionPending: { from: Square; to: Square } | null;
  lastMove: { from: Square; to: Square } | null;
  boardHistory: MoveRecord[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PIECE_UNICODE: Record<PieceType, Record<Color, string>> = {
  king:   { white: "♔", black: "♚" },
  queen:  { white: "♕", black: "♛" },
  rook:   { white: "♖", black: "♜" },
  bishop: { white: "♗", black: "♝" },
  knight: { white: "♘", black: "♞" },
  pawn:   { white: "♙", black: "♟" },
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function sqLabel(row: number, col: number) {
  return FILES[col] + (8 - row);
}

const NO_CASTLING: CastlingRights = {
  whiteKingSide: false, whiteQueenSide: false,
  blackKingSide: false, blackQueenSide: false,
};

// ─── Board Setup ──────────────────────────────────────────────────────────────

let _pieceIdCounter = 0;
function makeId(): string { return `p${_pieceIdCounter++}`; }

function initialBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const backRow: PieceType[] = ["rook","knight","bishop","queen","king","bishop","knight","rook"];
  backRow.forEach((type, col) => {
    b[0][col] = { type, color: "black", id: makeId() };
    b[7][col] = { type, color: "white", id: makeId() };
  });
  for (let col = 0; col < 8; col++) {
    b[1][col] = { type: "pawn", color: "black", id: makeId() };
    b[6][col] = { type: "pawn", color: "white", id: makeId() };
  }
  return b;
}

function emptyBoard(): Board {
  return Array.from({ length: 8 }, () => Array(8).fill(null));
}

function placePiece(board: Board, row: number, col: number, type: PieceType, color: Color): Board {
  const b = board.map(r => [...r]);
  b[row][col] = { type, color, id: makeId() };
  return b;
}

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

// ─── Move Generation ──────────────────────────────────────────────────────────

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function rawMoves(
  board: Board,
  sq: Square,
  enPassantTarget: Square | null,
  cr: CastlingRights,
): Square[] {
  const piece = board[sq.row][sq.col];
  if (!piece) return [];
  const { type, color } = piece;
  const moves: Square[] = [];
  const enemy = (r: number, c: number) => !!board[r][c] && board[r][c]!.color !== color;
  const empty = (r: number, c: number) => !board[r][c];

  const slide = (dirs: [number, number][]) => {
    for (const [dr, dc] of dirs) {
      let r = sq.row + dr, c = sq.col + dc;
      while (inBounds(r, c)) {
        if (empty(r, c)) { moves.push({ row: r, col: c }); }
        else { if (enemy(r, c)) moves.push({ row: r, col: c }); break; }
        r += dr; c += dc;
      }
    }
  };

  const jump = (offsets: [number, number][]) => {
    for (const [dr, dc] of offsets) {
      const r = sq.row + dr, c = sq.col + dc;
      if (inBounds(r, c) && (empty(r, c) || enemy(r, c))) moves.push({ row: r, col: c });
    }
  };

  if (type === "rook")   slide([[-1,0],[1,0],[0,-1],[0,1]]);
  if (type === "bishop") slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
  if (type === "queen")  slide([[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]);
  if (type === "knight") jump([[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]);
  if (type === "king") {
    jump([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
    const row = color === "white" ? 7 : 0;
    // Castling: king must be on starting square, no pieces between, rook on starting square
    if (sq.row === row && sq.col === 4) {
      const kSide = color === "white" ? cr.whiteKingSide : cr.blackKingSide;
      const qSide = color === "white" ? cr.whiteQueenSide : cr.blackQueenSide;
      if (kSide && empty(row,5) && empty(row,6) && board[row][7]?.type === "rook" && board[row][7]?.color === color)
        moves.push({ row, col: 6 });
      if (qSide && empty(row,3) && empty(row,2) && empty(row,1) && board[row][0]?.type === "rook" && board[row][0]?.color === color)
        moves.push({ row, col: 2 });
    }
  }
  if (type === "pawn") {
    const dir = color === "white" ? -1 : 1;
    const startRow = color === "white" ? 6 : 1;
    const r1 = sq.row + dir;
    if (inBounds(r1, sq.col) && empty(r1, sq.col)) {
      moves.push({ row: r1, col: sq.col });
      const r2 = sq.row + 2 * dir;
      if (sq.row === startRow && inBounds(r2, sq.col) && empty(r2, sq.col))
        moves.push({ row: r2, col: sq.col });
    }
    for (const dc of [-1, 1]) {
      const r = sq.row + dir, c = sq.col + dc;
      if (!inBounds(r, c)) continue;
      if (enemy(r, c)) moves.push({ row: r, col: c });
      else if (enPassantTarget && enPassantTarget.row === r && enPassantTarget.col === c)
        moves.push({ row: r, col: c });
    }
  }
  return moves;
}

function findKing(board: Board, color: Color): Square | null {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === "king" && board[r][c]?.color === color)
        return { row: r, col: c };
  return null;
}

function isSquareAttacked(board: Board, sq: Square, byColor: Color): boolean {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== byColor) continue;
      // Use rawMoves with no castling/ep to check attacks
      const moves = rawMoves(board, { row: r, col: c }, null, NO_CASTLING);
      if (moves.some(m => m.row === sq.row && m.col === sq.col)) return true;
    }
  return false;
}

function applyMoveOnBoard(board: Board, from: Square, to: Square, enPassantTarget: Square | null): Board {
  const b = cloneBoard(board);
  const piece = b[from.row][from.col];
  if (!piece) return b; // guard: nothing to move (stale move)
  b[to.row][to.col] = piece;
  b[from.row][from.col] = null;
  // En passant capture: remove the captured pawn
  if (piece.type === "pawn" && enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
    const captureRow = piece.color === "white" ? to.row + 1 : to.row - 1;
    b[captureRow][to.col] = null;
  }
  // Castling: move the rook
  if (piece.type === "king" && Math.abs(to.col - from.col) === 2) {
    const row = piece.color === "white" ? 7 : 0;
    if (to.col === 6) { b[row][5] = b[row][7]; b[row][7] = null; } // kingside
    if (to.col === 2) { b[row][3] = b[row][0]; b[row][0] = null; } // queenside
  }
  return b;
}

function legalMoves(
  board: Board,
  sq: Square,
  enPassantTarget: Square | null,
  cr: CastlingRights,
): Square[] {
  const piece = board[sq.row][sq.col];
  if (!piece) return [];
  const color = piece.color;
  const enemy = color === "white" ? "black" : "white";

  return rawMoves(board, sq, enPassantTarget, cr).filter(to => {
    // Castling pass-through check
    if (piece.type === "king" && Math.abs(to.col - sq.col) === 2) {
      // King must not be in check currently
      if (isSquareAttacked(board, sq, enemy)) return false;
      // King must not pass through an attacked square
      const passThroughCol = to.col === 6 ? 5 : 3;
      if (isSquareAttacked(board, { row: sq.row, col: passThroughCol }, enemy)) return false;
    }
    const newBoard = applyMoveOnBoard(board, sq, to, enPassantTarget);
    const king = findKing(newBoard, color);
    return king ? !isSquareAttacked(newBoard, king, enemy) : false;
  });
}

function hasAnyLegalMoves(board: Board, color: Color, enPassantTarget: Square | null, cr: CastlingRights): boolean {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color && legalMoves(board, { row: r, col: c }, enPassantTarget, cr).length > 0)
        return true;
  return false;
}

function isInCheck(board: Board, color: Color): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  return isSquareAttacked(board, king, color === "white" ? "black" : "white");
}

function updateCastlingRights(cr: CastlingRights, piece: Piece, from: Square): CastlingRights {
  const next = { ...cr };
  if (piece.type === "king") {
    if (piece.color === "white") { next.whiteKingSide = false; next.whiteQueenSide = false; }
    else { next.blackKingSide = false; next.blackQueenSide = false; }
  }
  if (piece.type === "rook") {
    if (from.row === 7 && from.col === 7) next.whiteKingSide = false;
    if (from.row === 7 && from.col === 0) next.whiteQueenSide = false;
    if (from.row === 0 && from.col === 7) next.blackKingSide = false;
    if (from.row === 0 && from.col === 0) next.blackQueenSide = false;
  }
  return next;
}

function computeEnPassantTarget(piece: Piece, from: Square, to: Square): Square | null {
  if (piece.type === "pawn" && Math.abs(to.row - from.row) === 2)
    return { row: (from.row + to.row) / 2, col: to.col };
  return null;
}

function computeGameStatus(
  board: Board,
  nextTurn: Color,
  ep: Square | null,
  cr: CastlingRights,
  prevTurn: Color,
): { status: GameState["status"]; winner: Color | null } {
  const inCheck = isInCheck(board, nextTurn);
  const anyMoves = hasAnyLegalMoves(board, nextTurn, ep, cr);
  if (!anyMoves) {
    if (inCheck) return { status: "checkmate", winner: prevTurn };
    return { status: "stalemate", winner: null };
  }
  return { status: inCheck ? "check" : "playing", winner: null };
}

// ─── Computer AI (minimax depth 2 with positional bonuses) ───────────────────

const PIECE_VALUE: Record<PieceType, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 0,
};

// Positional bonus tables (from white's perspective, row 7 = white back rank)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0],
];
const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];
const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = PIECE_VALUE[p.type];
      const row = p.color === "white" ? r : 7 - r;
      let bonus = 0;
      if (p.type === "pawn")   bonus = PAWN_TABLE[row][c];
      if (p.type === "knight") bonus = KNIGHT_TABLE[row][c];
      if (p.type === "bishop") bonus = BISHOP_TABLE[row][c];
      score += p.color === "white" ? val + bonus : -(val + bonus);
    }
  return score;
}

interface MoveOption { from: Square; to: Square; }

function getAllMoves(board: Board, color: Color, ep: Square | null, cr: CastlingRights): MoveOption[] {
  const moves: MoveOption[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color)
        for (const to of legalMoves(board, { row: r, col: c }, ep, cr))
          moves.push({ from: { row: r, col: c }, to });
  return moves;
}

function minimax(
  board: Board, depth: number, alpha: number, beta: number, maximizing: boolean,
  ep: Square | null, cr: CastlingRights,
): number {
  if (depth === 0) return evaluateBoard(board);
  const color = maximizing ? "white" : "black";
  const moves = getAllMoves(board, color, ep, cr);
  if (moves.length === 0) return isInCheck(board, color) ? (maximizing ? -9999 : 9999) : 0;
  if (maximizing) {
    let best = -Infinity;
    for (const m of moves) {
      const nb = applyMoveOnBoard(board, m.from, m.to, ep);
      const newEp = computeEnPassantTarget(board[m.from.row][m.from.col]!, m.from, m.to);
      best = Math.max(best, minimax(nb, depth - 1, alpha, beta, false, newEp, cr));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const m of moves) {
      const nb = applyMoveOnBoard(board, m.from, m.to, ep);
      const newEp = computeEnPassantTarget(board[m.from.row][m.from.col]!, m.from, m.to);
      best = Math.min(best, minimax(nb, depth - 1, alpha, beta, true, newEp, cr));
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function getBestMove(board: Board, color: Color, ep: Square | null, cr: CastlingRights, aiDepth = 2): MoveOption | null {
  const moves = getAllMoves(board, color, ep, cr);
  if (moves.length === 0) return null;
  const shuffled = [...moves].sort(() => Math.random() - 0.5);
  let bestScore = color === "black" ? Infinity : -Infinity;
  let bestMove = shuffled[0];
  const maximizing = color === "white";
  for (const m of shuffled) {
    const nb = applyMoveOnBoard(board, m.from, m.to, ep);
    const newEp = computeEnPassantTarget(board[m.from.row][m.from.col]!, m.from, m.to);
    const score = minimax(nb, aiDepth, -Infinity, Infinity, !maximizing, newEp, cr);
    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }
  return bestMove;
}

// ─── Chess Board Component ────────────────────────────────────────────────────

function ChessBoard({
  board,
  selected,
  validMoves,
  highlights = [],
  onSquareClick,
  interactive = true,
  lastMove,
  targetSquare,
}: {
  board: Board;
  selected: Square | null;
  validMoves: Square[];
  highlights?: Square[];
  onSquareClick?: (sq: Square) => void;
  interactive?: boolean;
  lastMove?: { from: Square; to: Square } | null;
  targetSquare?: Square | null;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(8, 1fr)",
      gridTemplateRows: "repeat(8, 1fr)",
      width: "100%",
      height: "100%",
      borderRadius: 8,
      overflow: "hidden",
      border: "4px solid #1a1a2e",
      boxShadow: "0 8px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
      boxSizing: "border-box",
    }}>
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const piece = board[row][col];
          const light = (row + col) % 2 === 0;
          const isSelected = selected?.row === row && selected?.col === col;
          const isValid = validMoves.some(m => m.row === row && m.col === col);
          const isHighlight = highlights.some(h => h.row === row && h.col === col);
          const isLastMove = lastMove && (
            (lastMove.from.row === row && lastMove.from.col === col) ||
            (lastMove.to.row === row && lastMove.to.col === col)
          );
          const hasEnemy = isValid && !!piece;

          // Kid-friendly board colours
          let bg = light ? "#fde8ff" : "#8b2fc9";
          if (isLastMove) bg = light ? "#ffd966" : "#e6a800";
          if (isSelected) bg = "#ffe033";
          if (isHighlight) bg = light ? "#b8f5a0" : "#3db82a";

          // Circular token colours per side
          const tokenStyle = piece
            ? piece.color === "white"
              ? { bg: "linear-gradient(145deg,#60c8ff,#1d6fd8)", border: "#93c5fd", shadow: "0 3px 10px rgba(29,111,216,0.6)" }
              : { bg: "linear-gradient(145deg,#ffaa55,#d93a00)", border: "#fca5a5", shadow: "0 3px 10px rgba(217,58,0,0.6)" }
            : null;

          return (
            <div
              key={`${row}-${col}`}
              onClick={() => interactive && onSquareClick?.({ row, col })}
              style={{
                position: "relative",
                backgroundColor: bg,
                cursor: interactive ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.15s",
              }}
            >
              {/* Valid move indicator */}
              {isValid && !hasEnemy && (
                <div style={{
                  position: "absolute",
                  width: "36%", height: "36%",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.22)",
                  pointerEvents: "none",
                  zIndex: 1,
                }} />
              )}
              {/* Capture ring */}
              {isValid && hasEnemy && (
                <div style={{
                  position: "absolute", inset: 0,
                  border: "5px solid rgba(0,0,0,0.28)",
                  borderRadius: 2,
                  pointerEvents: "none",
                  zIndex: 1,
                }} />
              )}
              {/* Target square 🎯 */}
              {targetSquare && targetSquare.row === row && targetSquare.col === col && (
                <div style={{
                  position: "absolute", inset: 0, zIndex: 3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                  fontSize: "clamp(16px, 4.5vmin, 38px)",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  animation: "targetPulse 1.2s ease-in-out infinite",
                }}>🎯</div>
              )}
              {/* Piece token — coloured disc */}
              {piece && tokenStyle && (
                <div style={{
                  position: "relative", zIndex: 2,
                  width: "74%", height: "74%",
                  borderRadius: "50%",
                  background: tokenStyle.bg,
                  border: `2.5px solid ${tokenStyle.border}`,
                  boxShadow: `${tokenStyle.shadow}, inset 0 1px 3px rgba(255,255,255,0.3)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  userSelect: "none",
                }}>
                  <span style={{
                    fontSize: "clamp(13px, 3.8vmin, 40px)",
                    lineHeight: 1, color: "#fff",
                    textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }}>
                    {PIECE_UNICODE[piece.type]["white"]}
                  </span>
                </div>
              )}
              {/* Rank number (left edge) */}
              {col === 0 && (
                <span style={{
                  position: "absolute", top: 2, left: 3,
                  fontSize: "clamp(7px, 1.3vmin, 12px)",
                  fontWeight: 800, color: light ? "#8b2fc9" : "#fde8ff",
                  lineHeight: 1, pointerEvents: "none", zIndex: 3,
                }}>
                  {8 - row}
                </span>
              )}
              {/* File letter (bottom edge) */}
              {row === 7 && (
                <span style={{
                  position: "absolute", bottom: 2, right: 3,
                  fontSize: "clamp(7px, 1.3vmin, 12px)",
                  fontWeight: 800, color: light ? "#8b2fc9" : "#fde8ff",
                  lineHeight: 1, pointerEvents: "none", zIndex: 3,
                }}>
                  {FILES[col]}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Lesson Data (interactive modules) ───────────────────────────────────────

interface LessonTask {
  type: "learn" | "try" | "quiz";
  title: string;
  text: string;
  board: Board;
  highlights?: Square[];
  movePiece?: Square;      // which piece the learner drags/clicks
  targetSquare?: Square;   // quiz only — must land exactly here
  successMsg: string;
}

interface PieceModule {
  key: LessonPiece;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  tasks: LessonTask[];
}

// Legacy shape kept so nothing else breaks
interface LessonStep {
  title: string;
  description: string;
  board: Board;
  highlights: Square[];
}
const LESSONS: Record<LessonPiece, LessonStep[]> = {
  overview: [
    {
      title: "The Chess Board",
      description: "Chess is played on an 8×8 board with 64 squares alternating between light and dark. Each player starts with 16 pieces. White always moves first. The goal is to trap the opponent's King — this is called Checkmate!",
      board: initialBoard(),
      highlights: [],
    },
    {
      title: "Your Army",
      description: "White controls the bottom two rows. You have 1 King, 1 Queen, 2 Rooks, 2 Bishops, 2 Knights, and 8 Pawns. The highlighted squares show where white's pieces start.",
      board: initialBoard(),
      highlights: [6,7].flatMap(row => Array.from({ length: 8 }, (_, col) => ({ row, col }))),
    },
  ],
  pawn: [
    {
      title: "Pawn — Moving Forward",
      description: "Pawns move straight forward one square. On their very first move, they may advance two squares. They can NEVER move backward.",
      board: placePiece(emptyBoard(), 4, 4, "pawn", "white"),
      highlights: [{ row: 3, col: 4 }, { row: 2, col: 4 }],
    },
    {
      title: "Pawn — Capturing Diagonally",
      description: "Pawns capture diagonally — one square forward-left or forward-right. They CANNOT capture the piece straight ahead. Here the white pawn can capture either black pawn.",
      board: (() => {
        let b = placePiece(emptyBoard(), 4, 4, "pawn", "white");
        b = placePiece(b, 3, 3, "pawn", "black");
        b = placePiece(b, 3, 5, "pawn", "black");
        return b;
      })(),
      highlights: [{ row: 3, col: 3 }, { row: 3, col: 5 }],
    },
    {
      title: "Pawn — Promotion!",
      description: "When a pawn reaches the far end of the board (row 8 for white, row 1 for black), it promotes! You choose to turn it into a Queen, Rook, Bishop, or Knight. Promoting to a Queen is almost always best.",
      board: placePiece(emptyBoard(), 1, 3, "pawn", "white"),
      highlights: [{ row: 0, col: 3 }],
    },
  ],
  rook: [
    {
      title: "Rook — Straight Lines",
      description: "The Rook slides any number of squares horizontally or vertically. It controls entire ranks and files. It cannot jump over other pieces.",
      board: placePiece(emptyBoard(), 4, 4, "rook", "white"),
      highlights: [
        ...[0,1,2,3,5,6,7].map(r => ({ row: r, col: 4 })),
        ...[0,1,2,3,5,6,7].map(c => ({ row: 4, col: c })),
      ],
    },
    {
      title: "Rook — Blocked by Pieces",
      description: "The Rook stops when it hits another piece. It can capture an enemy piece (black pawn, right) but not pass it. It cannot capture a friendly piece (white pawn, left) at all.",
      board: (() => {
        let b = placePiece(emptyBoard(), 4, 4, "rook", "white");
        b = placePiece(b, 4, 6, "pawn", "black");
        b = placePiece(b, 4, 2, "pawn", "white");
        return b;
      })(),
      highlights: [
        { row: 4, col: 3 }, { row: 4, col: 5 }, { row: 4, col: 6 },
        ...[0,1,2,3,5,6,7].map(r => ({ row: r, col: 4 })),
      ],
    },
  ],
  knight: [
    {
      title: "Knight — The L-Shape",
      description: "The Knight moves in an L-shape: 2 squares in one direction, then 1 square perpendicular. It is the ONLY piece that can jump over other pieces — friendly or enemy!",
      board: placePiece(emptyBoard(), 4, 4, "knight", "white"),
      highlights: [
        { row: 2, col: 3 }, { row: 2, col: 5 },
        { row: 3, col: 2 }, { row: 3, col: 6 },
        { row: 5, col: 2 }, { row: 5, col: 6 },
        { row: 6, col: 3 }, { row: 6, col: 5 },
      ],
    },
    {
      title: "Knight — Jumping Over Pieces",
      description: "Watch how the Knight leaps right over the surrounding pawns! No other piece can do this. Knights are especially powerful when the board is crowded.",
      board: (() => {
        let b = placePiece(emptyBoard(), 4, 4, "knight", "white");
        for (const [r, c] of [[3,4],[5,4],[4,3],[4,5],[3,3],[3,5],[5,3],[5,5]])
          b = placePiece(b, r, c, "pawn", "white");
        return b;
      })(),
      highlights: [
        { row: 2, col: 3 }, { row: 2, col: 5 },
        { row: 3, col: 2 }, { row: 3, col: 6 },
        { row: 5, col: 2 }, { row: 5, col: 6 },
        { row: 6, col: 3 }, { row: 6, col: 5 },
      ],
    },
  ],
  bishop: [
    {
      title: "Bishop — Diagonal Power",
      description: "The Bishop slides any number of squares diagonally. Each player has two Bishops — one always stays on light squares, the other on dark squares forever.",
      board: placePiece(emptyBoard(), 4, 4, "bishop", "white"),
      highlights: [
        ...[1,2,3].map(d => [{ row: 4-d, col: 4-d }, { row: 4-d, col: 4+d }, { row: 4+d, col: 4-d }, { row: 4+d, col: 4+d }]).flat().filter(s => inBounds(s.row, s.col)),
      ],
    },
  ],
  queen: [
    {
      title: "Queen — Most Powerful Piece",
      description: "The Queen combines the Rook and Bishop. She can move any number of squares in any of the 8 directions. She is by far the most powerful piece. Guard her carefully!",
      board: placePiece(emptyBoard(), 4, 4, "queen", "white"),
      highlights: [
        ...[0,1,2,3,5,6,7].map(r => ({ row: r, col: 4 })),
        ...[0,1,2,3,5,6,7].map(c => ({ row: 4, col: c })),
        ...[1,2,3].map(d => [{ row: 4-d, col: 4-d }, { row: 4-d, col: 4+d }, { row: 4+d, col: 4-d }, { row: 4+d, col: 4+d }]).flat().filter(s => inBounds(s.row, s.col)),
      ],
    },
  ],
  king: [
    {
      title: "King — One Step in Any Direction",
      description: "The King can move exactly one square in any of the 8 directions. The King is the most important piece — if it is captured (checkmated), the game is over. Never move the King into danger!",
      board: placePiece(emptyBoard(), 4, 4, "king", "white"),
      highlights: [
        { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
        { row: 4, col: 3 },                       { row: 4, col: 5 },
        { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 },
      ],
    },
    {
      title: "Check and Checkmate",
      description: "When your King is under attack, that's CHECK — you MUST escape on your very next move! If there is absolutely no escape, that's CHECKMATE and the game ends. The black King here is in check from the white Queen.",
      board: (() => {
        let b = placePiece(emptyBoard(), 0, 4, "king", "black");
        b = placePiece(b, 7, 4, "king", "white");
        b = placePiece(b, 1, 1, "queen", "white");
        return b;
      })(),
      highlights: [{ row: 0, col: 4 }],
    },
    {
      title: "Castling — A Special King Move",
      description: "Castling moves the King 2 squares toward a Rook, and the Rook jumps to the other side. Requirements: neither piece has moved, no pieces between them, King is not in check, King doesn't pass through or land on an attacked square.",
      board: (() => {
        let b = placePiece(emptyBoard(), 7, 4, "king", "white");
        b = placePiece(b, 7, 7, "rook", "white");
        b = placePiece(b, 7, 0, "rook", "white");
        return b;
      })(),
      highlights: [{ row: 7, col: 6 }, { row: 7, col: 2 }],
    },
  ],
};

// ─── Interactive Piece Modules ────────────────────────────────────────────────

const Q = (
  title: string, text: string,
  board: Board,
  movePiece: Square,
  targetSquare: Square,
  successMsg: string,
): LessonTask => ({ type: "quiz", title, text, board, movePiece, targetSquare, successMsg });

const PIECE_MODULES: PieceModule[] = [
  // ─── PAWN ──────────────────────────────────────────────────────────────────
  {
    key: "pawn", name: "Pawn", emoji: "♟", color: "#16a34a", tagline: "Baby steps become big power!",
    tasks: [
      {
        type: "learn", title: "Pawns March Forward!", successMsg: "",
        text: "Pawns move straight forward — one square at a time. But on their very FIRST move they can leap ahead TWO squares! They can NEVER go backwards.",
        board: (() => { let b = placePiece(emptyBoard(), 5, 4, "pawn", "white"); return b; })(),
        highlights: [{ row: 4, col: 4 }, { row: 3, col: 4 }],
      },
      {
        type: "learn", title: "Pawns Attack Diagonally!", successMsg: "",
        text: "Pawns capture enemy pieces one square DIAGONALLY in front of them. They CANNOT capture pieces straight ahead — only diagonals! Both black pawns can be captured here.",
        board: (() => { let b = placePiece(emptyBoard(), 4, 4, "pawn", "white"); b = placePiece(b, 3, 3, "pawn", "black"); b = placePiece(b, 3, 5, "pawn", "black"); return b; })(),
        highlights: [{ row: 3, col: 3 }, { row: 3, col: 5 }],
      },
      {
        type: "try", title: "Try It! Move Your Pawn 🌱", successMsg: "Awesome! You moved the pawn! Pawns slowly march to the other side.",
        text: "Click the white pawn, then click a green square to move it. It can go 1 OR 2 squares forward from its starting spot!",
        board: placePiece(emptyBoard(), 6, 4, "pawn", "white"),
        movePiece: { row: 6, col: 4 },
      },
      Q("Challenge 1 — March Forward! 🎯","Move your pawn one square forward to the 🎯!",
        placePiece(emptyBoard(), 4, 3, "pawn", "white"),
        {row:4,col:3},{row:3,col:3},"⭐ Step by step — that's how pawns conquer the board!"),
      Q("Challenge 2 — Double Step! 🎯","It's this pawn's first move! Jump TWO squares to the 🎯!",
        placePiece(emptyBoard(), 6, 2, "pawn", "white"),
        {row:6,col:2},{row:4,col:2},"🚀 Two squares on the first move — a great opening trick!"),
      Q("Challenge 3 — Capture Left! 🎯","Diagonal attack! Capture the black pawn to the left at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 4, "pawn", "white"); b = placePiece(b, 3, 3, "pawn", "black"); return b; })(),
        {row:4,col:4},{row:3,col:3},"👈 Left diagonal capture — got it!"),
      Q("Challenge 4 — Capture Right! 🎯","Diagonal attack! Capture the black pawn to the right at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 3, "pawn", "white"); b = placePiece(b, 3, 4, "pawn", "black"); return b; })(),
        {row:4,col:3},{row:3,col:4},"👉 Right diagonal capture — sneaky!"),
      Q("Challenge 5 — Capture the Knight! 🎯","Knights beware! Your pawn can capture diagonally at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 2, "pawn", "white"); b = placePiece(b, 4, 3, "knight", "black"); return b; })(),
        {row:5,col:2},{row:4,col:3},"🐴 Got the knight! Pawns can take any piece diagonally!"),
      Q("Challenge 6 — Capture the Rook! 🎯","A powerful piece is in range! Grab the black rook at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 3, 5, "pawn", "white"); b = placePiece(b, 2, 4, "rook", "black"); return b; })(),
        {row:3,col:5},{row:2,col:4},"🏰 Pawn takes rook — that's a great trade!"),
      Q("Challenge 7 — Capture the Bishop! 🎯","The bishop is one diagonal step away — take it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 1, "pawn", "white"); b = placePiece(b, 4, 2, "bishop", "black"); return b; })(),
        {row:5,col:1},{row:4,col:2},"♝ Captured the bishop! Pawns punch above their weight!"),
      Q("Challenge 8 — Advance Fast! 🎯","Push your pawn two squares to gain space at 🎯!",
        placePiece(emptyBoard(), 6, 6, "pawn", "white"),
        {row:6,col:6},{row:4,col:6},"💨 Fast advance! Controlling space is key in chess!"),
      Q("Challenge 9 — Capture the Queen! 🎯","Incredible — your tiny pawn can take the queen! Move to 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 0, "pawn", "white"); b = placePiece(b, 3, 1, "queen", "black"); return b; })(),
        {row:4,col:0},{row:3,col:1},"😱 Pawn beats queen! Anything can happen in chess!"),
      Q("Challenge 10 — March to Glory! 🎯","One more step and this pawn will become a QUEEN! Move to 🎯!",
        placePiece(emptyBoard(), 2, 3, "pawn", "white"),
        {row:2,col:3},{row:1,col:3},"👑 Almost there! One more step = promotion to queen!"),
    ],
  },

  // ─── ROOK ──────────────────────────────────────────────────────────────────
  {
    key: "rook", name: "Rook", emoji: "♜", color: "#dc2626", tagline: "Rules every row and column!",
    tasks: [
      {
        type: "learn", title: "Rooks Rule Straight Lines!", successMsg: "",
        text: "The Rook slides any number of squares in a straight line — left, right, up, or down. It controls whole rows (ranks) and columns (files)! It CANNOT jump over other pieces.",
        board: placePiece(emptyBoard(), 4, 4, "rook", "white"),
        highlights: [
          ...[0,1,2,3,5,6,7].map(r => ({ row: r, col: 4 })),
          ...[0,1,2,3,5,6,7].map(c => ({ row: 4, col: c })),
        ],
      },
      {
        type: "learn", title: "Rooks Stop at Other Pieces", successMsg: "",
        text: "The Rook cannot pass through pieces. It stops before a friendly piece and stops AFTER capturing an enemy piece. It can still slide up and down freely here!",
        board: (() => { let b = placePiece(emptyBoard(), 4, 4, "rook", "white"); b = placePiece(b, 4, 6, "pawn", "black"); b = placePiece(b, 4, 1, "pawn", "white"); return b; })(),
        highlights: [{ row:4,col:2},{row:4,col:3},{row:4,col:5},{row:4,col:6}, ...[0,1,2,3,5,6,7].map(r => ({ row: r, col: 4 }))],
      },
      {
        type: "try", title: "Try It! Slide Your Rook 🏰", successMsg: "Brilliant! The rook is a powerhouse along rows and columns!",
        text: "Click the white rook, then move it anywhere along its row or column. The green squares show all the places it can go!",
        board: placePiece(emptyBoard(), 4, 4, "rook", "white"),
        movePiece: { row: 4, col: 4 },
      },
      Q("Challenge 1 — Slide Right! 🎯","Slide your rook RIGHT along the row to reach 🎯!",
        placePiece(emptyBoard(), 4, 0, "rook", "white"),
        {row:4,col:0},{row:4,col:5},"➡️ The rook zooms across the entire row in one move!"),
      Q("Challenge 2 — Slide Left! 🎯","Slide your rook LEFT along the row to reach 🎯!",
        placePiece(emptyBoard(), 5, 7, "rook", "white"),
        {row:5,col:7},{row:5,col:2},"⬅️ Rooks can slide any distance — left or right!"),
      Q("Challenge 3 — Move Up the Column! 🎯","Slide your rook UP the file to reach 🎯!",
        placePiece(emptyBoard(), 7, 3, "rook", "white"),
        {row:7,col:3},{row:2,col:3},"⬆️ Straight up the column — rooks love open files!"),
      Q("Challenge 4 — Move Down! 🎯","Slide your rook DOWN to reach 🎯!",
        placePiece(emptyBoard(), 1, 5, "rook", "white"),
        {row:1,col:5},{row:6,col:5},"⬇️ Down the file in one shot!"),
      Q("Challenge 5 — Capture the Pawn! 🎯","Slide right and take the black pawn at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 3, 0, "rook", "white"); b = placePiece(b, 3, 5, "pawn", "black"); return b; })(),
        {row:3,col:0},{row:3,col:5},"💥 Pawn captured! Rooks love open ranks!"),
      Q("Challenge 6 — Capture the Knight! 🎯","The knight is up the column — take it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 6, 2, "rook", "white"); b = placePiece(b, 1, 2, "knight", "black"); return b; })(),
        {row:6,col:2},{row:1,col:2},"🐴 Knight captured! Rooks dominate open files!"),
      Q("Challenge 7 — Capture the Bishop! 🎯","Slide your rook left to snatch the bishop at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 7, "rook", "white"); b = placePiece(b, 4, 1, "bishop", "black"); return b; })(),
        {row:4,col:7},{row:4,col:1},"♝ Bishop down! Nothing escapes a rook on an open rank!"),
      Q("Challenge 8 — Capture the Queen! 🎯","The most valuable target! Slide up and take the queen at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 7, 4, "rook", "white"); b = placePiece(b, 0, 4, "queen", "black"); return b; })(),
        {row:7,col:4},{row:0,col:4},"👑 You captured the queen! That's a massive win!"),
      Q("Challenge 9 — Capture the Rook! 🎯","Enemy rook on the same file — take it first at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 7, 0, "rook", "white"); b = placePiece(b, 2, 0, "rook", "black"); return b; })(),
        {row:7,col:0},{row:2,col:0},"♖ Rook takes rook! Whoever goes first wins the exchange!"),
      Q("Challenge 10 — Long Slide Capture! 🎯","Slide all the way across to grab the pawn at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 6, 7, "rook", "white"); b = placePiece(b, 6, 0, "pawn", "black"); return b; })(),
        {row:6,col:7},{row:6,col:0},"🚀 Full rank in one move — that's rook power!"),
    ],
  },

  // ─── KNIGHT ────────────────────────────────────────────────────────────────
  {
    key: "knight", name: "Knight", emoji: "♞", color: "#ea580c", tagline: "The only piece that can leap!",
    tasks: [
      {
        type: "learn", title: "Knights Jump in an L-Shape!", successMsg: "",
        text: "The Knight moves in an L: 2 squares one direction, then 1 square sideways (or vice versa). It is the ONLY piece that can jump OVER other pieces!",
        board: placePiece(emptyBoard(), 4, 4, "knight", "white"),
        highlights: [{row:2,col:3},{row:2,col:5},{row:3,col:2},{row:3,col:6},{row:5,col:2},{row:5,col:6},{row:6,col:3},{row:6,col:5}],
      },
      {
        type: "learn", title: "Knights Leap Over Anything!", successMsg: "",
        text: "The knight is completely surrounded by pawns but can STILL jump to all 8 squares! No other piece can do this sneaky trick.",
        board: (() => { let b = placePiece(emptyBoard(), 4, 4, "knight", "white"); for (const [r,c] of [[3,3],[3,4],[3,5],[4,3],[4,5],[5,3],[5,4],[5,5]]) b = placePiece(b, r, c, "pawn", "white"); return b; })(),
        highlights: [{row:2,col:3},{row:2,col:5},{row:3,col:2},{row:3,col:6},{row:5,col:2},{row:5,col:6},{row:6,col:3},{row:6,col:5}],
      },
      {
        type: "try", title: "Try It! Make an L-Move 🐴", successMsg: "Yee-haw! That's the L-shape! Knights are tricky to stop!",
        text: "Click the knight to see all 8 landing spots, then click any green square to leap!",
        board: placePiece(emptyBoard(), 4, 4, "knight", "white"),
        movePiece: { row: 4, col: 4 },
      },
      Q("Challenge 1 — Jump Up-Right! 🎯","Make an L: 2 up + 1 right to reach 🎯!",
        placePiece(emptyBoard(), 5, 3, "knight", "white"),
        {row:5,col:3},{row:3,col:4},"↗️ 2 up, 1 right — classic knight leap!"),
      Q("Challenge 2 — Jump Up-Left! 🎯","Make an L: 2 up + 1 left to reach 🎯!",
        placePiece(emptyBoard(), 5, 4, "knight", "white"),
        {row:5,col:4},{row:3,col:3},"↖️ 2 up, 1 left — got it!"),
      Q("Challenge 3 — Jump Right-Up! 🎯","Make an L: 1 up + 2 right to reach 🎯!",
        placePiece(emptyBoard(), 4, 3, "knight", "white"),
        {row:4,col:3},{row:3,col:5},"↗️ 1 up, 2 right — the other L!"),
      Q("Challenge 4 — Jump Left-Down! 🎯","Make an L: 1 down + 2 left to reach 🎯!",
        placePiece(emptyBoard(), 3, 5, "knight", "white"),
        {row:3,col:5},{row:4,col:3},"↙️ Going down-left the L way!"),
      Q("Challenge 5 — Capture the Pawn! 🎯","L-jump to grab the black pawn at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 2, "knight", "white"); b = placePiece(b, 3, 3, "pawn", "black"); return b; })(),
        {row:5,col:2},{row:3,col:3},"🌱 Pawn captured with the L-jump!"),
      Q("Challenge 6 — Leap Over & Capture! 🎯","Jump OVER the pawns to grab the black piece at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 3, "knight", "white"); b = placePiece(b, 4, 3, "pawn", "white"); b = placePiece(b, 4, 4, "pawn", "white"); b = placePiece(b, 3, 2, "bishop", "black"); return b; })(),
        {row:5,col:3},{row:3,col:2},"🦘 Leaped right over the pawns — knights are amazing!"),
      Q("Challenge 7 — Capture the Bishop! 🎯","L-jump onto the black bishop at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 4, "knight", "white"); b = placePiece(b, 2, 3, "bishop", "black"); return b; })(),
        {row:4,col:4},{row:2,col:3},"♝ Bishop taken by the sneaky knight!"),
      Q("Challenge 8 — Capture the Rook! 🎯","The rook can't stop a leaping knight — grab it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 2, "knight", "white"); b = placePiece(b, 2, 3, "rook", "black"); return b; })(),
        {row:4,col:2},{row:2,col:3},"🏰 Knight beats rook — great move!"),
      Q("Challenge 9 — Corner Jump! 🎯","Knights can reach tricky corner squares — make the leap to 🎯!",
        placePiece(emptyBoard(), 4, 5, "knight", "white"),
        {row:4,col:5},{row:6,col:6},"🎯 Corner squares are hard — you found it!"),
      Q("Challenge 10 — Capture the Queen! 🎯","Incredible! Your knight can take the queen — jump to 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 4, "knight", "white"); b = placePiece(b, 2, 5, "queen", "black"); return b; })(),
        {row:4,col:4},{row:2,col:5},"👑 Knight takes queen! The L-shape is unstoppable!"),
    ],
  },

  // ─── BISHOP ────────────────────────────────────────────────────────────────
  {
    key: "bishop", name: "Bishop", emoji: "♝", color: "#9333ea", tagline: "Diagonal darter!",
    tasks: [
      {
        type: "learn", title: "Bishops Glide Diagonally!", successMsg: "",
        text: "The Bishop slides any number of squares diagonally. Notice it always stays on the SAME colour square! Each player has one light-square bishop and one dark-square bishop forever.",
        board: placePiece(emptyBoard(), 4, 4, "bishop", "white"),
        highlights: [
          ...[1,2,3].flatMap(d => [
            {row:4-d,col:4-d},{row:4-d,col:4+d},{row:4+d,col:4-d},{row:4+d,col:4+d},
          ]).filter(s => inBounds(s.row, s.col)),
        ],
      },
      {
        type: "learn", title: "Bishops Stay on Their Colour!", successMsg: "",
        text: "The bishop on a LIGHT square will ALWAYS stay on light squares. The bishop on a DARK square will ALWAYS stay on dark squares. That's why having BOTH bishops is so powerful!",
        board: (() => { let b = placePiece(emptyBoard(), 7, 2, "bishop", "white"); b = placePiece(b, 7, 5, "bishop", "white"); return b; })(),
        highlights: [
          ...[1,2,3,4,5].flatMap(d => [{row:7-d,col:2-d},{row:7-d,col:2+d}]).filter(s=>inBounds(s.row,s.col)),
          ...[1,2,3,4,5].flatMap(d => [{row:7-d,col:5-d},{row:7-d,col:5+d}]).filter(s=>inBounds(s.row,s.col)),
        ],
      },
      {
        type: "try", title: "Try It! Slide Diagonally 💜", successMsg: "Diagonal master! The bishop can cover a whole diagonal in one move!",
        text: "Click the bishop and glide it along any diagonal. Notice it always stays on the same colour!",
        board: placePiece(emptyBoard(), 4, 3, "bishop", "white"),
        movePiece: { row: 4, col: 3 },
      },
      Q("Challenge 1 — Diagonal Up-Right! 🎯","Slide diagonally up and right to 🎯!",
        placePiece(emptyBoard(), 5, 2, "bishop", "white"),
        {row:5,col:2},{row:2,col:5},"↗️ Long diagonal up-right — bishops love open boards!"),
      Q("Challenge 2 — Diagonal Up-Left! 🎯","Slide diagonally up and left to 🎯!",
        placePiece(emptyBoard(), 5, 5, "bishop", "white"),
        {row:5,col:5},{row:2,col:2},"↖️ Up-left diagonal — same colour all the way!"),
      Q("Challenge 3 — Diagonal Down-Right! 🎯","Slide diagonally DOWN and to the right to reach 🎯!",
        placePiece(emptyBoard(), 2, 2, "bishop", "white"),
        {row:2,col:2},{row:5,col:5},"↘️ Down-right diagonal — bishops can go both ways!"),
      Q("Challenge 4 — Short Diagonal! 🎯","Just one diagonal step to 🎯 — short but sharp!",
        placePiece(emptyBoard(), 4, 4, "bishop", "white"),
        {row:4,col:4},{row:3,col:5},"⚡ Short and sweet — bishops can move just one too!"),
      Q("Challenge 5 — Capture the Pawn! 🎯","Slide to take the black pawn at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 1, "bishop", "white"); b = placePiece(b, 2, 4, "pawn", "black"); return b; })(),
        {row:5,col:1},{row:2,col:4},"🌱 Pawn captured diagonally!"),
      Q("Challenge 6 — Capture the Knight! 🎯","The knight can't outrun a bishop on an open diagonal — take it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 6, 0, "bishop", "white"); b = placePiece(b, 3, 3, "knight", "black"); return b; })(),
        {row:6,col:0},{row:3,col:3},"🐴 Bishop takes knight — great diagonal shot!"),
      Q("Challenge 7 — Capture the Rook! 🎯","Bishops can snipe rooks from far away — grab it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 6, 1, "bishop", "white"); b = placePiece(b, 2, 5, "rook", "black"); return b; })(),
        {row:6,col:1},{row:2,col:5},"🏰 Rook captured from across the board!"),
      Q("Challenge 8 — Cross-Board Strike! 🎯","Long range attack — slide the full diagonal to 🎯!",
        (() => { let b = placePiece(emptyBoard(), 7, 0, "bishop", "white"); b = placePiece(b, 0, 7, "pawn", "black"); return b; })(),
        {row:7,col:0},{row:0,col:7},"💥 Full diagonal — corner to corner in one move!"),
      Q("Challenge 9 — Capture the Queen! 🎯","The queen is on your diagonal — snatch it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 0, "bishop", "white"); b = placePiece(b, 3, 2, "queen", "black"); return b; })(),
        {row:5,col:0},{row:3,col:2},"👑 Bishop takes queen — incredible value!"),
      Q("Challenge 10 — Change Direction! 🎯","Now go the OTHER diagonal direction to reach 🎯!",
        placePiece(emptyBoard(), 4, 4, "bishop", "white"),
        {row:4,col:4},{row:6,col:2},"🔄 Down-left diagonal — bishops can change direction each move!"),
    ],
  },

  // ─── QUEEN ─────────────────────────────────────────────────────────────────
  {
    key: "queen", name: "Queen", emoji: "♛", color: "#db2777", tagline: "The most powerful piece!",
    tasks: [
      {
        type: "learn", title: "The Queen Goes Everywhere!", successMsg: "",
        text: "The Queen is a Rook AND a Bishop combined! She slides any number of squares in ALL 8 directions. She is by far the strongest piece — protect her at all costs!",
        board: placePiece(emptyBoard(), 4, 4, "queen", "white"),
        highlights: [
          ...[0,1,2,3,5,6,7].map(r => ({ row: r, col: 4 })),
          ...[0,1,2,3,5,6,7].map(c => ({ row: 4, col: c })),
          ...[1,2,3].flatMap(d => [{row:4-d,col:4-d},{row:4-d,col:4+d},{row:4+d,col:4-d},{row:4+d,col:4+d}]).filter(s=>inBounds(s.row,s.col)),
        ],
      },
      {
        type: "learn", title: "Queens Are Stopped by Pieces", successMsg: "",
        text: "Like rooks and bishops, the queen cannot jump over other pieces. She stops before a friendly piece or stops AFTER capturing an enemy piece. Always use her safely!",
        board: (() => { let b = placePiece(emptyBoard(), 4, 4, "queen", "white"); b = placePiece(b, 4, 6, "pawn", "black"); b = placePiece(b, 2, 2, "pawn", "white"); return b; })(),
        highlights: [{row:4,col:5},{row:4,col:6},...[0,1,2,3,5,6,7].map(r=>({row:r,col:4})),...[0,1,2,3,5].map(c=>({row:4,col:c})),...[1].flatMap(d=>[{row:4-d,col:4-d},{row:4-d,col:4+d},{row:4+d,col:4-d},{row:4+d,col:4+d}]).filter(s=>inBounds(s.row,s.col))],
      },
      {
        type: "try", title: "Try It! Unleash the Queen 👸", successMsg: "Powerful! The queen controls the whole board from one move!",
        text: "Click the queen — she can go almost anywhere! Pick any green square and watch her zoom there!",
        board: placePiece(emptyBoard(), 4, 4, "queen", "white"),
        movePiece: { row: 4, col: 4 },
      },
      Q("Challenge 1 — Slide Right! 🎯","Slide the queen horizontally to the right to reach 🎯!",
        placePiece(emptyBoard(), 4, 0, "queen", "white"),
        {row:4,col:0},{row:4,col:6},"➡️ Queens slide like rooks across the whole rank!"),
      Q("Challenge 2 — Slide Up! 🎯","Move the queen straight up the column to 🎯!",
        placePiece(emptyBoard(), 7, 3, "queen", "white"),
        {row:7,col:3},{row:1,col:3},"⬆️ Straight up the file — rook power!"),
      Q("Challenge 3 — Diagonal Strike! 🎯","Slide the queen diagonally to reach 🎯!",
        placePiece(emptyBoard(), 6, 1, "queen", "white"),
        {row:6,col:1},{row:2,col:5},"↗️ Diagonal like a bishop — the queen does it all!"),
      Q("Challenge 4 — Capture the Pawn! 🎯","Grab the black pawn at 🎯 with your queen!",
        (() => { let b = placePiece(emptyBoard(), 4, 0, "queen", "white"); b = placePiece(b, 4, 5, "pawn", "black"); return b; })(),
        {row:4,col:0},{row:4,col:5},"💥 Pawn captured horizontally!"),
      Q("Challenge 5 — Capture Vertically! 🎯","Slide up the column to take the black knight at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 6, 4, "queen", "white"); b = placePiece(b, 1, 4, "knight", "black"); return b; })(),
        {row:6,col:4},{row:1,col:4},"🐴 Queen slides straight up to take the knight!"),
      Q("Challenge 6 — Capture Diagonally! 🎯","Strike diagonally to take the black bishop at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 0, "queen", "white"); b = placePiece(b, 2, 3, "bishop", "black"); return b; })(),
        {row:5,col:0},{row:2,col:3},"♝ Diagonal capture — bishop beaten!"),
      Q("Challenge 7 — Check from Distance! 🎯","Move the queen to 🎯 to put the black king in CHECK!",
        (() => { let b = placePiece(emptyBoard(), 7, 0, "queen", "white"); b = placePiece(b, 0, 4, "king", "black"); b = placePiece(b, 7, 4, "king", "white"); return b; })(),
        {row:7,col:0},{row:0,col:0},"⚠️ Check! The queen controls the whole column!"),
      Q("Challenge 8 — Check Diagonally! 🎯","Move the queen to 🎯 to threaten the black king diagonally!",
        (() => { let b = placePiece(emptyBoard(), 7, 0, "queen", "white"); b = placePiece(b, 4, 3, "king", "black"); b = placePiece(b, 7, 4, "king", "white"); return b; })(),
        {row:7,col:0},{row:5,col:2},"↗️ Diagonal check — the king is in trouble!"),
      Q("Challenge 9 — Capture the Rook! 🎯","The rook is valuable — slide the queen to take it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 3, 3, "queen", "white"); b = placePiece(b, 3, 7, "rook", "black"); return b; })(),
        {row:3,col:3},{row:3,col:7},"🏰 Queen takes rook — a great trade!"),
      Q("Challenge 10 — Capture the Queen! 🎯","Take the enemy queen before she causes trouble — move to 🎯!",
        (() => { let b = placePiece(emptyBoard(), 6, 2, "queen", "white"); b = placePiece(b, 1, 7, "queen", "black"); return b; })(),
        {row:6,col:2},{row:1,col:7},"👑 Queen takes queen — now YOU have the advantage!"),
    ],
  },

  // ─── KING ──────────────────────────────────────────────────────────────────
  {
    key: "king", name: "King", emoji: "♚", color: "#ca8a04", tagline: "The most important piece!",
    tasks: [
      {
        type: "learn", title: "The King Takes One Step", successMsg: "",
        text: "The King moves exactly ONE square in any of the 8 directions. He is the most important piece — if he's captured (checkmated), the game ends! Never walk your King into danger.",
        board: placePiece(emptyBoard(), 4, 4, "king", "white"),
        highlights: [{row:3,col:3},{row:3,col:4},{row:3,col:5},{row:4,col:3},{row:4,col:5},{row:5,col:3},{row:5,col:4},{row:5,col:5}],
      },
      {
        type: "learn", title: "Check! You MUST Escape!", successMsg: "",
        text: "When your King is attacked, that's CHECK ⚠️ — you MUST get him to safety immediately! If there is NO escape, that's CHECKMATE and the game is over.",
        board: (() => { let b = placePiece(emptyBoard(), 0, 4, "king", "black"); b = placePiece(b, 7, 4, "king", "white"); b = placePiece(b, 1, 1, "queen", "white"); return b; })(),
        highlights: [{ row: 0, col: 4 }],
      },
      {
        type: "try", title: "Try It! Move the King 👑", successMsg: "Great! Remember — one careful step at a time for the King!",
        text: "Click the King and move him one square in any direction. He's slow but the most important!",
        board: placePiece(emptyBoard(), 4, 4, "king", "white"),
        movePiece: { row: 4, col: 4 },
      },
      Q("Challenge 1 — Step Right! 🎯","Move the king one square to the RIGHT to reach 🎯!",
        placePiece(emptyBoard(), 4, 3, "king", "white"),
        {row:4,col:3},{row:4,col:4},"➡️ One step right — the king moves one square at a time!"),
      Q("Challenge 2 — Step Up! 🎯","Move the king one square FORWARD to reach 🎯!",
        placePiece(emptyBoard(), 5, 4, "king", "white"),
        {row:5,col:4},{row:4,col:4},"⬆️ One step forward — slowly but surely!"),
      Q("Challenge 3 — Diagonal Step! 🎯","Move the king diagonally (up-right) to 🎯!",
        placePiece(emptyBoard(), 5, 3, "king", "white"),
        {row:5,col:3},{row:4,col:4},"↗️ Diagonal step — kings can go in all 8 directions!"),
      Q("Challenge 4 — Step Left! 🎯","Move the king one square to the LEFT to 🎯!",
        placePiece(emptyBoard(), 4, 5, "king", "white"),
        {row:4,col:5},{row:4,col:4},"⬅️ One step left — the king keeps careful control!"),
      Q("Challenge 5 — Escape the Rook! 🎯","Your king is in CHECK from the rook! Step to the safe 🎯 square!",
        (() => { let b = placePiece(emptyBoard(), 4, 4, "king", "white"); b = placePiece(b, 4, 0, "rook", "black"); b = placePiece(b, 0, 7, "king", "black"); return b; })(),
        {row:4,col:4},{row:3,col:4},"✅ Safe! Always escape check on your very next move!"),
      Q("Challenge 6 — Escape Diagonally! 🎯","The rook controls the whole rank! Step off it diagonally to 🎯!",
        (() => { let b = placePiece(emptyBoard(), 5, 3, "king", "white"); b = placePiece(b, 5, 7, "rook", "black"); b = placePiece(b, 0, 7, "king", "black"); return b; })(),
        {row:5,col:3},{row:4,col:4},"↗️ Step off the rank — the king escapes diagonally!"),
      Q("Challenge 7 — Capture the Pawn! 🎯","The black pawn is right next to the king — take it at 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 4, "king", "white"); b = placePiece(b, 3, 5, "pawn", "black"); b = placePiece(b, 0, 0, "king", "black"); return b; })(),
        {row:4,col:4},{row:3,col:5},"🌱 King captures pawn! The king can take adjacent enemy pieces!"),
      Q("Challenge 8 — Capture the Knight! 🎯","The knight is one step away — kings can capture too! Move to 🎯!",
        (() => { let b = placePiece(emptyBoard(), 4, 4, "king", "white"); b = placePiece(b, 4, 5, "knight", "black"); b = placePiece(b, 0, 0, "king", "black"); return b; })(),
        {row:4,col:4},{row:4,col:5},"🐴 King takes knight — but only if it's safe to do so!"),
      Q("Challenge 9 — Step Down to Safety! 🎯","Dodge the check by stepping DOWN one square to 🎯!",
        (() => { let b = placePiece(emptyBoard(), 3, 4, "king", "white"); b = placePiece(b, 0, 4, "rook", "black"); b = placePiece(b, 0, 0, "king", "black"); return b; })(),
        {row:3,col:4},{row:4,col:4},"⬇️ Stepped out of the rook's column — safe!"),
      Q("Challenge 10 — Tricky Escape! 🎯","The bishop has your king in check! The ONLY safe square is 🎯 — find it!",
        (() => { let b = placePiece(emptyBoard(), 4, 4, "king", "white"); b = placePiece(b, 0, 0, "bishop", "black"); b = placePiece(b, 7, 7, "king", "black"); return b; })(),
        {row:4,col:4},{row:4,col:5},"🎉 You found the escape! Always look for the safe square!"),
    ],
  },
];

// ─── Keyframe injection ──────────────────────────────────────────────────────

const PULSE_CSS = `
@keyframes yourTurnPulse {
  0%   { transform: scale(1);    box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
  50%  { transform: scale(1.04); box-shadow: 0 0 0 10px rgba(34,197,94,0); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(34,197,94,0); }
}
@keyframes checkPulse {
  0%,100% { background: #dc2626; }
  50%      { background: #ef4444; }
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes targetPulse {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.25); }
}
@keyframes wrongShake {
  0%,100% { transform: translateX(0); }
  20%     { transform: translateX(-6px); }
  40%     { transform: translateX(6px); }
  60%     { transform: translateX(-4px); }
  80%     { transform: translateX(4px); }
}
@keyframes successPop {
  0%   { transform: scale(0.5); opacity: 0; }
  60%  { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); }
}
`;
if (typeof document !== "undefined" && !document.getElementById("chess-keyframes")) {
  const s = document.createElement("style");
  s.id = "chess-keyframes";
  s.textContent = PULSE_CSS;
  document.head.appendChild(s);
}

// ─── Lesson Mode ──────────────────────────────────────────────────────────────

function LessonMode({ onBack }: { onBack: () => void }) {
  const [activeModule, setActiveModule] = useState<PieceModule | null>(null);
  const [taskIdx, setTaskIdx] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [taskBoard, setTaskBoard] = useState<Board | null>(null);
  const [taskDone, setTaskDone] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [completedPieces, setCompletedPieces] = useState<Set<string>>(new Set());

  const task = activeModule ? activeModule.tasks[taskIdx] : null;
  const displayBoard = taskBoard ?? task?.board ?? emptyBoard();
  const color = activeModule?.color ?? "#6366f1";

  // Which moves are valid from the movePiece square
  const validMoves: Square[] = (task?.movePiece && !taskDone && selected)
    ? rawMoves(displayBoard, task.movePiece, null, NO_CASTLING)
    : [];

  function openModule(mod: PieceModule) {
    setActiveModule(mod);
    setTaskIdx(0);
    setSelected(null);
    setTaskBoard(null);
    setTaskDone(false);
    setWrongFlash(false);
  }

  function goToTask(idx: number) {
    setTaskIdx(idx);
    setSelected(null);
    setTaskBoard(null);
    setTaskDone(false);
    setWrongFlash(false);
  }

  function nextTask() {
    if (!activeModule) return;
    if (taskIdx < activeModule.tasks.length - 1) {
      goToTask(taskIdx + 1);
    } else {
      // Module complete!
      setCompletedPieces(prev => new Set([...prev, activeModule.key]));
      setActiveModule(null);
    }
  }

  function handleBoardClick(sq: Square) {
    if (!task || !task.movePiece || taskDone) return;

    if (!selected) {
      // Select the piece
      if (sq.row === task.movePiece.row && sq.col === task.movePiece.col) {
        setSelected(sq);
      }
      return;
    }

    // Try to move
    const moves = rawMoves(displayBoard, task.movePiece, null, NO_CASTLING);
    const isValid = moves.some(m => m.row === sq.row && m.col === sq.col);

    if (!isValid) {
      // Re-click piece = deselect; other invalid = shake
      if (sq.row === task.movePiece.row && sq.col === task.movePiece.col) {
        setSelected(null);
      } else {
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 500);
      }
      return;
    }

    // For quiz: must hit the target square
    if (task.type === "quiz" && task.targetSquare) {
      if (sq.row !== task.targetSquare.row || sq.col !== task.targetSquare.col) {
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 500);
        setSelected(null);
        return;
      }
    }

    // Success — apply move
    const newBoard = applyMoveOnBoard(displayBoard, task.movePiece, sq, null);
    setTaskBoard(newBoard);
    setSelected(null);
    setTaskDone(true);
  }

  // ── Hub screen ───────────────────────────────────────────────────────────────
  if (!activeModule) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px 0" }}>
          <button onClick={onBack} style={{ ...backBtnStyle, background: "rgba(255,255,255,0.12)", color: "#e0e7ff", border: "1.5px solid rgba(255,255,255,0.2)" }}>← Back</button>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>Chess Academy 🎓</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>Pick a piece — learn it, try it, quiz it!</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14, padding: "20px 22px 28px" }}>
          {PIECE_MODULES.map(mod => {
            const done = completedPieces.has(mod.key);
            return (
              <button key={mod.key} onClick={() => openModule(mod)} style={{
                background: done
                  ? `linear-gradient(135deg,${mod.color}cc,${mod.color}88)`
                  : "rgba(255,255,255,0.07)",
                border: `2.5px solid ${done ? mod.color : "rgba(255,255,255,0.15)"}`,
                borderRadius: 20, padding: "18px 12px 16px",
                cursor: "pointer", textAlign: "center",
                boxShadow: done ? `0 6px 24px ${mod.color}55` : "0 2px 10px rgba(0,0,0,0.3)",
                transition: "transform 0.15s, box-shadow 0.15s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{ fontSize: 40, lineHeight: 1, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}>
                  {mod.emoji}
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: done ? "#fff" : mod.color }}>{mod.name}</div>
                <div style={{ fontSize: 10, color: done ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)", lineHeight: 1.3 }}>{mod.tagline}</div>
                {done && (
                  <div style={{ marginTop: 4, background: "rgba(255,255,255,0.25)", borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 800, color: "#fff" }}>
                    ✅ Complete!
                  </div>
                )}
                {!done && (
                  <div style={{ marginTop: 4, background: `${mod.color}33`, borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 700, color: mod.color, border: `1px solid ${mod.color}55` }}>
                    {mod.tasks.length} steps →
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {completedPieces.size > 0 && (
          <div style={{ margin: "0 22px 24px", padding: "14px 18px", background: "rgba(255,255,255,0.07)", borderRadius: 16, border: "1.5px solid rgba(255,255,255,0.12)", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
              🏆 {completedPieces.size} of {PIECE_MODULES.length} pieces mastered!
            </div>
            {completedPieces.size === PIECE_MODULES.length && (
              <div style={{ marginTop: 6, fontSize: 15, fontWeight: 900, color: "#fbbf24" }}>
                ⭐ You're a Chess Academy Graduate! ⭐
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Per-piece module ──────────────────────────────────────────────────────────
  if (!task) return null;
  const isInteractive = task.type === "try" || task.type === "quiz";
  const typeBadge = task.type === "learn" ? "📖 Learn" : task.type === "try" ? "🖱️ Try It!" : "🧠 Quiz";
  const typeBg = task.type === "learn" ? "#3b82f6" : task.type === "try" ? "#16a34a" : "#dc2626";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e3a5f 100%)", overflow: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px 8px", flexWrap: "wrap" }}>
        <button onClick={() => setActiveModule(null)} style={{ ...backBtnStyle, background: "rgba(255,255,255,0.1)", color: "#e0e7ff", border: "1.5px solid rgba(255,255,255,0.2)" }}>← Back</button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>{activeModule.emoji}</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: color }}>{activeModule.name}</span>
          <span style={{ fontSize: 11, background: typeBg, color: "#fff", borderRadius: 99, padding: "2px 10px", fontWeight: 700 }}>{typeBadge}</span>
        </div>
        {/* Step dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {activeModule.tasks.map((t, i) => {
            const isDone = i < taskIdx || (i === taskIdx && taskDone);
            const isCurrent = i === taskIdx;
            return (
              <div key={i} style={{
                width: isCurrent ? 28 : 10, height: 10, borderRadius: 99,
                background: isDone ? "#22c55e" : isCurrent ? color : "rgba(255,255,255,0.2)",
                transition: "all 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#fff",
              }}>
                {isDone && !isCurrent ? "✓" : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "0 18px 10px" }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{task.title}</div>
      </div>

      {/* Board — large and centered */}
      <div style={{ display: "flex", justifyContent: "center", padding: "0 14px" }}>
        <div style={{
          width: "min(92vw, 480px)", aspectRatio: "1",
          borderRadius: 18, overflow: "hidden",
          boxShadow: wrongFlash
            ? "0 0 0 4px #ef4444, 0 16px 48px rgba(0,0,0,0.5)"
            : taskDone
            ? "0 0 0 4px #22c55e, 0 16px 48px rgba(0,0,0,0.5)"
            : "0 16px 48px rgba(0,0,0,0.5)",
          animation: wrongFlash ? "wrongShake 0.5s ease" : undefined,
          transition: "box-shadow 0.3s",
        }}>
          <ChessBoard
            board={displayBoard}
            selected={selected}
            validMoves={validMoves}
            highlights={task.highlights ?? []}
            onSquareClick={isInteractive ? handleBoardClick : undefined}
            interactive={isInteractive && !taskDone}
            targetSquare={!taskDone ? task.targetSquare : null}
          />
        </div>
      </div>

      {/* Instruction / feedback card */}
      <div style={{ padding: "12px 18px 20px" }}>
        {taskDone ? (
          <div style={{
            background: "linear-gradient(135deg,#16a34a,#15803d)", borderRadius: 18,
            padding: "18px 20px", textAlign: "center",
            animation: "successPop 0.4s ease",
            boxShadow: "0 8px 28px rgba(22,163,74,0.5)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🎉</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{task.successMsg}</div>
            <button onClick={nextTask} style={{
              background: "#fff", color: "#16a34a", border: "none",
              borderRadius: 99, padding: "10px 28px", fontWeight: 900,
              cursor: "pointer", fontSize: 15, boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            }}>
              {taskIdx < activeModule.tasks.length - 1 ? "Next →" : "🏆 Finish Module!"}
            </button>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.08)", border: `1.5px solid ${color}44`, borderRadius: 18, padding: "14px 18px" }}>
            <p style={{ margin: "0 0 12px", fontSize: 15, lineHeight: 1.65, color: "#e0e7ff", fontWeight: 500 }}>
              {task.text}
            </p>
            {task.type === "learn" && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => goToTask(Math.max(0, taskIdx - 1))} disabled={taskIdx === 0}
                  style={{ flex: 1, padding: "10px", borderRadius: 12, border: `2px solid ${color}55`, background: "transparent", color: taskIdx === 0 ? "rgba(255,255,255,0.2)" : color, fontWeight: 700, cursor: taskIdx === 0 ? "default" : "pointer", fontSize: 14 }}>
                  ← Prev
                </button>
                <button onClick={nextTask}
                  style={{ flex: 2, padding: "10px", borderRadius: 12, border: "none", background: color, color: "#fff", fontWeight: 900, cursor: "pointer", fontSize: 14, boxShadow: `0 4px 14px ${color}66` }}>
                  {taskIdx < activeModule.tasks.length - 1 ? "Got it! Next →" : "🏆 Finish!"}
                </button>
              </div>
            )}
            {isInteractive && !selected && (
              <div style={{ fontSize: 12, color: `${color}`, fontWeight: 700, background: `${color}22`, borderRadius: 10, padding: "7px 12px", textAlign: "center" }}>
                👆 Click the {activeModule.name.toLowerCase()} piece to select it!
              </div>
            )}
            {isInteractive && selected && (
              <div style={{ fontSize: 12, color: "#86efac", fontWeight: 700, background: "rgba(34,197,94,0.15)", borderRadius: 10, padding: "7px 12px", textAlign: "center" }}>
                ✅ Great! Now click a green square to move!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const backBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.9)", color: "#374151",
  border: "1.5px solid rgba(0,0,0,0.12)", borderRadius: 99,
  padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13,
  flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(12px)",
  border: "1.5px solid rgba(255,255,255,0.9)",
  borderRadius: 20,
  padding: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
};

const sideCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(8px)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: "14px 14px",
};

function navBtnStyle(disabled: boolean, color: string): React.CSSProperties {
  return {
    flex: 1, padding: "9px 0", borderRadius: 99,
    border: "none",
    background: disabled ? "#f3f4f6" : color,
    color: disabled ? "#9ca3af" : "#fff",
    fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", fontSize: 14,
    boxShadow: disabled ? "none" : `0 4px 12px ${color}55`,
    transition: "all 0.15s",
  };
}

// ─── Initial Game State ───────────────────────────────────────────────────────

function initialGameState(): GameState {
  return {
    board: initialBoard(),
    turn: "white",
    selected: null,
    validMoves: [],
    capturedWhite: [],
    capturedBlack: [],
    castlingRights: { whiteKingSide: true, whiteQueenSide: true, blackKingSide: true, blackQueenSide: true },
    enPassantTarget: null,
    status: "playing",
    winner: null,
    moveHistory: [],
    promotionPending: null,
    lastMove: null,
    boardHistory: [],
  };
}

// ─── Play Mode ────────────────────────────────────────────────────────────────

function CapturedRow({ pieces, label }: { pieces: Piece[]; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 28 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", minWidth: 80 }}>{label}</span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {pieces.length === 0
          ? <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
          : pieces.map((p, i) => (
              <span key={i} style={{
                fontSize: 18, lineHeight: 1,
                color: p.color === "white" ? "#fff" : "#1e1b4b",
                textShadow: p.color === "white" ? "0 0 2px #000, 0 1px 3px rgba(0,0,0,0.8)" : "none",
              }}>
                {PIECE_UNICODE[p.type][p.color]}
              </span>
            ))}
      </div>
    </div>
  );
}

function PlayMode({ onBack, difficulty }: { onBack: () => void; difficulty: "rookie" | "master" }) {
  const [gs, setGs] = useState<GameState>(initialGameState);
  const [thinking, setThinking] = useState(false);
  const [yourTurnFlash, setYourTurnFlash] = useState(false);
  const [viewingIdx, setViewingIdx] = useState<number | null>(null);
  const playerColor: Color = "white";
  const computerColor: Color = "black";
  const aiDepth = difficulty === "rookie" ? 1 : 3;
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveListRef = useRef<HTMLDivElement>(null);

  // Scroll move list to bottom whenever it updates (only when not rewinding)
  useEffect(() => {
    if (viewingIdx === null && moveListRef.current) moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
  }, [gs.moveHistory.length, viewingIdx]);

  const handleSquareClick = useCallback((sq: Square) => {
    if (gs.status === "checkmate" || gs.status === "stalemate") return;
    if (gs.turn !== playerColor) return;
    if (thinking) return;
    if (gs.promotionPending) return;

    setYourTurnFlash(false);

    setGs(prev => {
      if (!prev.selected) {
        const piece = prev.board[sq.row][sq.col];
        if (piece?.color === playerColor) {
          return { ...prev, selected: sq, validMoves: legalMoves(prev.board, sq, prev.enPassantTarget, prev.castlingRights) };
        }
        return prev;
      }

      const isValid = prev.validMoves.some(m => m.row === sq.row && m.col === sq.col);
      if (!isValid) {
        const piece = prev.board[sq.row][sq.col];
        if (piece?.color === playerColor) {
          return { ...prev, selected: sq, validMoves: legalMoves(prev.board, sq, prev.enPassantTarget, prev.castlingRights) };
        }
        return { ...prev, selected: null, validMoves: [] };
      }

      const from = prev.selected;
      const to = sq;
      const piece = prev.board[from.row][from.col]!;
      const newBoard = applyMoveOnBoard(prev.board, from, to, prev.enPassantTarget);

      const isPawnPromotion =
        piece.type === "pawn" &&
        ((piece.color === "white" && to.row === 0) || (piece.color === "black" && to.row === 7));

      const cr = updateCastlingRights(prev.castlingRights, piece, from);
      const ep = computeEnPassantTarget(piece, from, to);

      const regularCapture = prev.board[to.row][to.col];
      let epCaptured: Piece | null = null;
      if (piece.type === "pawn" && prev.enPassantTarget && to.row === prev.enPassantTarget.row && to.col === prev.enPassantTarget.col) {
        const captureRow = piece.color === "white" ? to.row + 1 : to.row - 1;
        epCaptured = prev.board[captureRow][to.col];
      }
      const capturedBlack = [...prev.capturedBlack, ...(regularCapture?.color === "black" ? [regularCapture] : []), ...(epCaptured?.color === "black" ? [epCaptured] : [])];
      const capturedWhite = [...prev.capturedWhite, ...(regularCapture?.color === "white" ? [regularCapture] : []), ...(epCaptured?.color === "white" ? [epCaptured] : [])];

      const label = `${sqLabel(from.row, from.col)}→${sqLabel(to.row, to.col)}`;
      const nextTurn: Color = "black";

      const rec: MoveRecord = { label, board: newBoard, lastMove: { from, to } };
      if (isPawnPromotion) {
        return { ...prev, board: newBoard, selected: null, validMoves: [], capturedWhite, capturedBlack, castlingRights: cr, enPassantTarget: ep, moveHistory: [...prev.moveHistory, label], turn: nextTurn, promotionPending: { from, to }, lastMove: { from, to }, boardHistory: [...prev.boardHistory, rec] };
      }
      const { status, winner } = computeGameStatus(newBoard, nextTurn, ep, cr, "white");
      return { ...prev, board: newBoard, turn: nextTurn, selected: null, validMoves: [], capturedWhite, capturedBlack, castlingRights: cr, enPassantTarget: ep, status, winner, moveHistory: [...prev.moveHistory, label], promotionPending: null, lastMove: { from, to }, boardHistory: [...prev.boardHistory, rec] };
    });
  }, [gs.status, gs.turn, gs.promotionPending, playerColor, thinking]);

  const handlePromotion = useCallback((type: PieceType) => {
    setGs(prev => {
      if (!prev.promotionPending) return prev;
      const { to } = prev.promotionPending;
      const newBoard = cloneBoard(prev.board);
      const piece = newBoard[to.row][to.col];
      if (piece) newBoard[to.row][to.col] = { ...piece, type };
      const { status, winner } = computeGameStatus(newBoard, prev.turn, prev.enPassantTarget, prev.castlingRights, prev.turn === "white" ? "black" : "white");
      return { ...prev, board: newBoard, promotionPending: null, status, winner };
    });
  }, []);

  // AI move
  useEffect(() => {
    if (gs.turn !== computerColor) return;
    if (gs.status === "checkmate" || gs.status === "stalemate") return;
    if (gs.promotionPending) return;

    setThinking(true);
    const { board, enPassantTarget, castlingRights } = gs;

    aiTimerRef.current = setTimeout(() => {
      const move = getBestMove(board, computerColor, enPassantTarget, castlingRights, aiDepth);
      setGs(prev => {
        if (!move) return prev;
        const piece = prev.board[move.from.row][move.from.col];
        if (!piece || piece.color !== computerColor) return prev; // stale or wrong piece — skip
        let newBoard = applyMoveOnBoard(prev.board, move.from, move.to, prev.enPassantTarget);

        const isPawnPromotion = piece.type === "pawn" && ((piece.color === "white" && move.to.row === 0) || (piece.color === "black" && move.to.row === 7));
        if (isPawnPromotion) newBoard[move.to.row][move.to.col] = { type: "queen", color: piece.color, id: piece.id };

        const newCr = updateCastlingRights(prev.castlingRights, piece, move.from);
        const newEp = computeEnPassantTarget(piece, move.from, move.to);

        const regularCapture = prev.board[move.to.row][move.to.col];
        let epCaptured: Piece | null = null;
        if (piece.type === "pawn" && prev.enPassantTarget && move.to.row === prev.enPassantTarget.row && move.to.col === prev.enPassantTarget.col) {
          const captureRow = piece.color === "white" ? move.to.row + 1 : move.to.row - 1;
          epCaptured = prev.board[captureRow][move.to.col];
        }
        const capturedWhite = [...prev.capturedWhite, ...(regularCapture?.color === "white" ? [regularCapture] : []), ...(epCaptured?.color === "white" ? [epCaptured] : [])];
        const capturedBlack = [...prev.capturedBlack, ...(regularCapture?.color === "black" ? [regularCapture] : []), ...(epCaptured?.color === "black" ? [epCaptured] : [])];

        const label = `${sqLabel(move.from.row, move.from.col)}→${sqLabel(move.to.row, move.to.col)}`;
        const { status, winner } = computeGameStatus(newBoard, "white", newEp, newCr, "black");
        const rec: MoveRecord = { label, board: newBoard, lastMove: { from: move.from, to: move.to } };
        return { ...prev, board: newBoard, turn: "white", capturedWhite, capturedBlack, castlingRights: newCr, enPassantTarget: newEp, status, winner, moveHistory: [...prev.moveHistory, label], promotionPending: null, lastMove: { from: move.from, to: move.to }, boardHistory: [...prev.boardHistory, rec] };
      });
      setThinking(false);
      setYourTurnFlash(true);
    }, 400);

    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [gs.turn, gs.status, gs.promotionPending, computerColor]);

  const resetGame = () => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setThinking(false);
    setYourTurnFlash(false);
    setViewingIdx(null);
    setGs(initialGameState());
  };

  const isGameOver = gs.status === "checkmate" || gs.status === "stalemate";
  const myTurn = gs.turn === playerColor && !isGameOver && !thinking && viewingIdx === null;
  const viewedRecord = viewingIdx !== null ? gs.boardHistory[viewingIdx] : null;
  const displayBoard = viewedRecord ? viewedRecord.board : gs.board;
  const displayLastMove = viewedRecord ? viewedRecord.lastMove : gs.lastMove;

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e3a5f 100%)",
      overflow: "auto",
    }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px 10px", flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ ...backBtnStyle, background: "rgba(255,255,255,0.12)", color: "#e0e7ff", border: "1.5px solid rgba(255,255,255,0.2)" }}>
          ← Back
        </button>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#e0e7ff", flex: 1 }}>
          {difficulty === "rookie" ? "🌱 Rookie Mode" : "👑 Jangles Master"}
        </span>
        <button onClick={resetGame} style={{
          background: "rgba(99,102,241,0.85)", color: "#fff", border: "none",
          borderRadius: 99, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13,
          boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
        }}>
          New Game
        </button>
      </div>

      {/* Main layout: sidebar left + board center + sidebar right */}
      <div style={{ display: "flex", flex: 1, gap: 0, alignItems: "flex-start", justifyContent: "center", padding: "0 16px 16px", flexWrap: "wrap" }}>

        {/* Left sidebar: move history with rewind + captured pieces */}
        <div style={{ width: 168, flexShrink: 0, marginRight: 16, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Captured pieces + score */}
          {(() => {
            const PTS: Record<string, number> = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9 };
            const compScore = gs.capturedWhite.reduce((s, p) => s + (PTS[p.type] ?? 0), 0);
            const youScore  = gs.capturedBlack.reduce((s, p) => s + (PTS[p.type] ?? 0), 0);
            const advantage = youScore - compScore;
            return (
              <div style={{ ...sideCard, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                  Score
                </div>

                {/* Score bar */}
                {(compScore > 0 || youScore > 0) && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#ffb07a" }}>🤖 {compScore}pts</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color:
                        advantage > 0 ? "#86efac" : advantage < 0 ? "#fca5a5" : "rgba(255,255,255,0.4)"
                      }}>
                        {advantage > 0 ? `+${advantage} you` : advantage < 0 ? `+${-advantage} cpu` : "Even"}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#7ac8ff" }}>{youScore}pts ♟</span>
                    </div>
                    {/* Visual bar */}
                    <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.max(5, Math.min(95, compScore / (compScore + youScore) * 100))}%`,
                        background: "linear-gradient(90deg,#d93a00,#ffaa55)",
                        borderRadius: 3,
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>
                )}

                {/* Computer took (white pieces) */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#ffb07a" }}>🤖 Computer took</span>
                    {compScore > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "#ffb07a" }}>{compScore}pts</span>}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minHeight: 28 }}>
                    {gs.capturedWhite.length === 0
                      ? <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>nothing yet</span>
                      : gs.capturedWhite.map((p, i) => (
                        <div key={i} title={`${p.type} = ${PTS[p.type]}pt`} style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: "linear-gradient(145deg,#ffaa55,#d93a00)",
                          border: "2px solid #fca5a5",
                          boxShadow: "0 2px 5px rgba(217,58,0,0.5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, position: "relative",
                        }}>
                          {PIECE_UNICODE[p.type]["white"]}
                          <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 7, fontWeight: 800, background: "#1e1b4b", borderRadius: 4, padding: "0 2px", color: "#ffb07a", lineHeight: 1.4 }}>{PTS[p.type]}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* You took (black pieces) */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#7ac8ff" }}>♟ You took</span>
                    {youScore > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: "#7ac8ff" }}>{youScore}pts</span>}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minHeight: 28 }}>
                    {gs.capturedBlack.length === 0
                      ? <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>nothing yet</span>
                      : gs.capturedBlack.map((p, i) => (
                        <div key={i} title={`${p.type} = ${PTS[p.type]}pt`} style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: "linear-gradient(145deg,#60c8ff,#1d6fd8)",
                          border: "2px solid #93c5fd",
                          boxShadow: "0 2px 5px rgba(29,111,216,0.5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, position: "relative",
                        }}>
                          {PIECE_UNICODE[p.type]["white"]}
                          <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 7, fontWeight: 800, background: "#1e1b4b", borderRadius: 4, padding: "0 2px", color: "#7ac8ff", lineHeight: 1.4 }}>{PTS[p.type]}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={sideCard}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              {viewingIdx !== null ? `Move ${viewingIdx + 1} of ${gs.boardHistory.length}` : "Move History"}
            </div>
            <div ref={moveListRef} style={{ maxHeight: 280, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
              {gs.boardHistory.length === 0
                ? <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No moves yet</span>
                : Array.from({ length: Math.ceil(gs.boardHistory.length / 2) }, (_, i) => {
                    const plyW = i * 2;
                    const plyB = i * 2 + 1;
                    const recW = gs.boardHistory[plyW];
                    const recB = gs.boardHistory[plyB];
                    return (
                      <div key={i} style={{ display: "flex", gap: 3, fontSize: 11, fontFamily: "monospace", alignItems: "center" }}>
                        <span style={{ color: "rgba(255,255,255,0.3)", minWidth: 16, fontSize: 10 }}>{i+1}.</span>
                        <button onClick={() => setViewingIdx(plyW)} style={{
                          flex: 1, textAlign: "left", background: viewingIdx === plyW ? "rgba(165,180,252,0.25)" : "transparent",
                          border: viewingIdx === plyW ? "1px solid rgba(165,180,252,0.5)" : "1px solid transparent",
                          borderRadius: 5, padding: "2px 5px", color: "#a5b4fc", cursor: "pointer", fontSize: 11, fontFamily: "monospace",
                        }}>{recW.label}</button>
                        {recB && <button onClick={() => setViewingIdx(plyB)} style={{
                          flex: 1, textAlign: "left", background: viewingIdx === plyB ? "rgba(251,191,36,0.2)" : "transparent",
                          border: viewingIdx === plyB ? "1px solid rgba(251,191,36,0.4)" : "1px solid transparent",
                          borderRadius: 5, padding: "2px 5px", color: "rgba(255,200,100,0.75)", cursor: "pointer", fontSize: 11, fontFamily: "monospace",
                        }}>{recB.label}</button>}
                      </div>
                    );
                  })}
            </div>
            {/* Rewind controls */}
            {gs.boardHistory.length > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
                <button onClick={() => setViewingIdx(v => Math.max(0, (v ?? gs.boardHistory.length) - 1))}
                  style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#e0e7ff", cursor: "pointer", padding: "5px 0", fontSize: 16, fontWeight: 700 }}>‹</button>
                <button onClick={() => setViewingIdx(v => {
                    const next = (v ?? -1) + 1;
                    return next >= gs.boardHistory.length ? null : next;
                  })}
                  style={{ flex: 1, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#e0e7ff", cursor: "pointer", padding: "5px 0", fontSize: 16, fontWeight: 700 }}>›</button>
              </div>
            )}
            {viewingIdx !== null && (
              <button onClick={() => setViewingIdx(null)} style={{
                marginTop: 6, width: "100%", background: "rgba(99,102,241,0.3)", border: "1px solid rgba(99,102,241,0.5)",
                borderRadius: 8, color: "#c7d2fe", cursor: "pointer", padding: "5px 0", fontSize: 11, fontWeight: 700,
              }}>▶ Back to Live</button>
            )}
          </div>
        </div>

        {/* Center: board + status */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 8 }}>
          {/* Computer row label */}
          <div style={{ width: "min(90vw, 520px)", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffb07a" }}>🤖 Computer</div>
          </div>

          {/* Board */}
          <div style={{
            width: "min(90vw, 520px)",
            aspectRatio: "1",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.4)",
          }}>
            <ChessBoard
              board={displayBoard}
              selected={viewingIdx === null ? gs.selected : null}
              validMoves={viewingIdx === null ? gs.validMoves : []}
              onSquareClick={myTurn ? handleSquareClick : undefined}
              interactive={!!myTurn}
              lastMove={displayLastMove}
            />
          </div>

          {/* Player row label */}
          <div style={{ width: "min(90vw, 520px)", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#7ac8ff" }}>♟ You</div>
          </div>

          {/* Status / Your Turn button */}
          {isGameOver ? (
            <div style={{
              width: "min(90vw, 520px)", borderRadius: 16, padding: "16px 20px",
              background: gs.status === "checkmate" && gs.winner === playerColor ? "linear-gradient(135deg,#16a34a,#15803d)" : gs.status === "checkmate" ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "linear-gradient(135deg,#6b7280,#4b5563)",
              textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>
                {gs.status === "checkmate" && gs.winner === playerColor ? "🎉" : gs.status === "checkmate" ? "💀" : "🤝"}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
                {gs.status === "checkmate" ? (gs.winner === playerColor ? "You win!" : "Computer wins!") : "Draw — Stalemate!"}
              </div>
              <button onClick={resetGame} style={{
                marginTop: 12, background: "rgba(255,255,255,0.2)", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 99,
                padding: "8px 22px", fontWeight: 700, cursor: "pointer", fontSize: 14,
              }}>
                Play Again
              </button>
            </div>
          ) : thinking ? (
            <div style={{
              width: "min(90vw, 520px)", borderRadius: 16, padding: "14px 20px",
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.15)", textAlign: "center",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                🤔 Computer is thinking...
              </div>
            </div>
          ) : gs.status === "check" && gs.turn === playerColor ? (
            <div style={{
              width: "min(90vw, 520px)", borderRadius: 16, padding: "14px 20px",
              background: "linear-gradient(135deg,#dc2626,#ea580c)",
              textAlign: "center", animation: "checkPulse 1s ease-in-out infinite",
              boxShadow: "0 8px 24px rgba(220,38,38,0.5)",
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                ⚠️ Your King is in CHECK! — Click a piece to escape
              </div>
            </div>
          ) : yourTurnFlash ? (
            <button
              onClick={() => setYourTurnFlash(false)}
              style={{
                width: "min(90vw, 520px)", borderRadius: 16, padding: "16px 20px",
                background: "linear-gradient(135deg,#16a34a,#059669)",
                border: "none", cursor: "pointer", textAlign: "center",
                animation: "yourTurnPulse 1.2s ease-in-out 2",
                boxShadow: "0 8px 28px rgba(22,163,74,0.55)",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>
                ✅ Your Turn!
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3, fontWeight: 600 }}>
                Click this or a piece to play
              </div>
            </button>
          ) : (
            <div style={{
              width: "min(90vw, 520px)", borderRadius: 16, padding: "13px 20px",
              background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(255,255,255,0.12)", textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>
                ♙ Your turn — click a white piece
              </div>
            </div>
          )}

          {/* Promotion chooser */}
          {gs.promotionPending && (
            <div style={{
              width: "min(90vw, 520px)", borderRadius: 20, padding: "18px 20px",
              background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              animation: "fadeSlideIn 0.2s ease",
            }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1e1b4b", marginBottom: 14, textAlign: "center" }}>
                Pawn Promotion — Choose a piece!
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {(["queen","rook","bishop","knight"] as PieceType[]).map(type => (
                  <button key={type} onClick={() => handlePromotion(type)} style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color: "#fff", border: "none", borderRadius: 16,
                    padding: "12px 18px", cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
                  }}>
                    <span style={{ fontSize: 32, color: "#fff", textShadow: "0 0 2px #000, 0 1px 4px rgba(0,0,0,0.8)" }}>
                      {PIECE_UNICODE[type]["white"]}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: help + tips */}
        <div style={{ width: 160, flexShrink: 0, marginLeft: 16, marginTop: 8 }}>
          <div style={sideCard}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>How to Play</div>
            {[
              ["🖱️ Click", "a piece to see its moves"],
              ["🟢 Dot", "= empty square you can move to"],
              ["🟢 Ring", "= enemy piece you can capture"],
              ["⚠️ Check", "= your King is in danger!"],
              ["🏁 Goal", "Checkmate the enemy King"],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 7, lineHeight: 1.4 }}>
                <strong style={{ color: "rgba(255,255,255,0.9)" }}>{bold}</strong> {rest}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

function Menu({ onLesson, onPlayRookie, onPlayMaster }: { onLesson: () => void; onPlayRookie: () => void; onPlayMaster: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "100%", background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e3a5f 100%)",
      padding: "48px 20px", gap: 28, boxSizing: "border-box",
    }}>
      {/* Title */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 80, lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}>♟</div>
        <h1 style={{ fontSize: 38, fontWeight: 900, margin: "10px 0 6px", color: "#e0e7ff", letterSpacing: -0.5 }}>Chess</h1>
        <p style={{ fontSize: 15, color: "rgba(224,231,255,0.6)", margin: 0 }}>
          Learn the rules, then battle the computer
        </p>
      </div>

      {/* Mode buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
        {/* Lesson */}
        {[
          { icon: "📖", label: "Lesson Mode", sub: "Step-by-step guide to every piece", color: "#818cf8", bg: "rgba(99,102,241,0.15)", border: "rgba(129,140,248,0.4)", onClick: onLesson },
        ].map(({ icon, label, sub, color, bg, border, onClick }) => (
          <button key={label} onClick={onClick} style={{
            background: bg, border: `1.5px solid ${border}`, borderRadius: 20, padding: "18px 24px",
            cursor: "pointer", textAlign: "left", backdropFilter: "blur(8px)", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", transition: "transform 0.12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontWeight: 800, fontSize: 18, color }}>{label}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{sub}</div>
          </button>
        ))}

        {/* Difficulty section */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, textAlign: "center" }}>
            🤖 Play vs Computer
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onPlayRookie} style={{
              flex: 1, background: "linear-gradient(135deg,rgba(34,197,94,0.2),rgba(16,185,129,0.15))",
              border: "1.5px solid rgba(52,211,153,0.5)", borderRadius: 16, padding: "16px 10px",
              cursor: "pointer", textAlign: "center", backdropFilter: "blur(8px)", transition: "transform 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>🌱</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#34d399" }}>Rookie</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3, lineHeight: 1.4 }}>Just learning — easy AI</div>
            </button>
            <button onClick={onPlayMaster} style={{
              flex: 1, background: "linear-gradient(135deg,rgba(251,191,36,0.2),rgba(245,158,11,0.15))",
              border: "1.5px solid rgba(251,191,36,0.5)", borderRadius: 16, padding: "16px 10px",
              cursor: "pointer", textAlign: "center", backdropFilter: "blur(8px)", transition: "transform 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>👑</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#fbbf24" }}>Jangles Master</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3, lineHeight: 1.4 }}>Real challenge — smart AI</div>
            </button>
          </div>
        </div>

        {/* Coming soon */}
        <button disabled style={{
          background: "rgba(156,163,175,0.06)", border: "1.5px solid rgba(156,163,175,0.18)",
          borderRadius: 20, padding: "16px 24px", cursor: "default", textAlign: "left", opacity: 0.45,
        }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🌐</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#9ca3af" }}>Online Multiplayer</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Coming soon — play friends online!</div>
        </button>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ChessGame({ onComplete: _onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode>("menu");
  const [difficulty, setDifficulty] = useState<"rookie" | "master">("rookie");

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {mode === "menu"   && <Menu onLesson={() => setMode("lesson")} onPlayRookie={() => { setDifficulty("rookie"); setMode("play"); }} onPlayMaster={() => { setDifficulty("master"); setMode("play"); }} />}
      {mode === "lesson" && <LessonMode onBack={() => setMode("menu")} />}
      {mode === "play"   && <PlayMode onBack={() => setMode("menu")} difficulty={difficulty} />}
    </div>
  );
}
