import {
  fenAtPly as fenAtPlyFromCore,
  findPlyIndexForFen as findPlyIndexForFenFromCore,
} from 'react-chess-core';
import { EXPLORER_START_FEN } from './constants';

export { applyUci, normalizeFen, uciFromDrop } from 'react-chess-core';

/** FEN after applying the first `ply` moves from the explorer start position. */
export function fenAtPly(movesUci: string[], ply: number): string {
  return fenAtPlyFromCore(movesUci, ply, EXPLORER_START_FEN);
}

/** Index of the next move to play to reach `targetFen` from the explorer start. */
export function findPlyIndexForFen(
  movesUci: string[],
  targetFen: string,
): number {
  return findPlyIndexForFenFromCore(movesUci, targetFen, EXPLORER_START_FEN);
}
