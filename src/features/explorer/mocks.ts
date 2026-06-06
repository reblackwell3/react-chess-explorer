import type {
  FetchPositionGamesParams,
  PositionApiDto,
  PositionGamesApiDto,
} from './types';
import { EXPLORER_START_FEN } from './constants';

const mockPosition: PositionApiDto = {
  positionKey: 'mock-start',
  fen: EXPLORER_START_FEN,
  totalGames: 1_250_000,
  moves: [
    {
      san: 'e4',
      uci: 'e2e4',
      games: 520_000,
      whiteWins: 180_000,
      draws: 140_000,
      blackWins: 200_000,
      avgElo: 2450,
    },
    {
      san: 'd4',
      uci: 'd2d4',
      games: 410_000,
      whiteWins: 150_000,
      draws: 120_000,
      blackWins: 140_000,
      avgElo: 2440,
    },
    {
      san: 'Nf3',
      uci: 'g1f3',
      games: 180_000,
      whiteWins: 62_000,
      draws: 55_000,
      blackWins: 63_000,
      avgElo: 2435,
    },
  ],
  sampleGameIds: ['abc123', 'def456'],
};

const mockGames: PositionGamesApiDto = {
  positionKey: 'mock-start',
  fen: EXPLORER_START_FEN,
  minElo: 2200,
  maxElo: 2800,
  topOnly: false,
  games: [
    {
      gameId: 'abc123',
      url: 'https://lichess.org/abc123',
      white: 'Carlsen,M',
      black: 'Caruana,F',
      whiteElo: 2882,
      blackElo: 2803,
      result: '1/2-1/2',
      date: '2024.01.15',
      nextSan: 'e4',
      nextUci: 'e2e4',
      avgElo: 2843,
    },
    {
      gameId: 'def456',
      url: 'https://lichess.org/def456',
      white: 'Firouzja,A',
      black: 'Nepo,I',
      whiteElo: 2765,
      blackElo: 2790,
      result: '1-0',
      date: '2024.02.01',
      nextSan: 'd4',
      nextUci: 'd2d4',
      avgElo: 2778,
    },
  ],
};

export async function mockFetchPosition(
  fen: string,
): Promise<PositionApiDto | null> {
  void fen;
  return mockPosition;
}

export async function mockFetchPositionGames(
  params: FetchPositionGamesParams,
): Promise<PositionGamesApiDto> {
  const filtered = params.uci
    ? mockGames.games.filter((g) => g.nextUci === params.uci)
    : mockGames.games;

  return {
    ...mockGames,
    fen: params.fen,
    minElo: params.minElo,
    maxElo: params.maxElo,
    uci: params.uci,
    topOnly: params.topOnly,
    games: params.topOnly
      ? filtered.filter((g) => g.avgElo >= 2500)
      : filtered,
  };
}
