import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExplorerGameReplayApiDto } from "../types";
import { lastMoveUciAtPly } from "react-chess-core";
import { fenAtPly, findPlyIndexForFen, uciFromDrop } from "../gameReplayUtils";

export type GameReplayFeedback = "correct" | "incorrect" | null;

export type UseGameReplayTrainingOptions = {
  gameId: string;
  /** Board FEN when the user picked this game (explorer position). */
  startFen: string;
  fetchGame: (gameId: string) => Promise<ExplorerGameReplayApiDto | null>;
};

export function useGameReplayTraining({
  gameId,
  startFen,
  fetchGame,
}: UseGameReplayTrainingOptions) {
  const [game, setGame] = useState<ExplorerGameReplayApiDto | null>(null);
  const [plyIndex, setPlyIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<GameReplayFeedback>(null);
  const [lastExpectedSan, setLastExpectedSan] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFeedback(null);
    setLastExpectedSan(null);

    (async () => {
      try {
        const loaded = await fetchGame(gameId);
        if (cancelled) return;
        if (!loaded?.movesUci.length) {
          setGame(null);
          setError("This game has no move list for replay yet");
          return;
        }
        setGame(loaded);
        setPlyIndex(findPlyIndexForFen(loaded.movesUci, startFen));
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load game for replay",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [gameId, startFen, fetchGame]);

  const fen = useMemo(() => {
    if (!game) return startFen;
    return fenAtPly(game.movesUci, plyIndex);
  }, [game, plyIndex, startFen]);

  const complete = game ? plyIndex >= game.movesUci.length : false;
  const expectedUci = game?.movesUci[plyIndex];
  const expectedSan = game?.movesSan[plyIndex];
  const lastMoveUci = useMemo(
    () => (game ? lastMoveUciAtPly(game.movesUci, plyIndex) : null),
    [game, plyIndex],
  );

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string): boolean => {
      if (!game || complete || !expectedUci) return false;

      const uci = uciFromDrop(fen, sourceSquare, targetSquare, piece);
      if (!uci) return false;

      if (uci === expectedUci) {
        setFeedback("correct");
        setPlyIndex((p) => p + 1);
        setLastExpectedSan(null);
        return true;
      }

      setFeedback("incorrect");
      setLastExpectedSan(expectedSan ?? null);
      return false;
    },
    [game, complete, expectedUci, expectedSan, fen],
  );

  const revealMove = useCallback(() => {
    if (!game || complete || !expectedSan) return;
    setFeedback("incorrect");
    setLastExpectedSan(expectedSan);
    setPlyIndex((p) => p + 1);
  }, [game, complete, expectedSan]);

  return {
    game,
    fen,
    plyIndex,
    totalPlies: game?.movesUci.length ?? 0,
    complete,
    loading,
    error,
    feedback,
    lastExpectedSan,
    lastMoveUci,
    expectedSan,
    handlePieceDrop,
    revealMove,
  };
}
