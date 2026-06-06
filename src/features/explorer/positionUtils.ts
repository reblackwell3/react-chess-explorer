import { Chess, type Square } from 'chess.js';

/** Match endchess-backend / mass-games-import (first four FEN fields). */
export function normalizeFen(fen: string): string {
  const parts = fen.trim().split(/\s+/);
  if (parts.length < 4) {
    throw new Error(`Invalid FEN: ${fen}`);
  }
  return `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
}

export type BoardMoveResult = {
  fen: string;
  uci: string;
  san: string;
};

/** Legal move from a board drag/drop (react-chessboard piece string, e.g. wQ). */
export function applyBoardMove(
  fen: string,
  sourceSquare: string,
  targetSquare: string,
  piece: string,
): BoardMoveResult | null {
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

  const played = chess.move({
    from: legal.from,
    to: legal.to,
    promotion: legal.promotion,
  });
  if (!played) return null;

  const uci = `${played.from}${played.to}${played.promotion ?? ''}`;
  return { fen: chess.fen(), uci, san: played.san };
}

/** Apply a UCI move to a FEN; returns null if illegal. */
export function fenAfterUci(fen: string, uci: string): string | null {
  const chess = new Chess(fen);
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;
  try {
    const move = chess.move({ from, to, promotion });
    if (!move) return null;
    return chess.fen();
  } catch {
    return null;
  }
}

export function whiteScorePercent(
  whiteWins: number,
  draws: number,
  blackWins: number,
): number | null {
  const total = whiteWins + draws + blackWins;
  if (total === 0) return null;
  return Math.round((100 * (whiteWins + 0.5 * draws)) / total);
}
