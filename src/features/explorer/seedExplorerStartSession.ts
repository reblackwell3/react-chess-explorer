import { EXPLORER_START_FEN } from "./constants";
import {
  gamesSessionKey,
  setSessionGames,
  setSessionVariations,
  variationsSessionKey,
} from "./explorerSessionCache";
import type {
  PositionGamesApiDto,
  PositionVariationsApiDto,
} from "./types";

/** Push start-hub payloads into the explorer session cache (used by app preload). */
export function seedExplorerStartSession(
  games: PositionGamesApiDto,
  variations: PositionVariationsApiDto,
): void {
  setSessionGames(gamesSessionKey({ fen: EXPLORER_START_FEN }), games);
  setSessionVariations(
    variationsSessionKey(EXPLORER_START_FEN),
    variations.lines,
  );
}
