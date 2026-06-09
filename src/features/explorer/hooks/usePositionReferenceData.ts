import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXPLORER_START_FEN, VARIATION_LINE_STEP_MS } from "../constants";
import { applyBoardMove, applyLineSans, fenAfterUci } from "../positionUtils";
import {
  ALL_GAME_SOURCES,
  type FetchPositionGamesParams,
  type GameSource,
  type PositionApiDto,
  type PositionGamesApiDto,
  type PositionMoveApiDto,
} from "../types";
import type { PositionVariationLineApiDto } from "../types";
import type { VariationsTab } from "../variationLines";
import { usePositionHistory } from "./usePositionHistory";

export type UsePositionReferenceDataOptions = {
  fenProp?: string;
  onFenChange?: (fen: string) => void;
  initialLineSans?: string[];
  onLineSansChange?: (lineSans: string[]) => void;
  fetchPosition: (fen: string) => Promise<PositionApiDto | null>;
  fetchPositionGames: (
    params: FetchPositionGamesParams,
  ) => Promise<PositionGamesApiDto>;
  defaultMinElo: number;
  defaultMaxElo: number;
};

export function usePositionReferenceData({
  fenProp,
  onFenChange,
  initialLineSans,
  onLineSansChange,
  fetchPosition,
  fetchPositionGames,
  defaultMinElo,
  defaultMaxElo,
}: UsePositionReferenceDataOptions) {
  const initialFen = fenProp ?? EXPLORER_START_FEN;
  const [fen, setFen] = useState(initialFen);
  /** Board display FEN; may lead {@link fen} while a variation line is animating. */
  const [boardFen, setBoardFen] = useState(initialFen);
  const [position, setPosition] = useState<PositionApiDto | null>(null);
  const [games, setGames] = useState<PositionGamesApiDto | null>(null);
  /** Filter games to those that played this UCI from the current FEN (optional). */
  const [gamesMoveFilterUci, setGamesMoveFilterUci] = useState<
    string | undefined
  >();
  const [minElo, setMinElo] = useState(defaultMinElo);
  const [maxElo, setMaxElo] = useState(defaultMaxElo);
  const [topOnly, setTopOnly] = useState(false);
  const [sources, setSources] = useState<GameSource[]>([...ALL_GAME_SOURCES]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variationsTab, setVariationsTab] =
    useState<VariationsTab>("variations");
  const [selectedVariationKey, setSelectedVariationKey] = useState<
    string | undefined
  >();

  const variationAnimationTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const isAnimatingVariationRef = useRef(false);
  const readyForLineSyncRef = useRef(false);

  const cancelVariationAnimation = useCallback(() => {
    if (variationAnimationTimerRef.current !== null) {
      clearTimeout(variationAnimationTimerRef.current);
      variationAnimationTimerRef.current = null;
    }
    isAnimatingVariationRef.current = false;
  }, []);

  const {
    canGoBack,
    canGoForward,
    lineSans,
    forwardSans,
    pushEntry,
    pushEntries,
    goBack,
    goForward,
    resetHistory,
  } = usePositionHistory(initialFen);

  const applyNavigation = useCallback(
    (nextFen: string, clearMoveFilter = true) => {
      setFen(nextFen);
      setBoardFen(nextFen);
      if (clearMoveFilter) {
        setGamesMoveFilterUci(undefined);
      }
      onFenChange?.(nextFen);
    },
    [onFenChange],
  );

  const initialLineKey = useMemo(
    () => initialLineSans?.join("|") ?? "",
    [initialLineSans],
  );
  const lastAppliedLineKeyRef = useRef<string | undefined>(undefined);

  useEffect(() => () => cancelVariationAnimation(), [cancelVariationAnimation]);

  useEffect(() => {
    if (lastAppliedLineKeyRef.current === initialLineKey) return;

    const currentLineKey = lineSans.join("|");
    if (currentLineKey === initialLineKey) {
      lastAppliedLineKeyRef.current = initialLineKey;
      return;
    }

    lastAppliedLineKeyRef.current = initialLineKey;
    cancelVariationAnimation();
    resetHistory(EXPLORER_START_FEN);
    setSelectedVariationKey(undefined);

    if (initialLineSans?.length) {
      const result = applyLineSans(EXPLORER_START_FEN, initialLineSans);
      if (result) {
        pushEntries(result.entries);
        applyNavigation(result.fen, true);
        return;
      }
    }

    applyNavigation(EXPLORER_START_FEN, true);
  }, [
    initialLineKey,
    initialLineSans,
    lineSans,
    cancelVariationAnimation,
    resetHistory,
    pushEntries,
    applyNavigation,
  ]);

  useEffect(() => {
    if (readyForLineSyncRef.current) return;
    const expected = initialLineSans ?? [];
    const matchesInitialLine =
      lineSans.length === expected.length &&
      lineSans.every((san, index) => san === expected[index]);
    if (matchesInitialLine) {
      readyForLineSyncRef.current = true;
    }
  }, [lineSans, initialLineSans]);

  useEffect(() => {
    if (!readyForLineSyncRef.current) return;
    onLineSansChange?.(lineSans);
  }, [lineSans, onLineSansChange]);

  useEffect(() => {
    if (fenProp === undefined || fenProp === fen) return;
    cancelVariationAnimation();
    resetHistory(fenProp);
    applyNavigation(fenProp, true);
  }, [fenProp, fen, resetHistory, applyNavigation, cancelVariationAnimation]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [pos, gameList] = await Promise.all([
          fetchPosition(fen),
          fetchPositionGames({
            fen,
            minElo,
            maxElo,
            uci: gamesMoveFilterUci,
            topOnly,
            sources:
              sources.length < ALL_GAME_SOURCES.length ? sources : undefined,
          }),
        ]);
        if (cancelled) return;
        setPosition(pos);
        setGames(gameList);
        if (!pos) {
          setError("No explorer data for this position yet");
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load explorer data",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    fen,
    minElo,
    maxElo,
    gamesMoveFilterUci,
    topOnly,
    sources,
    fetchPosition,
    fetchPositionGames,
  ]);

  const handleMoveSelect = useCallback(
    (move: PositionMoveApiDto) => {
      if (isAnimatingVariationRef.current) {
        cancelVariationAnimation();
        setBoardFen(fen);
        setSelectedVariationKey(undefined);
      }
      const nextFen = fenAfterUci(fen, move.uci);
      if (!nextFen) return;
      pushEntry(nextFen, move.san);
      setSelectedVariationKey(undefined);
      applyNavigation(nextFen, true);
    },
    [fen, pushEntry, applyNavigation, cancelVariationAnimation],
  );

  const handleLineSelect = useCallback(
    (line: PositionVariationLineApiDto) => {
      if (isAnimatingVariationRef.current) return;

      cancelVariationAnimation();

      let currentFen = fen;
      const entries: { fen: string; lastSan: string }[] = [];

      for (let i = 0; i < line.uciPath.length; i += 1) {
        const nextFen = fenAfterUci(currentFen, line.uciPath[i]);
        if (!nextFen) return;
        entries.push({ fen: nextFen, lastSan: line.moves[i].san });
        currentFen = nextFen;
      }

      if (entries.length === 0) return;

      setSelectedVariationKey(line.key);

      const commitLine = () => {
        isAnimatingVariationRef.current = false;
        variationAnimationTimerRef.current = null;
        pushEntries(entries);
        applyNavigation(entries[entries.length - 1].fen, true);
      };

      isAnimatingVariationRef.current = true;

      let step = 0;
      const tick = () => {
        setBoardFen(entries[step].fen);
        step += 1;
        if (step >= entries.length) {
          commitLine();
        } else {
          variationAnimationTimerRef.current = setTimeout(
            tick,
            VARIATION_LINE_STEP_MS,
          );
        }
      };

      tick();
    },
    [fen, pushEntries, applyNavigation, cancelVariationAnimation],
  );

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string): boolean => {
      if (isAnimatingVariationRef.current) {
        cancelVariationAnimation();
        setBoardFen(fen);
        setSelectedVariationKey(undefined);
      }
      const result = applyBoardMove(fen, sourceSquare, targetSquare, piece);
      if (!result) return false;
      pushEntry(result.fen, result.san);
      setSelectedVariationKey(undefined);
      applyNavigation(result.fen, true);
      return true;
    },
    [fen, pushEntry, applyNavigation, cancelVariationAnimation],
  );

  const handleBack = useCallback(() => {
    if (isAnimatingVariationRef.current) {
      cancelVariationAnimation();
      setBoardFen(fen);
      setSelectedVariationKey(undefined);
      return;
    }
    const entry = goBack();
    if (entry) applyNavigation(entry.fen, true);
  }, [fen, goBack, applyNavigation, cancelVariationAnimation]);

  const handleForward = useCallback(() => {
    if (isAnimatingVariationRef.current) {
      cancelVariationAnimation();
      setBoardFen(fen);
      setSelectedVariationKey(undefined);
      return;
    }
    const entry = goForward();
    if (entry) applyNavigation(entry.fen, true);
  }, [fen, goForward, applyNavigation, cancelVariationAnimation]);

  const lineLabel = useMemo(() => {
    if (lineSans.length > 0) {
      return lineSans.join(" ");
    }
    if (position) {
      return `Starting position (${position.totalGames.toLocaleString()} games)`;
    }
    return "";
  }, [lineSans, position]);

  return {
    fen,
    boardFen,
    position,
    games,
    gamesMoveFilterUci,
    minElo,
    maxElo,
    topOnly,
    sources,
    loading,
    error,
    lineLabel,
    canGoBack,
    canGoForward,
    variationsTab,
    forwardSans,
    selectedVariationKey,
    setMinElo,
    setMaxElo,
    setTopOnly,
    setSources,
    setVariationsTab,
    setGamesMoveFilterUci,
    handleMoveSelect,
    handleLineSelect,
    handlePieceDrop,
    handleBack,
    handleForward,
  };
}
