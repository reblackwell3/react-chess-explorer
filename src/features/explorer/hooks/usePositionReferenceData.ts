import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXPLORER_START_FEN } from '../constants';
import { applyBoardMove, fenAfterUci } from '../positionUtils';
import type {
  FetchPositionGamesParams,
  PositionApiDto,
  PositionGamesApiDto,
  PositionMoveApiDto,
} from '../types';
import type { PositionVariationLineApiDto } from '../types';
import type { VariationsTab } from '../variationLines';
import { usePositionHistory } from './usePositionHistory';

export type UsePositionReferenceDataOptions = {
  fenProp?: string;
  onFenChange?: (fen: string) => void;
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
  fetchPosition,
  fetchPositionGames,
  defaultMinElo,
  defaultMaxElo,
}: UsePositionReferenceDataOptions) {
  const initialFen = fenProp ?? EXPLORER_START_FEN;
  const [fen, setFen] = useState(initialFen);
  const [position, setPosition] = useState<PositionApiDto | null>(null);
  const [games, setGames] = useState<PositionGamesApiDto | null>(null);
  /** Filter games to those that played this UCI from the current FEN (optional). */
  const [gamesMoveFilterUci, setGamesMoveFilterUci] = useState<
    string | undefined
  >();
  const [minElo, setMinElo] = useState(defaultMinElo);
  const [maxElo, setMaxElo] = useState(defaultMaxElo);
  const [topOnly, setTopOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [variationsTab, setVariationsTab] =
    useState<VariationsTab>('variations');
  const [selectedVariationKey, setSelectedVariationKey] = useState<
    string | undefined
  >();

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
      if (clearMoveFilter) {
        setGamesMoveFilterUci(undefined);
      }
      onFenChange?.(nextFen);
    },
    [onFenChange],
  );

  useEffect(() => {
    if (fenProp === undefined || fenProp === fen) return;
    resetHistory(fenProp);
    applyNavigation(fenProp, true);
  }, [fenProp, fen, resetHistory, applyNavigation]);

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
          }),
        ]);
        if (cancelled) return;
        setPosition(pos);
        setGames(gameList);
        if (!pos) {
          setError('No explorer data for this position yet');
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Failed to load explorer data',
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
    fetchPosition,
    fetchPositionGames,
  ]);

  const handleMoveSelect = useCallback(
    (move: PositionMoveApiDto) => {
      const nextFen = fenAfterUci(fen, move.uci);
      if (!nextFen) return;
      pushEntry(nextFen, move.san);
      setSelectedVariationKey(undefined);
      applyNavigation(nextFen, true);
    },
    [fen, pushEntry, applyNavigation],
  );

  const handleLineSelect = useCallback(
    (line: PositionVariationLineApiDto) => {
      let currentFen = fen;
      const entries: { fen: string; lastSan: string }[] = [];

      for (let i = 0; i < line.uciPath.length; i += 1) {
        const nextFen = fenAfterUci(currentFen, line.uciPath[i]);
        if (!nextFen) return;
        entries.push({ fen: nextFen, lastSan: line.moves[i].san });
        currentFen = nextFen;
      }

      if (entries.length === 0) return;

      pushEntries(entries);
      setSelectedVariationKey(line.key);
      applyNavigation(entries[entries.length - 1].fen, true);
    },
    [fen, pushEntries, applyNavigation],
  );

  const handlePieceDrop = useCallback(
    (
      sourceSquare: string,
      targetSquare: string,
      piece: string,
    ): boolean => {
      const result = applyBoardMove(fen, sourceSquare, targetSquare, piece);
      if (!result) return false;
      pushEntry(result.fen, result.san);
      setSelectedVariationKey(undefined);
      applyNavigation(result.fen, true);
      return true;
    },
    [fen, pushEntry, applyNavigation],
  );

  const handleBack = useCallback(() => {
    const entry = goBack();
    if (entry) applyNavigation(entry.fen, true);
  }, [goBack, applyNavigation]);

  const handleForward = useCallback(() => {
    const entry = goForward();
    if (entry) applyNavigation(entry.fen, true);
  }, [goForward, applyNavigation]);

  const lineLabel = useMemo(() => {
    if (lineSans.length > 0) {
      return lineSans.join(' ');
    }
    if (position) {
      return `Starting position (${position.totalGames.toLocaleString()} games)`;
    }
    return '';
  }, [lineSans, position]);

  return {
    fen,
    position,
    games,
    gamesMoveFilterUci,
    minElo,
    maxElo,
    topOnly,
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
    setVariationsTab,
    setGamesMoveFilterUci,
    handleMoveSelect,
    handleLineSelect,
    handlePieceDrop,
    handleBack,
    handleForward,
  };
};
