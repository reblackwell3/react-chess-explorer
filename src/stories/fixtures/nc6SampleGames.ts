import { Chess } from "chess.js";
import { EXPLORER_START_FEN } from "../../features/explorer/constants";
import {
  applyLineSans,
  normalizeFen,
  whiteScorePercent,
} from "../../features/explorer/positionUtils";
import type {
  ExplorerGameReplayApiDto,
  PositionApiDto,
  PositionGameRowApiDto,
  PositionMoveApiDto,
} from "../../features/explorer/types";

export const NC6_OPENING_SANS = ["e4", "e5", "Nf3", "Nc6"] as const;
export const NC6_GAME_COUNT = 100;
export const NC6_GAME_ID_PREFIX = "nc6-sb-";

const SAMPLE_NAMES = [
  ["Sample White A", "Sample Black A"],
  ["Sample White B", "Sample Black B"],
  ["Demo Player W", "Demo Player B"],
  ["Storybook Test W", "Storybook Test B"],
  ["Explorer Sample W", "Explorer Sample B"],
];

const SAMPLE_TIME_CONTROLS = [
  { timeControl: "60+0", timeClass: "bullet" },
  { timeControl: "180+0", timeClass: "blitz" },
  { timeControl: "300+0", timeClass: "blitz" },
  { timeControl: "600+0", timeClass: "rapid" },
  { timeControl: "900+10", timeClass: "rapid" },
  { timeControl: "1800+0", timeClass: "classical" },
];

const RESULTS = ["1-0", "0-1", "1/2-1/2"] as const;

/** White third moves from the Open Game tabiya (after …Nc6). */
const WHITE_THIRD_MOVES = [
  { san: "Bb5", blacks: ["a6", "Nf6", "Bc5", "d6"] },
  { san: "Bc4", blacks: ["Nf6", "Bc5", "Be7", "h6"] },
  { san: "d4", blacks: ["exd4", "Nf6", "Bb4+", "d6"] },
  { san: "Nc3", blacks: ["Nf6", "Bc5", "Bb4", "f5"] },
];

type MoveBucket = {
  san: string;
  uci: string;
  games: number;
  whiteWins: number;
  draws: number;
  blackWins: number;
  eloSum: number;
};

type PositionBucket = {
  fen: string;
  totalGames: number;
  moves: Map<string, MoveBucket>;
  gameRows: PositionGameRowApiDto[];
};

type BuiltGame = ExplorerGameReplayApiDto & {
  avgElo: number;
  occurrences: Map<string, { nextSan: string; nextUci: string }>;
};

function outcomeForResult(result: string): {
  whiteWin: number;
  draw: number;
  blackWin: number;
} {
  if (result === "1-0") return { whiteWin: 1, draw: 0, blackWin: 0 };
  if (result === "0-1") return { whiteWin: 0, draw: 0, blackWin: 1 };
  return { whiteWin: 0, draw: 1, blackWin: 0 };
}

function buildGame(index: number): BuiltGame {
  const gameId = `${NC6_GAME_ID_PREFIX}${String(index + 1).padStart(3, "0")}`;
  const whiteElo = 1800 + ((index * 7) % 800);
  const blackElo = 1800 + ((index * 13) % 800);
  const avgElo = Math.round((whiteElo + blackElo) / 2);
  const result = RESULTS[index % RESULTS.length];
  const [white, black] = SAMPLE_NAMES[index % SAMPLE_NAMES.length];
  const { timeControl, timeClass } =
    SAMPLE_TIME_CONTROLS[index % SAMPLE_TIME_CONTROLS.length];

  const third = WHITE_THIRD_MOVES[index % WHITE_THIRD_MOVES.length];
  const fourth =
    third.blacks[
      (index + Math.floor(index / WHITE_THIRD_MOVES.length)) %
        third.blacks.length
    ];

  const lineSans = [...NC6_OPENING_SANS, third.san];
  const chess = new Chess();
  for (const san of lineSans) {
    chess.move(san);
  }
  try {
    chess.move(fourth);
    lineSans.push(fourth);
  } catch {
    // Keep the shorter line if the sampled fourth move is illegal.
  }

  const fullHistory = chess.history({ verbose: true });
  const movesUci: string[] = [];
  const movesSan: string[] = [];
  const occurrences = new Map<string, { nextSan: string; nextUci: string }>();

  chess.reset();
  for (const move of fullHistory) {
    const fenBefore = normalizeFen(chess.fen());
    const uci = `${move.from}${move.to}${move.promotion ?? ""}`;
    movesUci.push(uci);
    movesSan.push(move.san);
    occurrences.set(fenBefore, { nextSan: move.san, nextUci: uci });
    chess.move(move);
  }

  return {
    gameId,
    url: `https://lichess.org/${gameId}`,
    white,
    black,
    whiteElo,
    blackElo,
    result,
    date: `2024.${String((index % 12) + 1).padStart(2, "0")}.${String((index % 28) + 1).padStart(2, "0")}`,
    event: "Storybook Nc6 Sample",
    timeControl,
    timeClass,
    movesUci,
    movesSan,
    avgElo,
    occurrences,
  };
}

function buildPositionBuckets(games: BuiltGame[]): Map<string, PositionBucket> {
  const buckets = new Map<string, PositionBucket>();

  for (const game of games) {
    const chess = new Chess();
    for (const san of game.movesSan) {
      const fenBefore = normalizeFen(chess.fen());
      const move = chess.move(san);
      if (!move) break;

      const uci = `${move.from}${move.to}${move.promotion ?? ""}`;
      const outcome = outcomeForResult(game.result);
      let bucket = buckets.get(fenBefore);
      if (!bucket) {
        bucket = {
          fen: fenBefore,
          totalGames: 0,
          moves: new Map(),
          gameRows: [],
        };
        buckets.set(fenBefore, bucket);
      }

      bucket.totalGames += 1;
      const existingMove = bucket.moves.get(uci);
      if (existingMove) {
        existingMove.games += 1;
        existingMove.whiteWins += outcome.whiteWin;
        existingMove.draws += outcome.draw;
        existingMove.blackWins += outcome.blackWin;
        existingMove.eloSum += game.avgElo;
      } else {
        bucket.moves.set(uci, {
          san: move.san,
          uci,
          games: 1,
          whiteWins: outcome.whiteWin,
          draws: outcome.draw,
          blackWins: outcome.blackWin,
          eloSum: game.avgElo,
        });
      }

      const occurrence = game.occurrences.get(fenBefore);
      if (occurrence) {
        bucket.gameRows.push({
          gameId: game.gameId,
          url: game.url,
          white: game.white,
          black: game.black,
          whiteElo: game.whiteElo,
          blackElo: game.blackElo,
          result: game.result,
          date: game.date,
          event: game.event,
          timeControl: game.timeControl,
          timeClass: game.timeClass,
          nextSan: occurrence.nextSan,
          nextUci: occurrence.nextUci,
          avgElo: game.avgElo,
        });
      }
    }
  }

  return buckets;
}

const nc6TabiyaResult = applyLineSans(EXPLORER_START_FEN, [
  ...NC6_OPENING_SANS,
]);
if (!nc6TabiyaResult) {
  throw new Error("Failed to build Nc6 tabiya from opening SANs");
}

export const NC6_TABIYA_FEN = normalizeFen(nc6TabiyaResult.fen);

export const nc6SampleGames: BuiltGame[] = Array.from(
  { length: NC6_GAME_COUNT },
  (_, index) => buildGame(index),
);

export const nc6PositionBuckets = buildPositionBuckets(nc6SampleGames);

export function nc6PositionForFen(fen: string): PositionApiDto | null {
  const bucket = nc6PositionBuckets.get(normalizeFen(fen));
  if (!bucket) return null;

  const moves: PositionMoveApiDto[] = [...bucket.moves.values()]
    .map((move) => ({
      san: move.san,
      uci: move.uci,
      games: move.games,
      whiteWins: move.whiteWins,
      draws: move.draws,
      blackWins: move.blackWins,
      avgElo: move.games > 0 ? Math.round(move.eloSum / move.games) : null,
    }))
    .sort((a, b) => b.games - a.games);

  return {
    positionKey: `storybook-${bucket.fen}`,
    fen: bucket.fen,
    totalGames: bucket.totalGames,
    moves,
  };
}

export function nc6GamesForPosition(
  fen: string,
  options: {
    minElo: number;
    maxElo: number;
    uci?: string;
    topOnly: boolean;
  },
): PositionGameRowApiDto[] {
  const bucket = nc6PositionBuckets.get(normalizeFen(fen));
  if (!bucket) return [];

  return bucket.gameRows.filter((game) => {
    if (game.avgElo < options.minElo || game.avgElo > options.maxElo) {
      return false;
    }
    if (options.uci && game.nextUci !== options.uci) {
      return false;
    }
    if (options.topOnly && game.avgElo < 2500) {
      return false;
    }
    return true;
  });
}

export function nc6ScorePercentForMove(
  move: PositionMoveApiDto,
): number | null {
  return whiteScorePercent(move.whiteWins, move.draws, move.blackWins);
}
