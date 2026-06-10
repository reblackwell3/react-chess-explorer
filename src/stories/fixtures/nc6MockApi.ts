import type {
  FetchPositionGamesParams,
  FetchPositionParams,
  FetchPositionVariationsParams,
  PositionGamesApiDto,
  PositionVariationsApiDto,
} from "../../features/explorer/types";
import {
  nc6GamesForPosition,
  nc6PositionForFen,
  nc6SampleGames,
  nc6ScorePercentForMove,
  NC6_TABIYA_FEN,
} from "./nc6SampleGames";

export async function nc6FetchPosition(params: FetchPositionParams) {
  void params;
  return nc6PositionForFen(params.fen);
}

export async function nc6FetchPositionGames(
  params: FetchPositionGamesParams,
): Promise<PositionGamesApiDto> {
  const position = nc6PositionForFen(params.fen);
  const games = nc6GamesForPosition(params.fen, {
    minElo: params.minElo,
    maxElo: params.maxElo,
    uci: params.uci,
    topOnly: params.topOnly,
    sources: params.sources,
  });

  return {
    positionKey: position?.positionKey ?? `storybook-${params.fen}`,
    fen: params.fen,
    minElo: params.minElo,
    maxElo: params.maxElo,
    uci: params.uci,
    topOnly: params.topOnly,
    games,
  };
}

export async function nc6FetchPositionVariations(
  params: FetchPositionVariationsParams,
): Promise<PositionVariationsApiDto | null> {
  const position = await nc6FetchPosition({
    fen: params.fen,
    minElo: params.minElo,
    maxElo: params.maxElo,
  });
  if (!position) return null;

  const lineCount = params.lineCount ?? 8;
  const starters = [...position.moves]
    .sort((a, b) => b.games - a.games)
    .slice(0, lineCount);

  const lines = starters.map((move) => ({
    key: move.uci,
    label: params.mode === "popularity" ? move.san : `${move.san} …`,
    moves: [move],
    uciPath: [move.uci],
    games: move.games,
    scorePercent: nc6ScorePercentForMove(move),
    lastPlayedYear: 2024,
    avgElo: move.avgElo,
  }));

  return {
    positionKey: position.positionKey,
    fen: params.fen,
    mode: params.mode,
    depth: params.mode === "popularity" ? 1 : (params.depth ?? 4),
    lineCount,
    minElo: params.minElo,
    maxElo: params.maxElo,
    lines,
  };
}

export async function nc6FetchGame(gameId: string) {
  return nc6SampleGames.find((game) => game.gameId === gameId) ?? null;
}

export { NC6_TABIYA_FEN, nc6SampleGames };
