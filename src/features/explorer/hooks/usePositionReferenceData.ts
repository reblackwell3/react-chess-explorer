import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXPLORER_START_FEN, VARIATION_LINE_STEP_MS } from "../constants";
import {
  applyBoardMove,
  applyLineSans,
  fenAfterUci,
  formatNumberedLineSans,
  normalizeFen,
} from "../positionUtils";
import {
  ALL_GAME_SOURCES,
  type FetchPositionGamesParams,
  type FetchPositionParams,
  type FetchPositionVariationsParams,
  type GameSource,
  type PositionApiDto,
  type PositionGamesApiDto,
  type PositionMoveApiDto,
  type PositionVariationsApiDto,
} from "../types";
import type { PositionVariationLineApiDto } from "../types";
import {
  gamesSessionKey,
  peekSessionGames,
  setSessionGames,
  subscribeExplorerSessionCache,
} from "../explorerSessionCache";
import { useExplorerPrefetch } from "./useExplorerPrefetch";
import {
  initialHistoryState,
  usePositionHistory,
} from "./usePositionHistory";

export type UsePositionReferenceDataOptions = {
  fenProp?: string;
  onFenChange?: (fen: string) => void;
  initialLineSans?: string[];
  onLineSansChange?: (lineSans: string[]) => void;
  fetchPosition: (params: FetchPositionParams) => Promise<PositionApiDto | null>;
  fetchPositionGames: (
    params: FetchPositionGamesParams,
  ) => Promise<PositionGamesApiDto>;
  fetchPositionVariations?: (
    params: FetchPositionVariationsParams,
  ) => Promise<PositionVariationsApiDto | null>;
  gamesLimit?: number;
  variationLineCount?: number;
};

export function usePositionReferenceData({
  fenProp,
  onFenChange,
  initialLineSans,
  onLineSansChange,
  fetchPosition,
  fetchPositionGames,
  fetchPositionVariations,
  gamesLimit,
  variationLineCount,
}: UsePositionReferenceDataOptions) {
  const initialFen = fenProp ?? EXPLORER_START_FEN;
  const bootstrappedRef = useRef(
    initialHistoryState(initialFen, initialLineSans),
  );
  const bootstrappedFen =
    bootstrappedRef.current.history[bootstrappedRef.current.historyIndex]
      ?.fen ?? initialFen;
  const initialGamesKey = gamesSessionKey({ fen: bootstrappedFen });
  const initialCachedGames = peekSessionGames(initialGamesKey);
  const [fen, setFen] = useState(bootstrappedFen);
  /** Board display FEN; may lead {@link queryFen} while a variation line is animating. */
  const [boardFen, setBoardFen] = useState(bootstrappedFen);
  const [position, setPosition] = useState<PositionApiDto | null>(null);
  const [games, setGames] = useState<PositionGamesApiDto | null>(
    () => initialCachedGames ?? null,
  );
  /** Filter games to those that played this UCI from the current FEN (optional). */
  const [gamesMoveFilterUci, setGamesMoveFilterUci] = useState<
    string | undefined
  >();
  const [sources, setSources] = useState<GameSource[]>([...ALL_GAME_SOURCES]);
  const [loading, setLoading] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(
    () => initialCachedGames === undefined,
  );
  /** FEN that {@link position} was loaded for (may lag {@link fen} while fetching). */
  const [loadedPositionFen, setLoadedPositionFen] = useState<string | null>(
    null,
  );
  const [loadedPositionFilterKey, setLoadedPositionFilterKey] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariationKey, setSelectedVariationKey] = useState<
    string | undefined
  >();

  const variationAnimationTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const isAnimatingVariationRef = useRef(false);
  const readyForLineSyncRef = useRef(
    bootstrappedRef.current.historyIndex > 0 ||
      (initialLineSans?.length ?? 0) === 0,
  );

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
    currentFen,
    pushEntry,
    pushEntries,
    replaceLineEntries,
    goBack,
    goForward,
    goFirst,
    goLast,
    resetHistory,
  } = usePositionHistory(initialFen, initialLineSans);

  /** FEN used for explorer API queries — follows move history, not animation frames. */
  const queryFen = currentFen;

  const initialLineKey = useMemo(
    () => initialLineSans?.join("|") ?? "",
    [initialLineSans],
  );

  const expectedLineFen = useMemo(() => {
    if (!initialLineSans?.length) {
      return EXPLORER_START_FEN;
    }
    return (
      applyLineSans(EXPLORER_START_FEN, initialLineSans)?.fen ??
      EXPLORER_START_FEN
    );
  }, [initialLineKey, initialLineSans]);

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

  const queryFenRef = useRef(queryFen);
  queryFenRef.current = queryFen;
  const positionsByFenRef = useRef(new Map<string, PositionApiDto>());
  const positionCacheKey = useCallback(
    (fenValue: string) =>
      JSON.stringify({
        fen: fenValue,
        sources:
          sources.length < ALL_GAME_SOURCES.length
            ? sources.slice().sort().join(",")
            : "",
      }),
    [sources],
  );
  const gamesCacheKey = useCallback(
    (fenValue: string, uci?: string) =>
      gamesSessionKey({
        fen: fenValue,
        uci,
        sources:
          sources.length < ALL_GAME_SOURCES.length ? sources : undefined,
        ...(gamesLimit != null ? { limit: gamesLimit } : {}),
      }),
    [sources, gamesLimit],
  );

  const lastAppliedLineKeyRef = useRef(initialLineKey);

  useEffect(() => () => cancelVariationAnimation(), [cancelVariationAnimation]);

  // Apply URL line changes only when the external line key changes — not when the
  // user clicks moves (internal lineSans updates must not re-sync from stale props).
  useEffect(() => {
    if (initialLineSans === undefined && onLineSansChange === undefined) return;

    const fenMatches =
      normalizeFen(queryFen) === normalizeFen(expectedLineFen);

    if (lastAppliedLineKeyRef.current === initialLineKey) {
      if (fenMatches) return;
    } else {
      const currentLineKey = lineSans.join("|");
      if (currentLineKey === initialLineKey && fenMatches) {
        lastAppliedLineKeyRef.current = initialLineKey;
        return;
      }
    }

    lastAppliedLineKeyRef.current = initialLineKey;
    cancelVariationAnimation();
    setSelectedVariationKey(undefined);

    if (initialLineSans?.length) {
      const result = applyLineSans(EXPLORER_START_FEN, initialLineSans);
      if (result) {
        replaceLineEntries(EXPLORER_START_FEN, result.entries);
        applyNavigation(result.fen, true);
        return;
      }
    }

    replaceLineEntries(EXPLORER_START_FEN, []);
    applyNavigation(EXPLORER_START_FEN, true);
    // lineSans / queryFen intentionally omitted — only re-sync when the URL line key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialLineKey,
    initialLineSans,
    expectedLineFen,
    cancelVariationAnimation,
    replaceLineEntries,
    applyNavigation,
  ]);

  // Keep legacy fen state aligned with move history when they drift apart.
  useEffect(() => {
    if (isAnimatingVariationRef.current) return;
    if (normalizeFen(fen) === normalizeFen(queryFen)) return;
    setFen(queryFen);
    setBoardFen(queryFen);
    onFenChange?.(queryFen);
  }, [fen, queryFen, onFenChange]);

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
    if (!onLineSansChange) return;
    if (!readyForLineSyncRef.current) return;
    onLineSansChange(lineSans);
  }, [lineSans, onLineSansChange]);

  useEffect(() => {
    if (fenProp === undefined) return;
    if (fenProp === queryFenRef.current) return;
    cancelVariationAnimation();
    resetHistory(fenProp);
    applyNavigation(fenProp, true);
  }, [fenProp, cancelVariationAnimation, resetHistory, applyNavigation]);

  useEffect(() => {
    let cancelled = false;
    const requestedFen = queryFen;
    const requestedFilterKey = positionCacheKey(requestedFen);
    if (positionsByFenRef.current.has(requestedFilterKey)) {
      setPosition(positionsByFenRef.current.get(requestedFilterKey)!);
      setLoadedPositionFen(requestedFen);
      setLoadedPositionFilterKey(requestedFilterKey);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      setError(null);
    }

    (async () => {
      try {
        const pos = await fetchPosition({
          fen: requestedFen,
          sources:
            sources.length < ALL_GAME_SOURCES.length ? sources : undefined,
        });
        if (cancelled || requestedFen !== queryFenRef.current) return;
        if (pos) {
          positionsByFenRef.current.set(
            positionCacheKey(requestedFen),
            pos,
          );
        }
        setPosition(pos);
        setLoadedPositionFen(requestedFen);
        setLoadedPositionFilterKey(positionCacheKey(requestedFen));
      } catch (e) {
        if (cancelled || requestedFen !== queryFenRef.current) return;
        setPosition(null);
        setLoadedPositionFen(null);
        setLoadedPositionFilterKey(null);
        setError(
          e instanceof Error ? e.message : "Failed to load explorer data",
        );
      } finally {
        if (!cancelled && requestedFen === queryFenRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryFen, sources, fetchPosition, positionCacheKey]);

  const activePositionFilterKey = positionCacheKey(queryFen);
  const cachedPosition = positionsByFenRef.current.get(activePositionFilterKey);
  const positionReady =
    loadedPositionFen === queryFen &&
    loadedPositionFilterKey === activePositionFilterKey;
  const displayPosition =
    cachedPosition ?? (positionReady ? position : null);
  const displayMoves = Array.isArray(displayPosition?.moves)
    ? displayPosition.moves
    : [];
  const showPositionLoading = loading && displayMoves.length === 0;
  const isStartPosition =
    normalizeFen(queryFen) === normalizeFen(EXPLORER_START_FEN);

  useExplorerPrefetch({
    fen: queryFen,
    moves: displayMoves,
    positionReady,
    sources,
    fetchPositionGames,
    fetchPositionVariations,
    gamesLimit,
    variationLineCount,
  });

  useEffect(() => {
    return subscribeExplorerSessionCache(() => {
      const key = gamesCacheKey(queryFen, gamesMoveFilterUci);
      const cached = peekSessionGames(key);
      if (!cached) {
        return;
      }
      setGames(cached);
      setGamesLoading(false);
    });
  }, [queryFen, gamesMoveFilterUci, gamesCacheKey]);

  useEffect(() => {
    const canLoadGames =
      positionReady || (isStartPosition && !gamesMoveFilterUci);
    if (!canLoadGames) return;

    let cancelled = false;
    const requestedKey = gamesCacheKey(queryFen, gamesMoveFilterUci);
    const cachedGames = peekSessionGames(requestedKey);
    if (cachedGames) {
      setGames(cachedGames);
      setGamesLoading(false);
    } else {
      setGamesLoading(true);
    }

    void (async () => {
      try {
        const gameList = await fetchPositionGames({
          fen: queryFen,
          uci: gamesMoveFilterUci,
          sources:
            sources.length < ALL_GAME_SOURCES.length ? sources : undefined,
          ...(gamesLimit != null ? { limit: gamesLimit } : {}),
        });
        if (cancelled) return;
        setSessionGames(requestedKey, gameList);
        setGames(gameList);
      } catch {
        if (!cancelled) {
          setGames(null);
        }
      } finally {
        if (!cancelled) setGamesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    queryFen,
    positionReady,
    isStartPosition,
    gamesMoveFilterUci,
    sources,
    fetchPositionGames,
    gamesCacheKey,
    gamesLimit,
  ]);

  const handleMoveSelect = useCallback(
    (move: PositionMoveApiDto) => {
      if (isAnimatingVariationRef.current) {
        cancelVariationAnimation();
        setBoardFen(queryFen);
        setSelectedVariationKey(undefined);
      }
      const nextFen = fenAfterUci(queryFen, move.uci);
      if (!nextFen) return;
      pushEntry(nextFen, move.san);
      setSelectedVariationKey(undefined);
      applyNavigation(nextFen, true);
    },
    [queryFen, pushEntry, applyNavigation, cancelVariationAnimation],
  );

  const handleLineSelect = useCallback(
    (line: PositionVariationLineApiDto) => {
      if (isAnimatingVariationRef.current) return;

      cancelVariationAnimation();

      let lineFen = queryFen;
      const entries: { fen: string; lastSan: string }[] = [];

      for (let i = 0; i < line.uciPath.length; i += 1) {
        const nextFen = fenAfterUci(lineFen, line.uciPath[i]);
        if (!nextFen) return;
        entries.push({ fen: nextFen, lastSan: line.moves[i].san });
        lineFen = nextFen;
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
    [queryFen, pushEntries, applyNavigation, cancelVariationAnimation],
  );

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string): boolean => {
      if (isAnimatingVariationRef.current) {
        cancelVariationAnimation();
        setBoardFen(queryFen);
        setSelectedVariationKey(undefined);
      }
      const result = applyBoardMove(queryFen, sourceSquare, targetSquare, piece);
      if (!result) return false;
      pushEntry(result.fen, result.san);
      setSelectedVariationKey(undefined);
      applyNavigation(result.fen, true);
      return true;
    },
    [queryFen, pushEntry, applyNavigation, cancelVariationAnimation],
  );

  const handleBack = useCallback(() => {
    if (isAnimatingVariationRef.current) {
      cancelVariationAnimation();
      setBoardFen(queryFen);
      setSelectedVariationKey(undefined);
      return;
    }
    const entry = goBack();
    if (entry) applyNavigation(entry.fen, true);
  }, [queryFen, goBack, applyNavigation, cancelVariationAnimation]);

  const handleForward = useCallback(() => {
    if (isAnimatingVariationRef.current) {
      cancelVariationAnimation();
      setBoardFen(queryFen);
      setSelectedVariationKey(undefined);
      return;
    }
    const entry = goForward();
    if (entry) applyNavigation(entry.fen, true);
  }, [queryFen, goForward, applyNavigation, cancelVariationAnimation]);

  const handleFirst = useCallback(() => {
    if (isAnimatingVariationRef.current) {
      cancelVariationAnimation();
      setBoardFen(queryFen);
      setSelectedVariationKey(undefined);
      return;
    }
    const entry = goFirst();
    if (entry) applyNavigation(entry.fen, true);
  }, [queryFen, goFirst, applyNavigation, cancelVariationAnimation]);

  const handleLast = useCallback(() => {
    if (isAnimatingVariationRef.current) {
      cancelVariationAnimation();
      setBoardFen(queryFen);
      setSelectedVariationKey(undefined);
      return;
    }
    const entry = goLast();
    if (entry) applyNavigation(entry.fen, true);
  }, [queryFen, goLast, applyNavigation, cancelVariationAnimation]);

  const lineLabel = useMemo(() => {
    if (lineSans.length > 0) {
      return formatNumberedLineSans(lineSans);
    }
    if (position && typeof position.totalGames === "number") {
      return `Starting position (${position.totalGames.toLocaleString()} games)`;
    }
    return "";
  }, [lineSans, position]);

  return {
    fen: queryFen,
    boardFen,
    position,
    games,
    gamesMoveFilterUci,
    sources,
    lineSans,
    loading,
    showPositionLoading,
    gamesLoading,
    positionReady,
    displayMoves,
    error,
    lineLabel,
    canGoBack,
    canGoForward,
    forwardSans,
    selectedVariationKey,
    setSources,
    setGamesMoveFilterUci,
    handleMoveSelect,
    handleLineSelect,
    handlePieceDrop,
    handleBack,
    handleForward,
    handleFirst,
    handleLast,
  };
}
