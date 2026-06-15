import { Chess, type Square } from "chess.js";

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

  const uci = `${played.from}${played.to}${played.promotion ?? ""}`;
  return { fen: chess.fen(), uci, san: played.san };
}

export type LineSansEntry = {
  fen: string;
  lastSan: string;
};

/** Play a SAN sequence from a start FEN; returns null if any move is illegal. */
export function applyLineSans(
  startFen: string,
  sans: string[],
): { fen: string; entries: LineSansEntry[] } | null {
  const chess = new Chess(startFen);
  const entries: LineSansEntry[] = [];

  for (const san of sans) {
    try {
      const move = chess.move(san);
      if (!move) return null;
      entries.push({ fen: chess.fen(), lastSan: move.san });
    } catch {
      return null;
    }
  }

  return { fen: chess.fen(), entries };
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

/** Format SAN plies from the starting position as `1.d4 Nf6 2.c4 e6`. */
export function formatNumberedLineSans(sans: string[]): string {
  if (sans.length === 0) {
    return "";
  }

  const parts: string[] = [];
  for (let i = 0; i < sans.length; i += 2) {
    const moveNumber = i / 2 + 1;
    const white = sans[i];
    const black = sans[i + 1];
    parts.push(
      black ? `${moveNumber}.${white} ${black}` : `${moveNumber}.${white}`,
    );
  }

  return parts.join(" ");
}
