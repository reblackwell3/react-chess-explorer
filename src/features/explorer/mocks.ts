import type {
  FetchPositionGamesParams,
  FetchPositionParams,
  FetchPositionVariationsParams,
  PositionApiDto,
  PositionGamesApiDto,
  PositionVariationsApiDto,
} from "./types";
import { EXPLORER_START_FEN } from "./constants";

const mockPosition: PositionApiDto = {
  positionKey: "mock-start",
  fen: EXPLORER_START_FEN,
  totalGames: 1_250_000,
  moves: [
    {
      san: "e4",
      uci: "e2e4",
      games: 520_000,
      whiteWins: 180_000,
      draws: 140_000,
      blackWins: 200_000,
      avgElo: 2450,
    },
    {
      san: "d4",
      uci: "d2d4",
      games: 410_000,
      whiteWins: 150_000,
      draws: 120_000,
      blackWins: 140_000,
      avgElo: 2440,
    },
    {
      san: "Nf3",
      uci: "g1f3",
      games: 180_000,
      whiteWins: 62_000,
      draws: 55_000,
      blackWins: 63_000,
      avgElo: 2435,
    },
  ],
};

const mockGames: PositionGamesApiDto = {
  positionKey: "mock-start",
  fen: EXPLORER_START_FEN,
  minElo: 2500,
  maxElo: 3000,
  offset: 0,
  hasMore: false,
  games: [
    {
      gameId: "abc123",
      url: "https://lichess.org/abc123",
      white: "Carlsen,M",
      black: "Caruana,F",
      whiteElo: 2882,
      blackElo: 2803,
      result: "1/2-1/2",
      date: "2024.01.15",
      nextSan: "e4",
      nextUci: "e2e4",
      avgElo: 2843,
      source: "lichess",
    },
    {
      gameId: "def456",
      url: "https://lichess.org/def456",
      white: "Firouzja,A",
      black: "Nepo,I",
      whiteElo: 2765,
      blackElo: 2790,
      result: "1-0",
      date: "2024.02.01",
      nextSan: "d4",
      nextUci: "d2d4",
      avgElo: 2778,
      source: "twic",
    },
  ],
};

export async function mockFetchPosition(
  params: FetchPositionParams,
): Promise<PositionApiDto | null> {
  void params;
  return mockPosition;
}

function mockVariationLines(
  params: FetchPositionVariationsParams,
  position: PositionApiDto,
): PositionVariationsApiDto {
  const lineCount = params.lineCount ?? 8;
  const starters = [...position.moves]
    .sort((a, b) => b.games - a.games)
    .slice(0, lineCount);

  const lines = starters.map((move) => ({
    key: move.uci,
    label:
      params.mode === "popularity" ? `1.${move.san}` : `1.${move.san} 1...e5`,
    moves: [move],
    uciPath: [move.uci],
    games: move.games,
    scorePercent: 54,
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

export async function mockFetchPositionVariations(
  params: FetchPositionVariationsParams,
): Promise<PositionVariationsApiDto | null> {
  const position = await mockFetchPosition({
    fen: params.fen,
    minElo: params.minElo,
    maxElo: params.maxElo,
  });
  if (!position) return null;
  return mockVariationLines(params, position);
}

export async function mockFetchPositionGames(
  params: FetchPositionGamesParams,
): Promise<PositionGamesApiDto> {
  let filtered = params.uci
    ? mockGames.games.filter((g) => g.nextUci === params.uci)
    : mockGames.games;

  if (params.sources?.length) {
    filtered = filtered.filter((game) => params.sources!.includes(game.source));
  }

  const offset = params.offset ?? 0;
  const limit = params.limit ?? filtered.length;
  const page = filtered.slice(offset, offset + limit);
  const hasMore = offset + limit < filtered.length;

  return {
    ...mockGames,
    fen: params.fen,
    minElo: params.minElo,
    maxElo: params.maxElo,
    uci: params.uci,
    offset,
    hasMore,
    games: page,
  };
}
