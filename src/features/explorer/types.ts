/** Align with endchess-backend GET /positions */
export type PositionMoveApiDto = {
  san: string;
  uci: string;
  games: number;
  whiteWins: number;
  draws: number;
  blackWins: number;
  avgElo: number | null;
};

export type PositionApiDto = {
  positionKey: string;
  fen: string;
  totalGames: number;
  moves: PositionMoveApiDto[];
};

/** Align with endchess-backend GET /positions/games */
export type PositionGameRowApiDto = {
  gameId: string;
  url: string;
  white: string;
  black: string;
  whiteElo: number;
  blackElo: number;
  result: string;
  date?: string;
  event?: string;
  timeControl?: string;
  timeClass?: string;
  nextSan: string;
  nextUci: string;
  avgElo: number;
};

export type PositionGamesApiDto = {
  positionKey: string;
  fen: string;
  minElo: number;
  maxElo: number;
  uci?: string;
  topOnly: boolean;
  games: PositionGameRowApiDto[];
};

export type FetchPositionGamesParams = {
  fen: string;
  minElo: number;
  maxElo: number;
  uci?: string;
  topOnly: boolean;
  limit?: number;
};

/** Align with endchess-backend GET /positions/variations */
export type PositionVariationLineApiDto = {
  key: string;
  label: string;
  moves: PositionMoveApiDto[];
  uciPath: string[];
  games: number;
  scorePercent: number | null;
  lastPlayedYear: number | null;
  avgElo: number | null;
};

export type PositionVariationsApiDto = {
  positionKey: string;
  fen: string;
  mode: "variations" | "popularity";
  depth: number;
  lineCount: number;
  minElo: number;
  maxElo: number;
  lines: PositionVariationLineApiDto[];
};

export type FetchPositionVariationsParams = {
  fen: string;
  mode: "variations" | "popularity";
  minElo: number;
  maxElo: number;
  depth?: number;
  lineCount?: number;
};

/** Align with endchess-backend GET /positions/games/:gameId */
export type ExplorerGameReplayApiDto = {
  gameId: string;
  url: string;
  white: string;
  black: string;
  whiteElo: number;
  blackElo: number;
  result: string;
  date?: string;
  event?: string;
  timeControl?: string;
  timeClass?: string;
  movesUci: string[];
  movesSan: string[];
};
