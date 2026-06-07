import { Chess, type Square } from "chess.js";
import { EXPLORER_START_FEN } from "./constants";
import { normalizeFen } from "./positionUtils";

export function fenAtPly(movesUci: string[], ply: number): string {
  const chess = new Chess(EXPLORER_START_FEN);
  for (let i = 0; i < ply && i < movesUci.length; i++) {
    applyUci(chess, movesUci[i]);
  }
  return chess.fen();
}

/** Index of the next move to play to reach `targetFen`, or 0 if not found. */
export function findPlyIndexForFen(
  movesUci: string[],
  targetFen: string,
): number {
  const target = normalizeFen(targetFen);
  const chess = new Chess(EXPLORER_START_FEN);

  if (normalizeFen(chess.fen()) === target) {
    return 0;
  }

  for (let i = 0; i < movesUci.length; i++) {
    applyUci(chess, movesUci[i]);
    if (normalizeFen(chess.fen()) === target) {
      return i + 1;
    }
  }

  return 0;
}

export function applyUci(chess: Chess, uci: string): void {
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;
  const move = chess.move({ from, to, promotion });
  if (!move) {
    throw new Error(`Illegal UCI move: ${uci}`);
  }
}

export function uciFromDrop(
  fen: string,
  sourceSquare: string,
  targetSquare: string,
  piece: string,
): string | null {
  const chess = new Chess(fen);
  const pieceType = piece[1]?.toLowerCase();
  const legal = chess
    .moves({ square: sourceSquare as Square, verbose: true })
    .find(
      (move) =>
        move.to === targetSquare &&
        (!move.promotion || move.promotion === pieceType),
    );
  if (!legal) return null;
  return `${legal.from}${legal.to}${legal.promotion ?? ""}`;
}
