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
  const piece = b[from.row][from.col]!;
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

// Simple positional bonus tables (from white's perspective, row 7 = white back rank)
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

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = PIECE_VALUE[p.type];
      const row = p.color === "white" ? r : 7 - r;
      const bonus = p.type === "pawn" ? PAWN_TABLE[row][c] : 0;
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

function getBestMove(board: Board, color: Color, ep: Square | null, cr: CastlingRights): MoveOption | null {
  const moves = getAllMoves(board, color, ep, cr);
  if (moves.length === 0) return null;
  const shuffled = [...moves].sort(() => Math.random() - 0.5);
  let bestScore = color === "black" ? Infinity : -Infinity;
  let bestMove = shuffled[0];
  const maximizing = color === "white";
  for (const m of shuffled) {
    const nb = applyMoveOnBoard(board, m.from, m.to, ep);
    const newEp = computeEnPassantTarget(board[m.from.row][m.from.col]!, m.from, m.to);
    const score = minimax(nb, 2, -Infinity, Infinity, !maximizing, newEp, cr);
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
}: {
  board: Board;
  selected: Square | null;
  validMoves: Square[];
  highlights?: Square[];
  onSquareClick?: (sq: Square) => void;
  interactive?: boolean;
  lastMove?: { from: Square; to: Square } | null;
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

          let bg = light ? "#f0d9b5" : "#b58863";
          if (isLastMove) bg = light ? "#cdd16c" : "#aaa23a";
          if (isSelected) bg = "#f6f669";
          if (isHighlight) bg = light ? "#aee86e" : "#7dc940";

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
              }}
            >
              {/* Valid move indicator */}
              {isValid && !hasEnemy && (
                <div style={{
                  position: "absolute",
                  width: "33%", height: "33%",
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.18)",
                  pointerEvents: "none",
                  zIndex: 1,
                }} />
              )}
              {/* Capture ring */}
              {isValid && hasEnemy && (
                <div style={{
                  position: "absolute", inset: 0,
                  border: "4px solid rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                  zIndex: 1,
                }} />
              )}
              {/* Piece */}
              {piece && (
                <span style={{
                  fontSize: "clamp(18px, 4.5vmin, 52px)",
                  lineHeight: 1,
                  userSelect: "none",
                  position: "relative",
                  zIndex: 2,
                  color: piece.color === "white" ? "#fff" : "#1a1a2e",
                  textShadow: piece.color === "white"
                    ? "0 0 2px #000, 0 1px 4px rgba(0,0,0,0.9), 0 0 1px #000"
                    : "0 1px 2px rgba(255,255,255,0.3)",
                }}>
                  {PIECE_UNICODE[piece.type][piece.color]}
                </span>
              )}
              {/* Rank number (left edge) */}
              {col === 0 && (
                <span style={{
                  position: "absolute", top: 2, left: 3,
                  fontSize: "clamp(7px, 1.3vmin, 12px)",
                  fontWeight: 800, color: light ? "#b58863" : "#f0d9b5",
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
                  fontWeight: 800, color: light ? "#b58863" : "#f0d9b5",
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

// ─── Lesson Data ──────────────────────────────────────────────────────────────

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
`;
if (typeof document !== "undefined" && !document.getElementById("chess-keyframes")) {
  const s = document.createElement("style");
  s.id = "chess-keyframes";
  s.textContent = PULSE_CSS;
  document.head.appendChild(s);
}

// ─── Lesson Mode ──────────────────────────────────────────────────────────────

const LESSON_TABS: { key: LessonPiece; label: string; emoji: string; color: string }[] = [
  { key: "overview", label: "Overview",  emoji: "♟", color: "#6366f1" },
  { key: "pawn",     label: "Pawn",      emoji: "♙", color: "#22c55e" },
  { key: "rook",     label: "Rook",      emoji: "♖", color: "#ef4444" },
  { key: "knight",   label: "Knight",    emoji: "♘", color: "#f97316" },
  { key: "bishop",   label: "Bishop",    emoji: "♗", color: "#a855f7" },
  { key: "queen",    label: "Queen",     emoji: "♕", color: "#ec4899" },
  { key: "king",     label: "King",      emoji: "♔", color: "#eab308" },
];

function LessonMode({ onBack }: { onBack: () => void }) {
  const [activePiece, setActivePiece] = useState<LessonPiece>("overview");
  const [stepIdx, setStepIdx] = useState(0);

  const steps = LESSONS[activePiece];
  const step = steps[stepIdx];
  const tab = LESSON_TABS.find(t => t.key === activePiece)!;

  function selectPiece(key: LessonPiece) { setActivePiece(key); setStepIdx(0); }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(135deg,#f0f4ff 0%,#faf5ff 100%)", overflow: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px 0" }}>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>Chess Lessons</h2>
      </div>

      {/* Piece tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "14px 20px 0" }}>
        {LESSON_TABS.map(({ key, label, emoji, color }) => (
          <button key={key} onClick={() => selectPiece(key)} style={{
            background: activePiece === key ? color : "rgba(255,255,255,0.8)",
            color: activePiece === key ? "#fff" : "#374151",
            border: `2px solid ${activePiece === key ? color : "rgba(0,0,0,0.1)"}`,
            borderRadius: 99, padding: "6px 14px",
            fontWeight: 700, cursor: "pointer", fontSize: 13,
            boxShadow: activePiece === key ? `0 4px 12px ${color}55` : "0 1px 3px rgba(0,0,0,0.08)",
            transition: "all 0.15s",
          }}>
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Main area */}
      <div style={{ display: "flex", gap: 20, flex: 1, flexWrap: "wrap", alignItems: "flex-start", padding: "16px 20px 20px" }}>
        {/* Board */}
        <div style={{ width: "min(100%, 420px)", aspectRatio: "1", flexShrink: 0, borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}>
          <ChessBoard board={step.board} selected={null} validMoves={[]} highlights={step.highlights} interactive={false} />
        </div>

        {/* Info card */}
        <div style={{ flex: "1 1 220px" }}>
          <div style={glassCard}>
            {steps.length > 1 && (
              <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
                {steps.map((_, i) => (
                  <button key={i} onClick={() => setStepIdx(i)} style={{
                    width: i === stepIdx ? 24 : 8, height: 8, borderRadius: 99, border: "none",
                    background: i === stepIdx ? tab.color : "#e5e7eb",
                    cursor: "pointer", padding: 0, transition: "all 0.2s",
                  }} />
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, fontWeight: 700, color: tab.color, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
              {tab.emoji} {tab.label}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 10px", color: "#1e1b4b", lineHeight: 1.3 }}>
              {step.title}
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4b5563", margin: "0 0 16px" }}>
              {step.description}
            </p>
            <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "9px 14px", fontSize: 12, color: "#15803d", fontWeight: 600 }}>
              🟢 Green squares = where this piece can move or capture
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setStepIdx(i => Math.max(0, i - 1))} disabled={stepIdx === 0}
                style={navBtnStyle(stepIdx === 0, tab.color)}>← Prev</button>
              <button onClick={() => setStepIdx(i => Math.min(steps.length - 1, i + 1))} disabled={stepIdx === steps.length - 1}
                style={navBtnStyle(stepIdx === steps.length - 1, tab.color)}>Next →</button>
            </div>
          </div>
        </div>
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

function PlayMode({ onBack }: { onBack: () => void }) {
  const [gs, setGs] = useState<GameState>(initialGameState);
  const [thinking, setThinking] = useState(false);
  const [yourTurnFlash, setYourTurnFlash] = useState(false);
  const playerColor: Color = "white";
  const computerColor: Color = "black";
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveListRef = useRef<HTMLDivElement>(null);

  // Scroll move list to bottom whenever it updates
  useEffect(() => {
    if (moveListRef.current) moveListRef.current.scrollTop = moveListRef.current.scrollHeight;
  }, [gs.moveHistory.length]);

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

      if (isPawnPromotion) {
        return { ...prev, board: newBoard, selected: null, validMoves: [], capturedWhite, capturedBlack, castlingRights: cr, enPassantTarget: ep, moveHistory: [...prev.moveHistory, label], turn: nextTurn, promotionPending: { from, to } };
      }
      const { status, winner } = computeGameStatus(newBoard, nextTurn, ep, cr, "white");
      return { ...prev, board: newBoard, turn: nextTurn, selected: null, validMoves: [], capturedWhite, capturedBlack, castlingRights: cr, enPassantTarget: ep, status, winner, moveHistory: [...prev.moveHistory, label], promotionPending: null };
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
      const move = getBestMove(board, computerColor, enPassantTarget, castlingRights);
      setGs(prev => {
        if (!move) return prev;
        const piece = prev.board[move.from.row][move.from.col]!;
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

        return { ...prev, board: newBoard, turn: "white", capturedWhite, capturedBlack, castlingRights: newCr, enPassantTarget: newEp, status, winner, moveHistory: [...prev.moveHistory, label], promotionPending: null };
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
    setGs(initialGameState());
  };

  const isGameOver = gs.status === "checkmate" || gs.status === "stalemate";
  const myTurn = gs.turn === playerColor && !isGameOver && !thinking;

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
        <span style={{ fontSize: 18, fontWeight: 800, color: "#e0e7ff", flex: 1 }}>Chess vs Computer</span>
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

        {/* Left sidebar: move history */}
        <div style={{ width: 160, flexShrink: 0, marginRight: 16, marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...sideCard, flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Move History</div>
            <div ref={moveListRef} style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {gs.moveHistory.length === 0
                ? <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No moves yet</span>
                : Array.from({ length: Math.ceil(gs.moveHistory.length / 2) }, (_, i) => (
                    <div key={i} style={{ display: "flex", gap: 4, fontSize: 12, fontFamily: "monospace" }}>
                      <span style={{ color: "rgba(255,255,255,0.35)", minWidth: 18 }}>{i+1}.</span>
                      <span style={{ color: "#a5b4fc", flex: 1 }}>{gs.moveHistory[i*2]}</span>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}>{gs.moveHistory[i*2+1] || ""}</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>

        {/* Center: board + status */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 8 }}>
          {/* Computer label + captures */}
          <div style={{ width: "min(90vw, 520px)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)", minWidth: 70 }}>🤖 Computer</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
              {gs.capturedWhite.map((p, i) => (
                <span key={i} style={{ fontSize: 16, lineHeight: 1, color: "#fff", textShadow: "0 0 2px #000, 0 1px 3px rgba(0,0,0,0.9)" }}>
                  {PIECE_UNICODE[p.type][p.color]}
                </span>
              ))}
            </div>
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
              board={gs.board}
              selected={gs.selected}
              validMoves={gs.validMoves}
              onSquareClick={myTurn ? handleSquareClick : undefined}
              interactive={!!myTurn}
            />
          </div>

          {/* Player label + captures */}
          <div style={{ width: "min(90vw, 520px)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)", minWidth: 70 }}>♙ You</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 1, flex: 1 }}>
              {gs.capturedBlack.map((p, i) => (
                <span key={i} style={{ fontSize: 16, lineHeight: 1, color: "#1e1b4b", textShadow: "0 0 2px rgba(255,255,255,0.3)" }}>
                  {PIECE_UNICODE[p.type][p.color]}
                </span>
              ))}
            </div>
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

function Menu({ onLesson, onPlay }: { onLesson: () => void; onPlay: () => void }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "100%", background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e3a5f 100%)",
      padding: "48px 20px", gap: 32, boxSizing: "border-box",
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
      <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 340 }}>
        {[
          { icon: "📖", label: "Lesson Mode", sub: "Step-by-step guide to every piece", color: "#818cf8", bg: "rgba(99,102,241,0.15)", border: "rgba(129,140,248,0.4)", onClick: onLesson, enabled: true },
          { icon: "🤖", label: "Play vs Computer", sub: "Challenge the AI — you play as White ♙", color: "#34d399", bg: "rgba(16,185,129,0.15)", border: "rgba(52,211,153,0.4)", onClick: onPlay, enabled: true },
          { icon: "🌐", label: "Online Multiplayer", sub: "Coming soon — play friends online!", color: "#9ca3af", bg: "rgba(156,163,175,0.08)", border: "rgba(156,163,175,0.2)", onClick: undefined, enabled: false },
        ].map(({ icon, label, sub, color, bg, border, onClick, enabled }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={!enabled}
            style={{
              background: bg, border: `1.5px solid ${border}`,
              borderRadius: 20, padding: "20px 24px",
              cursor: enabled ? "pointer" : "default",
              textAlign: "left", opacity: enabled ? 1 : 0.45,
              backdropFilter: "blur(8px)",
              boxShadow: enabled ? `0 8px 24px rgba(0,0,0,0.25)` : "none",
              transition: "transform 0.12s, box-shadow 0.12s",
            }}
            onMouseEnter={e => { if (enabled) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 14px 32px rgba(0,0,0,0.35)`; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = enabled ? "0 8px 24px rgba(0,0,0,0.25)" : "none"; }}
          >
            <div style={{ fontSize: 32, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontWeight: 800, fontSize: 19, color }}>{label}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function ChessGame({ onComplete: _onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<Mode>("menu");

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {mode === "menu"   && <Menu onLesson={() => setMode("lesson")} onPlay={() => setMode("play")} />}
      {mode === "lesson" && <LessonMode onBack={() => setMode("menu")} />}
      {mode === "play"   && <PlayMode onBack={() => setMode("menu")} />}
    </div>
  );
}
